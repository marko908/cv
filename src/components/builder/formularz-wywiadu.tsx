"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { OdpowiedzWywiadu, PytanieWywiadu } from "@/lib/ai/interview";
import { bezPauz, cn } from "@/lib/utils";

/**
 * Karty pytań wywiadu + przycisk przeliczenia.
 *
 * WSPÓLNY dla dwóch miejsc (2026-09-02): kroku „wywiad" w modalu kreatora
 * i sekcji na stronie szczegółów dopasowania, gdzie można dokończyć pytania
 * pominięte za pierwszym razem. Dwie kopie tego formularza rozjechałyby się
 * co do etykiet przycisków, a te są tu nieprzypadkowe - muszą odpowiadać NA
 * ZADANE pytanie (feedback Marka 2026-08-02).
 */
export function FormularzWywiadu({
  pytania,
  onSubmit,
  wTrakcie = false,
  etykietaPrzycisku,
}: {
  pytania: PytanieWywiadu[];
  onSubmit: (odpowiedzi: OdpowiedzWywiadu[]) => void;
  /** Blokuje przycisk i pokazuje kręciołek na czas przeliczania. */
  wTrakcie?: boolean;
  /** Nadpisuje domyślne „Przelicz z N uzupełnieniami". */
  etykietaPrzycisku?: (potwierdzone: number) => string;
}) {
  // Stan odpowiedzi: dla każdego pytania „mam" + opcjonalny szczegół.
  const [stan, setStan] = useState<
    Record<string, { ma: boolean; szczegol: string }>
  >(() =>
    Object.fromEntries(pytania.map((p) => [p.id, { ma: false, szczegol: "" }]))
  );

  const potwierdzone = pytania.filter((p) => stan[p.id]?.ma).length;

  const wyslij = () => {
    onSubmit(
      pytania.map((p) => ({
        id: p.id,
        ma: stan[p.id]?.ma ?? false,
        szczegol: stan[p.id]?.szczegol,
      }))
    );
  };

  const doswiadczenie = pytania.filter((p) => p.typ === "doswiadczenie");
  const cechy = pytania.filter((p) => p.typ === "cecha");

  // Karta pytania - framing i pola zależą od rodzaju (doświadczenie vs cecha).
  const karta = (p: PytanieWywiadu) => {
    const s = stan[p.id] ?? { ma: false, szczegol: "" };
    // Etykiety muszą odpowiadać NA TO pytanie. „Mam to / Nie mam" pod pytaniem
    // o skalę punktu było odpowiedzią na zupełnie inne pytanie - użytkownik
    // klikał „Mam to" w znaczeniu „tak, robiłem to", a nie „mam liczbę"
    // (feedback Marka 2026-08-02).
    const tak = p.cel ? "Podam" : p.typ === "doswiadczenie" ? "Mam to" : "Wskaż w CV";
    const nie = p.cel ? "Nie wiem" : p.typ === "doswiadczenie" ? "Nie mam" : "Pomiń";
    return (
      <div key={p.id} className="card-surface p-4">
        <p className="text-sm font-medium">{bezPauz(p.pytanie)}</p>
        {/* Dosłowny fragment ogłoszenia - bez niego zwięzłe wymaganie
            („Docker") nie mówi, o jaki zakres pyta pracodawca. Cały cytat. */}
        {p.kontekst && (
          <p className="mt-1.5 border-l-2 border-border pl-2.5 text-xs italic text-muted-foreground">
            W ogłoszeniu: „{bezPauz(p.kontekst)}”
          </p>
        )}
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => setStan((st) => ({ ...st, [p.id]: { ...s, ma: true } }))}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold transition-colors",
              s.ma
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {tak}
          </button>
          <button
            type="button"
            onClick={() =>
              setStan((st) => ({ ...st, [p.id]: { ma: false, szczegol: "" } }))
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold transition-colors",
              !s.ma
                ? "bg-accent text-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {nie}
          </button>
        </div>
        {/* Pole na konkret tylko dla doświadczenia - cechy nie opisujemy. */}
        {s.ma && p.typ === "doswiadczenie" && (
          <Textarea
            value={s.szczegol}
            onChange={(e) =>
              setStan((st) => ({
                ...st,
                [p.id]: { ...s, szczegol: e.target.value },
              }))
            }
            placeholder={p.hint}
            className="mt-2 min-h-16 text-sm"
          />
        )}
      </div>
    );
  };

  const etykieta = etykietaPrzycisku
    ? etykietaPrzycisku(potwierdzone)
    : `Przelicz z ${
        potwierdzone === 1 ? "1 uzupełnieniem" : `${potwierdzone} uzupełnieniami`
      }`;

  return (
    <>
      <div className="flex flex-col gap-5">
        {doswiadczenie.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="eyebrow text-muted-foreground">Twoje doświadczenie</p>
            {doswiadczenie.map(karta)}
          </div>
        )}
        {cechy.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="eyebrow text-muted-foreground">
              Cechy - warto wskazać, jeśli Cię opisują
            </p>
            {cechy.map(karta)}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          onClick={wyslij}
          disabled={potwierdzone === 0 || wTrakcie}
          className="gap-2 font-bold"
        >
          <RefreshCw className={cn("size-4", wTrakcie && "animate-spin")} />
          {etykieta}
        </Button>
      </div>
    </>
  );
}
