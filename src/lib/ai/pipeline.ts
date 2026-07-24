import type { TailoredCv } from "@/lib/cv-schema";
import type { AiMeta } from "@/lib/store";
import { buildLedgerFromCv, type FactLedger } from "./fact-ledger";
import { parsujOferte, type ParsedOferta } from "./job-offer";
import { dopasuj, type WynikDopasowania } from "./matching";
import { przepiszCv, zlozCv } from "./rewrite";
import { validateAgainstLedger, type Violation } from "./validator";
import { opiszZmiany, zbudujWskazowki } from "./changes";
import { zbudujPytania, type PytanieWywiadu } from "./interview";

/**
 * Pełny przebieg dopasowania CV do oferty.
 *
 *  1. ogłoszenie → wymagania           (AI, tani model)
 *  2. CV → rejestr faktów              (kod)
 *  3. dopasowanie fakt ↔ wymaganie     (kod)  ← to jest zarazem plan zmian
 *  4. przepisanie CV                   (AI, mocny model)
 *  5. walidacja anty-halucynacyjna     (kod)
 *  6. wynik „po” tym samym miernikiem  (kod)  ← poprawa zmierzona, nie deklarowana
 *  7. opis zmian z realnego diffa      (kod)
 */

export type WynikPipeline = {
  jobTitle: string;
  oferta: ParsedOferta;
  tailoredCv: TailoredCv;
  aiMeta: AiMeta;
  /** Pytania wywiadu do luk — do opcjonalnego wzmocnienia CV. */
  pytania: PytanieWywiadu[];
  /** Naruszenia odrzucone przez walidator — do diagnostyki i logów. */
  odrzucone: Violation[];
  diagnostyka: {
    czasMs: number;
    tokenyWejscie: number;
    tokenyWyjscie: number;
  };
};

/**
 * Cofa do oryginału te fragmenty, które nie przeszły walidacji.
 *
 * Nie odrzucamy całego CV z powodu jednego wymyślonego punktu — wracamy tylko
 * do oryginalnego brzmienia tego fragmentu. Użytkownik dostaje przerobione CV
 * bez zmyśleń, zamiast komunikatu o błędzie.
 */
function naprawCv(
  przerobione: TailoredCv,
  oryginal: TailoredCv,
  naruszenia: Violation[]
): TailoredCv {
  if (naruszenia.length === 0) return przerobione;
  const wynik: TailoredCv = structuredClone(przerobione);

  for (const n of naruszenia) {
    if (n.field === "professional_summary") {
      wynik.professional_summary = oryginal.professional_summary;
      continue;
    }
    const exp = /^experience\[(\d+)\]\.bullets\[(\d+)\]$/.exec(n.field);
    if (exp) {
      const [i, j] = [Number(exp[1]), Number(exp[2])];
      const zrodlo = oryginal.experience[i]?.bullets[j];
      if (zrodlo !== undefined && wynik.experience[i]) {
        wynik.experience[i].bullets[j] = zrodlo;
      }
      continue;
    }
    const proj = /^projects\[(\d+)\]\.bullets\[(\d+)\]$/.exec(n.field);
    if (proj) {
      const [i, j] = [Number(proj[1]), Number(proj[2])];
      const zrodlo = oryginal.projects[i]?.bullets[j];
      if (zrodlo !== undefined && wynik.projects[i]) {
        wynik.projects[i].bullets[j] = zrodlo;
      }
      continue;
    }
    // Cokolwiek innego — sekcje twarde wracają do oryginału w całości.
    wynik.skills = oryginal.skills;
    wynik.education = oryginal.education;
    wynik.languages = oryginal.languages;
    wynik.personal_info = oryginal.personal_info;
  }
  return wynik;
}

/** Tytuł pozycji w historii — ze sparsowanej oferty, nie z heurystyki. */
function tytulDopasowania(oferta: ParsedOferta): string {
  return oferta.firma
    ? `${oferta.stanowisko} — ${oferta.firma}`
    : oferta.stanowisko;
}

export async function uruchomDopasowanie(
  baseCv: TailoredCv,
  trescOferty: string
): Promise<WynikPipeline> {
  const start = Date.now();
  let tokenyWejscie = 0;
  let tokenyWyjscie = 0;

  // 1-3. Oferta, fakty, dopasowanie przed zmianami.
  const { oferta, zuzycie: zuzycieOferty } = await parsujOferte(trescOferty);
  tokenyWejscie += zuzycieOferty.wejscie;
  tokenyWyjscie += zuzycieOferty.wyjscie;

  const ledger: FactLedger = buildLedgerFromCv(baseCv);
  const przed: WynikDopasowania = dopasuj(oferta, ledger);

  // 4. Przepisanie — model dostaje wyłącznie fakty i plan.
  const { przepisanie, zuzycie: zuzycieCv } = await przepiszCv(
    ledger,
    oferta,
    przed
  );
  tokenyWejscie += zuzycieCv.wejscie;
  tokenyWyjscie += zuzycieCv.wyjscie;

  let tailoredCv = zlozCv(baseCv, przepisanie);

  // 5. Walidacja i naprawa. Rejestr faktów pochodzi z ORYGINAŁU — to on jest
  //    źródłem prawdy, a nie to, co model właśnie napisał.
  const walidacja = validateAgainstLedger(tailoredCv, ledger);
  tailoredCv = naprawCv(tailoredCv, baseCv, walidacja.violations);

  // 6. Wynik „po” liczony tym samym miernikiem co „przed”.
  const po = dopasuj(oferta, buildLedgerFromCv(tailoredCv));

  // 7. Opis zmian z rzeczywistej różnicy.
  const changesLog = opiszZmiany(baseCv, tailoredCv, oferta, po);
  const findings = zbudujWskazowki(oferta, po, changesLog.length);

  const addedKeywords = [
    ...new Set(
      po.dopasowania
        .filter((d) => d.pokrycie !== "brak")
        .flatMap((d) => d.trafioneSlowa)
    ),
  ];

  return {
    jobTitle: tytulDopasowania(oferta),
    oferta,
    tailoredCv,
    pytania: zbudujPytania(po.luki),
    aiMeta: {
      matchScoreBefore: przed.wynik,
      matchScoreAfter: po.wynik,
      addedKeywords,
      changesLog,
      findings,
      unlocked: false,
    },
    odrzucone: walidacja.violations,
    diagnostyka: {
      czasMs: Date.now() - start,
      tokenyWejscie,
      tokenyWyjscie,
    },
  };
}
