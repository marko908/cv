/**
 * PORZĄDKOWANIE TREŚCI OGŁOSZENIA DO WYŚWIETLENIA.
 *
 * Ogłoszenie pobrane z linku (`fetch-oferta.ts`) to jeden ciąg tekstu: portale
 * trzymają opis w JSON-LD albo w HTML-u, z którego zostaje goła treść. Efekt
 * na ekranie to ściana liter, w której nie da się znaleźć wymagań - w kółko
 * „…zespołu.Szukamy…", „Wymagania:Minimum 10-letnie doświadczenie;Zaawansowana
 * znajomość…" (zgłoszone przez Marka 2026-09-02 na ofercie z rocketjobs.pl).
 *
 * Ten moduł NIE zmienia niczego w danych - działa wyłącznie przy renderowaniu.
 * Treść zapisana w rekordzie i wysyłana do modelu zostaje dokładnie taka, jaka
 * przyszła ze strony; tu tylko odzyskujemy strukturę, którą portal miał
 * w HTML-u, a której nie da się już odtworzyć co do znaku. Ma być czytelnie,
 * nie idealnie.
 */

import { bezPauz } from "./utils";

export type BlokOferty =
  | { typ: "naglowek"; tekst: string }
  | { typ: "akapit"; tekst: string }
  | { typ: "lista"; pozycje: string[] };

/** Najdłuższy tekst, który uznajemy jeszcze za nagłówek sekcji, nie za zdanie. */
const MAX_NAGLOWEK = 70;

/**
 * Wstawia brakującą spację tam, gdzie koniec zdania skleił się z początkiem
 * następnego („utrzymanie.Jeżeli" → „utrzymanie. Jeżeli", „B2B.Zdrowie" →
 * „B2B. Zdrowie"). Pojedyncza wielka litera przed kropką to inicjał („J.
 * Kowalski"), więc tam nie ruszamy niczego.
 */
function rozklejZdania(tekst: string): string {
  return tekst.replace(
    /(?<!\b[A-ZĄĆĘŁŃÓŚŹŻ])([.?!])(?=[A-ZĄĆĘŁŃÓŚŹŻ])/g,
    "$1 "
  );
}

/** Koniec ostatniego zdania przed podanym miejscem (-1, gdy go nie ma). */
function koniecZdaniaPrzed(tekst: string): number {
  return Math.max(
    tekst.lastIndexOf(". "),
    tekst.lastIndexOf("? "),
    tekst.lastIndexOf("! "),
    tekst.lastIndexOf("\n")
  );
}

/**
 * Wiersz w rodzaju „Firma: TSS" - krótki klucz i krótka wartość. Zostaje
 * jednym akapitem, bo rozbicie go na nagłówek „Firma" i akapit „TSS" robi
 * z trzech linijek metadanych pół ekranu nagłówków.
 */
function czyWierszMetadanych(linia: string): boolean {
  return linia.length <= 90 && /^[^:]{2,30}:\s*\S.{0,60}$/.test(linia);
}

/**
 * Czy ten tekst wygląda na nagłówek sekcji ogłoszenia.
 *
 * Sam warunek długości nie wystarcza (krótkie zdanie to nie nagłówek), więc
 * wymagamy też, żeby nie kończył się kropką i nie miał w środku przecinka
 * z wyliczeniem.
 */
function czyNaglowek(tekst: string): boolean {
  const t = tekst.trim();
  return t.length >= 3 && t.length <= MAX_NAGLOWEK && !t.endsWith(".");
}

/**
 * Rozbija fragment „…jakiś wstęp. Wymagania: pierwsza pozycja" na trzy części.
 * Nagłówek liczymy od ostatniego końca zdania przed dwukropkiem, bo w jednym
 * ciągu potrafi stać całe zdanie i dopiero po nim tytuł sekcji.
 */
function rozbijNaglowek(fragment: string): {
  wstep?: string;
  naglowek?: string;
  reszta: string;
} {
  const dwukropek = fragment.indexOf(":");
  if (dwukropek === -1) return { reszta: fragment };

  const przed = fragment.slice(0, dwukropek);
  const po = fragment.slice(dwukropek + 1).trim();
  if (!po) return { reszta: fragment };

  const koniecZdania = koniecZdaniaPrzed(przed);
  const naglowek = przed.slice(koniecZdania + 1).trim();
  if (!czyNaglowek(naglowek)) return { reszta: fragment };

  const wstep = przed.slice(0, koniecZdania + 1).trim();
  return { wstep: wstep || undefined, naglowek, reszta: po };
}

/** Dokłada akapit, pomijając puste i osierocone znaki interpunkcyjne. */
function dodajAkapit(bloki: BlokOferty[], tekst: string): void {
  const t = tekst.trim();
  if (t.length > 1) bloki.push({ typ: "akapit", tekst: t });
}

/**
 * Zamienia surową treść ogłoszenia na bloki do wyrenderowania.
 * Zwraca pustą tablicę dla pustego wejścia.
 */
export function sformatujOferte(surowa: string): BlokOferty[] {
  const czysta = rozklejZdania(bezPauz(surowa).replace(/\r\n/g, "\n")).trim();
  if (!czysta) return [];

  const bloki: BlokOferty[] = [];

  for (const wiersz of czysta.split(/\n+/)) {
    const linia = wiersz.trim();
    if (!linia) continue;

    // Wiersz bez średników to zwykły akapit albo sam nagłówek sekcji.
    if (!linia.includes(";")) {
      if (czyWierszMetadanych(linia)) {
        dodajAkapit(bloki, linia);
        continue;
      }
      const { wstep, naglowek, reszta } = rozbijNaglowek(linia);
      if (naglowek) {
        if (wstep) dodajAkapit(bloki, wstep);
        bloki.push({ typ: "naglowek", tekst: naglowek });
        dodajAkapit(bloki, reszta);
      } else if (czyNaglowek(linia) && linia.endsWith(":")) {
        bloki.push({ typ: "naglowek", tekst: linia.slice(0, -1) });
      } else {
        dodajAkapit(bloki, linia);
      }
      continue;
    }

    /*
     * Średniki to w ogłoszeniach ślad po `<li>` - portal wypisał listę, a przy
     * zamianie na tekst zostały same separatory. Każdy kawałek staje się
     * pozycją listy, a jeśli w środku pozycji siedzi tytuł kolejnej sekcji
     * („…projektu. Wymagania: Minimum…"), zamykamy listę i otwieramy nową.
     */
    let pozycje: string[] = [];
    const zamknijListe = () => {
      if (pozycje.length > 0) {
        bloki.push({ typ: "lista", pozycje });
        pozycje = [];
      }
    };

    // Czy w tym wierszu padł już jakiś nagłówek - wtedy każdy kolejny kawałek
    // tekstu należy do sekcji, więc jest pozycją listy, a nie akapitem.
    let poNaglowku = false;

    for (const kawalek of linia.split(";")) {
      // Jeden kawałek potrafi zawierać kilka sekcji naraz („…B2B. Zdrowie pod
      // kontrolą: Dofinansowanie…"), dlatego skrobiemy go w pętli, aż zabraknie
      // tytułów do wydzielenia.
      let fragment = kawalek.trim();
      while (fragment) {
        const { wstep, naglowek, reszta } = rozbijNaglowek(fragment);
        if (!naglowek) {
          pozycje.push(fragment);
          break;
        }
        /*
         * Tekst przed tytułem nowej sekcji to zwykle DOMKNIĘCIE poprzedniej
         * listy („…kontrola realizacji projektu. Wymagania: Minimum…"), więc
         * dopisujemy go jako ostatnią pozycję, a nie jako osobny akapit -
         * inaczej ostatni punkt każdej sekcji wypadał z listy.
         */
        if (wstep) {
          if (pozycje.length > 0 || poNaglowku) pozycje.push(wstep);
          else dodajAkapit(bloki, wstep);
        }
        zamknijListe();
        bloki.push({ typ: "naglowek", tekst: naglowek });
        poNaglowku = true;
        fragment = reszta;
      }
    }
    zamknijListe();
  }

  return bloki;
}
