# Jak napisać CV w 2026: kompletny przewodnik

- **Slug:** `jak-napisac-cv`
- **Temat z planu:** 15 (fala 3) — **FILAR**
- **Kategoria:** pisanie CV · **Tagi:** cv, poradnik, pisanie CV
- **Status:** szkic — insert jeszcze NIE uruchomiony

## ⚠️ Publikować JAKO OSTATNI

Sens filaru polega na tym, że linkuje do wszystkich czternastu pozostałych
artykułów. Opublikowany wcześniej niż one prowadziłby do nieistniejących stron.
**Publikuj dopiero, gdy tematy 1-14 są już na blogu.**

## Checklista SEO

- [x] H1 ≤ 60 znaków (42), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (42)
- [x] meta_opis ≤ 155 znaków (144), z frazą główną
- [x] zajawka ≤ 160 znaków (145)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Struktura H2 + H3 (sekcje CV jako H3 pod jednym H2), bez przeskoku H2→H4
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] **Linkowanie wewnętrzne: 14 linków do bloga + 1 `/rejestracja`** — po jednym
      do każdego pozostałego artykułu serii, zgodnie z rolą filaru
- [x] FAQ — 4 pytania
- [x] Środkowe CTA — kontekstowe, haczyk: ostatni punkt checklisty
- [x] Długość: 923 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi (15 linków wykrytych poprawnie)

## Mapa linkowania (to jest sens tego artykułu)

| Sekcja przewodnika | Linkuje do |
|---|---|
| Dane osobowe i klauzula | `klauzula-rodo-w-cv`, `zdjecie-w-cv` |
| Podsumowanie zawodowe | `podsumowanie-zawodowe-cv` |
| Doświadczenie zawodowe | `jak-opisac-doswiadczenie-w-cv`, `liczby-w-cv` |
| Umiejętności | `umiejetnosci-w-cv`, `paski-umiejetnosci-cv` |
| Format pliku | `ats-cv` |
| Ile stron | `ile-stron-cv` |
| Dopasowanie do oferty | `dopasowanie-cv-do-oferty`, `slowa-kluczowe-w-cv` |
| Sytuacje szczególne | `cv-bez-doswiadczenia`, `cv-zmiana-branzy`, `cv-chatgpt` |

Komplet: 14 z 14 artykułów serii.

## Treść (skrót struktury)

1. Wstęp — jedna strona, fakty w kolejności ważności, kilkanaście sekund lektury
2. Struktura sekcja po sekcji (H3: dane osobowe, podsumowanie, doświadczenie,
   umiejętności, wykształcenie i języki)
3. Format pliku i nazwa — PDF z prawdziwym tekstem, konwencja nazwy pliku
4. Ile stron
5. Dopasowanie do konkretnej oferty
6. Sytuacje szczególne — pierwsze CV, zmiana branży, narzędzia AI
7. Checklista przed wysłaniem — 11 punktów, ostatni to dopasowanie do oferty

Pełna treść HTML: `scripts/blog/insert-jak-napisac-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-jak-napisac-cv.ts`
- **Wszystkie 3 prompty (okładka + 2 grafiki) są na początku treści artykułu**
  jako akapity `class="image-prompt"` — nie trzeba wracać do tego pliku.
  Po wgraniu każdego obrazka usuń jego akapit.
- Redakcja w `/admin/blog`.
- **Sprawdzić, że wszystkie 14 linkowanych artykułów ma status `opublikowany`**,
  dopiero potem publikować ten.
