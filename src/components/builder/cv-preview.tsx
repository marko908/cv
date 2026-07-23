"use client";

import { FileText } from "lucide-react";
import { useCvStore } from "@/lib/store";
import { CvDocument } from "./cv-document";

/** Podgląd CV na żywo — arkusz A4 "unoszący się" nad tłem, dane ze store'a. */
export function CvPreview() {
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);

  const isEmpty =
    !cv.personal_info.full_name &&
    !cv.professional_summary &&
    cv.experience.length === 0;

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <p className="eyebrow mb-3 text-center text-muted-foreground">
        Podgląd na żywo — szablon:{" "}
        <span className="text-primary">{template}</span>
      </p>

      <div className="min-h-[1050px] w-full overflow-hidden rounded-lg bg-white shadow-dialog">
        {isEmpty ? (
          <div className="flex h-[900px] flex-col items-center justify-center text-neutral-400">
            <FileText className="mb-4 size-10" />
            <p className="max-w-xs text-center text-sm">
              Wypełnij formularz po lewej stronie albo kliknij „Wczytaj
              przykład”, żeby zobaczyć podgląd CV.
            </p>
          </div>
        ) : (
          <CvDocument cv={cv} template={template} />
        )}
      </div>
    </div>
  );
}
