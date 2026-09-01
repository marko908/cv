# Co to jest ATS i jak naprawdę czyta Twoje CV

- **Slug:** `ats-cv`
- **Temat z planu:** 6 (fala 2) — **artykuł filarowy dla pozycjonowania produktu**
- **Kategoria:** ATS i rekrutacja · **Tagi:** ats, cv, rekrutacja
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia”)

## Checklista SEO

- [x] H1 ≤ 60 znaków (43), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (43)
- [x] meta_opis ≤ 155 znaków (137), z frazą główną
- [x] zajawka ≤ 160 znaków (147)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „ats” naturalnie kilka razy w treści
- [x] Tabela porównawcza (mit vs rzeczywistość)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`zdjecie-w-cv`, `paski-umiejetnosci-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, haczyk: kolejność tekstu w strumieniu PDF.
      Końcowe CTA automatyczne (`CtaBloga wariant="pelne"`).
- [x] Długość: 803 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA mówi, że dane osobowe, podsumowanie i doświadczenie trafiają do pliku PDF
przed treścią panelu bocznego, także w układach dwukolumnowych, i że jest to
sprawdzane ekstrakcją tekstu. **Zgodne ze `STRUKTURA.md`**, sekcja
o pozycjonowaniu: układ dwukolumnowy realizuje to przez
`flexDirection: "row-reverse"` z kolumną główną PIERWSZĄ w drzewie, a kontrolę
kolejności tekstu wykonuje `scripts/verify-szablon.ts`.

## Świadoma decyzja redakcyjna: brak statystyk

Artykuł **celowo nie podaje żadnych liczb** o odsetku CV odrzucanych przez
systemy, mimo że takie dane krążą po poradnikach. Nie mają wiarygodnego źródła,
a plan treści zabrania wymyślania statystyk. Zamiast liczby jest zdanie
wprost tłumaczące, dlaczego jej tu nie ma.

## Treść (skrót struktury)

1. Wstęp — ATS nie ocenia i nie odrzuca, realne ryzyko jest inne
2. Czym jest ATS i kto go używa w Polsce
3. Co system faktycznie wyciąga z pliku (parsowanie, kolejność tekstu)
4. Trzy mity — tabela mit vs rzeczywistość
5. Co realnie psuje odczyt — lista sześciu konkretów
6. Jak sprawdzić własne CV w dwie minuty — metoda kopiuj-wklej

Pełna treść HTML: `scripts/blog/insert-ats-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-ats-cv.ts`
- **Wszystkie 3 prompty (okładka + 2 grafiki) są na początku treści artykułu**
  jako akapity `class="image-prompt"` — nie trzeba wracać do tego pliku.
  Po wgraniu każdego obrazka usuń jego akapit.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

To jest artykuł, **z którego i do którego** ma linkować większość pozostałych.
Po publikacji kolejnych tekstów dopisz stąd odnośniki do: **12 (słowa kluczowe)**
i **15 (filar)**, a w artykułach 3, 4, 9, 11, 12 dopisz odnośniki TUTAJ.
