import type { TailoredCv } from "@/lib/cv-schema";

/**
 * REJESTR FAKTÓW — jedyne źródło prawdy dla AI.
 *
 * Zasada naczelna aplikacji: AI nie tworzy treści CV. AI wybiera, porządkuje
 * i przeformułowuje fakty, które podał użytkownik. Wszystko, co trafia do
 * przerobionego CV, musi dać się wyprowadzić z tego rejestru.
 *
 * Dzięki temu halucynacja nie jest "czymś, o co prosimy model w promptcie",
 * tylko czymś, co jest niemożliwe do przepchnięcia przez walidator.
 */

export type FactType =
  | "dane_osobowe"
  | "stanowisko"
  | "firma"
  | "okres"
  | "osiagniecie"
  | "umiejetnosc"
  | "projekt"
  | "edukacja"
  | "jezyk";

/** Skąd pochodzi fakt. Tylko te dwa źródła są legalne. */
export type FactSource =
  /** Użytkownik wpisał to w formularzu albo pochodzi z jego wgranego pliku. */
  | "cv"
  /** Użytkownik potwierdził to, odpowiadając na pytanie w wywiadzie. */
  | "wywiad";

export type Fact = {
  id: string;
  type: FactType;
  /** Treść faktu w brzmieniu użytkownika. */
  value: string;
  source: FactSource;
  /** Ścieżka w CV, z której fakt pochodzi — do pokazania użytkownikowi. */
  path?: string;
};

export type FactLedger = {
  facts: Fact[];
  /** Wszystkie ciągi cyfr występujące w faktach (do walidacji metryk). */
  allowedDigits: Set<string>;
  /** Znormalizowane nazwy technologii, firm, uczelni, stanowisk. */
  allowedEntities: Set<string>;
  /** Pełny tekst wszystkich faktów, złączony — do sprawdzania fraz. */
  corpus: string;
};

/** Normalizacja do porównań: małe litery, bez ogonków, bez zbędnych spacji. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    // usuwa znaki diakrytyczne (U+0300–U+036F) rozdzielone przez NFD
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/\s+/g, " ")
    .trim();
}

/** Wyciąga wszystkie ciągi cyfr z tekstu, np. "o 40% w 2021" -> ["40","2021"]. */
export function digitsIn(text: string): string[] {
  return (text.match(/\d+/g) ?? []).map((d) => d.replace(/^0+(?=\d)/, ""));
}

/**
 * Buduje rejestr faktów bezpośrednio ze strukturalnego CV użytkownika.
 * Zero AI, zero interpretacji — czysta, deterministyczna transformacja.
 */
export function buildLedgerFromCv(
  cv: TailoredCv,
  extra: Fact[] = []
): FactLedger {
  const facts: Fact[] = [];
  let seq = 0;
  const add = (
    type: FactType,
    value: string,
    path: string,
    source: FactSource = "cv"
  ) => {
    const v = value?.trim();
    if (!v) return;
    seq += 1;
    facts.push({
      id: `F${String(seq).padStart(3, "0")}`,
      type,
      value: v,
      source,
      path,
    });
  };

  const p = cv.personal_info;
  add("dane_osobowe", p.full_name, "personal_info.full_name");
  add("stanowisko", p.title, "personal_info.title");
  add("dane_osobowe", p.email, "personal_info.email");
  add("dane_osobowe", p.phone, "personal_info.phone");
  add("dane_osobowe", p.location, "personal_info.location");
  if (p.linkedin_or_github)
    add("dane_osobowe", p.linkedin_or_github, "personal_info.linkedin_or_github");

  add("osiagniecie", cv.professional_summary, "professional_summary");

  cv.experience.forEach((exp, i) => {
    add("stanowisko", exp.role, `experience[${i}].role`);
    add("firma", exp.company, `experience[${i}].company`);
    add("okres", exp.period, `experience[${i}].period`);
    if (exp.location) add("firma", exp.location, `experience[${i}].location`);
    exp.bullets.filter(Boolean).forEach((b, j) => {
      add("osiagniecie", b, `experience[${i}].bullets[${j}]`);
    });
  });

  cv.projects.forEach((proj, i) => {
    add("projekt", proj.name, `projects[${i}].name`);
    if (proj.period) add("okres", proj.period, `projects[${i}].period`);
    if (proj.link) add("projekt", proj.link, `projects[${i}].link`);
    proj.technologies.filter(Boolean).forEach((t, j) => {
      add("umiejetnosc", t, `projects[${i}].technologies[${j}]`);
    });
    proj.bullets.filter(Boolean).forEach((b, j) => {
      add("osiagniecie", b, `projects[${i}].bullets[${j}]`);
    });
  });

  cv.skills.technical.filter(Boolean).forEach((s, i) => {
    add("umiejetnosc", s, `skills.technical[${i}]`);
  });
  cv.skills.soft_and_tools.filter(Boolean).forEach((s, i) => {
    add("umiejetnosc", s, `skills.soft_and_tools[${i}]`);
  });

  cv.education.forEach((edu, i) => {
    add("edukacja", edu.institution, `education[${i}].institution`);
    add("edukacja", edu.degree, `education[${i}].degree`);
    add("okres", edu.period, `education[${i}].period`);
    if (edu.location) add("edukacja", edu.location, `education[${i}].location`);
  });

  cv.languages.filter(Boolean).forEach((l, i) => {
    add("jezyk", l, `languages[${i}]`);
  });

  // Fakty z wywiadu — potwierdzone wprost przez użytkownika.
  for (const f of extra) facts.push(f);

  return indexLedger(facts);
}

/** Buduje indeksy używane przez walidator. */
export function indexLedger(facts: Fact[]): FactLedger {
  const allowedDigits = new Set<string>();
  const allowedEntities = new Set<string>();
  const parts: string[] = [];

  for (const f of facts) {
    for (const d of digitsIn(f.value)) allowedDigits.add(d);
    parts.push(f.value);
    // Nazwy własne i technologie traktujemy całościowo oraz w kawałkach,
    // żeby "React.js" pokrywało "React", a "mgr inż." — "mgr".
    const n = normalize(f.value);
    allowedEntities.add(n);
    for (const token of n.split(/[^a-z0-9+#.]+/).filter(Boolean)) {
      allowedEntities.add(token);
    }
  }

  return {
    facts,
    allowedDigits,
    allowedEntities,
    corpus: normalize(parts.join(" \n ")),
  };
}

/** Dodaje do rejestru fakt potwierdzony przez użytkownika w wywiadzie. */
export function factFromInterview(value: string, seq: number): Fact {
  return {
    id: `W${String(seq).padStart(3, "0")}`,
    type: "osiagniecie",
    value: value.trim(),
    source: "wywiad",
    path: "wywiad",
  };
}
