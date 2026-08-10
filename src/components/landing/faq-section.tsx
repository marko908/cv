import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CENA_JEDNORAZOWA, PLANY } from "@/lib/subscription";
import { SCIEZKI } from "@/lib/prawne/dane";

/**
 * Natywny `<details>/<summary>` zamiast biblioteki akordeonu — jedyne miejsce
 * w aplikacji, które go potrzebuje, więc nie ma po co dodawać zależności ani
 * kolejnego prymitywu w `components/ui/`. Klawiatura i czytniki ekranu
 * działają z tego od razu, bez własnego JS.
 */
const PYTANIA = [
  {
    q: "Czy AI zmyśla informacje w moim CV?",
    a: "Nie. AI dostaje wyłącznie fakty, które sam podałeś w CV, i może je tylko wybrać, uporządkować oraz przeformułować — nigdy dopisać. Każdy wygenerowany fragment przechodzi przez walidator w kodzie, który odrzuca zmyślone liczby, umiejętności, firmy czy stanowiska.",
  },
  {
    q: "Czy muszę zakładać konto?",
    a: "Tak — konto jest wymagane do korzystania z Aplikacji, ale założenie go zajmuje około 30 sekund i jest bezpłatne.",
  },
  {
    q: "Co jest darmowe, a za co płacę?",
    a: "Konto, kreator CV, wszystkie szablony i pobranie własnego CV w PDF są bezpłatne zawsze. Płatne jest wyłącznie dopasowanie CV do konkretnej oferty.",
  },
  {
    q: "Ile kosztuje dopasowanie CV do oferty?",
    a: `Jednorazowo ${CENA_JEDNORAZOWA} zł za jedno dopasowanie, albo subskrypcja od ${PLANY.start.ceny.miesiac} zł miesięcznie za ${PLANY.start.limit} dopasowań.`,
  },
  {
    q: "Czy moje CV przejdzie przez systemy rekrutacyjne (ATS)?",
    a: "Tak, wszystkie szablony — także te ze zdjęciem i panelem bocznym. Pilnujemy kolejności tekstu w pliku PDF, więc systemy ATS czytają go poprawnie niezależnie od wybranego układu.",
  },
  {
    q: "Co się dzieje z moimi danymi?",
    a: (
      <>
        Przetwarzamy je zgodnie z RODO — szczegóły w{" "}
        <Link
          href={SCIEZKI.politykaPrywatnosci}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Polityce prywatności
        </Link>
        . Dane zapisane na koncie widzisz i usuwasz samodzielnie w ustawieniach.
      </>
    ),
  },
] as const;

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Pytania</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        Odpowiedzi, krótko
      </h2>

      <div className="mt-10 flex flex-col gap-3">
        {PYTANIA.map(({ q, a }) => (
          <details
            key={q}
            className="card-surface group px-5 py-4 open:pb-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              {q}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
