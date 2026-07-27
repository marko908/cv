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
import { TemplateGallery } from "@/components/template-gallery";
import { useCvStore, type TemplateId } from "@/lib/store";
import { sampleCv } from "@/lib/sample-cv";
import { CV_TEMPLATES } from "@/lib/cv-templates";

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

        {/* Środkowa, przewijana sekcja: kategorie w pionie, szablony w poziomie. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <TemplateGallery
            cv={thumbCv}
            selected={selected}
            onSelect={setSelected}
            thumbWidth={200}
          />
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
