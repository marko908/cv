"use client";

import { Check, Lock } from "lucide-react";
import { useCvStore } from "@/lib/store";
import { TemplateThumb } from "@/components/template-thumb";
import { sampleCv } from "@/lib/sample-cv";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

export function TemplatePicker() {
  const { cv, template, setTemplate } = useCvStore();

  const hasData =
    cv.personal_info.full_name.trim().length > 0 || cv.experience.length > 0;
  const thumbCv = hasData ? cv : sampleCv;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="eyebrow text-muted-foreground">Szablon graficzny</h3>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Układ szablonu jest zablokowany — edytujesz treść, a my pilnujemy,
          żeby CV zawsze przeszło przez systemy ATS.
        </p>
      </div>

      {CV_TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTemplate(t.id)}
          className={cn(
            "relative rounded-lg bg-secondary p-4 text-left transition-all",
            template === t.id
              ? "shadow-elevated ring-2 ring-primary"
              : "hover:bg-accent"
          )}
        >
          {t.recommended && (
            <span className="eyebrow absolute left-6 top-6 z-10 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
              Polecany
            </span>
          )}
          {template === t.id && (
            <span className="absolute right-6 top-6 z-10 flex size-5 items-center justify-center rounded-full bg-primary">
              <Check className="size-3 text-primary-foreground" />
            </span>
          )}

          <TemplateThumb
            template={t.id}
            cv={thumbCv}
            width={240}
            className="mx-auto"
          />

          <span className="mt-3 block text-sm font-bold">{t.name}</span>
          <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
        </button>
      ))}
    </div>
  );
}
