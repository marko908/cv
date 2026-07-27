/**
 * PROBNE (weryfikacja naprawy) — changes.ts: koniec z fantomami.
 * Sprawdza, że kosmetyka nie jest raportowana, opis kolejności skilli jest
 * prawdziwy, a realne zmiany/dodania nadal są łapane.
 * Uruchom: npx tsx scripts/probne-zmiany-fix.ts
 */
import type { TailoredCv } from "../src/lib/cv-schema";
import { sampleCv } from "../src/lib/sample-cv";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { dopasuj } from "../src/lib/ai/matching";
import { opiszZmiany } from "../src/lib/ai/changes";
import type { ParsedOferta, Wymaganie } from "../src/lib/ai/job-offer";

function wym(id: string, tekst: string, slowa: string[]): Wymaganie {
  return { id, tekst, cytat: tekst, rodzaj: "twarda", priorytet: "wymagane", slowa_kluczowe: slowa };
}
const oferta: ParsedOferta = {
  stanowisko: "Frontend Developer", firma: "X", poziom: "mid", branza: "IT", ton: "neutralny",
  wymagania: [wym("W1", "React", ["React"]), wym("W2", "TypeScript", ["TypeScript"])],
};

let bledy = 0;
function log(przed: TailoredCv, po: TailoredCv) {
  return opiszZmiany(przed, po, oferta, dopasuj(oferta, buildLedgerFromCv(po)));
}
function ok(warunek: boolean, opis: string, detal = "") {
  console.log(`  ${warunek ? "✓" : "✗"} ${opis}${detal ? ` — ${detal}` : ""}`);
  if (!warunek) bledy++;
}

console.log("== Fantomy (kosmetyka NIE powinna być raportowana) ==");
{
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  b.professional_summary = b.professional_summary.replace(/\.$/, "");
  ok(log(a, b).length === 0, "usunięta kropka w podsumowaniu → 0 zmian", `${log(a, b).length}`);
}
{
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  b.experience[0].bullets[1] = b.experience[0].bullets[1].replace(".", "!");
  ok(log(a, b).length === 0, "kropka → wykrzyknik → 0 zmian", `${log(a, b).length}`);
}
{
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  b.experience[0].bullets[2] = "  " + b.experience[0].bullets[2] + "   ";
  ok(log(a, b).length === 0, "same spacje → 0 zmian", `${log(a, b).length}`);
}

console.log("\n== Kolejność skilli — opis musi być PRAWDZIWY ==");
{
  // React/TS na początku → odwracamy → idą NA KONIEC. NIE raportować „w górę".
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  a.skills.technical = ["React", "TypeScript", "Git", "REST API"];
  b.skills.technical = ["Git", "REST API", "TypeScript", "React"];
  const l = log(a, b);
  const twierdziGore = l.some((z) => z.section === "Umiejętności");
  ok(!twierdziGore, "wymagane zjechały w dół → NIE raportujemy ruchu w górę", twierdziGore ? "KŁAMSTWO" : "");
}
{
  // React/TS na końcu → przesuwamy na początek. Raportować z nazwami.
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  a.skills.technical = ["Git", "REST API", "React", "TypeScript"];
  b.skills.technical = ["React", "TypeScript", "Git", "REST API"];
  const l = log(a, b);
  const wpis = l.find((z) => z.section === "Umiejętności");
  ok(!!wpis, "wymagane poszły w górę → raportujemy");
  ok(!!wpis && /React/.test(wpis.change) && /TypeScript/.test(wpis.change),
    "opis wymienia realnie przesunięte skille", wpis?.change ?? "");
}

console.log("\n== Realne zmiany nadal łapane ==");
{
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  b.experience[0].bullets[0] = "Wdrożyłem aplikację B2B w React dla 12 tys. użytkowników miesięcznie.";
  const l = log(a, b);
  ok(l.some((z) => z.section.startsWith("Doświadczenie")), "realne przeredagowanie bulleta → raportowane");
}
{
  // Dodany punkt (np. z wywiadu) — „co dodaliśmy".
  const a = structuredClone(sampleCv), b = structuredClone(sampleCv);
  b.experience[0].bullets = [...b.experience[0].bullets, "Prowadziłem code review dla zespołu 5 osób."];
  const l = log(a, b);
  const wpis = l.find((z) => z.section.startsWith("Doświadczenie"));
  ok(!!wpis && /dodali[śs]my/i.test(wpis.change), "dodany punkt → raportowane jako 'dodaliśmy'", wpis?.change ?? "");
}

console.log(`\n==== WYNIK: ${bledy === 0 ? "wszystko OK ✓" : bledy + " błędów ✗"} ====`);
process.exit(bledy === 0 ? 0 : 1);
