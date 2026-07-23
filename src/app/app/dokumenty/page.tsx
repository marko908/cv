"use client";

import Link from "next/link";
import { FileText, Plus, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { NewCvDialog } from "@/components/new-cv-dialog";
import { TemplateThumb } from "@/components/template-thumb";
import { useCvStore } from "@/lib/store";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card-surface flex-1 p-4">
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DokumentyPage() {
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);
  const jobPosting = useCvStore((s) => s.jobPosting);
  const aiMeta = useCvStore((s) => s.aiMeta);

  const hasCv =
    cv.personal_info.full_name.trim().length > 0 || cv.experience.length > 0;
  const score =
    aiMeta.matchScoreAfter !== undefined ? `${aiMeta.matchScoreAfter}%` : "—";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      {/* Nagłówek huba */}
      <div className="card-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-muted-foreground">Dokumenty</p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight">
              Twoje dokumenty w jednym miejscu
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Zbuduj CV, dopasuj je do oferty i pobierz PDF — wszystko stąd.
            </p>
          </div>
          <NewCvDialog
            trigger={
              <Button className="gap-2">
                <Plus className="size-4" />
                Nowe CV
              </Button>
            }
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <StatCard value={hasCv ? "1" : "0"} label="CV" />
          <StatCard
            value={jobPosting.text.trim() ? "1" : "0"}
            label="Oferty pracy"
          />
          <StatCard value={score} label="Wynik dopasowania" />
          <StatCard value={score} label="Najlepszy wynik" />
        </div>
      </div>

      {/* Lista dokumentów */}
      <div className="card-surface mt-6 p-6">
        {hasCv ? (
          <div className="flex flex-wrap items-center gap-6">
            <TemplateThumb template={template} cv={cv} width={120} />
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-muted-foreground">
                Szablon: {template}
              </p>
              <h2 className="mt-1 truncate text-base font-bold">
                {cv.personal_info.full_name || "CV bez nazwy"}
                {cv.personal_info.title && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    — {cv.personal_info.title}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Zapisane lokalnie w tej przeglądarce.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="gap-2">
                  <Link href="/app/kreator">
                    <SquarePen className="size-4" />
                    Otwórz w kreatorze
                  </Link>
                </Button>
                <NewCvDialog
                  trigger={
                    <Button size="sm" variant="secondary">
                      Zmień szablon
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            eyebrow="Pusta biblioteka"
            title="Nie masz jeszcze żadnego CV"
            description="Stwórz pierwsze CV, aby dopasowywać je do ofert, śledzić wynik dopasowania i pobierać gotowe PDF-y."
            action={
              <NewCvDialog
                trigger={
                  <Button className="gap-2">
                    <Plus className="size-4" />
                    Nowe CV
                  </Button>
                }
              />
            }
          />
        )}
      </div>
    </div>
  );
}
