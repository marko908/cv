"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Flag,
  Lock,
  Maximize2,
  Pencil,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumb } from "@/components/template-thumb";
import { PaywallDialog } from "@/components/builder/paywall-dialog";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { CvCompareDialog } from "@/components/cv-compare-dialog";
import { ReportErrorDialog } from "@/components/report-error-dialog";
import { ScoreBreakdown } from "@/components/builder/score-breakdown";
import { useCvStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DopasowanieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const tailoring = useCvStore((s) => s.tailorings.find((t) => t.id === id));
  const newCvFrom = useCvStore((s) => s.newCvFrom);
  const unlockTailoring = useCvStore((s) => s.unlockTailoring);
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (!tailoring) {
    return (
      <div className="mx-auto w-full max-w-3xl px-8 py-16 text-center">
        <p className="eyebrow text-muted-foreground">Nie znaleziono</p>
        <h1 className="mt-2 text-xl font-bold">
          To dopasowanie już nie istnieje
        </h1>
        <Button asChild variant="secondary" className="mt-6 gap-2">
          <Link href="/app/dopasowania">
            <ArrowLeft className="size-4" />
            Wróć do listy
          </Link>
        </Button>
      </div>
    );
  }

  const { aiMeta, baseCv, tailoredCv, template, jobTitle, jobUrl, jobText } =
    tailoring;
  const unlocked = aiMeta.unlocked ?? false;
  const score = aiMeta.matchScoreAfter ?? 0;
  const before = aiMeta.matchScoreBefore;
  const findings = aiMeta.findings ?? [];
  const changes = aiMeta.changesLog ?? [];

  const editInBuilder = () => {
    // Tworzymy nowe CV z przerobionego, by nie nadpisać oryginału.
    newCvFrom(tailoredCv, template, `${jobTitle} — dopasowane`);
    router.push("/app/kreator/edytor");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
      {/* Nagłówek */}
      <Link
        href="/app/dopasowania"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Dopasowania
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5 text-primary">
            <Target className="size-3.5" />
            Dopasowanie do oferty
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight">
            {jobTitle}
          </h1>
          {jobUrl && (
            <a
              href={jobUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3" />
              {jobUrl}
            </a>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-bold text-primary">
            {score}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
          {before !== undefined && score > before && (
            <p className="text-xs text-muted-foreground">
              przed: {before} · <span className="text-primary">+{score - before}</span>
            </p>
          )}
          {before !== undefined && score <= before && (
            <p className="text-xs text-muted-foreground">już dobrze dopasowane</p>
          )}
        </div>
      </div>

      {/* Rozkład wyniku — edukacja: z czego wynika liczba i co poprawiliśmy */}
      {aiMeta.scoreBreakdown && aiMeta.scoreBreakdown.length > 0 && (
        <div className="mt-6">
          <ScoreBreakdown breakdown={aiMeta.scoreBreakdown} />
        </div>
      )}

      {/* Porównanie CV przed / po */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow text-muted-foreground">
          Twoje CV — przed i po dopasowaniu
        </h2>
        <CvCompareDialog
          baseCv={baseCv}
          tailoredCv={tailoredCv}
          template={template}
          locked={!unlocked}
          onUnlock={() => setPaywallOpen(true)}
          trigger={
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Maximize2 className="size-3.5" />
              Powiększ porównanie
            </Button>
          }
        />
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="card-surface flex flex-col p-4">
          <p className="eyebrow mb-3 text-center text-muted-foreground">Przed</p>
          <TemplateThumb template={template} cv={baseCv} crop={0.9} />
        </div>
        <div className="card-surface relative flex flex-col p-4">
          <p className="eyebrow mb-3 text-center text-primary">Po dopasowaniu</p>
          <div className={cn("w-full", !unlocked && "blur-sm")}>
            <TemplateThumb template={template} cv={tailoredCv} crop={0.9} />
          </div>
          {!unlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/60 p-4 text-center backdrop-blur-[2px]">
              <Lock className="size-6 text-primary" />
              <p className="text-sm font-bold">Przerobione CV jest zablokowane</p>
              <Button
                size="sm"
                className="btn-label font-bold"
                onClick={() => setPaywallOpen(true)}
              >
                Odblokuj
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Akcje na przerobionym CV */}
      {unlocked && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="gap-2" onClick={editInBuilder}>
            <Pencil className="size-4" />
            Edytuj przerobione CV w kreatorze
          </Button>
          <DownloadPdfButton
            cv={tailoredCv}
            template={template}
            variant="secondary"
          />
        </div>
      )}

      {/* Zmiany z uzasadnieniem */}
      <h2 className="mt-8 eyebrow text-muted-foreground">
        Co zmieniliśmy i dlaczego
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {changes.map((c, i) => {
          const visible = unlocked || i === 0;
          return (
            <div key={i} className="card-surface p-4">
              <p className="text-sm font-bold text-primary">{c.section}</p>
              {visible ? (
                <>
                  <p className="mt-1 text-sm">{c.change}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.reason}
                  </p>
                </>
              ) : (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3" />
                  Szczegóły w pełnym raporcie
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Wskazówki, które zastosowaliśmy */}
      {findings.length > 0 && (
        <>
          <h2 className="mt-8 eyebrow text-muted-foreground">
            Na co zwróciliśmy uwagę
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {findings.map((f, i) => {
              const visible = unlocked || i < 2;
              return (
                <div key={f.id} className="card-surface p-4">
                  <p className="text-sm font-bold">{f.title}</p>
                  {visible ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {f.detail}
                    </p>
                  ) : (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3" />
                      Szczegóły w pełnym raporcie
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Treść oferty */}
      <details className="card-surface mt-8 p-4">
        <summary className="cursor-pointer text-sm font-bold">
          Treść oferty, do której dopasowano CV
        </summary>
        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {jobText}
        </p>
      </details>

      {/* Paywall CTA na dole (gdy zablokowane) */}
      {!unlocked && (
        <div className="mt-8 rounded-lg border border-primary/40 bg-primary/5 p-6 text-center">
          <Lock className="mx-auto size-6 text-primary" />
          <p className="mt-2 text-base font-bold">
            Odblokuj pełne dopasowanie
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Zobacz wszystkie poprawki i uzasadnienia, odblokuj przerobione CV do
            edycji i pobierz gotowy plik.
          </p>
          <Button
            className="btn-label mt-4 font-bold"
            onClick={() => setPaywallOpen(true)}
          >
            Odblokuj to dopasowanie
          </Button>
        </div>
      )}

      {unlocked && (
        <div className="mt-8 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">
          <Check className="size-4" />
          To dopasowanie jest w pełni odblokowane
        </div>
      )}

      {/* Zgłoszenie błędu */}
      <div className="mt-8 flex flex-col items-center gap-2 border-t border-border/60 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Coś jest nie tak z tym dopasowaniem lub przerobionym CV?
        </p>
        <ReportErrorDialog
          tailoringId={id}
          jobTitle={jobTitle}
          trigger={
            <Button variant="ghost" size="sm" className="gap-2">
              <Flag className="size-4" />
              Zgłoś błąd
            </Button>
          }
        />
      </div>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        onUnlock={() => unlockTailoring(id)}
      />
    </div>
  );
}
