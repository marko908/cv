"use client";

import Link from "next/link";
import {
  ArrowRight,
  Lock,
  LockOpen,
  Target,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { useCvStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DopasowaniaPage() {
  const tailorings = useCvStore((s) => s.tailorings);
  const removeTailoring = useCvStore((s) => s.removeTailoring);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-6">
        <p className="eyebrow text-muted-foreground">Dopasowania</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">
          Historia dopasowań CV do ofert
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Każde uruchomienie „Dopasuj do oferty" zapisuje się tutaj — z ofertą,
          wynikiem i przerobionym CV.
        </p>
      </div>

      {tailorings.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Target}
            eyebrow="Brak dopasowań"
            title="Nie masz jeszcze żadnego dopasowania"
            description="Otwórz kreator, wklej ofertę pracy i uruchom analizę — wynik i przerobione CV pojawią się na tej liście."
            action={
              <Button asChild className="gap-2">
                <Link href="/app/kreator?oferta=1">
                  Dopasuj CV do oferty
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tailorings.map((t) => {
            const unlocked = t.aiMeta.unlocked ?? false;
            const score = t.aiMeta.matchScoreAfter ?? 0;
            return (
              <div
                key={t.id}
                className="card-surface card-surface-hover group flex items-center gap-4 p-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Target className="size-5 text-primary" />
                </div>

                <Link
                  href={`/app/dopasowania/${t.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold">{t.jobTitle}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 gap-1",
                        unlocked
                          ? "border-primary/40 text-primary"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {unlocked ? (
                        <>
                          <LockOpen className="size-3" /> Odblokowane
                        </>
                      ) : (
                        <>
                          <Lock className="size-3" /> Podgląd
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(t.createdAt)} · dopasowanie{" "}
                    <span className="font-bold text-primary">{score}/100</span>
                  </p>
                </Link>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeTailoring(t.id)}
                  aria-label="Usuń dopasowanie"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
