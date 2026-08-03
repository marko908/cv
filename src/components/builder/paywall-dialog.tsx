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
import {
  CENA_JEDNORAZOWA,
  LISTA_PLANOW,
  OKRESY,
  ZAKRES_PLATNY,
  miesiecznieZRocznego,
  rabatRoczny,
  type OkresRozliczeniowy,
  type PlanId,
} from "@/lib/subscription";

/**
 * Dwie drogi do dostępu i dwa kroki:
 *  1. CENNIK — dwa plany subskrypcji różniące się limitem dopasowań.
 *     Droższy ma lepszy stosunek ceny do limitu (patrz `PLANY`).
 *  2. DOWN-SELL przy wyjściu — kto nie chce subskrypcji, może kupić TO JEDNO
 *     dopasowanie za `CENA_JEDNORAZOWA`. Takich zakupów może zrobić dowolnie
 *     wiele; każdy dotyczy konkretnego rekordu (`odblokujDopasowanie(id)`).
 *
 * Lista korzyści pochodzi z `ZAKRES_PLATNY` — cennik nie może obiecywać
 * funkcji, których w kodzie nie ma.
 */
export function PaywallDialog({
  open,
  onOpenChange,
  /** Id dopasowania, którego dotyczy zakup jednorazowy. Bez niego down-sell
   *  nie ma czego odblokować, więc go nie pokazujemy. */
  tailoringId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tailoringId?: string | null;
}) {
  const aktywujSubskrypcje = useCvStore((s) => s.aktywujSubskrypcje);
  const odblokujDopasowanie = useCvStore((s) => s.odblokujDopasowanie);
  const [okres, setOkres] = useState<OkresRozliczeniowy>("miesiac");
  const [widok, setWidok] = useState<"cennik" | "jednorazowo">("cennik");

  const zamknij = () => {
    setWidok("cennik");
    onOpenChange(false);
  };

  const kupPlan = (plan: PlanId) => {
    aktywujSubskrypcje(plan, okres);
    zamknij();
  };

  const kupJedno = () => {
    if (tailoringId) odblokujDopasowanie(tailoringId);
    zamknij();
  };

  const handleOpenChange = (next: boolean) => {
    // Wyjście z cennika proponuje tańszą opcję zamiast zamykać — ale tylko
    // wtedy, gdy jest konkretne dopasowanie do kupienia.
    if (!next && widok === "cennik" && tailoringId) {
      setWidok("jednorazowo");
      return;
    }
    if (!next) setWidok("cennik");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Przewija się TYLKO środek — nagłówek z krzyżykiem i stopka stoją. */}
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col overflow-hidden shadow-dialog",
          widok === "cennik" ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        {widok === "cennik" ? (
          <>
            <DialogHeader className="shrink-0 items-center text-center">
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/15">
                <Zap className="size-5 text-primary" />
              </span>
              <p className="eyebrow text-primary">Dopasowanie CV do oferty</p>
              <DialogTitle className="text-2xl">
                Odblokuj dopasowania do ofert
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Tworzenie CV i pobieranie go w PDF zostaje bez opłat.
                Subskrypcja odblokowuje dopasowywanie CV do ogłoszeń.
              </p>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* Przełącznik okresu */}
              <div className="mx-auto flex w-fit items-center gap-1 rounded-full bg-secondary p-1">
                {(["miesiac", "rok"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOkres(id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                      okres === id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {OKRESY[id].etykieta}
                    {id === "rok" && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px]",
                          okres === id
                            ? "bg-primary-foreground/20"
                            : "bg-primary/20 text-primary"
                        )}
                      >
                        −{rabatRoczny(LISTA_PLANOW[0])}%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {LISTA_PLANOW.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-lg border bg-secondary p-5",
                      plan.polecany ? "border-primary" : "border-border"
                    )}
                  >
                    {plan.polecany && (
                      <span className="eyebrow absolute -top-2 right-4 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                        Najlepsza stawka
                      </span>
                    )}
                    <p className="eyebrow text-muted-foreground">{plan.nazwa}</p>
                    <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                      {plan.opis}
                    </p>
                    <p className="mt-3">
                      <span className="font-mono text-3xl font-bold">
                        {plan.ceny[okres]} zł
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        {OKRESY[okres].przyrostek}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {okres === "rok"
                        ? `To ${miesiecznieZRocznego(plan)} zł miesięcznie, płatne z góry.`
                        : "Cena brutto — tyle zapłacisz."}
                    </p>

                    <p className="mt-4 rounded-md bg-background/60 px-3 py-2 text-sm font-bold">
                      {plan.limit} dopasowań miesięcznie
                    </p>

                    <ul className="mt-3 flex flex-1 flex-col gap-2">
                      {ZAKRES_PLATNY.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="btn-label mt-5 font-bold"
                      variant={plan.polecany ? "default" : "secondary"}
                      onClick={() => kupPlan(plan.id)}
                    >
                      Wybieram {plan.nazwa}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <p className="shrink-0 text-center text-xs text-muted-foreground">
              Płatność kartą, BLIK-iem lub Przelewami24. Rezygnujesz w każdej
              chwili — dostęp zostaje do końca opłaconego okresu.
            </p>
          </>
        ) : (
          <>
            <DialogHeader className="shrink-0 items-center text-center">
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/15">
                <Target className="size-5 text-primary" />
              </span>
              <p className="eyebrow text-primary">Nie chcesz subskrypcji?</p>
              <DialogTitle className="text-2xl">
                Odblokuj to jedno dopasowanie za {CENA_JEDNORAZOWA} zł
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Jednorazowa płatność, bez odnawiania. Odblokowuje pełny raport
                i przerobione CV dla tej jednej oferty — na zawsze. Kolejne
                dopasowania możesz odblokowywać tak samo, pojedynczo.
              </p>
            </DialogHeader>

            <div className="flex shrink-0 flex-col gap-2">
              <Button
                className="btn-label h-11 w-full font-bold"
                onClick={kupJedno}
              >
                Odblokuj to dopasowanie · {CENA_JEDNORAZOWA} zł
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setWidok("cennik")}
              >
                Wróć do planów
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={zamknij}
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
