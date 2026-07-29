"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { CvDocument } from "@/components/builder/cv-document";
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
 * pokazuje CAŁY dokument — rośnie na tyle stron, ile trzeba, i rysuje linie
 * podziału stron. Bez tego dłuższe CV wyglądało na ucięte w porównaniu
 * „przed / po", mimo że eksport PDF paginuje je poprawnie.
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
  /** Pokaż cały dokument (wiele stron) zamiast przyciętej miniatury. */
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

  // Zabezpieczenie: dopóki kontener nie ma szerokości (pierwszy render przed
  // pomiarem), nie renderujemy nic zamiast wstawiać NaN/0 do stylu.
  const poprawnaSzerokosc =
    szerokosc !== undefined && Number.isFinite(szerokosc) && szerokosc > 0;
  const scale = poprawnaSzerokosc ? szerokosc / SHEET_WIDTH : 0;

  // Ile stron A4 zajmie dokument (min. 1) — do rysowania linii podziału.
  const strony = full ? Math.max(1, Math.ceil(contentHeight / SHEET_HEIGHT)) : 1;
  // Dopełniamy do pełnych stron, żeby ostatnia kartka nie była obcięta w połowie.
  const wysokoscArkuszy = full ? strony * SHEET_HEIGHT : SHEET_HEIGHT;
  const wysokosc = poprawnaSzerokosc
    ? Math.round(
        full ? wysokoscArkuszy * scale : szerokosc! * (crop ?? A4_RATIO)
      )
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
            ref={contentRef}
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
      )}
    </div>
  );
}
