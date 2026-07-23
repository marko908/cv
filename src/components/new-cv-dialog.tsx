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
import { cn } from "@/lib/utils";

const templates: { id: TemplateId; name: string; description: string }[] = [
  {
    id: "nowoczesny",
    name: "Nowoczesny",
    description:
      "Granatowe akcenty, czytelna hierarchia. Jedna kolumna — w 100% czytelna dla ATS.",
  },
  {
    id: "klasyczny",
    name: "Klasyczny",
    description:
      "Czerń i biel, zero ozdobników. Bezpieczny wybór do konserwatywnych branż.",
  },
];

/**
 * Modal wyboru szablonu (wzorzec z ResuMax) z prawdziwymi miniaturami CV.
 * `redirectTo: null` = tylko zastosuj szablon, bez nawigacji (użycie w kreatorze).
 */
export function NewCvDialog({
  trigger,
  redirectTo = "/app/kreator",
}: {
  trigger: React.ReactNode;
  redirectTo?: string | null;
}) {
  const router = useRouter();
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);
  const setTemplate = useCvStore((s) => s.setTemplate);
  const [selected, setSelected] = useState<TemplateId>(template);
  const [open, setOpen] = useState(false);

  const hasData =
    cv.personal_info.full_name.trim().length > 0 || cv.experience.length > 0;
  const thumbCv = hasData ? cv : sampleCv;
  const selectedName = templates.find((t) => t.id === selected)?.name;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(template);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-dialog sm:max-w-2xl">
        <DialogHeader>
          <p className="eyebrow text-muted-foreground">Szablony</p>
          <DialogTitle>Wybierz szablon</DialogTitle>
          <DialogDescription>
            Układ jest zablokowany i przyjazny dla ATS — edytujesz tylko treść.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={cn(
                "relative rounded-lg bg-secondary p-3 text-left transition-all",
                selected === t.id
                  ? "shadow-elevated ring-2 ring-primary"
                  : "hover:bg-accent"
              )}
            >
              {t.id === "nowoczesny" && (
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
                width={260}
                className="w-full"
              />
              <span className="mt-3 block text-sm font-bold">{t.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t.description}
              </span>
            </button>
          ))}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Wybrano: <span className="font-bold">{selectedName}</span>
          </p>
          <Button
            className="btn-label gap-2 font-bold"
            onClick={() => {
              setTemplate(selected);
              if (redirectTo) router.push(redirectTo);
              else setOpen(false);
            }}
          >
            <Check className="size-4" />
            Zastosuj szablon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
