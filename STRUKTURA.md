# STRUKTURA — Aplikando (mapa projektu dla AI)

> **Ten plik jest auto-wczytywany co sesję (przez `@import` w CLAUDE.md).** Ma dać
> pełny kontekst BEZ przeszukiwania repo. **Aktualizuj go w tym samym commicie, w
> którym zmieniasz architekturę / dodajesz plik / zmieniasz przepływ danych.**
> Jeśli coś tu nie zgadza się z kodem — kod ma rację, popraw ten plik.

## Czym jest aplikacja

MVP SaaS: dopasowuje/poprawia CV pod konkretną ofertę pracy, rynek PL (RODO, ton
stonowany bez amerykańskiego hype'u, B2B/UoP, ATS). Marka/nazwa użytkownika:
**Aplikando** (zmieniona z „CV Copilot PL" 2026-07-30) — logo `public/aplikando-icon.png`
(przezroczyste tło, ikona „A" z gradientem niebiesko-zielonym + papierowy samolot,
wycięta z pełnego lockupu klienta techniką alpha-key „255 minus min(R,G,B)", żeby
biały bakground znikł bez halo na krawędziach) + favicon `src/app/favicon.ico`
(wygenerowany z tej samej ikony, multi-size 16–256px). Folder repo pozostaje
`cv-copilot/` (techniczna nazwa repo/paczki npm — NIE zmieniana, to nie jest to
samo co widoczna marka) — repo git tu, nie w `Projekt CV/` (screenshoty/PDF-y/
pakiety wiedzy są poza repo).

**ZASADA NACZELNA (nienaruszalna): AI NIE tworzy treści CV.** AI wybiera,
porządkuje i przeformułowuje fakty, które podał użytkownik. Żadnych zmyślonych
liczb, technologii, firm, stanowisk, poziomów języka. Gwarancją nie jest prompt,
tylko KOD (walidator + straż przepisywania + deterministyczny matcher).

**UI (nienaruszalne): styl Spotify, dark-only.** Tła #121212/#181818/#1f1f1f,
jedyny akcent zieleń #1ed760 (tylko funkcjonalnie: CTA, stany aktywne), przyciski
pill `rounded-full` uppercase, ciężkie cienie, bez szarych ramek, font Figtree.
Dokument CV zachowuje granatowy akcent #0057D9 (nie zielony). Użytkownik edytuje
tylko treść, nie layout.

**POZYCJONOWANIE (decyzja Marka 2026-07-28): główny selling point to „CV czytelne
dla systemów rekrutacyjnych (ATS)" — ale dotyczy on WSZYSTKICH szablonów, nie
podzbioru.** Nie robimy dwóch trybów („pod ATS" vs „zwykłe CV"): szablon to czysto
wizualna warstwa, ten sam `TailoredCv` renderuje każdy układ, więc silnik AI jest
od tego całkowicie niezależny. Rozważane wcześniej ukrycie układów ze zdjęciem
zostało ODRZUCONE — one też przechodzą test ATS, więc zubażanie oferty nic by nie
dało. Obietnica ATS stoi jako `ATS_OBIETNICA` w `cv-templates.ts` (jedno źródło
tekstu) i jest pokazywana NAD kategoriami galerii, a kategorie mówią wyłącznie
o tym, co realnie różni układy (ze zdjęciem / bez zdjęcia).

**Szablony mają wyglądać DOBRZE DLA CZŁOWIEKA — to rekruter je ogląda.** Układy
wielokolumnowe i zdjęcia są w pełni dozwolone (od 2026-07-27: `boczny`). Zgodność
z systemami rekrutacyjnymi zapewniamy nie przez zubażanie wyglądu, tylko przez
**kolejność tekstu w strumieniu PDF**: nazwisko, podsumowanie i doświadczenie MUSZĄ
iść przed panelem bocznym. W układzie dwukolumnowym osiąga się to przez
`flexDirection: "row-reverse"` + kolumnę główną PIERWSZĄ w drzewie (wizualnie panel
dalej jest po lewej). Zweryfikowane ekstrakcją tekstu z gotowego PDF-a.
Pozostałe zasady: prawdziwy tekst (nigdy grafika), bez tabel, bez nagłówków
i stopek stron.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (radix) ·
Zustand 5 (persist w localStorage) · Zod 4 · AI SDK `ai` **v7** (`generateObject`,
`system`→**`instructions`**) · `@ai-sdk/google` · `@react-pdf/renderer` (eksport
PDF **oraz podgląd** — jeden renderer, patrz „Konwencje i pułapki") ·
`pdfjs-dist` (rysowanie stron PDF na kanwie podglądu; worker kopiowany
z `node_modules` do `public/pdfjs/` przez `scripts/kopiuj-worker-pdfjs.mjs`
w `predev`/`prebuild` — pdf.js wymaga ZGODNOŚCI wersji API i workera, więc plik
nie leży w repo) · `unpdf`+`mammoth` (import PDF/DOCX). **AGENTS.md: to nie jest
znany Next — czytaj `node_modules/next/dist/docs/` przed pisaniem kodu Next.**

## Silnik AI — pipeline (SERCE aplikacji)

Wejście: `uruchomDopasowanie(baseCv, trescOferty, opcje?)` w `src/lib/ai/pipeline.ts`.
`opcje` (`OpcjeDopasowania`, opcjonalne): `oryginalCv` — CV sprzed wywiadu; gdy
podane, wynik „przed" i opis zmian liczone są względem NIEGO (na re-runie widać
skumulowaną poprawę 61→89, nie chwilowe „+0"). `obsluzonePytania` — id pytań już
obsłużonych w sesji; pipeline je odfiltrowuje, więc pętla wywiadu zbiega do 0
(bez tego te same pytania wracały bez końca). `oferta` — sparsowana oferta z
wcześniejszej rundy; gdy podana, pipeline POMIJA `parsujOferte` (AI), więc
wymagania są identyczne co rundę → wynik „przed"/„po" nie drga z niedeterminizmu
modelu, a koszt spada. Trasa `/api/dopasuj` zwraca `oferta`, a `tailor-flow`
odsyła ją przy re-runie (`ofertaRef`, czyszczone przy nowej analizie).
Kolejność (co AI / co KOD):

1. **oferta → wymagania z wagami** — AI, tani model — `job-offer.ts` (`parsujOferte`)
2. **CV → rejestr faktów** — KOD — `fact-ledger.ts` (`buildLedgerFromCv`) = jedyne źródło prawdy
3. **dopasowanie fakt↔wymaganie → wynik pokrycia** — KOD — `matching.ts` (`dopasuj`); zarazem plan zmian; używa `slownik.ts` (kuratowana wiedza branżowa + odmiana PL + granice słowa, żeby „Java"≠„JavaScript")
4. **przepisanie zmiennych części CV** — AI, mocny model — `rewrite.ts` (`przepiszCv` → `zlozCv`). Model dotyka TYLKO: podsumowania, punktów doświadczenia/projektów, kolejności umiejętności. Dane twarde (firmy, stanowiska, okresy, edukacja, języki, dane osobowe) kopiowane z oryginału w kodzie — model ich nie zwraca.
5. **walidacja anty-halucynacyjna** — KOD — `validator.ts` (`validateAgainstLedger`). Odrzuca: wymyślone liczby, umiejętności, firmy, stanowiska, podniesiony poziom języka, frazesy. `pipeline.naprawCv()` cofa do oryginału TYLKO odrzucone fragmenty (nie całe CV).
6. **wynik „po" tym samym miernikiem** — KOD — `matching.ts` ponownie
6b. **rubryka oceny 0–100** — KOD — `scoring.ts` (`ocenCv`) → `aiMeta.scoreBreakdown` (przed/po na 9 ważonych kryteriach; wynik = suma, więc uzasadnialny i powtarzalny)
7. **opis zmian + wskazówki** — KOD — `changes.ts` (`opiszZmiany` = „Co zmieniliśmy i dlaczego" z realnego diffa; `zbudujWskazowki` = findings edukacyjne). Straże anty-fantomowe: `znormalizuj` pomija interpunkcję/wielkość liter, więc kosmetyka (usunięta kropka, „.”→„!”) NIE jest raportowana jako poprawka; kolejność umiejętności raportowana TYLKO gdy wymagane z oferty realnie poszły w górę (i z ich nazwami), nie ze sztywnego szablonu; podsumowanie „wyeksponowaliśmy X" tylko dla wymagań faktycznie nowych vs wersja „przed"; dodane punkty (z wywiadu) opisywane jako „dodaliśmy".
**WYWIAD UZUPEŁNIA, NIGDY NIE NADPISUJE (2026-08-02, feedback Marka).** Odpowiedź
na pytanie o skalę jest DOKLEJANA do punktu w znaczniku `⟦uzupełnienie kandydata: …⟧`,
a scala ją model w kroku 4 — łączy oba fakty w jedno zdanie, poprawia literówki
i polskie znaki, a gdy odpowiedź nie wnosi nowego faktu („regularnie to robiłem"),
zostawia oryginał. Wcześniej odpowiedź ZASTĘPOWAŁA punkt, jeśli miała ≥10 znaków —
bez sprawdzania, czy zawiera liczbę. Odtworzone na realnej sesji: „Przeprowadziłem
projekty komunikacyjne dla marek: Intel, LG, Xbox oraz ESL" → „Bylo wiele roznych
prijektow, tak.", „Zarządzałem procesem tworzenia treści…" → „Regularnie to robilem."
Cztery z pięciu punktów wychodziły z wywiadu GORSZE, z literówkami, i szły tak do
pracodawcy. `usunZnacznikiUzupelnien` czyści znacznik na KAŻDEJ drodze wyjścia
(podłoga wyniku, naprawa po walidatorze, brak klucza API) zostawiając nietknięty
oryginał — najgorszy możliwy wynik wywiadu to „bez zmian". W pipeline służy do tego
`bazaCzysta`: `baseCv` ze znacznikami idzie do rejestru faktów i do modelu, ale
wszystkie ścieżki awaryjne cofają do wersji czystej.

**Bez limitu pytań, wywiad RAZ na analizę** (decyzja Marka 2026-08-02): zniesione
`MAX_PYTAN=5`, `maxPozycje=3` i `.slice(0,8)` w pipeline; `wywiadUzytyRef`
w `tailor-flow` nie proponuje kolejnej tury. Nie pytamy o punkty, które konkret już
mają — `maJuzKonkret` odsiewa liczby ORAZ wyliczenia nazw własnych (3+ wyrazów
z wielkiej litery w środku zdania), bo „projekty dla marek: Intel, LG, Xbox, ESL"
jest konkretny, tylko konkretem są marki. Etykiety przycisków idą za pytaniem
(„Podam / Nie wiem" przy skali, „Mam to / Nie mam" przy kompetencji).

+ **wywiad** — KOD — `interview.ts` (`zbudujPytania` z luk oferty — każde pytanie niesie `kontekst`, czyli DOSŁOWNY cytat z ogłoszenia (`wymaganie.cytat`), pokazywany pod pytaniem w `tailor-flow`, bo zwięzłe wymaganie („Docker") wyrwane z kontekstu nie mówi, o jaki zakres pyta pracodawca; `zbudujPytaniaOMetryki` z punktów bez liczby — cytuje CAŁY punkt (helper `cytat`, limit 220 znaków i cięcie na granicy słowa), bo dawne ucinanie po 60 znakach gubiło sens: „…oraz współprace z influ…"; `zastosujOdpowiedzi` nakłada potwierdzone odpowiedzi na KOPIĘ CV, z deduplikacją dopinanych punktów → ponowny pipeline → wynik rośnie uczciwie). Domknięcie pętli: `tailor-flow` kumuluje id wszystkich pokazanych pytań (`obsluzoneRef`) i podaje je do pipeline przez `obsluzonePytania`; świeża analiza (`nowaAnaliza`)/`resetFlow` czyszczą ten zbiór.

Straże jakości: `rewrite.zgubionoLiczbe()` (metryka z oryginału nie może zniknąć),
`rewrite.zgubionoSlowoKluczowe()` (trafione słowo z oferty nie może zniknąć —
jego utrata obniża pokrycie/ATS; `zlozCv(oryginal, przepisanie, slowaKluczowe)`
cofa taki punkt do oryginału), `zlozCv` skleja punkty po `punkt_zrodlowy` (indeks
źródłowy, nie po kolejności).

**STRAŻ POKRYCIA (krok 6a⁻ w `pipeline.ts`, 2026-07-31): przepisanie NIE MOŻE
odebrać CV pokrycia wymagania, które oryginał już miał.** Porównuje ranga po randze
(`RANGA_POKRYCIA`) `przed.dopasowania` z `po.dopasowania`; przy spadku cofa
PODSUMOWANIE do oryginału i sprawdza, czy to odzyskało pokrycie (zero wywołań
modelu). Cofa tylko wtedy, gdy realnie pomaga — inaczej zostawia lepiej napisaną
wersję. Powód: `zgubionoSlowoKluczowe` chroni wyłącznie frazy, które matcher
wcześniej TRAFIŁ, więc przy luce w `slownik.ts` nie chroniło nic. Realny błąd:
podsumowanie „Specjalizuję się w wydajności i dostępności interfejsów" znikało
przy przepisaniu, a raport wypisywał potem OBA te wymagania jako brakujące
(„nie podałeś tego o sobie" o czymś, co użytkownik podał, a my usunęliśmy).
Podsumowanie jest jedynym polem przepisywanym w całości — punkty są chronione
pojedynczo w `zlozCv` — dlatego cofamy właśnie je. Test: `npm run test:straz`.

**PODŁOGA WYNIKU (krok 6a w `pipeline.ts`): dopasowanie NIGDY nie obniża oceny.**
Jeśli mimo straży `ocenCv(tailoredCv) < ocenCv(baseCv)`, wracamy w całości do CV
wejściowego — użytkownik w najgorszym razie dostaje +0, nigdy wynik niższy niż
przed przetworzeniem. Gwarancja w kodzie, nie prośba do modelu (realny przypadek:
pielęgniarka + krótka oferta spadała 82→66, teraz 82→82).

## Modele AI — `src/lib/ai/models.ts`

`MODEL_TANI` (`google/gemini-3.1-flash-lite`), `MODEL_SREDNI` / `MODEL_MOCNY`
(`google/gemini-3.6-flash`). Nadpisywalne przez env `CV_MODEL_TANI/SREDNI/MOCNY`
(format „dostawca/model"). Klucz: `AI_GATEWAY_API_KEY` (Gateway) LUB
`GOOGLE_GENERATIVE_AI_API_KEY` (bezpośredni — TAK jest w `.env.local` i na Vercel).
`czyAiDostepne()` sprawdza obecność klucza. Bez klucza trasy zwracają 503.

## Model danych

- **`TailoredCv`** (`cv-schema.ts`, Zod) — pojedyncze źródło typu CV: `personal_info`,
  `professional_summary`, `experience[]{company,role,location?,period,bullets[]}`,
  `projects[]`, `skills{technical[],soft_and_tools[]}`, `education[]`, `languages[]`,
  `rodo_clause`. Też: `ChangeLogEntry`, `ScoreCriterion`, helpery `cvChecklist`,
  `isCvComplete`, `DEFAULT_RODO_CLAUSE`, `emptyCv`.
- **Store** (`store.ts`, Zustand persist `cv-copilot-store`): `cv`, `template`,
  `enabledSections`, `jobPosting`, `aiMeta`, `tailorings[]`, `cvs[]` (biblioteka CV),
  `activeCvId`, **`subscription`**, **`usage`**. Typy: `AiMeta{matchScoreBefore/After,
  addedKeywords, changesLog, findings?, scoreBreakdown?, categories?, unlocked?
  — POLE MARTWE, zostawione tylko dla starych zapisów}`, `ReviewFinding`,
  `Tailoring` (rekord historii: baseCv+tailoredCv+aiMeta+jobText), `SavedCv`.
  Akcje: `newCv`, `newCvFrom` (auto-włącza sekcje z danymi), `openCv`, `loadCv`,
  `syncActiveCv`, `renameCv`, `deleteCv`, `setAiMeta`, `addTailoring`/`removeTailoring`,
  `resetReview`, **`aktywujSubskrypcje`/`anulujSubskrypcje`/`zliczDopasowanie`**.
  Persist `version: 3` — migracja v2→v3 przenosi dostęp z rekordów na konto.
  **`wlascicielId`** (2026-08-13) — id konta, do którego należy stan lokalny;
  bez bumpu wersji, bo brak podpisu w starym zapisie ma znaczyć „nie moje"
  (patrz „WŁAŚCICIEL DANYCH LOKALNYCH").
  **Autosave NIE nadpisuje nazwy CV** (`nazwaPoZapisie`, 2026-07-31): `syncActiveCv`
  /`openCv`/`newCv`/`newCvFrom` ustawiały `name: defaultCvName(cv)` bezwarunkowo,
  więc CV utworzone jako „<oferta> — dopasowane" wracało do imienia kandydata pół
  sekundy po otwarciu, a biblioteka pokazywała dwa nierozróżnialne wpisy (`renameCv`
  był z tego samego powodu bezużyteczny). Reguła: nazwę odświeżamy tylko wtedy, gdy
  była automatyczna (`zapisane.name === defaultCvName(zapisane.cv)`) — puste CV
  dostaje imię, gdy użytkownik je wpisze, a nazwa własna zostaje nietknięta.
- **Mock** (`mock-review.ts`): fallback bez klucza (`buildTailoring`, `runMockReview`)
  — deterministyczny, celowo krytyczny (≥3 poprawki dla paywalla). Od 2026-07-25 też
  liczy rubrykę (`stubDopasowanie`+`ocenCv`), spójnie z produkcją.

## Monetyzacja i uprawnienia — `src/lib/subscription.ts`

**Darmowe: konto, kreator CV, wszystkie szablony, podgląd, pobranie własnego CV
w PDF. Płatne: dopasowanie CV do oferty** (raport, rozbicie wyniku, dziennik
zmian, wywiad, przerobione CV). Ceny BRUTTO — konsument ma widzieć kwotę, którą
faktycznie zapłaci.

**DWIE DROGI DO DOSTĘPU** (`PLANY`, `CENA_JEDNORAZOWA`):
1. **Subskrypcja**, dwa progi różniące się LIMITEM dopasowań: `start` 29 zł/mies.
   (290 zł/rok) = 30 dopasowań, `pro` 49 zł/mies. (490 zł/rok) = 100 dopasowań.
   Droższy MUSI mieć lepszy stosunek ceny do limitu (0,97 zł vs 0,49 zł za
   dopasowanie) — inaczej nikt go nie wybierze.
2. **Jednorazowe odblokowanie POJEDYNCZEGO dopasowania za 12 zł.** Pokazywane
   jako down-sell przy próbie wyjścia z cennika (`widok: "jednorazowo"`).
   Użytkownik może kupić dowolnie wiele takich odblokowań — każde dotyczy
   konkretnego rekordu (`odblokowaneDopasowania: string[]`).

**TRZECIA DROGA — DARMOWA OFERTA (`LIMIT_DARMOWY`, decyzja Marka 2026-08-10):
jedno w pełni odblokowane dopasowanie miesięcznie, dla KAŻDEGO konta, nie
tylko subskrybentów.** To NIE jest subskrypcja (subskrybent widzi WSZYSTKIE
swoje dopasowania odblokowane; tu chodzi o JEDNO wybrane, więc osobny
mechanizm zamiast trzeciego wpisu w `subskrypcja`). Baza: kolumna
`zuzycie_miesieczne.darmowy_dopasowanie_id` + funkcja `zuzyj_darmowe_dopasowanie(uuid)`
(`supabase/migrations/20260810130000_darmowe_dopasowanie.sql`) — ATOMOWO
przyznaje wolny slot miesiąca, tym samym wzorcem `insert ... on conflict ...
where` co `zuzyj_dopasowanie`. Wołana z `tailor-flow.zapiszWynik` zaraz po
`addTailoring`, TYLKO dla nowych korzeni (`!t.korzenId` — przeliczenie
z wywiadu to ta sama oferta, nie nowa szansa) i tylko bez aktywnej
subskrypcji. Celowo BEZ klucza obcego na `dopasowanie_id` (inaczej niż
`zakup`) — wołana zanim debounce (900 ms) w `synchronizacja-konta.tsx` zdąży
zapisać rekord do bazy, więc referencja „na słowo" jest tu akceptowalna
(darmowa zachęta, nie płatność). Po sukcesie `tailor-flow` NIE nadaje dostępu
lokalnie — woła ponownie `pobierzUprawnienia()` i wstawia wynik przez
`useCvStore.setState()`, bo store nie ma prawa nadać dostępu sam z siebie
(patrz ZASADA niżej). `pobierzUprawnienia()` czyta tę kolumnę dla bieżącego
miesiąca i dolewa do `odblokowaneDopasowania` — `useMaDostepDo` nie musiał się
zmienić, bo nie rozróżnia, skąd wzięło się id na tej liście.

**ZASADA: uprawnienia sprawdza się WYŁĄCZNIE przez `useMaDostepDo(tailoringId)`**
(store.ts) — nigdy przez `aiMeta.unlocked` (pole martwe, zostało dla starych
zapisów). Hook zwraca `true`, gdy jest aktywna subskrypcja ALBO rekord został
kupiony jednorazowo ALBO wykorzystano na nim darmową ofertę miesiąca.
`useMaSubskrypcje()` tylko tam, gdzie chodzi o samo konto (lista dopasowań
liczy uprawnienie per wiersz).

**Przeliczenie po wywiadzie TWORZY NOWY REKORD i kasuje stary**, więc
`tailor-flow.zapiszWynik` woła `przeniesOdblokowanie(stareId, noweId)` PRZED
`removeTailoring` — bez tego ktoś, kto zapłacił 12 zł za to jedno dopasowanie,
traciłby je przez sam fakt skorzystania z wywiadu (dokładnie ten błąd istniał
wcześniej dla flagi `unlocked`). `removeTailoring` czyści też wpis z listy
zakupów. `tailor-flow` odtwarza `tailoringId` z `tailorings[0]` przy otwarciu
modalu — inaczej po powrocie do edytora kupione dopasowanie wyglądałoby na
zablokowane.

**Pod Stripe/Supabase:** `Subscription{status,plan,okres,koniecOkresu,
stripeCustomerId?,stripeSubscriptionId?}` odwzorowuje model Stripe'a (`status`,
`current_period_end`); `status` `zalega`/`anulowana` DAJE dostęp do końca
opłaconego okresu (`czyAktywna`). Zakupy jednorazowe = Payment Intent powiązany
z id dopasowania. Podpięcie płatności = podmiana źródła danych w hookach
`useMaDostepDo`/`useMaSubskrypcje` + wywołanie `aktywujSubskrypcje`/
`odblokujDopasowanie` z webhooka; reszta aplikacji bez zmian.

**Limit dopasowań:** wynika z planu (`limitPlanu`), licznik `usage{miesiac,
dopasowania}` zerowany zmianą klucza „RRRR-MM"; `zliczDopasowanie()` woła
`tailor-flow` przy każdym zapisie wyniku (re-run po wywiadzie też — zużywa
osobne wywołania modelu). Limit jest MIĘKKI (dziś tylko pokazywany). Powód
istnienia: jedno dopasowanie to 2 wywołania modelu, więc koszt rośnie liniowo
z użyciem i bez limitu pojedynczy użytkownik zjada całą marżę.

**Cennik nie może obiecywać rzeczy, których nie ma w kodzie** — lista korzyści
pochodzi z `ZAKRES_PLATNY`. Usunięte 2026-07-31: dwa poziomy Pro/Premium, eksport
DOCX, „bez znaku wodnego", „nielimitowane dopasowania", „historia wersji CV"
(wszystko to było darmowe albo nie istniało), symulacja rozmowy (oznaczona
w sidebarze jako „wkrótce"), badge „najczęściej wybierany", down-sell 12 zł przy
wyjściu oraz teksty o „darmowym planie"/„MVP 0 zł" i o „kroku 4".

## Baza danych — Supabase (od 2026-08-02)

Projekt **Aplikando** (`urjpluqutufsgkzysazq`, eu-central-1, Postgres 17). Migracje
w `supabase/migrations/` odpowiadają 1:1 stanowi zdalnej bazy; opis i instrukcja
konfiguracji panelu w `supabase/README.md`. Typy: `src/lib/supabase/typy-bazy.ts`
(GENEROWANE — odświeżać po każdej migracji, nie edytować ręcznie).

**BAZA JEST ŹRÓDŁEM PRAWDY** (decyzja Marka 2026-08-02). Zustand zostaje jako
cache UI, ale każdy zapis idzie do Postgresa — CV mają być na każdym urządzeniu,
a wyczyszczenie przeglądarki nie może niczego kasować. Przy pierwszym logowaniu
migrujemy zawartość `localStorage` do bazy.

Tabele: `profil` (konto, `stripe_customer_id`; tworzone triggerem z `auth.users`) ·
`cv` (biblioteka, `tresc` = `TailoredCv` w JSONB) · `dopasowanie` (historia:
`cv_bazowe`/`cv_dopasowane`/`ai_meta` + `korzen_id`) · `subskrypcja` · `zakup`
(jednorazowe 12 zł) · `zuzycie_miesieczne` (licznik limitu) · `zuzycie_ai`
(koszt modelu) · `zdarzenie_stripe` (idempotencja webhooka) · `zgloszenie_bledu`.

**CV w JSONB, nie w tabelach relacyjnych** — schemat ma jedno źródło (`cv-schema.ts`,
Zod). Znormalizowane `experience`/`education`/`skills` znaczyłyby, że każda zmiana
`TailoredCv` to migracja bazy plus mapowanie w obie strony. Przy odczycie treść
przepuszczamy przez Zoda, nie rzutujemy na siłę.

**`korzen_id` — rozwiązanie problemu, który wcześniej łatał `przeniesOdblokowanie`.**
Przeliczenie po wywiadzie tworzy NOWY rekord i kasuje stary, więc zakup przypięty
do id znikał razem z rekordem (kto zapłacił 12 zł, tracił dostęp przez samo
skorzystanie z wywiadu). W bazie zakup dotyczy KORZENIA łańcucha
(`coalesce(korzen_id, id)`) — nie ma czego przenosić, dostęp nie może zginąć.

**Uprawnienia sprawdza wyłącznie RPC `ma_dostep_do(id)`** (subskrypcja ALBO zakup
korzenia ALBO darmowa oferta miesiąca — od 2026-08-10) — dokładnie ta sama
zasada co `useMaDostepDo` w `store.ts`, tylko egzekwowana po stronie serwera
(choć na dziś ta funkcja nie jest jeszcze wołana z kodu aplikacji — patrz
„Monetyzacja i uprawnienia" wyżej). `ma_aktywna_subskrypcje()` odwzorowuje
`czyAktywna` (`past_due`/`canceled` dają dostęp do końca opłaconego okresu).

**Limit dopasowań jest TWARDY i liczony na serwerze** (decyzja Marka 2026-08-02).
`zuzyj_dopasowanie(limit)` inkrementuje licznik i sprawdza próg JEDNĄ instrukcją
(dwa równoległe żądania inaczej przepchnęłyby oba ponad limit). Limit wchodzi
PARAMETREM — progi planów zostają w `subscription.ts` i to jest ich jedyne źródło.
Wcześniejszy licznik w `localStorage` nie chronił przed niczym: czyszczenie
przeglądarki zerowało go do zera.

**RLS: klient nie pisze po niczym, za co się płaci.** `subskrypcja`, `zakup`,
`zuzycie_*` mają dla `authenticated` tylko SELECT; zapisuje webhook rolą
`service_role`. `profil` ma grant KOLUMNOWY (użytkownik zmienia wyłącznie
`zgoda_marketing`, nie `stripe_customer_id`). `zdarzenie_stripe` nie ma ani jednej
polityki. Zweryfikowane 22 testami na dwóch kontach (izolacja danych, próby
nadania sobie subskrypcji, limit, wygasanie okresu, kaskada RODO).

**Zdjęcia: Storage, bucket prywatny `zdjecia`** (`{user_id}/{cv_id}.{ext}`, 2 MB,
signed URL), w `tresc` tylko ścieżka. Base64 w JSONB puchło razem z historią —
rekord dopasowania trzyma DWA komplety CV.

## Pliki wg odpowiedzialności

**`src/lib/ai/`**: `pipeline.ts` (orkiestracja) · `job-offer.ts` (oferta→wymagania,
AI) · `fact-ledger.ts` (CV→fakty, `digitsIn`/`normalize`) · `matching.ts` (dopasowanie,
wynik pokrycia, werdykt) · `slownik.ts` (wiedza branżowa, synonimy, rdzenie PL; od 2026-07-31 grupy „wydajność/Core Web Vitals/Lighthouse/czas ładowania" i „dostępność/WCAG/a11y" — bez nich CV z twardym dowodem na wydajność dostawało „brak pokrycia") ·
`rewrite.ts` (przepisanie, AI + straże) · `validator.ts` (anty-halucynacja) ·
`scoring.ts` (rubryka 0–100) · `changes.ts` (opis zmian + findings) · `interview.ts`
(pytania+aplikacja odpowiedzi) · `parse-cv.ts` (import: ekstrakcja tekstu + HIPERŁĄCZA z adnotacji PDF/hrefów DOCX + mapowanie AI; PDF otwierany RAZ na tekst i linki — pdf.js odłącza bufor po pierwszym `getDocumentProxy`, przez co drugie wywołanie cicho zwracało 0 linków; prompt normalizuje też WERSALIKI na naturalną pisownię) · `fetch-oferta.ts` (pobranie treści ogłoszenia z linku: JSON-LD JobPosting → HTML→tekst; `czyPoprawnyLink`, `BladPobraniaOferty`) · `models.ts` (wybór modeli+klucz).

**`src/lib/supabase/`** — warstwa dostępu do bazy. `klient-przegladarka.ts`
(`createBrowserClient`, klucz publishable — jawny, całe bezpieczeństwo stoi na
RLS; **`detectSessionInUrl: false`** — sesja ma powstawać wyłącznie
w `/auth/callback`, patrz „LOGOWANIE GOOGLE") · `klient-serwer.ts` (`klientSerwer()` + `zalogowanyUzytkownik()`; `cookies()`
jest ASYNCHRONICZNE w tej wersji Next) · `klient-admin.ts` (`service_role`, OMIJA
RLS — wolno TYLKO w webhooku Stripe'a; rzuca wyjątkiem, jeśli zawoła się go
w przeglądarce) · `typy-bazy.ts` (generowany).

**`src/proxy.ts`** — odświeżanie sesji przed każdym żądaniem. **Konwencja
`middleware.ts` jest w tym Next WYCOFANA — plik nazywa się `proxy.ts`, eksportuje
funkcję `proxy`** (`node_modules/next/dist/docs/.../file-conventions/proxy.md`).
Server Components nie mogą zapisywać ciasteczek, więc bez tego pliku token
wygasa i użytkownik wylatuje z konta w losowym momencie. Ciasteczka zapisujemy
w DWA miejsca (żądanie + odpowiedź) — pominięcie jednego daje losowe wylogowania.
Wszędzie `getUser()`, NIGDY `getSession()`: `getSession()` ufa ciasteczku,
`getUser()` weryfikuje token u Supabase.

**BRAMKA KONTA (decyzja Marka 2026-08-10): CAŁA aplikacja wymaga zalogowania —
zastępuje wcześniejsze „kreator działa bez konta" (2026-08-02).** Bez konta nie
da się otworzyć nawet kreatora CV. Wymuszane SERWEROWO w `src/proxy.ts`: każde
żądanie do `/app/**` bez aktywnej sesji (`getUser()` zwraca `null`) dostaje
przekierowanie na `/logowanie?wroc=<ścieżka>` — wpisanie adresu wprost w pasku
nic nie daje, bramka nie jest tylko kosmetyką w UI. Konsekwencja: anonimowa faza
w `localStorage` (dane budowane PRZED kontem, migrowane jednorazowo po
pierwszym logowaniu) już nie występuje w normalnym flow. Kod migracji został
w `synchronizacja-konta.tsx` jako „nieszkodliwa siatka bezpieczeństwa" —
**i okazał się szkodliwy, więc go USUNIĘTO 2026-08-13, patrz „WŁAŚCICIEL DANYCH
LOKALNYCH" niżej.** Regulamin § 3 ust. 7
i § 4 ust. 5–6 zaktualizowane w tym samym duchu (wersja dokumentów 1.2).

**ZALOGOWANY NIE OGLĄDA LANDINGU (decyzja Marka 2026-08-12).** Ten sam
`proxy.ts` przekierowuje żądanie `/` z aktywną sesją na `/app`. Landing sprzedaje
produkt komuś, kto go nie ma; kto ma konto, chce wejść do aplikacji. Dlatego
z nagłówka zniknął przycisk „Otwórz aplikację" (`PrzyciskiKontaNaglowek`
w `menu-konta.tsx`) — jego rolę pełni teraz samo wejście na stronę główną,
a niezalogowanemu został tam wyłącznie „Zaloguj się" (`/app` i tak odbiłoby go
na formularz, więc dwa przyciski były dwiema nazwami tej samej drogi).
Przekierowanie jest SERWEROWE — zrobione w komponencie dawałoby błysk landingu
po hydracji. **Konsekwencja: zalogowany nie dosięgnie `/#cennik` ani FAQ
z landingu** (kotwica nie dociera do serwera, więc odbija się razem z całą
stroną); cennik dla posiadacza konta żyje w `paywall-dialog.tsx`. Po zalogowaniu
cel `/app` był ustawiony od zawsze — `wroc` domyśla się do niego w `strona-auth.tsx`
i w `/auth/callback`.

**`src/components/auth/`** — konto. `formularz-auth.tsx` (JEDEN komponent na
wszystkie ekrany: `rejestracja` / `logowanie` / `kod-rejestracji` /
`reset-prosba` / `reset-kod` / `reset-haslo`; `TEKSTY_AUTH` = tytuły per ekran,
`poPolsku()` = tłumaczenie komunikatów Supabase; `PoleHasla` = pole hasła
z podglądem treści i błędem pod polem — komponent MODUŁOWY, nie zagnieżdżony
w `FormularzAuth`, bo trzyma własny `useState` i definicja w ciele rodzica
odmontowywałaby pole przy każdym naciśnięciu klawisza) · `auth-dialog.tsx`
(`AuthDialog` + hook `useBramaKonta`) · `strona-auth.tsx` (oprawa pełnych tras).
Hook sesji: `src/lib/supabase/uzytkownik.ts` (`useUzytkownik`).

**LOGOWANIE GOOGLE (od 2026-08-07) — DWIE BRAMKI ZGODY, bo żadna z osobna nie
wystarcza.** `signInWithOAuth` w `formularz-auth.tsx` → Google → Supabase →
`/auth/callback` (trasa serwerowa, `exchangeCodeForSession`; MUSI być trasą,
Server Components nie zapisują ciasteczek).

1. **Przed przekierowaniem:** na ekranie rejestracji przyciski „Kontynuuj
   z Google" i „Załóż konto" NIE są z góry `disabled` bez zgody na Regulamin
   (decyzja Marka 2026-08-10, patrz niżej) — walidacja idzie PO kliknięciu i
   podświetla checkbox na czerwono, bo Google zakłada konto tym samym
   kliknięciem (§ 4 ust. 19), więc brak zgody i tak zatrzymuje przekierowanie.
   Znacznik
   czasu zaznaczenia i flaga zgody marketingowej jadą przez przekierowanie
   w `sessionStorage` (`lib/prawne/zgody-oauth.ts`): stan Reacta nie przeżywa
   podróży na obcą domenę, a dziennik ma nosić chwilę aktu woli, nie chwilę
   powrotu (dzieli je ekran wyboru konta Google).
2. **Po powrocie:** `/auth/callback` czyta dziennik (`maZgodeRegulaminowa`)
   i przy braku wpisu odsyła na `/dokoncz-rejestracje`. Ta bramka istnieje dla
   przypadku, którego pierwsza złapać NIE MOŻE — nowy użytkownik klika Google na
   ekranie LOGOWANIA, konto powstaje, a checkboxa nikt nie pokazał. Strona
   sprawdza to jeszcze raz serwerowo, więc nie da się jej ominąć wpisaniem
   adresu docelowego w pasku.

**OBIE BRAMKI STOJĄ NA JEDNYM ZAŁOŻENIU: że sesja może powstać WYŁĄCZNIE
w `/auth/callback`. Domyślnie to nieprawda — stąd `detectSessionInUrl: false`
w `klient-przegladarka.ts` (2026-08-13).** Klient przeglądarki ma tę opcję
domyślnie WŁĄCZONĄ: przy starcie ogląda adres strony i znalazłszy `?code=`,
sam wymienia go na sesję. Wystarczy więc, że powrót z Google trafi gdziekolwiek
indziej niż na naszą trasę — przy niepełnej liście Redirect URLs Supabase odsyła
na **Site URL**, czyli na landing — a nagłówek landingu montuje `useUzytkownik`,
tworzy klienta i ten po cichu kończy logowanie. Użytkownik jest w środku, trasa
callbacku nie została odwiedzona, `maZgodeRegulaminowa` nigdy się nie wykonała,
zgód nie widział nikt. Zgłoszone przez Marka 2026-08-13 (ta sama zła
konfiguracja panelu dała wcześniej 404 na `aplikando.pl/**?code=…`).
Po wyłączeniu opcji błędna konfiguracja daje objaw WIDOCZNY — logowanie się nie
kończy — zamiast cichego wpuszczenia z pominięciem oświadczenia woli. Nic nie
tracimy: hasło i kody nie niosą nic w adresie, a Google i tak musi wymienić kod
serwerowo, żeby zapisać ciasteczka.

**Konta OAuth nie da się „nie założyć bez zgody"** — istnieje, zanim nasz kod
cokolwiek zobaczy. Dlatego `/dokoncz-rejestracje` daje drogę wyjścia: zgoda albo
usunięcie konta jednym kliknięciem.

**Brak wiersza w dzienniku to fakt, nie heurystyka** — dlatego rozpoznajemy po
nim „nowe konto", a nie po `created_at` (ile sekund to nowe?) ani po
`last_sign_in_at` (zmienia się przy każdym logowaniu). Przy błędzie ODCZYTU
`maZgodeRegulaminowa` zwraca `true`: awaria sieci nie ma prawa wysyłać
zalogowanego użytkownika na ekran zgód w kółko.

⚠️ **Provider w panelu Supabase NIE JEST jeszcze włączony** (stan 2026-08-07:
przełącznik off, Client ID i Secret puste). Instrukcja krok po kroku:
`supabase/README.md`, sekcja „Logowanie Google". Uwaga na dwa różne adresy
powrotne — w Google Cloud rejestruje się callback SUPABASE, a w Supabase adres
NASZEJ aplikacji z `/auth/callback`.

**Hasło ustawia się DWA RAZY** (rejestracja i „Ustaw nowe hasło" po resecie,
2026-08-07): pole + „Powtórz hasło", zgodność sprawdzana przed wywołaniem
Supabase. Powód: odzyskiwanie konta idzie kodem z maila, więc literówka przy
zakładaniu konta wychodzi na jaw dopiero przy następnym logowaniu — bez
możliwości sprawdzenia, co się wtedy wpisało. Przy LOGOWANIU powtórzenia nie
ma i mieć nie może (hasło już istnieje, weryfikuje je serwer). Oba pola mają
podgląd treści (`PoleHasla`), bo dwa zamaskowane pola bez podglądu zamieniają
literówkę w zgadywankę.

**`MIN_HASLO = 8` MUSI zgadzać się z „Minimum password length" w panelu
Supabase** (ustawione na 8, potwierdzone 2026-08-07). Niższy próg na serwerze
czyniłby walidację kliencką dekoracją; wyższy dałby użytkownikowi komunikat
z NASZĄ liczbą przy CUDZYM wymogu — `poPolsku()` tłumaczy „password should be
at least", ale wstawia w nim `MIN_HASLO`, więc przy rozjeździe podaje błędną
liczbę znaków.

**Przejście między ekranami ODZNACZA ZGODĘ** (`przelaczEkran`): rejestracja →
logowanie → z powrotem nie może zostawić zaznaczonego checkboxa. To ta sama
zasada, co `resetZgod()` w oknie zakupu — zgoda ma być świadomym aktem przy
TYM formularzu, nie stanem odziedziczonym (art. 7 ust. 1 RODO, Regulamin § 4
ust. 2 pkt 3).

**Aktywacja idzie KODEM, nie linkiem** — szablon „Confirm sign up" w Supabase
używa `{{ .Token }}`, a kod weryfikuje `verifyOtp({ type: "signup" })`. Reset
hasła tak samo (`type: "recovery"`), dzięki czemu nie potrzebujemy trasy
wymieniającej kod z linku na sesję. Ponowna wysyłka ma odliczanie 60 s —
tyle wynosi „Minimum interval per user" w SMTP, więc bez licznika użytkownik
dostawałby suchy błąd o limicie.

**Formularz istnieje w dwóch oprawach, ale w JEDNEJ implementacji:** okienko
(`AuthDialog`, otwierane akcją) i trasy `/rejestracja`, `/logowanie`,
`/reset-hasla`. Trasy muszą zostać — potrzebuje ich link z maila, powrót
z logowania Google i menedżery haseł (w modalach działają gorzej). `?wroc=`
przyjmuje TYLKO adresy wewnętrzne (`/`, nie `//`) — inaczej byłby to otwarty
redirect na podrobioną stronę logowania.

**SYNCHRONIZACJA STORE ↔ BAZA (2026-08-02):** `src/lib/supabase/repo.ts`
(mapowanie `SavedCv`/`Tailoring` ↔ wiersze `cv`/`dopasowanie`; daty ms↔timestamptz,
nazwy EN↔PL — jedno miejsce konwersji) + `src/components/auth/synchronizacja-konta.tsx`
(montowana w `AppShell`). **Komponenty się NIE ZMIENIŁY** — dalej czytają store,
tylko jego zawartość pochodzi z Postgresa. DWA zadania: wciągnięcie danych po
zalogowaniu i zapis kolejnych zmian (debounce 900 ms, diff po id → upsert +
delete). Konflikty: wygrywa ostatni zapis, per rekord.

**WŁAŚCICIEL DANYCH LOKALNYCH — `store.wlascicielId` (2026-08-13).** Stan
w `localStorage` jest podpisany id użytkownika, dla którego został wciągnięty
z bazy. `synchronizacja-konta` porównuje ten podpis z id zalogowanego i przy
RÓŻNICY (inne konto, albo brak podpisu w stanie sprzed tej zmiany) czyści stan
lokalny NATYCHMIAST, przed odpytaniem bazy — cudze CV nie ma prawa nawet mignąć
na ekranie. To jedyna kontrola po stronie przeglądarki: RLS pilnuje bazy, ale
`localStorage` jest wspólny dla wszystkich osób korzystających z tego profilu
przeglądarki i żadna polityka w Postgresie go nie dotyczy.

**Zastąpiło to TRZECIE zadanie synchronizacji — migrację danych zbudowanych bez
konta — które USUNIĘTO, bo przenosiło cudze rekordy na świeże konto.** Migracja
brała każdy lokalny rekord nieobecny w bazie i wypychała go przez `zapiszCv`
/`zapiszDopasowania`, a te stemplują wiersz id BIEŻĄCEGO użytkownika. Wystarczyło,
że poprzednia sesja skończyła się bez kliknięcia „Wyloguj" (wygaśnięcie, zamknięta
karta, czyszczenie ciasteczek bez czyszczenia `localStorage`) — kolejna osoba
logowała się i zastawała w SWOJEJ bazie CV oraz dopasowania poprzednika. Od bramki
konta (2026-08-10) migracja nie miała już czego ratować: bez sesji nie da się
zbudować CV. Konsekwencja do zaakceptowania: dane wyłącznie lokalne, nigdy
niezapisane do bazy, przepadają przy zmianie konta — baza jest źródłem prawdy.

**Wciągnięcie z bazy ZASTĘPUJE stan lokalny, nie doklejane się do niego.**
`cvs`/`tailorings` po hydracji to dokładnie zawartość konta. Jeśli odczyt padnie,
`gotoweDoZapisu` zostaje `false` i nie zapisujemy NICZEGO — bez tego wyczyszczony
stan lokalny mógłby po awarii sieci skasować konto w bazie.

**Pułapka, która kosztowałaby użytkownika całą pracę:** rozróżniamy „sesji jeszcze
nie znamy" (`undefined`) od „na pewno wylogowany" (`null`). Bez tego pierwszy
render kogoś, kto NIGDY się nie logował, wyglądałby jak wylogowanie. Czyścimy
przy realnym przejściu zalogowany→wylogowany (do zera — na wspólnym komputerze
nikt nie może zobaczyć cudzych CV) oraz przy niezgodnym `wlascicielId`. Puste CV
nie trafiają do bazy (`maTresc`), bo edytor tworzy je automatycznie i zaśmiecałyby
bibliotekę.

**Uprawnienia czytamy z bazy, nigdy nie wypychamy** (`pobierzUprawnienia`):
`subskrypcja`, opłacone `zakup` i `zuzycie_miesieczne` lądują w store, więc
`useMaDostepDo`/`useMaSubskrypcje` działają bez zmian. Zapisuje je wyłącznie
webhook rolą `service_role`.

**TWARDY LIMIT W `/api/dopasuj`:** trasa sprawdza sesję (401 `brak-konta`), czyta
plan i woła RPC `zuzyj_dopasowanie(limitKonta(subskrypcja))` **przed** modelem
(429 `limit`).

**PAYWALL STOI PRZY RAPORCIE, NIE PRZED ANALIZĄ** — dopasowanie można uruchomić
w każdej chwili (wymagane jest tylko konto), a płaci się za pełny wynik. Dlatego
konto BEZ subskrypcji przechodzi przez trasę bez przeszkód i NIE podbija licznika:
pula 30/100 dotyczy wyłącznie aktywnych subskrybentów. Gdyby liczyć wszystkim,
ktoś kupujący plan w połowie miesiąca zastałby pulę nadgryzioną przez okres sprzed
zakupu. Dla subskrybenta limit zużywamy PRZED wywołaniem modelu — przy odwrotnej
kolejności padnięcie zapisu po opłaconej przez nas analizie oddawałoby ją za darmo.
**`tailor-flow` MUSI obsłużyć te kody jawnie** — każdy inny status niż 422
schodził tam na mock, więc wyczerpany limit dawałby udawany wynik wyglądający
jak prawdziwa analiza. Mock jest demem przy braku klucza, nie obejściem limitu.
Zużycie tokenów loguje `zuzycie_ai` (rolą `service_role`, zapis nie może
wywrócić odpowiedzi); `koszt_usd` zostaje 0 do czasu dodania cennika per model.

**PŁATNOŚCI (Stripe, 2026-08-02):** `src/lib/stripe.ts` (klient TYLKO serwerowy —
rzuca wyjątkiem w przeglądarce; `idCenySubskrypcji`/`idCenyJednorazowej` czytają
identyfikatory cen z env, `planZCeny` mapuje z powrotem, `statusZeStripe` tłumaczy
statusy) · `/api/platnosc/checkout` · `/api/platnosc/webhook`.

**Kwoty NIE są duplikowane w warstwie Stripe** — ceny żyją w `subscription.ts`,
a w env trzymamy wyłącznie identyfikatory cen, bo tylko one różnią się między
sandboxem a produkcją. Kwota w dwóch miejscach prędzej czy później znaczyłaby,
że cennik pokazuje co innego niż kasa.

**Gdy webhook nie dojdzie: `npm run stripe:synchronizuj`** — czyta subskrypcje
wprost ze Stripe'a i dopisuje je do bazy, używając TYCH SAMYCH funkcji mapujących
co webhook (`statusZeStripe`, `planZCeny`), więc nie ma drugiej interpretacji
statusów. Idempotentny. Powód istnienia: klient zapłacił, a aplikacja o tym nie
wie — to najgorszy rodzaj błędu, bo dotyka ludzi, którzy właśnie dali nam
pieniądze. Realny przypadek (2026-08-04): brakowało `STRIPE_WEBHOOK_SECRET` na
Vercelu, więc trasa zwracała 503, a zdarzenia wisiały w kolejce Stripe'a.

**Panel klienta:** `/api/platnosc/portal` → Billing Portal Stripe'a (zmiana karty,
faktury, anulowanie). Nie budujemy tego sami — anulowanie i zmiana planu wymagają
poprawnych rozliczeń proporcjonalnych, a zmiany wracają do nas webhookiem, więc
baza pozostaje spójna. Anulowanie NIE odbiera dostępu od razu
(`cancel_at_period_end` + `czyAktywna`). Wymaga jednorazowego włączenia panelu
w ustawieniach Stripe'a.

**ZE STORE'A NIE DA SIĘ NADAĆ DOSTĘPU — akcje `aktywujSubskrypcje`,
`anulujSubskrypcje` i `odblokujDopasowanie` zostały USUNIĘTE** (2026-08-02, przy
podpięciu Stripe'a). Pochodziły z czasów demonstracyjnego paywalla i były pułapką:
nadawały dostęp bez płatności jedną linijką, a po przejściu na bazę i tak znikały
przy odświeżeniu — użytkownik „kupował", po czym tracił dostęp, a w Stripe nic się
nie działo. Został wyłącznie `przeniesOdblokowanie` (lokalna spójność przy
przeliczeniu) i `zliczDopasowanie`.

**DOSTĘP NADAJE WYŁĄCZNIE WEBHOOK.** Powrót z płatności (`success_url`) to zwykłe
przekierowanie, które da się wpisać ręcznie w pasku adresu — nie jest dowodem
zapłaty. `subskrypcja` i `zakup` zapisuje tylko webhook rolą `service_role`.
Idempotencja: wstawienie id zdarzenia do `zdarzenie_stripe` jest bramką (błąd
`23505` = już obsłużone → 200 i wyjście). Bez tego ponowione zdarzenie —
a Stripe ponawia po każdym błędzie i timeoucie — zapisałoby drugi zakup za tę
samą płatność. Błąd naszej bazy zwraca 500, żeby Stripe ponowił; błąd podpisu 400,
bo ponawianie nieweryfikowalnego żądania nic nie da.

**Pułapka: obiekt zdarzenia siedzi w `zdarzenie.data.object`, nie `zdarzenie.object`**
(to drugie to literalny string „event"). Rzutowanie go dałoby ciche `undefined`
w każdym polu — złapane przez `tsc`, nie przez testy.

**Jednorazowy zakup dotyczy KORZENIA łańcucha** (`dopasowanie.korzen_id`), a nie
konkretnego rekordu: przeliczenie po wywiadzie kasuje stary rekord i tworzy nowy,
więc zakup przypięty do samego `id` znikałby razem z nim. `tailor-flow` ustawia
`korzenId` przy zastępowaniu, `repo.ts` go zapisuje. Lokalne `przeniesOdblokowanie`
zostaje, ale działa tylko w jednej przeglądarce — korzeń działa wszędzie.

**`tryb_testowy` w `subskrypcja`/`zakup`/`zdarzenie_stripe`** — brany wprost
z `livemode` zdarzenia. Sandbox i produkcja dzielą JEDNĄ bazę (rezygnacja
z osobnego środowiska dev), więc bez tego pola testowa subskrypcja wygląda
identycznie jak opłacona. Dostępu nie blokuje (w sandboxie ma działać) — służy
raportowaniu przychodu i sprzątaniu po testach.

**Stan konta w UI:** `menu-konta.tsx` (`MenuKonta` na dole sidebara — e-mail
`truncate` + wylogowanie, dla niezalogowanego „Zaloguj się"; `PrzyciskiKontaNaglowek`
w nagłówku landingu/bloga — JEDEN przycisk: „Zaloguj się" albo „Wyloguj", bez
„Otwórz aplikację", patrz „ZALOGOWANY NIE OGLĄDA LANDINGU") · `karta-konta.tsx` (sekcja „Konto"
w `/app/ustawienia`: e-mail, wylogowanie, usunięcie konta przez RPC
`usun_moje_konto` z potwierdzeniem drugim kliknięciem). Po wylogowaniu UI
przełącza się BEZ przeładowania — `useUzytkownik` słucha `onAuthStateChange`.

**Bramki konta na akcjach (stan na 2026-08-02, dziś DRUGA linia obrony za
bramką serwerową w `proxy.ts`):** „Pobierz PDF" (`download-pdf-button.tsx`)
i „Dopasuj do oferty" (`builder.tsx`). Obie przez `useBramaKonta` — po założeniu
konta akcja wykonuje się SAMA. W `builder.tsx` w trakcie sprawdzania sesji
(`ladowanie`) przepuszczamy do TailorFlow: okno to ułamek sekundy, a odwrotne
założenie pokazywałoby ZALOGOWANEMU formularz rejestracji przy szybkim kliknięciu.
Od 2026-08-10 nie da się wejść na `/app/**` bez sesji w ogóle, więc `uzytkownik`
tu jest w praktyce zawsze prawdziwy — zostawione jako nieszkodliwa redundancja,
nie usuwane celowo (patrz „BRAMKA KONTA" wyżej). Twardą bramką dla dopasowania
i tak jest serwer (limit + płatność), nie UI.

**Oprawa musi iść za formularzem.** Formularz przełącza ekrany wewnętrznie, więc
`onEkran` zgłasza aktualny stan rodzicowi. Bez tego strona krzyczała „Załóż
konto" nad formularzem logowania (realny błąd, złapany dopiero na żywo —
typy tego nie widzą). W okienku kontekstowy tytuł („…żeby pobrać CV") zostaje
tylko na ekranie wyjściowym.

**POCZTA — TRZY WARSTWY, TRZY POWODY DO ZMIANY.** `src/lib/mail.ts` = transport
(`wyslijMail` — NIGDY nie rzuca, zwraca `WynikWysylki`, bo awaria dostawcy poczty
nie ma prawa wywrócić żądania użytkownika; `czyMailDostepny`, `MAIL_OD`,
`MAIL_ZGLOSZENIA`, `escapeHtml`, `Mail.zalaczniki`). `src/lib/maile/szablon.ts` =
wspólna oprawa (`szablonMaila({naglowek, tresc})` + klocki `akapit`, `link`,
`przycisk`, `podsumowanie`, `uwaga`, `drobnymDrukiem`).
`src/lib/maile/tresci.ts` = **treść wszystkich maili aplikacji w jednym pliku**,
każda funkcja zwraca `{temat, html, text}` i niczego nie wysyła.

Rozdział jest celowy: treść realizuje konkretne obowiązki z Regulaminu, więc musi
dać się zaudytować bez czytania tras API i wyrenderować do podglądu bez wysyłania
czegokolwiek. **Nad każdym mailem stoi w komentarzu paragraf, który go wymaga —
zmiana tego paragrafu w Regulaminie to zmiana maila w TYM SAMYM commicie.**

Siedem maili i ich wyzwalacze: `mailPowitalny` (`/api/konto/powitanie`, § 4 ust. 4)
· `mailZakupJednorazowy` + `mailZakupSubskrypcja` (webhook, § 4 ust. 10 — dlatego
zawierają KWOTĘ i DATĘ zawarcia, nie samo „dziękujemy") · `mailNieudanaPlatnosc`
(webhook `invoice.payment_failed`, § 5 ust. 7) · `mailAnulowanieSubskrypcji`
(webhook, § 5 ust. 6) · `mailZgloszenieOdebrane` (`/api/zglos-blad`, § 7 ust. 9)
· `mailKontoUsuniete` (`/api/konto/usun`, § 4 ust. 14 i 17).
Wzory wiadomości obsługiwanych RĘCZNIE (odstąpienie, reklamacje, DSA,
wypowiedzenie, zmiana usługi, eksport danych) — `dokumenty-prawne/wzory-wiadomosci-o-zmianie.md`.

**Regulamin w PDF dołączamy WYŁĄCZNIE do maili potwierdzających zawarcie umowy**
(powitalny + oba zakupowe) — art. 15 ust. 1 u.p.k. wymaga potwierdzenia na trwałym
nośniku i to ono domyka skutek zgody z § 8 ust. 5–7. Powiadomienie o nieudanej
płatności umowy nie zawiera, więc załącznik byłby tam szumem.

Wyjątek od wspólnej oprawy: raport zgłoszenia lecący na `MAIL_ZGLOSZENIA` zostaje
gołym HTML-em, bo to poczta wewnętrzna (branding i stopka prawna to tam szum) —
ale POTWIERDZENIE dla zgłaszającego idzie już przez szablon. Adres zgłaszającego
bierzemy WYŁĄCZNIE z sesji, nigdy z body — inaczej trasa byłaby otwartym
nadajnikiem na dowolny cudzy adres.

Dwie rzeczy są w mailu odwrotnie niż w aplikacji i tak ma zostać:
**jasne tło** (dark-only renderuje się źle — Outlook i Gmail potrafią wymusić
własne tło, dając czarny tekst na czarnym) oraz **układ na tabelach ze stylami
inline** (klienty pocztowe wycinają `<style>` z `<head>` i nie znają flexboksa).
To jedyne miejsce w repo, gdzie tak się pisze — nie przenoś tego wzorca do UI.
**Wersję tekstową piszemy równolegle, nigdy strippingiem HTML-a**: bez `text`
filtry antyspamowe oceniają wiadomość gorzej, a treść, od której zależą terminy
na odstąpienie, musi być czytelna też w kliencie bez HTML-a.

**Faktury VAT NIE wychodzą z tej aplikacji** (§ 5 ust. 4): zdarzenia Stripe'a
łapie Striptu i przekazuje do Fakturowni, która sama wysyła fakturę klientowi
i wystawia ją do KSeF. Dlatego w `/api/platnosc/checkout` świadomie NIE MA
`invoice_creation`. ⚠️ Oba maile zakupowe zapowiadają fakturę — ta integracja
musi działać, zanim pójdzie pierwsza płatność live.

**NIE dotyczy maili autoryzacyjnych**
— kody aktywacyjne i resety hasła wysyła Supabase przez SMTP Resendu
(konfiguracja w panelu, ten sam klucz `re_...` jako hasło SMTP). Env:
`RESEND_API_KEY`, `MAIL_OD`, `MAIL_ZGLOSZENIA`. Test: `npm run test:mail`.
Pułapka: Resend zwraca błąd W ODPOWIEDZI (`{ data, error }`), nie wyjątkiem —
samo `await` bez sprawdzenia `error` wygląda na sukces przy odrzuconej wysyłce.

**`src/lib/`**: `cv-schema.ts` · `store.ts` · `cv-templates.ts` (rejestr szablonów: `withPhoto`/`templateUsesPhoto`, `tags: TemplateTag[]` + `templatesByTag`, `TEMPLATE_CATEGORIES` = wiersze galerii, `ATS_OBIETNICA` = jedno źródło komunikatu o zgodności z ATS (używane przez `new-cv-dialog.tsx` i `template-picker.tsx`), `STOCK_PHOTO` = zdjęcie poglądowe `public/stock/kandydat.jpg`) ·
`sample-cv.ts` (Anna Kowalska — demo) · `sections.ts` (definicje sekcji edytora) ·
`utils.ts` (`cn`, `pluralize`) · `mock-review.ts`.

**`src/components/`**: `app-shell/` (sidebar+topbar mobilny drawer) · `builder/`
(edytor: `builder.tsx`, `section-list.tsx` [na górze działający import CV: `CvImportButton`; status sekcji „Dane osobowe" pokazuje „Dodaj zdjęcie profilowe" (nieblokujące, `filled` zostaje `true`) gdy szablon ma miejsce na zdjęcie a użytkownik go nie dodał], `section-dialogs.tsx`, `field-inputs.tsx`,
`readiness.tsx`, `match-results.tsx` [panel wyniku w edytorze; dziennik zmian gatowany tak samo jak w szczegółach dopasowania — `DARMOWE_ZMIANY=1`, reszta to „Szczegóły w pełnym raporcie". Bez tego pełne „co zmieniliśmy i dlaczego" dawało się przeczytać za darmo tuż po analizie, choć `/app/dopasowania/[id]` je blokuje. **Panel MUSI mówić, że dotyczy OSOBNEGO dokumentu** (2026-07-31): pisał „Po optymalizacji 78%", „Dodane słowa kluczowe" i „Przeredagowaliśmy podsumowanie" w czasie przeszłym dokonanym, stojąc obok podglądu z CV BEZ tych zmian — a „Pobierz PDF" na belce daje właśnie to niezmienione CV. Użytkownik miał prawo sądzić, że pobiera wersję przerobioną. Teraz: etykiety „CV w edytorze" / „Wersja przerobiona", wynik jako `x/100` (nie `%` — to punkty rubryki, nie procent), zdanie o osobnym dokumencie i przyciski „Otwórz przerobione CV" (gdy opłacone) oraz przejście do raportu. Tytuł oferty ma `line-clamp-2`, NIE `truncate` — `truncate` ustawia `white-space: nowrap`, przez co min-content bloku równa się pełnej szerokości tytułu i rozpycha lewą kolumnę edytora poza jej 380 px (`min-w-0` na rodzicu tego NIE cofa, bo blokowe dziecko i tak zgłasza min-content nieprzerwanego tekstu)], `tailor-flow.tsx` [modal dopasowania:
config→running→interview→result; karta pytania pokazuje pod treścią `kontekst` = dosłowny cytat z ogłoszenia], `paywall-dialog.tsx` [dwa plany z `PLANY` × dwa okresy + down-sell „to jedno dopasowanie za 12 zł" przy wyjściu (wymaga propa `tailoringId`, bez niego down-sell się nie pokazuje, bo nie ma czego odblokować); `DialogContent` = flex-col + przewijany TYLKO środek, żeby przycisk zakupu i krzyżyk nie uciekały], `score-breakdown.tsx`
[„Z czego wynika wynik" — wymaga propa `unlocked`: bez opłaconego dostępu widać tylko pierwsze `FREE_METRICS=2` kryteria (w kolejności z `breakdown`, więc zwykle te zależne od oferty), reszta to sam label + kłódka. Krok wywiadu „Możesz podnieść ten wynik" w `tailor-flow.tsx` (ekran `result`) jest z tego samego powodu zablokowany do czasu odblokowania — inaczej dałoby się podnieść wynik i pobrać wrażenie wartości bez płacenia; zablokowany wariant zostaje widoczny (teaser) i klika w paywall, nie w wywiad], `cv-preview.tsx` [podgląd na żywo w edytorze — deleguje render do `PdfPreview`, sam tylko mierzy dostępną szerokość i pokazuje placeholder pustego CV], `photo-input.tsx` + `photo-cropper.tsx` [zdjęcie: pomniejszony oryginał `photo_source` (max 640px) + gotowy kadr `photo` (360px) + `photo_crop{zoom,ox,oy}`; kadrowanie zoom/przeciąganie to panel INLINE, nie modal (zagnieżdżony Radix Dialog nie domykał animacji wyjścia). `store.addTailoring` usuwa `photo_source` z historii, żeby nie dublować obrazów w localStorage], `template-picker.tsx`) ·
`new-cv-dialog.tsx` (modal wyboru szablonu, sticky stopka) · `cv-import-button.tsx`
(import CV — TYLKO w edytorze, `section-list.tsx`; wypełnia bieżące CV, przy niepustym CV prosi o potwierdzenie nadpisania — usunięty z listy „Moje CV" 2026-07-30, żeby nie dublować drogi tworzenia CV) · `cv-compare-dialog.tsx` · `cv-pdf.tsx`+`cv-pdf-boczny.tsx`+`cv-pdf-prestizowy.tsx`+`cv-pdf-grafitowy.tsx`+`cv-pdf-pastelowy.tsx`+`download-pdf-button.tsx` (eksport
PDF, font Lato z `public/fonts`; `CvPdf` deleguje układy własne do dedykowanych komponentów) · `template-gallery.tsx` (galeria: wiersz na kategorię, przewijanie w bok; używana przez `template-picker.tsx` i `new-cv-dialog.tsx`) · `pdf-preview.tsx` (`PdfPreview` / `PdfThumb` — podgląd = PRAWDZIWY plik PDF wygenerowany w przeglądarce i narysowany przez pdf.js na kanwie, strona po stronie; patrz „Konwencje i pułapki"; używane przez `cv-preview.tsx` i `template-thumb.tsx`) · `confirm-delete-button.tsx` (`ConfirmDeleteButton` — jedyny dozwolony kosz na listach: widoczny na dotyku, potwierdzenie drugim kliknięciem) · `template-thumb.tsx` (miniatura = przeskalowany
CvDocument; bez propa `width` MIERZY kontener i wypełnia go — nie da się wtedy uciąć CV w szerokości; `crop` = przycięcie tylko w pionie; `demo` podstawia `STOCK_PHOTO` w układach ze zdjęciem, gdy użytkownik nie wgrał własnego — TYLKO w galerii, nigdy w CV ani PDF; `full` pokazuje wszystkie strony zamiast pierwszej — używane w porównaniu) · `select-cv-dialog.tsx` · `cv-library-sync.tsx` (autosync aktywne CV→biblioteka) · `store-hydration.tsx` · `ui/` (shadcn).

**Usunięte z UI 2026-08-04 (decyzja Marka):** wybór przykładowego CV
(`sample-cv-picker.tsx` skasowany; dane `sample-cv.ts` ZOSTAJĄ — używa ich
12 skryptów testowych) oraz karta „Twoje dane" w ustawieniach (eksport JSON
i „wyczyść dane lokalne"). Powód eksportu/czyszczenia: obie pozycje dotyczyły
`localStorage`, które po przejściu na bazę przestało być źródłem prawdy —
eksport zrzucałby niepełny stan, a „wyczyść" czyściło jedną przeglądarkę,
sugerując usunięcie danych z konta. Prawdziwe odpowiedniki są w bazie
(`eksportuj_moje_dane`, `usun_moje_konto`). Przy okazji zniknął pasek
narzędziowy w `section-list.tsx` z przyciskiem „Wyczyść", który kasował całe CV
jednym kliknięciem bez potwierdzenia — po synchronizacji z bazą taka pomyłka
propaguje się na wszystkie urządzenia.

## Dokumenty prawne (od 2026-08-04)

Pakiet od prawnika (Creativa Legal) uzupełniony danymi firmy i **dopasowany do
tego, co kod realnie robi**. Firma: Markonn Marko Nowak, JDG/CEIDG, NIP
6443568932, REGON 522854985, ul. Mariana Maliny 5a/17, 41-200 Sosnowiec,
marko@aplikando.pl, czynny podatnik VAT.

**`src/lib/prawne/dane.ts` = JEDNO ŹRÓDŁO danych firmy.** Instrukcja prawnika
wymaga, żeby oznaczenie przedsiębiorcy było IDENTYCZNE w regulaminie, polityce,
stopce i dokumentach sprzedażowych — dlatego treści dokumentów składają je stąd,
a nie wpisują na sztywno. Tu też `DATA_OBOWIAZYWANIA` i `WERSJA_DOKUMENTOW`.

Treści: `regulamin.ts` (18 §) · `polityka-prywatnosci.ts` (12 celów
przetwarzania) · `regulamin-newslettera.ts` (od 2026-08-07 publikowany)
— jako Markdown-podobne stringi. **Numeracja jest DOSŁOWNIE tym, co stoi
w źródle**, bo cały regulamin odsyła do „§ 1 ust. 5 pkt 1"; automatyczne `<ol>`
przesunęłoby wszystkie odesłania przy wstawieniu jednego ustępu. Dlatego
`components/prawne/dokument-prawny.tsx` to własny, ~200-liniowy renderer, a nie
biblioteka markdown. Składnia: `##` nagłówek §, `1.` ustęp, `   1)` punkt
(3 spacje), `      a)` litera (6 spacji), `| a | b |` tabela, `**bold**`, `[x](/y)`.

**REGULAMIN OPISUJE APLIKACJĘ TAKĄ, JAKA JEST.** Zmiana flow rejestracji, cen,
dostawcy modeli AI albo listy dostawców = zmiana dokumentu w TYM SAMYM commicie
(ta sama zasada co dla tego pliku). Realne rozjazdy złapane przy pisaniu:
stopka landingu głosiła „Twoje dane nie opuszczają przeglądarki" (nieprawda od
przejścia na Supabase — usunięte); wzór obiecywał eksport danych z ustawień,
a `eksportuj_moje_dane` nie ma przycisku w UI (dokument opisuje eksport na
żądanie mailowe, bo tak jest naprawdę).

Dokumenty NIEpublikowane, w `dokumenty-prawne/` (poza `src`): umowa powierzenia
B2B + lista podwykonawców · wzory 4 zgód · wzory 3 wiadomości o zmianie ·
specyfikacja zgód na cookies · **`instrukcja-gtm.md`** = konfiguracja Google
Tag Managera od zera, krok po kroku (konto nie jest jeszcze założone) ·
**`WDROZENIE.md`** = checklista prawnika + 25 odstępstw od wzoru z uzasadnieniem
+ blokery przed publikacją.

**Zgody użytkownika (checkboxy, od 2026-08-05).** Trzy zgody z Regulaminu —
regulamin+polityka (§ 4 ust. 2 pkt 3), usługa przed upływem terminu na
odstąpienie (§ 4 ust. 8 pkt 3, § 8 ust. 5) i marketingowa (§ 4 ust. 20) — mają
wspólną treść w `components/prawne/etykiety-zgod.tsx` i wspólny wiersz-komponent
`components/prawne/checkbox-zgody.tsx`, na `components/ui/checkbox.tsx`
(shadcn/radix-nova, ten sam wzorzec `data-checked`/`data-unchecked` co
`switch.tsx`). **Rejestracja** (`formularz-auth.tsx`, wspólna dla modalu
i pełnej trasy) wymaga pierwszej zgody, blokuje „Załóż konto" bez niej.
**Zakup** (`paywall-dialog.tsx`, komponent `ZgodyZakupu`) wymaga OBU, gatuje
oba przyciski zakupu (plan i down-sell 12 zł), resetuje stan przy każdym
zamknięciu okna — zgoda nie ma prawa „zostać zaznaczona" z poprzedniej wizyty.
`/api/platnosc/checkout` waliduje obie zgody SERWEROWO (400 bez nich)
niezależnie od stanu UI — druga linia obrony na wypadek uderzenia w trasę
z pominięciem przycisków.

**ZGODA MARKETINGOWA (od 2026-08-07) — NIEOBOWIĄZKOWA I NIGDY NIĄ NIE BĘDZIE.**
Trzeci checkbox przy rejestracji, poza warunkiem `disabled` przycisku „Załóż
konto": zgoda niebędąca niezbędną do świadczenia usługi nie może warunkować
korzystania z niej (`wzory-zgod.md`, zasada wspólna nr 5). Osobny od zgody
nr 1 — łączenie zgody wymaganej z dobrowolną czyni tę drugą nieważną (zasada
nr 3). Formularza „podaj maila" na stronie NIE MA i nie będzie (decyzja Marka
2026-08-07); punktem wejścia jest wyłącznie rejestracja, co Regulamin
newslettera § 5 ust. 2 dopuszcza wprost („może nastąpić w jakikolwiek sposób,
w szczególności poprzez wypełnienie elektronicznego formularza").

**Stan mieszka w `profil.zgoda_marketing`, historia w dzienniku `zgoda`** —
zapisuje jedno miejsce, `ustawZgodeMarketingowa` w `lib/prawne/zapis-zgody.ts`
(najpierw stan, potem dziennik; przy błędzie stanu dziennika nie ruszamy).
Wycofanie NIE jest zmianą wiersza — dziennik jest niezmienny, więc powstaje
osobny wpis `marketing_wycofanie`. Powód: przy sporze faktem spornym jest
MOMENT wycofania, a samo `false` w profilu nie mówi kiedy.

**Wycofanie stoi w `/app/ustawienia`** (`components/auth/zgoda-marketingowa.tsx`,
przełącznik w `KartaKonta`) — art. 7 ust. 3 RODO: ma być tak łatwe jak
udzielenie, czyli jedno kliknięcie, nie mail z prośbą. Stan czyta z BAZY, nie
ze store'a; do czasu odczytu przełącznik jest nieaktywny, żeby nikt nie
przestawiał wartości, której jeszcze nie znamy.

⚠️ **Regulamin newslettera musi zostać opublikowany tak długo, jak istnieje ten
checkbox** — treść zgody linkuje do niego, a Krok III instrukcji prawnika tego
wymaga. ⚠️ **Ani jednego maila marketingowego bez linku rezygnacji** (Regulamin
newslettera § 5 ust. 7 pkt 1) — mechanizmu wysyłki jeszcze nie ma, otwarty
punkt w `WDROZENIE.md` sekcja D.

**Dziennik dowodowy zgód** (art. 7 ust. 1 RODO — ciężar dowodu, że zgoda
została udzielona, spoczywa na administratorze) — tabela `zgoda`
(`supabase/migrations/20260805103000_zgody.sql`, rozszerzona przez
`20260807120000_zgoda_marketing.sql`): `user_id`, `rodzaj`
(`regulamin_polityka` | `usluga_przed_odstapieniem` | `marketing` |
`marketing_wycofanie`), `wersja_dokumentow`,
`kontekst` (np. `rejestracja`, `zakup_subskrypcja:pro:rok`), `udzielono_o`
(czas RZECZYWISTEGO zaznaczenia, dostarczany przez klienta — może różnić się
od czasu zapisu, gdy rejestracja czeka na kod z maila). Niezmienny dziennik:
bez UPDATE/DELETE nawet dla właściciela wiersza; `on delete set null`, nie
`cascade` — dowód zgody musi przetrwać dłużej niż samo konto. Zapisuje
`src/lib/prawne/zapis-zgody.ts` — **NIGDY nie rzuca** (wzorzec `lib/mail.ts`):
awaria zapisu loguje błąd, ale nie blokuje rejestracji ani zakupu.
**Migracja zastosowana** (2026-08-05, `npx supabase link --project-ref
urjpluqutufsgkzysazq` + `db push --linked`, gdy MCP nie miał uprawnień) —
zweryfikowane wprost na bazie: RLS włączone, `SELECT`+`INSERT` dla
`authenticated`, brak `UPDATE`/`DELETE`, `anon` bez dostępu. `typy-bazy.ts`
odświeżony realnym `supabase gen types typescript --linked`. Przy okazji
odtworzony brakujący plik `20260804100643_stripe_tryb_testowy.sql` — ta
migracja była zastosowana na REMOTE bez commitu do repo, co blokowało
`db push`/`db pull` (`LegacyDbPullMigrationConflictError`); treść odzyskana
z `supabase_migrations.schema_migrations`.

**Blokery odnotowane w `WDROZENIE.md`** (nie są zrobione): skrzynka
marko@aplikando.pl musi działać (jest punktem kontaktowym DSA) · tier Gemini
API musi być PŁATNY, bo darmowy trenuje na danych, a dokumenty stwierdzają,
że nie · umowy powierzenia z dostawcami (art. 28 RODO) · konfiguracja panelu
GTM od zera, patrz niżej.

## Zgody na cookies i narzędzia analityczne (od 2026-08-05)

Własny mechanizm zgód na shadcn/radix — **żadnej zewnętrznej platformy CMP**
(Cookiebot/Osano). Podstawa prawna: art. 398 ustawy z 12 lipca 2024 r. – Prawo
komunikacji elektronicznej (zastąpił art. 173 Prawa telekomunikacyjnego).
Pełne wymagania prawne i architektura: `dokumenty-prawne/specyfikacja-baner-cookies.md`.
Konfiguracja panelu GTM od zera (konto jeszcze nie istnieje), krok po kroku:
`dokumenty-prawne/instrukcja-gtm.md`.

**`src/lib/prawne/cookies-rejestr.ts` = JEDNO ŹRÓDŁO listy narzędzi.** Zasila
JEDNOCZEŚNIE tabelę w Polityce prywatności (`TABELA_COOKIES_MD` jest wstawiane
w treść dokumentu) i panel zgód w banerze — nie ma czego rozjeżdżać, bo miejsce
jest jedno. Każdy wpis niesie `przez: "gtm" | "kod" | null`, czyli skąd
narzędzie realnie startuje (pole dokumentacyjne, nie steruje ładowaniem) —
patrz niżej, dlaczego to rozróżnienie jest ważne.

**NARZĘDZIA IDĄ DWIEMA DROGAMI (decyzja Marka 2026-08-04: tagi w Google Tag
Managerze, nie pojedyncze skrypty w kodzie).** Vercel Analytics/Speed Insights
zostają ładowane z kodu — ich skrypty są pierwszostronne (`/_vercel/...`),
przeniesienie do GTM zamieniłoby żądanie pierwszostronne na trzeciostronne do
Google. GA4, Microsoft Clarity i Meta Pixel są tagami w kontenerze GTM
(`NEXT_PUBLIC_GTM_ID`) — kodu dla nich w repo NIE MA, identyfikatory (GA ID,
Pixel ID, Clarity ID) wpisuje się w tagach w panelu GTM, nie w env.

**⚠️ TAGI ŻYJĄ POZA REPO — `cookies-rejestr.ts` przestał być technicznie
wymuszalnym źródłem prawdy.** Dodanie tagu w GTM to teraz dwie minuty w panelu,
nie commit. Zastępuje go zasada organizacyjna, w tej kolejności: wpis w
rejestrze → podniesienie `WERSJA_ZGODY` → dopiero potem publikacja wersji
kontenera. Bez tego nowy tag ładowałby się u ludzi, którzy zgodzili się na
węższy zestaw — czyli bez zgody. Uprawnienie do publikowania kontenera powinno
mieć jedna osoba.

**⚠️ CONSENT MODE SAM NIE WYSTARCZA.** To protokół Google — GA4 go respektuje,
**Meta Pixel i Microsoft Clarity nie**. `ad_storage: denied` NIE powstrzymuje
Meta Pixela; odpali się i założy `_fbp`. Oba muszą mieć w panelu GTM ustawione
„Dodatkowe sprawdzenia zgody" (`ad_storage` dla Meta, `analytics_storage` dla
Clarity) — bez tego działają mimo odmowy, a poprawny baner tego nie wyłapie.

**`src/lib/cookies/zgody.ts`** — odczyt/zapis cookie `aplikando_zgody_cookies`
(`SameSite=Lax`, `Secure` na HTTPS, 12 miesięcy; treść: wersja, kategorie, data
ISO) + kasowanie plików narzędzi. **`WERSJA_ZGODY` PODNOSI SIĘ przy każdej
zmianie listy narzędzi** — bez tego nowe narzędzie ładowałoby się u osób, które
zgodziły się na węższy zestaw, czyli bez zgody. Niezgodna wersja = `null` =
„pytaj", nigdy „zakładaj zgodę".

**`src/lib/cookies/tryb-zgody-google.ts`** — Consent Mode v2. `default` ze
WSZYSTKIMI sygnałami `denied` idzie do `dataLayer` przy starcie aplikacji (to
same wpisy do tablicy, zero żądań i plików), `update` po zgodzie. Lista sygnałów
w jednej stałej, żeby `default` i `update` nie rozjechały się co do zakresu.
`gtag()` pcha dosłownie `arguments` (nie tablicę z rest) — kanoniczna postać ze
snippetu Google'a; to jedno z miejsc, gdzie zgoda potrafi po cichu nie dotrzeć
do tagów, więc nie ryzykujemy odstępstwem mimo że oba są array-like
(`eslint-disable-next-line prefer-rest-params` z uzasadnieniem w kodzie).

**`src/components/cookies/`**: `kontekst-zgod.tsx` (`DostawcaZgodCookies` +
`useZgodyCookies`; stoi w `app/layout.tsx`, `children` idzie propem, więc drzewo
stron zostaje serwerowe) · `baner-cookies.tsx` (pasek dolny, pierwsza wizyta) ·
`panel-cookies.tsx` (dialog „Dostosuj"/„Ustawienia cookies"; stan przełączników
mieszka w `TrescPanelu`, osobnym komponencie montowanym od nowa przy każdym
otwarciu — Radix odmontowuje zawartość zamkniętego dialogu, więc `useState`
zawsze startuje od aktualnie zapisanej zgody, bez efektu synchronizującego,
którego i tak wytknęłoby `react-hooks/set-state-in-effect`) ·
`skrypty-narzedzi.tsx` (Vercel Analytics warunkowo z kodu, kontener GTM
warunkowo po zgodzie na którąkolwiek kategorię opcjonalną) ·
`przycisk-ustawien-cookies.tsx` (odnośnik w stopce).

**ŻADEN SKRYPT NIE ŁADUJE SIĘ PRZED ZGODĄ — to nie jest wstrzymanie zdarzeń,
tylko brak pobrania skryptu.** Ładowanie „na wszelki wypadek" i wysyłanie
zdarzeń dopiero po zgodzie jest naruszeniem, bo sam skrypt zakłada już pliki.
Dlatego `skrypty-narzedzi.tsx` wstawia `<script>` ręcznie w efekcie, a nie przez
`next/script` (ten trzyma własny rejestr wczytanych skryptów i nie gwarantuje,
że warunkowe odmontowanie cokolwiek cofnie). Vercel świadomie BEZ paczek
`@vercel/analytics` / `@vercel/speed-insights` — sprowadzają się do wstawienia
tych samych dwóch skryptów `/_vercel/...`, a jedna droga wstawiania = jedno
miejsce do audytu. **Nie wklejać snippetu GTM ręcznie do `layout.tsx`** — to
ominęłoby cały mechanizm zgód, ładując kontener zawsze, również przy odmowie.

**Wycofanie zgody działa NAPRAWDĘ:** kasuje pliki narzędzia (`_ga`, `_ga_*`,
`_gid`, `_gat*`, `_clck`, `_clsk`, `_fbp`, `_fbc`) i przeładowuje stronę.
Odmontowanie `<script>` nie wyładowuje kodu działającego już w karcie. Pliki
kasujemy na wszystkich wariantach domeny (host, `.host`, domena rejestrowalna) —
GA zakłada `_ga` na `.aplikando.pl`, więc kasowanie z samego hosta zostawiłoby
go nietkniętym. Sprzątanie leci przy KAŻDYM wejściu dla kategorii bez zgody, nie
tylko w chwili kliknięcia — narzędzie mogło zdążyć zapisać plik między
kliknięciem a przeładowaniem, a zgoda mogła też wygasnąć.

**Brak migotania:** cookie czytamy w efekcie po hydracji i do tego czasu
(`gotowe === false`) baner NIE jest renderowany. Baner pojawia się dopiero, gdy
WIEMY, że zapisanej zgody nie ma. Odwrotny układ (render od razu, chowanie po
odczycie) dawałby błysk u każdego, kto już zdecydował.

**Bez dark patternów** (wytyczne EROD, decyzje UODO): zgody domyślnie
odznaczone, „Odrzuć wszystkie" obok „Akceptuję wszystkie" — ten sam rozmiar,
rząd i jedno kliknięcie, baner BEZ krzyżyka (zamknięcie nie może uchodzić za
zgodę). Odmowa niczego nie ogranicza.

**Landing (`/`, od 2026-08-10) — sekcje w `src/components/landing/`, jedna
na plik, złożone w `src/app/page.tsx`.** Kolejność: hero (z `CvTemplateMarquee`
w tle, patrz niżej) → `ProofSection` (statyczny, ręcznie przygotowany przykład
wyniku — NIE żywy `scoring.ts` liczony na serwerze; kategorie i wagi
odpowiadają realnej rubryce, ale liczby są zmyślone na potrzeby przykładu,
stąd dopisek „5 z 9 kryteriów") → `HowItWorksSection` → `WhyDifferentSection`
(argument „AI nie pisze CV" jako osobna sekcja, nie dopisek) → „dwie ścieżki"
i „cechy" (bez zmian) → `TemplateShowcaseSection` (prawdziwe `TemplateThumb`,
nie mockupy — 6 z 9 szablonów) → `PricingSection` (`id="cennik"`, dane z
`subscription.ts`, WYŁĄCZNIE informacyjna — wybór okresu i zakup żyją w
`paywall-dialog.tsx` po zalogowaniu) → `FaqSection` (natywny
`<details>/<summary>`, celowo bez biblioteki akordeonu — jedyne miejsce, które
go potrzebuje) → CTA końcowe (bez zmian) → `Stopka`.

**Plan treści: `scripts/blog/PLAN-TRESCI.md`** — 15 tematów w trzech falach
publikacji, każdy z frazą główną, szkicem sekcji, linkowaniem wewnętrznym
i **haczykiem sprzedażowym** (most między treścią a produktem). Zawiera też
zasady wstawek sprzedażowych i twarde granice treści (zakaz obiecywania
zatrudnienia — Regulamin § 3 ust. 13, zakaz opisywania nieistniejących funkcji).
Skill `/blog-post` czyta ten plik na starcie. Kolejność fal jest celowa: świeża
domena nie wygra frazy „jak napisać CV" z pracuj.pl, więc zaczynamy od wąskich
pytań i budujemy autorytet, zanim sięgniemy po frazy główne.

**Dlaczego brak sekcji „social proof"/liczników użycia (inspiracja: resumax.ai)
— decyzja Marka 2026-08-10.** Aplikacja ma dziś ZERO użytkowników (patrz
`WDROZENIE.md`), więc loga firm, cytaty klientów i liczniki „X CV
dopasowanych" byłyby zmyślone. Dodać dopiero, gdy będą prawdziwe dane.

**`CvTemplateMarquee`** (`src/components/cv-template-marquee.tsx`) — diagonalna,
bardzo przezroczysta (opacity kafelków 8%) karuzela PRAWDZIWYCH miniatur
szablonów w tle hero, na całą szerokość strony (wyjęta z `max-w-4xl` treści do
osobnej, nieograniczonej sekcji — treść stoi nad nią w `relative z-10`).
Zanikanie na krawędziach przez dwa nakładające się gradienty do
`var(--background)`, NIE `overflow-hidden` bez maski (twardo ucinało kafelki).
Obrazki to statyczne PNG w `public/marketing/szablony/`, wygenerowane
JEDNORAZOWO skryptem `scripts/generuj-miniatury-marketing.ts` (ten sam
komponent co eksport PDF, nie osobna implementacja) — nie stockowe zdjęcia
z zewnętrznego CDN. `pointer-events-none`, czysto dekoracyjna.

## Bezpieczeństwo wejść od użytkownika (audyt 2026-08-10)

`src/lib/bezpieczenstwo/` — kontrole dla dwóch miejsc, w których dane obcego
pochodzenia docierają do serwera: wgrany plik CV i adres ogłoszenia.

**`adresy.ts` — SSRF.** `/api/dopasuj` pobiera ogłoszenie spod adresu podanego
przez użytkownika i ODSYŁA MU jego treść. Dawna walidacja sprawdzała tylko, czy
host zawiera kropkę — `127.0.0.1` też ją zawiera, więc każdy zalogowany mógł
kazać serwerowi odpytać `localhost`, sieć prywatną albo punkt metadanych chmury
(`169.254.169.254`) i odczytać wynik. `pobierzBezpiecznie` sprawdza schemat
(tylko http/https), rozwiązuje host i weryfikuje IP względem zakresów
prywatnych/pętli zwrotnej/link-local, powtarza kontrolę PRZY KAŻDYM
przekierowaniu (`redirect: "manual"` — `follow` sprawdziłby wyłącznie pierwszy
adres) i ucina odpowiedź na limicie rozmiaru. NIE chroni przed przepięciem DNS
— świadomie, patrz komentarz w pliku.

**`pliki.ts` — wgrywane CV.** Plik NIE JEST nigdzie zapisywany ani serwowany,
więc ryzykiem nie jest roznoszenie wirusów, tylko wroga zawartość atakująca sam
parser. Dwie kontrole przed oddaniem bajtów do pdf.js/mammoth: rozpoznanie
formatu po SYGNATURZE (wcześniej decydowało samo rozszerzenie nazwy, czyli dana
od wysyłającego) oraz kontrola współczynnika kompresji DOCX z katalogu
centralnego ZIP-a, żeby bomba zip nie wywróciła funkcji na pamięci, zanim limit
tekstu zdąży zadziałać. Do tego `przytnijDoModelu` w `parse-cv.ts` ogranicza
tekst idący do modelu (koszt tokenów).

**`pdfjs-dist` 5.6.205 ma podatność GHSA-hq66-cqwq-w95j** („arbitrary JS
execution upon opening a malicious PDF"). NIE dotyczy plików od użytkowników:
te parsuje `unpdf`, który ma WŁASNĄ, wbudowaną kopię pdf.js bez zależności od
`pdfjs-dist` i bez `isEvalSupported` w bundlu. `pdfjs-dist` służy wyłącznie do
podglądu PDF-ów, które sami generujemy. Aktualizacja wymaga skoku majora
(6.x) i przetestowania podglądu CV — otwarty punkt, nie pilny.

**`src/lib/ai/serwisy-ofert.ts` — lista serwisów, z których przyjmujemy LINK**
(decyzja Marka 2026-08-10). To filtr JAKOŚCI wejścia, NIE zabezpieczenie:
ogranicza przypadkowe wklejenie adresu bez związku z ofertą (artykuł, strona
główna firmy, dokument w chmurze), po którym model dostawał tekst bez wymagań
i produkował dopasowanie do niczego. Od bezpieczeństwa jest `adresy.ts`.

Odrzucenie NIE KOŃCZY DROGI — `/api/dopasuj` zwraca 422, a `tailor-flow` prosi
o wklejenie treści ręcznie (ta sama ścieżka, co przy portalu renderowanym
w przeglądarce). Dzięki temu lista może być niepełna, nikogo nie blokując.
`tailor-flow` sprawdza to też po stronie klienta, żeby powiedzieć o tym OD RAZU
w formularzu, zamiast po pełnym przebiegu analizy.

Dopasowanie obejmuje poddomeny (`jobs.lever.co` pasuje do `lever.co`), ale nie
domeny kończące się tym samym ciągiem (`nie-pracuj.pl` ≠ `pracuj.pl`) ani
prefiksowe podszywanie (`pracuj.pl.zly-host.com`). Cztery grupy: polskie
portale, zagraniczne, praca zdalna oraz **systemy rekrutacyjne (ATS)** — ta
ostatnia jest równie ważna, bo coraz więcej ofert żyje wyłącznie pod adresem
typu `jobs.lever.co/firma/…` albo `firma.myworkdayjobs.com`.

⚠️ **Moduł NIE MOŻE importować niczego z `node:`** — sięga po niego komponent
kliencki `tailor-flow.tsx`. Z tego samego powodu `czyPoprawnyLink` przeniesiono
tu z `fetch-oferta.ts` (które przez kontrolę SSRF ciągnie `node:dns`);
`fetch-oferta` re-eksportuje ją dla zgodności.

Weryfikacja: `npx tsx scripts/probne-audyt.ts` (skrypt roboczy, poza repo —
33 kontrole: odrzucanie adresów prywatnych, sygnatury plików, bomba zip, lista
serwisów wraz z próbami podszycia się pod domenę).

## Blog (`/blog`, od 2026-08-10)

Kanał pozyskiwania ruchu organicznego. Treść pisze AI przez skille
(`.claude/commands/blog-*.md`), redakcję i publikację robi człowiek
w `/admin/blog`.

**Nazewnictwo POLSKIE, jak reszta schematu** — tabela `wpis_bloga`, nie
`blog_posts`; kolumny `tytul`/`tresc`/`zajawka`. Skille są napisane pod te
nazwy, więc nie ma dwóch konwencji do pogodzenia.

**TRZY RZECZY, KTÓRE ŁATWO ZEPSUĆ:**

1. **`grant select on public.wpis_bloga to anon` JEST OBOWIĄZKOWY.** Migracja
   `20260802160403_rls_polityki.sql` kończy się `revoke all on all tables in
   schema public from anon`. Sama polityka RLS „opublikowane widzą wszyscy" nic
   nie da — brak grantu ucina dostęp, zanim RLS zostanie sprawdzone. Blog byłby
   pusty dla całego ruchu z Google i przy `generateStaticParams` w buildzie.
2. **Podgląd szkiców idzie przez `SECURITY DEFINER` RPC `wpis_po_tokenie()`,
   NIE przez `service_role`.** `klient-admin.ts` zostaje wyłącznie w webhooku
   Stripe'a.
3. **`profil.rola`** jest bezpieczne tylko dlatego, że `20260802160403` robi
   `revoke update on profil from authenticated` + `grant update
   (zgoda_marketing)`. Grant jest KOLUMNOWY, więc nikt nie podniesie sobie roli.
   Rozszerzenie tego grantu na całą tabelę natychmiast otworzyłoby dziurę.

**Pliki:** `lib/blog/typy.ts` (kształt wpisu + `KATEGORIE_BLOGA`) ·
`lib/blog/utils.ts` (slug z polskimi znakami, czas czytania, kotwice
w nagłówkach, `usunPromptyObrazkow`, `przygotujTresc` = jedno wejście
wymuszające właściwą kolejność) · `lib/blog/schema.ts` (Article z
`dateModified`, FAQPage, BreadcrumbList) · `lib/blog/zapytania.ts` (odczyty) ·
`lib/blog/kompresja-obrazka.ts` (WebP w przeglądarce przed uploadem) ·
`lib/supabase/klient-publiczny.ts` (**nowy, czwarty klient** — bez sesji
i bez `cookies()`, żeby strony bloga dało się generować statycznie i odpytywać
w `sitemap.ts`; `klient-serwer` zdegradowałby je do renderowania na żądanie).

**Komponenty** (`components/blog/`): `artykul.tsx` (korpus WSPÓLNY dla
`/blog/[slug]` i podglądu — dwie kopie rozjechałyby się, a podgląd różniący się
od publikacji nie spełnia swojego zadania) · `karta-wpisu.tsx` ·
`tresc-wpisu.tsx` (generyczne CTA wstawiane automatycznie po ~40% akapitów;
przy ≤3 akapitach nie przerywa; ALE jeśli treść już zawiera ręcznie napisany
`<div class="blog-cta-inline">` — skill `/blog-post` pisze go z haczykiem
konkretnego artykułu, bo kontekstowe CTA konwertuje lepiej niż generyczne —
komponent wykrywa tę klasę i NIC nie dokłada, żeby nie dublować bloków)
· `faq-wpisu.tsx` · `cta-bloga.tsx` (jedno źródło adresu i tekstu
CTA, też dla skilla) · `spis-tresci.tsx` · `postep-czytania.tsx` ·
`udostepnij.tsx` (ikony marek jako wklejone SVG — ta wersja `lucide-react` ich
nie eksportuje, a zewnętrzny obrazek to żądanie do obcego serwera mimo odmowy
zgód) · `powiazane-wpisy.tsx` · `admin/` (formularz, edytor Tiptap, biblioteka
obrazków, edytor FAQ, podgląd SEO, akcje wiersza, okno obrazka).

**EDYTOR W PANELU NIE JEST NEUTRALNY DLA TREŚCI (2026-08-11).** Tiptap parsuje
HTML do swojego schematu i przy zapisie WYRZUCA wszystko, czego w schemacie nie
ma — cicho, bez błędu w `tsc`, w buildzie ani w konsoli. Skill `/blog-post`
pisze konstrukcje, od których zależy zachowanie renderu, więc każda z nich musi
mieć swój węzeł w `admin/rozszerzenia-tiptap.ts`. Cztery rzeczy, które ginęły
przed tą poprawką (wszystkie złapane dopiero testem, nie okiem):
`<figure>/<figcaption>` (podpis spadał do zwykłego akapitu i tracił oprawę
`prose-figcaption`), `class="image-prompt"` (bez niej `usunPromptyObrazkow` nie
rozpoznaje promptu → prompt do generatora grafik trafia do CZYTELNIKA),
`class="blog-cta-inline"` (bez niej `TrescWpisu` dokłada drugie, generyczne CTA
— potrafiło wylądować w środku tabeli) oraz brak `nofollow`: wtyczka linków
domyślnie dokleja `target="_blank" rel="noopener noreferrer nofollow"` do
KAŻDEGO linku, czyli `nofollow` na linkowaniu wewnętrznym, na którym stoi cała
strategia z `PLAN-TRESCI.md`.

**`admin/rozszerzenia-tiptap.ts` = JEDNO ŹRÓDŁO schematu** — bez `"use client"`
i bez importów z `@tiptap/react`, żeby `npm run test:edytor` mógł sprawdzać
DOKŁADNIE tę listę w Node (test na atrapie nie chroniłby przed niczym). Trzy
węzły własne: `ObrazekZPodpisem`, `AkapitPromptu`, `BlokCta`. Link i podkreślenie
konfiguruje się przez `StarterKit.configure({ link: … })` — w wersji 3 są jego
CZĘŚCIĄ, a dopisanie ich osobno daje „Duplicate extension names" i po cichu
ignoruje drugą konfigurację. Zerowanie domyślnych atrybutów wymaga jawnego
`{ target: null, rel: null }`, bo `configure()` SCALA obiekty — puste `{}`
zostawia domyślki nietknięte.

**Czego NIE da się utrzymać co do znaku:** tabele i listy Tiptap normalizuje
z założenia (`<thead>` wtapia się w `<tbody>`, treść komórek i punktów listy
dostaje `<p>`, dochodzi `<colgroup>`). Nie ma na to opcji, więc test wymaga tu
IDEMPOTENCJI (drugi zapis nie zmienia już nic) zamiast równości, a `globals.css`
zeruje marginesy `:is(td, th, li) > p`, żeby po pierwszym zapisie w panelu
tabele i listy nie zrobiły się luźniejsze.

**ALT USTAWIA SIĘ W OKNIE `admin/dialog-obrazka.tsx`**, nie ukrytym
`window.prompt` (tak było do 2026-08-11 — nic nie pokazywało, że obrazek alt
w ogóle ma). Ten sam przycisk paska wstawia nowy obrazek i edytuje zaznaczony.
PODPIS celowo NIE jest w oknie: to treść węzła, więc pisze się go wprost pod
obrazkiem. `FormularzWpisu` BLOKUJE publikację, dopóki któryś obrazek w treści
albo okładka nie ma alt-u (`obrazkiBezAltu` w `lib/blog/utils.ts`); zapis szkicu
przechodzi, bo wpis powstaje etapami. Klasa `edytor-tresci` (dokładana obok
`tresc-wpisu` tylko w panelu) niesie oznaczenia dla redaktora: obwódkę przy
pustym alcie i oprawę akapitu z promptem — czytelnik bloga ich nie widzi.

**SEO — rzeczy nieoczywiste:**
- **`metadataBase` w `layout.tsx`**: bez niego Next renderuje `og:image`
  i canonical jako ścieżki WZGLĘDNE, których crawlery i podglądy linków nie
  rozwiązują. Dotyczy CAŁEJ strony; brakowało go od początku projektu.
- **`sitemap.ts` MUSI mieć `revalidate`** — to Route Handler cache'owany
  domyślnie na stałe, więc bez tego nowy wpis nie trafiłby do sitemapy aż do
  kolejnego wdrożenia. `lastModified` bierzemy z `updated_at`, nie
  `new Date()`: fałszywe sygnały świeżości Google szybko przestaje honorować.
- **Paginacja `/blog?page=N`**: strony 2+ dostają `noindex, follow` (te same
  zajawki w innej kolejności = duplicate content), ale linki muszą być
  przechodzone, stąd `follow`.
- **`/blog` jest trasą dynamiczną**, bo czyta `searchParams` (paginacja).
  Artykuły są statyczne (SSG + ISR) i to one biorą ruch z wyszukiwarki.
  Gdyby lista stała się wąskim gardłem, trzeba przenieść paginację na segment
  (`/blog/strona/2`), a nie kombinować z cache'em.
- **`next.config.ts` → `images.remotePatterns`**: obrazki bloga są na domenie
  Supabase, a `next/image` domyślnie odmawia optymalizacji obcych adresów
  (błąd 400, nie ciche pominięcie).

## Dane strukturalne i widoczność w AI (od 2026-08-10)

Warstwa „co wyszukiwarka i model językowy wiedzą o tej stronie". Wszystko
składane z ISTNIEJĄCYCH stałych (`subscription.ts`, `dane.ts`,
`faq-landing.ts`) — nigdzie nie ma drugiego zapisu ceny ani danych firmy.
Powód nie jest estetyczny: dane strukturalne albo llms.txt z inną kwotą niż
kasa to informacja handlowa wprowadzająca konsumenta w błąd, a dla Google
powód do odebrania wyników rozszerzonych.

**`src/lib/faq-landing.ts` = JEDNO ŹRÓDŁO pytań z landingu.** Zasila
JEDNOCZEŚNIE sekcję `FaqSection` i schemat `FAQPage` (Google WYMAGA, żeby
treść schematu była widoczna na stronie — osobne, „lepsze pod SEO" pytania
w JSON-LD byłyby naruszeniem, nie optymalizacją). Odpowiedzi są CZYSTYM
TEKSTEM, nie JSX, bo schemat przyjmuje tekst; odnośnik wewnątrz odpowiedzi
opisuje pole `odnosnik: {fraza, href}`, a komponent podmienia frazę na
`<Link>` przy renderowaniu. Moduł stoi w `lib/`, nie w komponencie, żeby
`schema-strony.ts` nie musiał importować z `components/`.

**`src/lib/schema-strony.ts`** — JSON-LD landingu, odpowiednik
`lib/blog/schema.ts`: `Organization` (dane rejestrowe z `dane.ts`),
`WebSite`, `SoftwareApplication` (wszystkie oferty cennika + plan darmowy jako
osobna pozycja z ceną 0) i `FAQPage`. Encje spina `@id`, więc cztery osobne
tagi `<script>` opisują JEDNĄ organizację. **Świadomie BEZ `aggregateRating`
i `review`** — zero użytkowników znaczy, że oceny musiałyby być zmyślone
(ta sama zasada, co brak sekcji „social proof" na landingu).

**`/llms.txt`** (`src/app/llms.txt/route.ts`) — mapa serwisu dla modeli
językowych wg konwencji llmstxt.org. Różnica wobec `sitemap.xml`: sitemapa
mówi „te adresy istnieją", llms.txt mówi „to robi ten produkt, tyle kosztuje,
tego NIE robi". Sekcja „Czego ta aplikacja NIE robi" jest tam celowo — model
pytany o narzędzia do CV inaczej dopisze nam funkcje, których nie mamy.
`revalidate = 3600` z tego samego powodu, co w `sitemap.ts` (Route Handler
cache'owany domyślnie na stałe → nowy wpis bloga nie trafiłby do pliku aż do
wdrożenia). Żaden dostawca nie gwarantuje, że go czyta — koszt utrzymania jest
zerowy, bo plik składa się z istniejących stałych.

**`robots.ts` — trzy grupy zamiast jednej.** Roboty AI są WYPISANE z nazwy,
mimo że mają te same reguły co `*`, bo robot, który znajdzie grupę ze swoją
nazwą, ignoruje `*` w całości; jawny wpis oznacza, że przyszła zmiana reguł
ogólnych nie ominie ich po cichu. Grupy: wyszukiwarki AI odpytujące na żywo
(`OAI-SearchBot`, `ChatGPT-User`, `Claude-User/SearchBot`, `PerplexityBot`…
— przynoszą ruch i cytowania, blokada byłaby strzałem w stopę) oraz roboty
TRENUJĄCE (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`…). Dla obu
dziś ZGODA — zmiana to jedna linijka (`allow` → `disallow: "/"`).
`Google-Extended` i `Applebot-Extended` nie są robotami, tylko przełącznikami
zgody na trenowanie; ich blokada nie wpływa na pozycje w wyszukiwarce.

**`layout.tsx`: Open Graph, karta Twittera i `max-snippet:-1`.** Ostatnie
zdejmuje limit długości fragmentu w wynikach — ma znaczenie też dla odpowiedzi
generowanych przez AI (krótszy dozwolony fragment = mniejsza szansa, że
zacytowany zostanie sensowny kawałek). **`alternates.canonical` NIE stoi
w `layout.tsx`** — metadane są dziedziczone, więc adres z korzenia
przykleiłby się do każdej podstrony, która go nie nadpisuje, i ogłosił blog
duplikatem landingu. Canonical ustawia każda strona u siebie.

⚠️ **`og:image` to dziś logo 512×409, nie grafika promocyjna** — link
udostępniony na LinkedInie pokazuje mały kafelek. Docelowo `opengraph-image.tsx`
(1200×630); brak `og:image` byłby gorszy (żadnej miniatury).

**Panel `/admin`:** `proxy.ts` odsiewa niezalogowanych, `app/admin/layout.tsx`
sprawdza rolę przez RPC `czy_admin()` i przy braku daje `notFound()` (komunikat
o braku uprawnień potwierdzałby, że panel istnieje). Sprawdzanie roli NIE stoi
w `proxy.ts` celowo — biegłoby przy każdym żądaniu, także na blogu i landingu.

**Trasy** (`src/app/`): `/` landing · `/blog` lista · `/blog/[slug]` artykuł ·
`/blog/podglad/[token]` podgląd szkicu · `/admin/blog` panel redakcyjny ·
`/rejestracja` · `/logowanie` ·
`/reset-hasla` (wszystkie trzy = `StronaAuth`) · `/auth/callback` (powrót
z logowania Google, trasa serwerowa) · `/dokoncz-rejestracje` (bramka zgody dla
kont OAuth bez wpisu w dzienniku) · `/regulamin` ·
`/polityka-prywatnosci` · `/regulamin-newslettera` (grupa `(prawne)`, wspólny
layout z `SiteHeader` + `Stopka`; wszystkie trzy dokumenty publikowane od
2026-08-07) · `/app` Start (onboarding/hub) · `/app/kreator`
lista „Moje CV" (+ Dodaj nowe; import CV tylko w edytorze) · `/app/kreator/edytor` edytor ·
`/app/dopasowania` historia · `/app/dopasowania/[id]` szczegóły (score-breakdown,
compare, changes, findings, paywall) · `/app/ustawienia`. API: `/api/dopasuj`
(pipeline), `/api/parsuj-cv` (import), `/api/zglos-blad` (raport do nas + potwierdzenie
dla zgłaszającego; bez klucza albo przy błędzie wysyłki loguje zgłoszenie i tak zwraca
użytkownikowi sukces — docelowo zapis też do tabeli `zgloszenie_bledu`),
`/api/konto/powitanie` (mail powitalny, fire-and-forget), `/api/konto/usun`
(usunięcie konta + potwierdzenie mailem — RPC leci klientem SESYJNYM, nie adminem,
bo `usun_moje_konto()` bierze użytkownika z `auth.uid()`),
`/api/platnosc/{checkout,webhook,portal}`. Wszystkie
API: `runtime nodejs`, `maxDuration 60`.
Pliki generowane dla robotów (nie strony, ale trasy): `/robots.txt`
(`robots.ts`) · `/sitemap.xml` (`sitemap.ts`) · `/llms.txt`
(`llms.txt/route.ts`) — wszystkie trzy biorą domenę z `dane.ts`.

## Gdzie zmienić X

- **Logika wyniku / wagi / kryteria** → `scoring.ts` (rubryka) + `matching.ts` (pokrycie)
- **Co model wolno/nie wolno pisać** → `rewrite.ts` (prompt+straże) + `validator.ts` (twarde reguły)
- **Reguły odrzucania (frazesy, liczby, języki)** → `validator.ts`
- **Pytania wywiadu** → `interview.ts`
- **Parsowanie oferty** → `job-offer.ts` · **wiedza branżowa/synonimy** → `slownik.ts`
- **Import CV (ekstrakcja/mapowanie/linki)** → `parse-cv.ts` + `/api/parsuj-cv`
- **Pobieranie oferty z linku** → `fetch-oferta.ts` (wpięte w `/api/dopasuj`; przy niepowodzeniu 422 `kod:"link-nieudany"` → UI prosi o wklejenie treści)
- **Dopisanie serwisu z ogłoszeniami (portal / ATS)** → `src/lib/ai/serwisy-ofert.ts`, jedyne miejsce — moduł bez importów z `node:`, bo używa go też komponent kliencki
- **Kontrola adresów pobieranych przez serwer (SSRF)** → `src/lib/bezpieczenstwo/adresy.ts` · **kontrola wgrywanych plików** → `src/lib/bezpieczenstwo/pliki.ts`
- **Opis „co zmieniliśmy/dlaczego"** → `changes.ts`
- **Model danych CV** → `cv-schema.ts` (zmiana schematu = zmiana w store, edytorze, PDF)
- **Stan/persist/biblioteka CV** → `store.ts`
- **Szablony (wygląd)** → `cv-templates.ts` + `cv-pdf.tsx` — JEDEN renderer, żadnej wersji HTML do utrzymania (patrz „Podgląd CV to prawdziwy plik PDF"). Układy własne (osobne komponenty, ta sama struktura danych): `boczny` = `cv-pdf-boczny.tsx` (dwie kolumny, beżowy panel); `prestizowy` = `cv-pdf-prestizowy.tsx` (jedna kolumna, okrągłe zdjęcie, akcent #12716A, kafelki umiejętności); `grafitowy` = `cv-pdf-grafitowy.tsx` (dwie kolumny, ciemny panel #18181B, zdjęcie 208×250 pt oparte o krawędzie panelu); `pastelowy` = `cv-pdf-pastelowy.tsx` (dwie kolumny, ciepła kość słoniowa #F9F6F0, lekka typografia, zdjęcie 190×240 pt). Nowy szablon = wpis w `CV_TEMPLATES`, gałąź w `CvPdf`, wpis w `PDF_TEMPLATE_STYLES` i w `MARGINES_STRONY_PT`. Podgląd i miniatury dostaną go automatycznie — nie ma drugiego miejsca do zaktualizowania.
- **Weryfikacja wizualna PDF** → `npx tsx scripts/verify-szablon.ts <id>` (renderuje prawdziwy PDF do PNG w `scripts/_podglad/`, poza repo; sprawdza też kolejność tekstu dla ATS, brak rozstrzelonych liter i wariant ubogi — bez zdjęcia/projektów/języków). `verify-boczny.ts` = starszy, jednoszablonowy wariant.
- **Podgląd CV (wielostronicowy, 1:1 z plikiem)** → `pdf-preview.tsx` (`PdfPreview`, `PdfThumb`)
- **Ochrona przed rozcięciem sekcji/pozycji w PDF** → `SekcjaZNaglowkiem` (`cv-pdf-sekcja.tsx`) + `wrap={false}` na blokach pozycji w każdym `cv-pdf*.tsx` — `minPresenceAhead` NIE działa, patrz „Konwencje i pułapki"
- **Wybór modelu AI** → env `CV_MODEL_*` (bez ruszania kodu)
- **Treść dowolnego maila do klienta** → `src/lib/maile/tresci.ts` (jedno miejsce, każdy mail z paragrafem Regulaminu w komentarzu) · **oprawa/klocki** → `src/lib/maile/szablon.ts` · **sama wysyłka** → `src/lib/mail.ts`; maile autoryzacyjne to NIE tutaj, tylko panel Supabase (SMTP)
- **Podgląd wszystkich maili naraz** → `npx tsx scripts/probne-render-maili.ts <plik.json>` (poza repo, wzorzec `probne-*` w .gitignore) — renderuje 7 maili na przykładowych danych, bez wysyłania czegokolwiek
- **Wiadomość obsługiwana ręcznie (reklamacja, odstąpienie, DSA, wypowiedzenie)** → `dokumenty-prawne/wzory-wiadomosci-o-zmianie.md`, wzory 4–13 (każdy z terminem z Regulaminu)
- **PDF Regulaminu w mailach potwierdzających (checklista prawnika, poz. 1)** → `components/prawne/regulamin-pdf.tsx` (react-pdf, `renderToBuffer`, font Lato z dysku przez `path.join(process.cwd(), "public/fonts", …)` — NIE `/fonts/...` jak w `cv-pdf.tsx`, to działa tylko w przeglądarce). Konsumuje `lib/prawne/parsuj-dokument.ts` — parser wydzielony z `dokument-prawny.tsx`, WSPÓLNY dla strony WWW i PDF-a, żeby zmiana treści Regulaminu nigdy nie rozjechała jednego z drugim. Wysyłane z dwóch miejsc: `/api/konto/powitanie` (fire-and-forget z `formularz-auth.tsx` po rejestracji) i `/api/platnosc/webhook` (po `zakup`/`customer.subscription.created`, z jawną zgodą nr 2 — DWA różne paragrafy prawne zależnie od produktu, bo Odblokowanie Jednorazowe traci prawo odstąpienia od razu (art. 38 ust. 1 pkt 1), a Subskrypcja zachowuje 14 dni (art. 35) — wysłanie klientowi subskrypcji błędnej informacji byłoby dla niego szkodliwe)
- **Logowanie Google** → przycisk i `signInWithOAuth` w `formularz-auth.tsx` · wymiana kodu na sesję w `src/app/auth/callback/route.ts` · przeniesienie zgody przez przekierowanie w `lib/prawne/zgody-oauth.ts` · bramka zgody w `components/auth/dokoncz-rejestracje.tsx` + `app/dokoncz-rejestracje/page.tsx` · konfiguracja paneli (Google Cloud + Supabase) w `supabase/README.md`, sekcja „Logowanie Google"
- **Gdzie wymagamy konta** → `useBramaKonta` w miejscu akcji (dziś: `download-pdf-button.tsx`, `builder.tsx`); nigdy przez blokadę całej trasy — kreator ma zostać otwarty
- **Testowe konto do klikania UI** → `scripts/probne-konto-testowe.ts` (poza repo, wzorzec `probne-*` w .gitignore): `node --env-file=.env.local --import tsx scripts/probne-konto-testowe.ts` i `… usun`. Tworzy konto z `email_confirm: true`, więc ŻADEN mail nie wychodzi i nie zjada limitu Resend
- **Ceny, progi planów, limity, cena jednorazowa, darmowa pula** → `subscription.ts` (jedno źródło; UI tylko to renderuje, serwer bierze stąd limit do RPC)
- **Zapis/odczyt danych konta** → `src/lib/supabase/repo.ts`; kiedy się dzieje → `synchronizacja-konta.tsx`
- **Płatności** → `lib/stripe.ts` (klient, ceny z env) · `/api/platnosc/checkout` (start płatności) · `/api/platnosc/webhook` (JEDYNE miejsce nadające dostęp) · `/api/platnosc/portal` (zarządzanie subskrypcją). Cennik w Stripe zakłada `npm run stripe:produkty`
- **Sprawdzanie uprawnień w UI** → `useMaDostepDo`/`useMaSubskrypcje` w `store.ts`; store wypełnia je z bazy przez `pobierzUprawnienia` — nic w UI nie nadaje dostępu
- **Schemat bazy / RLS / RPC** → `supabase/migrations/` (nowa migracja, nigdy edycja starej) + odświeżenie `src/lib/supabase/typy-bazy.ts`; opis i konfiguracja panelu w `supabase/README.md`
- **Ustawienia logowania (kod na maila, Google, SMTP, redirecty)** → panel Supabase, NIE migracja — lista kroków w `supabase/README.md`
- **Dane firmy w dokumentach prawnych i stopce** → `src/lib/prawne/dane.ts` (jedno źródło); treść dokumentów → `src/lib/prawne/{regulamin,polityka-prywatnosci,regulamin-newslettera}.ts`; co jeszcze zostało do wdrożenia → `dokumenty-prawne/WDROZENIE.md`
- **Lista narzędzi cookies (tabela w polityce ORAZ panel zgód)** → `src/lib/prawne/cookies-rejestr.ts` — jedno źródło, plus PODNIESIENIE `WERSJA_ZGODY` w `src/lib/cookies/zgody.ts`
- **Dodanie/zamiana narzędzia analitycznego lub marketingowego** → wpis w rejestrze + hook ładujący w `src/components/cookies/skrypty-narzedzi.tsx` + identyfikator w env; nigdy import skryptu poza tym plikiem
- **Treść banera, przyciski, kategorie** → `src/components/cookies/{baner-cookies,panel-cookies}.tsx`
- **Treść trzech checkboxów zgody (regulamin+polityka, usługa przed odstąpieniem, marketing)** → `src/components/prawne/etykiety-zgod.tsx` — jedno źródło dla rejestracji i zakupu, zmień w OBU miejscach zgodnie z Regulaminem, jeśli zmieniasz brzmienie
- **Dziennik zgód (tabela `zgoda`)** → `supabase/migrations/20260805103000_zgody.sql` + `20260807120000_zgoda_marketing.sql` (schemat+RLS+enum) i `src/lib/prawne/zapis-zgody.ts` (zapis, nigdy nie rzuca); wywołania w `formularz-auth.tsx`, `zgoda-marketingowa.tsx` i `/api/platnosc/checkout`
- **Zgoda marketingowa (stan, wycofanie, treść maila potwierdzającego)** → `profil.zgoda_marketing` (stan) · `ustawZgodeMarketingowa` w `lib/prawne/zapis-zgody.ts` (zapis stanu + wpis w dzienniku) · `components/auth/zgoda-marketingowa.tsx` (przełącznik w ustawieniach) · `mailPowitalny(zgodaMarketing)` w `lib/maile/tresci.ts` + `/api/konto/powitanie` (drugi załącznik PDF). Wysyłki marketingowej NIE MA — patrz bloker w `WDROZENIE.md` sekcja D
- **Pytania FAQ na landingu (widoczne ORAZ w JSON-LD)** → `src/lib/faq-landing.ts` — jedno źródło dla `FaqSection` i schematu `FAQPage`; link w odpowiedzi przez pole `odnosnik`, nie przez JSX
- **Dane strukturalne landingu (Organization / WebSite / SoftwareApplication / FAQPage)** → `src/lib/schema-strony.ts`, wstawiane w `src/app/page.tsx`; dane bloga osobno w `src/lib/blog/schema.ts`
- **Opis produktu dla modeli językowych (czym jest, ile kosztuje, czego NIE robi)** → `src/app/llms.txt/route.ts`
- **Polityka wobec robotów AI (trenujące / wyszukiwarki AI) i ścieżki zamknięte dla robotów** → `src/app/robots.ts` (stałe `ZAMKNIETE`, `ROBOTY_WYSZUKIWANIA_AI`, `ROBOTY_TRENUJACE`)
- **Tytuł, opis, Open Graph, karta Twittera dla całej witryny** → `src/app/layout.tsx` (stałe `TYTUL`/`OPIS`); canonical — ZAWSZE w konkretnej stronie, nigdy w layoucie
- **Co edytor bloga wolno zapisać (nowy znacznik, klasa, atrybut w treści wpisu)** → `src/components/blog/admin/rozszerzenia-tiptap.ts` — czego nie ma w tym schemacie, to Tiptap kasuje przy zapisie BEZ ostrzeżenia; po każdej zmianie `npm run test:edytor`
- **Pasek narzędzi / okno obrazka w panelu bloga** → `src/components/blog/admin/edytor.tsx` + `dialog-obrazka.tsx`; walidacja alt-u przed publikacją → `obrazkiBezAltu` w `src/lib/blog/utils.ts`, wywołanie w `formularz-wpisu.tsx`

## Konwencje i pułapki

- **Cudzysłowy PL:** w stringach JS w `"..."` NIE może być prostego `"` w środku —
  użyj „ " (U+201E/U+201D). Złamało build w `scoring.ts`. W backtickach `` ` `` proste `"` OK.
- **PODGLĄD CV TO PRAWDZIWY PLIK PDF — nie ma drugiej implementacji szablonów** (`pdf-preview.tsx`, 2026-08-01). Do tej daty podgląd był RÓWNOLEGŁYM rendererem każdego szablonu w HTML/CSS (`cv-document*.tsx`, ~1600 linii) z własnym stronicowaniem (`paginated-cv-sheet.tsx`, ~430 linii), a plik powstawał w Yodze przez `@react-pdf`. Dwa silniki układu = dwa różne algorytmy łamania wiersza, zaokrąglania metryk fontu i modelu marginesów; ta sama treść dawała inną liczbę stron i inne miejsca podziału. Kolejne poprawki (`MARGINES_DOLU`, `data-blok`, `MARGINES_STRONY_PT`, przesuwanie per kolumna) zmniejszały różnicę, ale zgodność dwóch silników trzeba by utrzymywać w nieskończoność, przy każdej zmianie każdego szablonu. **Zgodność 1:1 nie jest już celem do osiągnięcia, tylko właściwością konstrukcji:** `PdfPreview` generuje plik w przeglądarce przez `renderujCvPdf` — TĘ SAMĄ funkcję, której używa „Pobierz PDF" — i rysuje jego strony przez pdf.js na kanwie. Nie da się tego zepsuć zmianą w szablonie, bo nie ma czego rozjeżdżać. Konsekwencje, o których trzeba wiedzieć: (a) podgląd odświeża się po `OPOZNIENIE_MS = 350` ms od ostatniej zmiany, nie na każdy znak; (b) tekst na kartce NIE jest zaznaczalny (raster, nie DOM); (c) render pdf.js chodzi na `requestAnimationFrame`, więc w tle karty stoi — to normalne, ale utrudnia testy automatyczne (kartę trzeba mieć na wierzchu); (d) każda strona rysuje się najpierw na kanwie POZA EKRANEM i trafia na widoczną jednym `drawImage` — bez tego bufora pdf.js czyściłby kanwę na starcie i przy każdej zmianie CV migałaby biała plama; (e) generowanie jest SZEREGOWE (`wKolejce`) i cache'owane po treści (`PAMIEC`) — galeria pokazuje 9 miniatur naraz i bez kolejki 9 renderów Yogi blokowało wątek na sekundy.
- **PDF: nagłówek sekcji trzyma się pierwszego wpisu przez `SekcjaZNaglowkiem`, pozycja (doświadczenie/projekt/edukacja) dostaje `wrap={false}`** — w KAŻDYM `cv-pdf*.tsx`. Bez tego react-pdf renderuje nagłówek nawet wtedy, gdy po nim nie ma miejsca na ANI JEDNĄ pozycję — wygląda to jak przypadkowe ucięcie sekcji w połowie (realny bug: „Projekty" osierocone na dole strony 1). `wrap={false}` na bloku pojedynczej pozycji chroni przed rozcięciem jej w pół zdania między stronami. Dlaczego nie `minPresenceAhead` — patrz niżej.
- **`letterSpacing` w react-pdf wstawia REALNE odstępy** — powyżej ~10% rozmiaru fontu ekstrakcja czyta „D O Ś W I A D…”, a systemy rekrutacyjne rozpoznają sekcje po nazwach nagłówków. Limit: **max 8% fontu** (przy 10 pt granica leży między 1,0 a 1,2). Pilnuje tego `scripts/verify-szablon.ts`.
- **Po KAŻDEJ zmianie zestawu tras (dodanie i usunięcie) wyczyść `.next`.** Przy usunięciu stary type-validator odwołuje się do nieistniejącej trasy i wywala build. Przy DODANIU jest gorzej, bo nic nie krzyczy: nowa trasa działa w sesji, w której powstała, a po restarcie dev servera zwraca **404 mimo obecnego pliku** (zdarzyło się `/rejestracja`, 2026-08-02 — plik na dysku, `tsc` czysty, w logach `GET /rejestracja 404`). Wygląda to jak błąd w kodzie, a jest nieaktualnym manifestem tras. `Remove-Item .next -Recurse -Force` i restart.
- **React StrictMode w dev dubluje** wywołanie AI (2× koszt) — w produkcji nie; `tailor-flow` ma na to zabezpieczenie (`produkcjaRef`).
- **Mobile:** modale flex-col ze sticky stopką / poziomym scrollem; unikać poziomego overflow (min-w-0 w gridzie).
- **Miniatura CV nigdy nie dostaje sztywnego `width`** — `TemplateThumb` bez tego propa MIERZY swój kontener i wypełnia go. Sztywne `width={220}` w kolumnie o szerokości 140 px ucinało jedną trzecią CV (realny bug na telefonie w „Moje CV", `SelectCvDialog` i szczegółach dopasowania). Ucinać wolno TYLKO w pionie — prop `crop` (wielokrotność szerokości, np. `0.8`); obcięty bok wygląda jak zepsuty layout, obcięty dół czyta się jak dalszy ciąg strony.
- **Margines pionowy strony PDF MUSI iść przez `fixed` spacer, nie przez padding** (`cv-pdf-boczny/grafitowy/pastelowy`, 2026-07-31). Padding zwykłego `<View>` react-pdf nakłada RAZ na cały przepływający blok: strona 1 dostaje górę, ostatnia dół, a **strony pośrednie NIC** — zmierzone 8,4–9,9 pt od krawędzi („projekty za blisko góry", zgłoszone przez użytkownika na realnym PDF-ie). Rozwiązanie: `<View style={s.odstepGory} fixed />` jako pierwsze dziecko kolumny głównej (`fixed` powtarza element na każdej kartce) + `paddingBottom` na kolumnie. **Paddingu na `<Page>` użyć NIE MOŻNA** — w układzie dwukolumnowym (`flexDirection: row-reverse`) rozbija paginację: dokument rósł z 2 do 3 stron, a kolumna główna przeskakiwała o stronę zostawiając ~480 pt pustki (sprawdzone: `paddingTop`, `paddingBottom` i oba naraz dają ten sam efekt). Weryfikacja: `npm run verify:marginesy` — renderuje długie CV we wszystkich 9 szablonach i wypisuje margines górny/dolny KAŻDEJ strony. Po poprawce: 38–82 pt góra, 36–107 pt dół, liczba stron bez zmian.
- **`minPresenceAhead` jest w tej wersji react-pdf IGNOROWANY — nie polegaj na nim.** Sprawdzone na `boczny` dla 55/80/140 pt, z property na `<Text>`, na `<View>` i na osobnym wrapperze: nagłówek „Projekty" i tak zostawał sam na dole kartki. Zamiast tego **`SekcjaZNaglowkiem`** (`cv-pdf-sekcja.tsx`) trzyma nagłówek i PIERWSZY wpis w jednym bloku `wrap={false}` — twarda gwarancja zamiast podpowiedzi. Używają jej wszystkie szablony z sekcjami listowymi. Osobny moduł, bo `cv-pdf.tsx` importuje układy własne i import w drugą stronę robiłby cykl. Kontrola: `npm run verify:marginesy` oznacza takie przypadki jako `<-- OSIEROCONY NAGŁÓWEK`.
- **`@react-pdf/renderer` nadaje `<Link>` domyślnie `color:"blue"` + podkreślenie** (jak nieostylowany `<a>` w przeglądarce) — jeśli styl przekazany do `<Link>` nie ustawia WŁASNEGO `color`, link wychodzi niebieski w PDF, nawet gdy podgląd HTML pokazuje go w kolorze tekstu (bo tam Tailwind resetuje `<a>` do `color:inherit`). Realny bug w `cv-pdf-boczny.tsx` (`pozycjaPanelu` bez `color` → niebieski link mimo czarnego podglądu). Zasada: KAŻDY `<Link style={...}>` w `cv-pdf*.tsx` musi mieć w tym stylu jawny `color`, nie polegać na dziedziczeniu.
- **Umiejętności w panelu bocznym (boczny/grafitowy/pastelowy) to zwarty, zawijający się akapit (`.join(" · ")`), NIE lista jeden-wiersz-na-umiejętność** — przy szerszym stacku (20+ technologii, częste u automatyzatorów/fullstacków) pionowa lista zajmowała połowę panelu i wyglądała jak nieskończone wyliczanie (realny feedback użytkownika: „wygląda to obrzydliwie"). Wzorzec przejęty ze wspólnego `cv-pdf.tsx`, gdzie umiejętności od zawsze są akapitem. Języki obce ZOSTAJĄ listą (zwykle 2–3 pozycje, nie ma problemu długości).
- **Wysokości modali w `dvh`, nie `vh`** — `vh` na telefonie liczy się do ekranu BEZ paska adresu, więc `h-[94vh]` chowa dolne przyciski pod paskiem.
- **W modalu przewija się TYLKO środek — nagłówek, krzyżyk i stopka stoją** (`section-dialogs.tsx`, 2026-07-30). `overflow-y-auto` na całym `DialogContent` znaczyło, że przy sekcji „Doświadczenie" z pięcioma pozycjami treść miała 3635 px przy 698 px okna: żeby zamknąć modal na telefonie, trzeba było przewinąć pięć ekranów po przycisk „Gotowe", a krzyżyk (`absolute` względem przewijanego kontenera) odjeżdżał w górę razem z treścią. Wzorzec: `DialogContent` = `flex flex-col overflow-hidden`, nagłówek i stopka `shrink-0`, środek `min-h-0 flex-1 overflow-y-auto`.
- **Kasowanie idzie przez `ConfirmDeleteButton`, nigdy przez `opacity-0 group-hover:opacity-100`** (`confirm-delete-button.tsx`, 2026-07-30). Bez prefiksu `sm:` przycisk na dotyku był NIEWIDOCZNY, ale w pełni klikalny (zerowa przezroczystość nie wyłącza `pointer-events`) i wypadał przy prawej krawędzi wiersza, czyli tam, gdzie ląduje kciuk — jedno tapnięcie kasowało sekcję CV albo całe dopasowanie bez śladu. Komponent trzyma jedno zachowanie dla wszystkich list: widoczny na dotyku, chowany do hovera od `sm`, pierwszy klik uzbraja („Na pewno?"), drugi kasuje, po 4 s uzbrojenie wygasa.
- **Modale nie zabierają fokusu polom tekstowym** — `DialogContent` ma domyślny `onOpenAutoFocus`, który zatrzymuje fokus na oknie. Bez tego na telefonie klawiatura wyskakiwała natychmiast po otwarciu (np. „Dopasuj do oferty") i zasłaniała treść, zanim użytkownik zdążył ją przeczytać. Fokus-trap, Esc i czytniki ekranu działają bez zmian.
- **Kafelek „Dodaj nowe" ZAWSZE pierwszy** w siatkach CV (`/app/kreator`, `SelectCvDialog`) — na telefonie lista jest jednokolumnowa, więc kafelek na końcu oznaczał długi scroll.
- **Pary pól w formularzach dostają `grid-cols-1 sm:grid-cols-2`** — na telefonie e-mail/telefon idą jedno pod drugim, pełną szerokością. `Input` ma `h-10 md:h-8` (cel dotykowy) i `text-base` na mobile (mniejszy font wymusza w iOS Safari auto-zoom przy fokusie).
- **Galeria szablonów poniżej 640 px to SIATKA, nie karuzela** (`useWaskiEkran` w `template-gallery.tsx`) — poziome przewijanie zagnieżdżone w pionowo przewijanym modalu jest na dotyku nieobsługiwalne.
- **Logo/nazwa marki** żyje w trzech miejscach osobno (nie jednym współdzielonym komponencie): `site-header.tsx` (landing), `app-shell.tsx` (pasek mobilny), `app-sidebar.tsx` (sidebar desktop, chowa tekst gdy `collapsed`) — każde renderuje `<Image src="/aplikando-icon.png">` + tekst „Aplikando" osobno, żeby tekst dało się chować/skalować niezależnie per kontekst. Zmiana nazwy/logo = zmiana we WSZYSTKICH trzech + `layout.tsx`/`edytor/page.tsx` (`<title>`) + `page.tsx` (hero/stopka landingu). Ikona wycięta z pełnego lockupu przez alpha-key (`255 - min(R,G,B)` na białym tle) — działa dobrze dla nasyconych kolorów, zostawia miękką krawędź bez twardego halo.
- **Commity:** po polsku, kończyć `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Repo: github.com/marko908/cv (branch `main`, Vercel auto-deploy z main; live: cv-eight-black-32.vercel.app).

## Komendy

Testy (tsx): `npm run test:walidator` (8) · `test:dopasowanie` (24) · `test:wywiad`
(18) · `test:petla` (zbieżność pętli wywiadu + dedup) · `test:zmiany` (anty-fantomy
w changes.ts) · `test:straz` (straż słów kluczowych + podłoga wyniku) ·
**`test:edytor`** (34 — wierność edytora bloga: czy zapis w panelu nie okrada
treści z `<figure>`, klas `image-prompt`/`blog-cta-inline` i nie dokleja
`nofollow`; wymaga `happy-dom`, bo buduje schemat ProseMirror poza przeglądarką). Na żywo
(wymagają klucza, `--env-file=.env.local`): `test:oferta`, `test:pipeline`, `test:mail` (wysyłka Resend),
`test-podloga-live.ts`, `test-koszt-live.ts` (pomiar tokenów/kosztu).
Dane testowe (20 CV + 18 ofert + pary): `scripts/dane-testowe.ts`.
`npm run build` (pełny), `npm run dev`. Typy: `npx tsc --noEmit`.
**`npm run verify:marginesy`** — renderuje długie CV we wszystkich 9 szablonach i wypisuje margines górny/dolny KAŻDEJ strony plus ostrzeżenie o osieroconym nagłówku. Uruchamiać po każdej zmianie w `cv-pdf*.tsx`. Od 2026-08-01 sprawdza to również podgląd — rysuje on ten sam plik, więc błąd w marginesach widać i w oknie, i w pobranym PDF-ie.

## Baza wiedzy (poza repo, w `Projekt CV/`)

`wiedza-cv-z-transkryptow.md` (synteza 16 poradników: rubryka 0–100, red flags, czasowniki, sprzeczności rozstrzygnięte) · `prompt-analiza-transkryptow-cv.md`.
Pamięć AI (cross-session): `MEMORY.md` + pliki `cv-copilot-pl-project`, `cv-copilot-ai-architecture`, `cv-wiedza-z-tutoriali`.
