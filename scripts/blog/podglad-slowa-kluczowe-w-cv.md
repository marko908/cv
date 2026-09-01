# Słowa kluczowe w CV: jak wyciągnąć je z ogłoszenia

- **Slug:** `slowa-kluczowe-w-cv`
- **Temat z planu:** 12 (fala 3) — druga fraza pieniężna
- **Kategoria:** ATS i rekrutacja · **Tagi:** cv, słowa kluczowe, ats
- **Status:** szkic — insert jeszcze NIE uruchomiony

## Checklista SEO

- [x] H1 ≤ 60 znaków (49), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (49)
- [x] meta_opis ≤ 155 znaków (146), z frazą główną
- [x] zajawka ≤ 160 znaków (152)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Tabela (gdzie umieścić frazy)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 3x do bloga, 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania
- [x] Środkowe CTA — kontekstowe, haczyk: pokrycie fraz jako osobne kryterium
- [x] Długość: 861 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA podaje wagę „pokrycie fraz pod ATS = 10 ze 100". Odczytane wprost
z `src/lib/ai/scoring.ts`, kryterium `RUB-ATS-KW`, waga **10**.

## Decyzja redakcyjna

Artykuł **odradza sztuczki** (biały tekst na białym tle, frazy w metadanych)
i tłumaczy, dlaczego są traktowane inaczej niż zwykłe niedopasowanie. Podaje
też granicę: fraza wchodzi do CV, jeśli potrafisz opowiedzieć o niej dwa
zdania. Jest to spójne z zakazem obiecywania obejścia procesu rekrutacji.

Nie powtarza mitu, że ATS punktuje CV — utrzymuje linię z artykułu 6.

## Treść (skrót struktury)

1. Wstęp — nie o upychanie chodzi, tylko o obecność i widoczność
2. Czym są dla systemu, a czym dla rekrutera
3. Jak znaleźć właściwe frazy w ogłoszeniu — 5 kroków, odrzucanie przymiotników
4. Gdzie je umieścić — tabela pięciu miejsc
5. Dlaczego upychanie szkodzi — trzy problemy plus sztuczki techniczne
6. Jak sprawdzić pokrycie — metoda ręczna w pięć minut

Pełna treść HTML: `scripts/blog/insert-slowa-kluczowe-w-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-slowa-kluczowe-w-cv.ts`
- **Wszystkie 3 prompty (okładka + 2 grafiki) są na początku treści artykułu**
  jako akapity `class="image-prompt"` — nie trzeba wracać do tego pliku.
  Po wgraniu każdego obrazka usuń jego akapit.
- Redakcja w `/admin/blog`, potem status `opublikowany`.
