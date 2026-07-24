import type { TailoredCv } from "@/lib/cv-schema";
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
  pytanie: string;
  /** Podpowiedź, co wpisać w odpowiedzi. */
  hint: string;
  /** Słowa kluczowe z oferty, które to pytanie pokrywa. */
  slowa: string[];
  /** Gdzie trafi potwierdzona kompetencja. */
  sekcja: "techniczne" | "miekkie";
  /** Priorytet wymagania — pytamy najpierw o wymagane. */
  wazne: boolean;
};

export type OdpowiedzWywiadu = {
  id: string;
  /** Czy użytkownik potwierdził, że ma tę kompetencję. */
  ma: boolean;
  /** Opcjonalny konkret w słowach użytkownika (np. „testy w Jest, 2 lata”). */
  szczegol?: string;
};

/** Buduje naturalne pytanie z treści wymagania. */
function sformułuj(tekst: string): { pytanie: string; hint: string } {
  const t = tekst.trim();
  const niski = t.charAt(0).toLowerCase() + t.slice(1);
  return {
    pytanie: `Czy masz doświadczenie z tym: „${t}”?`,
    hint: `Jeśli tak, opisz krótko — gdzie i jak długo (np. w projekcie X, ${niski.split(" ").slice(0, 3).join(" ")}…). Jeśli nie, pomiń.`,
  };
}

/**
 * Tworzy pytania z luk dopasowania.
 *
 * Pytamy tylko o luki, na które użytkownik może sensownie odpowiedzieć —
 * czyli o kompetencje twarde i miękkie. Wymagań formalnych (wykształcenie,
 * poziom języka) nie „dopytujemy”, bo tego się nie nadrabia deklaracją.
 */
export function zbudujPytania(luki: DopasowanieWymagania[]): PytanieWywiadu[] {
  return luki
    .filter(
      (l) =>
        l.pokrycie === "brak" &&
        (l.wymaganie.rodzaj === "twarda" || l.wymaganie.rodzaj === "miekka")
    )
    .map((l) => {
      const { pytanie, hint } = sformułuj(l.wymaganie.tekst);
      return {
        id: l.wymaganie.id,
        pytanie,
        hint,
        slowa:
          l.wymaganie.slowa_kluczowe.filter(Boolean).length > 0
            ? l.wymaganie.slowa_kluczowe.filter(Boolean)
            : [l.wymaganie.tekst],
        sekcja:
          l.wymaganie.rodzaj === "twarda"
            ? ("techniczne" as const)
            : ("miekkie" as const),
        wazne: l.wymaganie.priorytet === "wymagane",
      };
    });
}

/** Czy wśród luk jest o co pytać. */
export function czyWartoWywiad(luki: DopasowanieWymagania[]): boolean {
  return zbudujPytania(luki).length > 0;
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

    if (p.sekcja === "techniczne") noweTech.push(...p.slowa);
    else noweMiekkie.push(...p.slowa);

    const szczegol = odp.szczegol?.trim();
    if (szczegol && szczegol.length >= 10) noweBullety.push(szczegol);
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
