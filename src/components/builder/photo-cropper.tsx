"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Move, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dopasowanie kadru zdjęcia — zoom + przesuwanie w ramce o proporcjach szablonu.
 *
 * Świadomie NIE jest to modal: panel rozwija się w miejscu, wewnątrz okna „Dane
 * osobowe". Zagnieżdżony modal w modalu nie domykał animacji wyjścia w Radiksie
 * (zostawał widoczny z `data-state="closed"`), a przy okazji modal na modalu to
 * słaby wzorzec.
 *
 * Pracujemy na POMNIEJSZONYM ORYGINALE (`photo_source`), nie na poprzednim
 * kadrze — dzięki temu kolejne poprawki nie tracą jakości i można odkadrować
 * z powrotem szerzej.
 */

/** Bok wyjściowego zdjęcia w px — kompromis jakość / rozmiar w localStorage. */
const WYNIK = 360;
/** Bok ramki podglądu. */
const RAMKA = 232;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

export type Kadr = { zoom: number; ox: number; oy: number };

/** Ogranicza przesunięcie tak, by zdjęcie zawsze wypełniało całą ramkę. */
function ogranicz(wartosc: number, rozmiarObrazu: number): number {
  const min = RAMKA - rozmiarObrazu;
  if (min >= 0) return 0;
  return Math.min(0, Math.max(min, wartosc));
}

export function PhotoCropper({
  source,
  kadr,
  onZapisz,
  onAnuluj,
}: {
  /** Pomniejszony oryginał (data URL). */
  source: string;
  /** Poprzednie ustawienia kadru, jeśli były. */
  kadr?: Kadr;
  onZapisz: (photo: string, kadr: Kadr) => void;
  onAnuluj: () => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(kadr?.zoom ?? 1);
  const [poz, setPoz] = useState({ x: 0, y: 0 });
  const przeciaganie = useRef<{ x: number; y: number } | null>(null);

  // Skala „wypełnij ramkę" — krótszy bok zdjęcia dopasowany do ramki.
  const bazowa = img ? RAMKA / Math.min(img.width, img.height) : 1;
  const skala = bazowa * zoom;
  const szer = img ? img.width * skala : 0;
  const wys = img ? img.height * skala : 0;

  useEffect(() => {
    if (!source) return;
    const obraz = new window.Image();
    obraz.onload = () => {
      setImg(obraz);
      const z = kadr?.zoom ?? 1;
      const s = (RAMKA / Math.min(obraz.width, obraz.height)) * z;
      setZoom(z);
      setPoz(
        kadr
          ? { x: kadr.ox * RAMKA, y: kadr.oy * RAMKA }
          : {
              x: (RAMKA - obraz.width * s) / 2,
              y: (RAMKA - obraz.height * s) / 2,
            }
      );
    };
    obraz.src = source;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // Zoom powiększa względem ŚRODKA ramki, nie lewego górnego rogu.
  const zmienZoom = (nowy: number) => {
    if (!img) return setZoom(nowy);
    const stara = bazowa * zoom;
    const nowaSkala = bazowa * nowy;
    const srodekX = (RAMKA / 2 - poz.x) / stara;
    const srodekY = (RAMKA / 2 - poz.y) / stara;
    setZoom(nowy);
    setPoz({
      x: ogranicz(RAMKA / 2 - srodekX * nowaSkala, img.width * nowaSkala),
      y: ogranicz(RAMKA / 2 - srodekY * nowaSkala, img.height * nowaSkala),
    });
  };

  const start = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    przeciaganie.current = { x: e.clientX - poz.x, y: e.clientY - poz.y };
  };
  const ruch = (e: React.PointerEvent) => {
    if (!przeciaganie.current || !img) return;
    setPoz({
      x: ogranicz(e.clientX - przeciaganie.current.x, szer),
      y: ogranicz(e.clientY - przeciaganie.current.y, wys),
    });
  };
  const koniec = () => {
    przeciaganie.current = null;
  };

  const zapisz = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = WYNIK;
    canvas.height = WYNIK;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const wycinek = RAMKA / skala;
    ctx.drawImage(
      img,
      -poz.x / skala,
      -poz.y / skala,
      wycinek,
      wycinek,
      0,
      0,
      WYNIK,
      WYNIK
    );
    onZapisz(canvas.toDataURL("image/jpeg", 0.72), {
      zoom,
      ox: poz.x / RAMKA,
      oy: poz.y / RAMKA,
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary/40 p-4">
      <p className="self-start text-xs text-muted-foreground">
        Przeciągnij zdjęcie i użyj suwaka, aby ustawić kadr. Ramka odpowiada
        proporcjom w szablonie.
      </p>

      <div
        onPointerDown={start}
        onPointerMove={ruch}
        onPointerUp={koniec}
        onPointerCancel={koniec}
        className="relative cursor-grab touch-none overflow-hidden rounded-md bg-[var(--field)] active:cursor-grabbing"
        style={{ width: RAMKA, height: RAMKA }}
      >
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source}
            alt=""
            draggable={false}
            className="absolute max-w-none select-none"
            style={{ width: szer, height: wys, left: poz.x, top: poz.y }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/25" />
        <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">
          <Move className="size-3" />
          przeciągnij
        </span>
      </div>

      <div className="flex w-full items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-8 shrink-0 rounded-full"
          onClick={() => zmienZoom(Math.max(ZOOM_MIN, zoom - 0.1))}
          aria-label="Oddal"
        >
          <Minus className="size-4" />
        </Button>
        <input
          type="range"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={0.01}
          value={zoom}
          onChange={(e) => zmienZoom(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--field)] accent-primary"
          aria-label="Powiększenie"
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-8 shrink-0 rounded-full"
          onClick={() => zmienZoom(Math.min(ZOOM_MAX, zoom + 0.1))}
          aria-label="Przybliż"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex w-full justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="btn-label font-bold"
          onClick={onAnuluj}
        >
          Anuluj
        </Button>
        <Button
          type="button"
          size="sm"
          className="btn-label font-bold"
          disabled={!img}
          onClick={zapisz}
        >
          Zapisz kadr
        </Button>
      </div>
    </div>
  );
}
