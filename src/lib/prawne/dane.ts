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

/** Pełne dane rejestrowe. JDG wpisana do CEIDG — nie ma KRS ani kapitału zakładowego. */
export const FIRMA = {
  imieNazwisko: "Marko Nowak",
  nazwa: "Markonn Marko Nowak",
  ulica: "ul. Mariana Maliny 5a/17",
  kodMiasto: "41-200 Sosnowiec",
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
  `${FIRMA.nazwa} (adres stałego miejsca wykonywania działalności gospodarczej: ` +
  `${ADRES}), wpisany do Centralnej Ewidencji i Informacji o Działalności ` +
  `Gospodarczej prowadzonej przez ministra właściwego ds. gospodarki, ` +
  `posiadający NIP: ${FIRMA.nip}, numer REGON: ${FIRMA.regon}`;

export const APLIKACJA = {
  nazwa: "Aplikando",
  domena: "aplikando.pl",
  adresWww: "https://aplikando.pl",
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
 */
export const DATA_OBOWIAZYWANIA = "4 sierpnia 2026";
export const WERSJA_DOKUMENTOW = "1.0";
