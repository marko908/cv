# STRUKTURA — CV Copilot PL (mapa projektu dla AI)

> **Ten plik jest auto-wczytywany co sesję (przez `@import` w CLAUDE.md).** Ma dać
> pełny kontekst BEZ przeszukiwania repo. **Aktualizuj go w tym samym commicie, w
> którym zmieniasz architekturę / dodajesz plik / zmieniasz przepływ danych.**
> Jeśli coś tu nie zgadza się z kodem — kod ma rację, popraw ten plik.

## Czym jest aplikacja

MVP SaaS: dopasowuje/poprawia CV pod konkretną ofertę pracy, rynek PL (RODO, ton
stonowany bez amerykańskiego hype'u, B2B/UoP, ATS). Folder repo: `cv-copilot/`
(repo git tu, nie w `Projekt CV/` — screenshoty/PDF-y/pakiety wiedzy są poza repo).

**ZASADA NACZELNA (nienaruszalna): AI NIE tworzy treści CV.** AI wybiera,
porządkuje i przeformułowuje fakty, które podał użytkownik. Żadnych zmyślonych
liczb, technologii, firm, stanowisk, poziomów języka. Gwarancją nie jest prompt,
tylko KOD (walidator + straż przepisywania + deterministyczny matcher).

**UI (nienaruszalne): styl Spotify, dark-only.** Tła #121212/#181818/#1f1f1f,
jedyny akcent zieleń #1ed760 (tylko funkcjonalnie: CTA, stany aktywne), przyciski
pill `rounded-full` uppercase, ciężkie cienie, bez szarych ramek, font Figtree.
Dokument CV zachowuje granatowy akcent #0057D9 (nie zielony). Użytkownik edytuje
tylko treść, nie layout.

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
+ **wywiad** — KOD — `interview.ts` (`zbudujPytania` z luk oferty; `zbudujPytaniaOMetryki` z punktów bez liczby; `zastosujOdpowiedzi` nakłada potwierdzone odpowiedzi na KOPIĘ CV, z deduplikacją dopinanych punktów → ponowny pipeline → wynik rośnie uczciwie). Domknięcie pętli: `tailor-flow` kumuluje id wszystkich pokazanych pytań (`obsluzoneRef`) i podaje je do pipeline przez `obsluzonePytania`; świeża analiza (`nowaAnaliza`)/`resetFlow` czyszczą ten zbiór.

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
(pytania+aplikacja odpowiedzi) · `parse-cv.ts` (import: ekstrakcja tekstu + HIPERŁĄCZA z adnotacji PDF/hrefów DOCX + mapowanie AI) · `fetch-oferta.ts` (pobranie treści ogłoszenia z linku: JSON-LD JobPosting → HTML→tekst; `czyPoprawnyLink`, `BladPobraniaOferty`) · `models.ts` (wybór modeli+klucz).

**`src/lib/`**: `cv-schema.ts` · `store.ts` · `cv-templates.ts` (lista szablonów + `withPhoto`/`templateUsesPhoto`) ·
`sample-cv.ts` (Anna Kowalska — demo) · `sections.ts` (definicje sekcji edytora) ·
`utils.ts` (`cn`, `pluralize`) · `mock-review.ts`.

**`src/components/`**: `app-shell/` (sidebar+topbar mobilny drawer) · `builder/`
(edytor: `builder.tsx`, `section-list.tsx` [na górze działający import CV: `CvImportButton variant="row" mode="replace"`], `section-dialogs.tsx`, `field-inputs.tsx`,
`readiness.tsx`, `match-results.tsx`, `tailor-flow.tsx` [modal dopasowania:
config→running→interview→result], `paywall-dialog.tsx`, `score-breakdown.tsx`
[„Z czego wynika wynik"], `cv-document.tsx` [podgląd HTML; dla `boczny` deleguje do `cv-document-boczny.tsx`], `photo-input.tsx` + `photo-cropper.tsx` [zdjęcie: pomniejszony oryginał `photo_source` (max 640px) + gotowy kadr `photo` (360px) + `photo_crop{zoom,ox,oy}`; kadrowanie zoom/przeciąganie to panel INLINE, nie modal (zagnieżdżony Radix Dialog nie domykał animacji wyjścia). `store.addTailoring` usuwa `photo_source` z historii, żeby nie dublować obrazów w localStorage], `template-picker.tsx`) ·
`new-cv-dialog.tsx` (modal wyboru szablonu, sticky stopka) · `cv-import-button.tsx`
(import CV) · `cv-compare-dialog.tsx` · `cv-pdf.tsx`+`cv-pdf-boczny.tsx`+`download-pdf-button.tsx` (eksport
PDF, font Lato z `public/fonts`; `CvPdf` deleguje układ `boczny` do `CvPdfBoczny`) · `template-thumb.tsx` (miniatura = przeskalowany
CvDocument; `full` = pełny dokument na wiele stron z liniami podziału — używane w porównaniu) · `select-cv-dialog.tsx` · `cv-library-sync.tsx` (autosync aktywne CV→biblioteka) · `store-hydration.tsx` · `ui/` (shadcn).

**Trasy** (`src/app/`): `/` landing · `/app` Start (onboarding/hub) · `/app/kreator`
lista „Moje CV" (+ Dodaj nowe, + Wgraj CV) · `/app/kreator/edytor` edytor ·
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
- **Szablony (wygląd)** → `cv-templates.ts` + `cv-document.tsx` (HTML) + `cv-pdf.tsx` (PDF) — TRZYMAJ SPÓJNE. Układ dwukolumnowy: `cv-document-boczny.tsx` + `cv-pdf-boczny.tsx`. Nowy szablon = wpis w `CV_TEMPLATES`, gałąź w obu rendererach, wpis w `PDF_TEMPLATE_STYLES` i w mapie stylów `cv-document.tsx` (oba są `Record<TemplateId,...>`).
- **Weryfikacja wizualna PDF** → `npx tsx scripts/verify-boczny.ts` (renderuje prawdziwy PDF do PNG w `scripts/_podglad/`, poza repo)
- **Wybór modelu AI** → env `CV_MODEL_*` (bez ruszania kodu)

## Konwencje i pułapki

- **Cudzysłowy PL:** w stringach JS w `"..."` NIE może być prostego `"` w środku —
  użyj „ " (U+201E/U+201D). Złamało build w `scoring.ts`. W backtickach `` ` `` proste `"` OK.
- **Build po usunięciu trasy:** wyczyść `.next` (stary type-validator odwołuje się do usuniętej trasy).
- **React StrictMode w dev dubluje** wywołanie AI (2× koszt) — w produkcji nie; `tailor-flow` ma na to zabezpieczenie (`produkcjaRef`).
- **Mobile:** modale flex-col ze sticky stopką / poziomym scrollem; unikać poziomego overflow (min-w-0 w gridzie).
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
