import {
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  Languages,
  ListChecks,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { SectionId } from "./store";

export interface SectionMeta {
  id: SectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Definicje sekcji CV — kolejność = kolejność na liście i w dokumencie. */
export const SECTION_META: Record<SectionId, SectionMeta> = {
  summary: {
    id: "summary",
    label: "Podsumowanie zawodowe",
    description: "Krótki opis Twojego doświadczenia i mocnych stron",
    icon: FileText,
  },
  experience: {
    id: "experience",
    label: "Doświadczenie",
    description: "Stanowiska, obowiązki i osiągnięcia",
    icon: Briefcase,
  },
  projects: {
    id: "projects",
    label: "Projekty",
    description: "Warte pokazania projekty i technologie",
    icon: FolderGit2,
  },
  skills: {
    id: "skills",
    label: "Umiejętności",
    description: "Technologie oraz umiejętności miękkie i narzędzia",
    icon: ListChecks,
  },
  education: {
    id: "education",
    label: "Edukacja",
    description: "Uczelnie, kierunki i stopnie",
    icon: GraduationCap,
  },
  languages: {
    id: "languages",
    label: "Języki obce",
    description: "Języki wraz z poziomem znajomości",
    icon: Languages,
  },
  rodo: {
    id: "rodo",
    label: "Klauzula RODO",
    description: "Zgoda na przetwarzanie danych osobowych",
    icon: ShieldCheck,
  },
};

/** Kolejność renderowania sekcji. */
export const SECTION_ORDER: SectionId[] = [
  "summary",
  "experience",
  "projects",
  "skills",
  "education",
  "languages",
  "rodo",
];
