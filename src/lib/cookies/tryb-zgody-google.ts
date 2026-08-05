/**
 * Google Consent Mode v2 — sygnały zgody dla narzędzi Google i Meta.
 *
 * Sam mechanizm to WYŁĄCZNIE wpisy do `window.dataLayer` — nie pobiera żadnego
 * skryptu i nie zakłada żadnego pliku, więc wolno go zainicjalizować przed
 * jakąkolwiek zgodą. O to zresztą chodzi: `default` ze wszystkimi sygnałami
 * `denied` musi stać w kolejce ZANIM załaduje się gtag.js, inaczej pierwsze
 * milisekundy działania GA odbywają się bez ustawionej polityki zgód.
 *
 * Kolejność przy zgodzie: `default (denied)` → `update (granted)` → dopiero
 * potem skrypt narzędzia (`components/cookies/skrypty-narzedzi.tsx`).
 */

import type { WyborKategorii } from "./zgody";

declare global {
  interface Window {
    dataLayer?: unknown[];
    /** Meta Pixel — stub kolejkujący zdarzenia do czasu wczytania fbevents.js. */
    fbq?: FbqFunkcja;
    _fbq?: FbqFunkcja;
    /** Microsoft Clarity — stub kolejkujący wywołania. */
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

export type FbqFunkcja = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

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

function gtag(...argumenty: unknown[]) {
  (window.dataLayer ??= []).push(argumenty);
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

/** Wpis do `dataLayer` — używane przez konfigurację GA4. */
export function wyslijDoDataLayer(...argumenty: unknown[]) {
  if (typeof window === "undefined") return;
  gtag(...argumenty);
}
