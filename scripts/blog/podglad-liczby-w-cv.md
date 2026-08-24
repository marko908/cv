# Liczby w CV: jak kwantyfikować, gdy nie masz danych

- **Slug:** `liczby-w-cv`
- **Temat z planu:** 8 (fala 2)
- **Kategoria:** pisanie CV · **Tagi:** cv, osiągnięcia, doświadczenie
- **Status:** szkic — insert jeszcze NIE uruchomiony (patrz „Do zrobienia")

## Checklista SEO

- [x] H1 ≤ 60 znaków (50), fraza główna na początku
- [x] meta_tytul ≤ 60 znaków (51)
- [x] meta_opis ≤ 155 znaków (152), z frazą główną
- [x] zajawka ≤ 160 znaków (151)
- [x] Wstęp odpowiada na pytanie w pierwszych 2 zdaniach
- [x] Fraza główna „liczby w cv" naturalnie kilka razy w treści
- [x] Dwie tabele (pięć źródeł liczby, pozorny konkret vs dlaczego nie działa)
- [x] 2 miejsca na obrazki (infographic + photo) poza okładką
- [x] Linkowanie wewnętrzne: 2x do bloga (`jak-opisac-doswiadczenie-w-cv`, `podsumowanie-zawodowe-cv`), 1x `/rejestracja` w CTA
- [x] FAQ — 4 pytania w polu `faq`
- [x] Środkowe CTA — kontekstowe, haczyk: wywiad uzupełniający dopytujący
      o brakujące liczby. Końcowe CTA automatyczne.
- [x] Długość: ~1300 słów
- [x] Zero myślników `—`/`–`, zero fraz z czarnej listy
- [x] `npm run test:edytor` przechodzi

## Weryfikacja twierdzenia o produkcie

CTA mówi, że aplikacja rozpoznaje punkty bez konkretu, cytuje CAŁY punkt
i **scala** odpowiedź z oryginałem, zamiast go nadpisywać. Zgodne
ze `STRUKTURA.md`:

- `interview.ts` → `zbudujPytaniaOMetryki` buduje pytania z punktów bez liczby,
  a `cytat` przycina do 220 znaków na granicy słowa (dawne 60 znaków gubiło sens)
- „WYWIAD UZUPEŁNIA, NIGDY NIE NADPISUJE" (decyzja Marka 2026-08-02): odpowiedź
  jest doklejana w znaczniku `⟦uzupełnienie kandydata: …⟧`, a model scala oba
  fakty w jedno zdanie
- `maJuzKonkret` odsiewa punkty, które liczbę już mają, więc pytania nie
  dotyczą wszystkiego jak leci

Sformułowanie w CTA jest celowo ostrożne („nic z dotychczasowej treści nie
ginie") i nie obiecuje, że wynik zawsze wzrośnie.

## Treść (skrót struktury)

1. Wstęp — blokada „u mnie nic nie było mierzone" myli wynik ze skalą
2. Dlaczego liczba działa mocniej niż przymiotnik
3. Pięć źródeł liczby — tabela: skala, częstotliwość, zespół, budżet, czas
4. Przykłady dla stanowisk bez twardych metryk (nauczyciel, pielęgniarka, asystentka, magazynier, grafik)
5. Czego nie zaokrąglać i czego nie wymyślać
6. Określenia, które tylko udają konkret — tabela

Pełna treść HTML: `scripts/blog/insert-liczby-w-cv.ts`.

## Do zrobienia przed publikacją

- **Uruchomić insert:** `npx tsx --env-file=.env.local scripts/blog/insert-liczby-w-cv.ts`
- Dodać okładkę (`okladka_url`) — prompt w `obrazki-liczby-w-cv.md`.
- Wygenerować i wgrać 2 grafiki, podmienić `src`, usunąć akapity `class="image-prompt"`.
- Redakcja w `/admin/blog`, potem status `opublikowany`.

## Linkowanie do dopisania później

Gdy powstanie tekst **11 (dopasowanie CV do oferty)**, dopisz stąd odnośnik —
tak przewiduje plan.
