"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Check,
  Target,
  SquarePen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { SelectCvDialog } from "@/components/select-cv-dialog";
import { useCvStore, useMaDostepDo } from "@/lib/store";
import { cn } from "@/lib/utils";

function useProgress() {
  const cv = useCvStore((s) => s.cv);
  const jobPosting = useCvStore((s) => s.jobPosting);
  const aiMeta = useCvStore((s) => s.aiMeta);

  const cvFilled =
    cv.personal_info.full_name.trim().length > 0 && cv.experience.length > 0;
  const analyzed = aiMeta.matchScoreAfter !== undefined;
  // Oferta uznana za dodaną, gdy jest treść (próg zgodny z uruchomieniem
  // analizy) lub gdy analiza już się wykonała.
  const jobFilled = jobPosting.text.trim().length >= 40 || analyzed;
  return { cvFilled, jobFilled, analyzed };
}

type StepState = "done" | "now" | "next" | "soon";

function StepBadge({ state }: { state: StepState }) {
  const styles = {
    done: "bg-primary text-primary-foreground",
    now: "bg-primary/15 text-primary",
    next: "bg-secondary text-muted-foreground",
    soon: "bg-secondary text-muted-foreground",
  } as const;
  const labels = {
    done: "Gotowe",
    now: "Teraz",
    next: "Dalej",
    // NIE „Wkrótce" — to słowo w sidebarze (app-sidebar.tsx) znaczy „ta funkcja
    // jeszcze nie istnieje w produkcie". Krok 3 istnieje i działa, tylko nie
    // jest jeszcze Twoją kolejką w tym samouczku — inne znaczenie, to samo
    // słowo myliłoby użytkownika co do tego, czy analiza AI jest zbudowana.
    soon: "Krok 3",
  } as const;
  return (
    <span className={cn("eyebrow rounded-full px-2.5 py-1", styles[state])}>
      {labels[state]}
    </span>
  );
}

export default function AppHome() {
  const { analyzed } = useProgress();
  const tailorings = useCvStore((s) => s.tailorings);

  // Po ukończeniu ścieżki (jest dopasowanie) Start staje się hubem;
  // dla nowych użytkowników pełni rolę samouczka z checklistą kroków.
  if (analyzed || tailorings.length > 0) {
    return <StartHub />;
  }
  return <StartOnboarding />;
}

/* ---------- Hub: po ukończeniu ---------- */
function StartHub() {
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);
  const tailorings = useCvStore((s) => s.tailorings);
  const maDostep = useMaDostepDo(tailorings[0]?.id);
  const last = tailorings[0];

  const linkActions = [
    {
      href: "/app/dopasowania",
      icon: Briefcase,
      title: "Moje dopasowania",
      desc:
        tailorings.length > 0
          ? `Masz ${tailorings.length} ${
              tailorings.length === 1 ? "zapisane dopasowanie" : "zapisanych dopasowań"
            }.`
          : "Historia wszystkich dopasowań CV do ofert.",
    },
    {
      href: "/app/kreator",
      icon: SquarePen,
      title: "Moje CV",
      desc: "Przeglądaj, edytuj i dodawaj swoje CV.",
    },
  ];

  const cardClass =
    "card-surface card-surface-hover group flex flex-col p-5 text-left transition-shadow hover:shadow-elevated";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <p className="eyebrow text-muted-foreground">Panel</p>
      <h1 className="mt-2 max-w-xl text-balance text-3xl font-extrabold leading-tight tracking-tight">
        Twoje CV jest gotowe. Co robimy dalej?
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Dopasowanie — wybór CV przed przejściem */}
        <SelectCvDialog
          trigger={
            <button
              type="button"
              className={cn(cardClass, "ring-1 ring-primary/40")}
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Target className="size-5" />
              </span>
              <h2 className="text-base font-bold">Dopasuj do nowej oferty</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                Wybierz CV, wklej ogłoszenie i wygeneruj skrojone CV.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold">
                Przejdź
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          }
        />

        {linkActions.map((a) => (
          <Link key={a.href} href={a.href} className={cardClass}>
            <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <a.icon className="size-5" />
            </span>
            <h2 className="text-base font-bold">{a.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{a.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold">
              Przejdź
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      {/* Ostatnie dopasowanie */}
      {last && (
        <div className="card-surface mt-6 p-5">
          <p className="eyebrow text-muted-foreground">Ostatnie dopasowanie</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{last.jobTitle}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Wynik dopasowania:{" "}
                <span className="font-bold text-primary">
                  {last.aiMeta.matchScoreAfter}/100
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/app/dopasowania/${last.id}`}>
                  Otwórz dopasowanie
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {maDostep && (
                <DownloadPdfButton
                  cv={last.tailoredCv}
                  template={template}
                  size="sm"
                  variant="secondary"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!last && (
        <div className="card-surface mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-muted-foreground">
            Chcesz pobrać swoje aktualne CV?
          </p>
          <DownloadPdfButton cv={cv} template={template} size="sm" />
        </div>
      )}
    </div>
  );
}

/* ---------- Onboarding: samouczek dla nowych ---------- */
function StartOnboarding() {
  const { cvFilled, jobFilled, analyzed } = useProgress();

  const headline = cvFilled
    ? "Dwa kroki dzielą Cię od CV skrojonego pod ofertę."
    : "Trzy kroki dzielą Cię od CV skrojonego pod ofertę.";

  const steps = [
    {
      number: "01",
      title: "Uzupełnij dane CV",
      description:
        "Wypełnij formularz w kreatorze lub wgraj CV, które już masz.",
      state: (cvFilled ? "done" : "now") as StepState,
      cta: (
        <Button asChild size="sm" className="gap-2">
          <Link href="/app/kreator">
            Otwórz kreator
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ),
    },
    {
      number: "02",
      title: "Wklej ofertę pracy",
      description:
        "Wklej link do ogłoszenia lub jego pełną treść, abyśmy mogli jak najlepiej dopasować Twoje CV.",
      state: (jobFilled ? "done" : cvFilled ? "now" : "next") as StepState,
      cta: (
        <Button asChild size="sm" variant="secondary" className="gap-2">
          <Link href="/app/kreator">
            Dopasuj do oferty
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ),
    },
    {
      number: "03",
      title: "Analiza AI i dopasowane CV",
      description:
        "Wynik dopasowania, wplecione słowa kluczowe, dziennik zmian i gotowe CV do pobrania.",
      state: (analyzed ? "done" : "soon") as StepState,
      cta: (
        <Button asChild size="sm" variant="secondary" className="gap-2">
          <Link href="/app/kreator">
            Uruchom dopasowanie
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ),
    },
  ];

  const activeIndex = steps.findIndex((s) => s.state === "now");

  return (
    // Poniżej `lg` kolumny idą jedna pod drugą, a nie znika ta druga —
    // na telefonie prawa kolumna też ma być dostępna.
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10 lg:flex-row">
      {/* Kolumna główna */}
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-muted-foreground">Dzień dobry</p>
        <h1 className="mt-2 max-w-xl text-balance text-3xl font-extrabold leading-tight tracking-tight">
          {headline}
        </h1>

        <ol className="mt-10 flex flex-col">
          {steps.map((step, i) => (
            <li
              key={step.number}
              className={cn(
                "relative flex gap-4 pb-8 pl-0",
                i < steps.length - 1 &&
                  "before:absolute before:left-[11px] before:top-8 before:h-full before:w-px before:bg-border"
              )}
            >
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  step.state === "done"
                    ? "bg-primary text-primary-foreground"
                    : step.state === "now"
                      ? "bg-primary/20 text-primary ring-1 ring-primary"
                      : "bg-secondary text-muted-foreground"
                )}
              >
                {step.state === "done" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="eyebrow text-muted-foreground">
                    {step.number}
                  </span>
                  <h2
                    className={cn(
                      "text-base font-bold",
                      step.state === "next" || step.state === "soon"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {step.title}
                  </h2>
                  <StepBadge state={step.state} />
                </div>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {step.description}
                </p>
                {i === activeIndex && (
                  <div className="card-surface mt-3 flex items-center justify-between gap-4 p-4">
                    <p className="text-sm text-muted-foreground">
                      {i === 0
                        ? "Zacznij tutaj i przejdź do kreatora."
                        : "Wybierz CV z listy i dodaj ofertę, na którą chcesz aplikować."}
                    </p>
                    {step.cta}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Prawa kolumna */}
      <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
        <div className="card-surface p-5">
          <p className="eyebrow text-muted-foreground">Rozwój</p>
          <div className="mt-3 flex items-start gap-3">
            <GraduationCap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-bold">
                Przygotowanie do rozmowy po polsku
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Symulacja rozmowy rekrutacyjnej pod Twoją ofertę - wkrótce.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
