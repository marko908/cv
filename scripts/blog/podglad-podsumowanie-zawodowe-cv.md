# Podsumowanie zawodowe w CV: jak napisać + przykłady

- **Slug:** `podsumowanie-zawodowe-cv`
- **Temat z planu:** 5 (fala 1)
- **Kategoria:** pisanie CV · **Tagi:** cv, podsumowanie zawodowe, profil zawodowy
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia")

## Checklista SEO

- [x] H1 ≤ 60 znaków (51), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (52)
- [x] meta_opis ≤ 155 znaków (131), z frazą główną
- [x] zajawka ≤ 160 znaków (139)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „podsumowanie zawodowe" naturalnie kilka razy w treści
- [x] Tabela porównawcza (frazes vs konkret)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`paski-umiejetnosci-cv`, `ile-stron-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, haczyk: podsumowanie jako jedyne pole
      przepisywane w całości pod ofertę. Końcowe CTA automatyczne.
- [x] Długość: 832 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

Zdanie w CTA („jedyne pole przepisywane w całości, reszta CV chroniona przed
zmianami") jest zgodne z architekturą opisaną w `STRUKTURA.md`, sekcja
**STRAŻ POKRYCIA**: „Podsumowanie jest jedynym polem przepisywanym w całości -
punkty są chronione pojedynczo w `zlozCv`". Dane twarde (firmy, stanowiska,
okresy, edukacja, języki) w ogóle nie idą do modelu.

## Treść (skrót struktury)

1. Wstęp — czym jest i dlaczego decyduje o odbiorze reszty CV
2. Po co rekruterowi Twoje podsumowanie (funkcja porządkująca perspektywę)
3. Struktura w trzech zdaniach — lista numerowana
4. Pięć przykładów: marketing, programista, księgowa, absolwentka, zmiana branży
5. Frazesy, które kasują wartość — tabela frazes vs konkret
6. Jak dopasować podsumowanie do konkretnej oferty

Pełna treść HTML: `scripts/blog/insert-podsumowanie-zawodowe-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-podsumowanie-zawodowe-cv.ts`
- Dodać okładkę (`okladka_url`) — prompt w `obrazki-podsumowanie-zawodowe-cv.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src`, usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Artykuł linkuje wyłącznie wstecz. Gdy powstaną kolejne teksty, dopisz stąd
odnośniki do: **11 (dopasowanie CV do oferty)** i **15 (filar)** — tak
przewiduje plan.
