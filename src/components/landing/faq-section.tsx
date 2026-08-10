import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FAQ_LANDING, type PytanieLandingu } from "@/lib/faq-landing";

/**
 * Natywny `<details>/<summary>` zamiast biblioteki akordeonu — jedyne miejsce
 * w aplikacji, które go potrzebuje, więc nie ma po co dodawać zależności ani
 * kolejnego prymitywu w `components/ui/`. Klawiatura i czytniki ekranu
 * działają z tego od razu, bez własnego JS.
 *
 * Treść pytań mieszka w `lib/faq-landing.ts`, bo tę samą listę renderuje
 * schemat `FAQPage` w JSON-LD na stronie głównej.
 */

/**
 * Podmienia frazę z odpowiedzi na odnośnik. Gdy frazy nie ma w tekście (ktoś
 * poprawił treść, nie ruszając pola `odnosnik`), zwracamy sam tekst — strona
 * traci link, ale się nie wywraca.
 */
function Odpowiedz({ pozycja }: { pozycja: PytanieLandingu }) {
  const { odpowiedz, odnosnik } = pozycja;
  if (!odnosnik) return <>{odpowiedz}</>;

  const i = odpowiedz.indexOf(odnosnik.fraza);
  if (i === -1) return <>{odpowiedz}</>;

  return (
    <>
      {odpowiedz.slice(0, i)}
      <Link
        href={odnosnik.href}
        className="underline underline-offset-2 hover:text-foreground"
      >
        {odnosnik.fraza}
      </Link>
      {odpowiedz.slice(i + odnosnik.fraza.length)}
    </>
  );
}

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Pytania</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        Odpowiedzi, krótko
      </h2>

      <div className="mt-10 flex flex-col gap-3">
        {FAQ_LANDING.map((pozycja) => (
          <details
            key={pozycja.pytanie}
            className="card-surface group px-5 py-4 open:pb-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              {pozycja.pytanie}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <Odpowiedz pozycja={pozycja} />
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
