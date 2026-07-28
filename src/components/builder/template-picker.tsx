"use client";

import { Lock } from "lucide-react";
import { useCvStore } from "@/lib/store";
import { TemplateGallery } from "@/components/template-gallery";

export function TemplatePicker() {
  const { template, setTemplate } = useCvStore();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="eyebrow text-muted-foreground">Szablon graficzny</h3>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Układ szablonu jest zablokowany — edytujesz treść, a my pilnujemy,
          żeby CV dobrze się czytało i człowiekowi, i systemom rekrutacyjnym.
        </p>
      </div>

      <TemplateGallery selected={template} onSelect={setTemplate} />
    </div>
  );
}
