/**
 * Test NA ŻYWO: parsowanie prawdziwego ogłoszenia (krok 2) + dopasowanie (krok 3).
 * Uruchom: npm run test:oferta
 *
 * Wymaga klucza w .env.local. Skrypt nigdy nie wypisuje klucza — tylko wynik.
 */
import { parsujOferte } from "../src/lib/ai/job-offer";
import { dopasuj } from "../src/lib/ai/matching";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { sampleCv } from "../src/lib/sample-cv";
import { czyAiDostepne, MODEL_TANI } from "../src/lib/ai/models";

// Realistyczne polskie ogłoszenie — celowo z sekcjami „wymagania” i „mile widziane”.
const OGLOSZENIE = `Frontend Developer (React)
Netguru sp. z o.o. — Warszawa / zdalnie

Szukamy Frontend Developera do zespołu pracującego nad aplikacjami webowymi
dla klientów z sektora finansowego.

Wymagania:
- Minimum 3 lata doświadczenia komercyjnego w React
- Bardzo dobra znajomość TypeScript
- Doświadczenie w pisaniu testów jednostkowych
- Znajomość języka angielskiego na poziomie min. B2
- Umiejętność pracy w metodykach zwinnych

Mile widziane:
- Znajomość Next.js
- Doświadczenie z Docker
- Znajomość GraphQL

Oferujemy: umowę B2B lub UoP, pracę hybrydową, budżet szkoleniowy.`;

async function main() {
  if (!czyAiDostepne()) {
    console.error(
      "\nBRAK KLUCZA. Dodaj do cv-copilot/.env.local jedną z linii:\n" +
        "  AI_GATEWAY_API_KEY=...\n" +
        "  GOOGLE_GENERATIVE_AI_API_KEY=...\n"
    );
    process.exit(1);
  }

  console.log(`\nModel: ${MODEL_TANI}`);
  console.log("Parsuję ogłoszenie...\n");

  const start = Date.now();
  const oferta = await parsujOferte(OGLOSZENIE);
  const czas = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`Sparsowano w ${czas}s\n`);
  console.log(`  Stanowisko: ${oferta.stanowisko}`);
  console.log(`  Firma:      ${oferta.firma || "(nie podano)"}`);
  console.log(`  Poziom:     ${oferta.poziom}`);
  console.log(`  Branża:     ${oferta.branza}`);
  console.log(`  Ton:        ${oferta.ton}`);
  console.log(`\n  Wymagania (${oferta.wymagania.length}):`);
  for (const w of oferta.wymagania) {
    const znacznik = w.priorytet === "wymagane" ? "!" : "~";
    console.log(`   ${znacznik} [${w.rodzaj}] ${w.tekst}`);
    console.log(`       słowa: ${w.slowa_kluczowe.join(", ")}`);
  }

  // Krok 3 — deterministyczne dopasowanie do przykładowego CV
  const ledger = buildLedgerFromCv(sampleCv);
  const wynik = dopasuj(oferta, ledger);

  console.log(`\n  === DOPASOWANIE ===`);
  console.log(`  Wynik: ${wynik.wynik}/100`);
  console.log(`  Pokrycie słów kluczowych (ATS): ${wynik.pokrycieSlowKluczowych}%`);
  console.log(`  Werdykt: ${wynik.werdykt.naglowek}`);
  console.log(`           ${wynik.werdykt.uzasadnienie}`);

  console.log(`\n  Pokryte:`);
  for (const d of wynik.dopasowania.filter((x) => x.pokrycie === "pelne")) {
    const zrodla = d.fakty.slice(0, 2).map((f) => f.path ?? f.id).join(", ");
    console.log(`   + ${d.wymaganie.tekst}  ← ${zrodla}`);
  }

  console.log(`\n  Luki (materiał na wywiad):`);
  for (const d of wynik.luki) {
    console.log(
      `   - ${d.wymaganie.tekst} [${d.wymaganie.priorytet}] brakuje: ${d.brakujaceSlowa.join(", ")}`
    );
  }

  // Kontrola jakości parsowania: czy cytaty są DOSŁOWNE
  console.log(`\n  === KONTROLA CYTATÓW ===`);
  const zmyslone = oferta.wymagania.filter(
    (w) => !OGLOSZENIE.toLowerCase().includes(w.cytat.toLowerCase().trim())
  );
  if (zmyslone.length === 0) {
    console.log("  OK — wszystkie cytaty występują dosłownie w ogłoszeniu.");
  } else {
    console.log(`  UWAGA — ${zmyslone.length} cytatów NIE jest dosłownych:`);
    for (const w of zmyslone) console.log(`   ! „${w.cytat}”`);
  }
  console.log();
}

main().catch((e) => {
  console.error("\nBŁĄD:", e instanceof Error ? e.message : e);
  process.exit(1);
});
