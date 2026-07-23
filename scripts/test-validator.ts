/**
 * Testy walidatora anty-halucynacyjnego.
 * Uruchom: npx tsx scripts/test-validator.ts
 *
 * Najważniejszy test to pierwszy: CV musi przejść walidację względem samego
 * siebie. Gdyby walidator zgłaszał tu naruszenia, byłby bezużyteczny
 * (fałszywe alarmy blokowałyby poprawne treści).
 */
import { sampleCv } from "../src/lib/sample-cv";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { validateAgainstLedger } from "../src/lib/ai/validator";
import type { TailoredCv } from "../src/lib/cv-schema";

const ledger = buildLedgerFromCv(sampleCv);

let passed = 0;
let failed = 0;

function test(
  name: string,
  mutate: (cv: TailoredCv) => TailoredCv,
  expectKind: string | null
) {
  const cv = mutate(structuredClone(sampleCv));
  const res = validateAgainstLedger(cv, ledger);
  const kinds = res.violations.map((v) => v.kind);
  const ok = expectKind === null ? res.ok : kinds.includes(expectKind as never);

  if (ok) {
    passed += 1;
    console.log(`  OK   ${name}`);
    if (expectKind && res.violations.length) {
      const v = res.violations.find((x) => x.kind === expectKind)!;
      console.log(`       -> ${v.field}: ${v.detail}`);
    }
  } else {
    failed += 1;
    console.log(`  FAIL ${name}`);
    console.log(`       oczekiwano: ${expectKind ?? "brak naruszeń"}`);
    console.log(`       otrzymano:  ${kinds.join(", ") || "brak"}`);
    for (const v of res.violations.slice(0, 5)) {
      console.log(`       - ${v.kind} @ ${v.field}: ${v.offending}`);
    }
  }
}

console.log(`\nRejestr faktów: ${ledger.facts.length} faktów, ` +
  `${ledger.allowedDigits.size} dozwolonych liczb\n`);

console.log("== Brak fałszywych alarmów ==");
test("oryginalne CV przechodzi walidację względem samego siebie", (cv) => cv, null);

test(
  "przeformułowanie bez nowych faktów jest dozwolone",
  (cv) => {
    // te same fakty, inne słowa - dokładnie to, co AI ma prawo robić
    cv.professional_summary =
      "Frontend Developer z doświadczeniem w React i TypeScript.";
    return cv;
  },
  null
);

console.log("\n== Wykrywanie halucynacji ==");

test(
  "wymyślona metryka w punkcie doświadczenia",
  (cv) => {
    cv.experience[0].bullets.push("Zwiększyłem sprzedaż o 87% w pierwszym kwartale");
    return cv;
  },
  "wymyslona_liczba"
);

test(
  "dopisana technologia, której użytkownik nie zna",
  (cv) => {
    cv.skills.technical.push("Kubernetes");
    return cv;
  },
  "wymyslona_umiejetnosc"
);

test(
  "wymyślony pracodawca",
  (cv) => {
    cv.experience[0].company = "Google";
    return cv;
  },
  "wymyslona_firma"
);

test(
  "zawyżone stanowisko",
  (cv) => {
    cv.experience[0].role = "Head of Engineering";
    return cv;
  },
  "wymyslone_stanowisko"
);

test(
  "podniesiony poziom języka",
  (cv) => {
    cv.languages = cv.languages.map((l) =>
      l.toLowerCase().includes("angielski") ? "angielski – C2" : l
    );
    return cv;
  },
  "podniesiony_poziom_jezyka"
);

test(
  "frazes dopisany przez model",
  (cv) => {
    cv.professional_summary +=
      " Jestem dynamiczny, zmotywowany i otwarty na nowe wyzwania.";
    return cv;
  },
  "frazes"
);

console.log(`\nWynik: ${passed} przeszło, ${failed} nie przeszło\n`);
process.exit(failed > 0 ? 1 : 0);
