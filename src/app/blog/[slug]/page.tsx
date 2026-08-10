import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Artykul } from "@/components/blog/artykul";
import {
  pobierzPoSlugu,
  pobierzPowiazane,
  pobierzSlugiOpublikowanych,
} from "@/lib/blog/zapytania";
import {
  adresWpisu,
  schemaArtykulu,
  schemaFaq,
  schemaOkruszkow,
} from "@/lib/blog/schema";
import { APLIKACJA } from "@/lib/prawne/dane";

export const revalidate = 3600;

/**
 * Prerender wszystkich opublikowanych wpisów w czasie builda. Artykuł
 * serwowany z gotowego HTML-a to najszybszy możliwy wariant (a szybkość wchodzi
 * do Core Web Vitals). Nowe wpisy, których nie było przy buildzie, dogeneruje
 * ISR przy pierwszym wejściu.
 */
export async function generateStaticParams() {
  const wpisy = await pobierzSlugiOpublikowanych();
  return wpisy.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wpis = await pobierzPoSlugu(slug);
  if (!wpis) return { title: "Nie znaleziono artykułu" };

  const tytul = wpis.meta_tytul || wpis.tytul;
  const opis = wpis.meta_opis || wpis.zajawka || undefined;
  const url = wpis.canonical_url || adresWpisu(wpis.slug);

  return {
    title: `${tytul} | ${APLIKACJA.nazwa}`,
    description: opis,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: { "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "article",
      title: tytul,
      description: opis,
      url,
      siteName: APLIKACJA.nazwa,
      locale: "pl_PL",
      publishedTime: wpis.opublikowano_o ?? undefined,
      modifiedTime: wpis.updated_at,
      images: wpis.okladka_url
        ? [{ url: wpis.okladka_url, alt: wpis.okladka_alt ?? tytul }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: tytul,
      description: opis,
      images: wpis.okladka_url ? [wpis.okladka_url] : undefined,
    },
  };
}

export default async function StronaWpisu({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wpis = await pobierzPoSlugu(slug);
  if (!wpis) notFound();

  const powiazane = await pobierzPowiazane(wpis.slug, wpis.kategoria);
  const faq = schemaFaq(wpis);

  return (
    <>
      {/*
        JSON-LD. Osobne tagi zamiast jednego z tablicą — Google przyjmuje oba
        warianty, ale przy osobnych łatwiej namierzyć w Search Console, KTÓRY
        schemat ma błąd. Pusty FAQ nie renderuje tagu w ogóle.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArtykulu(wpis)) }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOkruszkow(wpis)) }}
      />

      <Artykul wpis={wpis} powiazane={powiazane} />
    </>
  );
}
