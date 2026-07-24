"use client";

import { forwardRef } from "react";
import {
  ChevronRight,
  FileUp,
  Lock,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCvStore, sectionHasData, type SectionId } from "@/lib/store";
import { SECTION_META, SECTION_ORDER } from "@/lib/sections";
import type { TailoredCv } from "@/lib/cv-schema";
import { PersonalInfoDialog, SECTION_DIALOGS } from "./section-dialogs";
import { AddSectionDialog } from "./add-section-dialog";
import { SampleCvPicker } from "@/components/sample-cv-picker";
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
  const enabledSections = useCvStore((s) => s.enabledSections);
  const removeSection = useCvStore((s) => s.removeSection);
  const loadCv = useCvStore((s) => s.loadCv);

  const personalFilled =
    cv.personal_info.full_name.trim().length > 0 &&
    cv.personal_info.email.trim().length > 0;

  const ordered = SECTION_ORDER.filter((id) => enabledSections.includes(id));

  return (
    <div className="flex flex-col gap-2">
      {/* Wgranie własnego CV — wyeksponowane na górze */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled
            className="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-90"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15">
              <FileUp className="size-4 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">
                Wgraj swoje CV (PDF / DOCX)
              </span>
              <span className="block text-xs text-muted-foreground">
                Wypełnimy formularz automatycznie na podstawie pliku.
              </span>
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>Import z pliku dodamy w kroku 2</TooltipContent>
      </Tooltip>

      <p className="eyebrow mt-3 px-1 text-muted-foreground">Sekcje CV</p>

      {/* Dane osobowe — zawsze obecne, zablokowane */}
      <PersonalInfoDialog
        trigger={
          <SectionRow
            icon={UserRound}
            label="Dane osobowe"
            status={personalFilled ? "Uzupełnione" : "Wymaga uzupełnienia"}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeSection(id)}
                  aria-label={`Usuń sekcję ${meta.label}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Usuń sekcję</TooltipContent>
            </Tooltip>
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

      {/* Skrót do przykładu / wyczyszczenia */}
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <SampleButtons loadCv={loadCv} />
      </div>
    </div>
  );
}

function SampleButtons({ loadCv }: { loadCv: (cv: TailoredCv) => void }) {
  const resetCv = useCvStore((s) => s.resetCv);
  return (
    <>
      <SampleCvPicker onSelect={(cv) => loadCv(cv)} compact />
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-xs text-muted-foreground"
        onClick={resetCv}
      >
        Wyczyść
      </Button>
    </>
  );
}
