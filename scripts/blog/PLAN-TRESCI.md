# Plan treści bloga Aplikando

Dokument roboczy. Prowadzi od tematu do opublikowanego artykułu, żeby przy
każdym tekście nie zaczynać od decyzji „o czym i po co".

**Jak z tego korzystać:** wskaż numer tematu i uruchom `/blog-post <temat>`.
Skill zrobi research, przedstawi plan i poczeka na akceptację, zanim cokolwiek
napisze. Po wygenerowaniu odhacz pozycję w tym pliku.

---

## Cel i model, który ma to powtórzyć

Wzorzec sprawdzony na onbitmusic.com: kilka artykułów przyniosło kilkadziesiąt
klientów w trzy miesiące. Zadziałało tam nie „pisanie o branży", tylko
**rozwiązywanie problemu, którego rozwiązaniem jest produkt**. Czytelnik
przychodzi po odpowiedź, dostaje ją w całości za darmo, i przy okazji widzi, że
najżmudniejszą część można sobie darować.

Dlatego przy każdym temacie niżej stoi pole **Haczyk** — konkretny most między
treścią a Aplikando. Bez niego artykuł zbiera ruch, który się nie konwertuje.

### Zasady wstawek sprzedażowych

1. **Artykuł ma być kompletny bez produktu.** Czytelnik, który nie założy
   konta, i tak wychodzi z odpowiedzią. Treść urwana w połowie z „resztę
   sprawdzisz w aplikacji" spala zaufanie i pozycję w Google.
2. **CTA nawiązuje do TEGO artykułu**, nie jest ogólne. „Sprawdź, ile słów
   kluczowych z ogłoszenia ma Twoje CV" konwertuje wielokrotnie lepiej niż
   „Załóż konto".
3. **Prowadzimy do darmowego dopasowania, nie do cennika.** Próg jest zerowy
   (jedno pełne dopasowanie miesięcznie, bez karty) i to jest cała oferta
   w CTA. Ceny czytelnik znajdzie sam, jeśli będzie chciał.
4. **Dwie wstawki: w ~40% tekstu i przed FAQ.** Środkowa łapie tego, kto czyta
   uważnie i właśnie zrozumiał problem — to najcieplejszy moment całego
   artykułu. Blok w treści wstawia komponent automatycznie; własny piszemy
   jako `<div class="blog-cta-inline">`.
5. **Pokazujemy mechanizm, nie obietnicę.** Zrzut ekranu z rubryką albo
   przykład „przed/po" robi więcej niż akapit przymiotników.

### Czego nie wolno (twarde granice)

- **Nie obiecujemy zatrudnienia ani zaproszenia na rozmowę.** Regulamin § 3
  ust. 13 wyklucza gwarantowanie rezultatu rekrutacji. „Zwiększysz szanse" —
  tak. „Dostaniesz pracę" — nigdy.
- **Nie sugerujemy, że AI pisze CV za użytkownika.** To odwrotność
  pozycjonowania produktu.
- **Nie opisujemy funkcji, których nie ma** (list motywacyjny, przygotowanie do
  rozmowy, wyszukiwarka ofert).
- **Nie wymyślamy statystyk.** Liczba bez źródła nie wchodzi do tekstu.

---

## Kolejność publikacji — i dlaczego taka

Domena jest świeża, bez profilu linków. Fraza „jak napisać CV" należy do
pracuj.pl, InterviewMe i LiveCareer — atak na nią teraz to miesiące bez ruchu.
Zaczynamy od wąskich pytań o cienkiej konkurencji, budujemy autorytet
tematyczny, a frazy główne bierzemy w fali trzeciej, mając już czym linkować
wewnętrznie.

Sugerowane tempo: **2 artykuły tygodniowo**. Pierwszych efektów w Search
Console szukaj po 4–8 tygodniach od publikacji, nie wcześniej — nowa domena
potrzebuje czasu na indeksację i zbudowanie zaufania.

⚠️ **Wolumeny fraz nie są zmierzone** — to plan oparty na znajomości rynku
i produktu. Przed startem warto przepuścić frazy przez Ahrefs, Semrush albo
Planer słów kluczowych i przestawić kolejność, jeśli dane powiedzą co innego.

---

## FALA 1 — szybkie wygrane (wąskie pytania, najłatwiej wejść)

### [x] 1. Klauzula RODO w CV — aktualna treść i gdzie ją wstawić
- **Fraza:** `klauzula rodo do cv` · wsparcie: `klauzula rodo cv 2026`, `zgoda na przetwarzanie danych w cv`
- **Intencja:** czytelnik chce skopiować gotowy tekst i wrócić do pisania CV.
- **Szkic:** czym jest i czy jest obowiązkowa → gotowa treść do skopiowania →
  gdzie ją umieścić w dokumencie → najczęstszy błąd (stara podstawa prawna) →
  czy potrzebna przy aplikacji zagranicznej
- **Haczyk:** klauzulę wstawiamy automatycznie i pilnujemy jej aktualności —
  jedna rzecz mniej do pamiętania przy każdej aplikacji.
- **Linkuj do:** 15 (filar), 2

### [x] 2. Ile stron powinno mieć CV?
- **Fraza:** `ile stron cv` · wsparcie: `czy cv może mieć 2 strony`, `jak skrócić cv`
- **Intencja:** pytanie zamknięte — odpowiedz w pierwszym akapicie, potem
  uzasadnij.
- **Szkic:** krótka odpowiedź → kiedy dwie strony są uzasadnione → co wyciąć
  najpierw → jak skrócić bez utraty treści → czy ATS czyta drugą stronę
- **Haczyk:** przy skracaniu trzeba wiedzieć, co jest istotne **dla tej
  konkretnej oferty** — dokładnie to liczy nasza rubryka.
- **Linkuj do:** 6, 7, 15

### [ ] 3. Czy w CV umieszczać zdjęcie? Realia polskiego rynku
- **Fraza:** `zdjęcie w cv` · wsparcie: `czy zdjęcie w cv jest obowiązkowe`
- **Intencja:** rozstrzygnięcie sporu; treść zagraniczna odpowiada na inne
  realia niż polskie.
- **Szkic:** praktyka w Polsce vs za granicą → argumenty za i przeciw →
  wymogi RODO → jakie zdjęcie, jeśli już → czy zdjęcie psuje odczyt w ATS
- **Haczyk:** mamy szablony w obu wariantach, oba czytelne dla ATS — wybór jest
  decyzją wizualną, nie technicznym ryzykiem.
- **Linkuj do:** 6, 15

### [ ] 4. Paski poziomu umiejętności w CV — czy mają sens?
- **Fraza:** `paski umiejętności cv` · wsparcie: `poziom umiejętności w cv`, `jak oceniać umiejętności w cv`
- **Intencja:** wąskie, prawie nietknięte po polsku. Łatwa pierwsza pozycja.
- **Szkic:** co rekruter naprawdę z nich odczytuje (nic) → dlaczego „Excel 80%"
  jest bez znaczenia → co wstawić zamiast → wyjątek: języki obce i skala
  A1–C2 → jak ATS traktuje grafikę
- **Haczyk:** nasz scoring **realnie obniża wynik** za paski i procenty — nie
  jest to opinia, tylko reguła w kodzie. Mocny, konkretny dowód.
- **Linkuj do:** 9, 6

### [ ] 5. Podsumowanie zawodowe w CV — jak napisać (z przykładami)
- **Fraza:** `podsumowanie zawodowe cv` · wsparcie: `o mnie w cv`, `profil zawodowy cv przykłady`
- **Intencja:** czytelnik chce wzoru do przerobienia.
- **Szkic:** po co to rekruterowi → struktura w trzech zdaniach → 4–5
  przykładów dla różnych stanowisk → najczęstsze błędy (frazesy) → jak
  dopasować je do konkretnej oferty
- **Haczyk:** podsumowanie to jedyne pole, które przy dopasowaniu przepisujemy
  w całości pod daną ofertę — pokaż przykład przed/po.
- **Linkuj do:** 11, 15

---

## FALA 2 — rdzeń tematyczny (budujemy autorytet)

### [ ] 6. Co to jest ATS i jak naprawdę czyta Twoje CV
- **Fraza:** `ats cv` · wsparcie: `system ats rekrutacja`, `cv przyjazne ats`
- **Intencja:** zrozumienie mechanizmu; obalenie mitów.
- **Szkic:** czym jest ATS i kto go używa w Polsce → co system faktycznie
  wyciąga z pliku → mity (grafika = odrzucenie, „ATS ocenia CV") → co realnie
  psuje odczyt (tabele, nagłówki stron, tekst w obrazku) → jak sprawdzić własne
  CV
- **Haczyk:** **artykuł filarowy dla pozycjonowania produktu.** Wszystkie nasze
  szablony pilnują kolejności tekstu w pliku PDF — wyjaśnij, dlaczego to,
  a nie brak zdjęcia, decyduje o poprawnym odczycie.
- **Linkuj do:** 3, 12, 15 — i z niego linkuje większość pozostałych

### [ ] 7. Osiągnięcia zamiast obowiązków — jak opisać doświadczenie
- **Fraza:** `jak opisać doświadczenie w cv` · wsparcie: `obowiązki w cv`, `czasowniki do cv`
- **Intencja:** czytelnik ma listę obowiązków i wie, że brzmi słabo.
- **Szkic:** dlaczego „byłem odpowiedzialny za" nic nie mówi → wzór:
  czasownik + co + efekt → 8–10 przykładów przed/po z różnych branż → lista
  mocnych czasowników → co zrobić, gdy praca była powtarzalna
- **Haczyk:** to jedno z dziewięciu kryteriów naszej rubryki — pokaż, że wynik
  da się zmierzyć, a nie tylko „poczuć".
- **Linkuj do:** 8, 5, 15

### [ ] 8. Liczby w CV: jak kwantyfikować, gdy nie masz danych
- **Fraza:** `liczby w cv` · wsparcie: `jak opisać osiągnięcia w cv`, `mierzalne efekty w cv`
- **Intencja:** najczęstsza blokada przy pisaniu — „ja nic nie mierzyłem".
- **Szkic:** dlaczego liczba działa mocniej niż przymiotnik → skąd ją wziąć,
  gdy nikt nie mierzył (skala, częstotliwość, zespół, budżet, czas) →
  przykłady dla stanowisk bez twardych metryk → czego nie zaokrąglać →
  „duże budżety" i inne określenia, które nic nie znaczą
- **Haczyk:** **najlepszy temat pod wywiad uzupełniający.** Aplikando dopytuje
  dokładnie o te brakujące liczby i wplata odpowiedź w punkt — pokaż to na
  przykładzie przed/po.
- **Linkuj do:** 7, 11

### [ ] 9. Umiejętności w CV — co wpisać, a czego nie
- **Fraza:** `umiejętności w cv` · wsparcie: `umiejętności miękkie w cv`, `jakie umiejętności wpisać do cv`
- **Intencja:** szeroka fraza, wchodzimy konkretem.
- **Szkic:** twarde vs miękkie i proporcja → frazesy, które szkodzą
  („komunikatywny", „gracz zespołowy") → dane wrażliwe, których tam nie ma
  prawa być → jak wybrać umiejętności pod konkretną ofertę → kolejność ma
  znaczenie
- **Haczyk:** przy dopasowaniu przestawiamy kolejność umiejętności tak, by
  wymagane z oferty były wyżej — drobiazg, który realnie zmienia pierwsze
  wrażenie.
- **Linkuj do:** 4, 12, 6

### [ ] 10. Czy pisać CV przez ChatGPT? Co się przy tym psuje
- **Fraza:** `cv chatgpt` · wsparcie: `czy warto pisać cv przez ai`, `ai do cv`
- **Intencja:** rosnąca fraza, czytelnik waha się i szuka rozstrzygnięcia.
- **Szkic:** co ogólny model robi dobrze (język, struktura) → gdzie zawodzi
  (dopisuje umiejętności, zmyśla liczby, generyczny ton) → dlaczego rekruter
  to wyłapuje → jak używać AI bezpiecznie → czego nigdy nie oddawać modelowi
- **Haczyk:** **nasz najmocniejszy wyróżnik.** Aplikando działa odwrotnie niż
  generator: dostaje wyłącznie fakty użytkownika i nie ma jak dopisać nic od
  siebie, bo pilnuje tego walidator w kodzie. Jedyny artykuł, w którym mówimy
  to wprost i szeroko.
- **Linkuj do:** 11, 7, 15

---

## FALA 3 — frazy sprzedażowe i filar

### [ ] 11. Jak dopasować CV do oferty pracy — instrukcja krok po kroku
- **Fraza:** `dopasowanie cv do oferty` · wsparcie: `cv pod konkretną ofertę`, `jak dostosować cv`
- **Intencja:** **fraza pieniężna** — najbliżej produktu, najwyższa konwersja.
- **Szkic:** dlaczego jedno CV do wszystkiego nie działa → jak czytać
  ogłoszenie (wymagania obowiązkowe vs mile widziane) → co zmieniać, a czego
  nie ruszać → instrukcja ręczna krok po kroku → ile to zajmuje i co da się
  zautomatyzować
- **Haczyk:** artykuł uczciwie pokazuje **pełną metodę ręczną** — i właśnie
  dlatego działa. Czytelnik sam dochodzi do wniosku, że przy dziesiątej
  aplikacji chce to zrobić szybciej. Tu CTA jest najsilniejsze w całym blogu.
- **Linkuj do:** 12, 6, 8, 15

### [ ] 12. Słowa kluczowe w CV — jak wyciągnąć je z ogłoszenia
- **Fraza:** `słowa kluczowe w cv` · wsparcie: `jakie słowa kluczowe w cv`, `cv słowa kluczowe ats`
- **Intencja:** druga fraza pieniężna, naturalne przedłużenie tematu 11.
- **Szkic:** czym są dla ATS, a czym dla rekrutera → jak je znaleźć
  w ogłoszeniu (metoda ręczna) → gdzie je umieścić → dlaczego upychanie szkodzi
  → jak sprawdzić pokrycie
- **Haczyk:** liczymy pokrycie słów kluczowych jako osobne kryterium wyniku —
  pokaż zrzut z rubryką. To najbardziej „namacalna" część produktu.
- **Linkuj do:** 11, 6, 9

### [ ] 13. CV bez doświadczenia — co wpisać, gdy nie masz co wpisać
- **Fraza:** `cv bez doświadczenia` · wsparcie: `pierwsze cv`, `cv studenta`
- **Intencja:** duży wolumen, absolwenci i osoby zmieniające sytuację.
- **Szkic:** co się liczy jako doświadczenie (projekty, wolontariat, koła,
  praktyki, freelance) → jak ułożyć sekcje, gdy doświadczenia brak → co wtedy
  na górze CV → czego nie robić (zawyżanie, wypełniacze) → przykład całego CV
- **Haczyk:** kreator jest darmowy i prowadzi za rękę — dla kogoś, kto pisze
  pierwsze CV, to realna wartość jeszcze przed dopasowaniem.
- **Linkuj do:** 5, 7, 15

### [ ] 14. Zmiana branży — jak przepisać CV, żeby doświadczenie się liczyło
- **Fraza:** `cv zmiana branży` · wsparcie: `przebranżowienie cv`, `jak napisać cv przy zmianie zawodu`
- **Intencja:** konkretna, wysoka intencja; mało dobrej treści po polsku.
- **Szkic:** kompetencje przenoszalne — jak je nazwać językiem nowej branży →
  co przepisać, a co usunąć → jak ułożyć CV, gdy stanowiska nie pasują →
  podsumowanie zawodowe jako pomost → przykład przed/po
- **Haczyk:** przy zmianie branży to samo doświadczenie trzeba opowiedzieć
  inaczej **pod każdą ofertę** — dokładnie ten problem rozwiązujemy, i tu boli
  najbardziej.
- **Linkuj do:** 5, 11, 7

### [ ] 15. Jak napisać CV w 2026 — kompletny przewodnik
- **Fraza:** `jak napisać cv` · wsparcie: `cv wzór`, `co powinno zawierać cv`
- **Intencja:** **filar.** Publikowany na końcu, bo linkuje do czternastu
  poprzednich i dopiero wtedy ma czym przyciągnąć.
- **Szkic:** struktura sekcja po sekcji → dane osobowe i klauzula → każda
  sekcja z odnośnikiem do artykułu szczegółowego → format pliku i nazwa →
  checklist przed wysłaniem
- **Haczyk:** przewodnik kończy się checklistą; ostatni punkt to sprawdzenie
  dopasowania do konkretnej oferty — naturalne domknięcie.
- **Linkuj do:** wszystkie pozostałe (to jest sens filaru)

---

## Po opublikowaniu

- **Search Console** — obserwuj wyświetlenia i średnią pozycję per artykuł.
  Tekst, który po 8 tygodniach siedzi na pozycji 11–20, zwykle potrzebuje
  rozbudowy, a nie nowego artykułu obok.
- **Aktualizuj zamiast mnożyć.** Odświeżony wpis z nową datą `updated_at`
  odzyskuje pozycję taniej, niż kosztuje napisanie kolejnego.
- **Linkowanie wsteczne:** publikując nowy artykuł, dopisz do niego odnośniki
  ze starszych. Nowy tekst bez linków przychodzących indeksuje się wolniej.
- **Nie zmieniaj slugów** opublikowanych artykułów — kasuje to pozycję
  i psuje linki zewnętrzne.
