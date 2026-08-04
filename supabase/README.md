# Baza Aplikando (Supabase)

Projekt: **Aplikando** · ref `urjpluqutufsgkzysazq` · region `eu-central-1` (Frankfurt) ·
Postgres 17 · URL `https://urjpluqutufsgkzysazq.supabase.co`

Region UE ma znaczenie prawne: CV to dane osobowe, a trzymanie ich w EOG zdejmuje
z nas cały temat transferu do państwa trzeciego.

## Co jest w bazie

| Tabela | Po co |
| --- | --- |
| `profil` | Konto. Tworzone triggerem z `auth.users`. Trzyma `stripe_customer_id`. |
| `cv` | Biblioteka CV (`SavedCv`). `tresc` = `TailoredCv` w JSONB. |
| `dopasowanie` | Historia analiz (`Tailoring`): snapshot przed/po + `ai_meta`. |
| `subskrypcja` | Subskrypcja Stripe'a. Tylko do odczytu dla klienta. |
| `zakup` | Jednorazowe odblokowanie dopasowania (12 zł). Tylko do odczytu. |
| `zuzycie_miesieczne` | Licznik dopasowań w ramach limitu planu. |
| `zuzycie_ai` | Dziennik kosztu wywołań modelu (tokeny, USD). |
| `zdarzenie_stripe` | Idempotencja webhooka. Wyłącznie `service_role`. |
| `zgloszenie_bledu` | Formularz „Zgłoś błąd". |

Storage: bucket **`zdjecia`** (prywatny, 2 MB, jpeg/png/webp), ścieżka
`{user_id}/{cv_id}.{ext}`, dostęp przez signed URL.

## Funkcje (RPC)

- `ma_dostep_do(uuid)` — **jedyny** sposób sprawdzania uprawnień do dopasowania.
- `ma_aktywna_subskrypcje()` — czy konto ma opłacony dostęp (uwzględnia
  `past_due`/`canceled` do końca okresu).
- `zuzyj_dopasowanie(limit)` — atomowo podbija licznik albo rzuca
  `LIMIT_WYCZERPANY`. Limit podaje aplikacja z `PLANY` (subscription.ts).
- `zuzyto_w_tym_miesiacu()`, `klucz_miesiaca()` — licznik i klucz „RRRR-MM"
  (strefa Europe/Warsaw).
- `eksportuj_moje_dane()` / `usun_moje_konto()` — RODO art. 20 i 17.

## Zasady, których nie wolno złamać

1. **Klient nigdy nie pisze po tabelach rozliczeniowych.** `subskrypcja`, `zakup`,
   `zuzycie_*` mają dla roli `authenticated` wyłącznie SELECT. Zapisuje je
   webhook rolą `service_role`. Inaczej jeden INSERT z konsoli przeglądarki daje
   komuś plan Pro.
2. **Uprawnienia = `ma_dostep_do()`**, nigdy flaga przy rekordzie. Zakup wiąże się
   z KORZENIEM łańcucha przeliczeń (`korzen_id`), więc wywiad nie odbiera
   opłaconego dostępu.
3. **Ceny i limity żyją w `src/lib/subscription.ts`.** W SQL-u ich nie ma i mieć
   nie będzie — limit wchodzi parametrem do `zuzyj_dopasowanie()`.
4. **Zdjęcia idą do Storage, nie do JSONB.** W `tresc` siedzi ścieżka.

## Zmienne środowiskowe

```
NEXT_PUBLIC_SUPABASE_URL=https://urjpluqutufsgkzysazq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # jawny, ląduje w przeglądarce
SUPABASE_SERVICE_ROLE_KEY=...                             # TAJNY — tylko serwer/webhook
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

`SUPABASE_SERVICE_ROLE_KEY` omija RLS — nie wolno go wystawić w kodzie klienta
ani w zmiennej z prefiksem `NEXT_PUBLIC_`. Kopiuje się go z panelu Supabase
(Settings → API keys); MCP go nie udostępnia i to jest celowe.

## Do ustawienia RĘCZNIE w panelu Supabase

Tego nie da się zrobić migracją SQL:

1. **Authentication → Providers → Email**: włączone, „Confirm email" ON.
2. **Authentication → Email Templates → Confirm signup**: podmienić
   `{{ .ConfirmationURL }}` na `{{ .Token }}`, żeby mail niósł **6-cyfrowy kod**
   zamiast linku. Weryfikacja w kodzie: `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.
3. **Authentication → Providers → Google**: Client ID + Secret z Google Cloud
   Console. W GCP jako Authorized redirect URI wpisać
   `https://urjpluqutufsgkzysazq.supabase.co/auth/v1/callback`.
4. **Authentication → URL Configuration**: Site URL = adres produkcyjny,
   Redirect URLs = `http://localhost:3000/**` + domena z Vercela.
5. **Custom SMTP (Resend)** — **konieczne przed produkcją**. Wbudowany mailer
   Supabase ma limit rzędu kilku maili na godzinę i wysyła tylko do członków
   zespołu; bez własnego SMTP rejestracja przestanie działać przy pierwszym
   ruchu. Domenę trzeba zweryfikować w Resend (SPF/DKIM), inaczej kody
   aktywacyjne będą lądować w spamie.

## Środowiska (od 2026-08-02)

| | Gałąź | Adres | Baza | Stripe |
| --- | --- | --- | --- | --- |
| **Produkcja** | `main` | aplikando.pl | projekt `Aplikando` | live |
| **Testy** | `dev` | `cv-git-dev-….vercel.app` | **ta sama** | sandbox |

Klucze rozdziela Vercel: zmienne w środowisku **Production** to live, w **Preview**
to sandbox. Kod nie zna trybu i nie ma go znać — wynika on wyłącznie z użytego
klucza. Dzięki temu nie da się pomylić środowisk logiką w aplikacji.

**Obie gałęzie korzystają z TEJ SAMEJ bazy** (rezygnacja z osobnego Supabase dla
dev — darmowy plan daje 2 projekty na osobę i limit jest wyczerpany, a lokalny
stack wymagałby Dockera). Dlatego `subskrypcja`, `zakup` i `zdarzenie_stripe` mają
kolumnę `tryb_testowy`, braną wprost z `livemode` zdarzenia Stripe'a. Sprzątanie
po testach:

```sql
delete from public.zakup where tryb_testowy;
delete from public.subskrypcja where tryb_testowy;
delete from public.zdarzenie_stripe where tryb_testowy;
```

### Cennik w Stripe

```bash
npm run stripe:produkty
```

Zakłada produkty i ceny z `subscription.ts` (Start 29/290, Pro 49/490,
jednorazowo 12 — wszystko PLN brutto) i wypisuje identyfikatory `price_…` gotowe
do wklejenia w zmienne. Jest **idempotentny** — kolejne uruchomienie niczego nie
duplikuje, tylko pokazuje to, co już istnieje.

Skrypt **odmawia działania na kluczu produkcyjnym**, dopóki nie poda się jawnie
`-- --produkcja`. Tryb sprawdza przez API (`balance.livemode`), nie po prefiksie
klucza. Cennik na żywym koncie zakłada się świadomie, nie przez pomyłkę
w `.env.local`.

### Lokalna baza (opcjonalnie, obecnie nieużywana)

`supabase/config.toml` i komendy `db:start` / `db:stop` / `db:reset` zostają
w repo na przyszłość. Wymagają **Docker Desktop**. Dziś ich nie używamy —
dev i produkcja dzielą jedną bazę zdalną.

**Migracje pisze się raz:** na produkcji przez `apply_migration`, lokalnie (gdy
kiedyś wróci) przez `db:reset`. Nigdy nie edytujemy migracji, która już poszła
na produkcję — dopisujemy nową.

## Migracje

Pliki w `supabase/migrations/` odpowiadają 1:1 stanowi bazy (stan na 2026-08-02):

```
20260802160231_schemat_poczatkowy.sql
20260802160316_funkcje_uprawnien.sql
20260802160403_rls_polityki.sql
20260802160425_storage_zdjecia.sql
20260802160714_zabezpiecz_funkcje_triggera.sql
20260802160730_indeksy_kluczy_obcych.sql
```

Po każdej zmianie schematu: odśwież `src/lib/supabase/typy-bazy.ts` i przejedź
audyt (`get_advisors` / Database Linter). Oczekiwane, świadome ostrzeżenia:
`zdarzenie_stripe` bez polityk (celowo — tylko `service_role`) oraz pięć
funkcji `SECURITY DEFINER` wystawionych dla zalogowanych (celowo — każda bierze
użytkownika z `auth.uid()`, żadna nie przyjmuje `user_id` z zewnątrz).
