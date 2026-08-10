-- BLOG (/blog) — treści SEO przyciągające ruch organiczny.
--
-- Nazewnictwo POLSKIE, jak reszta schematu (`profil`, `dopasowanie`, `zakup`) —
-- nie `blog_posts`. Skille generujące treść (.claude/commands/blog-*.md) są
-- napisane pod te nazwy, więc nie ma dwóch konwencji do pogodzenia.
--
-- TRZY RZECZY, KTÓRE ODRÓŻNIAJĄ TĘ MIGRACJĘ OD TYPOWEGO SCHEMATU BLOGA:
--
-- 1. JAWNY GRANT DLA `anon`. Migracja `20260802160403_rls_polityki.sql` kończy
--    się `revoke all on all tables in schema public from anon` — bo do tej pory
--    landing nie czytał bazy. Sama polityka RLS „for select using (status =
--    'opublikowany')" NIC BY NIE DAŁA: brak grantu ucina dostęp zanim RLS w
--    ogóle zostanie sprawdzone. Blog byłby pusty dla niezalogowanych (czyli dla
--    całego ruchu z Google) i przy `generateStaticParams` w czasie builda.
--
-- 2. PODGLĄD DRAFTÓW PRZEZ SECURITY DEFINER, NIE PRZEZ `service_role`.
--    Typowy wzorzec czyta drafty klientem z kluczem serwisowym (omija RLS).
--    Tutaj robi to funkcja `wpis_po_tokenie()` — ten sam wzorzec co
--    `ma_dostep_do` i `zuzyj_dopasowanie`. `klient-admin.ts` zostaje tam, gdzie
--    był: wyłącznie w webhooku Stripe'a.
--
-- 3. `rola` W `profil`, A NIE OSOBNA TABELA UPRAWNIEŃ. Jest to bezpieczne
--    WYŁĄCZNIE dlatego, że `20260802160403` robi `revoke update on public.profil
--    from authenticated` + `grant update (zgoda_marketing)`. Grant jest
--    KOLUMNOWY, więc użytkownik nie ma jak podnieść sobie `rola` do 'admin'.
--    Gdyby ten grant kiedyś rozszerzyć na całą tabelę, ta kolumna natychmiast
--    stałaby się dziurą — stąd ten komentarz.

-- ------------------------------------------------------------------ rola ----

alter table public.profil
  add column rola text not null default 'uzytkownik'
    check (rola in ('uzytkownik', 'admin'));

comment on column public.profil.rola is
  'Rola aplikacyjna. Zapis możliwy TYLKO rolą service_role albo z panelu Supabase — authenticated ma grant UPDATE wyłącznie na zgoda_marketing.';

-- Odpowiednik `ma_aktywna_subskrypcje()` dla panelu redakcyjnego.
create or replace function public.czy_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profil p
    where p.id = (select auth.uid()) and p.rola = 'admin'
  );
$$;

revoke execute on function public.czy_admin() from public, anon;
grant execute on function public.czy_admin() to authenticated;

-- BOOTSTRAP: pierwsze konto administracyjne. Idempotentne i bezpieczne przy
-- pustej bazie (wtedy po prostu nie ma czego zaktualizować — patrz README).
update public.profil
   set rola = 'admin'
 where id in (
   select u.id from auth.users u
   where lower(u.email) in ('marko@aplikando.pl', 'marko.nowak43@gmail.com')
 );

-- ------------------------------------------------------------ wpis_bloga ----

create table public.wpis_bloga (
  id uuid primary key default gen_random_uuid(),
  tytul text not null,
  slug text not null unique,
  zajawka text,
  -- HTML. Sanityzacji nie ma i nie potrzeba: pisze tu wyłącznie administrator
  -- (RLS), a treść renderujemy jako zaufaną. Gdyby kiedykolwiek pojawił się
  -- drugi autor spoza zespołu, TO JEST miejsce, w którym trzeba dodać
  -- sanityzację przed zapisem.
  tresc text not null,
  okladka_url text,
  okladka_alt text,
  meta_tytul text,
  meta_opis text,
  canonical_url text,
  kategoria text not null default 'ogólne',
  tagi text[] not null default '{}',
  czas_czytania_min integer not null default 1,
  status text not null default 'szkic'
    check (status in ('szkic', 'opublikowany', 'zarchiwizowany')),
  opublikowano_o timestamptz,
  token_podgladu text unique,
  -- [{ "pytanie": "...", "odpowiedz": "..." }] — zasila FAQPage schema.org.
  faq jsonb not null default '[]'::jsonb,
  utworzono timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jedyne realne zapytanie listy: opublikowane, od najnowszych.
create index wpis_bloga_publiczne_idx
  on public.wpis_bloga (opublikowano_o desc)
  where status = 'opublikowany';
create index wpis_bloga_kategoria_idx on public.wpis_bloga (kategoria);

-- Trigger z `20260802160231` — NIE tworzymy drugiej funkcji `set_updated_at`.
create trigger wpis_bloga_updated_at
  before update on public.wpis_bloga
  for each row execute function public.ustaw_updated_at();

alter table public.wpis_bloga enable row level security;

-- Czytelnik bloga jest ANONIMOWY — to cały sens tej funkcji.
create policy "wpis_bloga: publiczny odczyt opublikowanych"
  on public.wpis_bloga for select to anon, authenticated
  using (status = 'opublikowany');

create policy "wpis_bloga: admin robi wszystko"
  on public.wpis_bloga for all to authenticated
  using ((select public.czy_admin()))
  with check ((select public.czy_admin()));

-- BEZ TEGO GRANTU BLOG NIE DZIAŁA (patrz nagłówek, punkt 1).
grant select on public.wpis_bloga to anon;
grant select, insert, update, delete on public.wpis_bloga to authenticated;

-- ------------------------------------------------------ podgląd draftów ----

-- Zwraca wpis NIEZALEŻNIE od statusu, po nieodgadywalnym tokenie. Dzięki temu
-- podgląd szkicu nie wymaga ani konta, ani klucza serwisowego w kodzie stron.
create or replace function public.wpis_po_tokenie(p_token text)
returns setof public.wpis_bloga
language sql
stable
security definer
set search_path = ''
as $$
  -- Próg długości odsiewa zgadywanie i puste/śmieciowe wywołania, zanim
  -- dotkniemy tabeli.
  select * from public.wpis_bloga
  where p_token is not null
    and length(p_token) >= 10
    and token_podgladu = p_token
  limit 1;
$$;

grant execute on function public.wpis_po_tokenie(text) to anon, authenticated;

-- --------------------------------------------------------------- obrazki ----

-- PUBLICZNY bucket — inaczej niż prywatne `zdjecia` (zdjęcia do CV, signed URL).
-- Obrazki bloga muszą być pobieralne bez sesji przez Google i podglądy social.
insert into storage.buckets (id, name, public)
values ('blog-obrazki', 'blog-obrazki', true)
on conflict (id) do nothing;

create policy "blog-obrazki: publiczny odczyt"
  on storage.objects for select
  using (bucket_id = 'blog-obrazki');

create policy "blog-obrazki: zapis tylko admin"
  on storage.objects for all to authenticated
  using (bucket_id = 'blog-obrazki' and (select public.czy_admin()))
  with check (bucket_id = 'blog-obrazki' and (select public.czy_admin()));
