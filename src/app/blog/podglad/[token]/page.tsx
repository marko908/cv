import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Artykul } from "@/components/blog/artykul";
import { pobierzPoTokenie } from "@/lib/blog/zapytania";
import type { StatusWpisu } from "@/lib/blog/typy";

/**
 * Podgląd wpisu po tokenie — działa NIEZALEŻNIE od statusu, więc pozwala
 * zobaczyć szkic dokładnie tak, jak będzie wyglądał po publikacji, i wysłać
 * komuś link bez dawania dostępu do panelu.
 *
 * Segment nazywa się `[token]`, nie `[slug]`: to jest sekret, nie adres
 * artykułu, i ta nazwa ma o tym przypominać przy każdej edycji tego pliku.
 *
 * `dynamic = "force-dynamic"` jest tu ŚWIADOME, wbrew regule reszty bloga:
 * szkic zmienia się co chwilę w trakcie redakcji, a podgląd pokazujący wersję
 * sprzed godziny (ISR) byłby bezużyteczny. Ta trasa nie jest indeksowana, więc
 * nie ma tu nic do zyskania na cache'u.
 */
export const dynamic = "force-dynamic";

const ETYKIETY: Record<StatusWpisu, string> = {
  szkic: "Szkic",
  opublikowany: "Opublikowany",
  zarchiwizowany: "Zarchiwizowany",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const wpis = await pobierzPoTokenie(token);

  return {
    title: wpis ? `[Podgląd] ${wpis.tytul}` : "Podgląd artykułu",
    /*
     * `noindex, nofollow` to tutaj wymóg, nie ostrożność. Wpis w robots.txt
     * NIE wystarcza: robots.txt zabrania odwiedzania, ale nie usuwa z indeksu
     * adresu, do którego ktoś podlinkuje. Dopiero ten meta tag gwarantuje, że
     * nieskończona wersja artykułu nie trafi do wyników i nie zacznie
     * konkurować z docelowym adresem o tę samą frazę.
     */
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function StronaPodgladu({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const wpis = await pobierzPoTokenie(token);
  if (!wpis) notFound();

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-border bg-secondary/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
          <span className="eyebrow rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
            Podgląd
          </span>
          <span className="font-bold">{ETYKIETY[wpis.status]}</span>
          <span className="text-muted-foreground">
            Ten artykuł nie jest widoczny publicznie pod tym adresem.
          </span>
        </div>
      </div>

      <Artykul wpis={wpis} />
    </>
  );
}
