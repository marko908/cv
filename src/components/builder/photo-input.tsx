"use client";

import { useRef, useState } from "react";
import { Crop, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoCropper, type Kadr } from "./photo-cropper";

/**
 * Wgrywanie i kadrowanie zdjęcia kandydata (szablony ze zdjęciem).
 *
 * Trzymamy DWA obrazy:
 *  - `photo` — gotowy kwadratowy kadr, to renderują szablony,
 *  - `photo_source` — pomniejszony oryginał, wyłącznie po to, by dało się
 *    poprawić kadr później bez utraty jakości.
 *
 * Wszystko siedzi w localStorage razem z CV, więc oba obrazy są mocno
 * zmniejszane: oryginał do 640 px dłuższego boku, kadr do 360 px, JPEG.
 * Realnie daje to ~40–90 kB łącznie zamiast kilku megabajtów z aparatu.
 */

const BOK_ORYGINALU = 640;
const BOK_KADRU = 360;
const JAKOSC = 0.72;

/** Pomniejsza obraz z zachowaniem proporcji i zwraca data URL (JPEG). */
async function pomniejsz(plik: File, maxBok: number): Promise<string> {
  const bitmapa = await createImageBitmap(plik);
  const skala = Math.min(1, maxBok / Math.max(bitmapa.width, bitmapa.height));
  const w = Math.round(bitmapa.width * skala);
  const h = Math.round(bitmapa.height * skala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak kontekstu canvas");
  ctx.drawImage(bitmapa, 0, 0, w, h);
  bitmapa.close();
  return canvas.toDataURL("image/jpeg", JAKOSC);
}

/** Wycina wyśrodkowany kwadrat z data URL — kadr domyślny po wgraniu. */
async function kadrujSrodek(dataUrl: string): Promise<string> {
  const obraz = await new Promise<HTMLImageElement>((ok, err) => {
    const i = new window.Image();
    i.onload = () => ok(i);
    i.onerror = err;
    i.src = dataUrl;
  });
  const bok = Math.min(obraz.width, obraz.height);
  const canvas = document.createElement("canvas");
  canvas.width = BOK_KADRU;
  canvas.height = BOK_KADRU;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak kontekstu canvas");
  ctx.drawImage(
    obraz,
    (obraz.width - bok) / 2,
    (obraz.height - bok) / 2,
    bok,
    bok,
    0,
    0,
    BOK_KADRU,
    BOK_KADRU
  );
  return canvas.toDataURL("image/jpeg", JAKOSC);
}

export type ZmianaZdjecia = {
  photo?: string;
  photo_source?: string;
  photo_crop?: Kadr;
};

export function PhotoInput({
  value,
  source,
  kadr,
  onChange,
}: {
  value?: string;
  source?: string;
  kadr?: Kadr;
  onChange: (zmiana: ZmianaZdjecia) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stan, setStan] = useState<"idle" | "praca">("idle");
  const [blad, setBlad] = useState<string | null>(null);
  const [kadrowanie, setKadrowanie] = useState(false);

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
      const oryginal = await pomniejsz(plik, BOK_ORYGINALU);
      const kadrDomyslny = await kadrujSrodek(oryginal);
      // Nowe zdjęcie = nowy kadr; kasujemy zapamiętane ustawienia poprzedniego.
      onChange({
        photo: kadrDomyslny,
        photo_source: oryginal,
        photo_crop: undefined,
      });
      // Od razu proponujemy dopasowanie — rzadko kiedy środek to właściwy kadr.
      setKadrowanie(true);
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

            {value && source && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="btn-label gap-1.5 font-bold"
                onClick={() => setKadrowanie(true)}
              >
                <Crop className="size-3.5" />
                Dopasuj
              </Button>
            )}

            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="btn-label gap-1.5 font-bold text-muted-foreground"
                onClick={() =>
                  onChange({
                    photo: undefined,
                    photo_source: undefined,
                    photo_crop: undefined,
                  })
                }
              >
                <Trash2 className="size-3.5" />
                Usuń
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {value && !source
              ? "Wgraj zdjęcie ponownie, aby móc poprawiać kadr."
              : "Widoczne tylko w szablonach ze zdjęciem."}
          </p>
        </div>
      </div>
      {blad && <p className="text-xs text-destructive">{blad}</p>}

      {source && kadrowanie && (
        <PhotoCropper
          source={source}
          kadr={kadr}
          onZapisz={(photo, nowyKadr) => {
            onChange({ photo, photo_source: source, photo_crop: nowyKadr });
            setKadrowanie(false);
          }}
          onAnuluj={() => setKadrowanie(false)}
        />
      )}
    </div>
  );
}
