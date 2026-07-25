"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateThumb } from "@/components/template-thumb";
import { useCvStore, type TemplateId } from "@/lib/store";
import { sampleCv } from "@/lib/sample-cv";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

/**
 * Modal wyboru szablonu (wzorzec z ResuMax) z prawdziwymi miniaturami CV.
 * `redirectTo: null` = tylko zastosuj szablon do bieżącego CV (bez nawigacji).
 * `createNew` = utwórz nowe CV w bibliotece z wybranym szablonem.
 */
export function NewCvDialog({
  trigger,
  redirectTo = "/app/kreator/edytor",
  createNew = false,
}: {
  trigger: React.ReactNode;
  redirectTo?: string | null;
  createNew?: boolean;
}) {
  const router = useRouter();
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);
  const setTemplate = useCvStore((s) => s.setTemplate);
  const newCv = useCvStore((s) => s.newCv);
  const [selected, setSelected] = useState<TemplateId>(template);
  const [open, setOpen] = useState(false);

  const hasData =
    cv.personal_info.full_name.trim().length > 0 || cv.experience.length > 0;
  const thumbCv = hasData ? cv : sampleCv;
  const selectedName = CV_TEMPLATES.find((t) => t.id === selected)?.name;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(template);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* Układ flex-kolumnowy: nagłówek i stopka stałe, szablony w środku
          przewijają się. Dzięki temu przycisk zatwierdzenia jest ZAWSZE widoczny
          na dole — niezależnie od liczby szablonów i wysokości ekranu. */}
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 shadow-dialog sm:max-w-3xl">
        <DialogHeader className="shrink-0 p-4 pb-3">
          <p className="eyebrow text-muted-foreground">Szablony</p>
          <DialogTitle>Wybierz szablon</DialogTitle>
          <DialogDescription>
            Układ jest zablokowany i przyjazny dla ATS — edytujesz tylko treść.
          </DialogDescription>
        </DialogHeader>

        {/* Środkowa, przewijana sekcja. Mobile: poziomy pasek (treść niska).
            sm+: siatka 2-kolumnowa przewijana pionowo. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-x-visible sm:pb-0">
          {CV_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={cn(
                "relative w-64 shrink-0 snap-start rounded-lg bg-secondary p-3 text-left transition-all sm:w-auto",
                selected === t.id
                  ? "shadow-elevated ring-2 ring-primary"
                  : "hover:bg-accent"
              )}
            >
              {t.recommended && (
                <span className="eyebrow absolute left-5 top-5 z-10 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                  Polecany
                </span>
              )}
              {selected === t.id && (
                <span className="absolute right-5 top-5 z-10 flex size-5 items-center justify-center rounded-full bg-primary">
                  <Check className="size-3 text-primary-foreground" />
                </span>
              )}
              <TemplateThumb
                template={t.id}
                cv={thumbCv}
                width={220}
                className="mx-auto"
              />
              <span className="mt-3 block text-sm font-bold">{t.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t.description}
              </span>
            </button>
          ))}
        </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Wybrano: <span className="font-bold">{selectedName}</span>
          </p>
          <Button
            className="btn-label gap-2 font-bold"
            onClick={() => {
              if (createNew) {
                newCv(selected);
              } else {
                setTemplate(selected);
              }
              if (redirectTo) router.push(redirectTo);
              else setOpen(false);
            }}
          >
            <Check className="size-4" />
            {createNew ? "Utwórz CV" : "Zastosuj szablon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
