# Zdjęcie w CV: czy dodawać? Realia polskiego rynku

- **Slug:** `zdjecie-w-cv`
- **Temat z planu:** 3 (fala 1)
- **Kategoria:** pisanie CV · **Tagi:** cv, zdjęcie, rodo
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia”)

## Checklista SEO

- [x] H1 ≤ 60 znaków (48), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (47)
- [x] meta_opis ≤ 155 znaków (139), z frazą główną
- [x] zajawka ≤ 160 znaków (140)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „zdjęcie w cv” naturalnie kilka razy w treści
- [x] Tabela porównawcza (argumenty za i przeciw)
- [x] 2 miejsca na obrazki (photo + infographic) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`klauzula-rodo-w-cv`, `ile-stron-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, ręcznie napisane (`<div class="blog-cta-inline">`),
      haczyk: szablony w obu wariantach, oba czytelne dla ATS. Końcowe CTA
      automatyczne (`CtaBloga wariant="pelne"`), nie pisane ręcznie.
- [x] Długość: 809 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Treść (skrót struktury)

1. Wstęp — odpowiedź od razu: nieobowiązkowe, ale w Polsce powszechne
2. Praktyka w Polsce a zwyczaje zagraniczne (UK/USA/Kanada vs Niemcy/Austria)
3. Argumenty za i przeciw — tabela + zasada praktyczna
4. Co na to RODO — czego pracodawca NIE może wymagać
5. Jakie zdjęcie, jeśli już się decydujesz — lista kryteriów
6. Czy zdjęcie psuje odczyt w ATS — obalenie mitu, prawdziwa przyczyna to układ

Pełna treść HTML: `scripts/blog/insert-zdjecie-w-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-zdjecie-w-cv.ts`
  (NIE dwa razy — slug ma unikalny indeks).
- Dodać okładkę (`okladka_url`) — dziś `null`, prompt w `obrazki-zdjecie-w-cv.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src` w treści, usunąć akapity `class="image-prompt"`.
- Redakcja/korekta w panelu `/admin/blog`.
- Zmienić status na `opublikowany`, gdy gotowe (publikacja jest ręczna).

## Linkowanie do dopisania później

Artykuł linkuje wyłącznie WSTECZ, do wpisów już opublikowanych, więc żaden
odnośnik nie prowadzi w pustkę. Gdy powstaną kolejne teksty, dopisz stąd
odnośniki do: **6 (ATS)** i **15 (filar)** — tak przewiduje plan treści.
