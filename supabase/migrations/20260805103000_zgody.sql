-- Aplikando — dziennik zgód: regulamin+polityka i zgoda na natychmiastowe
-- rozpoczęcie świadczenia usługi cyfrowej przed upływem terminu na
-- odstąpienie od umowy.
--
-- Ciężar dowodu, że zgoda została udzielona, spoczywa na administratorze
-- (art. 7 ust. 1 RODO) — checkbox bez trwałego zapisu jest dowodowo
-- bezwartościowy. Tabela jest NIEZMIENNYM dziennikiem: brak UPDATE/DELETE
-- nawet dla właściciela wiersza. `user_id` ustawiony na `on delete set null`,
-- nie `cascade` — dowód udzielenia zgody musi przetrwać dłużej niż samo
-- konto, na wypadek sporu już po jego usunięciu.

create type public.rodzaj_zgody as enum (
  'regulamin_polityka',
  'usluga_przed_odstapieniem'
);

create table public.zgoda (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profil (id) on delete set null,
  rodzaj public.rodzaj_zgody not null,
  -- Wersja dokumentów w chwili udzielenia zgody (WERSJA_DOKUMENTOW
  -- z src/lib/prawne/dane.ts) — przy sporze trzeba wiedzieć, KTÓRĄ wersję
  -- regulaminu użytkownik zaakceptował, nie tylko że jakąś zaakceptował.
  wersja_dokumentow text not null,
  -- Czego dotyczyła zgoda, np. „rejestracja", „zakup_subskrypcja:pro:rok",
  -- „zakup_jednorazowo:<dopasowanie_id>". Wolny tekst — to log, nie relacja.
  kontekst text not null,
  -- Czas RZECZYWISTEGO zaznaczenia checkboxa, dostarczany przez klienta —
  -- może różnić się od `utworzono` o kilka-kilkanaście sekund przy
  -- rejestracji, gdzie zgoda jest zaznaczana przed potwierdzeniem kodu
  -- z maila, a wiersz zapisuje się dopiero po nim.
  udzielono_o timestamptz not null default now(),
  utworzono timestamptz not null default now()
);

create index zgoda_user_idx on public.zgoda (user_id, utworzono desc);

alter table public.zgoda enable row level security;

create policy "zgoda: czyta swoje"
  on public.zgoda for select to authenticated
  using (user_id = (select auth.uid()));

create policy "zgoda: zapisuje swoje"
  on public.zgoda for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Dziennik dowodowy jest niezmienny — nikt, łącznie z właścicielem wiersza,
-- nie może go zmienić ani skasować po zapisie.
revoke update, delete on public.zgoda from authenticated, anon;
revoke all on public.zgoda from anon;
