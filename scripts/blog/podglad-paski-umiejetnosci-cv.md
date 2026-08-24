# Paski umiejętności w CV: czy mają sens?

- **Slug:** `paski-umiejetnosci-cv`
- **Temat z planu:** 4 (fala 1)
- **Kategoria:** pisanie CV · **Tagi:** cv, umiejętności, formatowanie
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia”)

## Checklista SEO

- [x] H1 ≤ 60 znaków (39), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (39)
- [x] meta_opis ≤ 155 znaków (134), z frazą główną
- [x] zajawka ≤ 160 znaków (146)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „paski umiejętności” naturalnie kilka razy w treści
- [x] Tabela porównawcza (zapis z paskiem vs zapis konkretny)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`ile-stron-cv`, `zdjecie-w-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, haczyk: scoring realnie obniża wynik za paski.
      Końcowe CTA automatyczne (`CtaBloga wariant="pelne"`).
- [x] Długość: 814 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

Zdanie w CTA („paski i procenty realnie obniżają wynik, dwa wpisy ścinają
połowę punktów w tej kategorii”) **zostało sprawdzone w kodzie**, nie przepisane
z planu. Źródło: `src/lib/ai/scoring.ts`, kryterium **RUB-10 „Spójny format
i język”, waga 6 punktów**:

- wykrywanie: `/\d+\s*%|\d\s*\/\s*10|★|●|▮/` na `skills.technical` i `skills.soft_and_tools`
- kara: `Math.min(0.5, paskiSkill * 0.25)` — czyli 2 wpisy dają maksymalną karę 0.5,
  co odbiera 3 z 6 punktów kategorii
- komunikat w rubryce doradza dokładnie to, co artykuł: skala A1-C2 dla języków,
  przy narzędziach sama nazwa

Jeśli ta reguła kiedyś się zmieni, trzeba poprawić CTA w tym artykule.

## Treść (skrót struktury)

1. Wstęp — odpowiedź od razu: nie działają, jeden wyjątek to języki
2. Co rekruter naprawdę odczytuje z paska (brak punktu odniesienia)
3. Dlaczego „Excel 80%” jest bez znaczenia — tabela zapis z paskiem vs konkret
4. Co wpisać zamiast pasków — nazwa + zastosowanie + skala
5. Wyjątek: języki obce i skala A1-C2 według ESOKJ
6. Jak systemy rekrutacyjne traktują grafikę poziomu

Pełna treść HTML: `scripts/blog/insert-paski-umiejetnosci-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-paski-umiejetnosci-cv.ts`
- Dodać okładkę (`okladka_url`) — prompt w `obrazki-paski-umiejetnosci-cv.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src`, usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Artykuł linkuje wyłącznie wstecz. Gdy powstaną kolejne teksty, dopisz stąd
odnośniki do: **9 (umiejętności w CV)** i **6 (ATS)** — tak przewiduje plan.
