/**
 * PROBNE (weryfikacja naprawy) — pętla wywiadu z akumulacją „obsluzoneId".
 * Odwzorowuje NAPRAWIONY przepływ: pipeline filtruje pytania po `obsluzone`,
 * a tailor-flow kumuluje id wszystkich pokazanych pytań między rundami.
 * Rewrite stubowany (identity/reorder) — konwergencja nie zależy od AI.
 * Uruchom: npx tsx scripts/probne-petla-fix.ts
 */
import type { TailoredCv } from "../src/lib/cv-schema";
import { sampleCvs, sampleCv } from "../src/lib/sample-cv";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { dopasuj } from "../src/lib/ai/matching";
import { ocenCv } from "../src/lib/ai/scoring";
import {
  zbudujPytania,
  zbudujPytaniaOMetryki,
  zastosujOdpowiedzi,
  type PytanieWywiadu,
  type OdpowiedzWywiadu,
} from "../src/lib/ai/interview";
import type { ParsedOferta, Wymaganie } from "../src/lib/ai/job-offer";

function wym(
  id: string,
  tekst: string,
  slowa: string[],
  rodzaj: Wymaganie["rodzaj"] = "twarda",
  priorytet: Wymaganie["priorytet"] = "wymagane"
): Wymaganie {
  return { id, tekst, cytat: tekst, rodzaj, priorytet, slowa_kluczowe: slowa };
}

const ofertaFrontend: ParsedOferta = {
  stanowisko: "Frontend Developer",
  firma: "TestCo",
  poziom: "mid",
  branza: "IT",
  ton: "neutralny",
  wymagania: [
    wym("W1", "React", ["React"]),
    wym("W2", "Docker", ["Docker"], "twarda", "mile_widziane"),
    wym("W3", "GraphQL", ["GraphQL"]),
    wym("W4", "Kubernetes", ["Kubernetes"]),
    wym("W5", "Mentoring juniorów", ["mentoring"], "miekka"),
  ],
};

type RewriteStub = (cv: TailoredCv) => TailoredCv;
const rewriteIdentity: RewriteStub = (cv) => structuredClone(cv);
const rewriteReorder: RewriteStub = (cv) => {
  const c = structuredClone(cv);
  c.skills.technical = [...c.skills.technical].reverse();
  return c;
};

type AnswerStrat = (p: PytanieWywiadu) => OdpowiedzWywiadu;
const answMamBezLiczby: AnswerStrat = (p) => ({
  id: p.id,
  ma: true,
  szczegol: "Zajmowałem się tym regularnie w codziennej pracy zespołu produktowego.",
});
const answNieMam: AnswerStrat = (p) => ({ id: p.id, ma: false });
const answMamZLiczba: AnswerStrat = (p) => ({
  id: p.id,
  ma: true,
  szczegol: p.cel
    ? "Zredukowałem czas obsługi zgłoszeń o 30% w skali roku."
    : "Wdrażałem to w projekcie przez 2 lata z dobrym skutkiem.",
});

let bledy = 0;

function symuluj(
  nazwa: string,
  baza: TailoredCv,
  oferta: ParsedOferta,
  rewrite: RewriteStub,
  answer: AnswerStrat,
  rundy = 6
) {
  console.log(`\n===== ${nazwa} =====`);
  console.log("runda | #pyt | powt. | before→after | odniesienie(oryginał)");

  const oryginal = structuredClone(baza); // stałe odniesienie „przed" (jak w naprawie)
  const dopOryginal = dopasuj(oferta, buildLedgerFromCv(oryginal));
  const wynikOryginalu = ocenCv(oryginal, dopOryginal).wynik;

  let cv = structuredClone(baza); // baza kolejnej rundy = wzbogacone CV
  const obsluzone = new Set<string>(); // AKUMULACJA między rundami (naprawa)
  let poprzednieZnaki = new Set<string>();
  let zbiegloDo0 = false;

  for (let r = 1; r <= rundy; r++) {
    const tailored = rewrite(cv);
    const dopAfter = dopasuj(oferta, buildLedgerFromCv(tailored));
    const ocenaAfter = ocenCv(tailored, dopAfter).wynik;

    // NAPRAWA: „before" liczony względem ORYGINAŁU (skumulowana poprawa).
    const before = wynikOryginalu;

    // NAPRAWA: pytania filtrowane po obsłużonych.
    const pytania = [
      ...zbudujPytania(dopAfter.luki),
      ...zbudujPytaniaOMetryki(tailored),
    ]
      .filter((p) => !obsluzone.has(p.id))
      .slice(0, 5);

    const znaki = new Set(pytania.map((p) => p.id));
    let powt = 0;
    for (const z of znaki) if (poprzednieZnaki.has(z)) powt++;

    console.log(
      `  ${r}   |  ${String(pytania.length).padStart(2)}  |  ${String(powt).padStart(2)}   |  ${String(before).padStart(3)} → ${String(ocenaAfter).padStart(3)}   |  ${wynikOryginalu}`
    );

    if (powt > 0) {
      console.log(`  ✗ BŁĄD: ${powt} pytań się powtórzyło mimo filtrowania`);
      bledy++;
    }

    if (pytania.length === 0) {
      console.log("  → pytania zbiegły do 0. ✓");
      zbiegloDo0 = true;
      break;
    }

    // tailor-flow: wszystkie pokazane pytania → obsłużone; potem odpowiedzi.
    pytania.forEach((p) => obsluzone.add(p.id));
    const odpowiedzi = pytania.map(answer);
    cv = zastosujOdpowiedzi(tailored, pytania, odpowiedzi);
    poprzednieZnaki = znaki;
  }

  if (!zbiegloDo0) {
    console.log("  ✗ BŁĄD: pętla NIE zbiegła do 0 w limicie rund");
    bledy++;
  }
}

const anna = sampleCv;
symuluj("Anna / identity / Mam+bezLiczby", anna, ofertaFrontend, rewriteIdentity, answMamBezLiczby);
symuluj("Anna / identity / NieMam", anna, ofertaFrontend, rewriteIdentity, answNieMam);
symuluj("Anna / identity / Mam+liczba", anna, ofertaFrontend, rewriteIdentity, answMamZLiczba);
symuluj("Anna / reorder / Mam+bezLiczby", anna, ofertaFrontend, rewriteReorder, answMamBezLiczby);
symuluj("Marta(marketing) / identity / NieMam", sampleCvs[1].cv, ofertaFrontend, rewriteIdentity, answNieMam);
symuluj("Marta(marketing) / identity / Mam+bezLiczby", sampleCvs[1].cv, ofertaFrontend, rewriteIdentity, answMamBezLiczby);

// Test deduplikacji: wielokrotne „Mam+ten sam szczegół" nie mnoży punktów.
console.log("\n===== Dedup punktów z wywiadu =====");
{
  const p: PytanieWywiadu = {
    id: "W3", typ: "doswiadczenie", pytanie: "?", hint: "", slowa: ["GraphQL"], wazne: true,
  };
  const odp: OdpowiedzWywiadu = { id: "W3", ma: true, szczegol: "Robiłem to samo zadanie wielokrotnie w pracy." };
  let cv = structuredClone(anna);
  const przedIle = cv.experience[0].bullets.length;
  cv = zastosujOdpowiedzi(cv, [p], [odp]);
  cv = zastosujOdpowiedzi(cv, [p], [odp]);
  cv = zastosujOdpowiedzi(cv, [p], [odp]);
  const dodane = cv.experience[0].bullets.length - przedIle;
  console.log(`  dopięto punktów po 3× tym samym szczególe: ${dodane} (oczekiwane 1)`);
  if (dodane !== 1) { console.log("  ✗ BŁĄD: duplikaty nie zdeduplikowane"); bledy++; }
  else console.log("  ✓ dedup działa");
}

console.log(`\n==== WYNIK: ${bledy === 0 ? "wszystko OK ✓" : bledy + " błędów ✗"} ====`);
process.exit(bledy === 0 ? 0 : 1);
