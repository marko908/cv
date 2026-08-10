import type { MetadataRoute } from "next";
import { APLIKACJA } from "@/lib/prawne/dane";

/**
 * robots.txt — generowany, nie statyczny, żeby adres sitemapy szedł z
 * `dane.ts` (jedno źródło domeny) i nie rozjechał się przy zmianie domeny.
 *
 * Wskazanie sitemapy jest tu najważniejsze: bez niego Google musi odkrywać
 * wpisy bloga wyłącznie przez linkowanie, co przy nowej domenie bez profilu
 * linków oznacza tygodnie zwłoki w indeksacji.
 *
 * Blokujemy to, co nie ma prawa trafić do wyników: panel aplikacji i panel
 * redakcyjny (treść za logowaniem, zero wartości w indeksie), trasy API oraz
 * podglądy szkiców. `/blog/podglad/` ma dodatkowo `noindex` w metadanych
 * strony — robots.txt sam w sobie NIE usuwa strony z indeksu, jeśli ktoś do
 * niej podlinkuje, więc te dwa mechanizmy muszą działać razem.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/admin/", "/api/", "/blog/podglad/", "/auth/"],
    },
    sitemap: `${APLIKACJA.adresWww}/sitemap.xml`,
  };
}
