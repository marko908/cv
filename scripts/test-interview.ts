/**
 * Testy wywiadu (bez AI — czysty kod). Uruchom: npx tsx scripts/test-interview.ts
 */
import { sampleCv } from "../src/lib/sample-cv";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { dopasuj } from "../src/lib/ai/matching";
import {
  zbudujPytania,
  czyWartoWywiad,
  zastosujOdpowiedzi,
} from "../src/lib/ai/interview";
import type { ParsedOferta, Wymaganie } from "../src/lib/ai/job-offer";

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
  rodzaj: Wymaganie["rodzaj"] = "twarda",
  priorytet: Wymaganie["priorytet"] = "wymagane"
): Wymaganie {
  return { id, tekst, cytat: tekst, rodzaj, priorytet, slowa_kluczowe: slowa };
}

const oferta: ParsedOferta = {
  stanowisko: "Frontend Developer",
  firma: "X",
  poziom: "mid",
  branza: "IT",
  ton: "neutralny",
  wymagania: [
    wym("W1", "React", ["React"]),
    wym("W2", "Docker", ["Docker"], "twarda", "mile_widziane"),
    wym("W3", "GraphQL", ["GraphQL"]),
    wym("W4", "Wykształcenie wyższe kierunkowe", ["wyższe"], "formalna"),
    wym("W5", "Chęć do dzielenia się wiedzą", ["dzielenia się wiedzą"], "miekka"),
  ],
};

const ledger = buildLedgerFromCv(sampleCv);
const przed = dopasuj(oferta, ledger);

console.log(`\nWynik przed wywiadem: ${przed.wynik}/100`);

console.log("\n== Budowa pytań ==");
const pytania = zbudujPytania(przed.luki);
ok("są pytania, skoro są luki", pytania.length > 0, `${pytania.length} pytań`);
ok(
  "pytamy o Docker i GraphQL",
  pytania.some((p) => p.slowa.includes("Docker")) &&
    pytania.some((p) => p.slowa.includes("GraphQL"))
);
ok(
  "NIE pytamy o wymaganie formalne (wykształcenie)",
  !pytania.some((p) => p.slowa.includes("wyższe"))
);
ok("czyWartoWywiad = true", czyWartoWywiad(przed.luki));

console.log("\n== Framing: doświadczenie vs cecha ==");
const pTwarde = pytania.find((p) => p.slowa.includes("GraphQL"));
const pMiekkie = pytania.find((p) => p.slowa.includes("dzielenia się wiedzą"));
ok("twarda kompetencja = typ doswiadczenie", pTwarde?.typ === "doswiadczenie");
ok(
  "twarde pytanie mówi o doświadczeniu",
  /doświadczenie/i.test(pTwarde?.pytanie ?? "")
);
ok("cecha = typ cecha", pMiekkie?.typ === "cecha");
ok(
  "pytanie o cechę NIE mówi o doświadczeniu",
  !/doświadczenie/i.test(pMiekkie?.pytanie ?? ""),
  pMiekkie?.pytanie
);
ok(
  "pytanie o cechę mówi o wskazaniu w CV",
  /wskazać w CV/i.test(pMiekkie?.pytanie ?? "")
);

console.log("\n== Cecha trafia do umiejętności miękkich, NIE do doświadczenia ==");
const cvCecha = zastosujOdpowiedzi(sampleCv, pytania, [
  { id: "W5", ma: true, szczegol: "to jest ignorowane dla cechy bo bez pola" },
]);
ok(
  "cecha w umiejętnościach miękkich",
  cvCecha.skills.soft_and_tools.some((s) => /dzielenia się wiedzą/i.test(s))
);
ok(
  "cecha NIE trafia jako punkt doświadczenia",
  !cvCecha.experience[0].bullets.some((b) => /dzielenia się wiedzą/i.test(b))
);
ok(
  "cecha NIE ląduje w umiejętnościach technicznych",
  !cvCecha.skills.technical.some((s) => /dzielenia się wiedzą/i.test(s))
);

console.log("\n== Potwierdzenie podnosi wynik UCZCIWIE ==");
const cvPo = zastosujOdpowiedzi(sampleCv, pytania, [
  {
    id: "W3",
    ma: true,
    szczegol: "Budowałam API w GraphQL w projekcie panelu analitycznego",
  },
]);
ok(
  "GraphQL trafił do umiejętności",
  cvPo.skills.technical.some((s) => s.toLowerCase() === "graphql")
);
ok(
  "konkret trafił jako punkt doświadczenia",
  cvPo.experience[0].bullets.some((b) => /GraphQL/i.test(b))
);

const po = dopasuj(oferta, buildLedgerFromCv(cvPo));
ok("wynik wzrósł po potwierdzeniu", po.wynik > przed.wynik, `${przed.wynik} → ${po.wynik}`);

console.log("\n== 'Nie mam' niczego nie dodaje ==");
const cvNie = zastosujOdpowiedzi(sampleCv, pytania, [{ id: "W3", ma: false }]);
ok(
  "brak potwierdzenia = brak GraphQL w CV",
  !cvNie.skills.technical.some((s) => s.toLowerCase() === "graphql")
);
const poNie = dopasuj(oferta, buildLedgerFromCv(cvNie));
ok("wynik bez zmian gdy 'nie mam'", poNie.wynik === przed.wynik, `${poNie.wynik}`);

console.log("\n== Nie nadpisujemy oryginału ==");
ok(
  "oryginalne CV nietknięte",
  !sampleCv.skills.technical.some((s) => s.toLowerCase() === "graphql")
);

console.log(`\nWynik: ${passed} przeszło, ${failed} nie przeszło\n`);
process.exit(failed > 0 ? 1 : 0);
