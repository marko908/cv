/**
 * Dane identyfikacyjne Usługodawcy i parametry dokumentów prawnych —
 * JEDNO ŹRÓDŁO PRAWDY.
 *
 * Instrukcja prawnika (plik „2 Instrukcja_dokumenty SaaS") wymaga, żeby dane
 * firmy były IDENTYCZNE w regulaminie, polityce prywatności, stopce strony
 * i dokumentach sprzedażowych. Rozjazd między tymi miejscami to nie kosmetyka:
 * przy sporze konsumenckim podważa wiarygodność całego dokumentu.
 *
 * Dlatego treści dokumentów (`regulamin.ts`, `polityka-prywatnosci.ts`,
 * `regulamin-newslettera.ts`) NIE wpisują tych danych na sztywno — składają je
 * z tego pliku. Zmiana adresu / e-maila / daty = zmiana TUTAJ, w jednym miejscu.
 */

/*
 * Kod pocztowy i miejscowość stoją ROZDZIELNIE, bo `PostalAddress` ze
 * schema.org (JSON-LD na landingu, `lib/schema-strony.ts`) wymaga osobnych
 * pól `postalCode` i `addressLocality`. Sklejona forma „41-200 Sosnowiec",
 * której używają dokumenty prawne, powstaje z nich niżej — dzięki temu nie ma
 * dwóch zapisów tego samego adresu, które mogłyby się rozjechać.
 */
const KOD_POCZTOWY = "41-200";
const MIASTO = "Sosnowiec";

/** Pełne dane rejestrowe. JDG wpisana do CEIDG — nie ma KRS ani kapitału zakładowego. */
export const FIRMA = {
  imieNazwisko: "Marko Nowak",
  nazwa: "Markonn Marko Nowak",
  ulica: "ul. Mariana Maliny 5a/17",
  kodPocztowy: KOD_POCZTOWY,
  miasto: MIASTO,
  kodMiasto: `${KOD_POCZTOWY} ${MIASTO}`,
  nip: "6443568932",
  regon: "522854985",
  email: "marko@aplikando.pl",
} as const;

/** Adres w jednej linii — do zdań typu „pod adresem: …". */
export const ADRES = `${FIRMA.ulica}, ${FIRMA.kodMiasto}`;

/**
 * Formuła identyfikująca przedsiębiorcę wpisanego do CEIDG.
 * Brzmienie wprost z komentarza prawnika nr 5 do wzoru polityki prywatności.
 */
export const OZNACZENIE_PRZEDSIEBIORCY =
  `${FIRMA.imieNazwisko}, prowadzący działalność gospodarczą pod firmą: ` +
  `${FIRMA.nazwa}, wpisany do Centralnej Ewidencji i Informacji o Działalności ` +
  `Gospodarczej prowadzonej przez ministra właściwego ds. gospodarki, ` +
  `posiadający NIP: ${FIRMA.nip}, numer REGON: ${FIRMA.regon}`;

export const APLIKACJA = {
  nazwa: "Aplikando",
  /** Krótka forma do wyświetlania w tekście i w dokumentach. */
  domena: "aplikando.pl",
  /**
   * KANONICZNY adres aplikacji — z `www`, bo tak serwuje ją Vercel
   * (`aplikando.pl` przekierowuje tu 308-ką). To NIE jest kosmetyka: z tego
   * pola biorą się `metadataBase` (czyli każdy canonical i `og:image`), adresy
   * w `sitemap.xml` oraz wskazanie sitemapy w `robots.txt`. Gdyby stała tu
   * wersja bez `www`, każdy adres zgłaszany Google przekierowywałby, a tagi
   * canonical wskazywałyby na stronę, która nie serwuje treści bezpośrednio —
   * wyszukiwarka sama rozstrzygałaby wtedy, którą wersję uznać za właściwą.
   *
   * Zmiana domeny głównej w panelu Vercel = zmiana TEJ stałej w tym samym kroku.
   */
  adresWww: "https://www.aplikando.pl",
} as const;

/** Ścieżki podstron z dokumentami — używane też w linkach wewnątrz dokumentów. */
export const SCIEZKI = {
  regulamin: "/regulamin",
  politykaPrywatnosci: "/polityka-prywatnosci",
  regulaminNewslettera: "/regulamin-newslettera",
  cennik: "/#cennik",
} as const;

/**
 * Data wejścia w życie AKTUALNEJ wersji dokumentów.
 *
 * UWAGA: to nie jest data napisania, tylko data OPUBLIKOWANIA w aplikacji.
 * Jeżeli publikacja przesunie się w czasie — zmień tutaj przed wdrożeniem.
 * Przy każdej późniejszej zmianie treści: podnieś `WERSJA_DOKUMENTOW`, ustaw
 * nową datę i wyślij użytkownikom wiadomość ze wzoru
 * `dokumenty-prawne/wzory-wiadomosci-o-zmianie.md` (regulamin § 17 wymaga
 * poinformowania i daje 10 dni na wypowiedzenie).
 *
 * HISTORIA WERSJI (żeby dało się odtworzyć, co użytkownik zaakceptował — wersja
 * jest zapisywana przy każdej zgodzie w tabeli `zgoda`):
 *   1.0 — 4 sierpnia 2026 — pierwsza publikacja pakietu.
 *   1.1 — 7 sierpnia 2026 — zgoda marketingowa przy rejestracji: publikacja
 *         Regulaminu newslettera, nowy § 4 ust. 20 Regulaminu, nowy cel
 *         przetwarzania nr 12 w Polityce prywatności.
 *   1.2 — 10 sierpnia 2026 — Konto obowiązkowe do korzystania z Aplikacji
 *         (dotąd kreator CV działał bez Konta): zmieniony § 3 ust. 7 oraz
 *         § 4 ust. 5–6 Regulaminu.
 *   1.3 — 13 sierpnia 2026 — sprostowanie błędnego odesłania w § 4 ust. 9
 *         Regulaminu: było „ust. 9 pkt 3 powyżej" (odesłanie do samego siebie,
 *         a ust. 9 nie ma punktów), jest „ust. 8 pkt 3 powyżej" — czyli tam,
 *         gdzie realnie stoją oba oświadczenia składane przy zakupie.
 *         Zmiana wyłącznie redakcyjna: nie tworzy, nie znosi ani nie modyfikuje
 *         żadnego obowiązku, a praktyka aplikacji była od początku zgodna
 *         z prawidłowym odesłaniem (`paywall-dialog.tsx` wymaga obu zgód przy
 *         Odblokowaniu Jednorazowym, `/api/platnosc/checkout` waliduje je
 *         serwerowo). Data zmieniona we WSZYSTKICH trzech dokumentach, bo
 *         `DATA_OBOWIAZYWANIA` jest wspólne — treść Polityki prywatności
 *         i Regulaminu newslettera pozostała nietknięta.
 */
export const DATA_OBOWIAZYWANIA = "13 sierpnia 2026";
export const WERSJA_DOKUMENTOW = "1.3";
