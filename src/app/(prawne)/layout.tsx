/**
 * Oprawa podstron z dokumentami prawnymi (/regulamin, /polityka-prywatnosci,
 * /regulamin-newslettera).
 *
 * Grupa tras `(prawne)` nie wchodzi do adresu URL — dokumenty są dostępne pod
 * krótkimi, „linkowalnymi" ścieżkami, bo odsyłają do nich checkboxy zgód,
 * maile potwierdzające i stopka.
 */

import { SiteHeader } from "@/components/site-header";
import { Stopka } from "@/components/stopka";

export default function LayoutPrawne({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16">
        {children}
      </main>
      <Stopka />
    </div>
  );
}
