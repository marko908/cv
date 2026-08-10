/**
 * Oprawa bloga — ten sam nagłówek i stopka co landing i dokumenty prawne.
 *
 * Szerokość ustawiają POSZCZEGÓLNE strony, nie ten layout (inaczej niż
 * w `(prawne)`): lista wpisów jest szeroka (siatka do 3 kolumn), a artykuł
 * wąski, bo tekst czyta się źle powyżej ~75 znaków w wierszu.
 */

import { SiteHeader } from "@/components/site-header";
import { Stopka } from "@/components/stopka";

export default function LayoutBloga({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Stopka />
    </div>
  );
}
