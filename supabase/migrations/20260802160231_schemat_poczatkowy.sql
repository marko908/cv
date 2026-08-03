-- Aplikando — schemat początkowy.
-- Treść CV jako JSONB zgodny z TailoredCv (src/lib/cv-schema.ts) — walidacja
-- zostaje w Zodzie, jedno źródło schematu. Cenniki/limity/lista szablonów NIE
-- są duplikowane w SQL-u (subscription.ts, cv-templates.ts).

create extension if not exists pgcrypto with schema extensions;

create type public.plan_id as enum ('start', 'pro');
create type public.okres_rozliczeniowy as enum ('miesiac', 'rok');
-- Słownik przepisany ze Stripe'a. „brak" z StatusSubskrypcji = BRAK WIERSZA.
create type public.status_subskrypcji as enum ('aktywna', 'zalega', 'anulowana');
create type public.status_zakupu as enum ('oczekuje', 'oplacony', 'nieudany', 'zwrocony');

create or replace function public.ustaw_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profil ----
create table public.profil (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text unique,
  zgoda_marketing boolean not null default false,
  utworzono timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profil_updated_at
  before update on public.profil
  for each row execute function public.ustaw_updated_at();

-- Konto w auth.users → profil. SECURITY DEFINER, bo rola authenticated nie ma
-- dostępu do schematu auth.
create or replace function public.obsluz_nowego_uzytkownika()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profil (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.obsluz_nowego_uzytkownika();

-- -------------------------------------------------------------------- cv ----
create table public.cv (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profil (id) on delete cascade,
  nazwa text not null default 'Nowe CV',
  -- Pełny TailoredCv. Zdjęcie w środku to ŚCIEŻKA w Storage, nie base64.
  tresc jsonb not null,
  -- Id szablonu z CV_TEMPLATES. Celowo bez CHECK-a: nowy szablon ma być wpisem
  -- w cv-templates.ts, a nie kolejną migracją bazy.
  szablon text not null default 'nowoczesny',
  sekcje text[] not null default '{}',
  utworzono timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cv_user_idx on public.cv (user_id, updated_at desc);

create trigger cv_updated_at
  before update on public.cv
  for each row execute function public.ustaw_updated_at();

-- ----------------------------------------------------------- dopasowanie ----
create table public.dopasowanie (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profil (id) on delete cascade,
  cv_id uuid references public.cv (id) on delete set null,
  -- KORZEŃ ŁAŃCUCHA PRZELICZEŃ. Przeliczenie po wywiadzie tworzy nowy rekord
  -- i kasuje stary; zakup wiąże się z korzeniem, więc opłacony dostęp nie ginie.
  -- NULL = ten rekord jest korzeniem (coalesce(korzen_id, id)).
  korzen_id uuid references public.dopasowanie (id) on delete set null,
  tytul_oferty text not null default '',
  url_oferty text not null default '',
  tresc_oferty text not null default '',
  szablon text not null default 'nowoczesny',
  -- Snapshoty, nie referencje: użytkownik edytuje CV dalej, a raport ma
  -- pokazywać stan z tamtej chwili.
  cv_bazowe jsonb not null,
  cv_dopasowane jsonb not null,
  -- AiMeta. Pole `unlocked` jest MARTWE — uprawnienia liczy ma_dostep_do().
  ai_meta jsonb not null default '{}'::jsonb,
  utworzono timestamptz not null default now()
);

create index dopasowanie_user_idx on public.dopasowanie (user_id, utworzono desc);
create index dopasowanie_korzen_idx on public.dopasowanie (korzen_id);
create index dopasowanie_cv_idx on public.dopasowanie (cv_id);

-- ----------------------------------------------------------- subskrypcja ----
create table public.subskrypcja (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profil (id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  plan public.plan_id not null,
  okres public.okres_rozliczeniowy not null,
  status public.status_subskrypcji not null,
  -- Surowy status ze Stripe'a — do diagnozy webhooka bez wchodzenia do Stripe'a.
  stripe_status text,
  koniec_okresu timestamptz,
  anuluje_sie boolean not null default false,
  utworzono timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jedna nieanulowana subskrypcja na konto; historyczne mogą leżeć obok.
create unique index subskrypcja_jedna_aktywna
  on public.subskrypcja (user_id)
  where status <> 'anulowana';

create index subskrypcja_user_idx on public.subskrypcja (user_id);

create trigger subskrypcja_updated_at
  before update on public.subskrypcja
  for each row execute function public.ustaw_updated_at();

-- ----------------------------------------------------------------- zakup ----
create table public.zakup (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profil (id) on delete cascade,
  dopasowanie_id uuid not null references public.dopasowanie (id) on delete cascade,
  stripe_payment_intent_id text not null unique,
  -- Kwota w GROSZACH, tak jak podaje ją Stripe. Nigdy floaty przy pieniądzach.
  kwota_grosze integer not null,
  waluta text not null default 'pln',
  status public.status_zakupu not null default 'oczekuje',
  -- Jak zapłacono: blik | p24 | card | google_pay | apple_pay.
  metoda text,
  utworzono timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index zakup_user_idx on public.zakup (user_id);
create index zakup_dopasowanie_idx on public.zakup (dopasowanie_id) where status = 'oplacony';

create trigger zakup_updated_at
  before update on public.zakup
  for each row execute function public.ustaw_updated_at();

-- ---------------------------------------------------- zuzycie_miesieczne ----
-- Osobna tabela, a nie count(*) po dopasowaniach: przeliczenie po wywiadzie
-- KASUJE stary rekord, więc liczenie wierszy oddawałoby zużyte wywołania modelu.
create table public.zuzycie_miesieczne (
  user_id uuid not null references public.profil (id) on delete cascade,
  -- Klucz „RRRR-MM", zgodny z kluczMiesiaca() z subscription.ts.
  miesiac text not null,
  dopasowania integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, miesiac)
);

-- ----------------------------------------------------------- zuzycie_ai ----
-- Jedno dopasowanie to 2 wywołania modelu — bez tego dziennika nie da się
-- powiedzieć, czy plan za 29 zł ma jeszcze marżę.
create table public.zuzycie_ai (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profil (id) on delete set null,
  dopasowanie_id uuid references public.dopasowanie (id) on delete set null,
  -- 'oferta' | 'przepisanie' | 'import-cv'
  etap text not null,
  -- Format „dostawca/model" — ten sam co w CV_MODEL_*.
  model text not null,
  tokeny_wejscie integer not null default 0,
  tokeny_wyjscie integer not null default 0,
  koszt_usd numeric(12, 6) not null default 0,
  trwalo_ms integer,
  utworzono timestamptz not null default now()
);

create index zuzycie_ai_user_idx on public.zuzycie_ai (user_id, utworzono desc);

-- ----------------------------------------------------- zdarzenie_stripe ----
-- Stripe dostarcza zdarzenia CO NAJMNIEJ RAZ i ponawia po błędzie. Wstawienie
-- id jest bramką idempotencji: konflikt = już obsłużone, wychodzimy z 200.
create table public.zdarzenie_stripe (
  id text primary key,
  typ text not null,
  payload jsonb,
  utworzono timestamptz not null default now(),
  przetworzono timestamptz,
  blad text
);

create index zdarzenie_stripe_typ_idx on public.zdarzenie_stripe (typ, utworzono desc);

-- ----------------------------------------------------- zgloszenie_bledu ----
create table public.zgloszenie_bledu (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profil (id) on delete set null,
  dopasowanie_id uuid references public.dopasowanie (id) on delete set null,
  kategoria text not null,
  tresc text not null,
  obsluzone boolean not null default false,
  utworzono timestamptz not null default now()
);

create index zgloszenie_bledu_idx on public.zgloszenie_bledu (obsluzone, utworzono desc);
