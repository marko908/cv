# Baner cookies — specyfikacja i prompt wdrożeniowy

Podstawa: instrukcja prawnika „3 Jak informować o plikach cookies zgodnie
z prawem?" oraz sekcja „Pliki cookies" w opublikowanej Polityce prywatności
(`src/lib/prawne/polityka-prywatnosci.ts`).

> **Uwaga o stanie prawnym.** Instrukcja prawnika powołuje się na „prawo
> telekomunikacyjne". Art. 173 Prawa telekomunikacyjnego został zastąpiony
> **art. 398 ustawy z dnia 12 lipca 2024 r. – Prawo komunikacji elektronicznej**
> (obowiązuje od 10 listopada 2024 r.). Treść obowiązku jest ta sama: zgoda przed
> instalacją, wyjątek dla plików niezbędnych. Zmieniła się tylko podstawa prawna —
> i tak jest zacytowana w Polityce prywatności.

---

## 1. Wymagania prawne, które baner MUSI spełnić

Z instrukcji prawnika, punkt po punkcie:

| # | Wymóg | Jak to sprawdzić |
|---|---|---|
| 1 | Prosty i jasny język opisów | brak żargonu prawniczego w treści banera |
| 2 | Baner nie może nadmiernie utrudniać korzystania ze strony | nie zasłania całego ekranu, strona pozostaje czytelna |
| 3 | **Zgody domyślnie odznaczone** | przełączniki „analityczne" i „marketingowe" startują wyłączone |
| 4 | **Żadne pliki poza niezbędnymi nie instalują się przed zgodą** | w DevTools → Application → Cookies po wejściu i przed kliknięciem widać wyłącznie cookies niezbędne |
| 5 | Możliwość zmiany decyzji **w każdej chwili** | stały odnośnik „Ustawienia cookies" w stopce |
| 6 | Informacja o każdym pliku: **nazwa, dostawca, funkcja, zakres danych, okres działania** | panel szczegółów odwzorowuje tabelę z Polityki prywatności |
| 7 | Link do Polityki prywatności w banerze | jest |
| 8 | Odmowa równie łatwa jak zgoda | przycisk „Odrzuć wszystkie" na tym samym poziomie co „Akceptuję wszystkie" |

> Punkt 8 nie jest w instrukcji prawnika wprost, ale wynika z wytycznych EROD
> i z decyzji UODO: „Akceptuję" jako duży zielony przycisk obok schowanego pod
> dwoma kliknięciami „Odrzuć" to wzorzec, który organy uznają za wymuszanie zgody.
> Instrukcja dopuszcza optymalizację pod akceptację (przycisk „akceptuję wszystkie
> i przechodzę do serwisu") — ale przy zachowaniu równorzędnej odmowy.

**Punkt 4 jest najważniejszy i najczęściej łamany.** Nie wystarczy pokazać baner —
skrypty GA4, Meta Pixel i Clarity nie mogą się w ogóle załadować, dopóki zgody nie
ma. Ładowanie ich „na wszelki wypadek" i wysyłanie zdarzeń dopiero po zgodzie to
naruszenie: sam skrypt ustawia już pliki.

---

## 2. Kategorie zgód

Muszą być dokładnie te trzy — tak jak w tabeli w Polityce prywatności:

| Kategoria | Można wyłączyć? | Co obejmuje |
|---|---|---|
| **Niezbędne** | nie | sesja logowania (Supabase), zapis zgód cookies, pamięć lokalna kreatora CV, zabezpieczenie płatności (Stripe) |
| **Analityczne** | tak, domyślnie WYŁĄCZONE | Vercel Analytics / Speed Insights, Google Analytics 4, Microsoft Clarity |
| **Marketingowe** | tak, domyślnie WYŁĄCZONE | Meta Pixel |

**Vercel Analytics w kategorii analitycznej** — mimo że Vercel deklaruje działanie
bez cookies i bez danych osobowych. Jeśli chcesz go zwolnić ze zgody, potrzebna
jest osobna analiza; do tego czasu bezpieczniej trzymać go za zgodą, a Polityka
prywatności właśnie tak go opisuje.

---

## 3. Wymagania techniczne po stronie kodu

- **Zapis wyboru** w cookie `aplikando_zgody_cookies` (nie w localStorage — musi
  być czytelny także dla ewentualnego kodu serwerowego), `SameSite=Lax`,
  `Secure`, `max-age` 12 miesięcy. Zawartość: wersja zgody, wybrane kategorie,
  znacznik czasu ISO.
- **Wersjonowanie zgody.** Stała `WERSJA_ZGODY`. Podniesienie jej (np. po dodaniu
  nowego narzędzia) unieważnia zapisane zgody i pokazuje baner ponownie —
  bez tego dodanie Clarity oznaczałoby przetwarzanie bez zgody.
- **Brak migotania.** Baner nie może błysnąć u kogoś, kto już zdecydował. Odczyt
  cookie przed pierwszym malowaniem albo render warunkowy po stronie serwera.
- **Google Consent Mode v2** dla GA4 i Meta Pixel: `default` ze wszystkimi
  sygnałami `denied` przed skryptem GA, `update` po zgodzie.
- **Wycofanie zgody musi realnie działać** — nie tylko przestać wysyłać zdarzenia,
  ale usunąć pliki ustawione przez dane narzędzie (`_ga`, `_ga_*`, `_fbp`, `_clck`,
  `_clsk`) i przeładować stronę.
- **Odnośnik w stopce.** `src/components/stopka.tsx` ma w tym miejscu komentarz
  `⚠️ DO DODANIA RAZEM Z BANEREM COOKIES` — przycisk trafia dokładnie tam.
  Polityka prywatności obiecuje, że odnośnik nazywa się **„Ustawienia cookies"**.
- **Dostępność:** panel to dialog z pułapką fokusu, zamykany Esc, przełączniki
  obsługiwane klawiaturą, kontrast zgodny z resztą UI.

---

## 4. Zgodność z UI (nienaruszalna)

Styl Spotify, dark-only. Tła `#121212 / #181818 / #1f1f1f`, jedyny akcent zieleń
`#1ed760` (wyłącznie funkcjonalnie), przyciski pill `rounded-full` uppercase,
ciężkie cienie, bez szarych ramek, font Figtree. Używać tokenów z `globals.css`
(`bg-card`, `text-muted-foreground`, `bg-primary`), a nie kolorów wpisanych
na sztywno. Komponenty z `components/ui/` (shadcn/radix), nie nowe zależności.

Na telefonie: baner jako pasek dolny, wysokości w `dvh` (nie `vh`), panel
szczegółów jako `flex-col` z przewijanym wyłącznie środkiem — patrz sekcja
„Konwencje i pułapki" w `STRUKTURA.md`.

---

## 5. Prompt do wklejenia w osobnym agencie

Skopiuj wszystko poniżej linii.

---

Pracujesz w repo `cv-copilot` (Next.js 16 App Router, React 19, Tailwind v4,
shadcn/ui, dark-only). Przeczytaj najpierw `STRUKTURA.md` i `AGENTS.md` — to nie
jest Next.js, który znasz, więc przed pisaniem kodu Next zajrzyj do
`node_modules/next/dist/docs/`. Pracuj na branchu `dev`, nie uruchamiaj
localhosta — commituj na `dev` i weryfikuj na preview Vercela.

**Zadanie:** zaimplementuj mechanizm zgód na pliki cookies zgodny z opublikowaną
Polityką prywatności.

**Źródła prawdy, których MUSISZ się trzymać (przeczytaj je przed startem):**

1. `dokumenty-prawne/specyfikacja-baner-cookies.md` — pełne wymagania prawne
   i techniczne (ten plik).
2. `src/lib/prawne/polityka-prywatnosci.ts`, sekcja „Pliki cookies" — tabela
   narzędzi. **Nazwy plików, dostawcy, kategorie i okresy działania w banerze
   MUSZĄ być identyczne z tą tabelą.** Rozjazd między banerem a polityką to
   dokładnie ten błąd, który organ nadzorczy znajduje pierwszy. Jeśli musisz coś
   zmienić — zmień OBA miejsca w tym samym commicie.
3. `src/components/stopka.tsx` — miejsce na przycisk „Ustawienia cookies",
   oznaczone komentarzem.

**Zakres:**

- Trzy kategorie: niezbędne (zawsze aktywne), analityczne, marketingowe.
  Analityczne i marketingowe **domyślnie wyłączone**.
- Baner przy pierwszej wizycie: krótki opis, link do Polityki prywatności,
  trzy równorzędne akcje — „Akceptuję wszystkie", „Odrzuć wszystkie",
  „Dostosuj". Przycisk odmowy tak samo widoczny jak akceptacji.
- Panel „Dostosuj" / „Ustawienia cookies": przełączniki kategorii + rozwijana
  lista narzędzi z nazwą pliku, dostawcą, funkcją, zakresem danych i okresem
  działania (dane z tabeli w polityce).
- Zapis w cookie `aplikando_zgody_cookies` (SameSite=Lax, Secure, 12 miesięcy),
  z polem wersji. Stała `WERSJA_ZGODY` — jej podniesienie unieważnia stare zgody.
- **Żaden skrypt analityczny ani marketingowy nie może się załadować przed
  zgodą.** Ładowanie warunkowe po stronie klienta, nie samo wstrzymanie zdarzeń.
- Google Consent Mode v2: domyślnie wszystkie sygnały `denied`, `update`
  po zgodzie.
- Wycofanie zgody usuwa pliki danego narzędzia (`_ga`, `_ga_*`, `_fbp`, `_clck`,
  `_clsk`) i przeładowuje stronę.
- Przycisk „Ustawienia cookies" w stopce — stale dostępny, otwiera panel.
  Usuń przy okazji komentarz `⚠️ DO DODANIA RAZEM Z BANEREM COOKIES`.
- Skrypty narzędzi (Vercel Analytics/Speed Insights, GA4, Meta Pixel, Microsoft
  Clarity) ładowane dopiero po zgodzie właściwej kategorii. Identyfikatory
  (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`)
  z env; brak identyfikatora = narzędzie po prostu się nie ładuje, bez błędu.

**Czego NIE robić:**

- Nie dodawać zewnętrznych bibliotek CMP (Cookiebot, Osano itp.) — własny
  komponent na shadcn/radix.
- Nie ruszać UI poza stopką i nowymi komponentami. Styl Spotify dark-only jest
  nienaruszalny: tła `#121212/#181818/#1f1f1f`, akcent `#1ed760` wyłącznie
  funkcjonalnie, przyciski pill `rounded-full` uppercase, font Figtree, tokeny
  z `globals.css` zamiast kolorów na sztywno.
- Nie zmieniać treści dokumentów prawnych bez wyraźnej potrzeby; jeśli zmiana
  jest konieczna — zgłoś ją i zmień polityka + baner razem.
- Nie stosować dark patternów: brak wstępnie zaznaczonych zgód, brak
  „Odrzuć" ukrytego pod dodatkowymi kliknięciami, brak zamykania banera
  krzyżykiem traktowanego jako zgoda.

**Po wdrożeniu zweryfikuj i pokaż dowód:**

1. Wyczyść `.next` (`Remove-Item .next -Recurse -Force`) — w tym Next dodanie
   trasy/komponentu bez czyszczenia daje 404 mimo obecnego pliku.
2. `npx tsc --noEmit` i `npm run build` — czysto.
3. W przeglądarce, na świeżym profilu: po wejściu i PRZED kliknięciem czegokolwiek
   w DevTools → Application → Cookies widać **wyłącznie** cookies niezbędne.
   Zrób zrzut ekranu.
4. Po „Akceptuję wszystkie" pojawiają się `_ga`, `_fbp`, `_clck`. Po wycofaniu
   zgody znikają. Zrzut ekranu obu stanów.
5. Sprawdź na szerokości 375 px, że baner nie zasłania treści i że panel przewija
   się poprawnie (wysokości w `dvh`, nie `vh`).
6. Zaktualizuj `STRUKTURA.md` w tym samym commicie — to obowiązek w tym repo.

Commit po polsku, zakończony `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
