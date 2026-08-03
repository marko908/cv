-- Aplikando — RLS. Domyślnie WSZYSTKO zamknięte; użytkownik widzi wyłącznie
-- własne wiersze. Tabele rozliczeniowe są dla użytkownika TYLKO DO ODCZYTU —
-- zapisuje je webhook Stripe'a rolą service_role, która omija RLS. Gdyby klient
-- mógł pisać po `subskrypcja`, wystarczyłby jeden INSERT z DevToolsów, żeby
-- nadać sobie plan Pro.
--
-- auth.uid() owijamy w (select ...) — Postgres liczy je wtedy RAZ na zapytanie
-- (initplan), a nie dla każdego wiersza.

alter table public.profil              enable row level security;
alter table public.cv                  enable row level security;
alter table public.dopasowanie         enable row level security;
alter table public.subskrypcja         enable row level security;
alter table public.zakup               enable row level security;
alter table public.zuzycie_miesieczne  enable row level security;
alter table public.zuzycie_ai          enable row level security;
alter table public.zdarzenie_stripe    enable row level security;
alter table public.zgloszenie_bledu    enable row level security;

-- ---------------------------------------------------------------- profil ----
create policy "profil: widzi swój"
  on public.profil for select to authenticated
  using (id = (select auth.uid()));

create policy "profil: edytuje swój"
  on public.profil for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Wiersz tworzy trigger przy rejestracji, kasuje usun_moje_konto() — klient
-- nie ma tu nic do roboty.
revoke insert, delete on public.profil from authenticated, anon;

-- Uprawnienie KOLUMNOWE: użytkownik zmienia wyłącznie zgodę marketingową.
-- Bez tego polityka UPDATE pozwoliłaby mu wpisać sobie cudze stripe_customer_id
-- i podłączyć się pod czyjeś rozliczenia.
revoke update on public.profil from authenticated;
grant update (zgoda_marketing) on public.profil to authenticated;

-- -------------------------------------------------------------------- cv ----
create policy "cv: czyta swoje"
  on public.cv for select to authenticated
  using (user_id = (select auth.uid()));

create policy "cv: tworzy swoje"
  on public.cv for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "cv: edytuje swoje"
  on public.cv for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "cv: kasuje swoje"
  on public.cv for delete to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------- dopasowanie ----
-- Rekord widać ZAWSZE (tytuł oferty, data, wynik — to jest lista historii).
-- Bramkowanie płatne dotyczy TREŚCI raportu i przerobionego CV i siedzi w UI
-- oraz w ma_dostep_do(); nie da się go zrobić polityką RLS, bo blokada dotyczy
-- części kolumn jednego wiersza, a nie całego wiersza.
create policy "dopasowanie: czyta swoje"
  on public.dopasowanie for select to authenticated
  using (user_id = (select auth.uid()));

create policy "dopasowanie: tworzy swoje"
  on public.dopasowanie for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "dopasowanie: edytuje swoje"
  on public.dopasowanie for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "dopasowanie: kasuje swoje"
  on public.dopasowanie for delete to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------- subskrypcja ----
create policy "subskrypcja: czyta swoją"
  on public.subskrypcja for select to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete on public.subskrypcja from authenticated, anon;

-- ----------------------------------------------------------------- zakup ----
create policy "zakup: czyta swoje"
  on public.zakup for select to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete on public.zakup from authenticated, anon;

-- ---------------------------------------------------- zuzycie_miesieczne ----
create policy "zuzycie: czyta swoje"
  on public.zuzycie_miesieczne for select to authenticated
  using (user_id = (select auth.uid()));

-- Licznik podbija wyłącznie zuzyj_dopasowanie() (SECURITY DEFINER).
revoke insert, update, delete on public.zuzycie_miesieczne from authenticated, anon;

-- ------------------------------------------------------------ zuzycie_ai ----
create policy "zuzycie_ai: czyta swoje"
  on public.zuzycie_ai for select to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete on public.zuzycie_ai from authenticated, anon;

-- ------------------------------------------------------ zdarzenie_stripe ----
-- Ani jednej polityki: to log webhooka, dostępny wyłącznie dla service_role.
revoke all on public.zdarzenie_stripe from authenticated, anon;

-- ------------------------------------------------------ zgloszenie_bledu ----
create policy "zgloszenie: czyta swoje"
  on public.zgloszenie_bledu for select to authenticated
  using (user_id = (select auth.uid()));

create policy "zgloszenie: zgłasza swoje"
  on public.zgloszenie_bledu for insert to authenticated
  with check (user_id = (select auth.uid()));

revoke update, delete on public.zgloszenie_bledu from authenticated, anon;

-- Rola anonimowa nie ma dostępu do NICZEGO w tym schemacie — cała aplikacja
-- działa na zalogowanym użytkowniku, a landing nie czyta bazy.
revoke all on all tables in schema public from anon;
