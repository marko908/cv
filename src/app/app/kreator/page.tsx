"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumb } from "@/components/template-thumb";
import { NewCvDialog } from "@/components/new-cv-dialog";
import { useCvStore } from "@/lib/store";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function KreatorListPage() {
  const router = useRouter();
  const cvs = useCvStore((s) => s.cvs);
  const openCv = useCvStore((s) => s.openCv);
  const deleteCv = useCvStore((s) => s.deleteCv);

  const open = (id: string) => {
    openCv(id);
    router.push("/app/kreator/edytor");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-6">
        <p className="eyebrow text-muted-foreground">Kreator CV</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">
          Twoje CV
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Możesz mieć wiele CV — np. w różnych językach albo pod różne
          stanowiska. Każde dopasujesz do dowolnej liczby ofert.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cvs.map((item) => (
          <div key={item.id} className="group flex flex-col">
            <button
              type="button"
              onClick={() => open(item.id)}
              className="card-surface card-surface-hover relative overflow-hidden rounded-lg p-3 transition-shadow hover:shadow-elevated"
            >
              <div className="overflow-hidden rounded-md">
                <TemplateThumb
                  template={item.template}
                  cv={item.cv}
                  width={220}
                  className="w-full"
                />
              </div>
              <span className="mt-3 flex items-center gap-1.5 text-sm font-bold">
                <Pencil className="size-3.5 text-primary" />
                Otwórz
              </span>
            </button>
            <div className="mt-2 flex items-start justify-between gap-2 px-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Zmiana: {formatDate(item.updatedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteCv(item.id)}
                aria-label="Usuń CV"
                className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Kafelek „Dodaj nowe" */}
        <NewCvDialog
          redirectTo="/app/kreator/edytor"
          createNew
          trigger={
            <button
              type="button"
              className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-4 text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <span className="flex size-12 items-center justify-center rounded-full border-2 border-primary/50">
                <Plus className="size-6" />
              </span>
              <span className="text-sm font-bold">Dodaj nowe CV</span>
            </button>
          }
        />
      </div>
    </div>
  );
}
