import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { CvDocument } from "@/components/builder/cv-document";
import { cn } from "@/lib/utils";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi

/** Prawdziwa miniatura CV (wzorzec z ResuMax) — przeskalowany CvDocument. */
export function TemplateThumb({
  template,
  cv,
  width = 210,
  className,
}: {
  template: TemplateId;
  cv: TailoredCv;
  width?: number;
  className?: string;
}) {
  const scale = width / SHEET_WIDTH;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none overflow-hidden rounded-md bg-white",
        className
      )}
      style={{ width, height: Math.round(width * 1.35) }}
    >
      <div
        style={{
          width: SHEET_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CvDocument cv={cv} template={template} />
      </div>
    </div>
  );
}
