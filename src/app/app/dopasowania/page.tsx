"use client";

import Link from "next/link";
import { ArrowRight, Lock, LockOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { EmptyState } from "@/components/empty-state";
import { SelectCvDialog } from "@/components/select-cv-dialog";
import { useCvStore, useMaSubskrypcje } from "@/lib/store";
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
  const maSubskrypcje = useMaSubskrypcje();
  const odblokowane = useCvStore((s) => s.odblokowaneDopasowania);
  const removeTailoring = useCvStore((s) => s.removeTailoring);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Dopasowania</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight">
            Historia dopasowań CV do ofert
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Każde uruchomienie „Dopasuj do oferty" zapisuje się tutaj — z ofertą,
            wynikiem i przerobionym CV.
          </p>
        </div>
        <SelectCvDialog
          trigger={
            <Button className="shrink-0 gap-2 font-bold">
              <Target className="size-4" />
              Dopasuj CV do oferty
            </Button>
          }
        />
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
                <Link href="/app/kreator">
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
            const unlocked = maSubskrypcje || odblokowane.includes(t.id);
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
                  {/* Na telefonie badge NIE stoi obok tytułu: jest `shrink-0`,
                      więc zabierał wiersz i tytuł ucinał się po ~10 znakach
                      („Frontend D…") — nie dało się rozpoznać oferty. Poniżej
                      `sm` badge schodzi pod tytuł, a tytuł dostaje dwie linijki. */}
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <p className="line-clamp-2 text-sm font-bold sm:truncate sm:line-clamp-none">
                      {t.jobTitle}
                    </p>
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

                <ConfirmDeleteButton
                  onDelete={() => removeTailoring(t.id)}
                  label={`Usuń dopasowanie ${t.jobTitle}`}
                />
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
