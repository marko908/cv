/**
 * PROBNE NA ŻYWO — weryfikacja straży słów kluczowych + podłogi wyniku.
 * Cel: żaden przypadek nie może dać wyniku NIŻSZEGO niż CV wejściowe.
 * Testuje pary, które w raporcie v3 spadały (pielęgniarka 82→66) lub mocno
 * skakały, plus kontrole pozytywne (poprawa nadal możliwa).
 * Uruchom: node --env-file=.env.local --import tsx scripts/probne-live-podloga.ts
 */
import { PARY } from "./dane-testowe";
import { uruchomDopasowanie } from "../src/lib/ai/pipeline";
import { czyAiDostepne } from "../src/lib/ai/models";

let LICZNIK = 0;
let bledy = 0;

// Pary z raportu v3: spadek / duży swing / kontrola.
const WYBRANE = [
  "Ewa(pielęgniarka) → Pielęgniarka (krótka)", // spadał 82→66
  "Ola(UX) → UX/UI Designer",                   // skakał 70→85
  "Michał(sprzedaż) → Sales Rep (EN)",          // 56→64
  "Damian(kucharz) → Kucharz (krótka)",         // krótka oferta
  "Krzysztof(produkcja) → Operator CNC",        // krótka oferta
  "Joanna(admin) → Biuro (proza, bez sekcji)",  // oferta-proza
  "Anna → Frontend React",                      // kontrola: dobre
  "Tomasz(senior) → Senior Java",               // kontrola: idealne, długa
  "Marta(marketing) → DevOps",                  // kontrola: mismatch
  "EDGE: prawie puste CV → oferta krótka",      // edge: 9→19
];

async function main() {
  if (!czyAiDostepne()) { console.error("BRAK KLUCZA"); process.exit(1); }

  console.log("Para | przed | po | Δ | werdykt");
  console.log("-".repeat(70));

  for (const nazwa of WYBRANE) {
    const para = PARY.find((p) => p.nazwa === nazwa);
    if (!para) { console.log(`  ? nie znaleziono pary: ${nazwa}`); continue; }

    LICZNIK++;
    const w = await uruchomDopasowanie(para.cv, para.oferta);
    const przed = w.aiMeta.matchScoreBefore ?? 0;
    const po = w.aiMeta.matchScoreAfter ?? 0;
    const delta = po - przed;
    const spadek = po < przed;
    if (spadek) bledy++;

    console.log(
      `${nazwa}\n   ${String(przed).padStart(3)} → ${String(po).padStart(3)}  Δ=${delta >= 0 ? "+" : ""}${delta}  ${spadek ? "✗ SPADEK (podłoga nie zadziałała!)" : "✓ brak spadku"}`
    );

    // pauza pod limit per-minutę
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("-".repeat(70));
  console.log(`Przebiegi AI: ${LICZNIK}`);
  console.log(bledy === 0
    ? "==== WSZYSTKO OK: żaden przypadek nie obniżył wyniku ✓ ===="
    : `==== ${bledy} SPADKÓW ✗ ====`);
  process.exit(bledy === 0 ? 0 : 1);
}
main().catch((e) => { console.error("BŁĄD:", e); process.exit(1); });
