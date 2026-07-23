"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCvStore, type SectionId } from "@/lib/store";
import { SECTION_META, SECTION_ORDER } from "@/lib/sections";

/** Modal „Dodaj sekcję" (wzorzec ResuMax „ADD CONTENT") — pokazuje sekcje,
 *  których jeszcze nie ma w edytorze. */
export function AddSectionDialog({ trigger }: { trigger: ReactNode }) {
  const enabled = useCvStore((s) => s.enabledSections);
  const addSection = useCvStore((s) => s.addSection);
  const [open, setOpen] = useState(false);

  const available = SECTION_ORDER.filter((id) => !enabled.includes(id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-dialog sm:max-w-2xl">
        <DialogHeader>
          <p className="eyebrow text-muted-foreground">Dodaj zawartość</p>
          <DialogTitle>Wybierz sekcję do dodania</DialogTitle>
          <DialogDescription>
            Rozbuduj CV o kolejne sekcje. Układ pozostaje przyjazny dla ATS.
          </DialogDescription>
        </DialogHeader>

        {available.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Wszystkie dostępne sekcje są już w Twoim CV.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {available.map((id) => {
              const meta = SECTION_META[id as SectionId];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    addSection(id);
                    setOpen(false);
                  }}
                  className="flex items-start gap-3 rounded-lg bg-secondary p-4 text-left transition-colors hover:bg-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent">
                    <meta.icon className="size-4 text-primary" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {meta.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
