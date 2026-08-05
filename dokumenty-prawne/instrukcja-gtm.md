# Konfiguracja Google Tag Managera — instrukcja od zera

Stan wyjściowy (2026-08-05): **nie masz jeszcze konta GTM, kontenera ani
żadnego tagu.** Kod po stronie Aplikanda jest już gotowy — czeka wyłącznie na
identyfikator kontenera w zmiennej środowiskowej i na skonfigurowanie tagów
w panelu. Ten dokument prowadzi przez to krok po kroku.

Kontekst prawny i architektoniczny (dlaczego coś działa tak, a nie inaczej)
jest w `specyfikacja-baner-cookies.md`. Ten plik jest czysto instruktażowy —
kliknięcia, w tej kolejności.

---

## 0. Zanim zaczniesz — jedna decyzja

**Załóż osobne konta pomiarowe dla Preview i Production, albo w ogóle nie
włączaj GTM na Preview.** Rekomendacja: **`NEXT_PUBLIC_GTM_ID` ustaw TYLKO
na Production.** Kod już to obsługuje bez zmian — brak zmiennej środowiskowej
oznacza, że kontener się nie ładuje, bez błędu (ten sam wzorzec co
`GOOGLE_GENERATIVE_AI_API_KEY` i pozostałe klucze w projekcie).

Powód: preview Vercela to środowisko, na którym Ty i Claude klikacie w trakcie
pracy. Bez tego rozdzielenia każde kliknięcie w test na preview leci do tych
samych danych GA4/Meta co ruch prawdziwych użytkowników — dokładnie ten sam
problem, przed którym chroni już `tryb_testowy` przy Stripe. Testowanie samego
kontenera GTM (czy tagi się odpalają, czy sprawdzenia zgody działają) robi się
trybem **Preview/Debug** w GTM (krok 8 niżej) — on działa na dowolnym adresie,
łącznie z preview Vercela, i NIE wymaga, żeby `NEXT_PUBLIC_GTM_ID` był tam
ustawiony na stałe.

---

## 1. Załóż konto i kontener GTM

1. Wejdź na [tagmanager.google.com](https://tagmanager.google.com) i zaloguj
   się kontem Google, którym chcesz zarządzać kontenerem (najlepiej dedykowane
   konto firmowe, nie prywatne — łatwiej później dodać współpracownika albo
   agencję).
2. **Utwórz konto**: nazwa konta = „Aplikando”, kraj = Polska.
3. **Utwórz kontener**: nazwa = `aplikando.pl`, „Gdzie będzie używany kontener”
   → **Web**.
4. Po utworzeniu zobaczysz okno z fragmentem kodu do wklejenia na stronę —
   **zamknij je, niczego nie wklejaj**. Kod już jest w repo
   (`components/cookies/skrypty-narzedzi.tsx`) i ładuje kontener SAM, dopiero
   po zgodzie użytkownika. Wklejenie standardowego snippetu do `layout.tsx`
   ładowałoby GTM zawsze, również przy odmowie zgody — omijałoby to cały
   mechanizm baneru.
5. Zanotuj identyfikator kontenera, format `GTM-XXXXXXX` — widoczny w prawym
   górnym rogu panelu, obok nazwy konta.

## 2. Dodaj identyfikator do Vercela

1. Panel Vercela → projekt `cv` → **Settings → Environment Variables**.
2. Dodaj `NEXT_PUBLIC_GTM_ID` = `GTM-XXXXXXX`, środowisko: **Production**
   (zgodnie z decyzją z kroku 0 — NIE zaznaczaj Preview).
3. Redeploy Productiona (albo poczekaj na najbliższy merge do `main` — zmienne
   `NEXT_PUBLIC_*` są wypiekane w build, więc sam zapis zmiennej nic jeszcze
   nie zmienia w już wdrożonej wersji).

## 3. Włącz przegląd zgód w kontenerze

1. W GTM: **Admin → Container Settings**.
2. Zaznacz **Enable consent overview** (Zgody użytkowników).
3. Zapisz. Od teraz w widoku każdego tagu pojawi się sekcja „Consent Settings”
   pokazująca, jakie sprawdzenia zgody są na nim aktywne — to główne narzędzie
   do weryfikacji w kroku 8.

## 4. Tag: Google Analytics 4

Jeżeli nie masz jeszcze właściwości GA4 dla Aplikanda:

1. [analytics.google.com](https://analytics.google.com) → **Utwórz
   właściwość** → nazwa „Aplikando”, strefa czasowa Polska, waluta PLN.
2. Podczas konfiguracji strumienia danych wybierz **Web**, adres
   `https://aplikando.pl`.
3. **Admin strumienia → Enhanced measurement (Pomiar zaawansowany)** — upewnij
   się, że **„Page changes based on browser history events”** jest włączone
   (domyślnie jest). Dzięki temu GA4 sam liczy kolejne „odsłony” przy
   nawigacji w aplikacji jednostronicowej — nie trzeba nic dodawać w GTM.
4. Skopiuj **Identyfikator pomiaru** (Measurement ID), format `G-XXXXXXXXXX`,
   z **Admin → Strumienie danych → [Twój strumień]**.

W GTM:

1. **Tags → New**.
2. Typ tagu: **Google Tag** (kafelek z logo Google, nie „Custom HTML”).
3. Tag ID: wklej `G-XXXXXXXXXX` z GA4.
4. Wyzwalacz: **Initialization – All Pages**.
5. Nazwa tagu: „GA4 – Config”.
6. **Nie musisz nic ustawiać w sekcji Consent Settings.** Tagi typu Google Tag
   respektują Consent Mode automatycznie — to Google odczytuje sygnał
   `analytics_storage`, który kod aplikacji ustawia PRZED załadowaniem
   kontenera (`lib/cookies/tryb-zgody-google.ts`). „Dodatkowe sprawdzenia
   zgody” dotyczą tagów spoza ekosystemu Google (kroki 5–6).
7. Zapisz.

## 5. Tag: Microsoft Clarity

1. [clarity.microsoft.com](https://clarity.microsoft.com) → **Add new
   project** → nazwa „Aplikando”, adres `aplikando.pl`, kategoria dowolna.
2. Skopiuj **Project ID** z **Settings → Setup → Install tracking code**
   (krótki alfanumeryczny ciąg, nie cały fragment kodu).

W GTM:

1. **Tags → New → Tag Configuration**.
2. Kliknij **Discover more tag types in the Community Template Gallery**,
   wyszukaj „Microsoft Clarity” (oficjalny szablon od Microsoft) i zainstaluj.
   Jeśli szablonu nie znajdziesz, użyj typu **Custom HTML** i wklej oficjalny
   fragment ze strony Clarity (Settings → Setup), podmieniając identyfikator
   projektu na ten z kroku wyżej.
3. Wklej Project ID w polu szablonu.
4. Wyzwalacz: **Initialization – All Pages**.
5. Nazwa tagu: „Microsoft Clarity”.
6. **⚠️ Ustaw Additional Consent Checks → `analytics_storage`.** Sekcja
   „Advanced Settings → Consent Settings → Require additional consent for tag
   to fire” → zaznacz `analytics_storage`. **To jest krok, który najłatwiej
   pominąć — Clarity NIE respektuje Consent Mode automatycznie.** Bez tego
   ustawienia tag odpali się nawet wtedy, gdy użytkownik odmówił zgody
   analitycznej.
7. Zapisz.

## 6. Tag: Meta Pixel

1. [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
   → **Połącz źródła danych → Web → Meta Pixel** → nazwa „Aplikando”, adres
   `aplikando.pl`.
2. Skopiuj **Identyfikator piksela** (ciąg cyfr).

W GTM:

1. **Tags → New → Tag Configuration**.
2. Wyszukaj w Community Template Gallery szablon „Facebook Pixel” (od Facebook/
   Meta) i zainstaluj, albo użyj **Custom HTML** z oficjalnym fragmentem
   `fbq(...)` ze strony Events Managera.
3. Wklej identyfikator piksela.
4. Wyzwalacze — **dwa, nie jeden**:
   - **Initialization – All Pages** (pierwsza odsłona),
   - nowy wyzwalacz typu **History Change**, żeby Meta Pixel widział kolejne
     „strony” przy nawigacji w aplikacji jednostronicowej. Utwórz go raz:
     **Triggers → New → History Change**, bez dodatkowych warunków, nazwa
     „Zmiana historii – SPA”. GA4 i Clarity liczą to same — dodanie im tego
     samego wyzwalacza dałoby podwójne zliczenia, dlatego dotyczy to
     WYŁĄCZNIE tagu Meta Pixel.
5. Zdarzenie na obu wyzwalaczach: `PageView`.
6. Nazwa tagu: „Meta Pixel – PageView”.
7. **⚠️ Ustaw Additional Consent Checks → `ad_storage`.** Tak samo jak przy
   Clarity — Meta Pixel nie respektuje Consent Mode sam z siebie.
8. Zapisz.

## 7. Podsumowanie — tabela kontrolna

| Tag | Typ | Wyzwalacz(e) | Additional Consent Checks |
|---|---|---|---|
| GA4 – Config | Google Tag | Initialization – All Pages | brak (automatyczne) |
| Microsoft Clarity | Community Template / Custom HTML | Initialization – All Pages | `analytics_storage` |
| Meta Pixel – PageView | Community Template / Custom HTML | Initialization – All Pages + History Change | `ad_storage` |

Jeżeli którekolwiek pole w tej tabeli nie zgadza się z tym, co widzisz
w panelu GTM przy danym tagu (zakładka „Consent Settings” w widoku tagu) —
tag odpali się dla kogoś, kto nie wyraził zgody. To najczęstsza przyczyna
naruszenia mimo poprawnie działającego banera.

## 8. Testowanie — tryb Preview/Debug (przed publikacją)

**Nie publikuj kontenera, dopóki tego nie sprawdzisz.** W GTM wersje robocze
i opublikowane są rozdzielone — możesz testować bez wpływu na kogokolwiek.

1. W GTM kliknij **Preview** (prawy górny róg).
2. Wpisz adres do przetestowania — **preview Vercela też działa**, mimo że
   `NEXT_PUBLIC_GTM_ID` jest tam pusty: w polu Preview wklej zamiast tego
   `https://aplikando.pl` (albo dowolny inny adres — GTM Preview łączy się
   z przeglądarką przez rozszerzenie/parametr URL, niezależnie od tego, gdzie
   faktycznie jest wdrożony kontener na tamtym adresie). Najprościej: **na
   chwilę** dodaj `NEXT_PUBLIC_GTM_ID` też do Preview w Vercelu, przetestuj na
   gałęzi `dev`, potem usuń zmienną z Preview — zgodnie z decyzją z kroku 0.
3. Otworzy się „Tag Assistant” w nowej karcie, połączony z testowaną stroną.
4. **Test 1 — przed jakąkolwiek zgodą:** wejdź na stronę na czystym profilu
   (okno incognito). W Tag Assistant, zakładka **Summary**, żaden tag nie
   powinien mieć statusu „Fired” (Zainicjowano). Zakładka **Consent** ma
   pokazywać wszystkie sygnały jako `denied`.
5. **Test 2 — „Odrzuć wszystkie” w banerze:** dalej zero odpalonych tagów.
6. **Test 3 — wybór mieszany** (w panelu „Ustawienia cookies”: analityczne
   TAK, marketingowe NIE): GA4 i Microsoft Clarity mają status „Fired”, Meta
   Pixel — **NOT fired**, konkretnie z powodu `ad_storage: denied` widocznego
   w jego karcie w Tag Assistant.
7. **Test 4 — „Akceptuję wszystkie”:** wszystkie trzy tagi „Fired”, zakładka
   Consent pokazuje `analytics_storage: granted` i `ad_storage: granted`.
8. **Test 5 — nawigacja wewnątrz aplikacji** (np. z `/` do `/app`): w zakładce
   Summary powinno pojawić się nowe zdarzenie `PageView` z tagu Meta Pixel
   przy każdej zmianie trasy; GA4 i Clarity aktualizują się same, bez nowego
   wpisu w Tag Assistant (to normalne — liczą to wewnętrznie).
9. W przeglądarce, DevTools → Application → Cookies: po Teście 4 sprawdź
   obecność `_ga`, `_ga_*`, `_fbp`, `_clck`/`_clsk` — muszą się zgadzać
   z wpisami w `src/lib/prawne/cookies-rejestr.ts`.

Pełna checklista weryfikacyjna (poza samym GTM) jest w
`specyfikacja-baner-cookies.md`, sekcja 6.

## 9. Publikacja

1. Gdy wszystkie testy z kroku 8 przejdą: **Submit** (prawy górny róg GTM).
2. Nazwa wersji: np. „GA4 + Clarity + Meta Pixel — pierwsze wdrożenie”. Opis:
   krótko co zawiera (przyda się za pół roku, gdy będziesz szukać, kiedy coś
   dodano).
3. **Publish.**
4. Jeżeli tymczasowo dodawałeś `NEXT_PUBLIC_GTM_ID` do środowiska Preview
   w kroku 8 — usuń go teraz (decyzja z kroku 0).

## 10. Zasada na przyszłość — zanim dodasz KOLEJNY tag

Nie dodawaj nowego tagu w GTM impulsywnie. `cookies-rejestr.ts` i Polityka
prywatności opisują dokładnie te trzy narzędzia — nowy tag bez zmiany kodu
sprawia, że oba te miejsca stają się nieprawdziwe, a nowe pliki lądują u osób,
które zgodziły się na węższy zestaw. Kolejność, zawsze:

1. wpis w `src/lib/prawne/cookies-rejestr.ts` (nazwa, dostawca, kategoria,
   funkcje, okres działania, pliki do skasowania przy wycofaniu zgody),
2. podniesienie `WERSJA_ZGODY` w `src/lib/cookies/zgody.ts`,
3. **dopiero teraz** dodanie i publikacja tagu w GTM.

Szerzej: `specyfikacja-baner-cookies.md`, sekcja 3, „Tagi żyją poza repo”.
