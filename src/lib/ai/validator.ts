import type { TailoredCv } from "@/lib/cv-schema";
import {
  digitsIn,
  normalize,
  type FactLedger,
} from "./fact-ledger";

/**
 * WALIDATOR ANTY-HALUCYNACYJNY.
 *
 * To jest kod, nie prompt. "Nie zmyślaj" w promptcie to prośba — model może
 * ją zignorować. Ten plik to gwarancja: cokolwiek AI wygeneruje, przechodzi
 * przez te sprawdzenia i wszystko, czego nie da się wyprowadzić z rejestru
 * faktów użytkownika, jest odrzucane.
 *
 * Reguła jest jedna: NIC w wyniku, czego nie ma w rejestrze.
 */

export type ViolationKind =
  | "wymyslona_liczba"
  | "wymyslona_umiejetnosc"
  | "wymyslona_firma"
  | "wymyslone_stanowisko"
  | "podniesiony_poziom_jezyka"
  | "frazes";

export type Violation = {
  kind: ViolationKind;
  /** Ścieżka pola w CV, np. experience[0].bullets[2] */
  field: string;
  /** Konkretny fragment, który narusza regułę. */
  offending: string;
  /** Wyjaśnienie po polsku — nadaje się do pokazania użytkownikowi. */
  detail: string;
};

export type ValidationResult = {
  ok: boolean;
  violations: Violation[];
};

/** Frazesy, które nic nie wnoszą do CV i zwykle są dopisywane przez model. */
const FRAZESY = [
  "dynamiczny",
  "zmotywowany",
  "kreatywny",
  "team player",
  "gracz zespolowy",
  "komunikatywny",
  "odporny na stres",
  "odpornosc na stres",
  "sumienny",
  "pracowity",
  "ambitny",
  "otwarty na nowe wyzwania",
  "chec do nauki",
  "zaangazowany",
  "profesjonalne podejscie",
  "wysoka kultura osobista",
  "praca pod presja czasu",
  // Dodane z syntezy poradników — puste deklaracje, które i tak weryfikuje
  // się na rozmowie, więc w CV nic nie wnoszą.
  "dyspozycyjny",
  "praca zespolowa",
  "obsluga komputera",
  "obsluga urzadzen biurowych",
  "dobra organizacja czasu pracy",
];

/** Poziomy językowe w kolejności rosnącej — nie wolno ich podnosić. */
const POZIOMY: Record<string, number> = {
  a1: 1,
  a2: 2,
  b1: 3,
  b2: 4,
  c1: 5,
  c2: 6,
  podstawowy: 1,
  komunikatywny: 3,
  "dobra znajomosc": 4,
  zaawansowany: 5,
  biegly: 6,
  ojczysty: 7,
  natywny: 7,
};

/** Zbiera wszystkie pola tekstowe CV wraz ze ścieżką. */
function textFields(cv: TailoredCv): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  const push = (path: string, text?: string) => {
    if (text && text.trim()) out.push({ path, text });
  };

  push("personal_info.title", cv.personal_info.title);
  push("professional_summary", cv.professional_summary);

  cv.experience.forEach((e, i) => {
    push(`experience[${i}].role`, e.role);
    push(`experience[${i}].company`, e.company);
    push(`experience[${i}].period`, e.period);
    e.bullets.filter(Boolean).forEach((b, j) => {
      push(`experience[${i}].bullets[${j}]`, b);
    });
  });

  cv.projects.forEach((p, i) => {
    push(`projects[${i}].name`, p.name);
    p.bullets.filter(Boolean).forEach((b, j) => {
      push(`projects[${i}].bullets[${j}]`, b);
    });
  });

  cv.skills.technical.filter(Boolean).forEach((s, i) => {
    push(`skills.technical[${i}]`, s);
  });
  cv.skills.soft_and_tools.filter(Boolean).forEach((s, i) => {
    push(`skills.soft_and_tools[${i}]`, s);
  });

  cv.education.forEach((e, i) => {
    push(`education[${i}].institution`, e.institution);
    push(`education[${i}].degree`, e.degree);
    push(`education[${i}].period`, e.period);
  });

  cv.languages.filter(Boolean).forEach((l, i) => push(`languages[${i}]`, l));

  return out;
}

/** Czy dana fraza występuje w rejestrze faktów użytkownika. */
function inLedger(ledger: FactLedger, phrase: string): boolean {
  const n = normalize(phrase);
  if (!n) return true;
  if (ledger.allowedEntities.has(n)) return true;
  return ledger.corpus.includes(n);
}

/** Wyciąga poziom językowy z wpisu typu "angielski – C1". */
function poziomJezyka(entry: string): { jezyk: string; rank: number } | null {
  const n = normalize(entry);
  const jezyk = n.split(/[-–—:,(]/)[0]?.trim() ?? "";
  let rank = 0;
  for (const [k, v] of Object.entries(POZIOMY)) {
    // szukamy poziomu jako osobnego tokenu, żeby "b1" nie łapało się w słowie
    const re = new RegExp(`(^|[^a-z0-9])${k}([^a-z0-9]|$)`);
    if (re.test(n) && v > rank) rank = v;
  }
  return jezyk ? { jezyk, rank } : null;
}

/**
 * Sprawdza przerobione CV względem rejestru faktów.
 * Zwraca listę naruszeń — pusta lista oznacza, że CV opiera się wyłącznie
 * na danych, które użytkownik faktycznie podał.
 */
export function validateAgainstLedger(
  cv: TailoredCv,
  ledger: FactLedger
): ValidationResult {
  const violations: Violation[] = [];

  for (const { path, text } of textFields(cv)) {
    // 1. Liczby — najgroźniejszy wektor halucynacji (wymyślone metryki).
    for (const d of digitsIn(text)) {
      if (!ledger.allowedDigits.has(d)) {
        violations.push({
          kind: "wymyslona_liczba",
          field: path,
          offending: d,
          detail: `Liczba „${d}” nie występuje nigdzie w danych podanych przez użytkownika. Nie wolno jej dodać do CV.`,
        });
      }
    }

    // 2. Frazesy — tylko jeśli użytkownik sam ich nie napisał.
    const n = normalize(text);
    for (const f of FRAZESY) {
      if (n.includes(f) && !ledger.corpus.includes(f)) {
        violations.push({
          kind: "frazes",
          field: path,
          offending: f,
          detail: `„${f}” to pusty frazes dopisany przez model - nie ma go w CV użytkownika i nic nie wnosi.`,
        });
      }
    }
  }

  // 3. Umiejętności — każda musi pochodzić z rejestru.
  [...cv.skills.technical, ...cv.skills.soft_and_tools]
    .filter(Boolean)
    .forEach((s) => {
      if (!inLedger(ledger, s)) {
        violations.push({
          kind: "wymyslona_umiejetnosc",
          field: "skills",
          offending: s,
          detail: `Umiejętność „${s}” nie została podana przez użytkownika. Dopisanie jej to kłamstwo w CV.`,
        });
      }
    });

  // 4. Firmy i stanowiska — nazwy własne nie podlegają twórczości.
  cv.experience.forEach((e, i) => {
    if (e.company && !inLedger(ledger, e.company)) {
      violations.push({
        kind: "wymyslona_firma",
        field: `experience[${i}].company`,
        offending: e.company,
        detail: `Firma „${e.company}” nie występuje w danych użytkownika.`,
      });
    }
    if (e.role && !inLedger(ledger, e.role)) {
      violations.push({
        kind: "wymyslone_stanowisko",
        field: `experience[${i}].role`,
        offending: e.role,
        detail: `Stanowisko „${e.role}” nie występuje w danych użytkownika - możliwe zawyżenie poziomu.`,
      });
    }
  });

  // 5. Języki — poziomu nie wolno podnosić.
  const zRejestru = new Map<string, number>();
  for (const f of ledger.facts) {
    if (f.type !== "jezyk") continue;
    const p = poziomJezyka(f.value);
    if (p) zRejestru.set(p.jezyk, Math.max(zRejestru.get(p.jezyk) ?? 0, p.rank));
  }
  cv.languages.filter(Boolean).forEach((l, i) => {
    const p = poziomJezyka(l);
    if (!p) return;
    const bazowy = zRejestru.get(p.jezyk);
    if (bazowy !== undefined && p.rank > bazowy) {
      violations.push({
        kind: "podniesiony_poziom_jezyka",
        field: `languages[${i}]`,
        offending: l,
        detail: `Podniesiono deklarowany poziom języka (${p.jezyk}). Użytkownik podał niższy - to zostanie zweryfikowane na rozmowie.`,
      });
    }
  });

  return { ok: violations.length === 0, violations };
}

/** Krótkie, czytelne podsumowanie naruszeń — do logów i panelu diagnostycznego. */
export function summarizeViolations(result: ValidationResult): string {
  if (result.ok) return "OK - CV opiera się wyłącznie na danych użytkownika.";
  const byKind = new Map<ViolationKind, number>();
  for (const v of result.violations) {
    byKind.set(v.kind, (byKind.get(v.kind) ?? 0) + 1);
  }
  return [...byKind.entries()]
    .map(([k, n]) => `${k}: ${n}`)
    .join(", ");
}
