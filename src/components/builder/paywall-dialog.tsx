"use client";

import { useState } from "react";
import { Check, Target, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCvStore } from "@/lib/store";

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    tagline: "Zdobądź pracę.",
    monthly: 39,
    annual: 15,
    features: [
      "Nielimitowane dopasowania CV do ofert",
      "Pełny raport rekrutera z konkretnymi poprawkami",
      "Eksport PDF i DOCX bez znaku wodnego",
      "Historia wszystkich wersji CV",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Wygraj rozmowę.",
    monthly: 69,
    annual: 27,
    best: true,
    features: [
      "Wszystko z Pro, bez limitów",
      "Symulacja rozmowy kwalifikacyjnej po polsku",
      "Analiza luk kompetencyjnych względem oferty",
      "Priorytetowe wsparcie",
    ],
  },
];

/**
 * Paywall wzorem ResuMax: cennik + down-sell przy próbie wyjścia
 * („odblokuj to jedno za mniej"). Płatności podłączymy w kroku 4 (Stripe,
 * BLIK/Przelewy24) — teraz przyciski odblokowują wynik demonstracyjnie.
 */
export function PaywallDialog({
  open,
  onOpenChange,
  onUnlock,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nadpisuje domyślne odblokowanie (bieżący wynik), np. konkretne dopasowanie. */
  onUnlock?: () => void;
}) {
  const unlockReview = useCvStore((s) => s.unlockReview);
  const [annual, setAnnual] = useState(false);
  const [view, setView] = useState<"pricing" | "downsell">("pricing");

  const unlock = () => {
    if (onUnlock) onUnlock();
    else unlockReview();
    setView("pricing");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    // Wyjście z cennika pokazuje down-sell zamiast zamykać (jak ResuMax).
    if (!next && view === "pricing") {
      setView("downsell");
      return;
    }
    if (!next) setView("pricing");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "shadow-dialog",
          view === "pricing" ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        {view === "pricing" ? (
          <>
            <DialogHeader className="items-center text-center">
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/15">
                <Zap className="size-5 text-primary" />
              </span>
              <p className="eyebrow text-primary">Odblokuj pełny raport</p>
              <DialogTitle className="text-2xl">
                Zobacz każdą poprawkę, nie tylko pierwszą
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Pełna ocena rekrutera: wyniki kategorii, wszystkie znaleziska
                i gotowe do wklejenia przeróbki.
              </p>
            </DialogHeader>

            {/* Przełącznik miesięcznie / rocznie */}
            <div className="mx-auto flex items-center gap-1 rounded-full bg-secondary p-1">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                  !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                Miesięcznie
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                  annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                Rocznie
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    annual
                      ? "bg-primary-foreground/20"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  −60%
                </span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-lg border bg-secondary p-5",
                    plan.best ? "border-primary" : "border-border"
                  )}
                >
                  {plan.best && (
                    <span className="eyebrow absolute -top-2 right-4 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                      Najczęściej wybierany
                    </span>
                  )}
                  <p className="eyebrow text-muted-foreground">{plan.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.tagline}
                  </p>
                  <p className="mt-3">
                    <span className="font-mono text-3xl font-bold">
                      {annual ? plan.annual : plan.monthly} zł
                    </span>
                    <span className="text-sm text-muted-foreground"> / mies.</span>
                  </p>
                  {annual && (
                    <p className="text-xs text-muted-foreground">
                      rozliczane rocznie
                    </p>
                  )}
                  <ul className="mt-4 flex flex-1 flex-col gap-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn("btn-label mt-5 font-bold", !plan.best && "")}
                    variant={plan.best ? "default" : "secondary"}
                    onClick={unlock}
                  >
                    Wybieram {plan.name}
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Płatności (BLIK, Przelewy24, karta) uruchomimy w kroku 4. Anuluj
              w każdej chwili.
            </p>
          </>
        ) : (
          <>
            <DialogHeader className="items-center text-center">
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/15">
                <Target className="size-5 text-primary" />
              </span>
              <p className="eyebrow text-primary">Zanim wyjdziesz</p>
              <DialogTitle className="text-2xl">
                Odblokuj tę jedną ocenę za 12 zł
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Praca już wykonana — nie zostawiaj jej zablokowanej. Bez
                subskrypcji, bez odnawiania. Jednorazowa płatność, wynik
                zostaje Twój.
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Button
                className="btn-label h-11 w-full font-bold"
                onClick={unlock}
              >
                Odblokuj pełny raport · 12 zł
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setView("pricing");
                  onOpenChange(false);
                }}
              >
                Nie, może później
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
