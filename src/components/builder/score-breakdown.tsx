"use client";

import { useState } from "react";
import { ChevronDown, Info, Lock, TrendingUp } from "lucide-react";
import type { ScoreCriterion } from "@/lib/cv-schema";
import { cn, pluralize } from "@/lib/utils";

/** Ile kryteriów widać bez opłaconego dostępu — reszta zablokowana. */
const FREE_METRICS = 2;

/**
 * Rozkład wyniku 0–100 na jawne, ważone kryteria. Sercem wartości aplikacji jest
 * to, że użytkownik ROZUMIE, z czego wynika liczba i co konkretnie poprawiliśmy —
 * a nie dostaje „magicznego" wyniku od AI. Dlatego pokazujemy każde kryterium
 * z wartością przed/po, wagą i jednozdaniowym wyjaśnieniem.
 *
 * Bez opłaconego dostępu widoczne są tylko pierwsze `FREE_METRICS` kryteria
 * (w kolejności z `breakdown` — to zwykle te zależne od oferty, najbardziej
 * interesujące); reszta pokazuje sam label i kłódkę, spójnie z tym, jak
 * blokujemy „Co poprawiliśmy"/„Na co zwróciliśmy uwagę" gdzie indziej.
 */
export function ScoreBreakdown({
  breakdown,
  unlocked,
  defaultOpen = false,
}: {
  breakdown: ScoreCriterion[];
  unlocked: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (breakdown.length === 0) return null;

  const wolneId = new Set(breakdown.slice(0, FREE_METRICS).map((k) => k.id));
  const zablokowane = breakdown.length - wolneId.size;

  const oferta = breakdown.filter((k) => k.dependsOnOffer);
  const jakosc = breakdown.filter((k) => !k.dependsOnOffer);
  const totalBefore = Math.round(
    breakdown.reduce((s, k) => s + k.before, 0)
  );
  const totalAfter = Math.round(breakdown.reduce((s, k) => s + k.after, 0));

  return (
    <div className="card-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2">
          <Info className="size-4 text-primary" />
          <span className="text-sm font-bold">Z czego wynika ten wynik</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {totalBefore} → <span className="font-bold text-primary">{totalAfter}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-border/60 p-4 pt-3">
          <Grupa
            tytul="Dopasowanie do tej oferty"
            kryteria={oferta}
            wolneId={unlocked ? null : wolneId}
          />
          <Grupa
            tytul="Ogólna jakość CV"
            kryteria={jakosc}
            wolneId={unlocked ? null : wolneId}
            className="mt-4"
          />

          {!unlocked && zablokowane > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              {pluralize(zablokowane, "kryterium", "kryteria", "kryteriów")} w
              pełnym raporcie
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Grupa({
  tytul,
  kryteria,
  wolneId,
  className,
}: {
  tytul: string;
  kryteria: ScoreCriterion[];
  /** `null` = wszystko odblokowane; inaczej zbiór id widocznych za darmo. */
  wolneId: Set<string> | null;
  className?: string;
}) {
  if (kryteria.length === 0) return null;
  return (
    <div className={className}>
      <p className="eyebrow mb-2 text-muted-foreground">{tytul}</p>
      <div className="flex flex-col gap-3">
        {kryteria.map((k) =>
          wolneId === null || wolneId.has(k.id) ? (
            <Wiersz key={k.id} k={k} />
          ) : (
            <WierszZablokowany key={k.id} k={k} />
          )
        )}
      </div>
    </div>
  );
}

function WierszZablokowany({ k }: { k: ScoreCriterion }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{k.label}</span>
        <Lock className="size-3.5 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Szczegóły w pełnym raporcie
      </p>
    </div>
  );
}

function Wiersz({ k }: { k: ScoreCriterion }) {
  // Starsze rekordy w localStorage mogą nie mieć `before`/`after` — bez tej
  // ochrony do stylu trafiał `NaN%` (React zgłaszał błąd w konsoli).
  const liczba = (v: number | undefined) => (Number.isFinite(v) ? (v as number) : 0);
  const poProc = k.weight > 0 ? (liczba(k.after) / k.weight) * 100 : 0;
  const przedProc = k.weight > 0 ? (liczba(k.before) / k.weight) * 100 : 0;
  const wzrost = Math.round((k.after - k.before) * 10) / 10;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm">{k.label}</span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
          {wzrost > 0 && (
            <span className="flex items-center gap-0.5 text-primary">
              <TrendingUp className="size-3" />+{wzrost}
            </span>
          )}
          {k.after}/{k.weight}
        </span>
      </div>
      {/* Pasek: wypełnienie „po", cieńszy znacznik „przed" pod spodem. */}
      <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/30"
          style={{ width: `${przedProc}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
          style={{ width: `${poProc}%`, opacity: 0.85 }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{k.explanation}</p>
    </div>
  );
}
