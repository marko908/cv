---
description: Wygeneruj prompty do grafik dla istniejącego artykułu bloga Aplikando.
---

# Aplikando — prompty do grafik blogowych

Na podstawie artykułu zapisanego w tabeli `wpis_bloga` tworzysz precyzyjne
prompty pod spójne wizualnie grafiki.

## Kontekst wizualny marki

- Tło aplikacji: `#121212`, powierzchnie `#181818`.
- Jedyny akcent: zieleń `#1ed760` — używana funkcjonalnie, nie dekoracyjnie.
- Styl: stonowany, dokumentalny, bez korporacyjnej sztuczności. Odbiorcą jest
  osoba szukająca pracy, często zestresowana — grafiki mają być spokojne, nie
  „sukcesowe".
- Nigdy: uśmiechnięci ludzie w garniturach przybijający piątkę, stockowe
  klisze, plastikowe twarze, tekst na obrazie (nakładamy osobno), logo marki
  wygenerowane przez model.

## Zadanie

### KROK 0 — pobierz artykuł
`$ARGUMENTS` to tytuł, fragment tytułu albo slug. Znajdź wpis w `wpis_bloga`
(po `slug` albo `ilike` na `tytul`). Przy wielu trafieniach pokaż listę
i poproś o doprecyzowanie.

### KROK 1 — analiza treści
Sparsuj `tresc` szukając `<figure data-image-id data-image-type
data-image-brief>`. Z każdego wyciągnij: numer, typ, brief, `alt` z `<img>`,
`<figcaption>` i docelową nazwę pliku ze `src`. Okładka nie ma placeholdera —
prompt na nią zbuduj z `okladka_alt` i tematu artykułu.

### KROK 2 — mapowanie typów
- `photo` → prompt fotorealistyczny (Midjourney / FLUX).
- `infographic` → brief do wykonania w Figmie/Canvie albo prompt AI, jeśli
  model radzi sobie z tekstem.
- `screenshot` → instrukcja zrobienia realnego zrzutu z aplikacji.

### KROK 3 — prompty
Struktura: `[typ ujęcia], [scena], [szczegóły], [oświetlenie], [styl],
[parametry]`. Zawsze po angielsku. Proporcje **16:9**, nigdy 1:1.

Styl domyślny: editorial / documentary photography, naturalne światło. Ludzie
naturalni, nie pozujący, bez wskazywania cech etnicznych. Zakończ frazą:
`Natural editorial photo, realistic setting, no text, no logos. Landscape 16:9.`

Parametry Midjourney: `--v 6.1 --style raw --ar 16:9 --q 2`.
FLUX: bez parametrów Midjourney, dopisz „professional photography, high
resolution".

**Prompt musi być SAMODZIELNY** — cały opis stylu wklejasz w każdy prompt, bez
odsyłania do innych plików.

## Format wyjściowy

Zapisz `scripts/blog/obrazki-[slug].md`. Dla każdej grafiki (okładka +
wszystkie z treści): typ, wymiary docelowe, alt, podpis, nazwa pliku, miejsce
w artykule, prompt(y) w blokach kodu. Zakończ tabelą: numer / typ / narzędzie /
plik / status.

Przypomnij, że gotowe pliki wgrywa się przez bibliotekę obrazków w
`/admin/blog/[id]/edytuj`, a po podmianie trzeba usunąć akapity
`class="image-prompt"` z treści.
