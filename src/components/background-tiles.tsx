import { cn } from "@/lib/utils";

/**
 * Czysto dekoracyjne, ledwo widoczne kafelki w tle — bez treści, bez interakcji.
 * TEST na prośbę Marka (2026-08-10), może zniknąć równie szybko, jak powstał.
 *
 * Deterministyczny pseudolosowy rozkład (bez `Math.random`), żeby serwer i
 * przeglądarka wyrenderowały DOKŁADNIE to samo — inaczej hydratacja Reacta
 * wyłapałaby rozjazd i albo rzuciła ostrzeżenie, albo kafelki mrugnęłyby przy
 * starcie strony.
 */
function pseudolosowa(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const LICZBA_KAFELKOW = 60;

export function BackgroundTiles({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 grid grid-cols-6 gap-2 overflow-hidden sm:grid-cols-10",
        className
      )}
    >
      {Array.from({ length: LICZBA_KAFELKOW }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-lg bg-foreground/5"
          style={{
            animationDelay: `${pseudolosowa(i) * 6}s`,
            animationDuration: `${4 + pseudolosowa(i + 100) * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
