import type { MetadataRoute } from "next";
import { APLIKACJA, SCIEZKI } from "@/lib/prawne/dane";
import { pobierzSlugiOpublikowanych } from "@/lib/blog/zapytania";

/**
 * Mapa strony.
 *
 * `revalidate` jest tu KLUCZOWE i nieoczywiste: `sitemap.ts` to Route Handler
 * cache'owany domyślnie na stałe, więc bez tego nowy wpis bloga nie pojawiłby
 * się w sitemapie aż do kolejnego wdrożenia. Godzina to kompromis między
 * świeżością a liczbą odpytań bazy przez crawlery.
 *
 * Czego tu ŚWIADOMIE NIE MA: `/rejestracja`, `/logowanie`, `/app/*`. To strony
 * bez treści dla wyszukiwarki (formularz albo panel za logowaniem) — zgłaszanie
 * ich rozcieńcza tylko obraz witryny.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baza = APLIKACJA.adresWww;
  const teraz = new Date();

  const statyczne: MetadataRoute.Sitemap = [
    { url: baza, lastModified: teraz, changeFrequency: "weekly", priority: 1 },
    { url: `${baza}/blog`, lastModified: teraz, changeFrequency: "daily", priority: 0.9 },
    { url: `${baza}${SCIEZKI.regulamin}`, lastModified: teraz, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baza}${SCIEZKI.politykaPrywatnosci}`, lastModified: teraz, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baza}${SCIEZKI.regulaminNewslettera}`, lastModified: teraz, changeFrequency: "yearly", priority: 0.3 },
  ];

  const wpisy = await pobierzSlugiOpublikowanych();

  return [
    ...statyczne,
    ...wpisy.map((w) => ({
      url: `${baza}/blog/${w.slug}`,
      // Data REALNEJ modyfikacji z bazy, nie `new Date()` — inaczej każdy
      // artykuł zgłaszałby się jako zmieniony przy każdym przebudowaniu
      // sitemapy, a Google szybko przestaje ufać takim sygnałom.
      lastModified: new Date(w.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
