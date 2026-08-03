"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { PdfPreview, PdfThumb } from "@/components/pdf-preview";
import { STOCK_PHOTO, templateUsesPhoto } from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi
const SHEET_HEIGHT = 1123; // wysokość A4 przy 96 dpi
/** Proporcja pełnej kartki A4 (wysokość / szerokość). */
export const A4_RATIO = SHEET_HEIGHT / SHEET_WIDTH;

/**
 * Prawdziwa miniatura CV — pierwsza strona wygenerowanego pliku PDF.
 *
 * Miniatura pokazuje TEN SAM plik, który użytkownik pobierze; nie ma tu
 * osobnego rysowania szablonu w HTML (powód: `pdf-preview.tsx`). Dzięki temu
 * wybór szablonu w galerii jest wyborem tego, co faktycznie wyjdzie w pliku.
 *
 * ZASADA: miniatura NIGDY nie ucina dokumentu w szerokości. Zawsze widać pełną
 * szerokość szablonu — zmienia się tylko skala. Ucinać wolno wyłącznie w pionie
 * (`crop`), bo czytelność CV bierze się z szerokości: obcięty bok wygląda jak
 * zepsuty layout, obcięty dół czyta się naturalnie jak „dalszy ciąg strony".
 *
 * Tryb domyślny przycina zawartość do proporcji jednej strony. Tryb `full`
 * pokazuje CAŁY dokument jako osobne strony A4, każdą we własnym prostokącie.
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
  // `useMemo`, a nie zwykłe wyrażenie w ciele funkcji: podstawienie zdjęcia
  // poglądowego tworzy NOWY obiekt CV, a nowy obiekt przy każdym renderze
  // kazałby generować plik PDF od początku.
  const cvDoPodgladu: TailoredCv = useMemo(
    () =>
      demo && templateUsesPhoto(template) && !cv.personal_info.photo
        ? { ...cv, personal_info: { ...cv.personal_info, photo: STOCK_PHOTO } }
        : cv,
    [cv, template, demo]
  );

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

  return (
    <div ref={wrapRef} className={cn(mierzone && "w-full", className)}>
      {poprawnaSzerokosc &&
        (full ? (
          <PdfPreview cv={cvDoPodgladu} template={template} width={szerokosc!} />
        ) : (
          <PdfThumb
            cv={cvDoPodgladu}
            template={template}
            width={szerokosc!}
            crop={crop ?? A4_RATIO}
          />
        ))}
    </div>
  );
}
