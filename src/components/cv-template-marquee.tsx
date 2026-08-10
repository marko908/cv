"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Diagonalna karuzela SZABLONÓW CV w tle sekcji hero — CZYSTO DEKORACYJNA.
 * TEST na prośbę Marka (2026-08-10, wersja 2 — pierwsza próba z kafelkami
 * została cofnięta). Może zniknąć równie szybko, jak powstała: cała logika
 * siedzi w tym jednym pliku, integracja w `page.tsx` to import + jedna linijka.
 *
 * Obrazki to PRAWDZIWE miniatury szablonów (ten sam plik co eksport PDF),
 * wygenerowane raz skryptem `scripts/generuj-miniatury-marketing.ts` i
 * zapisane w `public/marketing/szablony/` — nie stockowe zdjęcia z internetu.
 *
 * Bardzo niska przezroczystość i wolne tempo: ma tylko delikatnie „żyć"
 * w tle, nie przyciągać wzroku ani nie utrudniać czytania treści hero, która
 * stoi nad nią. `pointer-events-none`, żeby nie przechwytywała kliknięć nad
 * przyciskiem CTA w tej samej sekcji.
 */

interface Szablon {
  id: string;
  url: string;
}

/** Sześć szablonów o zróżnicowanym wyglądzie (ze zdjęciem/bez, jasne/ciemne). */
const SZABLONY: Szablon[] = [
  { id: "nowoczesny", url: "/marketing/szablony/nowoczesny.png" },
  { id: "klasyczny", url: "/marketing/szablony/klasyczny.png" },
  { id: "prestizowy", url: "/marketing/szablony/prestizowy.png" },
  { id: "boczny", url: "/marketing/szablony/boczny.png" },
  { id: "grafitowy", url: "/marketing/szablony/grafitowy.png" },
  { id: "pastelowy", url: "/marketing/szablony/pastelowy.png" },
];

function Kafelek({ szablon }: { szablon: Szablon }) {
  return (
    <div className="h-[311px] w-[220px] shrink-0 overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element -- statyczny plik z /public, nie ma po co przepuszczać przez next/image */}
      <img
        src={szablon.url}
        alt=""
        className="h-full w-full object-cover opacity-[0.08]"
      />
    </div>
  );
}

function Wiersz({
  kafelki,
  predkosc,
  kierunek,
}: {
  kafelki: Szablon[];
  predkosc: number;
  kierunek: 1 | -1;
}) {
  const klasa =
    kierunek === -1 ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="flex w-full overflow-hidden">
      <div
        className={cn("flex shrink-0", klasa)}
        style={{ "--speed": `${predkosc}s` } as React.CSSProperties}
      >
        {/* Wiersz zdublowany RAZ — przy przewinięciu o -50% pierwsza kopia
            znika dokładnie w chwili, w której druga wchodzi w to samo miejsce,
            co daje pętlę bez widocznego szwu. */}
        {[0, 1].map((kopia) => (
          <div key={kopia} className="flex shrink-0">
            {kafelki.map((szablon, idx) => (
              <div
                key={`${szablon.id}-${kopia}-${idx}`}
                className="shrink-0 pr-6"
              >
                <Kafelek szablon={szablon} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CvTemplateMarquee({
  /** Sekundy na pełny obieg wiersza — WIĘKSZA liczba = WOLNIEJSZY ruch. */
  baseSpeed = 240,
  className,
}: {
  baseSpeed?: number;
  className?: string;
}) {
  const wiersze: { predkosc: number; kierunek: 1 | -1 }[] = [
    { predkosc: baseSpeed, kierunek: -1 },
    { predkosc: baseSpeed - 30, kierunek: 1 },
    { predkosc: baseSpeed + 30, kierunek: -1 },
  ];

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden",
        className
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left { animation: marquee-left var(--speed) linear infinite; }
        .animate-marquee-right { animation: marquee-right var(--speed) linear infinite; }
      `,
        }}
      />
      <div className="flex w-[200vw] -rotate-[16deg] flex-col gap-6">
        {wiersze.map((w, i) => (
          <Wiersz
            key={i}
            kafelki={SZABLONY}
            predkosc={w.predkosc}
            kierunek={w.kierunek}
          />
        ))}
      </div>
    </div>
  );
}
