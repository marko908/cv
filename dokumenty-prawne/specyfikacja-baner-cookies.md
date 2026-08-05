# Zgody na pliki cookies — jak to działa i co jeszcze skonfigurować

Podstawa: instrukcja prawnika „3 Jak informować o plikach cookies zgodnie
z prawem?" oraz sekcja „Pliki cookies" w Polityce prywatności
(`src/lib/prawne/polityka-prywatnosci.ts`).

> **Uwaga o stanie prawnym.** Instrukcja prawnika powołuje się na „prawo
> telekomunikacyjne". Art. 173 Prawa telekomunikacyjnego został zastąpiony
> **art. 398 ustawy z dnia 12 lipca 2024 r. – Prawo komunikacji elektronicznej**
> (obowiązuje od 10 listopada 2024 r.). Treść obowiązku jest ta sama: zgoda przed
> instalacją, wyjątek dla plików niezbędnych. Zmieniła się tylko podstawa prawna —
> i tak jest zacytowana w Polityce prywatności.

**Stan: mechanizm jest zaimplementowany w kodzie. Do zrobienia został panel
GTM** (sekcja 5) i weryfikacja (sekcja 6).

---

## 1. Wymagania prawne, które baner MUSI spełnić

Z instrukcji prawnika, punkt po punkcie:

| # | Wymóg | Jak to sprawdzić |
|---|---|---|
| 1 | Prosty i jasny język opisów | brak żargonu prawniczego w treści banera |
| 2 | Baner nie może nadmiernie utrudniać korzystania ze strony | nie zasłania całego ekranu, strona pozostaje czytelna |
| 3 | **Zgody domyślnie odznaczone** | przełączniki „analityczne" i „marketingowe" startują wyłączone |
| 4 | **Żadne pliki poza niezbędnymi nie instalują się przed zgodą** | w DevTools → Application → Cookies po wejściu i przed kliknięciem widać wyłącznie cookies niezbędne |
| 5 | Możliwość zmiany decyzji **w każdej chwili** | stały przycisk „Ustawienia cookies" w stopce |
| 6 | Informacja o każdym pliku: **nazwa, dostawca, funkcja, zakres danych, okres działania** | panel szczegółów i tabela w polityce są generowane z tego samego rejestru |
| 7 | Link do Polityki prywatności w banerze | jest |
| 8 | Odmowa równie łatwa jak zgoda | „Odrzuć wszystkie" na tym samym poziomie co „Akceptuję wszystkie" |

> Punkt 8 nie jest w instrukcji prawnika wprost, ale wynika z wytycznych EROD
> i z decyzji UODO: „Akceptuję" jako duży zielony przycisk obok schowanego pod
> dwoma kliknięciami „Odrzuć" to wzorzec, który organy uznają za wymuszanie zgody.

**Punkt 4 jest najważniejszy i najczęściej łamany.** Nie wystarczy pokazać baner —
skrypt nie może się w ogóle pobrać, dopóki zgody nie ma. Ładowanie „na wszelki
wypadek" i wysyłanie zdarzeń dopiero po zgodzie to naruszenie: sam skrypt zakłada
już pliki.

---

## 2. Kategorie zgód

Dokładnie te trzy — tak jak w tabeli w Polityce prywatności:

| Kategoria | Można wyłączyć? | Co obejmuje |
|---|---|---|
| **Niezbędne** | nie | sesja logowania (Supabase), zapis zgód cookies, pamięć lokalna kreatora CV, zabezpieczenie płatności (Stripe) |
| **Analityczne** | tak, domyślnie WYŁĄCZONE | Vercel Analytics / Speed Insights, Google Analytics 4, Microsoft Clarity |
| **Marketingowe** | tak, domyślnie WYŁĄCZONE | Meta Pixel |

**Vercel Analytics w kategorii analitycznej** — mimo że Vercel deklaruje działanie
bez cookies i bez danych osobowych. Zwolnienie go ze zgody wymagałoby osobnej
analizy; do tego czasu trzymamy go za zgodą, a Polityka prywatności właśnie tak
go opisuje.

---

## 3. Architektura — dwie drogi ładowania

Narzędzia startują dwiema drogami i trzeba wiedzieć, czego szukać gdzie:

| Narzędzie | Skąd startuje | Czym jest bramkowane |
|---|---|---|
| Vercel Analytics / Speed Insights | kod (`skrypty-narzedzi.tsx`) | warunek w Reakcie — kategoria „analityczne" |
| Google Analytics 4 | **tag w GTM** | Consent Mode (`analytics_storage`) |
| Microsoft Clarity | **tag w GTM** | Dodatkowe sprawdzenia zgody (`analytics_storage`) |
| Meta Pixel | **tag w GTM** | Dodatkowe sprawdzenia zgody (`ad_storage`) |

**Dlaczego Vercel nie idzie do GTM:** jego skrypty są serwowane pierwszostronnie
z `/_vercel/...`. Przeniesienie ich do GTM zamieniłoby żądanie pierwszostronne
na trzeciostronne do Google — dokładnie odwrotnie, niż chcemy.

**Kiedy ładuje się kontener GTM:** dopiero gdy użytkownik zgodzi się na **co
najmniej jedną** kategorię opcjonalną. Kto odrzuci wszystko, nie wyśle do Google
ani jednego żądania — także po sam plik `gtm.js`.

> **Świadomie odrzucony wariant:** kontener ładowany zawsze, z tagami
> wstrzymanymi przez Consent Mode. To standard rynkowy i daje modelowanie
> konwersji w GA4 dla osób, które odmówiły — ale kosztuje jedno żądanie do
> Google przy każdej wizycie, także odmawiającej, czyli przekazanie adresu IP
> bez zgody. Przy aplikacji, do której ludzie wklejają swoje CV, wybrano wariant
> ostrożniejszy. Zmiana = przekazanie `true` zamiast `jakakolwiekZgoda`
> w `SkryptyNarzedzi`.

### ⚠️ Consent Mode nie wystarcza sam z siebie

Consent Mode to protokół **Google**. GA4 go respektuje. **Meta Pixel i Microsoft
Clarity nie.** Ustawienie `ad_storage: denied` nie powstrzyma tagu Meta Pixel —
odpali się i założy `_fbp`.

Dlatego każdy tag spoza ekosystemu Google **musi** mieć w GTM ustawione
„Dodatkowe sprawdzenia zgody". To najczęściej pomijany krok w takiej
konfiguracji i najłatwiejszy sposób na naruszenie mimo poprawnego banera.

### ⚠️ Tagi żyją poza repo — największe ryzyko tej konstrukcji

Od wpięcia narzędzi w GTM **dodanie tagu przestało być commitem**. Ktoś dodaje
tag w panelu w dwie minuty i w tej samej sekundzie:

- Polityka prywatności staje się nieprawdziwa (opisuje węższy zestaw narzędzi),
- nowe pliki lądują u osób, które zgodziły się na poprzedni zestaw,
- `WERSJA_ZGODY` nie została podniesiona, więc nikt nie zostanie zapytany ponownie.

Technicznie nie da się tego wymusić z kodu. Obowiązuje zasada, **w tej
kolejności**:

1. wpis w `src/lib/prawne/cookies-rejestr.ts`,
2. podniesienie `WERSJA_ZGODY` w `src/lib/cookies/zgody.ts`,
3. **dopiero potem** publikacja wersji kontenera w GTM.

Uprawnienie do publikowania kontenera powinna mieć jedna osoba, z włączonym
powiadomieniem o publikacji wersji.

---

## 4. Co jest w kodzie

| Plik | Rola |
|---|---|
| `src/lib/prawne/cookies-rejestr.ts` | **jedno źródło prawdy** o narzędziach; zasila tabelę w polityce (`TABELA_COOKIES_MD`) i panel zgód |
| `src/lib/cookies/zgody.ts` | odczyt/zapis cookie `aplikando_zgody_cookies`, `WERSJA_ZGODY`, kasowanie plików po wycofaniu zgody |
| `src/lib/cookies/tryb-zgody-google.ts` | Consent Mode v2 — `default (denied)` i `update`, same wpisy do `dataLayer` |
| `src/components/cookies/kontekst-zgod.tsx` | stan zgód, montaż banera i panelu, sprzątanie plików przy każdym wejściu |
| `src/components/cookies/baner-cookies.tsx` | baner pierwszej wizyty |
| `src/components/cookies/panel-cookies.tsx` | panel szczegółowy z przełącznikami |
| `src/components/cookies/przycisk-ustawien-cookies.tsx` | „Ustawienia cookies" w stopce |
| `src/components/cookies/skrypty-narzedzi.tsx` | ładuje Vercel Analytics (kod) i kontener GTM (po zgodzie) |

Cookie zgód: `aplikando_zgody_cookies`, `SameSite=Lax`, `Secure` na HTTPS,
12 miesięcy, zawiera wersję zgody, wybrane kategorie i znacznik czasu ISO.

Zmienna środowiskowa: **`NEXT_PUBLIC_GTM_ID`** (`GTM-XXXXXXX`). Brak
identyfikatora = kontener po prostu się nie ładuje, bez błędu. Wcześniejsze
`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` i `NEXT_PUBLIC_CLARITY_ID` są
już niepotrzebne — te identyfikatory wpisuje się teraz w tagach w GTM.

---

## 5. DO ZROBIENIA: konfiguracja panelu GTM

- [ ] Załóż kontener typu **Web** dla `aplikando.pl`. Skopiuj identyfikator
      `GTM-XXXXXXX` do `NEXT_PUBLIC_GTM_ID` w env (Vercel: Preview + Production).
- [ ] **Nie wklejaj snippetu GTM do `layout.tsx`.** Kontener ładuje
      `skrypty-narzedzi.tsx`, warunkowo. Wklejony snippet ładowałby go zawsze,
      również przy odmowie zgody — czyli obszedłby cały mechanizm.
- [ ] Admin → Ustawienia kontenera → włącz **Zgody użytkowników**
      (*Consent Overview*). Bez tego nie zobaczysz kolumny zgód przy tagach.
- [ ] **Tag GA4** (Google Tag): identyfikator strumienia, wyzwalacz
      *Initialization – All Pages*. Wbudowane sprawdzenie zgody respektuje
      `analytics_storage` automatycznie; dla jawności ustaw dodatkowo
      *Additional Consent Checks* → `analytics_storage`.
- [ ] **Tag Microsoft Clarity**: *Additional Consent Checks* → **`analytics_storage`**.
      Bez tego odpali się mimo odmowy.
- [ ] **Tag Meta Pixel**: *Additional Consent Checks* → **`ad_storage`**.
      Bez tego odpali się mimo odmowy.
- [ ] **Odsłony w aplikacji jednostronicowej**: dodaj wyzwalacz *History Change*
      dla tagu Meta Pixel (zdarzenie `PageView`). GA4 i Clarity liczą odsłony
      same przy zmianie History API — dorzucenie im wyzwalacza dałoby podwójne
      odsłony. Kod nie zgłasza odsłon, robi to wyłącznie GTM.
- [ ] Jeżeli włączysz **Conversion Linker** (Google Ads): dopisz plik `_gcl_au`
      do wpisu Google Analytics w `cookies-rejestr.ts` i podnieś `WERSJA_ZGODY`.
- [ ] Opublikuj wersję kontenera.

---

## 6. DO ZROBIENIA: weryfikacja

Na świeżym profilu przeglądarki, na wdrożeniu preview:

- [ ] **Przed kliknięciem czegokolwiek**: DevTools → Application → Cookies
      pokazuje wyłącznie cookies niezbędne. Zakładka Network **nie zawiera**
      żądania do `googletagmanager.com`. Zrzut ekranu.
- [ ] **Po „Odrzuć wszystkie"**: nadal zero żądań do `googletagmanager.com`,
      zero `_ga`, `_fbp`, `_clck`.
- [ ] **Po „Akceptuję wszystkie"**: kontener się ładuje, pojawiają się `_ga`,
      `_ga_*`, `_fbp`, `_clck`, `_clsk`. Zrzut ekranu.
- [ ] **Wybór mieszany** (analityczne TAK, marketingowe NIE) — najważniejszy
      test, bo tu działają sprawdzenia zgody w GTM: `_ga` jest, `_fbp` **nie ma**.
- [ ] **Tag Assistant**, zakładka *Consent*: przed zgodą wszystkie sygnały
      `denied`, po zgodzie odpowiednie `granted`. Ten test weryfikuje przy okazji,
      że `dataLayer.push(arguments)` w `tryb-zgody-google.ts` jest odczytywany
      poprawnie — to miejsce, w którym Consent Mode potrafi po cichu nie zadziałać.
- [ ] **Wycofanie zgody**: pliki znikają, strona się przeładowuje.
- [ ] **Brak migotania**: przy drugim wejściu baner nie błyska.
- [ ] **Szerokość 375 px**: baner nie zasłania treści, panel przewija się
      poprawnie (wysokości w `dvh`, nie `vh`).

---

## 7. Zgodność z UI (nienaruszalna)

Styl Spotify, dark-only. Tła `#121212 / #181818 / #1f1f1f`, jedyny akcent zieleń
`#1ed760` (wyłącznie funkcjonalnie), przyciski pill `rounded-full` uppercase,
ciężkie cienie, bez szarych ramek, font Figtree. Tokeny z `globals.css`
(`bg-card`, `text-muted-foreground`, `bg-primary`), nie kolory na sztywno.
Komponenty z `components/ui/`, bez nowych zależności.

Na telefonie: baner jako pasek dolny, wysokości w `dvh`, panel jako `flex-col`
z przewijanym wyłącznie środkiem — patrz „Konwencje i pułapki" w `STRUKTURA.md`.
