import { ChevronDown } from "lucide-react";
import type { PozycjaFaq } from "@/lib/blog/typy";

/**
 * FAQ pod artykułem. Natywny `<details>` - ten sam wybór i z tego samego
 * powodu co w `landing/faq-section.tsx`: klawiatura i czytniki ekranu działają
 * bez naszego JS, a treść jest w DOM od razu (czyli widoczna dla Google, co
 * przy schemacie FAQPage jest całym sensem tej sekcji).
 */
export function FaqWpisu({ faq }: { faq: PozycjaFaq[] }) {
  if (!faq || faq.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-extrabold tracking-tight">
        Często zadawane pytania
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        {faq.map((p) => (
          <details
            key={p.pytanie}
            className="card-surface group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              {p.pytanie}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {p.odpowiedz}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
