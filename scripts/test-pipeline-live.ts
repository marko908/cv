/**
 * Test NA ŻYWO całego pipeline'u: oferta → dopasowanie → przepisane CV.
 * Uruchom: npm run test:pipeline
 *
 * Pokazuje CV przed i po, wynik przed i po, oraz realny koszt wywołania.
 */
import { uruchomDopasowanie } from "../src/lib/ai/pipeline";
import { sampleCv } from "../src/lib/sample-cv";
import { czyAiDostepne, MODEL_MOCNY, MODEL_TANI } from "../src/lib/ai/models";

const OGLOSZENIE = `Frontend Developer (React)
Netguru sp. z o.o. — Warszawa / zdalnie

Szukamy Frontend Developera do zespołu pracującego nad aplikacjami webowymi
dla klientów z sektora finansowego.

Wymagania:
- Minimum 3 lata doświadczenia komercyjnego w React
- Bardzo dobra znajomość TypeScript
- Doświadczenie w optymalizacji wydajności aplikacji
- Znajomość języka angielskiego na poziomie min. B2
- Umiejętność pracy w metodykach zwinnych

Mile widziane:
- Znajomość Next.js
- Doświadczenie z Docker

Oferujemy: umowę B2B lub UoP, pracę hybrydową, budżet szkoleniowy.`;

// Cennik z 2026-07 (USD za 1M tokenów) — do orientacyjnego kosztu.
const CENA = { wejscie: 1.5, wyjscie: 7.5 };
const KURS_PLN = 3.7;

async function main() {
  if (!czyAiDostepne()) {
    console.error("\nBRAK KLUCZA w cv-copilot/.env.local\n");
    process.exit(1);
  }

  console.log(`\nModele: ${MODEL_TANI} (parsowanie) + ${MODEL_MOCNY} (przepisanie)`);
  console.log("Uruchamiam pełne dopasowanie...\n");

  const w = await uruchomDopasowanie(sampleCv, OGLOSZENIE);

  console.log(`Gotowe w ${(w.diagnostyka.czasMs / 1000).toFixed(1)}s`);
  console.log(`Oferta: ${w.jobTitle}\n`);

  console.log(`  WYNIK: ${w.aiMeta.matchScoreBefore} → ${w.aiMeta.matchScoreAfter} /100\n`);

  console.log("  === PODSUMOWANIE ZAWODOWE ===");
  console.log(`  PRZED: ${sampleCv.professional_summary}`);
  console.log(`  PO:    ${w.tailoredCv.professional_summary}\n`);

  console.log("  === DOŚWIADCZENIE (punkty) ===");
  sampleCv.experience.forEach((exp, i) => {
    console.log(`  ${exp.role} @ ${exp.company}`);
    exp.bullets.forEach((b, j) => {
      const po = w.tailoredCv.experience[i]?.bullets[j];
      if (po && po.trim() !== b.trim()) {
        console.log(`    PRZED: ${b}`);
        console.log(`    PO:    ${po}`);
      } else {
        console.log(`    (bez zmian): ${b}`);
      }
    });
    console.log();
  });

  console.log("  === UMIEJĘTNOŚCI (kolejność) ===");
  console.log(`  PRZED: ${sampleCv.skills.technical.join(", ")}`);
  console.log(`  PO:    ${w.tailoredCv.skills.technical.join(", ")}\n`);

  console.log("  === CO ZMIENILIŚMY ===");
  for (const z of w.aiMeta.changesLog) {
    console.log(`  • ${z.section}`);
    console.log(`    ${z.change}`);
    console.log(`    Dlaczego: ${z.reason}`);
  }

  console.log("\n  === WALIDATOR ===");
  if (w.odrzucone.length === 0) {
    console.log("  OK — model nie próbował dopisać niczego spoza CV.");
  } else {
    console.log(`  Odrzucono ${w.odrzucone.length} naruszeń (cofnięto do oryginału):`);
    for (const v of w.odrzucone) {
      console.log(`   ! [${v.kind}] ${v.field}: „${v.offending}”`);
    }
  }

  // Kontrola niezależna od walidatora: czy dane twarde zostały nietknięte.
  console.log("\n  === KONTROLA DANYCH TWARDYCH ===");
  const bledy: string[] = [];
  sampleCv.experience.forEach((e, i) => {
    const p = w.tailoredCv.experience[i];
    if (p?.company !== e.company) bledy.push(`firma[${i}]`);
    if (p?.role !== e.role) bledy.push(`stanowisko[${i}]`);
    if (p?.period !== e.period) bledy.push(`okres[${i}]`);
  });
  if (JSON.stringify(w.tailoredCv.education) !== JSON.stringify(sampleCv.education))
    bledy.push("edukacja");
  if (JSON.stringify(w.tailoredCv.languages) !== JSON.stringify(sampleCv.languages))
    bledy.push("języki");
  if (JSON.stringify(w.tailoredCv.personal_info) !== JSON.stringify(sampleCv.personal_info))
    bledy.push("dane osobowe");
  console.log(
    bledy.length === 0
      ? "  OK — firmy, stanowiska, okresy, edukacja i języki nietknięte."
      : `  BŁĄD — zmieniono: ${bledy.join(", ")}`
  );

  const { tokenyWejscie: we, tokenyWyjscie: wy } = w.diagnostyka;
  const usd = (we / 1e6) * CENA.wejscie + (wy / 1e6) * CENA.wyjscie;
  console.log("\n  === REALNY KOSZT ===");
  console.log(`  Tokeny: ${we} wejście + ${wy} wyjście`);
  console.log(`  Koszt:  ${usd.toFixed(4)} $ ≈ ${(usd * KURS_PLN).toFixed(3)} zł`);
  console.log();
}

main().catch((e) => {
  console.error("\nBŁĄD:", e instanceof Error ? e.message : e);
  process.exit(1);
});
