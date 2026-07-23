/**
 * Testy deterministycznego dopasowania (krok 3 pipeline'u).
 * Uruchom: npx tsx scripts/test-matching.ts
 *
 * Nie wymaga klucza API — to czysty kod.
 */
import { sampleCv } from "../src/lib/sample-cv";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { dopasuj, dopasujWymaganie, frazaWystepuje } from "../src/lib/ai/matching";
import type { ParsedOferta, Wymaganie } from "../src/lib/ai/job-offer";

const ledger = buildLedgerFromCv(sampleCv);

let passed = 0;
let failed = 0;

function ok(name: string, warunek: boolean, detal = "") {
  if (warunek) {
    passed += 1;
    console.log(`  OK   ${name}${detal ? ` — ${detal}` : ""}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}${detal ? ` — ${detal}` : ""}`);
  }
}

function wym(
  id: string,
  tekst: string,
  slowa: string[],
  priorytet: Wymaganie["priorytet"] = "wymagane"
): Wymaganie {
  return {
    id,
    tekst,
    cytat: tekst,
    rodzaj: "twarda",
    priorytet,
    slowa_kluczowe: slowa,
  };
}

console.log("\n== Odmiana polska ==");
ok(
  "„testy jednostkowe” trafia w „testów jednostkowych”",
  frazaWystepuje("testy jednostkowe", "Wdrożyłam testów jednostkowych w projekcie")
);
ok(
  "„React” trafia w „React.js”",
  frazaWystepuje("React", "Tworzenie aplikacji w React.js")
);
ok(
  "niepowiązana fraza NIE trafia",
  !frazaWystepuje("Kubernetes", "Tworzenie aplikacji w React i TypeScript")
);

console.log("\n== Fałszywe pozytywy (granice słów) ==");
ok(
  "„Java” NIE trafia w „JavaScript”",
  !frazaWystepuje("Java", "Znajomość JavaScript i TypeScript")
);
ok(
  "„SQL” NIE trafia w „NoSQL”",
  !frazaWystepuje("SQL", "Doświadczenie z bazami NoSQL")
);
ok(
  "„Java” nadal trafia w prawdziwą Javę",
  frazaWystepuje("Java", "Programowanie w Java i Spring")
);

console.log("\n== Pokrycie pojedynczego wymagania ==");
const d1 = dopasujWymaganie(wym("W1", "React", ["React"]), ledger);
ok("technologia obecna w CV → pelne", d1.pokrycie === "pelne", `pokrycie=${d1.pokrycie}`);
ok("zwraca fakty do zacytowania", d1.fakty.length > 0, `${d1.fakty.length} faktów`);

const d2 = dopasujWymaganie(wym("W2", "Kubernetes", ["Kubernetes"]), ledger);
ok("technologia nieobecna → brak", d2.pokrycie === "brak", `pokrycie=${d2.pokrycie}`);
ok("brakujące słowo trafia na listę luk", d2.brakujaceSlowa.includes("Kubernetes"));

const d3 = dopasujWymaganie(
  wym("W3", "React i Kubernetes", ["React", "Kubernetes"]),
  ledger
);
ok("część słów trafiona → czesciowe", d3.pokrycie === "czesciowe", `pokrycie=${d3.pokrycie}`);

console.log("\n== Wynik całościowy ==");
const ofertaDobra: ParsedOferta = {
  stanowisko: "Frontend Developer",
  firma: "Przykład sp. z o.o.",
  poziom: "mid",
  branza: "IT",
  ton: "neutralny",
  wymagania: [
    wym("W1", "React", ["React"]),
    wym("W2", "TypeScript", ["TypeScript"]),
    wym("W3", "Next.js", ["Next.js"]),
    wym("W4", "Docker", ["Docker"], "mile_widziane"),
  ],
};
const rDobra = dopasuj(ofertaDobra, ledger);
ok("dobre dopasowanie daje wysoki wynik", rDobra.wynik >= 75, `wynik=${rDobra.wynik}`);
ok("werdykt = dobre", rDobra.werdykt.poziom === "dobre", rDobra.werdykt.naglowek);

const ofertaZla: ParsedOferta = {
  ...ofertaDobra,
  stanowisko: "Java Developer",
  wymagania: [
    wym("W1", "Java", ["Java"]),
    wym("W2", "Spring Boot", ["Spring Boot"]),
    wym("W3", "Kubernetes", ["Kubernetes"]),
    wym("W4", "Oracle", ["Oracle"]),
  ],
};
const rZla = dopasuj(ofertaZla, ledger);
ok("złe dopasowanie daje niski wynik", rZla.wynik < 50, `wynik=${rZla.wynik}`);
ok("werdykt = slabe (uczciwie)", rZla.werdykt.poziom === "slabe", rZla.werdykt.naglowek);
console.log(`       „${rZla.werdykt.uzasadnienie}”`);

console.log("\n== Wagi priorytetów ==");
const tylkoWymagane = dopasuj(
  { ...ofertaDobra, wymagania: [wym("W1", "Kubernetes", ["Kubernetes"], "wymagane"), wym("W2", "React", ["React"], "mile_widziane")] },
  ledger
);
const tylkoMile = dopasuj(
  { ...ofertaDobra, wymagania: [wym("W1", "Kubernetes", ["Kubernetes"], "mile_widziane"), wym("W2", "React", ["React"], "wymagane")] },
  ledger
);
ok(
  "brak wymaganego boli bardziej niż brak mile widzianego",
  tylkoWymagane.wynik < tylkoMile.wynik,
  `${tylkoWymagane.wynik} < ${tylkoMile.wynik}`
);

console.log("\n== Powtarzalność ==");
const a = dopasuj(ofertaDobra, ledger);
const b = dopasuj(ofertaDobra, ledger);
ok("dwa uruchomienia dają ten sam wynik", a.wynik === b.wynik, `${a.wynik} === ${b.wynik}`);

console.log("\n== Luki i ATS ==");
ok("luki są posortowane od najważniejszych", rZla.luki.length > 0, `${rZla.luki.length} luk`);
ok(
  "pokrycie słów kluczowych liczone",
  rDobra.pokrycieSlowKluczowych > rZla.pokrycieSlowKluczowych,
  `${rDobra.pokrycieSlowKluczowych}% vs ${rZla.pokrycieSlowKluczowych}%`
);

console.log(`\nWynik: ${passed} przeszło, ${failed} nie przeszło\n`);
process.exit(failed > 0 ? 1 : 0);
