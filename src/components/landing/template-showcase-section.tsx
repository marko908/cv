import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TemplateThumb } from "@/components/template-thumb";
import { demoCv } from "@/lib/demo-cv";
import { ATS_OBIETNICA, CV_TEMPLATES } from "@/lib/cv-templates";
import type { TemplateId } from "@/lib/store";

/** Sześć zróżnicowanych wizualnie szablonów — pełną galerię (9) widać po zalogowaniu. */
const POKAZANE: TemplateId[] = [
  "nowoczesny",
  "klasyczny",
  "prestizowy",
  "boczny",
  "grafitowy",
  "pastelowy",
];

export function TemplateShowcaseSection() {
  const szablony = CV_TEMPLATES.filter((t) => POKAZANE.includes(t.id));

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Szablony</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        9 szablonów, każdy czytelny dla ATS
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-center text-muted-foreground">
        {ATS_OBIETNICA}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {szablony.map((t) => (
          <div key={t.id}>
            <div className="overflow-hidden rounded-lg shadow-dialog">
              <TemplateThumb template={t.id} cv={demoCv} demo />
            </div>
            <p className="mt-2 truncate text-center text-xs font-bold">
              {t.name}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          Zobacz wszystkie 9 szablonów
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
