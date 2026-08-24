# CV przy zmianie branży: jak przepisać doświadczenie

- **Slug:** `cv-zmiana-branzy`
- **Temat z planu:** 14 (fala 3)
- **Kategoria:** szukanie pracy · **Tagi:** cv, zmiana branży, przebranżowienie
- **Status:** szkic — insert jeszcze NIE uruchomiony

## Checklista SEO

- [x] H1 ≤ 60 znaków (49), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (49)
- [x] meta_opis ≤ 155 znaków (140), z frazą główną
- [x] zajawka ≤ 160 znaków (143)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Tabela porównawcza (nazwa zadania w starej vs nowej branży)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 3x do bloga, 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania
- [x] Środkowe CTA — kontekstowe, haczyk: to samo doświadczenie opowiadane
      inaczej pod każdą ofertę
- [x] Długość: ~1400 słów
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA mówi, że aplikacja zestawia fakty z wymaganiami ogłoszenia, pokazuje braki
i **niczego nie dopisuje od siebie**. To opis architektury z `STRUKTURA.md`:
rejestr faktów (`fact-ledger.ts`) jako jedyne źródło, deterministyczny matcher
(`matching.ts`) i walidator anty-halucynacyjny (`validator.ts`).

## Decyzja redakcyjna

Ostatnia sekcja mówi wprost o **realnym koszcie przebranżowienia**: przy zmianie
branży nie da się utrzymać jednego CV, bo za każdym razem tłumaczy się
doświadczenie na inny język. Zgodnie z planem to właśnie w tym miejscu boli
najbardziej i tam CTA ma naturalne oparcie.

Artykuł odradza pisanie w podsumowaniu o powodach odejścia i o wypaleniu —
rekruter ocenia dopasowanie, nie decyzję życiową.

## Treść (skrót struktury)

1. Wstęp — problemem jest nazwa doświadczenia, nie jego brak
2. Kompetencje przenoszalne — tabela z przekładem na język nowej branży
3. Co przepisać, a co usunąć — pięć zasad, bez kasowania historii
4. Jak ułożyć CV, gdy stanowiska nie pasują — kolejność sekcji
5. Podsumowanie jako pomost — przykład na trzech zdaniach
6. Dlaczego to trzeba powtarzać przy każdej ofercie

Pełna treść HTML: `scripts/blog/insert-cv-zmiana-branzy.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-cv-zmiana-branzy.ts`
- Okładka + 2 grafiki, potem usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.
