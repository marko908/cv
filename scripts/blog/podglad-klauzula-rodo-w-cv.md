# Klauzula RODO w CV 2026: aktualna treść i wzór

- **Slug:** `klauzula-rodo-w-cv`
- **Id w bazie:** `1d40e090-f019-4f70-ab0e-fa075188849a`
- **Kategoria:** pisanie CV · **Tagi:** cv, rodo, dane osobowe
- **Status:** szkic — edycja: `/admin/blog/1d40e090-f019-4f70-ab0e-fa075188849a/edytuj`

## Checklista SEO

- [x] H1 ≤ 60 znaków, fraza główna blisko początku
- [x] meta_tytul ≤ 60 znaków (46)
- [x] meta_opis ≤ 155 znaków (128), z frazą główną
- [x] zajawka ≤ 160 znaków (136)
- [x] Wstęp odpowiada na pytanie w pierwszych 2-3 zdaniach
- [x] Fraza główna „klauzula rodo" naturalnie kilka razy w treści
- [x] Tabela porównawcza (stara vs aktualna klauzula)
- [x] 2 miejsca na obrazki (photo + infographic) poza okładką
- [x] Linkowanie wewnętrzne: 1x do `/blog/ile-stron-cv`, 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, ręcznie napisane (`<div class="blog-cta-inline">`),
      haczyk: automatyczna aktualizacja klauzuli. Końcowe CTA — automatyczne
      (`CtaBloga wariant="pelne"`, renderowane po FAQ), nie pisane ręcznie.
- [x] Długość: ~1015 słów
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy

## Treść (Markdown, skrót struktury)

1. Wstęp — czym jest klauzula i czy trzeba ją dodawać
2. Aktualna treść klauzuli (wersja podstawowa + rozszerzona) — do skopiowania
3. Gdzie umieścić klauzulę w CV
4. Najczęstszy błąd: nieaktualna podstawa prawna (tabela porównawcza)
5. Co zrobić, gdy pracodawca poda własną klauzulę
6. Czy klauzula RODO jest potrzebna przy aplikacji za granicą

Pełna treść HTML: `scripts/blog/insert-klauzula-rodo-w-cv.ts`.

## Do zrobienia przed publikacją

- Dodać okładkę (`okladka_url`) — dziś `null`, prompt gotowy w `obrazki-klauzula-rodo-w-cv.md`.
- Wygenerować i wgrać 2 grafiki z `obrazki-klauzula-rodo-w-cv.md`, podmienić `src` w treści, usunąć akapity `class="image-prompt"`.
- Redakcja/korekta w panelu `/admin/blog`.
- Zmienić status na `opublikowany`, gdy gotowe (publikacja jest ręczna).
