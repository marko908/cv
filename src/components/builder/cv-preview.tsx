"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { useCvStore } from "@/lib/store";
import { PdfPreview } from "@/components/pdf-preview";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi

/**
 * Podgląd CV na żywo — arkusz(e) A4 „unoszące się" nad tłem, dane ze store'a.
 *
 * Renderowanie deleguje do `PdfPreview`, czyli do PRAWDZIWEGO pliku PDF
 * generowanego w przeglądarce tym samym kodem co „Pobierz PDF”. To, co widać
 * w podglądzie, jest dokładnie tym, co znajdzie się w pobranym pliku — łącznie
 * z liczbą stron i miejscami podziału. Powód, dla którego nie ma tu drugiej
 * implementacji szablonów w HTML, opisuje `pdf-preview.tsx`.
 *
 * Szerokość mierzymy z kontenera i ograniczamy do 794px (nie podbijamy powyżej
 * naturalnego rozmiaru A4) — na telefonie kartka się zmniejsza, na szerokim
 * ekranie ma naturalny rozmiar strony.
 */
export function CvPreview() {
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [szerokosc, setSzerokosc] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSzerokosc(Math.min(SHEET_WIDTH, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isEmpty =
    !cv.personal_info.full_name &&
    !cv.professional_summary &&
    cv.experience.length === 0;

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[794px]">
      <p className="eyebrow mb-3 text-center text-muted-foreground">
        Podgląd na żywo - szablon:{" "}
        <span className="text-primary">{template}</span>
      </p>

      {isEmpty ? (
        <div className="flex h-[420px] flex-col items-center justify-center rounded-lg bg-white text-neutral-400 shadow-dialog sm:h-[600px]">
          <FileText className="mb-4 size-10" />
          <p className="max-w-xs text-center text-sm">
            Wypełnij formularz po lewej stronie albo kliknij „Wczytaj przykład”,
            żeby zobaczyć podgląd CV.
          </p>
        </div>
      ) : (
        szerokosc > 0 && (
          <PdfPreview
            cv={cv}
            template={template}
            width={szerokosc}
            className="mx-auto"
          />
        )
      )}
    </div>
  );
}
