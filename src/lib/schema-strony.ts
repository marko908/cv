/**
 * JSON-LD (schema.org) dla stron produktowych — odpowiednik `lib/blog/schema.ts`,
 * tylko dla landingu, a nie dla artykułów.
 *
 * PO CO TO JEST: wyszukiwarki i asystenci AI (ChatGPT, Perplexity, Gemini,
 * AI Overviews) nie zgadują ze struktury HTML, kto jest wydawcą, co sprzedaje
 * i ile to kosztuje — czytają dane strukturalne. Bez nich model odpowiadający
 * na „ile kosztuje Aplikando" musi wyciągać liczbę z tekstu marketingowego,
 * co kończy się albo pominięciem nas, albo zacytowaniem błędnej ceny.
 *
 * CENY I FAKTY POCHODZĄ Z KODU, nigdy z ręcznie wpisanych stałych
 * (`subscription.ts`, `dane.ts`, `faq-landing.ts`). To ta sama zasada, co
 * w cenniku: dane strukturalne obiecujące inną cenę niż kasa byłyby wobec
 * konsumenta wprowadzeniem w błąd, a wobec Google powodem do odebrania
 * wyników rozszerzonych.
 *
 * CZEGO TU ŚWIADOMIE NIE MA: `aggregateRating` i `review`. Aplikacja ma dziś
 * zero użytkowników (patrz `dokumenty-prawne/WDROZENIE.md`), więc oceny
 * musiałyby być zmyślone — to jednocześnie naruszenie wytycznych Google
 * i praktyka wprowadzająca w błąd (dyrektywa Omnibus). Dodać, gdy będą
 * prawdziwe opinie.
 */

import { APLIKACJA, FIRMA, SCIEZKI } from "@/lib/prawne/dane";
import {
  CENA_JEDNORAZOWA,
  LISTA_PLANOW,
  type Plan,
  type OkresRozliczeniowy,
} from "@/lib/subscription";
import { FAQ_LANDING } from "@/lib/faq-landing";

const LOGO = `${APLIKACJA.adresWww}/aplikando-icon.png`;

/**
 * Stałe identyfikatory encji. Dzięki nim schematy na jednej stronie
 * ODWOŁUJĄ SIĘ do siebie (`{ "@id": ... }`) zamiast powtarzać opis wydawcy
 * w każdym bloku — a wyszukiwarka widzi JEDNĄ organizację, nie trzy podobne.
 */
export const ID_ORGANIZACJI = `${APLIKACJA.adresWww}/#organizacja`;
export const ID_STRONY = `${APLIKACJA.adresWww}/#strona`;

/**
 * Organizacja = wydawca i sprzedawca. Dane rejestrowe (NIP, adres) to nie
 * ozdobnik: dla wyszukiwarki są sygnałem, że za stroną stoi realny podmiot,
 * a dla nas muszą zgadzać się co do znaku z regulaminem i stopką — dlatego
 * lecą z `dane.ts`, a nie z osobnego wpisu.
 */
export function schemaOrganizacji() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ID_ORGANIZACJI,
    name: APLIKACJA.nazwa,
    legalName: FIRMA.nazwa,
    url: APLIKACJA.adresWww,
    logo: { "@type": "ImageObject", url: LOGO },
    email: FIRMA.email,
    taxID: FIRMA.nip,
    vatID: `PL${FIRMA.nip}`,
    founder: { "@type": "Person", name: FIRMA.imieNazwisko },
    address: {
      "@type": "PostalAddress",
      streetAddress: FIRMA.ulica,
      postalCode: FIRMA.kodPocztowy,
      addressLocality: FIRMA.miasto,
      addressCountry: "PL",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: FIRMA.email,
      availableLanguage: ["pl"],
    },
  };
}

/** Witryna jako całość — spina adres, język i wydawcę. */
export function schemaWitryny() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ID_STRONY,
    name: APLIKACJA.nazwa,
    url: APLIKACJA.adresWww,
    inLanguage: "pl-PL",
    publisher: { "@id": ID_ORGANIZACJI },
  };
}

/** Jedna oferta cennika. `priceSpecification` niesie okres rozliczeniowy. */
function ofertaPlanu(plan: Plan, okres: OkresRozliczeniowy) {
  return {
    "@type": "Offer",
    name: `${plan.nazwa} — ${okres === "rok" ? "rocznie" : "miesięcznie"}`,
    description: `${plan.limit} dopasowań CV do oferty miesięcznie.`,
    price: plan.ceny[okres],
    priceCurrency: "PLN",
    url: `${APLIKACJA.adresWww}${SCIEZKI.cennik}`,
    availability: "https://schema.org/InStock",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: plan.ceny[okres],
      priceCurrency: "PLN",
      // Ceny w aplikacji są BRUTTO — konsument widzi kwotę, którą zapłaci.
      valueAddedTaxIncluded: true,
      // Okres rozliczeniowy w kodach UN/CEFACT: MON = miesiąc, ANN = rok.
      // Bez tego cena roczna (290 zł) wygląda jak zwykła, wyższa cena.
      billingDuration: 1,
      unitCode: okres === "rok" ? "ANN" : "MON",
    },
  };
}

/**
 * Sam produkt. `SoftwareApplication` (a nie `Product`) — to aplikacja webowa,
 * a ten typ pozwala opisać kategorię i system, na którym działa.
 *
 * Oferta darmowa jest osobną pozycją z ceną 0, nie przypisem w opisie:
 * „jedno dopasowanie miesięcznie za darmo" to najmocniejszy argument wejścia,
 * a model odpowiadający na pytanie o darmowe narzędzia do CV szuka właśnie
 * takiego wpisu.
 */
export function schemaAplikacji() {
  const oferty = [
    {
      "@type": "Offer",
      name: "Plan darmowy",
      description:
        "Konto, kreator CV, wszystkie szablony, pobranie CV w PDF oraz jedno w pełni odblokowane dopasowanie miesięcznie.",
      price: 0,
      priceCurrency: "PLN",
      url: APLIKACJA.adresWww,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Odblokowanie jednorazowe",
      description: "Pełny raport z jednego dopasowania CV do oferty pracy.",
      price: CENA_JEDNORAZOWA,
      priceCurrency: "PLN",
      url: `${APLIKACJA.adresWww}${SCIEZKI.cennik}`,
      availability: "https://schema.org/InStock",
    },
    ...LISTA_PLANOW.flatMap((plan) => [
      ofertaPlanu(plan, "miesiac"),
      ofertaPlanu(plan, "rok"),
    ]),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APLIKACJA.nazwa,
    url: APLIKACJA.adresWww,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Kreator i optymalizator CV",
    operatingSystem: "Web",
    inLanguage: "pl-PL",
    description:
      "Aplikando dopasowuje CV do konkretnej oferty pracy na polskim rynku: " +
      "wskazuje, których wymagań ogłoszenia CV nie pokrywa, przepisuje treść " +
      "wyłącznie z faktów podanych przez kandydata i pilnuje zgodności " +
      "z systemami rekrutacyjnymi (ATS) oraz klauzuli RODO.",
    // Obszar, na który produkt jest przygotowany. Cała warstwa językowa,
    // prawna i rynkowa jest polska — to nie jest globalny kreator CV.
    areaServed: { "@type": "Country", name: "Polska" },
    publisher: { "@id": ID_ORGANIZACJI },
    offers: oferty,
  };
}

/**
 * FAQ z landingu jako dane strukturalne. Ta sama lista, którą widzi
 * użytkownik (`lib/faq-landing.ts`) — Google wymaga, żeby treść schematu
 * była widoczna na stronie, więc drugie, „lepsze pod SEO" pytania byłyby
 * naruszeniem, nie optymalizacją.
 */
export function schemaFaqLandingu() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_LANDING.map((p) => ({
      "@type": "Question",
      name: p.pytanie,
      acceptedAnswer: { "@type": "Answer", text: p.odpowiedz },
    })),
  };
}
