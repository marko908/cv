# Jak opisać doświadczenie w CV: osiągnięcia, nie obowiązki

- **Slug:** `jak-opisac-doswiadczenie-w-cv`
- **Temat z planu:** 7 (fala 2)
- **Kategoria:** pisanie CV · **Tagi:** cv, doświadczenie, osiągnięcia
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia")

## Checklista SEO

- [x] H1 ≤ 60 znaków (57), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (57)
- [x] meta_opis ≤ 155 znaków (150), z frazą główną
- [x] zajawka ≤ 160 znaków (146)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „opisać doświadczenie" naturalnie kilka razy w treści
- [x] Tabela porównawcza (8 par przed/po)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`podsumowanie-zawodowe-cv`, `ats-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, haczyk: kryterium rubryki z konkretną wagą.
      Końcowe CTA automatyczne (`CtaBloga wariant="pelne"`).
- [x] Długość: ~1350 słów
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA podaje dwie konkretne wagi. **Odczytane wprost z `src/lib/ai/scoring.ts`**,
nie oszacowane:

| Kryterium w kodzie | Etykieta | Waga |
|---|---|---|
| `RUB-06` | Osiągnięcia zamiast obowiązków | **12** |
| `RUB-07` | Konkretne liczby i metryki | **10** |

Pełna rubryka (9 kryteriów, suma dokładnie 100): dopasowanie do wymagań oferty 40,
osiągnięcia 12, słowa kluczowe pod ATS 10, liczby i metryki 10, podsumowanie
zawodowe 8, kompletność sekcji 8, spójny format i język 6, bez frazesów 4,
dane kontaktowe i RODO 2. Przy zmianie wag trzeba poprawić CTA w tym artykule.

## Treść (skrót struktury)

1. Wstęp — problem: CV opisuje stanowisko, nie osobę
2. Dlaczego „byłem odpowiedzialny za" nic nie mówi
3. Wzór: czasownik, co, efekt — lista numerowana
4. Osiem przykładów przed i po — tabela z ośmiu branż
5. Czasowniki, od których warto zaczynać — pogrupowana lista
6. Co zrobić, gdy praca była powtarzalna — skala, stabilność, usprawnienia

Pełna treść HTML: `scripts/blog/insert-jak-opisac-doswiadczenie-w-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-jak-opisac-doswiadczenie-w-cv.ts`
- Dodać okładkę (`okladka_url`) — prompt w `obrazki-jak-opisac-doswiadczenie-w-cv.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src`, usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Gdy powstaną kolejne teksty, dopisz stąd odnośniki do: **8 (liczby w CV)**
i **15 (filar)** — tak przewiduje plan.
