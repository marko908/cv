"use client";

import { forwardRef } from "react";
import {
  ChevronRight,
  Lock,
  Plus,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { useCvStore, sectionHasData, type SectionId } from "@/lib/store";
import { SECTION_META, SECTION_ORDER } from "@/lib/sections";
import { templateUsesPhoto } from "@/lib/cv-templates";
import type { TailoredCv } from "@/lib/cv-schema";
import { PersonalInfoDialog, SECTION_DIALOGS } from "./section-dialogs";
import { AddSectionDialog } from "./add-section-dialog";
import { CvImportButton } from "@/components/cv-import-button";
import { cn } from "@/lib/utils";

/** Krótki status wypełnienia sekcji pokazywany w wierszu. */
function sectionStatus(id: SectionId, cv: TailoredCv): string {
  if (!sectionHasData(id, cv)) return "Wymaga uzupełnienia";
  switch (id) {
    case "experience":
      return `${cv.experience.length} ${plural(cv.experience.length, "pozycja", "pozycje", "pozycji")}`;
    case "projects":
      return `${cv.projects.length} ${plural(cv.projects.length, "projekt", "projekty", "projektów")}`;
    case "education":
      return `${cv.education.length} ${plural(cv.education.length, "wpis", "wpisy", "wpisów")}`;
    case "skills": {
      const n =
        cv.skills.technical.filter(Boolean).length +
        cv.skills.soft_and_tools.filter(Boolean).length;
      return `${n} ${plural(n, "umiejętność", "umiejętności", "umiejętności")}`;
    }
    case "languages":
      return `${cv.languages.filter(Boolean).length} ${plural(cv.languages.filter(Boolean).length, "język", "języki", "języków")}`;
    case "summary":
    case "rodo":
      return "Uzupełnione";
  }
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

interface RowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: string;
  filled: boolean;
  locked?: boolean;
}

/** Wiersz sekcji — służy jako trigger modala edycji (Radix asChild). */
const SectionRow = forwardRef<HTMLButtonElement, RowProps>(function SectionRow(
  { icon: Icon, label, status, filled, locked, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent"
      {...props}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          {label}
          {locked && <Lock className="size-3 text-muted-foreground" />}
        </span>
        <span
          className={cn(
            "block text-xs",
            filled ? "text-muted-foreground" : "text-primary"
          )}
        >
          {status}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
});

export function SectionList() {
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);
  const enabledSections = useCvStore((s) => s.enabledSections);
  const removeSection = useCvStore((s) => s.removeSection);

  const personalFilled =
    cv.personal_info.full_name.trim().length > 0 &&
    cv.personal_info.email.trim().length > 0;
  // Zdjęcie jest opcjonalne, ale gdy szablon ma na nie miejsce, dajemy o tym
  // znać zamiast po cichu pokazywać "Uzupełnione" — inaczej użytkownik nie wie,
  // że w ogóle może je dodać.
  const brakZdjecia = templateUsesPhoto(template) && !cv.personal_info.photo;
  const personalStatus = !personalFilled
    ? "Wymaga uzupełnienia"
    : brakZdjecia
      ? "Dodaj zdjęcie profilowe"
      : "Uzupełnione";

  const ordered = SECTION_ORDER.filter((id) => enabledSections.includes(id));

  return (
    <div className="flex flex-col gap-2">
      {/* Wgranie własnego CV — wyeksponowane na górze, wypełnia bieżące CV */}
      <CvImportButton />

      <p className="eyebrow mt-3 px-1 text-muted-foreground">Sekcje CV</p>

      {/* Dane osobowe — zawsze obecne, zablokowane */}
      <PersonalInfoDialog
        trigger={
          <SectionRow
            icon={UserRound}
            label="Dane osobowe"
            status={personalStatus}
            filled={personalFilled}
            locked
          />
        }
      />

      {/* Sekcje dynamiczne */}
      {ordered.map((id) => {
        const meta = SECTION_META[id];
        const Dialog = SECTION_DIALOGS[id];
        const filled = sectionHasData(id, cv);
        return (
          <div key={id} className="group flex items-center gap-1">
            <Dialog
              trigger={
                <SectionRow
                  icon={meta.icon}
                  label={meta.label}
                  status={sectionStatus(id, cv)}
                  filled={filled}
                />
              }
            />
            <ConfirmDeleteButton
              onDelete={() => removeSection(id)}
              label={`Usuń sekcję ${meta.label}`}
            />
          </div>
        );
      })}

      {/* Akcje */}
      <div className="mt-2">
        <AddSectionDialog
          trigger={
            <Button variant="secondary" className="w-full gap-2">
              <Plus className="size-4" />
              Dodaj sekcję
            </Button>
          }
        />
      </div>

      {/* Był tu pasek narzędzi deweloperskich: wczytanie przykładowego CV
          i „Wyczyść". Usunięty 2026-08-04 — przykłady służyły wyłącznie
          testom Marka, a „Wyczyść" kasowało całe CV jednym kliknięciem, bez
          potwierdzenia i bez cofnięcia. Po przejściu na bazę taka pomyłka
          propaguje się na wszystkie urządzenia użytkownika. */}
    </div>
  );
}
