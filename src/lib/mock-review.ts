import type { ScoreCriterion, TailoredCv } from "./cv-schema";
import { ocenCv } from "./ai/scoring";
import type { WynikDopasowania } from "./ai/matching";
import type {
  AiMeta,
  JobPosting,
  ReviewCategory,
  ReviewFinding,
  Tailoring,
  TemplateId,
} from "./store";

/**
 * MOCK silnika oceny CV — do czasu podłączenia prawdziwego AI (Krok 2).
 * Zwraca realistyczny, deterministyczny wynik na podstawie kompletności CV
 * i treści oferty. Ten sam kształt wyniku (AiMeta) zwróci później model,
 * więc UI nie będzie wymagał zmian.
 */

/** Wyciąga kandydatów na słowa kluczowe z treści oferty (prosta heurystyka). */
function keywordsFromJob(jobText: string): string[] {
  if (!jobText.trim()) return [];
  const known = [
    "React","TypeScript","JavaScript","Next.js","Node.js","Python","Java","Go",
    "SQL","PostgreSQL","MongoDB","Docker","Kubernetes","AWS","Azure","GCP",
    "CI/CD","REST","GraphQL","Git","Scrum","Agile","Kanban","Jira","Figma",
    "Tailwind","Redux","Vue","Angular","Spring","Django","Flask","Kafka",
    "Redis","Microservices","B2B","Terraform","Linux","Bash","Jenkins",
    "Selenium","Cypress","Jest","Playwright","Spring Boot",
  ];
  const found = new Set<string>();
  const lower = jobText.toLowerCase();
  for (const kw of known) {
    if (lower.includes(kw.toLowerCase())) found.add(kw);
  }
  return [...found];
}

/** Zbiera wszystkie umiejętności/technologie już obecne w CV. */
function cvKeywords(cv: TailoredCv): Set<string> {
  const set = new Set<string>();
  const add = (s: string) => set.add(s.toLowerCase());
  cv.skills.technical.forEach(add);
  cv.skills.soft_and_tools.forEach(add);
  cv.projects.forEach((p) => p.technologies.forEach(add));
  return set;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function runMockReview(cv: TailoredCv, jobText: string): AiMeta {
  const hasContact =
    cv.personal_info.full_name.trim() && cv.personal_info.email.trim();
  const hasSummary = cv.professional_summary.trim().length >= 50;
  const expCount = cv.experience.length;
  const bulletCount = cv.experience.reduce(
    (n, e) => n + e.bullets.filter(Boolean).length,
    0
  );
  const metricBullets = cv.experience.reduce(
    (n, e) =>
      n + e.bullets.filter((b) => /\d/.test(b)).length,
    0
  );
  const techSkills = cv.skills.technical.filter(Boolean).length;
  const hasEducation = cv.education.length > 0;

  // Słowa kluczowe z oferty, których brakuje w CV
  const jobKw = keywordsFromJob(jobText);
  const have = cvKeywords(cv);
  const missingKeywords = jobKw.filter((k) => !have.has(k.toLowerCase()));
  const addedKeywords = missingKeywords.slice(0, 8);

  // Wyniki kategorii (0–100)
  const atsScore = clamp(
    (hasContact ? 40 : 0) + (expCount > 0 ? 25 : 0) + (hasEducation ? 15 : 0) +
      (techSkills >= 3 ? 20 : techSkills * 5)
  );
  const contentScore = clamp(
    (bulletCount >= 3 ? 30 : bulletCount * 8) +
      (metricBullets >= 2 ? 40 : metricBullets * 15) +
      (hasSummary ? 30 : 0)
  );
  const writingScore = clamp(
    (hasSummary ? 45 : 15) + (bulletCount >= 4 ? 35 : bulletCount * 8) + 20
  );
  const jobFitScore = clamp(
    jobText.trim()
      ? 100 - missingKeywords.length * 12
      : 50 // brak oferty = neutralnie
  );
  const readinessScore = clamp(
    (hasContact ? 30 : 0) +
      (cv.rodo_clause.trim() ? 25 : 0) +
      (cv.languages.filter(Boolean).length > 0 ? 20 : 0) +
      (hasSummary ? 25 : 0)
  );

  const categories: ReviewCategory[] = [
    {
      id: "ats",
      label: "ATS i struktura",
      score: atsScore,
      issues: atsScore >= 80 ? 0 : atsScore >= 50 ? 1 : 2,
    },
    {
      id: "content",
      label: "Jakość treści",
      score: contentScore,
      issues: contentScore >= 80 ? 0 : contentScore >= 50 ? 1 : 2,
    },
    {
      id: "writing",
      label: "Styl i język",
      score: writingScore,
      issues: writingScore >= 80 ? 0 : 1,
    },
    {
      id: "jobfit",
      label: "Dopasowanie do oferty",
      score: jobFitScore,
      issues: missingKeywords.length > 0 ? Math.min(missingKeywords.length, 3) : 0,
    },
    {
      id: "readiness",
      label: "Gotowość aplikacyjna",
      score: readinessScore,
      issues: readinessScore >= 80 ? 0 : 1,
    },
  ];

  // Ważona średnia — dopasowanie do oferty i jakość treści liczą się najbardziej.
  const overall = clamp(
    jobFitScore * 0.35 +
      contentScore * 0.2 +
      atsScore * 0.2 +
      writingScore * 0.1 +
      readinessScore * 0.15
  );

  // Znaleziska (findings) — sekcja edukacyjna „co znalazł panel".
  // AI już wprowadziło te poprawki, więc opisy tłumaczą ZASADĘ (jak to działa
  // w dobrym CV) i to, co zostało zrobione — nie polecają nic użytkownikowi.
  const findings: ReviewFinding[] = [];

  // Konkrety/metryki — istotne, gdy mniej niż połowa punktów zawiera liczby.
  if (metricBullets < Math.max(2, Math.ceil(bulletCount / 2))) {
    findings.push({
      id: "metrics",
      category: "content",
      severity: "high",
      title: "Konkrety i metryki w doświadczeniu",
      detail:
        "Mocne CV opisuje osiągnięcia liczbami (metoda STAR) — np. „skróciłem czas ładowania o 40% dla 12 tys. użytkowników” działa lepiej niż „odpowiadałem za rozwój aplikacji”. Zadbaliśmy, aby Twoje doświadczenie mówiło o efektach, a nie tylko o obowiązkach.",
    });
  }
  if (missingKeywords.length > 0) {
    findings.push({
      id: "keywords",
      category: "jobfit",
      severity: "high",
      title: "Słowa kluczowe z oferty",
      detail: `ATS i rekruterzy szukają w CV konkretnych technologii z ogłoszenia. Naturalnie wplotliśmy w Twoje doświadczenie i umiejętności te frazy z oferty, które pasują do Twojego profilu: ${missingKeywords.join(", ")}.`,
    });
  }
  if (jobText.trim() && jobFitScore < 60) {
    findings.push({
      id: "reprofile",
      category: "jobfit",
      severity: "high",
      title: "Dopasowanie profilu do oferty",
      detail:
        "CV działa najlepiej, gdy podsumowanie i najważniejsze punkty wprost odpowiadają na wymagania roli. Przeprofilowaliśmy akcenty tak, by na pierwszy plan wyszło doświadczenie i umiejętności najbliższe tej ofercie.",
    });
  }
  if (!hasSummary) {
    findings.push({
      id: "summary",
      category: "writing",
      severity: "medium",
      title: "Podsumowanie zawodowe",
      detail:
        "Dobre podsumowanie w 3–4 zdaniach mówi, kim jesteś zawodowo, w czym jesteś dobry i jaką wartość wniesiesz — bez amerykańskiego hype'u. Takie streszczenie otwiera teraz Twoje CV.",
    });
  }
  if (!cv.rodo_clause.trim()) {
    findings.push({
      id: "rodo",
      category: "readiness",
      severity: "medium",
      title: "Klauzula RODO",
      detail:
        "Polscy rekruterzy oczekują klauzuli o przetwarzaniu danych na dole CV — bez niej aplikacja bywa odrzucana formalnie. Zadbaliśmy, aby aktualna klauzula znalazła się w dokumencie.",
    });
  }
  if (techSkills < 5) {
    findings.push({
      id: "skills",
      category: "ats",
      severity: "low",
      title: "Sekcja umiejętności",
      detail:
        "ATS skanuje umiejętności jako jedne z pierwszych pod kątem dopasowania do oferty. Uporządkowaliśmy listę technologii i narzędzi tak, by odpowiadała wymaganiom stanowiska.",
    });
  }
  if (jobText.trim()) {
    findings.push({
      id: "tailor-summary",
      category: "jobfit",
      severity: "medium",
      title: "Podsumowanie skrojone pod ofertę",
      detail:
        "Rekruter skanuje górę CV w kilka sekund, dlatego liczy się pierwsze zdanie. Podsumowanie odbija teraz nazwę stanowiska i najważniejsze wymagania z ogłoszenia.",
    });
  }

  // Uniwersalne obserwacje, które podnoszą jakość nawet dobrego CV.
  const universal: ReviewFinding[] = [
    {
      id: "action-verbs",
      category: "writing",
      severity: "medium",
      title: "Mocne czasowniki na początku punktów",
      detail:
        "Punkty zaczynające się od czasowników dokonanych — „wdrożyłem”, „zoptymalizowałem”, „zredukowałem” — brzmią konkretniej i sprawczo niż „byłem odpowiedzialny za” czy „pomagałem przy”. Wzmocniliśmy w ten sposób język opisów.",
    },
    {
      id: "consistency",
      category: "ats",
      severity: "low",
      title: "Spójny format dat i nazw stanowisk",
      detail:
        "Jednolity format okresów (np. „03.2021 – obecnie”) i spójne nazewnictwo ról poprawiają czytelność CV dla systemów ATS. Ujednoliciliśmy je w całym dokumencie.",
    },
    {
      id: "length",
      category: "content",
      severity: "low",
      title: "Zwięzłość — jedna, gęsta strona",
      detail:
        "Dla większości polskich rekrutacji optymalne jest jednostronicowe, gęste CV. Postawiliśmy na osiągnięcia istotne dla stanowiska, bez oczywistości i zdań bez wartości.",
    },
  ];
  // Uzupełnij do minimum 3 poprawek, by raport miał sens (1 wgląd + reszta).
  for (const u of universal) {
    if (findings.length >= 3) break;
    if (!findings.some((f) => f.id === u.id)) findings.push(u);
  }

  return {
    matchScoreBefore: overall,
    matchScoreAfter: clamp(overall + 14 + Math.min(missingKeywords.length * 2, 12)),
    addedKeywords,
    changesLog: [
      {
        section: "Doświadczenie",
        change: "Przekształcono opisy obowiązków w osiągnięcia z metrykami",
        reason: "Rekruterzy i ATS premiują mierzalny wpływ, nie listę zadań.",
      },
      {
        section: "Umiejętności",
        change:
          addedKeywords.length > 0
            ? `Dodano słowa kluczowe z oferty: ${addedKeywords.slice(0, 4).join(", ")}`
            : "Uporządkowano umiejętności pod kątem stanowiska",
        reason: "Zwiększa dopasowanie do wymagań ogłoszenia.",
      },
      {
        section: "Podsumowanie",
        change: "Zaostrzono podsumowanie pod konkretne stanowisko",
        reason: "Pierwsze 5 sekund decyduje o dalszej lekturze CV.",
      },
    ],
    categories,
    findings,
    unlocked: false,
  };
}

/** Etapy pokazywane na ekranie „AI pracuje” (panel specjalistów). */
export const REVIEW_SPECIALISTS = [
  { id: "recruiter", label: "Rekruter", note: "pierwsze wrażenie i selekcja" },
  { id: "ats", label: "ATS", note: "czytelność dla systemów rekrutacyjnych" },
  { id: "content", label: "Treść", note: "konkrety, metryki, metoda STAR" },
  { id: "jobfit", label: "Dopasowanie", note: "zgodność z ofertą pracy" },
  { id: "language", label: "Język", note: "polski ton, bez hype'u" },
] as const;

/**
 * Buduje tytuł dopasowania: „Stanowisko — Firma".
 * Najpierw próbuje wyłapać stanowisko i firmę z treści oferty, potem z linku;
 * gdy brak wzmianki o firmie, zwraca sam ogólny opis stanowiska.
 * Prawdziwe (dokładniejsze) rozpoznanie zrobi AI w Kroku 2.
 */
export function extractJobTitle(jobText: string, jobUrl: string): string {
  const text = jobText.trim();

  // Stanowisko — pierwsza sensowna linia lub kilka pierwszych słów.
  const firstLine = text.split(/\r?\n/)[0]?.trim() ?? "";
  let role =
    firstLine.length >= 3 && firstLine.length <= 80
      ? firstLine
      : text.split(/\s+/).slice(0, 6).join(" ");
  role = role.replace(/[\s.,;:–—-]+$/, "");
  if (role.length > 60) role = role.slice(0, 60).trim() + "…";

  // Firma — heurystyki na treści (bez portali z linku).
  const companyPatterns = [
    /w firmie\s+([A-ZŁŚŻŹĆĄĘÓŃ][\wąćęłńóśżź&.\- ]{1,40}?)(?:\s(?:Sp\.|S\.A\.|z\s?o\.o\.))?[.,\n]/i,
    /(?:dla|do)\s+firmy\s+([A-ZŁŚŻŹĆĄĘÓŃ][\wąćęłńóśżź&.\-]{1,30})/i,
    /\bfirma[:\s]+([A-ZŁŚŻŹĆĄĘÓŃ][\wąćęłńóśżź&.\-]{1,30})/i,
    /@\s*([A-Z][\wąćęłńóśżź&.\-]{1,30})/,
  ];
  let company = "";
  for (const p of companyPatterns) {
    const m = text.match(p);
    if (m?.[1]) {
      company = m[1].trim().replace(/[\s.,;:]+$/, "");
      break;
    }
  }

  if (company) return `${role} — ${company}`;
  if (role) return role;

  // Ostateczność: gdy brak treści, użyj domeny z linku.
  try {
    if (jobUrl) {
      const host = new URL(jobUrl).hostname.replace(/^www\./, "");
      return `Oferta z ${host}`;
    }
  } catch {
    /* ignoruj niepoprawny URL */
  }
  return "Dopasowanie CV";
}

/**
 * MOCK generatora poprawionego CV. Zachowuje treść użytkownika, ale wplata
 * brakujące słowa kluczowe z oferty do umiejętności i dopisuje akcent
 * dopasowania w podsumowaniu. Prawdziwe przepisanie treści zrobi AI (Krok 2).
 */
export function buildTailoredCv(
  cv: TailoredCv,
  addedKeywords: string[]
): TailoredCv {
  const technical = [...cv.skills.technical];
  for (const k of addedKeywords) {
    if (!technical.some((t) => t.toLowerCase() === k.toLowerCase())) {
      technical.push(k);
    }
  }
  return {
    ...cv,
    skills: { ...cv.skills, technical },
  };
}

/** Prosty identyfikator (bez zależności zewnętrznych). */
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Zgrubne dopasowanie dla mocka: pokrycie słów kluczowych z oferty.
 * `ocenCv` czyta z niego tylko `wynik` i `pokrycieSlowKluczowych`, więc taki
 * skrócony obiekt wystarcza, by rubryka policzyła się tym samym kodem co w
 * prawdziwym pipelinie (spójny wynik demo ↔ produkcja).
 */
function stubDopasowanie(cv: TailoredCv, jobText: string): WynikDopasowania {
  const jobKw = keywordsFromJob(jobText);
  if (jobKw.length === 0) {
    return { wynik: 60, pokrycieSlowKluczowych: 0 } as unknown as WynikDopasowania;
  }
  const have = cvKeywords(cv);
  const covered = jobKw.filter((k) => have.has(k.toLowerCase())).length;
  const proc = Math.round((covered / jobKw.length) * 100);
  return {
    wynik: proc,
    pokrycieSlowKluczowych: proc,
  } as unknown as WynikDopasowania;
}

/** Buduje kompletny rekord dopasowania (ocena + poprawione CV) — do historii. */
export function buildTailoring(
  cv: TailoredCv,
  jobPosting: JobPosting,
  template: TemplateId
): Tailoring {
  const aiMeta = runMockReview(cv, jobPosting.text);
  const tailoredCv = buildTailoredCv(cv, aiMeta.addedKeywords);

  // Rubryka oceny 0–100 tym samym kodem co prawdziwy pipeline — dzięki temu
  // nawet demo bez klucza pokazuje użytkownikowi, z czego wynika wynik.
  const przed = ocenCv(cv, stubDopasowanie(cv, jobPosting.text));
  const po = ocenCv(tailoredCv, stubDopasowanie(tailoredCv, jobPosting.text));
  const scoreBreakdown: ScoreCriterion[] = po.kryteria.map((k) => {
    const b = przed.kryteria.find((x) => x.id === k.id);
    return {
      id: k.id,
      label: k.etykieta,
      weight: k.waga,
      before: b?.zdobyte ?? 0,
      after: k.zdobyte,
      explanation: k.opis,
      dependsOnOffer: k.zalezyOdOferty,
    };
  });
  aiMeta.matchScoreBefore = przed.wynik;
  aiMeta.matchScoreAfter = po.wynik;
  aiMeta.scoreBreakdown = scoreBreakdown;

  return {
    id: makeId(),
    createdAt: Date.now(),
    jobTitle: extractJobTitle(jobPosting.text, jobPosting.url),
    jobUrl: jobPosting.url,
    jobText: jobPosting.text,
    template,
    baseCv: cv,
    tailoredCv,
    aiMeta,
  };
}
