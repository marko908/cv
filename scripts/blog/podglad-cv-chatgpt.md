# Czy pisać CV przez ChatGPT? Co się przy tym psuje

- **Slug:** `cv-chatgpt`
- **Temat z planu:** 10 (fala 2) — **najmocniejszy wyróżnik produktu**
- **Kategoria:** pisanie CV · **Tagi:** cv, ai, chatgpt
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia”)

## Checklista SEO

- [x] H1 ≤ 60 znaków (48), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (48)
- [x] meta_opis ≤ 155 znaków (140), z frazą główną
- [x] zajawka ≤ 160 znaków (156)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „cv chatgpt” naturalnie kilka razy w treści
- [x] Tabela porównawcza (co robi model vs jak to wygląda w CV)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`liczby-w-cv`, `jak-opisac-doswiadczenie-w-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe i **najdłuższe w całym blogu**, bo to jedyny
      artykuł, w którym mechanizm produktu jest tematem, a nie dopiskiem.
      Końcowe CTA automatyczne.
- [x] Długość: 833 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA opisuje trzy mechanizmy naraz. Wszystkie są w kodzie, nie w prompcie:

1. **Model dostaje wyłącznie fakty użytkownika** — `fact-ledger.ts` buduje
   rejestr faktów z CV i to on jest jedynym źródłem prawdy.
2. **Dane twarde kopiowane w kodzie** — firmy, stanowiska, okresy, edukacja,
   języki i dane osobowe nie są zwracane przez model; `rewrite.ts` → `zlozCv`
   przepisuje je z oryginału.
3. **Walidator odrzuca zmyślenia** — `validator.ts` → `validateAgainstLedger`
   odrzuca wymyślone liczby, umiejętności, firmy, stanowiska, podniesiony
   poziom języka i frazesy, a `pipeline.naprawCv()` cofa do oryginału
   **tylko odrzucone fragmenty**, nie całe CV.

Sformułowanie „nie ma jak dopisać nic od siebie” jest więc opisem architektury,
nie obietnicą marketingową. Zasada naczelna produktu ze `STRUKTURA.md`: gwarancją
nie jest prompt, tylko kod.

## Granice, których artykuł pilnuje

- Nie twierdzi, że da się wykryć tekst pisany przez model — mówi wprost, że
  pewnego sposobu nie ma, a rekruterzy wyłapują powtarzalność.
- Nie nazywa używania AI nieuczciwym — rozgranicza narzędzie od dopisywania faktów.
- Nie podaje żadnych statystyk o skali zjawiska (brak wiarygodnego źródła).

## Treść (skrót struktury)

1. Wstęp — dobrze z językiem, fatalnie z faktami
2. Co ogólny model robi dobrze — pięć bezpiecznych zastosowań
3. Gdzie zawodzi — tabela pięciu zachowań modelu
4. Dlaczego rekruter to wyłapuje — powtarzalność, rozjazd z rozmową, brak konkretu
5. Jak używać AI bezpiecznie — pięć zasad
6. Czego nigdy nie oddawać modelowi — dane osobowe i decyzja o priorytetach

Pełna treść HTML: `scripts/blog/insert-cv-chatgpt.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-cv-chatgpt.ts`
- Dodać okładkę (`okladka_url`) — prompt w `obrazki-cv-chatgpt.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src`, usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Gdy powstaną teksty **11 (dopasowanie CV do oferty)** i **15 (filar)**, dopisz
stąd odnośniki — tak przewiduje plan.
