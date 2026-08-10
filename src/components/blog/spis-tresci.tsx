"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Naglowek } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

/**
 * Spis treści z nagłówków H2/H3 artykułu.
 *
 * Dwie oprawy, jedna lista: na desktopie przyklejony pasek boczny, na
 * telefonie zwijana sekcja nad treścią (sticky sidebar zjadłby tam pół
 * ekranu). Poniżej 2 nagłówków nie renderujemy nic - spis treści z jedną
 * pozycją to sam szum.
 */
const MIN_POZYCJI = 2;

function Lista({ naglowki }: { naglowki: Naglowek[] }) {
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {naglowki.map((n) => (
        <li key={n.id} className={cn(n.poziom === 3 && "pl-4")}>
          <a
            href={`#${n.id}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {n.tekst}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SpisTresciMobile({ naglowki }: { naglowki: Naglowek[] }) {
  const [otwarty, setOtwarty] = useState(false);
  if (naglowki.length < MIN_POZYCJI) return null;

  return (
    <div className="card-surface mb-8 p-4 lg:hidden">
      <button
        type="button"
        onClick={() => setOtwarty((o) => !o)}
        aria-expanded={otwarty}
        className="flex w-full items-center justify-between gap-3 text-sm font-bold"
      >
        W tym artykule
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            otwarty && "rotate-180"
          )}
        />
      </button>
      {otwarty && (
        <nav className="mt-4">
          <Lista naglowki={naglowki} />
        </nav>
      )}
    </div>
  );
}

export function SpisTresciDesktop({ naglowki }: { naglowki: Naglowek[] }) {
  if (naglowki.length < MIN_POZYCJI) return null;

  return (
    <nav className="sticky top-24 hidden lg:block">
      <p className="eyebrow mb-3 text-muted-foreground">W tym artykule</p>
      <Lista naglowki={naglowki} />
    </nav>
  );
}
