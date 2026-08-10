/**
 * JSON-LD (schema.org) dla wpisu bloga — to, co Google i modele językowe czytają
 * zamiast zgadywać ze struktury HTML.
 *
 * Trzy schematy, każdy w osobnym `<script type="application/ld+json">`:
 *  - Article      — autor, daty, okładka; podstawa do wyników z miniaturą,
 *  - FAQPage      — realna szansa na „rozwijane" pytania w wynikach (i chętnie
 *                   cytowane przez asystentów AI),
 *  - BreadcrumbList — ścieżka nawigacji pod tytułem w wynikach.
 *
 * `dateModified` jest tu ŚWIADOMIE, nie dla kompletu: świeżość to jeden
 * z sygnałów rankingowych, a aktualizacja starego wpisu bez tego pola wygląda
 * dla Google jak brak zmian. `updated_at` pilnuje trigger w bazie, więc pole
 * jest zawsze prawdziwe.
 */

import { APLIKACJA, FIRMA } from "@/lib/prawne/dane";
import type { WpisBloga } from "./typy";

const LOGO = `${APLIKACJA.adresWww}/aplikando-icon.png`;

/** Wydawca — ta sama encja we wszystkich schematach na stronie. */
const WYDAWCA = {
  "@type": "Organization",
  name: APLIKACJA.nazwa,
  url: APLIKACJA.adresWww,
  logo: { "@type": "ImageObject", url: LOGO },
} as const;

export function adresWpisu(slug: string): string {
  return `${APLIKACJA.adresWww}/blog/${slug}`;
}

export function schemaArtykulu(wpis: WpisBloga) {
  const url = wpis.canonical_url || adresWpisu(wpis.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: wpis.meta_tytul || wpis.tytul,
    description: wpis.meta_opis || wpis.zajawka || undefined,
    image: wpis.okladka_url ? [wpis.okladka_url] : undefined,
    datePublished: wpis.opublikowano_o ?? wpis.utworzono,
    dateModified: wpis.updated_at,
    // Autorem jest firma, nie osoba fizyczna — treść powstaje redakcyjnie,
    // a wskazanie autora musi zgadzać się z oznaczeniem przedsiębiorcy
    // z `dane.ts` (ta sama zasada, co w dokumentach prawnych).
    author: { "@type": "Organization", name: FIRMA.nazwa, url: APLIKACJA.adresWww },
    publisher: WYDAWCA,
    inLanguage: "pl-PL",
    articleSection: wpis.kategoria,
    keywords: wpis.tagi.length > 0 ? wpis.tagi.join(", ") : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

/** `null` przy pustym FAQ — wtedy NIE renderujemy tagu (pusty schemat to błąd). */
export function schemaFaq(wpis: WpisBloga) {
  if (!wpis.faq || wpis.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: wpis.faq.map((p) => ({
      "@type": "Question",
      name: p.pytanie,
      acceptedAnswer: { "@type": "Answer", text: p.odpowiedz },
    })),
  };
}

export function schemaOkruszkow(wpis: WpisBloga) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: APLIKACJA.adresWww },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${APLIKACJA.adresWww}/blog` },
      { "@type": "ListItem", position: 3, name: wpis.tytul, item: adresWpisu(wpis.slug) },
    ],
  };
}
