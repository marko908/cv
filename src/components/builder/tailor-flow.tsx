"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  Link2,
  Loader2,
  Lock,
  RefreshCw,
  Target,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useCvStore } from "@/lib/store";
import { buildTailoring, REVIEW_SPECIALISTS } from "@/lib/mock-review";
import { PaywallDialog } from "./paywall-dialog";
import { cn, pluralize } from "@/lib/utils";

type Step = "config" | "running" | "result";

export function TailorFlow({
  trigger,
  defaultOpen = false,
}: {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [step, setStep] = useState<Step>("config");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [tailoringId, setTailoringId] = useState<string | null>(null);

  const {
    cv,
    template,
    jobPosting,
    setJobPosting,
    aiMeta,
    setAiMeta,
    resetReview,
    addTailoring,
  } = useCvStore();

  // Otwórz, gdy sygnał z zewnątrz (np. ?oferta=1) się pojawi.
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  // Edytor dotyczy konkretnego (aktywnego) CV, więc od razu konfiguracja
  // — bez wyboru CV. Jeśli wynik już jest, pokazujemy go.
  useEffect(() => {
    if (!open) return;
    setStep(aiMeta.matchScoreAfter !== undefined ? "result" : "config");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-h-[88vh] overflow-y-auto shadow-dialog sm:max-w-xl">
          {step === "config" && (
            <ConfigStep
              jobPosting={jobPosting}
              setJobPosting={setJobPosting}
              onRun={() => setStep("running")}
            />
          )}
          {step === "running" && (
            <RunningStep
              onDone={() => {
                const t = buildTailoring(cv, jobPosting, template);
                addTailoring(t);
                setAiMeta(t.aiMeta);
                setTailoringId(t.id);
                setStep("result");
              }}
              onCancel={() => setStep("config")}
            />
          )}
          {step === "result" && (
            <ResultStep
              tailoringId={tailoringId}
              onClose={() => setOpen(false)}
              onRerun={() => {
                resetReview();
                setStep("config");
              }}
              onUnlock={() => setPaywallOpen(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
}

/* ---------- Ekran 1: konfiguracja ---------- */
function ConfigStep({
  jobPosting,
  setJobPosting,
  onRun,
}: {
  jobPosting: { url: string; text: string };
  setJobPosting: (patch: { url?: string; text?: string }) => void;
  onRun: () => void;
}) {
  const canRun = jobPosting.text.trim().length >= 40;
  return (
    <>
      <DialogHeader>
        <p className="eyebrow flex items-center gap-1.5 text-primary">
          <Target className="size-3.5" />
          Dopasowanie do oferty
        </p>
        <DialogTitle>Dopasuj CV do oferty</DialogTitle>
        <DialogDescription>
          Panel „rekruterów" oceni Twoje CV pod kątem tej oferty i wskaże
          konkretne poprawki — po polsku, pod ATS.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="flow-url" className="flex items-center gap-1.5">
            <Link2 className="size-3.5" />
            Link do oferty (opcjonalnie)
          </Label>
          <Input
            id="flow-url"
            value={jobPosting.url}
            onChange={(e) => setJobPosting({ url: e.target.value })}
            placeholder="https://www.pracuj.pl/praca/..."
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="flow-text">Treść ogłoszenia</Label>
          <Textarea
            id="flow-text"
            rows={8}
            value={jobPosting.text}
            onChange={(e) => setJobPosting({ text: e.target.value })}
            placeholder="Wklej pełną treść — wymagania, obowiązki, mile widziane. Im więcej szczegółów, tym trafniejszy wynik."
          />
          <p className="text-xs text-muted-foreground">
            Jeśli pobranie z linku się nie powiedzie, poprosimy o wklejenie
            treści — to zawsze działa.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="eyebrow text-muted-foreground">
          Panel rekruterów · ~30&nbsp;s
        </span>
        <Button
          className="btn-label gap-2 font-bold"
          disabled={!canRun}
          onClick={onRun}
        >
          Uruchom analizę
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </>
  );
}

/* ---------- Ekran 2: analiza w toku ---------- */
function RunningStep({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const [doneCount, setDoneCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    REVIEW_SPECIALISTS.forEach((spec, i) => {
      timers.push(
        setTimeout(() => {
          setDoneCount((n) => n + 1);
          // Dopisujemy na dole — kolejność narasta, tekst nie „skacze".
          setLog((l) => [...l, `${spec.label} — ${spec.note}`]);
        }, 500 + i * 650)
      );
    });
    // finalizacja po ostatnim specjaliście
    timers.push(
      setTimeout(
        () => doneRef.current(),
        700 + REVIEW_SPECIALISTS.length * 650
      )
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const total = REVIEW_SPECIALISTS.length;

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
          Przerwij
        </button>
        <span className="eyebrow text-primary">Analiza…</span>
      </div>

      <DialogHeader>
        <DialogTitle>Analizujemy Twoje CV</DialogTitle>
        <DialogDescription>
          Pięciu specjalistów ocenia je równolegle, potem składamy raport.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        {REVIEW_SPECIALISTS.map((spec, i) => {
          const done = i < doneCount;
          const running = i === doneCount;
          return (
            <div
              key={spec.id}
              className="flex items-center justify-between rounded-md px-1 py-1.5"
            >
              <span className="flex items-center gap-2.5 text-sm">
                {done ? (
                  <Check className="size-4 text-primary" />
                ) : running ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="size-4 rounded-full border border-muted-foreground/40" />
                )}
                <span className={done ? "text-foreground" : "text-muted-foreground"}>
                  {spec.label}
                </span>
              </span>
              <span className="eyebrow text-muted-foreground">
                {done ? "gotowe" : running ? "w toku" : "czeka"}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-1 flex justify-between">
          <span className="eyebrow text-muted-foreground">Specjaliści</span>
          <span className="eyebrow text-muted-foreground">
            {doneCount} / {total} gotowe
          </span>
        </div>
        <Progress value={(doneCount / total) * 100} />
      </div>

      {log.length > 0 && (
        <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          {log.map((line, i) => (
            <li key={i} className="truncate">
              • {line}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- Ekran 3: wynik ---------- */
const FREE_FINDINGS = 2; // ile poprawek widać przed opłatą

function ResultStep({
  tailoringId,
  onClose,
  onRerun,
  onUnlock,
}: {
  tailoringId: string | null;
  onClose: () => void;
  onRerun: () => void;
  onUnlock: () => void;
}) {
  const aiMeta = useCvStore((s) => s.aiMeta);
  const score = aiMeta.matchScoreAfter ?? 0;
  const before = aiMeta.matchScoreBefore;
  const findings = aiMeta.findings ?? [];
  const unlocked = aiMeta.unlocked ?? false;
  const fixCount = findings.length;
  const lockedCount = Math.max(0, fixCount - FREE_FINDINGS);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-1.5 text-primary">
          <Target className="size-3.5" />
          Wynik dopasowania
        </p>
        <button
          type="button"
          onClick={onRerun}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-3.5" />
          Analizuj ponownie
        </button>
      </div>

      {/* Wynik ogólny */}
      <div className="rounded-lg bg-secondary p-5 text-center">
        <p className="eyebrow text-muted-foreground">Dopasowanie do oferty</p>
        <p className="mt-1 font-mono text-4xl font-bold text-primary">
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </p>
        {before !== undefined && (
          <p className="mt-1 text-sm text-muted-foreground">
            przed dopasowaniem: {before}/100 —{" "}
            <span className="font-bold text-primary">+{score - before}</span>
          </p>
        )}
      </div>

      {/* Poprawki */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted-foreground">Co poprawiliśmy</p>
          <span className="eyebrow text-muted-foreground">
            {pluralize(fixCount, "poprawka", "poprawki", "poprawek")}
          </span>
        </div>

        {findings.map((f, i) => {
          // Pierwsze poprawki widoczne za darmo; reszta za paywallem.
          const visible = unlocked || i < FREE_FINDINGS;
          return (
            <div key={f.id} className="rounded-lg bg-secondary p-3">
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

      {/* Paywall CTA */}
      {!unlocked && lockedCount > 0 && (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-center">
          <Lock className="mx-auto size-5 text-primary" />
          <p className="mt-2 text-sm font-bold">
            Zobacz wszystkie{" "}
            {pluralize(fixCount, "poprawkę", "poprawki", "poprawek")} i pobierz
            przerobione CV
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Odblokuj pełny raport z gotowymi przeróbkami oraz dopasowane CV do
            edycji i pobrania.
          </p>
          <Button className="btn-label mt-3 w-full font-bold" onClick={onUnlock}>
            Odblokuj raport i CV
          </Button>
        </div>
      )}

      {unlocked && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">
            <Check className="size-4" />
            Pełny raport i przerobione CV odblokowane
          </div>
          {tailoringId && (
            <Button asChild className="btn-label w-full gap-2 font-bold">
              <Link
                href={`/app/dopasowania/${tailoringId}`}
                onClick={onClose}
              >
                <Download className="size-4" />
                Otwórz przerobione CV
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
