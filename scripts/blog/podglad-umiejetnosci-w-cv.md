# Umiejętności w CV: co wpisać, a czego nie

- **Slug:** `umiejetnosci-w-cv`
- **Temat z planu:** 9 (fala 2)
- **Kategoria:** pisanie CV · **Tagi:** cv, umiejętności, kompetencje
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia")

## Checklista SEO

- [x] H1 ≤ 60 znaków (40), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (45)
- [x] meta_opis ≤ 155 znaków (139), z frazą główną
- [x] zajawka ≤ 160 znaków (134)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „umiejętności w cv" naturalnie kilka razy w treści
- [x] Tabela porównawcza (frazes vs potwierdzenie w doświadczeniu)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 3x do bloga (`klauzula-rodo-w-cv`, `paski-umiejetnosci-cv`, `ats-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, haczyk: przestawianie kolejności umiejętności
      pod ofertę. Końcowe CTA automatyczne.
- [x] Długość: 842 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA mówi, że przy dopasowaniu zmienia się KOLEJNOŚĆ umiejętności, a lista
zostaje użytkownika, oraz że zmiana jest raportowana w dzienniku. Zgodne
ze `STRUKTURA.md`:

- model dotyka wyłącznie podsumowania, punktów doświadczenia i projektów
  oraz **kolejności umiejętności** — nic poza tym
- `changes.ts` raportuje przestawienie **tylko wtedy, gdy wymagane z oferty
  realnie poszły w górę**, i wymienia je z nazwy (straż anty-fantomowa)

## Treść (skrót struktury)

1. Wstęp — sekcja, w której rekruter i system szukają tych samych słów
2. Twarde i miękkie: proporcja (8-12 twardych, maks. 3-4 miękkie)
3. Frazesy, które osłabiają sekcję — tabela z pokryciem w doświadczeniu
4. Czego w CV nie ma prawa być — PESEL, stan cywilny, dane szczególnej kategorii
5. Jak wybrać umiejętności pod konkretną ofertę — metoda w 5 krokach
6. Kolejność ma znaczenie — najtańsza zmiana w całym CV

Pełna treść HTML: `scripts/blog/insert-umiejetnosci-w-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-umiejetnosci-w-cv.ts`
- Dodać okładkę (`okladka_url`) — prompt w `obrazki-umiejetnosci-w-cv.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src`, usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Gdy powstanie tekst **12 (słowa kluczowe w CV)**, dopisz stąd odnośnik — plan
przewiduje linkowanie do 4, 12 i 6 (dwa ostatnie już są).
