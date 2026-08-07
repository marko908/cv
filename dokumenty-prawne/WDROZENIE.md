# Wdrożenie dokumentów prawnych — Aplikando

Stan na 7 sierpnia 2026. Podstawa: pakiet Creativa Legal (pliki 1–4 + wzory),
zestawiony z rzeczywistym kodem aplikacji.

**Aplikacja NIE JEST jeszcze live** (potwierdzone 2026-08-07) — zero
zarejestrowanych użytkowników, zero płatności. To ma znaczenie dla całej tej
checklisty: obowiązki „powiadom klientów" są dziś bezprzedmiotowe, a każdy
punkt oznaczony jako bloker można zamknąć bez presji czasu. **Po starcie
wszystko poniżej robi się droższe** — patrz bloker 0c.

**Dane, na których oparto dokumenty:** Marko Nowak, firma Markonn Marko Nowak,
ul. Mariana Maliny 5a/17, 41-200 Sosnowiec, CEIDG, NIP 6443568932,
REGON 522854985, e-mail marko@aplikando.pl, aplikacja Aplikando (aplikando.pl),
czynny podatnik VAT, ceny brutto 29 / 49 / 12 zł.

---

## ⛔ BLOKERY — załatw PRZED publikacją

Otwarty jest już tylko **5** — i to wyłącznie po stronie paneli (Google Cloud
Console + Supabase). Kod jest gotowy. Zamknięte: 0, 0b, 0c, 1, 2, 3, 4.

### 0b. ✅ Migracja `20260807120000_zgoda_marketing.sql` — ZASTOSOWANA (2026-08-07)

Dodała `marketing` i `marketing_wycofanie` do enuma `rodzaj_zgody`. Tunel MCP
dalej zwraca błąd uprawnień, więc tak jak przy blokerze 0 — przez CLI
(`npx supabase db push --linked`), a potem `gen types typescript --linked`.
Zweryfikowane: `typy-bazy.ts` zawiera obie nowe wartości, `tsc --noEmit` czysty.

Dwie pułapki przy odświeżaniu typów, obie trafione tym razem: generator **nie
zachowuje komentarza nagłówkowego** pliku (trzeba go wkleić z powrotem),
a `Out-File -Encoding utf8` w Windows PowerShell 5.1 dokłada **BOM**. Obie
opisane w komentarzu na górze `typy-bazy.ts`.

### 0c. ✅ Wersja dokumentów 1.1 — § 17 BEZPRZEDMIOTOWY (2026-08-07)

`DATA_OBOWIAZYWANIA` = 7 sierpnia 2026, `WERSJA_DOKUMENTOW` = 1.1. Regulamin
§ 17 ust. 2 każe przesłać zmienioną wersję Usługobiorcom na 10 dni przed
wejściem w życie — **ale Aplikando nie wystartowało i nie ma ani jednego
zarejestrowanego użytkownika** (potwierdzone przez Marka 2026-08-07). Nie ma
kogo informować; 7 sierpnia to po prostu data pierwszej publikacji, nie data
zmiany obowiązującego dokumentu.

⚠️ **PO STARCIE TA REGUŁA SIĘ ODWRACA.** Od chwili, w której powstanie pierwsze
konto, każda zmiana treści Regulaminu albo Polityki oznacza realnych ludzi do
poinformowania: mail ze wzoru (`wzory-wiadomosci-o-zmianie.md`), 10 dni
wyprzedzenia, 10 dni na wypowiedzenie (§ 17 ust. 4). Newsletter ma 7 dni,
zmiana ceny aktywnej subskrypcji 30. Wtedy podniesienie wersji przestaje być
jednolinijkową edycją i staje się operacją do zaplanowania.

### 0. ✅ Migracja `20260805103000_zgody.sql` — ZASTOSOWANA (2026-08-05)

Tabela `zgoda` istnieje na żywej bazie. Zablokowany wcześniej tunel MCP
(`list_migrations`/`get_project_url` zwracały błąd uprawnień) obszedłem przez
**Supabase CLI z bezpośrednim linkiem do projektu**:
`npx supabase link --project-ref urjpluqutufsgkzysazq` (CLI był już
zalogowany), potem `npx supabase db push --linked` po weryfikacji `--dry-run`.

Po drodze wyszła na jaw druga rzecz: `supabase migration list` pokazał
migrację `20260804100643` obecną na REMOTE, ale bez odpowiadającego pliku
w repo (`stripe_tryb_testowy` — kolumny `tryb_testowy` przy Stripe, znane
z `STRUKTURA.md`, zastosowane wcześniej bezpośrednio, bez commitu pliku).
Odtworzyłem ten plik z treści zapisanej w `supabase_migrations.schema_migrations`
(`supabase/migrations/20260804100643_stripe_tryb_testowy.sql`), żeby historia
lokalna i zdalna się zgadzały — bez tego `db push`/`db pull` odmawiały
działania (`LegacyDbPullMigrationConflictError`).

Zweryfikowane bezpośrednio na bazie po zastosowaniu: `relrowsecurity = true`,
polityki `SELECT`+`INSERT` dla `authenticated`, brak `UPDATE`/`DELETE`, `anon`
bez dostępu. `typy-bazy.ts` odświeżony realnym `supabase gen types
typescript --linked` (nie ręcznym wpisem) — wygenerowana treść dla `zgoda`
zgodziła się co do joty z tym, co było dopisane ręcznie.

### 1. ✅ Skrzynka marko@aplikando.pl — AKTYWNA (2026-08-05, potwierdzone przez Marka)

Ten adres stoi w regulaminie, w polityce prywatności i jako punkt kontaktowy DSA.

`MAIL_OD` na Vercelu wskazuje na własną domenę (`noreply@aplikando.pl`) —
**potwierdzone przez Marka 2026-08-06**, punkt zamknięty. W `lib/mail.ts`
zostaje fallback na testowy `onboarding@resend.dev`, który wysyła WYŁĄCZNIE
na skrzynkę właściciela konta Resend. Fallback jest celowy (bez zmiennej nie
chcemy wysypywać buildu), ale przy zakładaniu nowego środowiska trzeba o nim
pamiętać: brak `MAIL_OD` nie wywala niczego głośno — `wyslijMail` z założenia
nie rzuca, więc maile po prostu cicho nie docierają do klientów.

### 2. ✅ Tier Google Gemini API — POTWIERDZONY (2026-08-05, Tier 1)

Regulamin § 11 ust. 6 i Polityka prywatności stwierdzają, że dane wprowadzone
do Aplikacji **nie są wykorzystywane do trenowania modeli AI**. To jest
prawda tylko dla płatnego tieru Gemini API (Tier 1+, wymaga podpiętego
rozliczania) — Marko potwierdził, że projekt powiązany z
`GOOGLE_GENERATIVE_AI_API_KEY` jest na Tier 1. Zdanie w obu dokumentach
zostaje bez zmian.

Do weryfikacji przy okazji (nie blokuje publikacji): w
[Google AI Studio → API keys](https://aistudio.google.com/apikey) tier jest
widoczny przy kluczu; upewnij się, że klucz **na produkcji** (Vercel →
Production env) to ten sam projekt co przetestowany, a nie osobny klucz
deweloperski założony bez rozliczania.

### 3. ✅ Umowy powierzenia (art. 28 RODO) — ZAAKCEPTOWANE (2026-08-07)

Polityka prywatności stwierdza: *„Z każdym z ww. podmiotów, który przetwarza
dane osobowe w imieniu Administratora, zawarta została umowa powierzenia
przetwarzania danych osobowych zgodna z art. 28 RODO."* Marko potwierdził
2026-08-07, że DPA są zaakceptowane u wszystkich dostawców — u większości
wchodzą automatycznie wraz z regulaminem usługi.

Zostają dwie rzeczy do jednorazowego sprawdzenia, opisane w `dpa-lista.md`:
warunki Google Analytics/Tag Managera akceptuje się **osobno** od Cloud DPA dla
Gemini API, a **biuro rachunkowe nie ma panelu** — tam musi istnieć realnie
podpisany dokument. Do tego: zbierz kopie w jednym katalogu, bo przy kontroli
liczy się to, co umiesz pokazać.

**Pełna lista z dokładnymi ścieżkami klikania, podziałem na role (powierzenie
vs współadministrowanie) i dwiema wykrytymi lukami: `dokumenty-prawne/dpa-lista.md`.**

Skrót: 10 podmiotów przetwarzających (Vercel, Supabase, Google Cloud/Gemini,
Resend, GA4, GTM, Microsoft Clarity, Fakturownia, Striptu, biuro rachunkowe)
+ 2 relacje innego typu (Stripe — odrębny administrator, Meta —
współadministrowanie).

Dwie luki wykryte przy składaniu tej listy zostały **domknięte tego samego dnia**:
Fakturownia i Striptu dopisane do tabeli odbiorców w polityce i do Załącznika
nr 2 (dostają dane każdego płacącego klienta, a nie było ich nigdzie);
uwierzytelnianie kontem Google przywrócone spójnie we wszystkich trzech
dokumentach — z zastrzeżeniem z blokera nr 5, że funkcji nie ma jeszcze
w kodzie.

Zachowaj PDF-y w jednym miejscu. Przy kontroli UODO to pierwsza rzecz, o którą
zapytają. Przy okazji sprawdź na `dataprivacyframework.gov`, którzy dostawcy mają
**aktywną** certyfikację DPF — od tego zależy poprawność sekcji „Przekazywanie
danych do państwa trzeciego" i Załącznika nr 2 do umowy powierzenia.

### 5. ⏳ Logowanie kontem Google — KOD GOTOWY, zostaje panel (2026-08-07)

Opis rejestracji przez Google wrócił do Regulaminu (§ 4 ust. 19), Polityki
(cel nr 1 + tabela odbiorców) i Załącznika nr 2, a **kod został napisany tego
samego dnia**, więc dokumenty nie wyprzedzają już aplikacji. Odstępstwo nr 23
cofnięte.

⚠️ **Sprostowanie:** wcześniejsza wersja tego dokumentu twierdziła, że provider
Google jest skonfigurowany po stronie Supabase. **Nie był** — zrzut panelu
z 2026-08-07 pokazuje wyłączony przełącznik „Enable Sign in with Google" oraz
puste Client ID i Client Secret. `supabase/README.md` opisywał to poprawnie,
jako krok DO wykonania.

Zrobione w kodzie:

- [x] Przycisk „Kontynuuj z Google" na ekranach `rejestracja` i `logowanie`
      (`formularz-auth.tsx`), logo jako wklejony SVG — nie pobieramy obrazka
      z serwerów Google, bo byłoby to żądanie do Google przy każdym wejściu,
      także od osoby, która odmówiła wszystkich zgód.
- [x] Trasa `/auth/callback` — wymiana kodu na sesję po stronie serwera
      (`exchangeCodeForSession`). Musi być trasą, nie stroną: Server Components
      nie mogą zapisywać ciasteczek.
- [x] **Zgoda na Regulamin, dwiema bramkami.** Na ekranie rejestracji przycisk
      Google jest `disabled` bez checkboxa, a znacznik czasu zaznaczenia
      przenosi przez przekierowanie `sessionStorage` (`lib/prawne/zgody-oauth.ts`)
      — stan Reacta nie przeżywa podróży na obcą domenę, a dziennik ma nosić
      chwilę aktu woli, nie chwilę powrotu.
- [x] **Druga bramka: `/dokoncz-rejestracje`.** Łapie przypadek, którego
      pierwsza złapać nie może — nowy użytkownik klika „Kontynuuj z Google" na
      ekranie LOGOWANIA, Google zakłada mu konto, a checkboxa nikt nie
      pokazał. Callback sprawdza dziennik zgód i przy braku wpisu odsyła tutaj;
      sama strona sprawdza to jeszcze raz po stronie serwera, żeby nie dało się
      jej ominąć wpisaniem adresu docelowego w pasku.
- [x] Wyjście dla kogoś, kto zgody nie chce udzielić: usunięcie konta jednym
      kliknięciem z tego ekranu. Konto istnieje, zanim nasz kod cokolwiek
      zobaczy — nie da się „nie założyć konta bez zgody", da się tylko nie
      wpuścić do aplikacji i dać drogę wyjścia.
- [x] Mail powitalny z Regulaminem w PDF również na tej ścieżce.

**Do zrobienia PRZEZ CIEBIE w panelach** (kod bez tego nie zadziała) —
szczegółowa instrukcja: `supabase/README.md`, sekcja „Logowanie Google".

- [ ] Google Cloud Console: ekran zgody OAuth + Client ID (typ „Aplikacja
      internetowa"), Authorized redirect URI =
      `https://urjpluqutufsgkzysazq.supabase.co/auth/v1/callback`.
- [ ] Supabase → Authentication → Providers → Google: wkleić Client ID
      i Secret, **włączyć przełącznik**, Save.
- [ ] Supabase → Authentication → URL Configuration: Site URL = adres
      produkcyjny, Redirect URLs muszą obejmować `/auth/callback`.

**Otwarte pytanie do rozstrzygnięcia:** Regulamin i Polityka mówią, że
otrzymujemy z Google **imię, nazwisko i zdjęcie profilowe**. Supabase trzyma je
w `auth.users.raw_user_meta_data`, ale nasza tabela `profil` ich nie kopiuje
i nigdzie ich nie używamy. To jest prawdziwe (dane realnie do nas trafiają),
więc dokumenty nie kłamią — ale jeżeli nie zamierzasz ich do niczego używać,
uczciwiej byłoby zawęzić zakres w Google Cloud do samego adresu e-mail
i skreślić resztę z dokumentów.

### 4. ✅ Narzędzia analityczne — ZWERYFIKOWANE NA PRODUKCJI (2026-08-07)

Kontener `GTM-5VGWSSPG` działa, wszystkie trzy narzędzia opisane w polityce
realnie istnieją i **respektują zgodę zgodnie z wyborem użytkownika**.
Sprawdzone na żywo na `cv-eight-black-32.vercel.app`, trzy scenariusze:

| Wybór użytkownika | `_ga` | `_clck` | `_fbp` | Werdykt |
|---|---|---|---|---|
| przed decyzją (baner widoczny) | — | — | — | zero skryptów, zero ciasteczek, `consent default` = wszystko `denied` ✅ |
| analityczne TAK, marketingowe NIE | ✅ | ✅ | **—** | Meta NIE odpalił mimo załadowanego kontenera ✅ |
| wszystko TAK | ✅ | ✅ | ✅ | Meta Pixel `PageView` wysłany ✅ |
| analityczne NIE, marketingowe TAK | **—** | **—** | ✅ | Clarity NIE odpalił, GA4 bez ciasteczka ✅ |

To dowodzi rzeczy, której sam kod zagwarantować nie mógł: **„Dodatkowe
sprawdzenia zgody" są realnie ustawione na obu tagach, które nie respektują
Consent Mode z siebie** — Meta na `ad_storage`, Clarity na `analytics_storage`.
Gdyby ich nie było, `_fbp` pojawiłby się w teście drugim, a `_clck`
w czwartym.

**GA4 przy odmowie analityki nie zakłada `_ga`** — wysyła trafienie
bezciasteczkowe z `gcs=G110` (sygnały obecne, `ad_storage` przyznany,
`analytics_storage` odmówiony). To jest poprawne zachowanie Consent Mode,
a nie obejście: nic nie jest zapisywane w urządzeniu, więc art. 398 Prawa
komunikacji elektronicznej nie jest naruszony.

`NEXT_PUBLIC_GTM_ID` jest ustawione **tylko na Production** (potwierdzone przez
Marka) — dev deployment jest dodatkowo za Vercel Deployment Protection, więc
ruch testowy nie ma jak trafić do GA4 ani Meta.

Zostaje jedno: **zasada organizacyjna** — nowy tag w GTM = wpis
w `cookies-rejestr.ts` + podniesienie `WERSJA_ZGODY` + dopiero potem publikacja
kontenera. Kod tego nie wymusi, bo tagi żyją poza repo (odstępstwo nr 25).

### 4a. Materiał źródłowy — co robić przy zmianie narzędzi

Polityka prywatności **opisuje Google Analytics 4, Meta Pixel i Microsoft
Clarity**. Mechanizm zgód jest już gotowy (sekcja C), ale same narzędzia zaczną
działać dopiero po skonfigurowaniu kontenera GTM i ustawieniu
`NEXT_PUBLIC_GTM_ID`.

Masz dwie drogi, obie poprawne:

- **A (zalecana):** dokończ konfigurację GTM, potem opublikuj politykę.
  Wszystko wchodzi jednym zrzutem i jest spójne.
- **B:** opublikuj politykę teraz, ale **usuń z tabeli cookies i z tabeli
  odbiorców wiersze narzędzi, których ostatecznie nie wdrożysz**.

Bez `NEXT_PUBLIC_GTM_ID` kontener się nie ładuje i żadne z tych trzech narzędzi
nie działa — czyli polityka opisuje wtedy więcej, niż realnie się dzieje.

Czego **nie** wolno: opublikować polityki opisującej GA4, a potem wpiąć tag GA4
w GTM bez ustawienia mu sprawdzenia zgody. To przetwarzanie bez zgody — i baner,
nawet poprawny, tego nie wyłapie.

**Ta sama zasada zadziałała już dwa razy przy pisaniu dokumentów** i warto ją
zapamiętać: dokument opisujący funkcję, której nie ma w kodzie, jest wadliwy
tak samo jak dokument pomijający funkcję, która jest. Z tego powodu usunięto
opis rejestracji przez konto Google (odstępstwo nr 23) i cofnięto publikację
regulaminu newslettera (odstępstwo nr 24).

---

## ✅ Zrobione w tym kroku

| # | Element | Gdzie |
|---|---|---|
| 1 | Regulamin aplikacji (18 §) | `src/lib/prawne/regulamin.ts` → `/regulamin` |
| 2 | Polityka prywatności | `src/lib/prawne/polityka-prywatnosci.ts` → `/polityka-prywatnosci` |
| 3 | Regulamin newslettera — **opublikowany** 2026-08-07 (sekcja D) | `src/lib/prawne/regulamin-newslettera.ts` → `/regulamin-newslettera` |
| 4 | Załącznik nr 1 — umowa powierzenia (B2B) + lista podwykonawców | `dokumenty-prawne/zalacznik-1-umowa-powierzenia.md` |
| 5 | Wzory 4 zgód (checkboxy) | `dokumenty-prawne/wzory-zgod.md` |
| 6 | Wzory 3 wiadomości o zmianie | `dokumenty-prawne/wzory-wiadomosci-o-zmianie.md` |
| 7 | Specyfikacja zgód cookies: wymagania prawne, architektura, konfiguracja GTM, weryfikacja | `dokumenty-prawne/specyfikacja-baner-cookies.md` |
| 8 | Mechanizm zgód cookies w kodzie (baner, panel, Consent Mode v2, kasowanie plików, rejestr narzędzi) | `src/lib/cookies/`, `src/components/cookies/`, `src/lib/prawne/cookies-rejestr.ts` |
| 9 | Stopka z danymi firmy, odnośnikami i przyciskiem „Ustawienia cookies” | `src/components/stopka.tsx` (landing + podstrony prawne) |
| 10 | Dane firmy jako jedno źródło prawdy | `src/lib/prawne/dane.ts` |
| 11 | Checkboxy zgód przy rejestracji i przy zakupie (dwie zgody, oba przyciski zakupu) | `formularz-auth.tsx`, `paywall-dialog.tsx`, `components/prawne/{etykiety-zgod,checkbox-zgody}.tsx`, `components/ui/checkbox.tsx` |
| 12 | Dziennik zgód w bazie (tabela `zgoda`, niezmienny, RLS) — **zastosowana i zweryfikowana na żywej bazie** | `supabase/migrations/20260805103000_zgody.sql`, `src/lib/prawne/zapis-zgody.ts` |
| 13 | Walidacja zgód po stronie serwera przy zakupie | `src/app/api/platnosc/checkout/route.ts` |
| 14 | Instrukcja konfiguracji GTM od zera (kroki 1–10, z tabelą kontrolną tagów) | `dokumenty-prawne/instrukcja-gtm.md` |
| 15 | PDF Regulaminu (parser współdzielony ze stroną WWW) + załączniki w mailu | `components/prawne/regulamin-pdf.tsx`, `lib/prawne/parsuj-dokument.ts`, `lib/mail.ts` |
| 16 | Mail przy utworzeniu konta (Regulamin w PDF) | `src/app/api/konto/powitanie/route.ts` + wywołanie w `formularz-auth.tsx` |
| 17 | Mail przy zakupie (Regulamin w PDF + jawna zgoda nr 2, dwa różne paragrafy dla Odblokowania Jednorazowego i Subskrypcji) | `src/app/api/platnosc/webhook/route.ts` |
| 18 | **Pełny system maili transakcyjnych** — wspólna oprawa + 7 treści z paragrafem Regulaminu przy każdej | `src/lib/maile/{szablon,tresci}.ts` |
| 19 | **Wzory 10 wiadomości obsługiwanych ręcznie** (odstąpienie, reklamacje konsument/przedsiębiorca, DSA: zgłoszenie/decyzja/odwołanie, wypowiedzenie, zmiana usługi, przeniesienie praw, eksport danych) | `dokumenty-prawne/wzory-wiadomosci-o-zmianie.md`, wzory 4–13 |
| 20 | **Zgoda marketingowa (wersja dokumentów 1.1)** — publikacja Regulaminu newslettera, checkbox przy rejestracji, wycofanie w ustawieniach, dziennik zgód, cel nr 12 w polityce, § 4 ust. 20 Regulaminu | sekcja D niżej |

**Poprawione przy okazji:** stopka landingu głosiła *„Twoje dane nie opuszczają
przeglądarki, dopóki nie użyjesz funkcji AI"*. Po przejściu na Supabase
(2026-08-02) to nieprawda — CV zapisane na koncie idzie do bazy przy każdej
zmianie. Na stronie sprzedażowej to informacja handlowa; sprzeczna z polityką
prywatności byłaby ryzykiem wprowadzenia konsumenta w błąd.

---

## 📋 DO ZROBIENIA — kod

Kolejność od najpilniejszego.

### A. Checkboxy zgód — ZROBIONE (checklista prawnika, poz. 5 i 7)

Treści z `wzory-zgod.md`, jedno źródło (`components/prawne/etykiety-zgod.tsx`)
używane w obu miejscach, żeby brzmienie nigdy się nie rozjechało. Checkbox
UI: `components/ui/checkbox.tsx` (shadcn/radix-nova, ten sam wzorzec co
`switch.tsx`). Wszystkie **domyślnie odznaczone**, z aktywnymi linkami
(`target="_blank"`, żeby kliknięcie nie skasowało wypełnianego formularza).

- [x] **Rejestracja** (`formularz-auth.tsx`, ekran `rejestracja`) — zgoda
      regulamin+polityka, wymagana. Przycisk „Załóż konto” jest `disabled`
      bez niej (plus walidacja w `zarejestruj()` jako druga linia obrony).
      Działa identycznie w modalu (`AuthDialog`) i na pełnej trasie
      (`StronaAuth`) — jedna implementacja formularza, patrz komentarz na
      górze pliku. **Od 2026-08-07** przejście rejestracja ↔ logowanie
      odznacza checkbox (`przelaczEkran`) — zgoda nie może „zostać
      zaznaczona" z wcześniejszego kliknięcia w tej samej sesji, tak samo
      jak `resetZgod()` w oknie zakupu.
- [x] **Zakup subskrypcji i odblokowanie jednorazowe**
      (`paywall-dialog.tsx`) — DWA osobne checkboxy (`ZgodyZakupu`): zgoda
      regulamin+polityka ORAZ zgoda na rozpoczęcie usługi przed upływem
      terminu na odstąpienie. Gatują OBA przyciski zakupu (plan i down-sell
      12 zł). Resetowane do stanu odznaczonego przy każdym zamknięciu okna
      (`resetZgod()`) — zgoda nie „zostaje zaznaczona” z poprzedniej wizyty.
- [x] **Utrwalenie zgody nr 2** — `/api/platnosc/checkout` odrzuca żądanie
      (400) bez obu zgód, niezależnie od stanu UI — druga linia obrony na
      wypadek uderzenia w trasę z pominięciem przycisków. Znacznik czasu
      rzeczywistego zaznaczenia leci z klienta (`zgodaZnacznikCzasu`), nie
      jest liczony dopiero na serwerze.
- [x] **Zapis zgód w bazie** — tabela `zgoda` (`user_id`, `rodzaj`,
      `wersja_dokumentow`, `kontekst`, `udzielono_o`), niezmienny dziennik
      (bez UPDATE/DELETE nawet dla właściciela). Zapisuje
      `src/lib/prawne/zapis-zgody.ts` — **nigdy nie rzuca** (wzorzec
      z `lib/mail.ts`): awaria zapisu loguje błąd, ale nie blokuje
      rejestracji ani zakupu. Migracja zastosowana i zweryfikowana na żywej
      bazie (RLS, polityki, brak UPDATE/DELETE) — patrz bloker nr 0 wyżej.

### B. Regulamin w PDF w mailu potwierdzającym — ZROBIONE (checklista prawnika, poz. 1 i 3)

- [x] **Generowanie PDF** — `components/prawne/regulamin-pdf.tsx` (react-pdf,
      `renderToBuffer`), konsumuje TEN SAM parser co strona WWW
      (`lib/prawne/parsuj-dokument.ts`, wydzielony z `dokument-prawny.tsx`) —
      zmiana treści Regulaminu automatycznie trafia do obu miejsc. Font Lato
      z dysku (`path.join(process.cwd(), "public/fonts", …)`, nie
      `/fonts/...` jak w `cv-pdf.tsx` — to działa tylko w przeglądarce).
      Zweryfikowane wizualnie: 15 stron, poprawne polskie znaki, numeracja,
      pogrubienia, linki, paginacja.
- [x] **Załączniki w mailu** — `lib/mail.ts` (`Mail.zalaczniki`, Resend
      `attachments`).
- [x] **Mail przy utworzeniu konta** — `/api/konto/powitanie` (autoryzacja
      sesją, nie treścią żądania), wołane fire-and-forget z
      `formularz-auth.tsx` zaraz po zapisaniu zgody, w OBU ścieżkach
      rejestracji (sesja od razu / po potwierdzeniu kodu z maila).
- [x] **Mail przy zawarciu umowy odpłatnej** — `/api/platnosc/webhook`,
      po udanym upsercie `zakup` (Odblokowanie Jednorazowe) i wyłącznie na
      `customer.subscription.created` (Subskrypcja — nie na `updated`/`deleted`,
      żeby nie wysyłać przy każdym odnowieniu).
- [x] **Zgoda nr 2 wprost w treści**, z DWOMA różnymi paragrafami zależnie od
      produktu — to rozróżnienie jest prawnie istotne, nie kosmetyczne:
      Odblokowanie Jednorazowe cytuje art. 38 ust. 1 pkt 1 (prawo odstąpienia
      przepada po pełnym wykonaniu usługi, Regulamin § 8 ust. 6), Subskrypcja
      cytuje art. 35 (14 dni zostaje, zwrot proporcjonalny, Regulamin § 8
      ust. 7) — wysłanie klientowi subskrypcji informacji, że *nie* ma już
      prawa odstąpienia, byłoby nieprawdziwe i szkodziłoby jemu, nie firmie.
- [ ] **Nie testowane end-to-end na żywym mailu** (rejestracja + realna
      płatność testowa w Stripe sandbox) — PDF zweryfikowany osobno,
      wysyłkę (Resend, adresat, wygląd HTML) sprawdź przy pierwszej okazji.

### C. Baner cookies — ZROBIONE I ZWERYFIKOWANE NA PRODUKCJI (2026-08-07)

> Wyniki testu trzech scenariuszy zgody: bloker nr 4 wyżej. Wszystkie checkboxy
> z listy niżej są odhaczone — zostawiam ją, bo opisuje, CO było do zrobienia
> i czym to sprawdzić przy następnej zmianie w kontenerze.

Mechanizm zgód jest zaimplementowany: baner, panel szczegółowy, przycisk
„Ustawienia cookies” w stopce, Consent Mode v2, kasowanie plików przy wycofaniu
zgody i rejestr narzędzi wspólny dla panelu i tabeli w polityce. Pełny opis:
`specyfikacja-baner-cookies.md`.

Narzędzia idą **dwiema drogami** (decyzja Marka 2026-08-04: tagi w GTM):
Vercel Analytics z kodu, a GA4, Clarity i Meta Pixel jako tagi w kontenerze
Google Tag Managera. Kontener ładuje się dopiero po zgodzie na co najmniej
jedną kategorię opcjonalną — kto odrzuci wszystko, nie wyśle do Google ani
jednego żądania.

**Kontener `GTM-5VGWSSPG` z trzema tagami działa (stan na 2026-08-07).** Pełna
instrukcja od zera, krok po kroku, z dokładnymi ścieżkami klikania:
**`dokumenty-prawne/instrukcja-gtm.md`**. Skrót tego, co tam jest:

- [x] Konto + kontener Web w GTM, identyfikator `GTM-XXXXXXX`.
- [x] `NEXT_PUBLIC_GTM_ID` w env na Vercelu — **TYLKO Production, nie
      Preview** (instrukcja, krok 0): inaczej każde kliknięcie w test na
      preview leci do tych samych danych GA4/Meta co ruch prawdziwych
      użytkowników, ten sam problem co bez `tryb_testowy` przy Stripe.
- [x] Tag GA4 (typ „Google Tag” — respektuje Consent Mode automatycznie,
      bez ręcznych ustawień zgody).
- [x] Tag Microsoft Clarity — **⚠️ Additional Consent Checks →
      `analytics_storage`**, bo Clarity NIE respektuje Consent Mode samo
      z siebie.
- [x] Tag Meta Pixel — **⚠️ Additional Consent Checks → `ad_storage`**
      (ten sam powód), plus wyzwalacz History Change dla `PageView` przy
      nawigacji w aplikacji jednostronicowej.
- [x] **Weryfikacja GTM PRZED publikacją** —
      instrukcja, krok 8; pełna checklista też w `specyfikacja-baner-cookies.md`,
      sekcja 6. Najważniejszy test to wybór mieszany: analityczne TAK,
      marketingowe NIE → `_ga` jest, `_fbp` nie ma.
- [ ] **Zasada organizacyjna:** nowy tag w GTM = wpis w `cookies-rejestr.ts`
      + podniesienie `WERSJA_ZGODY` + dopiero potem publikacja kontenera.
      Od wpięcia GTM dodanie narzędzia przestało być commitem, więc kod już
      tego nie wymusi — patrz odstępstwo nr 25.

### D. Marketing e-mailowy — ZGODA ZBIERANA, WYSYŁKI JESZCZE NIE MA (2026-08-07)

Decyzja Marka z 2026-08-07 zmieniła ustalenie z 4 sierpnia: **formularza zapisu
na stronie nie będzie, ale zarejestrowany użytkownik może wyrazić zgodę na maile
marketingowe.** To jest Newsletter w rozumieniu dokumentów od prawnika, więc
publikacja regulaminu wróciła.

Punkt wejścia nie wymagał przepisania dokumentu: **§ 5 ust. 2 Regulaminu
newslettera dopuszcza złożenie oświadczeń „w jakikolwiek sposób, w szczególności
poprzez wypełnienie elektronicznego formularza"** — formularz jest przykładem,
nie warunkiem zawarcia umowy.

Zrobione:

- [x] **Regulamin newslettera opublikowany** — trasa `/regulamin-newslettera`,
      odnośnik w stopce (instrukcja prawnika, Krok III: osobna podstrona).
- [x] **Checkbox zgody nr 3** przy rejestracji (`etykiety-zgod.tsx`,
      `formularz-auth.tsx`), z aktywnymi linkami do regulaminu newslettera
      i polityki. **NIEOBOWIĄZKOWY** — nie wchodzi do warunku `disabled`
      przycisku „Załóż konto" (zasada wspólna nr 5 z `wzory-zgod.md`) i jest
      osobny od zgody nr 1 (zasada nr 3).
- [x] **Zapis do `profil.zgoda_marketing` + dziennik zgód** —
      `ustawZgodeMarketingowa` w `lib/prawne/zapis-zgody.ts`. Nowe wartości
      enuma `rodzaj_zgody`: `marketing` i `marketing_wycofanie` (migracja
      `20260807120000_zgoda_marketing.sql`). Wycofanie to osobny wpis, bo
      dziennik jest niezmienny.
- [x] **Wycofanie zgody w `/app/ustawienia`** — przełącznik
      (`components/auth/zgoda-marketingowa.tsx`). Art. 7 ust. 3 RODO: wycofanie
      ma być tak łatwe jak udzielenie.
- [x] **Regulamin newslettera w PDF w wiadomości potwierdzającej** (checklista
      prawnika, poz. 42) — mail powitalny dostaje drugi załącznik i akapit
      potwierdzający zapis, ale WYŁĄCZNIE przy udzielonej zgodzie. Trasa
      `/api/konto/powitanie` czyta ją z bazy, nie z treści żądania.
- [x] **Cel przetwarzania nr 12 w polityce prywatności** + Newsletter przy
      Resend w tabeli odbiorców. Bez tego zbieralibyśmy zgodę na cel, którego
      opublikowany dokument nie ujawnia (art. 13 RODO).
- [x] **Regulamin § 4 ust. 20** — nieobowiązkowa zgoda opisana w dokumencie,
      dopisana NA KOŃCU paragrafu (numeracja jest dosłowna, wstawienie
      w środek przesunęłoby wszystkie odesłania).

### ⛔ BLOKER: nie wysyłaj ani jednego maila marketingowego, dopóki nie ma linku rezygnacji

- [ ] **Link rezygnacji w KAŻDEJ wysyłce** — Regulamin newslettera § 5 ust. 7
      pkt 1 obiecuje go wprost, Regulamin § 4 ust. 20 i polityka prywatności
      też. Pierwsza wiadomość bez niego łamie wszystkie trzy dokumenty naraz.
      Zgoda jest już zbierana, więc **ten punkt jest jedyną rzeczą dzielącą Cię
      od legalnej wysyłki** — nie odkładaj go do dnia, w którym będziesz chciał
      wysłać pierwszy mail.
- [ ] Decyzja: własny mechanizm (trasa rezygnacji z tokenem + szablon) czy
      narzędzie zewnętrzne (np. Resend Broadcasts, które niesie własny link
      i obsługę wypisów). Wybór przesądza, ile z tego trzeba pisać.
- [ ] Jeżeli wejdzie narzędzie zewnętrzne — dopisz je do tabeli odbiorców
      w polityce prywatności i zawrzyj z nim umowę powierzenia (art. 28 RODO).

### D2. Maile transakcyjne — ZROBIONE (2026-08-06), zostają dwa warunki

Audyt Regulaminu pod kątem obowiązków informacyjnych wykazał **22 zdarzenia,
przy których musimy się odezwać do klienta**, wobec 2 maili realnie wysyłanych
przez kod. Uzupełnione: 7 maili automatycznych (`src/lib/maile/tresci.ts`)
i 10 wzorów ręcznych. Trzy luki, które realnie szkodziły klientowi:

- [x] **Brak ostrzeżenia o nieudanej płatności.** Webhook nie łapał
      `invoice.payment_failed` w ogóle — klient z wygasłą kartą tracił dostęp
      bez słowa (Regulamin § 5 ust. 7 zapowiada wstrzymanie dostępu, więc
      milczenie było sprzeczne z dokumentem). Dopisany handler + mail.
- [x] **Potwierdzenie zakupu bez kwoty i daty.** § 4 ust. 10 wymaga
      potwierdzenia zawarcia Umowy *wraz z jej treścią*; mail podawał nazwę
      planu i limit, ale ani ceny, ani daty, ani informacji o automatycznym
      odnowieniu (§ 5 ust. 5) i sposobie rezygnacji (§ 5 ust. 6). Kwota bierze
      się teraz **ze zdarzenia Stripe'a, nie ze stałej** — po zmianie cennika
      stała podałaby klientowi nieprawdziwą kwotę.
- [x] **Zgłaszający błąd nie dostawał nic.** Zgłoszenie może być reklamacją
      w rozumieniu § 7, a wtedy biegnie 14-dniowy termin na odpowiedź.
      Deklarujemy krótszy z możliwych terminów (14, nie 21 z § 9) — obiecanie
      konsumentowi 21 dni byłoby wprowadzeniem w błąd.

Przy okazji: **usunięcie konta przeniesione z RPC w przeglądarce na
`/api/konto/usun`**, bo adres e-mail do potwierdzenia trzeba odczytać PRZED
kaskadą czyszczącą `profil` — po `usun_moje_konto` nie ma już skąd go wziąć.

Zostają dwa warunki, oba poza kodem:

- [ ] **⚠️ Striptu → Fakturownia → KSeF musi działać przed pierwszą płatnością
      live.** Oba maile zakupowe zawierają zdanie „Fakturę VAT wyślemy osobną
      wiadomością na ten sam adres e-mail" — to obietnica z § 5 ust. 4.
      W `/api/platnosc/checkout` świadomie NIE MA `invoice_creation` (decyzja
      Marka 2026-08-06: faktury Stripe'a są zbędne, bo Fakturownia sama wysyła
      dokument klientowi i wystawia go do KSeF).
- [ ] **Nie testowane end-to-end na żywej skrzynce.** HTML zweryfikowany
      renderem (`scripts/probne-render-maili.ts`), ale wysyłki przez Resend
      i wyglądu w Gmailu/Outlooku nikt jeszcze nie sprawdził. Najprościej:
      rejestracja na własny adres + płatność testowa w sandboxie.

### E. Drobne

- [ ] **Przycisk eksportu danych w ustawieniach.** RPC `eksportuj_moje_dane`
      istnieje w bazie, ale nie ma go w UI (karta „Twoje dane" została usunięta
      2026-08-04). Dokumenty zostały napisane zgodnie ze stanem faktycznym —
      eksport na żądanie mailowe, w terminie 30 dni. To wystarcza prawnie
      (art. 20 RODO), ale samoobsługowy przycisk oszczędziłby Ci ręcznej obsługi
      każdego żądania. Jeśli go dodasz, popraw brzmienie w regulaminie § 4
      ust. 18 i w polityce („Usunięcie Konta i eksport danych"). *(Odesłanie
      poprawione 2026-08-07 z „ust. 19" — § 4 kończył się wtedy na ust. 18,
      a ust. 19 to od tej daty zgoda marketingowa.)*
- [ ] **Zgoda przy formularzu zgłoszenia błędu** (`/api/zglos-blad`) — tylko
      jeśli formularz jest dostępny dla niezalogowanych.
- [ ] **Wyczyść `.next` po dodaniu tras** (`Remove-Item .next -Recurse -Force`).
      W tym Next nowa trasa działa w sesji, w której powstała, a po restarcie
      dev servera zwraca 404 mimo obecnego pliku.

---

## 📋 DO ZROBIENIA — poza kodem

- [ ] **Rejestr czynności przetwarzania (art. 30 RODO).** Nie ma go w pakiecie
      od prawnika. Zwolnienie dla firm poniżej 250 osób (art. 30 ust. 5) **Cię
      nie obejmuje**, bo przetwarzanie nie ma charakteru sporadycznego —
      przetwarzasz dane każdego użytkownika w sposób ciągły. Rejestr to prosta
      tabela; przy kontroli UODO pytają o niego zaraz po umowach powierzenia.
      Materiał wyjściowy masz gotowy: 12 celów przetwarzania opisanych
      w polityce prywatności to 12 wierszy rejestru.
- [ ] **Ocena skutków dla ochrony danych (DPIA, art. 35 RODO)** — rozważ.
      Przetwarzasz na dużą skalę dane o zatrudnieniu z użyciem AI. Nie jest to
      jednoznacznie objęte wykazem UODO, ale przy rosnącej liczbie użytkowników
      warto mieć krótką analizę w szufladzie.
- [ ] **Procedura na wypadek naruszenia ochrony danych** — 72 godziny na
      zgłoszenie do UODO to bardzo mało, jeśli dopiero wtedy zaczynasz myśleć,
      co zrobić.
- [ ] **Weryfikacja u prawnika punktów spornych** — lista niżej.

---

## ⚖️ Odstępstwa od wzoru — co i dlaczego

Wzór to punkt wyjścia, nie gotowy dokument. Każda poniższa zmiana jest
zamierzona. **Jeśli będziesz konsultował dokumenty z prawnikiem, pokaż mu tę
listę** — to są miejsca, w których warto się upewnić.

| # | Zmiana | Powód |
|---|---|---|
| 1 | Usunięto „Okres Próbny" | Aplikando nie ma triala. Model to darmowy zakres (kreator, PDF) + płatne dopasowanie. |
| 2 | Aktywacja **kodem**, nie linkiem | Wzór opisuje link aktywacyjny; kod używa `verifyOtp` z szablonem `{{ .Token }}`. Regulamin ma opisywać to, co użytkownik widzi na ekranie. |
| 3 | Dodano definicje „Przedsiębiorca" i „Przedsiębiorca na prawach Konsumenta" | Wzór regulaminu aplikacji odwoływał się do nich w §§ 7–9, ale ich nie definiował (były tylko w regulaminie newslettera). Luka wzoru. |
| 4 | Poprawiono odesłanie „Usługodawca — § 1 ust. 3" na „ust. 4" | We wzorze ust. 3 to ustawa o świadczeniu usług drogą elektroniczną, a Usługodawca jest w ust. 4. Błąd wzoru. |
| 5 | „Użytkownik" = każda osoba korzystająca z Aplikacji | Wzór definiował Użytkownika jako *konsumenta*, przez co obowiązki z § 3 nie dotyczyłyby przedsiębiorców. |
| 6 | Ceny **brutto z VAT**, nie netto | Wzór zakłada ceny netto. Kod trzyma ceny brutto, bo konsument ma widzieć kwotę, którą zapłaci. Jesteś czynnym podatnikiem VAT. |
| 7 | **Nie rozszerzono** prawa odstąpienia na przedsiębiorców | Wzór miał gotowy zapis „Usługodawca rozszerza prawo odstąpienia również na Przedsiębiorców". To decyzja biznesowa, nie obowiązek — **potwierdź, czy tak chcesz.** Rozszerzenie oznacza, że firma może kupić roczny plan i zwrócić go w 14 dni. |
| 8 | Rozdzielono skutki odstąpienia: odblokowanie 12 zł vs subskrypcja | Wzór traktował to jednolicie. Odblokowanie jednorazowe jest wykonane w pełni z chwilą wydania raportu (art. 38 ust. 1 pkt 1 → brak prawa odstąpienia), subskrypcja trwa w czasie (prawo zostaje, rozliczenie proporcjonalne, art. 35). |
| 9 | Usunięto mechanizm „Opinii" | Aplikacja nie publikuje opinii o usłudze. Mechanizm zgłaszania treści z DSA zachowany, ale przycięty do Treści Usługobiorcy. |
| 10 | Usunięto sekcję o Inspektorze Ochrony Danych | IOD nie został wyznaczony. Komentarz prawnika nr 10: „IOD na niby to proszenie się o kłopot". |
| 11 | Usunięto moduł „Analiza aktywności" jako osobny cel na art. 6 ust. 1 lit. f | Analityka wchodzi przez cookies, więc podstawą jest **zgoda** (lit. a), nie uzasadniony interes. Profilowanie opisano jako oparte na zgodzie i wyraźnie wyłączono z niego treść CV. |
| 12 | Dodano sekcję „Dane szczególnych kategorii" | Nie ma jej we wzorze, a CV bywa pełne danych z art. 9 RODO (orzeczenie o niepełnosprawności, przynależność związkowa). Sekcja porządkuje podstawę (art. 9 ust. 2 lit. a) i stwierdza, że zdjęcie nie jest daną biometryczną. |
| 13 | Konkretni odbiorcy zamiast „firma hostingowa" | Komentarz prawnika nr 27 i wskazówka nr 9 z instrukcji: kategorie + nazwy dostawców. |
| 14 | Transfer poza EOG: DPF + SCC zamiast listy 16 państw Google | Wzór wymieniał państwa właściwe dla Google Analytics. Aplikando korzysta z sześciu dostawców, więc opis jest ogólny, ale prawdziwy. **Zweryfikuj aktywność certyfikacji DPF** — patrz bloker nr 3. |
| 15 | Podstawa cookies: **art. 398 Prawa komunikacji elektronicznej** | Instrukcja prawnika powołuje art. 173 Prawa telekomunikacyjnego, uchylony 10 listopada 2024 r. Treść obowiązku bez zmian. |
| 16 | § 11 AI napisany pod realny pipeline | Wzór jest ogólny. Wpisano: konkretny dostawca (Google Gemini), zakres ingerencji (tylko podsumowanie, punkty, kolejność umiejętności), dane twarde kopiowane bez zmian, walidator anty-halucynacyjny, kategoria ryzyka wg AI Act. |
| 17 | Wyraźnie: **nie jesteś systemem wysokiego ryzyka** wg zał. III pkt 4 AI Act | Aplikando to narzędzie **dla kandydata**, nie dla pracodawcy — nie ocenia ani nie szereguje kandydatów. To najważniejsza kwalifikacja prawna w całym dokumencie i warto ją mieć zapisaną, zanim ktoś zapyta. **Punkt do potwierdzenia u prawnika.** |
| 18 | Usunięto „dostęp do danych przez 90 dni po zakończeniu umowy" | Kod tego nie robi — `usun_moje_konto` kasuje kaskadowo od razu. Zastąpione prawdziwym opisem + zaleceniem pobrania kopii przed usunięciem. |
| 19 | Usunięto opcjonalne SLA (99,5% itd.) | Nie ma takiego zobowiązania w kodzie ani w infrastrukturze. Dodaj, gdy zaczniesz sprzedawać do większych firm B2B. |
| 20 | § 13 ust. 5: własność intelektualna **nie obejmuje CV użytkownika** | Wzór tego nie mówił wprost, a przy narzędziu do tworzenia dokumentów to pierwsze pytanie, jakie zada rozsądny użytkownik. |
| 21 | Umowa powierzenia: przetwarzanie **tylko cyfrowe** | Wzór mówił „oraz w formie papierowej". Nieprawda dla Aplikanda. |
| 22 | Umowa powierzenia: dodano Załącznik nr 2 z listą podwykonawców | Wzór miał ogólną zgodę na podpowierzenie bez listy. Każdy klient B2B i tak o nią zapyta. |
| 23 | ~~Usunięto rejestrację przez konto Google~~ → **COFNIĘTE 2026-08-07**: opis wrócił do Regulaminu (§ 4 ust. 19), Polityki (cel nr 1 + tabela odbiorców) i Załącznika nr 2 | Decyzja Marka 2026-08-07: funkcja zostanie włączona jeszcze przed startem, więc dokumenty opisują docelowy stan. **Odwrócona kolejność względem zasady „dokument opisuje to, co jest" — świadomie i na czas określony.** Dopóki `signInWithOAuth` nie pojawi się w `src/`, dokumenty wyprzedzają kod; patrz bloker nr 5. |
| 24 | ~~Cofnięto publikację regulaminu newslettera~~ → **COFNIĘTE 2026-08-07**: regulamin z powrotem opublikowany, moduł newslettera wrócił do polityki jako cel nr 12 | Decyzja Marka 2026-08-04 („newslettera nie ma") została zawężona 2026-08-07: formularza zapisu na stronie nadal nie będzie, ale zarejestrowany użytkownik może wyrazić zgodę na maile marketingowe — a to jest Newsletter w rozumieniu dokumentów. Punkt wejścia nie wymagał zmiany treści: § 5 ust. 2 regulaminu newslettera dopuszcza złożenie oświadczeń „w jakikolwiek sposób", a formularz podaje jako przykład. Sekcja D powyżej. |
| 25 | Narzędzia analityczne i marketingowe wpięte przez **Google Tag Manager**, a nie ładowane pojedynczo z kodu | Decyzja Marka 2026-08-04. Konsekwencje: (a) GTM dopisany do odbiorców w polityce i do sekcji „Pliki cookies” (ust. 7), (b) Consent Mode sam nie wystarcza — Meta Pixel i Clarity wymagają „Dodatkowych sprawdzeń zgody” w panelu GTM, (c) **tagi żyją poza repo**, więc `cookies-rejestr.ts` przestał być technicznie wymuszalnym źródłem prawdy i zastępuje go zasada organizacyjna. Vercel Analytics świadomie ZOSTAJE w kodzie — jego skrypty są pierwszostronne (`/_vercel/...`), a przeniesienie do GTM zamieniłoby żądanie pierwszostronne na trzeciostronne do Google. |

---

## 🔍 Pytania do prawnika (jeśli będziesz konsultował)

1. **Kwalifikacja wg AI Act** (odstępstwo nr 17) — czy narzędzie do redagowania
   CV używane przez kandydata na pewno nie wpada w załącznik III pkt 4?
   Argument: nie jest udostępniane pracodawcom i nie ocenia kandydatów.
2. **Rozszerzenie prawa odstąpienia na przedsiębiorców** (odstępstwo nr 7) —
   zostawić wyłączone?
3. **Art. 38 ust. 1 pkt 1 vs pkt 13** przy odblokowaniu jednorazowym
   (odstępstwo nr 8) — czy dopasowanie to „usługa" wykonana w pełni, czy
   „treść cyfrowa"? Przyjęto wykładnię usługową, zgodną z brzmieniem wzoru zgody.
4. **Dane szczególnych kategorii w treści CV** (odstępstwo nr 12) — czy
   „dobrowolne wprowadzenie do aplikacji" wystarcza za wyraźną zgodę z art. 9
   ust. 2 lit. a, czy potrzebny osobny checkbox?
5. **Rejestr czynności przetwarzania** — potwierdzenie, że zwolnienie z art. 30
   ust. 5 nie ma zastosowania.

---

## 📄 Checklista prawnika — stan realizacji

Odwzorowanie pliku „4 Checklista wdrożenia - dokumenty SaaS".

| Poz. | Zadanie | Status |
|---|---|---|
| 1 | Uzupełnienie wzoru regulaminu | ✅ |
| 1 | Regulamin na dedykowanej podstronie | ✅ `/regulamin` |
| 1 | Aktywne linki do regulaminu w treści zgód | ✅ sekcja A |
| 1 | Regulamin w PDF w mailu potwierdzającym | ✅ sekcja B (niepotwierdzone end-to-end na żywym mailu) |
| 2 | Umowa powierzenia — uzupełnienie wzoru | ✅ + Załącznik nr 2 |
| 3 | Regulamin newslettera — uzupełnienie | ✅ |
| 3 | Regulamin newslettera na podstronie | ✅ `/regulamin-newslettera` |
| 3 | Aktywny link w treści zgody na newsletter | ✅ sekcja D |
| 3 | Regulamin newslettera w PDF w mailu | ✅ sekcja D (w mailu powitalnym, gdy zgoda udzielona) |
| 4 | Polityka prywatności — uzupełnienie | ✅ |
| 4 | Polityka na dedykowanej podstronie | ✅ `/polityka-prywatnosci` |
| 4 | Aktywne linki do polityki w treści zgód | ✅ sekcja A |
| 4 | Mechanizm informowania o cookies | ✅ kod gotowy, czeka na konfigurację GTM (sekcja C) |
| 5 | Zgoda na regulamin i politykę w formularzach | ✅ sekcja A (rejestracja + zakup) |
| 5 | Aktywne linki we wdrożonych zgodach | ✅ sekcja A |
| 5 | Checkboxy domyślnie odznaczone | ✅ sekcja A |
| 6 | Zgoda przy formularzu kontaktowym | ⬜ sekcja E (jeśli dotyczy) |
| 7 | Zgoda marketingowa — uzupełnienie | ✅ |
| 7 | Zgoda w formularzu zapisu do newslettera | ✅ w formularzu REJESTRACJI — formularza zapisu nie ma i nie będzie (sekcja D) |
| 7 | Aktywne linki w zgodzie marketingowej | ✅ regulamin newslettera + polityka |
| 7 | Checkbox domyślnie odznaczony | ✅ i **nieobowiązkowy** — nie blokuje rejestracji |
| 7 | Link rezygnacji w każdej wysyłce | ⛔ **BLOKER WYSYŁKI** (sekcja D) |
| — | Zgoda na dostarczanie usługi przed odstąpieniem (Krok V instrukcji) | ✅ sekcja A |

---

## Jak utrzymywać te dokumenty

1. **Dane firmy zmieniasz w jednym miejscu:** `src/lib/prawne/dane.ts`.
   Regulamin, polityka, regulamin newslettera i stopka biorą je stamtąd.
2. **Zmieniasz flow, ceny, dostawcę AI albo listę dostawców → zmieniasz dokument
   w TYM SAMYM commicie.** Ta sama zasada, co dla `STRUKTURA.md`.
3. **Każda zmiana treści:** podnieś `WERSJA_DOKUMENTOW`, ustaw nową
   `DATA_OBOWIAZYWANIA` i wyślij wiadomość ze wzoru
   (`wzory-wiadomosci-o-zmianie.md`) z wyprzedzeniem 10 dni (regulamin),
   7 dni (newsletter) albo 30 dni (zmiana ceny aktywnej subskrypcji).
4. **Zachowuj poprzednie wersje.** Regulamin § 17 ust. 3: do umów zawartych
   przed zmianą stosuje się poprzednie brzmienie — musisz umieć je odtworzyć.
   Historia gita to załatwia, pod warunkiem że wiesz, który commit odpowiada
   której wersji. Oznaczaj je tagiem, np. `regulamin-v1.0`.
