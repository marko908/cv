/**
 * Google Consent Mode v2 — sygnały zgody dla tagów w kontenerze GTM.
 *
 * Sam mechanizm to WYŁĄCZNIE wpisy do `window.dataLayer` — nie pobiera żadnego
 * skryptu i nie zakłada żadnego pliku, więc wolno go zainicjalizować przed
 * jakąkolwiek zgodą. O to zresztą chodzi: `default` ze wszystkimi sygnałami
 * `denied` musi stać w kolejce ZANIM załaduje się kontener GTM, inaczej pierwsze
 * milisekundy jego działania odbywają się bez ustawionej polityki zgód.
 *
 * Kolejność: `default (denied)` → `update` → dopiero potem kontener
 * (`components/cookies/skrypty-narzedzi.tsx`).
 *
 * ⚠️ CONSENT MODE NIE WYSTARCZA SAM Z SIEBIE. Jest to protokół Google — GA4 go
 * respektuje, ale **Meta Pixel i Microsoft Clarity nie**. Ustawienie
 * `ad_storage: denied` NIE powstrzyma tagu Meta Pixel; odpali się i założy
 * `_fbp`. Dlatego w panelu GTM każdy tag spoza ekosystemu Google musi mieć
 * ustawione „Dodatkowe sprawdzenia zgody" (Additional Consent Checks):
 * `ad_storage` dla Meta Pixel, `analytics_storage` dla Clarity. Wtedy GTM
 * w ogóle go nie uruchamia. To najczęściej pomijany krok w takiej konfiguracji
 * — pełna lista ustawień w `dokumenty-prawne/specyfikacja-baner-cookies.md`.
 */

import type { WyborKategorii } from "./zgody";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

type StanSygnalu = "granted" | "denied";

/**
 * Pełny zestaw sygnałów Consent Mode v2. Trzymamy je w jednym miejscu, żeby
 * `default` i `update` nigdy nie rozjechały się co do listy sygnałów — pominięty
 * w `update` sygnał zostaje na wartości domyślnej, co przy cichej literówce
 * wygląda jak działający kod.
 */
const SYGNALY = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
  "security_storage",
] as const;

type Sygnal = (typeof SYGNALY)[number];

/**
 * Kanoniczna postać `gtag` z dokumentacji Google — do `dataLayer` trafia obiekt
 * `arguments`, a NIE tablica z parametru rest.
 *
 * Wygląda to na różnicę bez znaczenia (oba są array-like), ale to jedno
 * z miejsc, w których Consent Mode potrafi po cichu nie zadziałać, a błąd jest
 * niewidoczny w kodzie i w typach. Trzymamy się dosłownie snippetu Google'a,
 * bo koszt jest zerowy, a diagnozowanie „dlaczego zgody nie docierają do tagów"
 * kosztuje godziny. Weryfikacja: Tag Assistant, zakładka Consent.
 */
function gtag(...argumenty: unknown[]): void;
function gtag() {
  // Patrz komentarz nad funkcją: `dataLayer.push(arguments)` to dosłowna
  // postać ze snippetu Google'a, celowo zamiast tablicy z parametru rest.
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ??= []).push(arguments);
}

function zbudujSygnaly(
  wartosc: (sygnal: Sygnal) => StanSygnalu,
): Record<Sygnal, StanSygnalu> {
  return Object.fromEntries(SYGNALY.map((s) => [s, wartosc(s)])) as Record<
    Sygnal,
    StanSygnalu
  >;
}

let domyslneUstawione = false;

/**
 * Domyślnie WSZYSTKIE sygnały `denied` — wymóg ze specyfikacji banera.
 * Wywoływane raz, przy starcie aplikacji, niezależnie od zapisanej zgody.
 */
export function ustawDomyslneZgodyGoogle() {
  if (typeof window === "undefined" || domyslneUstawione) return;
  domyslneUstawione = true;
  gtag("consent", "default", zbudujSygnaly(() => "denied"));
}

/** Podniesienie sygnałów po zgodzie. Wywoływane przy każdej zmianie wyboru. */
export function zaktualizujZgodyGoogle(kategorie: WyborKategorii) {
  if (typeof window === "undefined") return;
  ustawDomyslneZgodyGoogle();

  const analityka: StanSygnalu = kategorie.analityczne ? "granted" : "denied";
  const marketing: StanSygnalu = kategorie.marketingowe ? "granted" : "denied";

  gtag(
    "consent",
    "update",
    zbudujSygnaly((sygnal) => {
      switch (sygnal) {
        case "analytics_storage":
          return analityka;
        case "ad_storage":
        case "ad_user_data":
        case "ad_personalization":
          return marketing;
        // Funkcjonalne, personalizacyjne i bezpieczeństwa dotyczą działania
        // samej Aplikacji (sesja, płatność) — kategoria niezbędna, zawsze aktywna.
        default:
          return "granted";
      }
    }),
  );
}
