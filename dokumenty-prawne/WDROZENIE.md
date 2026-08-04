# Wdrożenie dokumentów prawnych — Aplikando

Stan na 4 sierpnia 2026. Podstawa: pakiet Creativa Legal (pliki 1–4 + wzory),
zestawiony z rzeczywistym kodem aplikacji.

**Dane, na których oparto dokumenty:** Marko Nowak, firma Markonn Marko Nowak,
ul. Mariana Maliny 5a/17, 41-200 Sosnowiec, CEIDG, NIP 6443568932,
REGON 522854985, e-mail marko@aplikando.pl, aplikacja Aplikando (aplikando.pl),
czynny podatnik VAT, ceny brutto 29 / 49 / 12 zł.

---

## ⛔ BLOKERY — załatw PRZED publikacją

Bez tych czterech rzeczy nie publikuj dokumentów. Każda z nich powoduje, że
opublikowany dokument byłby nieprawdziwy albo bezskuteczny.

### 1. Skrzynka marko@aplikando.pl musi działać

Ten adres stoi w regulaminie, polityce prywatności, regulaminie newslettera
**i jako punkt kontaktowy DSA**. Adres, na który nikt nie odbiera, to nie
formalność: art. 11 DSA wymaga punktu kontaktowego dla organów, a art. 12 —
dla użytkowników. Do tej skrzynki trafiają też reklamacje (termin 14 dni),
żądania RODO (termin 1 miesiąca) i zgłoszenia treści niedozwolonych.

Sprawdź też, czy `MAIL_OD` i `MAIL_ZGLOSZENIA` w env wskazują na tę domenę.

### 2. Zweryfikuj tier Google Gemini API — to realne ryzyko RODO

Regulamin § 11 ust. 6 i Polityka prywatności stwierdzają, że dane wprowadzone
do Aplikacji **nie są wykorzystywane do trenowania modeli AI**.

To jest prawda **tylko dla płatnego tieru Gemini API**. Na darmowym tierze
(klucz z AI Studio) Google zastrzega sobie prawo wykorzystania promptów
i odpowiedzi do ulepszania produktów, a treść CV to komplet danych osobowych
kandydata — imię, nazwisko, kontakt, historia zatrudnienia.

**Co zrobić:** wejdź w Google Cloud / AI Studio, sprawdź, czy projekt powiązany
z `GOOGLE_GENERATIVE_AI_API_KEY` ma włączone rozliczanie i działa na płatnym
tierze. Jeżeli nie — włącz je przed publikacją albo usuń to zdanie z obu
dokumentów (co jednak oznaczałoby, że musisz jawnie napisać, że dane idą
do trenowania — a to zabije produkt).

### 3. Podpisz umowy powierzenia z dostawcami (art. 28 RODO)

Polityka prywatności stwierdza: *„Z każdym z ww. podmiotów, który przetwarza
dane osobowe w imieniu Administratora, zawarta została umowa powierzenia
przetwarzania danych osobowych zgodna z art. 28 RODO."* To musi być prawda
w dniu publikacji.

| Dostawca | Gdzie zaakceptować DPA |
|---|---|
| Vercel | ustawienia zespołu → Legal / Privacy → Data Processing Addendum |
| Supabase | Dashboard → Organization Settings → Legal Documents |
| Stripe | DPA wchodzi w skład Services Agreement — pobierz i zachowaj kopię |
| Google (Gemini API) | Cloud Data Processing Addendum — akceptacja w Google Cloud Console |
| Resend | Dashboard → Settings → Legal / DPA |
| Microsoft (Clarity) | Microsoft Products and Services DPA |
| Meta (Pixel) | Business Tools Terms + Controller-to-Controller Addendum |
| Biuro rachunkowe | zwykła umowa powierzenia na papierze |

Zachowaj PDF-y w jednym miejscu. Przy kontroli UODO to pierwsza rzecz, o którą
zapytają. Przy okazji sprawdź na `dataprivacyframework.gov`, którzy dostawcy mają
**aktywną** certyfikację DPF — od tego zależy poprawność sekcji „Przekazywanie
danych do państwa trzeciego" i Załącznika nr 2 do umowy powierzenia.

### 4. Zsynchronizuj politykę z narzędziami analitycznymi

Polityka prywatności **opisuje Google Analytics 4, Meta Pixel i Microsoft
Clarity**, których jeszcze nie ma w kodzie (`package.json` nie zawiera nawet
`@vercel/analytics` — istnieje tylko gałąź `vercel/install-vercel-web-analytics-nq7u2q`).

Masz dwie drogi, obie poprawne:

- **A (zalecana):** wdróż baner cookies razem z narzędziami, potem opublikuj
  politykę. Wszystko wchodzi jednym zrzutem i jest spójne.
- **B:** opublikuj politykę teraz, ale **usuń z tabeli cookies i z tabeli
  odbiorców wiersze narzędzi, których nie ma**, i dopisz je przy wdrażaniu.

Czego **nie** wolno: opublikować polityki opisującej GA4 i wdrożyć GA4 tydzień
później bez banera. To przetwarzanie bez zgody.

---

## ✅ Zrobione w tym kroku

| # | Element | Gdzie |
|---|---|---|
| 1 | Regulamin aplikacji (18 §) | `src/lib/prawne/regulamin.ts` → `/regulamin` |
| 2 | Polityka prywatności | `src/lib/prawne/polityka-prywatnosci.ts` → `/polityka-prywatnosci` |
| 3 | Regulamin newslettera | `src/lib/prawne/regulamin-newslettera.ts` → `/regulamin-newslettera` |
| 4 | Załącznik nr 1 — umowa powierzenia (B2B) + lista podwykonawców | `dokumenty-prawne/zalacznik-1-umowa-powierzenia.md` |
| 5 | Wzory 4 zgód (checkboxy) | `dokumenty-prawne/wzory-zgod.md` |
| 6 | Wzory 3 wiadomości o zmianie | `dokumenty-prawne/wzory-wiadomosci-o-zmianie.md` |
| 7 | Specyfikacja banera cookies + prompt dla agenta | `dokumenty-prawne/specyfikacja-baner-cookies.md` |
| 8 | Stopka z danymi firmy i odnośnikami | `src/components/stopka.tsx` (landing + podstrony prawne) |
| 9 | Dane firmy jako jedno źródło prawdy | `src/lib/prawne/dane.ts` |

**Poprawione przy okazji:** stopka landingu głosiła *„Twoje dane nie opuszczają
przeglądarki, dopóki nie użyjesz funkcji AI"*. Po przejściu na Supabase
(2026-08-02) to nieprawda — CV zapisane na koncie idzie do bazy przy każdej
zmianie. Na stronie sprzedażowej to informacja handlowa; sprzeczna z polityką
prywatności byłaby ryzykiem wprowadzenia konsumenta w błąd.

---

## 📋 DO ZROBIENIA — kod

Kolejność od najpilniejszego.

### A. Checkboxy zgód (checklista prawnika, poz. 5 i 7)

Treści gotowe w `wzory-zgod.md`. Wszystkie domyślnie odznaczone, z aktywnymi
linkami.

- [ ] **Rejestracja** (`src/components/auth/formularz-auth.tsx`, ekran
      `rejestracja`) — zgoda nr 1 (regulamin + polityka), wymagana. Blokuje
      przycisk, dopóki niezaznaczona. Dotyczy też rejestracji przez Google.
- [ ] **Zakup subskrypcji i odblokowanie jednorazowe**
      (`src/components/builder/paywall-dialog.tsx` → `/api/platnosc/checkout`) —
      zgoda nr 1 **oraz** zgoda nr 2 (rozpoczęcie świadczenia przed upływem
      terminu na odstąpienie). Dwa osobne checkboxy.
- [ ] **Utrwalenie zgody nr 2** — bez tego jest bezskuteczna. Zapisz fakt,
      wersję treści i znacznik czasu przy rekordzie `zakup` / `subskrypcja`
      (albo w `metadata` sesji Stripe, skąd webhook przeniesie to do bazy).
- [ ] **Zapis zgód w bazie** — art. 7 ust. 1 RODO nakłada na Ciebie ciężar
      dowodu, że zgoda została udzielona. Potrzebna tabela albo kolumny:
      identyfikator użytkownika, rodzaj zgody, wersja treści, data i godzina.

### B. Regulamin w PDF w mailu potwierdzającym (checklista prawnika, poz. 1 i 3)

- [ ] Generowanie PDF z treści w `src/lib/prawne/*.ts` (w repo jest już
      `@react-pdf/renderer` — ten sam mechanizm co eksport CV).
- [ ] Załącznik do maila potwierdzającego **utworzenie konta** oraz
      **zawarcie umowy odpłatnej** (`src/lib/mail.ts`).
- [ ] Załącznik z regulaminem newslettera do maila potwierdzającego zapis.
- [ ] W potwierdzeniu zamówienia napisz wprost, że użytkownik udzielił zgody
      nr 2 i jaki jest tego skutek (art. 15 ust. 1 ustawy o prawach konsumenta —
      potwierdzenie na trwałym nośniku domyka utratę prawa odstąpienia).

### C. Baner cookies

- [ ] Wdrożenie wg `specyfikacja-baner-cookies.md`. Gotowy prompt do wklejenia
      w osobnym agencie jest na końcu tego pliku, w sekcji 5.
- [ ] Po wdrożeniu: usuń komentarz `⚠️ DO DODANIA RAZEM Z BANEREM COOKIES`
      ze `src/components/stopka.tsx` i dodaj przycisk „Ustawienia cookies".

### D. Newsletter

Regulamin newslettera jest opublikowany, ale formularza zapisu nie ma.

- [ ] Formularz zapisu (pole e-mail + checkbox zgody nr 3).
- [ ] Zapis do `profil.zgoda_marketing` (kolumna i grant już istnieją).
- [ ] **Link rezygnacji w KAŻDYM wysłanym newsletterze** — regulamin § 5 ust. 8
      pkt 1 to obiecuje, a bez tego wysyłka jest niezgodna z prawem.
- [ ] Mail potwierdzający zapis z regulaminem w PDF.

Do czasu wdrożenia formularza regulamin newslettera opisuje usługę, której nie
ma. Nie jest to naruszenie (nikt nie może się zapisać), ale wygląda nieporządnie —
rozważ publikację tej podstrony dopiero razem z formularzem.

### E. Drobne

- [ ] **Przycisk eksportu danych w ustawieniach.** RPC `eksportuj_moje_dane`
      istnieje w bazie, ale nie ma go w UI (karta „Twoje dane" została usunięta
      2026-08-04). Dokumenty zostały napisane zgodnie ze stanem faktycznym —
      eksport na żądanie mailowe, w terminie 30 dni. To wystarcza prawnie
      (art. 20 RODO), ale samoobsługowy przycisk oszczędziłby Ci ręcznej obsługi
      każdego żądania. Jeśli go dodasz, popraw brzmienie w regulaminie § 4
      ust. 19 i w polityce („Usunięcie Konta i eksport danych").
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
| 1 | Aktywne linki do regulaminu w treści zgód | ⬜ czeka na checkboxy (sekcja A) |
| 1 | Regulamin w PDF w mailu potwierdzającym | ⬜ sekcja B |
| 2 | Umowa powierzenia — uzupełnienie wzoru | ✅ + Załącznik nr 2 |
| 3 | Regulamin newslettera — uzupełnienie | ✅ |
| 3 | Regulamin newslettera na podstronie | ✅ `/regulamin-newslettera` |
| 3 | Aktywny link w treści zgody na newsletter | ⬜ czeka na formularz (sekcja D) |
| 3 | Regulamin newslettera w PDF w mailu | ⬜ sekcja B |
| 4 | Polityka prywatności — uzupełnienie | ✅ |
| 4 | Polityka na dedykowanej podstronie | ✅ `/polityka-prywatnosci` |
| 4 | Aktywne linki do polityki w treści zgód | ⬜ sekcja A |
| 4 | Mechanizm informowania o cookies | ⬜ sekcja C |
| 5 | Zgoda na regulamin i politykę w formularzach | ⬜ sekcja A |
| 5 | Aktywne linki we wdrożonych zgodach | ⬜ sekcja A |
| 5 | Checkboxy domyślnie odznaczone | ⬜ sekcja A |
| 6 | Zgoda przy formularzu kontaktowym | ⬜ sekcja E (jeśli dotyczy) |
| 7 | Zgoda marketingowa — uzupełnienie | ✅ treść gotowa |
| 7 | Zgoda w formularzu zapisu do newslettera | ⬜ sekcja D |
| 7 | Aktywne linki w zgodzie marketingowej | ⬜ sekcja D |
| 7 | Checkbox domyślnie odznaczony | ⬜ sekcja D |
| — | Zgoda na dostarczanie usługi przed odstąpieniem (Krok V instrukcji) | ⬜ sekcja A |

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
