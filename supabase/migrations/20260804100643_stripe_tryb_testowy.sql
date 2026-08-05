-- Znacznik trybu Stripe'a przy danych rozliczeniowych.
--
-- Sandbox i produkcja korzystają z TEJ SAMEJ bazy (decyzja Marka 2026-08-02 —
-- rezygnacja z osobnego środowiska dev). Bez tego pola testowa subskrypcja
-- wygląda w tabeli identycznie jak opłacona i nie da się ich rozdzielić ani
-- przy liczeniu przychodu, ani przy sprzątaniu po testach.
--
-- Wartość bierze się WPROST z pola `livemode` w zdarzeniu Stripe'a — nie
-- zgadujemy jej po kształcie klucza ani po środowisku aplikacji.
alter table public.subskrypcja
  add column tryb_testowy boolean not null default false;

alter table public.zakup
  add column tryb_testowy boolean not null default false;

alter table public.zdarzenie_stripe
  add column tryb_testowy boolean not null default false;

-- Dane testowe wyszukujemy i kasujemy jednym zapytaniem.
create index subskrypcja_testowe_idx on public.subskrypcja (tryb_testowy) where tryb_testowy;
create index zakup_testowe_idx on public.zakup (tryb_testowy) where tryb_testowy;

-- Konto z aktywną subskrypcją TESTOWĄ nie może uchodzić za płacące.
-- `ma_aktywna_subskrypcje` zostaje bez zmian celowo: w sandboxie chcemy, żeby
-- dostęp DZIAŁAŁ (po to testujemy), a rozdzielenie służy raportowaniu
-- i sprzątaniu, nie blokowaniu.
comment on column public.subskrypcja.tryb_testowy is
  'true = subskrypcja z sandboxa Stripe. Nie liczy się do przychodu; do skasowania po testach.';
