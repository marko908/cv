# Jak dopasować CV do oferty pracy: instrukcja krok po kroku

- **Slug:** `dopasowanie-cv-do-oferty`
- **Temat z planu:** 11 (fala 3) — **fraza pieniężna, najwyższa spodziewana konwersja**
- **Kategoria:** szukanie pracy · **Tagi:** cv, dopasowanie, rekrutacja
- **Status:** szkic — insert jeszcze NIE uruchomiony

## Checklista SEO

- [x] H1 ≤ 60 znaków (59), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (46)
- [x] meta_opis ≤ 155 znaków (134), z frazą główną
- [x] zajawka ≤ 160 znaków (137)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Tabela porównawcza (co zmieniać vs czego nie ruszać)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 3x do bloga, 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania
- [x] Środkowe CTA — kontekstowe, haczyk: rozbiór ogłoszenia + waga kryterium
- [x] Długość: 886 słów (zmierzone, bez akapitów z promptami) → `czas_czytania_min: 5`
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA podaje wagę „dopasowanie do wymagań oferty = 40 ze 100". Odczytane wprost
z `src/lib/ai/scoring.ts`, kryterium `RUB-DOP`, waga **40** — najcięższe
w całej rubryce. Przy zmianie wag trzeba poprawić to zdanie.

## Decyzja redakcyjna

Artykuł **pokazuje pełną metodę ręczną**, łącznie z siedmioma krokami
i procedurą czytania ogłoszenia, zgodnie z założeniem z planu: czytelnik ma
wyjść z kompletną odpowiedzią nawet bez zakładania konta. Sekcja o czasie
mówi wprost, ile to zajmuje przy skali kilkunastu aplikacji miesięcznie —
to jest realny koszt, który plan nazywa mostem do produktu.

## Treść (skrót struktury)

1. Wstęp — nie piszesz CV od nowa, zmieniasz górę i akcenty
2. Dlaczego jedno CV do wszystkiego nie działa
3. Jak czytać ogłoszenie — 5 kroków rozbioru
4. Instrukcja krok po kroku — 7 kroków w CV
5. Co zmieniać, a czego nie ruszać — tabela z granicą prawdy
6. Ile to zajmuje i co da się przyspieszyć

Pełna treść HTML: `scripts/blog/insert-dopasowanie-cv-do-oferty.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-dopasowanie-cv-do-oferty.ts`
- Okładka + 2 grafiki, potem usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Gdy powstaną **12 (słowa kluczowe)** i **15 (filar)** — oba już napisane w tej
samej serii — dopisz stąd odnośniki po ich publikacji.
