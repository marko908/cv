# CV bez doświadczenia: co wpisać, gdy nie masz co wpisać

- **Slug:** `cv-bez-doswiadczenia`
- **Temat z planu:** 13 (fala 3)
- **Kategoria:** pisanie CV · **Tagi:** cv, pierwsza praca, studenci
- **Status:** szkic — insert jeszcze NIE uruchomiony

## Checklista SEO

- [x] H1 ≤ 60 znaków (54), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (46)
- [x] meta_opis ≤ 155 znaków (140), z frazą główną
- [x] zajawka ≤ 160 znaków (147)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Dwie tabele (kolejność sekcji, zapis słaby vs działający)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga, 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania
- [x] Środkowe CTA — kontekstowe, haczyk: darmowy kreator prowadzący za rękę
- [x] Długość: 806 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA mówi, że kreator prowadzi przez sekcje i pokazuje braki, a tworzenie CV
i pobranie PDF są bezpłatne. Zgodne z zakresem darmowym opisanym w skillu
`/blog-post` i w `subscription.ts` (konto, kreator, szablony i pobranie PDF
bez opłat). **CTA celowo nie podaje żadnych liczb** — ani ceny, ani limitu
dopasowań — zgodnie z zasadą z `PLAN-TRESCI.md`: te wartości żyją wyłącznie
w automatycznym bloku końcowym, żeby nie trzeba było pilnować ich w każdym
artykule przy zmianie cennika.

## Treść (skrót struktury)

1. Wstęp — brak etatu to nie brak doświadczenia, tylko inna jego nazwa
2. Co liczy się jako doświadczenie — siedem kategorii
3. Jak ułożyć sekcje — tabela z kolejnością dla pierwszego CV
4. Jak opisać projekt, żeby brzmiał jak praca — tabela zapis słaby vs działający
5. Czego nie robić — zawyżanie, wypełniacze, przepraszanie
6. Co dać na samą górę — podsumowanie i praca dyplomowa

Pełna treść HTML: `scripts/blog/insert-cv-bez-doswiadczenia.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-cv-bez-doswiadczenia.ts`
- Okładka + 2 grafiki, potem usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Gdy opublikujesz **15 (filar)**, dopisz stąd odnośnik — tak przewiduje plan.
