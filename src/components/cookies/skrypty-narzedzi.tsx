"use client";

/**
 * Ładowanie narzędzi zewnętrznych — DOPIERO PO ZGODZIE.
 *
 * NAJWAŻNIEJSZA ZASADA TEGO PLIKU (wymóg nr 4 ze specyfikacji banera): dopóki
 * zgody nie ma, do zewnętrznego dostawcy nie leci ŻADNE żądanie. Nie wystarczy
 * załadować skrypt „na wszelki wypadek" i wstrzymać wysyłkę zdarzeń — sam skrypt
 * zakłada pliki w urządzeniu, więc byłoby to naruszenie art. 398 Prawa
 * komunikacji elektronicznej.
 *
 * DWIE DROGI, BO NARZĘDZIA SĄ DWOJAKIE (decyzja Marka 2026-08-04: tagi w GTM):
 *
 *   1. **Kontener Google Tag Manager** — GA4, Microsoft Clarity i Meta Pixel są
 *      tagami w GTM, nie skryptami w tym repo. Ładujemy jeden kontener, a które
 *      tagi w nim wystrzelą, rozstrzyga Consent Mode v2
 *      (`lib/cookies/tryb-zgody-google.ts`) plus „Dodatkowe sprawdzenia zgody"
 *      ustawione na każdym tagu w panelu GTM.
 *   2. **Vercel Analytics / Speed Insights** — zostają tutaj, bo to nie są tagi:
 *      skrypty serwowane są pierwszostronnie z `/_vercel/...`, więc ich wczytanie
 *      nie przekazuje niczego Google'owi. Wpychanie ich do GTM oznaczałoby, że
 *      pierwszostronne żądanie zamieniamy na trzeciostronne — dokładnie odwrotnie
 *      niż chcemy.
 *
 * KIEDY ŁADUJEMY KONTENER GTM: dopiero gdy użytkownik zgodzi się na CO NAJMNIEJ
 * JEDNĄ kategorię opcjonalną. Kto odrzuci wszystko, nie wyśle do Google ani
 * jednego żądania — także po sam plik `gtm.js`.
 *
 * Wariant alternatywny (kontener zawsze, tagi wstrzymane przez Consent Mode)
 * jest standardem rynkowym i daje modelowanie konwersji w GA4 dla osób, które
 * odmówiły. Kosztuje jednak jedno żądanie do Google przy każdej wizycie, także
 * odmawiającej — czyli przekazanie adresu IP bez zgody. Przy aplikacji, do
 * której ludzie wklejają swoje CV, wybraliśmy wariant ostrożniejszy. Zmiana
 * sprowadza się do przekazania `true` zamiast `jakakolwiekZgoda` niżej.
 *
 * Brak identyfikatora w env = narzędzie po prostu się nie ładuje, bez błędu.
 * Identyfikatory są publiczne z natury (widać je w kodzie strony u każdego, kto
 * takie narzędzie ma), dlatego `NEXT_PUBLIC_`.
 */

import { useEffect } from "react";

import { KATEGORIE_OPCJONALNE, type WyborKategorii } from "@/lib/cookies/zgody";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

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
 * Kontener Google Tag Manager.
 *
 * Zdarzenie `gtm.js` musi trafić do `dataLayer` PRZED wstawieniem skryptu — tak
 * działa oryginalny snippet Google'a. Sygnały `consent default (denied)` stoją
 * w kolejce jeszcze wcześniej (ustawia je `DostawcaZgodCookies` przy starcie),
 * więc kontener startuje z gotową polityką zgód, a nie dostaje jej po fakcie.
 *
 * Odsłon przy nawigacji NIE zgłaszamy stąd. W aplikacji z routingiem po stronie
 * klienta robi to wbudowany wyzwalacz GTM „Zmiana historii" (History Change),
 * który reaguje na `pushState` App Routera. Ręczne dorzucanie zdarzenia dawałoby
 * podwójne odsłony.
 */
function useKontenerGtm(zaladuj: boolean) {
  useEffect(() => {
    if (!zaladuj || !GTM_ID) return;

    wstawSkrypt(
      "google-tag-manager",
      `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`,
      () => {
        (window.dataLayer ??= []).push({
          "gtm.start": Date.now(),
          event: "gtm.js",
        });
      },
    );
  }, [zaladuj]);
}

export function SkryptyNarzedzi({ kategorie }: { kategorie: WyborKategorii }) {
  // Kontener obsługuje tagi z OBU kategorii opcjonalnych, więc wystarczy zgoda
  // na którąkolwiek. Co konkretnie wystrzeli, rozstrzyga Consent Mode.
  const jakakolwiekZgoda = KATEGORIE_OPCJONALNE.some((k) => kategorie[k]);

  useVercelAnalytics(kategorie.analityczne);
  useKontenerGtm(jakakolwiekZgoda);

  return null;
}
