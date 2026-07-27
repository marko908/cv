"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Wgrywanie zdjęcia kandydata (szablony ze zdjęciem).
 *
 * Zdjęcie zapisujemy jako data URL wewnątrz CV, a CV siedzi w localStorage —
 * dlatego plik z aparatu (kilka MB) MUSI zostać przeskalowany, inaczej
 * przepełnimy magazyn przeglądarki. Skalujemy do kwadratu 360 px i zapisujemy
 * jako JPEG, co daje ~30–50 kB przy zachowaniu dobrej jakości druku w CV.
 */

const BOK = 360;
const JAKOSC = 0.72;

/** Skaluje i przycina obraz do kwadratu, zwraca data URL (JPEG). */
async function przeskaluj(plik: File): Promise<string> {
  const bitmapa = await createImageBitmap(plik);
  const bok = Math.min(bitmapa.width, bitmapa.height);
  // Kadrujemy centralnie do kwadratu — portret zwykle jest wyśrodkowany.
  const sx = (bitmapa.width - bok) / 2;
  const sy = (bitmapa.height - bok) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = BOK;
  canvas.height = BOK;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak kontekstu canvas");
  ctx.drawImage(bitmapa, sx, sy, bok, bok, 0, 0, BOK, BOK);
  bitmapa.close();

  return canvas.toDataURL("image/jpeg", JAKOSC);
}

export function PhotoInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (photo: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stan, setStan] = useState<"idle" | "praca">("idle");
  const [blad, setBlad] = useState<string | null>(null);

  const onPlik = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const plik = e.target.files?.[0];
    e.target.value = "";
    if (!plik) return;
    if (!plik.type.startsWith("image/")) {
      setBlad("Wybierz plik graficzny (JPG lub PNG).");
      return;
    }

    setStan("praca");
    setBlad(null);
    try {
      onChange(await przeskaluj(plik));
    } catch {
      setBlad("Nie udało się wczytać tego zdjęcia. Spróbuj inny plik.");
    } finally {
      setStan("idle");
    }
  };

  return (
    <div className="grid gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPlik}
      />
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Zdjęcie do CV"
            className="size-16 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-input bg-[var(--field)]">
            <ImagePlus className="size-5 text-muted-foreground" />
          </span>
        )}

        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="btn-label font-bold"
              disabled={stan === "praca"}
              onClick={() => inputRef.current?.click()}
            >
              {stan === "praca" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              {value ? "Zmień zdjęcie" : "Wgraj zdjęcie"}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="btn-label gap-1.5 font-bold text-muted-foreground"
                onClick={() => onChange(undefined)}
              >
                <Trash2 className="size-3.5" />
                Usuń
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Widoczne tylko w szablonach ze zdjęciem. Kadrujemy do kwadratu.
          </p>
        </div>
      </div>
      {blad && <p className="text-xs text-destructive">{blad}</p>}
    </div>
  );
}
