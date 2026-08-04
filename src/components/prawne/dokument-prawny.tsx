/**
 * Renderer dokumentów prawnych (regulamin, polityka prywatności, regulamin
 * newslettera) z lekkiej składni tekstowej do JSX.
 *
 * DLACZEGO NIE MARKDOWN Z BIBLIOTEKI: dokumenty prawne mają NUMERACJĘ, która
 * jest częścią ich treści — cały regulamin odsyła do „§ 1 ust. 5 pkt 1".
 * Automatyczne listy (`<ol>`) numerowałyby pozycje same, więc wstawienie
 * jednego ustępu po cichu przesunęłoby wszystkie odesłania w dokumencie.
 * Tutaj numer jest DOSŁOWNIE tym, co stoi w źródle — nigdy nie rozjedzie się
 * z odesłaniami.
 *
 * Obsługiwana składnia (pełen opis w `lib/prawne/regulamin.ts`):
 *   #, ##, ###   nagłówki
 *   „1. tekst"   ustęp (poziom 0)
 *   „   1) …"    punkt (3 spacje wcięcia, poziom 1)
 *   „      a) …" litera (6 spacji wcięcia, poziom 2)
 *   „| a | b |"  wiersz tabeli; pierwszy z serii to nagłówek
 *   **pogrubienie**, [etykieta](/sciezka)
 */

import Link from "next/link";
import type { ReactNode } from "react";

type Blok =
  | { typ: "naglowek"; poziom: 1 | 2 | 3; tekst: string }
  | { typ: "akapit"; tekst: string }
  | { typ: "pozycja"; poziom: 0 | 1 | 2; znacznik: string; tekst: string }
  | { typ: "tabela"; wiersze: string[][] };

const NAGLOWEK = /^(#{1,3})\s+(.*)$/;
const WIERSZ_TABELI = /^\|(.+)\|\s*$/;
/** „1." albo „12)" albo „a)" — poziom wynika z wcięcia, nie z rodzaju znacznika. */
const POZYCJA = /^(\s*)(\d+\.|\d+\)|[a-ząćęłńóśźż]\))\s+(.*)$/;

function parsuj(zrodlo: string): Blok[] {
  const bloki: Blok[] = [];

  for (const linia of zrodlo.split("\n")) {
    if (!linia.trim()) continue;

    const naglowek = NAGLOWEK.exec(linia);
    if (naglowek) {
      bloki.push({
        typ: "naglowek",
        poziom: naglowek[1].length as 1 | 2 | 3,
        tekst: naglowek[2].trim(),
      });
      continue;
    }

    const wiersz = WIERSZ_TABELI.exec(linia);
    if (wiersz) {
      const komorki = wiersz[1].split("|").map((k) => k.trim());
      const ostatni = bloki[bloki.length - 1];
      // Kolejne wiersze dokleja się do tabeli otwartej bezpośrednio wyżej —
      // pusta linia między wierszami rozbiłaby tabelę na dwie.
      if (ostatni?.typ === "tabela") ostatni.wiersze.push(komorki);
      else bloki.push({ typ: "tabela", wiersze: [komorki] });
      continue;
    }

    const pozycja = POZYCJA.exec(linia);
    if (pozycja) {
      const wciecie = pozycja[1].length;
      bloki.push({
        typ: "pozycja",
        poziom: Math.min(2, Math.floor(wciecie / 3)) as 0 | 1 | 2,
        znacznik: pozycja[2],
        tekst: pozycja[3].trim(),
      });
      continue;
    }

    bloki.push({ typ: "akapit", tekst: linia.trim() });
  }

  return bloki;
}

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Pogrubienia i linki. Linki wewnętrzne idą przez `next/link`. */
function inline(tekst: string): ReactNode[] {
  return tekst.split(INLINE).filter(Boolean).map((fragment, i) => {
    if (fragment.startsWith("**") && fragment.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {fragment.slice(2, -2)}
        </strong>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(fragment);
    if (link) {
      const [, etykieta, adres] = link;
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

    return <span key={i}>{fragment}</span>;
  });
}

/** Wcięcie pozycji listy. Marker ma stałą szerokość, żeby tekst się wyrównywał. */
const WCIECIE = ["", "pl-6 sm:pl-8", "pl-12 sm:pl-16"] as const;
const SZEROKOSC_MARKERA = ["w-9", "w-8", "w-7"] as const;

export function DokumentPrawny({ zrodlo }: { zrodlo: string }) {
  const bloki = parsuj(zrodlo);

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
