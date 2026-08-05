"use client";

/**
 * Ładowanie skryptów narzędzi analitycznych i marketingowych — DOPIERO PO ZGODZIE.
 *
 * NAJWAŻNIEJSZA ZASADA TEGO PLIKU (wymóg nr 4 ze specyfikacji banera): dopóki
 * zgody nie ma, skrypt nie może się w ogóle pobrać. Nie wystarczy załadować go
 * „na wszelki wypadek" i wstrzymać wysyłkę zdarzeń — sam skrypt zakłada już
 * pliki w urządzeniu, więc byłoby to naruszenie art. 398 Prawa komunikacji
 * elektronicznej. Dlatego każdy `<script>` powstaje tutaj, w efekcie, pod
 * warunkiem zgody właściwej kategorii.
 *
 * DLACZEGO RĘCZNIE, A NIE PRZEZ `next/script`: `next/script` trzyma własny
 * rejestr wczytanych skryptów i nie gwarantuje, że warunkowe odmontowanie
 * czegokolwiek cofnie. Tutaj potrzebujemy pełnej kontroli nad tym, KIEDY
 * element trafia do dokumentu, bo od tego zależy zgodność z prawem.
 *
 * Brak identyfikatora w env = narzędzie po prostu się nie ładuje, bez błędu.
 * Identyfikatory są publiczne z natury (widać je w kodzie strony u każdego,
 * kto takie narzędzie ma), dlatego `NEXT_PUBLIC_`.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { wyslijDoDataLayer, type FbqFunkcja } from "@/lib/cookies/tryb-zgody-google";
import type { WyborKategorii } from "@/lib/cookies/zgody";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/** Znacznik pozwalający rozpoznać nasze skrypty w DOM (także przy weryfikacji). */
const ATRYBUT = "data-narzedzie-cookies";

/**
 * Wstawia `<script src>` raz — kolejne wywołania z tym samym kluczem nic nie
 * robią. Skryptu NIE usuwamy przy odmontowaniu: usunięcie elementu nie wyładowuje
 * kodu, który już działa w karcie. Realne wycofanie zgody przechodzi przez
 * `kontekst-zgod.tsx`, które kasuje pliki i przeładowuje stronę.
 */
function wstawSkrypt(klucz: string, src: string, przedWstawieniem?: () => void) {
  if (document.querySelector(`script[${ATRYBUT}="${klucz}"]`)) return;

  przedWstawieniem?.();

  const skrypt = document.createElement("script");
  skrypt.setAttribute(ATRYBUT, klucz);
  skrypt.src = src;
  skrypt.async = true;
  document.head.appendChild(skrypt);
}

/* ---------------------------------------------------------------- analityka */

/**
 * Vercel Analytics i Speed Insights.
 *
 * Świadomie bez paczek `@vercel/analytics` / `@vercel/speed-insights`: obie
 * sprowadzają się do wstawienia dokładnie tych dwóch skryptów, a warunkowe
 * ładowanie i tak musi przechodzić przez ten plik. Jedna droga wstawiania
 * skryptu = jedno miejsce do audytu przy kontroli.
 *
 * Ścieżki są pierwszostronne (`/_vercel/...`) i istnieją wyłącznie na wdrożeniu
 * Vercela — poza nim zwracają 404, co nic nie psuje.
 */
function useVercelAnalytics(wlaczone: boolean) {
  useEffect(() => {
    if (!wlaczone) return;
    wstawSkrypt("vercel-analytics", "/_vercel/insights/script.js");
    wstawSkrypt("vercel-speed-insights", "/_vercel/speed-insights/script.js");
  }, [wlaczone]);
}

/**
 * Google Analytics 4.
 *
 * `gtag('js')` i `gtag('config')` lądują w `dataLayer` PRZED wstawieniem
 * gtag.js — tak działa oryginalny snippet Google'a i tak samo działa tryb zgody:
 * kolejka jest odtwarzana po wczytaniu skryptu, więc `consent default (denied)`
 * ustawione przy starcie aplikacji wyprzedza konfigurację strumienia.
 */
function useGoogleAnalytics(wlaczone: boolean) {
  useEffect(() => {
    if (!wlaczone || !GA_ID) return;

    wstawSkrypt(
      "google-analytics",
      `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
      () => {
        wyslijDoDataLayer("js", new Date());
        wyslijDoDataLayer("config", GA_ID);
      },
    );
  }, [wlaczone]);
}

/** Microsoft Clarity — stub kolejkujący + tag. */
function useClarity(wlaczone: boolean) {
  useEffect(() => {
    if (!wlaczone || !CLARITY_ID) return;

    wstawSkrypt("clarity", `https://www.clarity.ms/tag/${CLARITY_ID}`, () => {
      if (window.clarity) return;
      const kolejka: unknown[] = [];
      const stub = ((...argumenty: unknown[]) => {
        kolejka.push(argumenty);
      }) as NonNullable<Window["clarity"]>;
      stub.q = kolejka;
      window.clarity = stub;
    });
  }, [wlaczone]);
}

/* -------------------------------------------------------------- marketing */

/** Meta Pixel — stub `fbq` (kolejkuje do czasu wczytania fbevents.js) + init. */
function useMetaPixel(wlaczone: boolean) {
  useEffect(() => {
    if (!wlaczone || !META_PIXEL_ID) return;

    wstawSkrypt(
      "meta-pixel",
      "https://connect.facebook.net/en_US/fbevents.js",
      () => {
        if (!window.fbq) {
          const fbq = ((...argumenty: unknown[]) => {
            if (fbq.callMethod) fbq.callMethod(...argumenty);
            else fbq.queue?.push(argumenty);
          }) as FbqFunkcja;
          fbq.push = fbq;
          fbq.loaded = true;
          fbq.version = "2.0";
          fbq.queue = [];
          window.fbq = fbq;
          window._fbq ??= fbq;
        }

        // Meta ma własny mechanizm zgody, niezależny od Consent Mode Google'a.
        window.fbq?.("consent", "grant");
        window.fbq?.("init", META_PIXEL_ID);
        window.fbq?.("track", "PageView");
      },
    );
  }, [wlaczone]);
}

/**
 * Odsłony przy nawigacji wewnątrz aplikacji — TYLKO dla Meta Pixel.
 *
 * GA4 liczy je sam (pomiar zaawansowany reaguje na zmiany History API), Clarity
 * też — dorzucenie im ręcznego zdarzenia dałoby podwójne odsłony. Meta Pixel
 * jako jedyny wysyła `PageView` wyłącznie przy pełnym załadowaniu dokumentu,
 * więc w aplikacji z routingiem po stronie klienta widziałby jedno wejście
 * na całą sesję.
 */
function useOdslonyPrzyNawigacji(wlaczone: boolean) {
  const sciezka = usePathname();
  const pierwszaSciezka = useRef(sciezka);

  useEffect(() => {
    if (!wlaczone || !META_PIXEL_ID) return;
    // Wejście na stronę zgłasza już `init` — bez tego pierwsza odsłona byłaby podwójna.
    if (sciezka === pierwszaSciezka.current) return;
    window.fbq?.("track", "PageView");
  }, [wlaczone, sciezka]);
}

export function SkryptyNarzedzi({ kategorie }: { kategorie: WyborKategorii }) {
  useVercelAnalytics(kategorie.analityczne);
  useGoogleAnalytics(kategorie.analityczne);
  useClarity(kategorie.analityczne);
  useMetaPixel(kategorie.marketingowe);
  useOdslonyPrzyNawigacji(kategorie.marketingowe);

  return null;
}
