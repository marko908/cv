"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhotoInput } from "./photo-input";
import { templateUsesPhoto } from "@/lib/cv-templates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCvStore } from "@/lib/store";
import { SECTION_META } from "@/lib/sections";
import type { SectionId } from "@/lib/store";
import { BulletsEditor, TagInput } from "./field-inputs";

/** Wspólna powłoka modala sekcji: nagłówek + treść + stopka „Gotowe". */
function SectionShell({
  section,
  trigger,
  children,
  wide = false,
}: {
  section: SectionId | "personal";
  trigger: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  const meta =
    section === "personal"
      ? {
          label: "Dane osobowe",
          description: "Podstawowe informacje kontaktowe",
          icon: null,
        }
      : SECTION_META[section];
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={`max-h-[86vh] overflow-y-auto shadow-dialog ${
          wide ? "sm:max-w-2xl" : "sm:max-w-xl"
        }`}
      >
        <DialogHeader>
          <p className="eyebrow text-primary">{meta.label}</p>
          <DialogTitle className="sr-only">{meta.label}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button className="font-bold">Gotowe</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Dane osobowe ---------- */
export function PersonalInfoDialog({ trigger }: { trigger: ReactNode }) {
  const cv = useCvStore((s) => s.cv);
  const setPersonal = useCvStore((s) => s.setPersonal);
  const template = useCvStore((s) => s.template);
  const p = cv.personal_info;
  // Zdjęcie pokazujemy tylko tam, gdzie szablon faktycznie je wyświetla —
  // inaczej użytkownik wgrywa plik, którego nigdzie nie widać.
  const zeZdjeciem = templateUsesPhoto(template);

  return (
    <SectionShell section="personal" trigger={trigger}>
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="pi-name">Imię i nazwisko *</Label>
          <Input
            id="pi-name"
            value={p.full_name}
            onChange={(e) => setPersonal({ full_name: e.target.value })}
            placeholder="Anna Kowalska"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pi-title">Stanowisko / tytuł zawodowy</Label>
          <Input
            id="pi-title"
            value={p.title}
            onChange={(e) => setPersonal({ title: e.target.value })}
            placeholder="Frontend Developer"
          />
        </div>
        {zeZdjeciem && (
          <PhotoInput
            value={p.photo}
            onChange={(photo) => setPersonal({ photo })}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="pi-email">E-mail *</Label>
            <Input
              id="pi-email"
              type="email"
              value={p.email}
              onChange={(e) => setPersonal({ email: e.target.value })}
              placeholder="anna@example.com"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pi-phone">Telefon *</Label>
            <Input
              id="pi-phone"
              value={p.phone}
              onChange={(e) => setPersonal({ phone: e.target.value })}
              placeholder="+48 600 000 000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="pi-loc">Miasto</Label>
            <Input
              id="pi-loc"
              value={p.location}
              onChange={(e) => setPersonal({ location: e.target.value })}
              placeholder="Warszawa"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pi-link">LinkedIn / GitHub</Label>
            <Input
              id="pi-link"
              value={p.linkedin_or_github ?? ""}
              onChange={(e) =>
                setPersonal({ linkedin_or_github: e.target.value })
              }
              placeholder="linkedin.com/in/..."
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- Podsumowanie ---------- */
export function SummaryDialog({ trigger }: { trigger: ReactNode }) {
  const summary = useCvStore((s) => s.cv.professional_summary);
  const setSummary = useCvStore((s) => s.setSummary);
  return (
    <SectionShell section="summary" trigger={trigger}>
      <div className="grid gap-1.5">
        <Label htmlFor="summary">Podsumowanie (3–4 zdania)</Label>
        <Textarea
          id="summary"
          rows={5}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Kim jesteś zawodowo, w czym jesteś dobry i czego szukasz — konkretnie, bez hype'u."
        />
        <p className="text-xs text-muted-foreground">
          Postaw na fakty i mocne strony istotne dla stanowiska, na które
          aplikujesz.
        </p>
      </div>
    </SectionShell>
  );
}

/* ---------- Doświadczenie ---------- */
export function ExperienceDialog({ trigger }: { trigger: ReactNode }) {
  const experience = useCvStore((s) => s.cv.experience);
  const add = useCvStore((s) => s.addExperience);
  const remove = useCvStore((s) => s.removeExperience);
  const update = useCvStore((s) => s.updateExperience);

  return (
    <SectionShell section="experience" trigger={trigger} wide>
      <div className="flex flex-col gap-4">
        {experience.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Brak pozycji. Dodaj pierwsze stanowisko.
          </p>
        )}
        {experience.map((exp, i) => (
          <div key={i} className="rounded-lg border border-border bg-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">
                Pozycja {i + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                aria-label="Usuń pozycję"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Stanowisko *</Label>
                  <Input
                    value={exp.role}
                    onChange={(e) => update(i, { role: e.target.value })}
                    placeholder="Frontend Developer"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Firma *</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => update(i, { company: e.target.value })}
                    placeholder="Softwarehouse Sp. z o.o."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Lokalizacja / tryb</Label>
                  <Input
                    value={exp.location ?? ""}
                    onChange={(e) => update(i, { location: e.target.value })}
                    placeholder="Warszawa (hybrydowo)"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Okres</Label>
                  <Input
                    value={exp.period}
                    onChange={(e) => update(i, { period: e.target.value })}
                    placeholder="03.2021 – obecnie"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Osiągnięcia i obowiązki</Label>
                <BulletsEditor
                  bullets={exp.bullets}
                  onChange={(bullets) => update(i, { bullets })}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5 self-start"
          onClick={add}
        >
          <Plus className="size-4" />
          Dodaj pozycję
        </Button>
      </div>
    </SectionShell>
  );
}

/* ---------- Projekty ---------- */
export function ProjectsDialog({ trigger }: { trigger: ReactNode }) {
  const projects = useCvStore((s) => s.cv.projects);
  const add = useCvStore((s) => s.addProject);
  const remove = useCvStore((s) => s.removeProject);
  const update = useCvStore((s) => s.updateProject);

  return (
    <SectionShell section="projects" trigger={trigger} wide>
      <div className="flex flex-col gap-4">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Brak projektów. Dodaj pierwszy.
          </p>
        )}
        {projects.map((proj, i) => (
          <div key={i} className="rounded-lg border border-border bg-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">
                Projekt {i + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                aria-label="Usuń projekt"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Nazwa projektu *</Label>
                <Input
                  value={proj.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Panel analityczny open-source"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Technologie</Label>
                <TagInput
                  tags={proj.technologies}
                  onChange={(technologies) => update(i, { technologies })}
                  placeholder="React, D3.js, Vite…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Link (opcjonalnie)</Label>
                  <Input
                    value={proj.link ?? ""}
                    onChange={(e) => update(i, { link: e.target.value })}
                    placeholder="github.com/..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Okres (opcjonalnie)</Label>
                  <Input
                    value={proj.period ?? ""}
                    onChange={(e) => update(i, { period: e.target.value })}
                    placeholder="2023"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Opis</Label>
                <BulletsEditor
                  bullets={proj.bullets}
                  onChange={(bullets) => update(i, { bullets })}
                  placeholder="Co zbudowałeś i jaki był efekt — z konkretami…"
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5 self-start"
          onClick={add}
        >
          <Plus className="size-4" />
          Dodaj projekt
        </Button>
      </div>
    </SectionShell>
  );
}

/* ---------- Umiejętności ---------- */
export function SkillsDialog({ trigger }: { trigger: ReactNode }) {
  const skills = useCvStore((s) => s.cv.skills);
  const setTechnical = useCvStore((s) => s.setTechnicalSkills);
  const setSoft = useCvStore((s) => s.setSoftSkills);
  return (
    <SectionShell section="skills" trigger={trigger}>
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label>Techniczne / technologie</Label>
          <TagInput
            tags={skills.technical}
            onChange={setTechnical}
            placeholder="React, TypeScript, SQL…"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Miękkie i narzędzia</Label>
          <TagInput
            tags={skills.soft_and_tools}
            onChange={setSoft}
            placeholder="Praca w Scrum, Figma, Jira…"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Wpisz i naciśnij Enter, albo wklej listę oddzieloną przecinkami.
        </p>
      </div>
    </SectionShell>
  );
}

/* ---------- Edukacja ---------- */
export function EducationDialog({ trigger }: { trigger: ReactNode }) {
  const education = useCvStore((s) => s.cv.education);
  const add = useCvStore((s) => s.addEducation);
  const remove = useCvStore((s) => s.removeEducation);
  const update = useCvStore((s) => s.updateEducation);

  return (
    <SectionShell section="education" trigger={trigger} wide>
      <div className="flex flex-col gap-4">
        {education.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Brak wpisów. Dodaj pierwszą szkołę.
          </p>
        )}
        {education.map((edu, i) => (
          <div key={i} className="rounded-lg border border-border bg-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">
                Szkoła {i + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                aria-label="Usuń szkołę"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Uczelnia / szkoła *</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => update(i, { institution: e.target.value })}
                  placeholder="Politechnika Warszawska"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Kierunek i stopień *</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => update(i, { degree: e.target.value })}
                  placeholder="Informatyka, inż."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Miasto</Label>
                  <Input
                    value={edu.location ?? ""}
                    onChange={(e) => update(i, { location: e.target.value })}
                    placeholder="Warszawa"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Okres</Label>
                  <Input
                    value={edu.period}
                    onChange={(e) => update(i, { period: e.target.value })}
                    placeholder="2015 – 2019"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5 self-start"
          onClick={add}
        >
          <Plus className="size-4" />
          Dodaj szkołę
        </Button>
      </div>
    </SectionShell>
  );
}

/* ---------- Języki ---------- */
const LANGUAGE_OPTIONS = [
  "polski",
  "angielski",
  "niemiecki",
  "francuski",
  "hiszpański",
  "włoski",
  "rosyjski",
  "ukraiński",
  "portugalski",
  "niderlandzki",
  "szwedzki",
  "norweski",
  "czeski",
  "słowacki",
  "chiński (mandaryński)",
  "japoński",
  "koreański",
  "arabski",
];

const LEVEL_OPTIONS = [
  { value: "ojczysty", label: "ojczysty" },
  { value: "A1", label: "A1 – początkujący" },
  { value: "A2", label: "A2 – podstawowy" },
  { value: "B1", label: "B1 – średnio zaawansowany" },
  { value: "B2", label: "B2 – wyższy średni" },
  { value: "C1", label: "C1 – zaawansowany" },
  { value: "C2", label: "C2 – biegły" },
];

/** Rozbija zapis „język – poziom" na części do edycji w dropdownach. */
function parseLanguage(entry: string): { lang: string; level: string } {
  const parts = entry.split(/\s+[–-]\s+/);
  return { lang: (parts[0] ?? "").trim(), level: (parts[1] ?? "").trim() };
}

function composeLanguage(lang: string, level: string): string {
  if (!lang) return "";
  return level ? `${lang} – ${level}` : lang;
}

export function LanguagesDialog({ trigger }: { trigger: ReactNode }) {
  const languages = useCvStore((s) => s.cv.languages);
  const setLanguages = useCvStore((s) => s.setLanguages);

  const items = languages.map(parseLanguage);

  const update = (i: number, patch: { lang?: string; level?: string }) => {
    const next = items.map((it, idx) =>
      idx === i ? { ...it, ...patch } : it
    );
    setLanguages(next.map((it) => composeLanguage(it.lang, it.level)));
  };
  const add = () => setLanguages([...languages, ""]);
  const remove = (i: number) =>
    setLanguages(languages.filter((_, idx) => idx !== i));

  return (
    <SectionShell section="languages" trigger={trigger}>
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Brak języków. Dodaj pierwszy.
          </p>
        )}
        {items.map((it, i) => {
          // Języki spoza listy (np. z importu AI) też mają być wybieralne.
          const langOptions = it.lang && !LANGUAGE_OPTIONS.includes(it.lang)
            ? [it.lang, ...LANGUAGE_OPTIONS]
            : LANGUAGE_OPTIONS;
          const levelKnown =
            !it.level || LEVEL_OPTIONS.some((l) => l.value === it.level);
          return (
            <div key={i} className="flex items-end gap-2">
              <div className="grid flex-1 gap-1.5">
                {i === 0 && <Label>Język</Label>}
                <Select
                  value={it.lang || undefined}
                  onValueChange={(lang) => update(i, { lang })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz język" />
                  </SelectTrigger>
                  <SelectContent>
                    {langOptions.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-[52%] gap-1.5">
                {i === 0 && <Label>Poziom</Label>}
                <Select
                  value={it.level || undefined}
                  onValueChange={(level) => update(i, { level })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz poziom" />
                  </SelectTrigger>
                  <SelectContent>
                    {!levelKnown && it.level && (
                      <SelectItem value={it.level}>{it.level}</SelectItem>
                    )}
                    {LEVEL_OPTIONS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                aria-label="Usuń język"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5 self-start"
          onClick={add}
        >
          <Plus className="size-4" />
          Dodaj język
        </Button>
      </div>
    </SectionShell>
  );
}

/* ---------- RODO ---------- */
export function RodoDialog({ trigger }: { trigger: ReactNode }) {
  const rodo = useCvStore((s) => s.cv.rodo_clause);
  const setRodo = useCvStore((s) => s.setRodo);
  const [restored, setRestored] = useState(false);

  const restore = () => {
    setRodo(
      "Wyrażam zgodę na przetwarzanie moich danych osobowych przez [nazwa firmy] w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko."
    );
    setRestored(true);
    setTimeout(() => setRestored(false), 2000);
  };

  return (
    <SectionShell section="rodo" trigger={trigger}>
      <div className="grid gap-1.5">
        <Label htmlFor="rodo">Treść klauzuli</Label>
        <Textarea
          id="rodo"
          rows={4}
          value={rodo}
          onChange={(e) => setRodo(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Podmień „[nazwa firmy]" na pracodawcę, jeśli tego wymaga.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={restore}>
            {restored ? "Przywrócono" : "Przywróć domyślną"}
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}

/** Mapa: id sekcji → jej modal edycji. */
export const SECTION_DIALOGS: Record<
  SectionId,
  (props: { trigger: ReactNode }) => ReactNode
> = {
  summary: SummaryDialog,
  experience: ExperienceDialog,
  projects: ProjectsDialog,
  skills: SkillsDialog,
  education: EducationDialog,
  languages: LanguagesDialog,
  rodo: RodoDialog,
};
