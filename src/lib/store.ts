"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChangeLogEntry,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  PersonalInfo,
  TailoredCv,
} from "./cv-schema";
import { emptyCv } from "./cv-schema";

export type CvPath = "tailor" | "create";
export type TemplateId =
  | "klasyczny"
  | "nowoczesny"
  | "minimalny"
  | "elegancki"
  | "kompaktowy";

/** Identyfikatory sekcji CV widocznych na liście edytora. */
export type SectionId =
  | "summary"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "languages"
  | "rodo";

/** Sekcje włączone domyślnie w nowym CV (projekty dodaje się ręcznie). */
export const DEFAULT_SECTIONS: SectionId[] = [
  "summary",
  "experience",
  "skills",
  "education",
  "languages",
  "rodo",
];

/** Czy dana sekcja ma jakiekolwiek dane (do auto-włączania po imporcie/AI). */
export function sectionHasData(id: SectionId, cv: TailoredCv): boolean {
  switch (id) {
    case "summary":
      return cv.professional_summary.trim().length > 0;
    case "experience":
      return cv.experience.length > 0;
    case "projects":
      return cv.projects.length > 0;
    case "skills":
      return (
        cv.skills.technical.filter(Boolean).length > 0 ||
        cv.skills.soft_and_tools.filter(Boolean).length > 0
      );
    case "education":
      return cv.education.length > 0;
    case "languages":
      return cv.languages.filter(Boolean).length > 0;
    case "rodo":
      return cv.rodo_clause.trim().length > 0;
  }
}

export interface JobPosting {
  url: string;
  text: string;
}

export interface ReviewCategory {
  id: string;
  label: string;
  score: number; // 0–100
  issues: number; // liczba znalezisk w tej kategorii
}

export interface ReviewFinding {
  id: string;
  category: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string; // treść widoczna dopiero po odblokowaniu
}

export interface AiMeta {
  matchScoreBefore?: number;
  matchScoreAfter?: number;
  addedKeywords: string[];
  changesLog: ChangeLogEntry[];
  categories?: ReviewCategory[];
  findings?: ReviewFinding[];
  unlocked?: boolean; // czy pełne poprawki są odblokowane (paywall)
}

/** Zapisane dopasowanie CV do jednej oferty (pozycja historii). */
export interface Tailoring {
  id: string;
  createdAt: number;
  jobTitle: string;
  jobUrl: string;
  jobText: string;
  template: TemplateId;
  baseCv: TailoredCv; // CV przed dopasowaniem (snapshot)
  tailoredCv: TailoredCv; // CV po dopasowaniu (edytowalne)
  aiMeta: AiMeta;
}

/** Pozycja biblioteki CV — użytkownik może mieć wiele CV (np. różne języki). */
export interface SavedCv {
  id: string;
  name: string;
  cv: TailoredCv;
  template: TemplateId;
  enabledSections: SectionId[];
  createdAt: number;
  updatedAt: number;
}

/** Domyślna nazwa CV na podstawie danych. */
export function defaultCvName(cv: TailoredCv): string {
  const name = cv.personal_info.full_name.trim();
  const title = cv.personal_info.title.trim();
  if (name && title) return `${name} — ${title}`;
  if (name) return name;
  if (title) return title;
  return "CV bez nazwy";
}

function makeCvId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface CvState {
  path: CvPath;
  cv: TailoredCv;
  template: TemplateId;
  enabledSections: SectionId[];
  jobPosting: JobPosting;
  aiMeta: AiMeta;
  tailorings: Tailoring[];
  cvs: SavedCv[];
  activeCvId: string | null;

  setPath: (path: CvPath) => void;
  setTemplate: (template: TemplateId) => void;
  setJobPosting: (patch: Partial<JobPosting>) => void;
  loadCv: (cv: TailoredCv) => void;
  resetCv: () => void;
  setAiMeta: (meta: AiMeta) => void;

  // Biblioteka CV
  newCv: (template?: TemplateId) => string; // zwraca id nowego CV
  newCvFrom: (cv: TailoredCv, template: TemplateId, name?: string) => string;
  openCv: (id: string) => void;
  syncActiveCv: () => void;
  renameCv: (id: string, name: string) => void;
  deleteCv: (id: string) => void;
  addTailoring: (t: Tailoring) => void;
  removeTailoring: (id: string) => void;
  updateTailoringCv: (id: string, cv: TailoredCv) => void;
  unlockTailoring: (id: string) => void;
  unlockReview: () => void;
  resetReview: () => void;

  addSection: (id: SectionId) => void;
  removeSection: (id: SectionId) => void;

  setPersonal: (patch: Partial<PersonalInfo>) => void;
  setSummary: (summary: string) => void;
  setRodo: (clause: string) => void;

  addExperience: () => void;
  removeExperience: (index: number) => void;
  updateExperience: (index: number, patch: Partial<ExperienceItem>) => void;

  addProject: () => void;
  removeProject: (index: number) => void;
  updateProject: (index: number, patch: Partial<ProjectItem>) => void;

  addEducation: () => void;
  removeEducation: (index: number) => void;
  updateEducation: (index: number, patch: Partial<EducationItem>) => void;

  setTechnicalSkills: (skills: string[]) => void;
  setSoftSkills: (skills: string[]) => void;
  setLanguages: (languages: string[]) => void;
}

const emptyAiMeta: AiMeta = { addedKeywords: [], changesLog: [] };

/** Sekcje włączone po wczytaniu CV: domyślne + wszystkie mające dane. */
function sectionsForCv(cv: TailoredCv): SectionId[] {
  const all: SectionId[] = [
    "summary",
    "experience",
    "projects",
    "skills",
    "education",
    "languages",
    "rodo",
  ];
  const enabled = new Set<SectionId>(DEFAULT_SECTIONS);
  for (const id of all) if (sectionHasData(id, cv)) enabled.add(id);
  return all.filter((id) => enabled.has(id));
}

/** Czyści dane sekcji przy jej usunięciu z edytora. */
function clearedSection(cv: TailoredCv, id: SectionId): TailoredCv {
  switch (id) {
    case "summary":
      return { ...cv, professional_summary: "" };
    case "experience":
      return { ...cv, experience: [] };
    case "projects":
      return { ...cv, projects: [] };
    case "skills":
      return { ...cv, skills: { technical: [], soft_and_tools: [] } };
    case "education":
      return { ...cv, education: [] };
    case "languages":
      return { ...cv, languages: [] };
    case "rodo":
      return { ...cv, rodo_clause: "" };
  }
}

export const useCvStore = create<CvState>()(
  persist(
    (set) => ({
      path: "tailor",
      cv: emptyCv,
      template: "nowoczesny",
      enabledSections: DEFAULT_SECTIONS,
      jobPosting: { url: "", text: "" },
      aiMeta: emptyAiMeta,
      tailorings: [],
      cvs: [],
      activeCvId: null,

      setPath: (path) => set({ path }),
      setTemplate: (template) => set({ template }),
      setJobPosting: (patch) =>
        set((s) => ({ jobPosting: { ...s.jobPosting, ...patch } })),
      loadCv: (cv) =>
        set({ cv, enabledSections: sectionsForCv(cv) }),
      resetCv: () =>
        set({
          cv: emptyCv,
          aiMeta: emptyAiMeta,
          enabledSections: DEFAULT_SECTIONS,
        }),
      setAiMeta: (aiMeta) => set({ aiMeta }),

      // ---- Biblioteka CV ----
      // Zapisuje bieżąco edytowane CV (cv/template/enabledSections) do
      // odpowiedniej pozycji w bibliotece.
      syncActiveCv: () =>
        set((s) => {
          if (!s.activeCvId) return s;
          return {
            cvs: s.cvs.map((c) =>
              c.id === s.activeCvId
                ? {
                    ...c,
                    cv: s.cv,
                    template: s.template,
                    enabledSections: s.enabledSections,
                    name: defaultCvName(s.cv),
                    updatedAt: Date.now(),
                  }
                : c
            ),
          };
        }),
      newCv: (template = "nowoczesny") => {
        const id = makeCvId();
        set((s) => {
          // najpierw zapisz bieżące, jeśli edytowaliśmy jakieś CV
          const cvs = s.activeCvId
            ? s.cvs.map((c) =>
                c.id === s.activeCvId
                  ? {
                      ...c,
                      cv: s.cv,
                      template: s.template,
                      enabledSections: s.enabledSections,
                      name: defaultCvName(s.cv),
                      updatedAt: Date.now(),
                    }
                  : c
              )
            : s.cvs;
          const now = Date.now();
          const entry: SavedCv = {
            id,
            name: "Nowe CV",
            cv: emptyCv,
            template,
            enabledSections: DEFAULT_SECTIONS,
            createdAt: now,
            updatedAt: now,
          };
          return {
            cvs: [entry, ...cvs],
            activeCvId: id,
            cv: emptyCv,
            template,
            enabledSections: DEFAULT_SECTIONS,
            aiMeta: emptyAiMeta,
          };
        });
        return id;
      },
      newCvFrom: (cv, template, name) => {
        const id = makeCvId();
        set((s) => {
          const cvs = s.activeCvId
            ? s.cvs.map((c) =>
                c.id === s.activeCvId
                  ? {
                      ...c,
                      cv: s.cv,
                      template: s.template,
                      enabledSections: s.enabledSections,
                      name: defaultCvName(s.cv),
                      updatedAt: Date.now(),
                    }
                  : c
              )
            : s.cvs;
          const now = Date.now();
          const enabledSections = sectionsForCv(cv);
          const entry: SavedCv = {
            id,
            name: name ?? defaultCvName(cv),
            cv,
            template,
            enabledSections,
            createdAt: now,
            updatedAt: now,
          };
          return {
            cvs: [entry, ...cvs],
            activeCvId: id,
            cv,
            template,
            enabledSections,
            aiMeta: emptyAiMeta,
          };
        });
        return id;
      },
      openCv: (id) =>
        set((s) => {
          // zapisz bieżące przed przełączeniem
          const cvs = s.activeCvId
            ? s.cvs.map((c) =>
                c.id === s.activeCvId
                  ? {
                      ...c,
                      cv: s.cv,
                      template: s.template,
                      enabledSections: s.enabledSections,
                      name: defaultCvName(s.cv),
                      updatedAt: Date.now(),
                    }
                  : c
              )
            : s.cvs;
          const target = cvs.find((c) => c.id === id);
          if (!target) return { cvs };
          return {
            cvs,
            activeCvId: id,
            cv: target.cv,
            template: target.template,
            enabledSections: target.enabledSections,
            aiMeta: emptyAiMeta,
          };
        }),
      renameCv: (id, name) =>
        set((s) => ({
          cvs: s.cvs.map((c) =>
            c.id === id ? { ...c, name, updatedAt: Date.now() } : c
          ),
        })),
      deleteCv: (id) =>
        set((s) => {
          const cvs = s.cvs.filter((c) => c.id !== id);
          if (s.activeCvId !== id) return { cvs };
          // usuwane było aktywne — przełącz na inne lub wyczyść
          const next = cvs[0];
          return next
            ? {
                cvs,
                activeCvId: next.id,
                cv: next.cv,
                template: next.template,
                enabledSections: next.enabledSections,
              }
            : {
                cvs,
                activeCvId: null,
                cv: emptyCv,
                enabledSections: DEFAULT_SECTIONS,
              };
        }),

      addTailoring: (t) =>
        set((s) => ({ tailorings: [t, ...s.tailorings] })),
      removeTailoring: (id) =>
        set((s) => ({ tailorings: s.tailorings.filter((t) => t.id !== id) })),
      updateTailoringCv: (id, tailoredCv) =>
        set((s) => ({
          tailorings: s.tailorings.map((t) =>
            t.id === id ? { ...t, tailoredCv } : t
          ),
        })),
      unlockTailoring: (id) =>
        set((s) => ({
          tailorings: s.tailorings.map((t) =>
            t.id === id
              ? { ...t, aiMeta: { ...t.aiMeta, unlocked: true } }
              : t
          ),
          // odblokuj też bieżący wynik, jeśli dotyczy tego samego dopasowania
          aiMeta:
            s.tailorings[0]?.id === id
              ? { ...s.aiMeta, unlocked: true }
              : s.aiMeta,
        })),
      unlockReview: () =>
        set((s) => ({
          aiMeta: { ...s.aiMeta, unlocked: true },
          tailorings: s.tailorings.map((t, i) =>
            i === 0 ? { ...t, aiMeta: { ...t.aiMeta, unlocked: true } } : t
          ),
        })),
      resetReview: () => set({ aiMeta: emptyAiMeta }),

      addSection: (id) =>
        set((s) =>
          s.enabledSections.includes(id)
            ? s
            : { enabledSections: [...s.enabledSections, id] }
        ),
      removeSection: (id) =>
        set((s) => ({
          enabledSections: s.enabledSections.filter((x) => x !== id),
          cv: clearedSection(s.cv, id),
        })),

      setPersonal: (patch) =>
        set((s) => ({
          cv: { ...s.cv, personal_info: { ...s.cv.personal_info, ...patch } },
        })),
      setSummary: (professional_summary) =>
        set((s) => ({ cv: { ...s.cv, professional_summary } })),
      setRodo: (rodo_clause) => set((s) => ({ cv: { ...s.cv, rodo_clause } })),

      addExperience: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: [
              ...s.cv.experience,
              { company: "", role: "", location: "", period: "", bullets: [""] },
            ],
          },
        })),
      removeExperience: (index) =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: s.cv.experience.filter((_, i) => i !== index),
          },
        })),
      updateExperience: (index, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: s.cv.experience.map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          },
        })),

      addProject: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            projects: [
              ...s.cv.projects,
              { name: "", technologies: [], link: "", period: "", bullets: [""] },
            ],
          },
        })),
      removeProject: (index) =>
        set((s) => ({
          cv: {
            ...s.cv,
            projects: s.cv.projects.filter((_, i) => i !== index),
          },
        })),
      updateProject: (index, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            projects: s.cv.projects.map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          },
        })),

      addEducation: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: [
              ...s.cv.education,
              { institution: "", degree: "", location: "", period: "" },
            ],
          },
        })),
      removeEducation: (index) =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: s.cv.education.filter((_, i) => i !== index),
          },
        })),
      updateEducation: (index, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: s.cv.education.map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          },
        })),

      setTechnicalSkills: (technical) =>
        set((s) => ({ cv: { ...s.cv, skills: { ...s.cv.skills, technical } } })),
      setSoftSkills: (soft_and_tools) =>
        set((s) => ({
          cv: { ...s.cv, skills: { ...s.cv.skills, soft_and_tools } },
        })),
      setLanguages: (languages) =>
        set((s) => ({ cv: { ...s.cv, languages } })),
    }),
    {
      name: "cv-copilot-store",
      version: 2,
      // Rehydracja dopiero po montażu (StoreHydration) — inaczej SSR-owy HTML
      // różniłby się od stanu z localStorage i React zgłosiłby hydration error.
      skipHydration: true,
      // Migracja starszych stanów: dolewa pola dodane po pierwszym zapisie
      // (projects, location, enabledSections, biblioteka cvs).
      migrate: (persisted) => {
        const p = persisted as Partial<CvState> | undefined;
        if (!p || typeof p !== "object") return persisted as unknown as CvState;
        const rawCv = (p.cv ?? {}) as Partial<TailoredCv>;
        const cv: TailoredCv = {
          ...emptyCv,
          ...rawCv,
          personal_info: {
            ...emptyCv.personal_info,
            ...(rawCv.personal_info ?? {}),
          },
          skills: { ...emptyCv.skills, ...(rawCv.skills ?? {}) },
          experience: Array.isArray(rawCv.experience) ? rawCv.experience : [],
          projects: Array.isArray(rawCv.projects) ? rawCv.projects : [],
          education: Array.isArray(rawCv.education) ? rawCv.education : [],
          languages: Array.isArray(rawCv.languages) ? rawCv.languages : [],
        };
        const enabledSections = Array.isArray(p.enabledSections)
          ? p.enabledSections
          : sectionsForCv(cv);
        const template = (p.template as TemplateId) ?? "nowoczesny";

        // Migracja do biblioteki CV: dotychczasowe pojedyncze CV staje się
        // pierwszą pozycją biblioteki (o ile ma jakieś dane).
        let cvs = Array.isArray(p.cvs) ? (p.cvs as SavedCv[]) : [];
        let activeCvId = p.activeCvId ?? null;
        const cvHasData =
          cv.personal_info.full_name.trim().length > 0 ||
          cv.experience.length > 0;
        if (cvs.length === 0 && cvHasData) {
          const now = Date.now();
          const id = makeCvId();
          cvs = [
            {
              id,
              name: defaultCvName(cv),
              cv,
              template,
              enabledSections,
              createdAt: now,
              updatedAt: now,
            },
          ];
          activeCvId = id;
        }

        return {
          ...p,
          cv,
          template,
          enabledSections,
          tailorings: Array.isArray(p.tailorings) ? p.tailorings : [],
          cvs,
          activeCvId,
        } as CvState;
      },
    }
  )
);
