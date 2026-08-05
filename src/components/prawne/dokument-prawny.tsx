/**
 * Renderer dokumentów prawnych (regulamin, polityka prywatności, regulamin
 * newslettera) z lekkiej składni tekstowej do JSX.
 *
 * Parsowanie (`parsujDokument`, `rozbijInline`) mieszka w
 * `lib/prawne/parsuj-dokument.ts` — współdzielone z rendererem PDF
 * (`regulamin-pdf.tsx`), który dołączamy do maili potwierdzających. Ten plik
 * odpowiada wyłącznie za HTML/JSX.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import {
  parsujDokument,
  rozbijInline,
  type FragmentInline,
} from "@/lib/prawne/parsuj-dokument";

/** Pogrubienia i linki jako JSX. Linki wewnętrzne idą przez `next/link`. */
function inline(tekst: string): ReactNode[] {
  return rozbijInline(tekst).map((fragment: FragmentInline, i) => {
    if (fragment.typ === "pogrubienie") {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {fragment.tresc}
        </strong>
      );
    }

    if (fragment.typ === "link") {
      const { etykieta, adres } = fragment;
      const klasa =
        "text-primary underline underline-offset-4 hover:no-underline";
      return adres.startsWith("/") || adres.startsWith("#") ? (
        <Link key={i} href={adres} className={klasa}>
          {etykieta}
        </Link>
      ) : (
        <a
          key={i}
          href={adres}
          target="_blank"
          rel="noopener noreferrer"
          className={klasa}
        >
          {etykieta}
        </a>
      );
    }

    return <span key={i}>{fragment.tresc}</span>;
  });
}

/** Wcięcie pozycji listy. Marker ma stałą szerokość, żeby tekst się wyrównywał. */
const WCIECIE = ["", "pl-6 sm:pl-8", "pl-12 sm:pl-16"] as const;
const SZEROKOSC_MARKERA = ["w-9", "w-8", "w-7"] as const;

export function DokumentPrawny({ zrodlo }: { zrodlo: string }) {
  const bloki = parsujDokument(zrodlo);

  return (
    <article className="text-[15px] leading-relaxed text-muted-foreground">
      {bloki.map((blok, i) => {
        switch (blok.typ) {
          case "naglowek":
            if (blok.poziom === 1) {
              return (
                <h1
                  key={i}
                  className="mb-10 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                >
                  {blok.tekst}
                </h1>
              );
            }
            if (blok.poziom === 2) {
              return (
                <h2
                  key={i}
                  className="mb-4 mt-12 border-t border-border pt-8 text-xl font-bold tracking-tight text-foreground"
                >
                  {blok.tekst}
                </h2>
              );
            }
            return (
              <h3
                key={i}
                className="mb-3 mt-8 text-base font-bold text-foreground"
              >
                {blok.tekst}
              </h3>
            );

          case "akapit":
            return (
              <p key={i} className="mb-4">
                {inline(blok.tekst)}
              </p>
            );

          case "pozycja":
            return (
              <div key={i} className={`mb-2 flex gap-1 ${WCIECIE[blok.poziom]}`}>
                <span
                  className={`${SZEROKOSC_MARKERA[blok.poziom]} shrink-0 tabular-nums`}
                >
                  {blok.znacznik}
                </span>
                <span className="min-w-0 flex-1">{inline(blok.tekst)}</span>
              </div>
            );

          case "tabela": {
            const [naglowki, ...reszta] = blok.wiersze;
            return (
              // Tabela przewija się we WŁASNYM kontenerze — bez tego szeroka
              // tabela cookies rozpychałaby całą stronę w poziomie na telefonie.
              <div
                key={i}
                className="my-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
              >
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr>
                      {naglowki.map((komorka, k) => (
                        <th
                          key={k}
                          className="border-b border-border bg-card px-3 py-2.5 text-left align-top font-semibold text-foreground"
                        >
                          {inline(komorka)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reszta.map((wiersz, w) => (
                      <tr key={w}>
                        {wiersz.map((komorka, k) => (
                          <td
                            key={k}
                            className="border-b border-border px-3 py-2.5 align-top"
                          >
                            {inline(komorka)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
      })}
    </article>
  );
}
