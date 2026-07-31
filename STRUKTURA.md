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
PDF) · `unpdf`+`mammoth` (import PDF/DOCX). **AGENTS.md: to nie jest znany Next —
czytaj `node_modules/next/dist/docs/` przed pisaniem kodu Next.**

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
+ **wywiad** — KOD — `interview.ts` (`zbudujPytania` z luk oferty — każde pytanie niesie `kontekst`, czyli DOSŁOWNY cytat z ogłoszenia (`wymaganie.cytat`), pokazywany pod pytaniem w `tailor-flow`, bo zwięzłe wymaganie („Docker") wyrwane z kontekstu nie mówi, o jaki zakres pyta pracodawca; `zbudujPytaniaOMetryki` z punktów bez liczby — cytuje CAŁY punkt (helper `cytat`, limit 220 znaków i cięcie na granicy słowa), bo dawne ucinanie po 60 znakach gubiło sens: „…oraz współprace z influ…"; `zastosujOdpowiedzi` nakłada potwierdzone odpowiedzi na KOPIĘ CV, z deduplikacją dopinanych punktów → ponowny pipeline → wynik rośnie uczciwie). Domknięcie pętli: `tailor-flow` kumuluje id wszystkich pokazanych pytań (`obsluzoneRef`) i podaje je do pipeline przez `obsluzonePytania`; świeża analiza (`nowaAnaliza`)/`resetFlow` czyszczą ten zbiór.

Straże jakości: `rewrite.zgubionoLiczbe()` (metryka z oryginału nie może zniknąć),
`rewrite.zgubionoSlowoKluczowe()` (trafione słowo z oferty nie może zniknąć —
jego utrata obniża pokrycie/ATS; `zlozCv(oryginal, przepisanie, slowaKluczowe)`
cofa taki punkt do oryginału), `zlozCv` skleja punkty po `punkt_zrodlowy` (indeks
źródłowy, nie po kolejności).

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
  `activeCvId`. Typy: `AiMeta{matchScoreBefore/After, addedKeywords, changesLog,
  findings?, scoreBreakdown?, categories?, unlocked?}`, `ReviewFinding`, `Tailoring`
  (rekord historii: baseCv+tailoredCv+aiMeta+jobText), `SavedCv`. Akcje: `newCv`,
  `newCvFrom` (auto-włącza sekcje z danymi), `openCv`, `loadCv`, `syncActiveCv`,
  `renameCv`, `deleteCv`, `setAiMeta`, `addTailoring`/`removeTailoring`,
  `unlockReview`/`unlockTailoring`, `resetReview`.
- **Mock** (`mock-review.ts`): fallback bez klucza (`buildTailoring`, `runMockReview`)
  — deterministyczny, celowo krytyczny (≥3 poprawki dla paywalla). Od 2026-07-25 też
  liczy rubrykę (`stubDopasowanie`+`ocenCv`), spójnie z produkcją.

## Pliki wg odpowiedzialności

**`src/lib/ai/`**: `pipeline.ts` (orkiestracja) · `job-offer.ts` (oferta→wymagania,
AI) · `fact-ledger.ts` (CV→fakty, `digitsIn`/`normalize`) · `matching.ts` (dopasowanie,
wynik pokrycia, werdykt) · `slownik.ts` (wiedza branżowa, synonimy, rdzenie PL) ·
`rewrite.ts` (przepisanie, AI + straże) · `validator.ts` (anty-halucynacja) ·
`scoring.ts` (rubryka 0–100) · `changes.ts` (opis zmian + findings) · `interview.ts`
(pytania+aplikacja odpowiedzi) · `parse-cv.ts` (import: ekstrakcja tekstu + HIPERŁĄCZA z adnotacji PDF/hrefów DOCX + mapowanie AI; PDF otwierany RAZ na tekst i linki — pdf.js odłącza bufor po pierwszym `getDocumentProxy`, przez co drugie wywołanie cicho zwracało 0 linków; prompt normalizuje też WERSALIKI na naturalną pisownię) · `fetch-oferta.ts` (pobranie treści ogłoszenia z linku: JSON-LD JobPosting → HTML→tekst; `czyPoprawnyLink`, `BladPobraniaOferty`) · `models.ts` (wybór modeli+klucz).

**`src/lib/`**: `cv-schema.ts` · `store.ts` · `cv-templates.ts` (rejestr szablonów: `withPhoto`/`templateUsesPhoto`, `tags: TemplateTag[]` + `templatesByTag`, `TEMPLATE_CATEGORIES` = wiersze galerii, `ATS_OBIETNICA` = jedno źródło komunikatu o zgodności z ATS (używane przez `new-cv-dialog.tsx` i `template-picker.tsx`), `STOCK_PHOTO` = zdjęcie poglądowe `public/stock/kandydat.jpg`) ·
`sample-cv.ts` (Anna Kowalska — demo) · `sections.ts` (definicje sekcji edytora) ·
`utils.ts` (`cn`, `pluralize`) · `mock-review.ts`.

**`src/components/`**: `app-shell/` (sidebar+topbar mobilny drawer) · `builder/`
(edytor: `builder.tsx`, `section-list.tsx` [na górze działający import CV: `CvImportButton`; status sekcji „Dane osobowe" pokazuje „Dodaj zdjęcie profilowe" (nieblokujące, `filled` zostaje `true`) gdy szablon ma miejsce na zdjęcie a użytkownik go nie dodał], `section-dialogs.tsx`, `field-inputs.tsx`,
`readiness.tsx`, `match-results.tsx` [panel wyniku w edytorze; dziennik zmian gatowany tak samo jak w szczegółach dopasowania — `DARMOWE_ZMIANY=1`, reszta to „Szczegóły w pełnym raporcie". Bez tego pełne „co zmieniliśmy i dlaczego" dawało się przeczytać za darmo tuż po analizie, choć `/app/dopasowania/[id]` je blokuje], `tailor-flow.tsx` [modal dopasowania:
config→running→interview→result; karta pytania pokazuje pod treścią `kontekst` = dosłowny cytat z ogłoszenia], `paywall-dialog.tsx`, `score-breakdown.tsx`
[„Z czego wynika wynik" — wymaga propa `unlocked`: bez opłaconego dostępu widać tylko pierwsze `FREE_METRICS=2` kryteria (w kolejności z `breakdown`, więc zwykle te zależne od oferty), reszta to sam label + kłódka. Krok wywiadu „Możesz podnieść ten wynik" w `tailor-flow.tsx` (ekran `result`) jest z tego samego powodu zablokowany do czasu odblokowania — inaczej dałoby się podnieść wynik i pobrać wrażenie wartości bez płacenia; zablokowany wariant zostaje widoczny (teaser) i klika w paywall, nie w wywiad], `cv-preview.tsx` [podgląd na żywo w edytorze — deleguje render do `PaginatedCvSheet`, sam tylko mierzy dostępną szerokość i pokazuje placeholder pustego CV], `cv-document.tsx` [czysty render dokumentu (bez paginacji); podgląd HTML; układy własne deleguje do `cv-document-boczny.tsx` / `-prestizowy.tsx` / `-grafitowy.tsx` / `-pastelowy.tsx`], `photo-input.tsx` + `photo-cropper.tsx` [zdjęcie: pomniejszony oryginał `photo_source` (max 640px) + gotowy kadr `photo` (360px) + `photo_crop{zoom,ox,oy}`; kadrowanie zoom/przeciąganie to panel INLINE, nie modal (zagnieżdżony Radix Dialog nie domykał animacji wyjścia). `store.addTailoring` usuwa `photo_source` z historii, żeby nie dublować obrazów w localStorage], `template-picker.tsx`) ·
`new-cv-dialog.tsx` (modal wyboru szablonu, sticky stopka) · `cv-import-button.tsx`
(import CV — TYLKO w edytorze, `section-list.tsx`; wypełnia bieżące CV, przy niepustym CV prosi o potwierdzenie nadpisania — usunięty z listy „Moje CV" 2026-07-30, żeby nie dublować drogi tworzenia CV) · `cv-compare-dialog.tsx` · `cv-pdf.tsx`+`cv-pdf-boczny.tsx`+`cv-pdf-prestizowy.tsx`+`cv-pdf-grafitowy.tsx`+`cv-pdf-pastelowy.tsx`+`download-pdf-button.tsx` (eksport
PDF, font Lato z `public/fonts`; `CvPdf` deleguje układy własne do dedykowanych komponentów) · `template-gallery.tsx` (galeria: wiersz na kategorię, przewijanie w bok; używana przez `template-picker.tsx` i `new-cv-dialog.tsx`) · `paginated-cv-sheet.tsx` (`PaginatedCvSheet` — CV jako PRAWDZIWE, ODDZIELNE strony A4, każda we własnym ograniczonym prostokącie z cieniem/odstępem, jak w przeglądarkowym podglądzie PDF; technika „przesuwane okno" ze ŚWIADOMYM łamaniem stron — patrz „Konwencje i pułapki"; używane przez `cv-preview.tsx` i `template-thumb.tsx` [`full`]) · `confirm-delete-button.tsx` (`ConfirmDeleteButton` — jedyny dozwolony kosz na listach: widoczny na dotyku, potwierdzenie drugim kliknięciem) · `template-thumb.tsx` (miniatura = przeskalowany
CvDocument; bez propa `width` MIERZY kontener i wypełnia go — nie da się wtedy uciąć CV w szerokości; `crop` = przycięcie tylko w pionie; `demo` podstawia `STOCK_PHOTO` w układach ze zdjęciem, gdy użytkownik nie wgrał własnego — TYLKO w galerii, nigdy w CV ani PDF; `full` deleguje do `PaginatedCvSheet` — używane w porównaniu) · `select-cv-dialog.tsx` · `cv-library-sync.tsx` (autosync aktywne CV→biblioteka) · `store-hydration.tsx` · `ui/` (shadcn).

**Trasy** (`src/app/`): `/` landing · `/app` Start (onboarding/hub) · `/app/kreator`
lista „Moje CV" (+ Dodaj nowe; import CV tylko w edytorze) · `/app/kreator/edytor` edytor ·
`/app/dopasowania` historia · `/app/dopasowania/[id]` szczegóły (score-breakdown,
compare, changes, findings, paywall) · `/app/ustawienia`. API: `/api/dopasuj`
(pipeline), `/api/parsuj-cv` (import), `/api/zglos-blad` (stub, TODO Resend). Wszystkie
API: `runtime nodejs`, `maxDuration 60`.

## Gdzie zmienić X

- **Logika wyniku / wagi / kryteria** → `scoring.ts` (rubryka) + `matching.ts` (pokrycie)
- **Co model wolno/nie wolno pisać** → `rewrite.ts` (prompt+straże) + `validator.ts` (twarde reguły)
- **Reguły odrzucania (frazesy, liczby, języki)** → `validator.ts`
- **Pytania wywiadu** → `interview.ts`
- **Parsowanie oferty** → `job-offer.ts` · **wiedza branżowa/synonimy** → `slownik.ts`
- **Import CV (ekstrakcja/mapowanie/linki)** → `parse-cv.ts` + `/api/parsuj-cv`
- **Pobieranie oferty z linku** → `fetch-oferta.ts` (wpięte w `/api/dopasuj`; przy niepowodzeniu 422 `kod:"link-nieudany"` → UI prosi o wklejenie treści)
- **Opis „co zmieniliśmy/dlaczego"** → `changes.ts`
- **Model danych CV** → `cv-schema.ts` (zmiana schematu = zmiana w store, edytorze, PDF)
- **Stan/persist/biblioteka CV** → `store.ts`
- **Szablony (wygląd)** → `cv-templates.ts` + `cv-document.tsx` (HTML) + `cv-pdf.tsx` (PDF) — TRZYMAJ SPÓJNE. Układy własne (osobne komponenty, ta sama struktura danych): `boczny` = `cv-document-boczny.tsx` + `cv-pdf-boczny.tsx` (dwie kolumny, beżowy panel); `prestizowy` = `cv-document-prestizowy.tsx` + `cv-pdf-prestizowy.tsx` (jedna kolumna, okrągłe zdjęcie, akcent #12716A, kafelki umiejętności); `grafitowy` = `cv-document-grafitowy.tsx` + `cv-pdf-grafitowy.tsx` (dwie kolumny, ciemny panel #18181B, zdjęcie 208×250 pt oparte o krawędzie panelu); `pastelowy` = `cv-document-pastelowy.tsx` + `cv-pdf-pastelowy.tsx` (dwie kolumny, ciepła kość słoniowa #F9F6F0, lekka typografia, zdjęcie 190×240 pt). Nowy szablon = wpis w `CV_TEMPLATES`, gałąź w obu rendererach, wpis w `PDF_TEMPLATE_STYLES` i w mapie stylów `cv-document.tsx` (oba są `Record<TemplateId,...>`).
- **Weryfikacja wizualna PDF** → `npx tsx scripts/verify-szablon.ts <id>` (renderuje prawdziwy PDF do PNG w `scripts/_podglad/`, poza repo; sprawdza też kolejność tekstu dla ATS, brak rozstrzelonych liter i wariant ubogi — bez zdjęcia/projektów/języków). `verify-boczny.ts` = starszy, jednoszablonowy wariant.
- **Podgląd wielostronicowy (osobne strony A4)** → `paginated-cv-sheet.tsx` (`PaginatedCvSheet`)
- **Ochrona przed rozcięciem sekcji/pozycji w PDF** → `minPresenceAhead` na nagłówkach + `wrap={false}` na blokach pozycji w każdym `cv-pdf*.tsx`
- **Wybór modelu AI** → env `CV_MODEL_*` (bez ruszania kodu)

## Konwencje i pułapki

- **Cudzysłowy PL:** w stringach JS w `"..."` NIE może być prostego `"` w środku —
  użyj „ " (U+201E/U+201D). Złamało build w `scoring.ts`. W backtickach `` ` `` proste `"` OK.
- **Arkusz podglądu rozciąga dokument przez flex, nie przez `min-h-full`:** korzeń każdego szablonu ma `grow`, a rodzic (`cv-preview.tsx`, `template-thumb.tsx`) jest kolumną flex z minimum jednej kartki. `min-h-full` liczy się względem rodzica o wysokości `auto`, czyli wychodzi 0 — przy krótkim CV kolorowy panel urywał się w połowie kartki i zostawał biały pas.
- **`letterSpacing` w react-pdf wstawia REALNE odstępy** — powyżej ~10% rozmiaru fontu ekstrakcja czyta „D O Ś W I A D…”, a systemy rekrutacyjne rozpoznają sekcje po nazwach nagłówków. Limit: **max 8% fontu** (przy 10 pt granica leży między 1,0 a 1,2). Pilnuje tego `scripts/verify-szablon.ts`.
- **Build po usunięciu trasy:** wyczyść `.next` (stary type-validator odwołuje się do usuniętej trasy).
- **React StrictMode w dev dubluje** wywołanie AI (2× koszt) — w produkcji nie; `tailor-flow` ma na to zabezpieczenie (`produkcjaRef`).
- **Mobile:** modale flex-col ze sticky stopką / poziomym scrollem; unikać poziomego overflow (min-w-0 w gridzie).
- **Miniatura CV nigdy nie dostaje sztywnego `width`** — `TemplateThumb` bez tego propa MIERZY swój kontener i wypełnia go. Sztywne `width={220}` w kolumnie o szerokości 140 px ucinało jedną trzecią CV (realny bug na telefonie w „Moje CV", `SelectCvDialog` i szczegółach dopasowania). Ucinać wolno TYLKO w pionie — prop `crop` (wielokrotność szerokości, np. `0.8`); obcięty bok wygląda jak zepsuty layout, obcięty dół czyta się jak dalszy ciąg strony.
- **Podgląd CV renderuje się ZAWSZE w 794 px (A4) i jest SKALOWANY** (`cv-preview.tsx`, `template-thumb.tsx`, `paginated-cv-sheet.tsx`). Nigdy nie dawać `CvDocument` szerokości kontenera — tekst przelewa się wtedy inaczej niż w PDF i użytkownik ogląda układ, którego nie dostanie. Skala podglądu jest ograniczona do 1 (bez rozdmuchiwania kartki).
- **Wielostronicowy podgląd to OSOBNE prostokąty na stronę, NIE jeden ciągły arkusz zaokrąglony do pełnych stron** (`paginated-cv-sheet.tsx`, 2026-07-29). Wcześniejsza wersja renderowała jeden arkusz zaokrąglony w górę do pełnych stron z kreskowaną linią na granicy — gdy treść kończyła się w połowie ostatniej strony, zostawało to duży, niczym nieopisany biały obszar na dole, który realny użytkownik zgłosił jako „ucięty pasek" (dotyczyło zarówno `cv-preview.tsx`, jak i porównania przed/po w `cv-compare-dialog.tsx` — ten sam wzorzec, ten sam bug). Technika „przesuwane okno" (`PaginatedCvSheet`): treść mierzona RAZ poza ekranem (`position:absolute; left:-99999`), każda WIDOCZNA strona to własna kopia dokumentu przesunięta `translateY` o początek tej strony i przycięta `overflow:hidden` do dokładnie jednej kartki.
- **Łamanie stron w podglądzie ZNA granice bloków — nie tnie co równe 1123 px** (`paginated-cv-sheet.tsx`, 2026-07-30, po testach na telefonie). Stare cięcie „co `SHEET_HEIGHT`" pokazywało rzeczy, których w wyeksportowanym PDF-ie NIE MA: wiersz „Stworzyłem pakiet narzędzi w JavaScript i Power Automate Desktop" (15 px) widoczny na 7,3 px, nagłówek „Projekty" osierocony na dole strony. Podgląd odtwarza więc obie ochrony eksportu: **`data-blok="pozycja"`** = `wrap={false}` (wpis doświadczenia/projektu/edukacji, klauzula RODO — nigdy nie rozcinany, schodzi w całości), **`data-blok="naglowek"`** = `minPresenceAhead` (nagłówek schodzi razem z sekcją, gdy po nim zostało < `MIN_PO_NAGLOWKU`; jest też w zbiorze `NIEPODZIELNE`, bo sam potrafi trafić dokładnie w granicę), **`data-blok="tresc"`** = akapity i sekcje panelu bocznego (dzielone dopiero powyżej `MAX_NIEPODZIELNEGO`). **Nowy szablon MUSI oznaczyć swoje bloki tymi atrybutami** — bez nich wraca cięcie w pół wiersza. Treść należąca do następnej strony jest ODSUWANA w dół (margines na bloku otwierającym kolejną kartkę), a nie przycinana wcześniej: dzięki temu kolorowy panel boczny sięga dołu KAŻDEJ kartki (w PDF jest `fixed`), a ten sam nagłówek nie widnieje na obu stronach naraz. Kopie wyświetlane dostają wspólne `minHeight` = liczba stron × `SHEET_HEIGHT`, ale kopia POMIAROWA nie — inaczej pomiar karmiłby sam siebie (2 strony → wysokość 2 stron → wychodzi 3.). Dokładny podział nadal może się różnić od PDF-a o pojedyncze wiersze (inny silnik składu), ale rozcięć w pół wiersza i osieroconych nagłówków już nie ma.
- **Klauzula RODO w podglądzie NIE ma `mt-auto`** (wszystkie `cv-document*.tsx`) — w PDF stoi tuż pod treścią (`rodo: { marginTop }`), a `mt-auto` spychało ją w podglądzie na sam dół arkusza. Dodatkowo psułoby to stronicowanie: rozciągnięcie dokumentu do pełnych stron przesuwałoby klauzulę inaczej w każdej kopii, a wszystkie kopie muszą mieć IDENTYCZNY układ.
- **PDF: nagłówek sekcji dostaje `minPresenceAhead`, pozycja (doświadczenie/projekt/edukacja) dostaje `wrap={false}`** — w KAŻDYM `cv-pdf*.tsx` (2026-07-29, realny bug zgłoszony przez użytkownika: nagłówek „Projekty" osierocony na dole strony 1, treść startowała dopiero na stronie 2). Bez `minPresenceAhead` react-pdf renderuje nagłówek, nawet jeśli po nim nie ma miejsca na ANI JEDNĄ pozycję — wygląda to jak przypadkowe ucięcie sekcji w połowie. `wrap={false}` na bloku pojedynczej pozycji chroni PRZED rozcięciem jej w połowie zdania między stronami (ten sam problem, jeden poziom niżej). Wspólny plik `cv-pdf.tsx` (5 szablonów: nowoczesny/klasyczny/minimalny/elegancki/kompaktowy) miał tę ochronę całkowicie pominiętą — dopiero teraz naprawione; układy własne (`boczny`/`prestizowy`/`grafitowy`/`pastelowy`) miały `wrap={false}` na pozycjach, ale nie miały `minPresenceAhead` na nagłówkach. https://react-pdf.org/advanced#orphan-&-widow-protection
- **`@react-pdf/renderer` nadaje `<Link>` domyślnie `color:"blue"` + podkreślenie** (jak nieostylowany `<a>` w przeglądarce) — jeśli styl przekazany do `<Link>` nie ustawia WŁASNEGO `color`, link wychodzi niebieski w PDF, nawet gdy podgląd HTML pokazuje go w kolorze tekstu (bo tam Tailwind resetuje `<a>` do `color:inherit`). Realny bug w `cv-pdf-boczny.tsx` (`pozycjaPanelu` bez `color` → niebieski link mimo czarnego podglądu). Zasada: KAŻDY `<Link style={...}>` w `cv-pdf*.tsx` musi mieć w tym stylu jawny `color`, nie polegać na dziedziczeniu.
- **Umiejętności w panelu bocznym (boczny/grafitowy/pastelowy) to zwarty, zawijający się akapit (`.join(" · ")`), NIE lista jeden-wiersz-na-umiejętność** — przy szerszym stacku (20+ technologii, częste u automatyzatorów/fullstacków) pionowa lista zajmowała połowę panelu i wyglądała jak nieskończone wyliczanie (realny feedback użytkownika: „wygląda to obrzydliwie"). Wzorzec przejęty ze wspólnego `cv-pdf.tsx`/`cv-document.tsx`, gdzie umiejętności od zawsze są akapitem. Języki obce ZOSTAJĄ listą (zwykle 2–3 pozycje, nie ma problemu długości).
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
w changes.ts) · `test:straz` (straż słów kluczowych + podłoga wyniku). Na żywo
(wymagają klucza, `--env-file=.env.local`): `test:oferta`, `test:pipeline`,
`test-podloga-live.ts`, `test-koszt-live.ts` (pomiar tokenów/kosztu).
Dane testowe (20 CV + 18 ofert + pary): `scripts/dane-testowe.ts`.
`npm run build` (pełny), `npm run dev`. Typy: `npx tsc --noEmit`.

## Baza wiedzy (poza repo, w `Projekt CV/`)

`wiedza-cv-z-transkryptow.md` (synteza 16 poradników: rubryka 0–100, red flags, czasowniki, sprzeczności rozstrzygnięte) · `prompt-analiza-transkryptow-cv.md`.
Pamięć AI (cross-session): `MEMORY.md` + pliki `cv-copilot-pl-project`, `cv-copilot-ai-architecture`, `cv-wiedza-z-tutoriali`.
