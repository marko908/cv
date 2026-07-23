import { z } from "zod";

/**
 * Centralny schemat danych CV.
 * Ten sam schemat służy do:
 *  - wymuszania struktury odpowiedzi AI (generateObject + Zod),
 *  - typowania stanu edytora (Zustand),
 *  - renderowania podglądu i eksportu PDF.
 */

export const personalInfoSchema = z.object({
  full_name: z.string().describe("Imię i nazwisko"),
  title: z.string().describe("Tytuł zawodowy, np. 'Senior Frontend Developer'"),
  email: z.string(),
  phone: z.string(),
  location: z.string().describe("Miasto, np. 'Warszawa'"),
  linkedin_or_github: z
    .string()
    .optional()
    .describe("Link do LinkedIn lub GitHub (opcjonalnie)"),
});

export const experienceItemSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().optional().describe("Miasto / tryb pracy (opcjonalnie)"),
  period: z.string().describe("Okres zatrudnienia, np. '03.2021 – obecnie'"),
  bullets: z
    .array(z.string())
    .describe(
      "Osiągnięcia metodą STAR, z konkretami i metrykami. Bez pustych frazesów."
    ),
});

export const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string().describe("Kierunek i stopień, np. 'Informatyka, mgr inż.'"),
  location: z.string().optional().describe("Miasto (opcjonalnie)"),
  period: z.string(),
});

export const projectItemSchema = z.object({
  name: z.string().describe("Nazwa projektu"),
  technologies: z
    .array(z.string())
    .describe("Użyte technologie, np. ['React', 'Node.js']"),
  link: z.string().optional().describe("Link do repozytorium / demo (opcjonalnie)"),
  period: z.string().optional().describe("Okres realizacji (opcjonalnie)"),
  bullets: z.array(z.string()).describe("Krótkie opisy z konkretami i metrykami"),
});

export const skillsSchema = z.object({
  technical: z.array(z.string()).describe("Umiejętności twarde / technologie"),
  soft_and_tools: z
    .array(z.string())
    .describe("Umiejętności miękkie i narzędzia"),
});

export const tailoredCvSchema = z.object({
  personal_info: personalInfoSchema,
  professional_summary: z
    .string()
    .describe("Zwięzłe podsumowanie zawodowe (3–4 zdania), po polsku"),
  experience: z.array(experienceItemSchema),
  projects: z.array(projectItemSchema).describe("Projekty (opcjonalnie)"),
  skills: skillsSchema,
  education: z.array(educationItemSchema),
  languages: z
    .array(z.string())
    .describe("Języki z poziomem, np. 'angielski – C1'"),
  rodo_clause: z
    .string()
    .describe("Standardowa polska klauzula RODO / zgoda na przetwarzanie danych"),
});

export const changeLogEntrySchema = z.object({
  section: z.string().describe("Sekcja CV, której dotyczy zmiana"),
  change: z.string().describe("Co zostało zmienione"),
  reason: z.string().describe("Dlaczego — w odniesieniu do oferty pracy"),
});

/** Pełna odpowiedź AI dla ścieżki A (tailoring) i B (generowanie od zera). */
export const cvGenerationSchema = z.object({
  match_score_before: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Dopasowanie oryginalnego CV do oferty (tylko ścieżka A)"),
  match_score_after: z
    .number()
    .min(0)
    .max(100)
    .describe("Dopasowanie zoptymalizowanego CV do oferty"),
  added_keywords: z
    .array(z.string())
    .describe("Słowa kluczowe z oferty wplecione w CV"),
  changes_log: z
    .array(changeLogEntrySchema)
    .optional()
    .describe("Dziennik zmian z uzasadnieniem (tylko ścieżka A)"),
  tailored_cv: tailoredCvSchema,
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type TailoredCv = z.infer<typeof tailoredCvSchema>;
export type ChangeLogEntry = z.infer<typeof changeLogEntrySchema>;
export type CvGeneration = z.infer<typeof cvGenerationSchema>;

/** Lista kontrolna kompletności CV (te same kryteria co miernik gotowości). */
export function cvChecklist(cv: TailoredCv): { label: string; done: boolean }[] {
  return [
    {
      label: "Dane kontaktowe",
      done:
        cv.personal_info.full_name.trim().length > 0 &&
        cv.personal_info.email.trim().length > 0 &&
        cv.personal_info.phone.trim().length > 0,
    },
    {
      label: "Podsumowanie zawodowe",
      done: cv.professional_summary.trim().length >= 50,
    },
    {
      label: "Doświadczenie",
      done:
        cv.experience.length > 0 &&
        cv.experience.some((e) => e.bullets.filter(Boolean).length > 0),
    },
    {
      label: "Umiejętności",
      done: cv.skills.technical.filter(Boolean).length >= 3,
    },
    { label: "Edukacja", done: cv.education.length > 0 },
  ];
}

/** Czy CV jest kompletne na tyle, by je dopasować do oferty. */
export function isCvComplete(cv: TailoredCv): boolean {
  return cvChecklist(cv).every((c) => c.done);
}

/** Nieuzupełnione sekcje CV. */
export function missingCvSections(cv: TailoredCv): string[] {
  return cvChecklist(cv)
    .filter((c) => !c.done)
    .map((c) => c.label);
}

export const DEFAULT_RODO_CLAUSE =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych przez [nazwa firmy] w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko.";

export const emptyCv: TailoredCv = {
  personal_info: {
    full_name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin_or_github: "",
  },
  professional_summary: "",
  experience: [],
  projects: [],
  skills: { technical: [], soft_and_tools: [] },
  education: [],
  languages: [],
  rodo_clause: DEFAULT_RODO_CLAUSE,
};
