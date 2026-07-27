/**
 * PROBNE — pomiar realnego zużycia tokenów per przebieg, z rozbiciem na modele.
 * Kroki 1-4 pipeline (parsowanie oferty = TANI, przepisanie = MOCNY).
 * Uruchom: node --env-file=.env.local --import tsx scripts/probne-koszt.ts
 */
import { PARY } from "./dane-testowe";
import { parsujOferte } from "../src/lib/ai/job-offer";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { dopasuj } from "../src/lib/ai/matching";
import { przepiszCv } from "../src/lib/ai/rewrite";
import { czyAiDostepne } from "../src/lib/ai/models";

// Ceny wg użytkownika (USD za 1 mln tokenów)
const CENA = {
  tani: { in: 0.25, out: 1.5 },   // gemini-3.1-flash-lite
  mocny: { in: 1.5, out: 7.5 },   // gemini-3.6-flash
};

const WYBRANE = [
  "Ewa(pielęgniarka) → Pielęgniarka (krótka)", // oferta krótka
  "Anna → Frontend React",                      // oferta średnia
  "Tomasz(senior) → Senior Java",               // oferta długa
  "Wojciech(PM) → Project Manager (EN długa)",  // oferta bardzo długa EN
];

type Wiersz = {
  nazwa: string;
  taniIn: number; taniOut: number;
  mocnyIn: number; mocnyOut: number;
  usd: number;
};

async function main() {
  if (!czyAiDostepne()) { console.error("BRAK KLUCZA"); process.exit(1); }
  const wiersze: Wiersz[] = [];

  for (const nazwa of WYBRANE) {
    const para = PARY.find((p) => p.nazwa === nazwa);
    if (!para) continue;

    // Krok 1 — parsowanie oferty (MODEL_TANI)
    const { oferta, zuzycie: zO } = await parsujOferte(para.oferta);
    // Kroki 2-3 — kod (0 tokenów)
    const ledger = buildLedgerFromCv(para.cv);
    const przed = dopasuj(oferta, ledger);
    // Krok 4 — przepisanie (MODEL_MOCNY)
    const { zuzycie: zC } = await przepiszCv(ledger, oferta, przed);

    const usd =
      (zO.wejscie / 1e6) * CENA.tani.in +
      (zO.wyjscie / 1e6) * CENA.tani.out +
      (zC.wejscie / 1e6) * CENA.mocny.in +
      (zC.wyjscie / 1e6) * CENA.mocny.out;

    wiersze.push({
      nazwa, taniIn: zO.wejscie, taniOut: zO.wyjscie,
      mocnyIn: zC.wejscie, mocnyOut: zC.wyjscie, usd,
    });
    console.log(`OK: ${nazwa}`);
    await new Promise((r) => setTimeout(r, 2500));
  }

  console.log("\n=== ZUŻYCIE TOKENÓW PER PRZEBIEG ===");
  console.log("Para | flash-lite in/out | 3.6-flash in/out | USD | PLN(4.0)");
  for (const w of wiersze) {
    console.log(
      `${w.nazwa}\n   lite: ${w.taniIn}/${w.taniOut}   flash: ${w.mocnyIn}/${w.mocnyOut}   $${w.usd.toFixed(5)}   ${(w.usd * 4).toFixed(4)} zł`
    );
  }

  const n = wiersze.length;
  const sr = (f: (w: Wiersz) => number) => wiersze.reduce((s, w) => s + f(w), 0) / n;
  const srUsd = sr((w) => w.usd);
  console.log("\n=== ŚREDNIA ===");
  console.log(`flash-lite: ${Math.round(sr((w) => w.taniIn))} in / ${Math.round(sr((w) => w.taniOut))} out`);
  console.log(`3.6-flash:  ${Math.round(sr((w) => w.mocnyIn))} in / ${Math.round(sr((w) => w.mocnyOut))} out`);
  console.log(`RAZEM tokenów: ${Math.round(sr((w) => w.taniIn + w.mocnyIn))} in / ${Math.round(sr((w) => w.taniOut + w.mocnyOut))} out`);
  console.log(`KOSZT: $${srUsd.toFixed(5)} = ${(srUsd * 4).toFixed(4)} zł (kurs 4,00)`);
  console.log(`\nRe-run z cache oferty (bez parsowania): $${(srUsd - (sr((w) => w.taniIn) / 1e6 * CENA.tani.in + sr((w) => w.taniOut) / 1e6 * CENA.tani.out)).toFixed(5)}`);
}
main().catch((e) => { console.error("BŁĄD:", e); process.exit(1); });
