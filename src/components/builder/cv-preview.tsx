"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { useCvStore } from "@/lib/store";
import { CvDocument } from "./cv-document";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi
const SHEET_HEIGHT = 1123; // wysokość A4 przy 96 dpi

/**
 * Podgląd CV na żywo — arkusz A4 „unoszący się" nad tłem, dane ze store'a.
 *
 * KLUCZOWE: dokument renderujemy ZAWSZE w sztywnej szerokości A4 (794 px)
 * i dopiero całość SKALUJEMY do dostępnego miejsca. Wcześniej CvDocument
 * dostawał szerokość kontenera, więc na telefonie tekst przelewał się inaczej
 * niż w pliku PDF — podgląd pokazywał układ, którego użytkownik nigdy nie
 * dostanie. Teraz proporcje i łamanie wierszy są identyczne jak w eksporcie,
 * niezależnie od urządzenia; zmienia się wyłącznie skala.
 *
 * Skali nie podbijamy powyżej 1:1 — na szerokim ekranie kartka ma naturalny
 * rozmiar A4 zamiast być rozdmuchiwana.
 */
export function CvPreview() {
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);

  const wrapRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [dostepnaSzer, setDostepnaSzer] = useState(0);
  const [wysokoscTresci, setWysokoscTresci] = useState(SHEET_HEIGHT);

  const isEmpty =
    !cv.personal_info.full_name &&
    !cv.professional_summary &&
    cv.experience.length === 0;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setDostepnaSzer(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Realna wysokość dokumentu — arkusz rośnie o tyle stron, ile trzeba.
  useEffect(() => {
    if (isEmpty) return;
    const el = docRef.current;
    if (!el) return;
    const update = () => setWysokoscTresci(el.scrollHeight || SHEET_HEIGHT);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isEmpty, cv, template]);

  const scale = dostepnaSzer > 0 ? Math.min(1, dostepnaSzer / SHEET_WIDTH) : 0;
  const strony = Math.max(1, Math.ceil(wysokoscTresci / SHEET_HEIGHT));
  const wysokoscArkuszy = strony * SHEET_HEIGHT;

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[794px]">
      <p className="eyebrow mb-3 text-center text-muted-foreground">
        Podgląd na żywo — szablon:{" "}
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
        scale > 0 && (
          <div
            className="relative overflow-hidden rounded-lg bg-white shadow-dialog"
            style={{
              width: Math.round(SHEET_WIDTH * scale),
              height: Math.round(wysokoscArkuszy * scale),
              marginInline: "auto",
            }}
          >
            <div
              ref={docRef}
              className="flex flex-col"
              style={{
                width: SHEET_WIDTH,
                minHeight: SHEET_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <CvDocument cv={cv} template={template} />
            </div>

            {/* Linie podziału stron — widać, gdzie kończy się kartka A4. */}
            {Array.from({ length: strony - 1 }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-black/25"
                style={{ top: Math.round((i + 1) * SHEET_HEIGHT * scale) }}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
