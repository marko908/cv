"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Kosz z potwierdzeniem — jedno wspólne miejsce dla wszystkich list, z których
 * da się coś skasować bezpowrotnie (CV, dopasowanie, sekcja CV).
 *
 * Powstał z dwóch realnych błędów znalezionych w testach na telefonie:
 *
 * 1. `opacity-0 group-hover:opacity-100` bez `sm:` — na dotyku NIE MA hovera,
 *    więc przycisk był niewidoczny, ale nadal w pełni klikalny
 *    (`pointer-events` zostaje `auto` przy zerowej przezroczystości). Na ekranie
 *    375 px wypadał przy prawej krawędzi wiersza, czyli dokładnie tam, gdzie
 *    ląduje kciuk przy otwieraniu pozycji. Jedno tapnięcie kasowało dane bez
 *    śladu. Dlatego tutaj widoczność jest sterowana JAWNIE: zawsze widoczny na
 *    dotyku, chowany do hovera dopiero od `sm`.
 * 2. Kasowanie bez potwierdzenia i bez cofnięcia. Powtarzamy wzorzec, który jest
 *    już w ustawieniach („Na pewno? Kliknij ponownie"): pierwszy klik uzbraja,
 *    drugi kasuje, a po `RESET_MS` bezczynności uzbrojenie samo wygasa.
 */
const RESET_MS = 4000;

export function ConfirmDeleteButton({
  onDelete,
  label,
  className,
}: {
  onDelete: () => void;
  /** Pełny opis dla czytników ekranu, np. „Usuń CV Anna Kowalska". */
  label: string;
  className?: string;
}) {
  const [uzbrojony, setUzbrojony] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const klik = (e: React.MouseEvent) => {
    // Wiersze list bywają klikalne w całości (Link/trigger modala) — kasowanie
    // nie może przy okazji nawigować.
    e.preventDefault();
    e.stopPropagation();

    if (!uzbrojony) {
      setUzbrojony(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setUzbrojony(false), RESET_MS);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setUzbrojony(false);
    onDelete();
  };

  return (
    <button
      type="button"
      onClick={klik}
      aria-label={uzbrojony ? `${label} — kliknij ponownie, aby potwierdzić` : label}
      title={uzbrojony ? "Kliknij ponownie, aby usunąć" : label}
      className={cn(
        "shrink-0 rounded-full transition-colors",
        uzbrojony
          ? "flex items-center gap-1.5 bg-destructive/15 px-2.5 py-1 text-[11px] font-bold text-destructive"
          : "p-1.5 text-muted-foreground hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
        className
      )}
    >
      <Trash2 className="size-4 shrink-0" />
      {uzbrojony && <span className="whitespace-nowrap">Na pewno?</span>}
    </button>
  );
}
