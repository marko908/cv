/**
 * Parser lekkiej składni dokumentów prawnych — bez Reacta, bez JSX.
 *
 * Wydzielony z `components/prawne/dokument-prawny.tsx`, żeby ta sama logika
 * służyła DWÓM rendererom: stronie WWW (HTML) i PDF-owi dołączanemu do maili
 * potwierdzających (`components/prawne/regulamin-pdf.tsx`, react-pdf). Gdyby
 * każdy miał własny parser, zmiana składni w jednym miejscu (np. nowy rodzaj
 * bloku) cicho przestałaby działać w drugim — a rozjazd wyszedłby dopiero
 * przy porównaniu wygenerowanego PDF-a z tym, co widać na stronie.
 *
 * DLACZEGO NIE MARKDOWN Z BIBLIOTEKI: dokumenty prawne mają NUMERACJĘ, która
 * jest częścią ich treści — cały regulamin odsyła do „§ 1 ust. 5 pkt 1".
 * Automatyczne listy numerowałyby pozycje same, więc wstawienie jednego
 * ustępu po cichu przesunęłoby wszystkie odesłania w dokumencie. Tutaj numer
 * jest DOSŁOWNIE tym, co stoi w źródle.
 *
 * Obsługiwana składnia (pełen opis w `lib/prawne/regulamin.ts`):
 *   #, ##, ###   nagłówki
 *   „1. tekst"   ustęp (poziom 0)
 *   „   1) …"    punkt (3 spacje wcięcia, poziom 1)
 *   „      a) …" litera (6 spacji wcięcia, poziom 2)
 *   „| a | b |"  wiersz tabeli; pierwszy z serii to nagłówek
 *   **pogrubienie**, [etykieta](/sciezka)
 */

export type Blok =
  | { typ: "naglowek"; poziom: 1 | 2 | 3; tekst: string }
  | { typ: "akapit"; tekst: string }
  | { typ: "pozycja"; poziom: 0 | 1 | 2; znacznik: string; tekst: string }
  | { typ: "tabela"; wiersze: string[][] };

const NAGLOWEK = /^(#{1,3})\s+(.*)$/;
const WIERSZ_TABELI = /^\|(.+)\|\s*$/;
/** „1." albo „12)" albo „a)" — poziom wynika z wcięcia, nie z rodzaju znacznika. */
const POZYCJA = /^(\s*)(\d+\.|\d+\)|[a-ząćęłńóśźż]\))\s+(.*)$/;

export function parsujDokument(zrodlo: string): Blok[] {
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

export type FragmentInline =
  | { typ: "tekst"; tresc: string }
  | { typ: "pogrubienie"; tresc: string }
  | { typ: "link"; etykieta: string; adres: string };

/** Rozbija tekst na pogrubienia/linki/zwykły tekst — bez Reacta i bez HTML. */
export function rozbijInline(tekst: string): FragmentInline[] {
  return tekst
    .split(INLINE)
    .filter(Boolean)
    .map((fragment): FragmentInline => {
      if (fragment.startsWith("**") && fragment.endsWith("**")) {
        return { typ: "pogrubienie", tresc: fragment.slice(2, -2) };
      }
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(fragment);
      if (link) {
        const [, etykieta, adres] = link;
        return { typ: "link", etykieta, adres };
      }
      return { typ: "tekst", tresc: fragment };
    });
}
