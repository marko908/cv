"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { CvDocument } from "@/components/builder/cv-document";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi
const SHEET_HEIGHT = 1123; // wysokość A4 przy 96 dpi

/**
 * Wielostronicowy podgląd CV jako PRAWDZIWE, ODDZIELNE strony A4 — każda we
 * własnym, wizualnie odgrodzonym prostokącie (cień, odstęp), tak jak w
 * przeglądarkowym podglądzie PDF.
 *
 * Naprawia dwa zgłoszone problemy naraz:
 * 1) "nie wiadomo, jak CV wygląda po eksporcie" — teraz widać dokładnie tyle
 *    stron, ile realnie zajmie eksport, jako osobne kartki.
 * 2) "na dole jest ucięty pasek" — wcześniej wielostronicowy podgląd renderował
 *    JEDEN ciągły arkusz zaokrąglony w górę do pełnych stron (z kreskowaną
 *    linią na granicy), a treść kończyła się w połowie ostatniej strony. Zostawiało
 *    to duży, niczym nieopisany biały obszar na dole, wyglądający jak ucięty/
 *    zepsuty fragment. Osobne prostokąty na stronę sprawiają, że puste miejsce
 *    na końcu OSTATNIEJ strony jest jednoznaczne: to po prostu koniec
 *    dokumentu, tak jak w prawdziwym PDF-ie, a nie ucięcie w środku.
 *
 * Technika ("przesuwane okno"): treść renderujemy RAZ, poza ekranem, tylko po
 * to, żeby zmierzyć naturalną wysokość. Do wyświetlenia KAŻDA strona dostaje
 * WŁASNĄ kopię dokumentu — to samo `cv`+`template`, więc identyczny wygląd —
 * przesuniętą w górę o `numer_strony × SHEET_HEIGHT` (`translateY`, w
 * jednostkach SPRZED skalowania) i przyciętą `overflow: hidden` do dokładnie
 * jednej strony. Każda kopia to więc "okno" na inny fragment tej samej treści.
 * Kilka kopii lekkiego, czysto prezentacyjnego komponentu to pomijalny koszt.
 *
 * UWAGA: cięcie strony pada dokładnie co SHEET_HEIGHT px, bez znajomości granic
 * sekcji/pozycji (w przeciwieństwie do prawdziwego eksportu PDF, gdzie
 * `minPresenceAhead`/`wrap={false}` w `cv-pdf*.tsx` chronią przed rozcięciem
 * pozycji w połowie). Liczba stron i przybliżone rozmieszczenie są więc
 * wiarygodne, ale dokładny podział może się różnić o pojedyncze wiersze.
 */
export function PaginatedCvSheet({
  cv,
  template,
  width,
  className,
}: {
  cv: TailoredCv;
  template: TemplateId;
  /** Docelowa szerokość NA EKRANIE (px) — skala liczona względem SHEET_WIDTH. */
  width: number;
  className?: string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(SHEET_HEIGHT);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.scrollHeight || SHEET_HEIGHT);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cv, template]);

  const poprawnaSzerokosc = Number.isFinite(width) && width > 0;
  const scale = poprawnaSzerokosc ? width / SHEET_WIDTH : 0;
  const strony = Math.max(1, Math.ceil(contentHeight / SHEET_HEIGHT));

  return (
    <div className={className}>
      {/* Kopia WYŁĄCZNIE do pomiaru wysokości — poza ekranem, nie wpływa na layout. */}
      <div
        aria-hidden
        style={{ position: "absolute", left: -99999, top: 0, width: SHEET_WIDTH }}
      >
        <div
          ref={measureRef}
          className="flex flex-col"
          style={{ minHeight: SHEET_HEIGHT }}
        >
          <CvDocument cv={cv} template={template} />
        </div>
      </div>

      {poprawnaSzerokosc && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: strony }, (_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-white shadow-dialog"
              style={{ width, height: Math.round(SHEET_HEIGHT * scale) }}
            >
              <div
                style={{
                  width: SHEET_WIDTH,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* `translateY`, NIE `marginTop`: transform nie podlega
                    zwijaniu marginesów i nie rusza layoutu przodków — czysto
                    wizualne przesunięcie o dokładnie jedną stronę na `i`. */}
                <div
                  className="flex flex-col"
                  style={{
                    minHeight: SHEET_HEIGHT,
                    transform: `translateY(${-i * SHEET_HEIGHT}px)`,
                  }}
                >
                  <CvDocument cv={cv} template={template} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
