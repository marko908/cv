"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { CvDocument } from "@/components/builder/cv-document";
import { PaginatedCvSheet } from "@/components/paginated-cv-sheet";
import { STOCK_PHOTO, templateUsesPhoto } from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi
const SHEET_HEIGHT = 1123; // wysokość A4 przy 96 dpi
/** Proporcja pełnej kartki A4 (wysokość / szerokość). */
export const A4_RATIO = SHEET_HEIGHT / SHEET_WIDTH;

/**
 * Prawdziwa miniatura CV (wzorzec z ResuMax) — przeskalowany CvDocument.
 *
 * ZASADA: miniatura NIGDY nie ucina dokumentu w szerokości. Zawsze widać pełną
 * szerokość szablonu — zmienia się tylko skala. Ucinać wolno wyłącznie w pionie
 * (`crop`), bo czytelność CV bierze się z szerokości: obcięty bok wygląda jak
 * zepsuty layout, obcięty dół czyta się naturalnie jak „dalszy ciąg strony".
 *
 * Szerokość: gdy `width` nie zostanie podane, komponent MIERZY swój kontener
 * i wypełnia go w całości. Dzięki temu wywołujący nie musi znać pikseli —
 * wcześniej sztywne `width={220}` wjeżdżało w kolumnę o szerokości 140 px
 * i ucinało jedną trzecią CV.
 *
 * Tryb domyślny przycina zawartość do proporcji jednej strony. Tryb `full`
 * deleguje do `PaginatedCvSheet` — CAŁY dokument jako osobne strony A4, każda
 * we własnym prostokącie. Bez tego dłuższe CV w porównaniu „przed/po" kończyło
 * się w połowie ostatniej strony i zostawiało niczym nieopisany biały obszar
 * na dole, wyglądający jak ucięty fragment.
 */
export function TemplateThumb({
  template,
  cv,
  width,
  full = false,
  demo = false,
  crop,
  className,
}: {
  template: TemplateId;
  cv: TailoredCv;
  /**
   * Szerokość w pikselach. Pominięta = miniatura mierzy własny kontener
   * i wypełnia go (zalecane — nie da się wtedy uciąć CV w szerokości).
   */
  width?: number;
  /** Pokaż cały dokument jako osobne strony A4 zamiast przyciętej miniatury. */
  full?: boolean;
  /**
   * Miniatura w galerii szablonów: gdy układ ma miejsce na zdjęcie, a
   * użytkownik żadnego nie wgrał, podstawiamy zdjęcie poglądowe. Dzięki temu
   * widać, że szablon przewiduje zdjęcie. Do CV ani do PDF to nie trafia.
   */
  demo?: boolean;
  /**
   * Widoczna wysokość jako wielokrotność szerokości. Domyślnie pełna kartka
   * A4 (≈1,41). Mniejsza wartość pokazuje tylko górę dokumentu — karta jest
   * niższa, a skala ta sama, więc nagłówek CV pozostaje czytelny.
   * Ignorowane w trybie `full`.
   */
  crop?: number;
  className?: string;
}) {
  const cvDoPodgladu: TailoredCv =
    demo && templateUsesPhoto(template) && !cv.personal_info.photo
      ? {
          ...cv,
          personal_info: { ...cv.personal_info, photo: STOCK_PHOTO },
        }
      : cv;

  const mierzone = width === undefined;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zmierzonaSzer, setZmierzonaSzer] = useState(0);

  // Pomiar kontenera — tylko gdy wywołujący nie narzucił szerokości.
  useLayoutEffect(() => {
    if (!mierzone) return;
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setZmierzonaSzer(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mierzone]);

  const szerokosc = mierzone ? zmierzonaSzer : width;
  // Zabezpieczenie: dopóki kontener nie ma szerokości (pierwszy render przed
  // pomiarem), nie renderujemy nic zamiast wstawiać NaN/0 do stylu.
  const poprawnaSzerokosc =
    szerokosc !== undefined && Number.isFinite(szerokosc) && szerokosc > 0;

  if (full) {
    return (
      <div ref={wrapRef} className={cn(mierzone && "w-full", className)}>
        {poprawnaSzerokosc && (
          <PaginatedCvSheet
            cv={cvDoPodgladu}
            template={template}
            width={szerokosc!}
          />
        )}
      </div>
    );
  }

  const scale = poprawnaSzerokosc ? szerokosc! / SHEET_WIDTH : 0;
  const wysokosc = poprawnaSzerokosc
    ? Math.round(szerokosc! * (crop ?? A4_RATIO))
    : 0;

  return (
    <div ref={wrapRef} className={cn(mierzone && "w-full", className)}>
      {poprawnaSzerokosc && (
        <div
          aria-hidden
          className="pointer-events-none relative select-none overflow-hidden rounded-md bg-white"
          style={{ width: szerokosc, height: wysokosc }}
        >
          <div
            style={{
              width: SHEET_WIDTH,
              // Kolumna flex + minimum jednej kartki: dokument (z `grow`)
              // rozciąga się na całą stronę, więc kolorowy panel szablonu nie
              // urywa się w połowie, zostawiając biały pas na dole miniatury.
              display: "flex",
              flexDirection: "column",
              minHeight: SHEET_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <CvDocument cv={cvDoPodgladu} template={template} />
          </div>
        </div>
      )}
    </div>
  );
}
