"use client";

import { useEffect, useRef, useState } from "react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { CvDocument } from "@/components/builder/cv-document";
import { STOCK_PHOTO, templateUsesPhoto } from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi
const SHEET_HEIGHT = 1123; // wysokość A4 przy 96 dpi

/**
 * Prawdziwa miniatura CV (wzorzec z ResuMax) — przeskalowany CvDocument.
 *
 * Tryb domyślny przycina zawartość do proporcji jednej strony (miniatury na
 * listach). Tryb `full` pokazuje CAŁY dokument — rośnie na tyle stron, ile
 * trzeba, i rysuje linie podziału stron. Bez tego dłuższe CV wyglądało na ucięte
 * w porównaniu „przed / po", mimo że eksport PDF paginuje je poprawnie.
 */
export function TemplateThumb({
  template,
  cv,
  width = 210,
  full = false,
  demo = false,
  className,
}: {
  template: TemplateId;
  cv: TailoredCv;
  width?: number;
  /** Pokaż cały dokument (wiele stron) zamiast przyciętej miniatury. */
  full?: boolean;
  /**
   * Miniatura w galerii szablonów: gdy układ ma miejsce na zdjęcie, a
   * użytkownik żadnego nie wgrał, podstawiamy zdjęcie poglądowe. Dzięki temu
   * widać, że szablon przewiduje zdjęcie. Do CV ani do PDF to nie trafia.
   */
  demo?: boolean;
  className?: string;
}) {
  const cvDoPodgladu: TailoredCv =
    demo && templateUsesPhoto(template) && !cv.personal_info.photo
      ? {
          ...cv,
          personal_info: { ...cv.personal_info, photo: STOCK_PHOTO },
        }
      : cv;
  // Zabezpieczenie: dopóki wywołujący nie zna jeszcze swojej szerokości (pomiar
  // w useLayoutEffect), width bywa 0/NaN — wtedy nie renderujemy nic zamiast
  // wstawiać NaN do stylu (React zgłaszał to jako błąd w konsoli).
  const poprawnaSzerokosc = Number.isFinite(width) && width > 0;
  const scale = poprawnaSzerokosc ? width / SHEET_WIDTH : 0;
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(SHEET_HEIGHT);

  // W trybie pełnym mierzymy realną wysokość dokumentu, żeby kontener urósł
  // dokładnie tyle, ile trzeba (ResizeObserver — treść zmienia się na żywo).
  useEffect(() => {
    if (!full) return;
    const el = contentRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.scrollHeight || SHEET_HEIGHT);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [full, cv, template]);

  if (!poprawnaSzerokosc) return null;

  // Ile stron A4 zajmie dokument (min. 1) — do rysowania linii podziału.
  const strony = full ? Math.max(1, Math.ceil(contentHeight / SHEET_HEIGHT)) : 1;
  // Dopełniamy do pełnych stron, żeby ostatnia kartka nie była obcięta w połowie.
  const wysokoscArkuszy = full ? strony * SHEET_HEIGHT : SHEET_HEIGHT;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative select-none overflow-hidden rounded-md bg-white",
        className
      )}
      style={{
        width,
        height: Math.round(
          full ? wysokoscArkuszy * scale : width * (SHEET_HEIGHT / SHEET_WIDTH)
        ),
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: SHEET_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CvDocument cv={cvDoPodgladu} template={template} />
      </div>

      {/* Linie podziału stron — użytkownik widzi, gdzie kończy się kartka. */}
      {full &&
        Array.from({ length: strony - 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-black/25"
            style={{ top: Math.round((i + 1) * SHEET_HEIGHT * scale) }}
          />
        ))}
    </div>
  );
}
