"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TemplateThumb } from "@/components/template-thumb";
import { useCvStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Wybór CV do dopasowania (uruchamiane spoza edytora — z Dopasowań/Startu).
 * Po wyborze otwiera edytor danego CV z aktywnym oknem dopasowania (?oferta=1).
 * „Dodaj nowe CV" prowadzi do listy Moje CV, gdzie tworzy się CV od nowa.
 */
export function SelectCvDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const cvs = useCvStore((s) => s.cvs);
  const activeCvId = useCvStore((s) => s.activeCvId);
  const openCv = useCvStore((s) => s.openCv);
  const [open, setOpen] = useState(false);

  const choose = (id: string) => {
    openCv(id);
    setOpen(false);
    router.push("/app/kreator/edytor?oferta=1");
  };

  const goToList = () => {
    setOpen(false);
    router.push("/app/kreator");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-dialog sm:max-w-2xl">
        <DialogHeader>
          <p className="eyebrow text-primary">Dopasowanie do oferty</p>
          <DialogTitle>Które CV chcesz dopasować?</DialogTitle>
          <DialogDescription>
            Wybierz CV, które dopasujemy do oferty. Jedno CV możesz dopasować do
            wielu różnych ofert.
          </DialogDescription>
        </DialogHeader>

        {cvs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz jeszcze żadnego CV. Utwórz pierwsze, aby je dopasować.
            </p>
            <button
              type="button"
              onClick={goToList}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Plus className="size-4" />
              Utwórz CV
            </button>
          </div>
        ) : (
          // Jedna kolumna na telefonie — przy dwóch miniatura CV robiła się
          // nieczytelna, a wcześniej sztywne `width={200}` w węższej kolumnie
          // ucinało podgląd w połowie.
          <div className="grid max-h-[60dvh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-3">
            {/* „Dodaj nowe" → lista Moje CV (tam tworzenie CV). Pierwsze
                w kolejności, żeby nie szukać go pod listą CV. */}
            <button
              type="button"
              onClick={goToList}
              className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-4 text-primary transition-colors hover:border-primary hover:bg-primary/10 sm:min-h-[200px]"
            >
              <span className="flex size-11 items-center justify-center rounded-full border-2 border-primary/50">
                <Plus className="size-5" />
              </span>
              <span className="text-sm font-bold">Dodaj nowe CV</span>
            </button>

            {cvs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => choose(item.id)}
                className={cn(
                  "relative rounded-lg bg-secondary p-3 text-left transition-all hover:bg-accent",
                  item.id === activeCvId && "ring-2 ring-primary"
                )}
              >
                {item.id === activeCvId && (
                  <span className="absolute right-4 top-4 z-10 flex size-5 items-center justify-center rounded-full bg-primary">
                    <Check className="size-3 text-primary-foreground" />
                  </span>
                )}
                <TemplateThumb
                  template={item.template}
                  cv={item.cv}
                  crop={0.7}
                  className="overflow-hidden rounded-md"
                />
                <span className="mt-2 block truncate text-sm font-bold">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
