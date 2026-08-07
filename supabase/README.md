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
3. **Authentication → Providers → Google** — patrz osobna sekcja niżej.
   ⚠️ Stan na 2026-08-07: **NIEWŁĄCZONE**, Client ID i Secret puste.
4. **Authentication → URL Configuration**: Site URL = adres produkcyjny,
   Redirect URLs = `http://localhost:3000/**` + domena z Vercela.
   **Musi obejmować `/auth/callback`** — to tam wraca użytkownik po logowaniu
   Google i tam wymieniamy kod na sesję.
5. **Custom SMTP (Resend)** — **konieczne przed produkcją**. Wbudowany mailer
   Supabase ma limit rzędu kilku maili na godzinę i wysyła tylko do członków
   zespołu; bez własnego SMTP rejestracja przestanie działać przy pierwszym
   ruchu. Domenę trzeba zweryfikować w Resend (SPF/DKIM), inaczej kody
   aktywacyjne będą lądować w spamie.
6. **Authentication → Policies → Minimum password length: 8** — ✅ ustawione
   (potwierdzone przez Marka 2026-08-07). Musi zgadzać się ze stałą `MIN_HASLO`
   w `src/components/auth/formularz-auth.tsx`. Gdyby serwer miał niższy próg,
   walidacja kliencka byłaby dekoracją; gdyby wyższy, użytkownik dostawałby
   angielski komunikat Supabase zamiast naszego (`poPolsku()` tłumaczy „password
   should be at least", ale wstawia w nim NASZĄ liczbę — przy rozjeździe
   podałby błędną).

## Logowanie Google — konfiguracja krok po kroku

Kod jest gotowy (`/auth/callback`, przycisk w `formularz-auth.tsx`, bramka
zgody `/dokoncz-rejestracje`), ale **bez tych kroków przycisk zwróci błąd**.

**Uwaga na dwa różne adresy powrotne — to najczęstsza pomyłka w tym procesie:**

- w **Google Cloud Console** rejestruje się callback SUPABASE:
  `https://urjpluqutufsgkzysazq.supabase.co/auth/v1/callback`
  (bo to Supabase rozmawia z Google, nie nasza aplikacja),
- w **Supabase → URL Configuration** dopisuje się adres NASZEJ aplikacji
  zakończony `/auth/callback` (bo tam Supabase odsyła użytkownika z kodem).

### A. Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com) → wybierz
   projekt (najlepiej ten sam, w którym masz Gemini API) albo załóż nowy.
2. **APIs & Services → OAuth consent screen**: typ **External**, nazwa
   aplikacji „Aplikando", e-mail wsparcia `marko@aplikando.pl`, domena
   `aplikando.pl`, odnośniki do polityki prywatności (`/polityka-prywatnosci`)
   i regulaminu (`/regulamin`). Zakresy: wystarczą `email`, `profile`,
   `openid` — **nie proś o więcej, niż opisują dokumenty**.
3. **Credentials → Create Credentials → OAuth client ID**, typ
   **Web application**.
4. **Authorized redirect URIs** → dodaj dokładnie:
   `https://urjpluqutufsgkzysazq.supabase.co/auth/v1/callback`
5. Skopiuj **Client ID** i **Client Secret**.

### B. Supabase

6. **Authentication → Providers → Google**: wklej Client ID i Client Secret,
   **włącz przełącznik „Enable Sign in with Google"**, Save.
7. **Authentication → URL Configuration**: Site URL = adres produkcyjny;
   w Redirect URLs dopisz adres produkcyjny z `/auth/callback` (wzorzec
   `https://…/**` też to obejmie).

### C. Sprawdzenie

8. Wejdź na `/rejestracja`, zaznacz zgodę na Regulamin, kliknij „Kontynuuj
   z Google". Po powrocie powinieneś wylądować w aplikacji, a w tabeli `zgoda`
   ma pojawić się wiersz `regulamin_polityka` z kontekstem `rejestracja`.
9. Test drugiej bramki: usuń wiersze z `zgoda` dla swojego konta i zaloguj się
   Google z ekranu `/logowanie`. Powinieneś trafić na `/dokoncz-rejestracje`,
   a nie do aplikacji.

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
