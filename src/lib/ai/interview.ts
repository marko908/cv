import type { TailoredCv } from "@/lib/cv-schema";
import { digitsIn } from "./fact-ledger";
import type { DopasowanieWymagania } from "./matching";

/**
 * WYWIAD — dopytywanie o brakujące konkrety.
 *
 * Gdy dopasowanie znajduje lukę (oferta czegoś wymaga, w CV tego nie ma),
 * AI nie zmyśla — PYTA użytkownika. Odpowiedź „tak, mam to” staje się nowym
 * faktem, więc CV może legalnie zawierać więcej, a wynik rośnie UCZCIWIE.
 *
 * To rozwiązuje dwie rzeczy naraz:
 *  - płaski wynik dobrze dopasowanego CV (użytkownik może go realnie podnieść),
 *  - obie ścieżki produktu: tworzenie od zera i wgrane CV z brakami.
 *
 * Pytania budujemy w KODZIE z treści luki — bez AI, więc bez halucynacji
 * i bez kosztu. Model nie wymyśla pytań o kompetencje, których oferta
 * nie wymaga.
 */

export type PytanieWywiadu = {
  id: string;
  /**
   * Rodzaj pytania — zmienia framing i miejsce docelowe:
   *  - „doswiadczenie": twarda kompetencja, pytamy o realne doświadczenie,
   *    potwierdzenie może dać punkt w doświadczeniu;
   *  - „cecha": kompetencja miękka / postawa, to NIE doświadczenie — pytamy,
   *    czy kandydat chce ją wskazać, i trafia tylko do umiejętności miękkich.
   */
  typ: "doswiadczenie" | "cecha";
  pytanie: string;
  /** Podpowiedź, co wpisać (tylko dla „doswiadczenie"). */
  hint: string;
  /** Słowa kluczowe z oferty, które to pytanie pokrywa. */
  slowa: string[];
  /** Priorytet wymagania — pytamy najpierw o wymagane. */
  wazne: boolean;
  /**
   * Cel pytania o metrykę: konkretny punkt doświadczenia, który po odpowiedzi
   * ZASTĘPUJEMY wersją z liczbą (a nie dopisujemy obok). Ustawiane tylko dla
   * pytań o kwantyfikację.
   */
  cel?: { exp: number; bullet: number };
};

export type OdpowiedzWywiadu = {
  id: string;
  /** Czy użytkownik potwierdził, że ma tę kompetencję. */
  ma: boolean;
  /** Opcjonalny konkret w słowach użytkownika (np. „testy w Jest, 2 lata”). */
  szczegol?: string;
};

/**
 * Tworzy pytania z luk dopasowania.
 *
 * Pytamy tylko o luki, na które użytkownik może sensownie odpowiedzieć —
 * czyli o kompetencje twarde i miękkie. Wymagań formalnych (wykształcenie,
 * poziom języka) nie „dopytujemy”, bo tego się nie nadrabia deklaracją.
 *
 * Framing zależy od rodzaju wymagania. Kompetencji twardej dotyczy pytanie
 * o doświadczenie („czy masz doświadczenie z X”). Cechy/postawy nie pytamy
 * o doświadczenie — bo „chęć do dzielenia się wiedzą” to nie doświadczenie,
 * tylko coś, co kandydat może chcieć w CV wskazać.
 */
export function zbudujPytania(luki: DopasowanieWymagania[]): PytanieWywiadu[] {
  return luki
    .filter(
      (l) =>
        l.pokrycie === "brak" &&
        (l.wymaganie.rodzaj === "twarda" || l.wymaganie.rodzaj === "miekka")
    )
    .map((l) => {
      const t = l.wymaganie.tekst.trim();
      const twarda = l.wymaganie.rodzaj === "twarda";
      const slowa =
        l.wymaganie.slowa_kluczowe.filter(Boolean).length > 0
          ? l.wymaganie.slowa_kluczowe.filter(Boolean)
          : [t];

      return {
        id: l.wymaganie.id,
        typ: twarda ? ("doswiadczenie" as const) : ("cecha" as const),
        pytanie: twarda
          ? `Czy masz doświadczenie z tym: „${t}”?`
          : `Czy chcesz wskazać w CV: „${t}”?`,
        hint: twarda
          ? "Jeśli tak, opisz krótko — gdzie i jak długo (np. w projekcie X). Jeśli nie, pomiń."
          : "",
        slowa,
        wazne: l.wymaganie.priorytet === "wymagane",
      };
    });
}

/** Czy wśród luk jest o co pytać. */
export function czyWartoWywiad(luki: DopasowanieWymagania[]): boolean {
  return zbudujPytania(luki).length > 0;
}

/** Krótki podgląd punktu (do treści pytania). */
function skrot(tekst: string, max = 60): string {
  const t = tekst.trim();
  return t.length <= max ? t : t.slice(0, max).trim() + "…";
}

/**
 * Pytania o KWANTYFIKACJĘ — najmocniejszy element CV to konkretna liczba
 * (RUB-07). Znajdujemy istotne punkty doświadczenia BEZ liczby i pytamy, czy
 * kandydat potrafi je uściślić metryką. To nie zmyślanie: liczbę podaje sam
 * użytkownik, a my zastępujemy nią mętny punkt.
 *
 * Pytamy tylko o dwie najnowsze pozycje (najistotniejsze) i maksymalnie o trzy
 * punkty, żeby nie przytłoczyć.
 */
export function zbudujPytaniaOMetryki(cv: TailoredCv): PytanieWywiadu[] {
  const pytania: PytanieWywiadu[] = [];
  const maxPozycje = Math.min(2, cv.experience.length);

  for (let e = 0; e < maxPozycje && pytania.length < 3; e++) {
    const exp = cv.experience[e];
    exp.bullets.forEach((b, j) => {
      if (pytania.length >= 3) return;
      const tekst = (b ?? "").trim();
      // Istotny punkt bez liczby — kandydat do wzmocnienia metryką.
      if (tekst.length < 25) return;
      if (digitsIn(tekst).length > 0) return;
      pytania.push({
        id: `metryka-${e}-${j}`,
        typ: "doswiadczenie",
        pytanie: `Czy możesz dodać konkretną liczbę do: „${skrot(tekst)}”?`,
        hint: 'Podaj cały punkt z liczbą — np. „Skróciłem czas obsługi o 30%” albo „Obsługiwałem 500 zgłoszeń miesięcznie”. Jeśli nie masz liczby, pomiń.',
        slowa: [],
        wazne: false,
        cel: { exp: e, bullet: j },
      });
    });
  }

  return pytania;
}

function dodajUnikalne(lista: string[], nowe: string[]): string[] {
  const zbior = new Set(lista.map((s) => s.toLowerCase().trim()));
  const wynik = [...lista];
  for (const n of nowe) {
    if (n.trim() && !zbior.has(n.toLowerCase().trim())) {
      wynik.push(n.trim());
      zbior.add(n.toLowerCase().trim());
    }
  }
  return wynik;
}

/**
 * Nakłada potwierdzone odpowiedzi na CV.
 *
 * To NIE jest zmyślanie: dodajemy wyłącznie to, co użytkownik sam potwierdził
 * jako swoje. Potwierdzona kompetencja trafia do umiejętności (dzięki temu
 * dopasowanie ją zaliczy), a opcjonalny konkret — jako punkt do najnowszego
 * doświadczenia, w słowach użytkownika.
 *
 * Zwraca KOPIĘ CV — nie nadpisujemy oryginału bez zgody użytkownika.
 */
export function zastosujOdpowiedzi(
  cv: TailoredCv,
  pytania: PytanieWywiadu[],
  odpowiedzi: OdpowiedzWywiadu[]
): TailoredCv {
  const wynik: TailoredCv = structuredClone(cv);
  const poId = new Map(pytania.map((p) => [p.id, p]));

  const noweTech: string[] = [];
  const noweMiekkie: string[] = [];
  const noweBullety: string[] = [];

  for (const odp of odpowiedzi) {
    if (!odp.ma) continue;
    const p = poId.get(odp.id);
    if (!p) continue;

    // Pytanie o metrykę: ZASTĘPUJEMY konkretny punkt wersją z liczbą podaną
    // przez użytkownika (nie dopisujemy obok, żeby nie dublować treści).
    if (p.cel) {
      const szczegol = odp.szczegol?.trim();
      const poz = wynik.experience[p.cel.exp];
      if (szczegol && szczegol.length >= 10 && poz?.bullets[p.cel.bullet] !== undefined) {
        poz.bullets[p.cel.bullet] = szczegol;
      }
      continue;
    }

    if (p.typ === "doswiadczenie") {
      // Twarda kompetencja: do umiejętności technicznych, a konkret (jeśli
      // podany) jako punkt doświadczenia w słowach użytkownika.
      noweTech.push(...p.slowa);
      const szczegol = odp.szczegol?.trim();
      if (szczegol && szczegol.length >= 10) noweBullety.push(szczegol);
    } else {
      // Cecha/postawa: tylko do umiejętności miękkich. NIE robimy z niej
      // punktu doświadczenia — to nie jest osiągnięcie zawodowe.
      noweMiekkie.push(...p.slowa);
    }
  }

  wynik.skills.technical = dodajUnikalne(wynik.skills.technical, noweTech);
  wynik.skills.soft_and_tools = dodajUnikalne(
    wynik.skills.soft_and_tools,
    noweMiekkie
  );

  // Konkrety z wywiadu dopinamy do najnowszej pozycji doświadczenia.
  if (noweBullety.length > 0 && wynik.experience.length > 0) {
    wynik.experience[0] = {
      ...wynik.experience[0],
      bullets: [...wynik.experience[0].bullets, ...noweBullety],
    };
  }

  return wynik;
}
