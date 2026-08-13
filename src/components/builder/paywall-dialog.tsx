"use client";

import { useState } from "react";
import { Check, Loader2, Target, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckboxZgody } from "@/components/prawne/checkbox-zgody";
import {
  EtykietaZgodaOdstapienie,
  EtykietaZgodaRegulamin,
} from "@/components/prawne/etykiety-zgod";
import { cn } from "@/lib/utils";
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
 * Dwa checkboxy wymagane przed KAŻDYM zakupem (Regulamin § 4 ust. 8 pkt 3) —
 * osobny komponent, bo widok "cennik" i "jednorazowo" pokazują je osobno,
 * a treść i logika mają być identyczne. `prefiks` różnicuje `id`, żeby
 * `htmlFor`/`id` się nie powtarzały, gdyby oba widoki kiedyś wylądowały
 * w DOM naraz.
 */
function ZgodyZakupu({
  zgodaRegulamin,
  setZgodaRegulamin,
  zgodaOdstapienie,
  setZgodaOdstapienie,
  prefiks,
}: {
  zgodaRegulamin: boolean;
  setZgodaRegulamin: (wartosc: boolean) => void;
  zgodaOdstapienie: boolean;
  setZgodaOdstapienie: (wartosc: boolean) => void;
  prefiks: string;
}) {
  return (
    <div className="space-y-2">
      <CheckboxZgody
        id={`${prefiks}-zgoda-regulamin`}
        zaznaczone={zgodaRegulamin}
        naZmiane={setZgodaRegulamin}
      >
        <EtykietaZgodaRegulamin />
      </CheckboxZgody>
      <CheckboxZgody
        id={`${prefiks}-zgoda-odstapienie`}
        zaznaczone={zgodaOdstapienie}
        naZmiane={setZgodaOdstapienie}
      >
        <EtykietaZgodaOdstapienie />
      </CheckboxZgody>
    </div>
  );
}

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
  const [okres, setOkres] = useState<OkresRozliczeniowy>("miesiac");
  /**
   * TRZY WIDOKI, NIE DWA (2026-08-13).
   *
   * `potwierdzenie` powstało z problemu czysto przestrzennego: zgody muszą stać
   * przy zakupie, a ich treść jest długa i skrócić się jej nie da (art. 15
   * u.p.k. wymaga pouczenia o utracie prawa odstąpienia, nie jego streszczenia).
   * Trzymane na stałe pod cennikiem zjadały na telefonie tyle miejsca, że
   * z planów zostawał pasek wysokości ~150 px — użytkownik przewijał karty
   * w szczelinie, zamiast je porównać.
   *
   * Rozbicie na kroki niczego prawnie nie zmienia, a wręcz odwzorowuje
   * kolejność z § 4 ust. 8 Regulaminu: 1) wybierz wariant i okres,
   * 2) zaznacz oba checkboxy, 3) zapłać. Wcześniej dało się zaznaczyć zgody
   * ZANIM wybrało się plan, czyli złożyć oświadczenie o umowie, której treści
   * jeszcze się nie znało.
   */
  const [widok, setWidok] = useState<"cennik" | "potwierdzenie" | "jednorazowo">(
    "cennik"
  );
  const [wybranyPlan, setWybranyPlan] = useState<PlanId | null>(null);
  const [wTrakcie, setWTrakcie] = useState<string | null>(null);
  const [blad, setBlad] = useState("");

  // Dwa checkboxy wymagane przy KAŻDYM zakupie (Regulamin § 4 ust. 8 pkt 3):
  // regulamin+polityka oraz zgoda na rozpoczęcie usługi przed upływem terminu
  // na odstąpienie (bez niej dopasowanie za 12 zł dałoby się „zwrócić" po
  // pobraniu raportu). Domyślnie odznaczone, resetowane przy KAŻDYM zamknięciu
  // okna — zgoda nie ma prawa „zostać zaznaczona" z poprzedniej wizyty.
  const [zgodaRegulamin, setZgodaRegulamin] = useState(false);
  const [zgodaOdstapienie, setZgodaOdstapienie] = useState(false);
  const zgodyKompletne = zgodaRegulamin && zgodaOdstapienie;

  const resetZgod = () => {
    setZgodaRegulamin(false);
    setZgodaOdstapienie(false);
  };

  const zamknij = () => {
    setWidok("cennik");
    setWybranyPlan(null);
    setBlad("");
    resetZgod();
    onOpenChange(false);
  };

  /**
   * Rozpoczyna płatność i przekierowuje do Stripe'a.
   *
   * Store'a NIE ruszamy: dostęp nadaje wyłącznie webhook po potwierdzonej
   * płatności. Wcześniej te przyciski wołały `aktywujSubskrypcje` lokalnie,
   * co dawało dostęp każdemu, kto kliknął — dobre na demo, nie do sprzedaży.
   */
  const zaplac = async (
    klucz: string,
    dane: Record<string, unknown>
  ): Promise<void> => {
    // Druga linia obrony obok `disabled` na przyciskach — gdyby ktoś jednak
    // wywołał zakup bez zaznaczonych zgód. Serwer i tak waliduje je jeszcze
    // raz (`/api/platnosc/checkout` odrzuca żądanie bez obu zgód).
    if (!zgodyKompletne) {
      setBlad("Zaznacz obie zgody powyżej, żeby kontynuować.");
      return;
    }
    setWTrakcie(klucz);
    setBlad("");
    try {
      const res = await fetch("/api/platnosc/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dane,
          zgodaRegulamin: true,
          zgodaOdstapienie: true,
          zgodaZnacznikCzasu: new Date().toISOString(),
        }),
      });
      const wynik = await res.json().catch(() => null);
      if (!res.ok || !wynik?.url) {
        throw new Error(wynik?.error ?? "Nie udało się rozpocząć płatności.");
      }
      // Pełne przejście, nie router.push — cel jest poza aplikacją.
      // `assign`, nie przypisanie do `location.href`: to drugie jest modyfikacją
      // obiektu spoza komponentu i słusznie wytyka je reguła immutability.
      window.location.assign(wynik.url as string);
    } catch (e) {
      setWTrakcie(null);
      setBlad(e instanceof Error ? e.message : "Nie udało się rozpocząć płatności.");
    }
  };

  const kupPlan = (plan: PlanId) =>
    zaplac(plan, { rodzaj: "subskrypcja", plan, okres });

  const planDoPotwierdzenia =
    LISTA_PLANOW.find((p) => p.id === wybranyPlan) ?? null;

  /** Przejście z cennika do potwierdzenia — zgody zbieramy dopiero tam. */
  const wybierzPlan = (plan: PlanId) => {
    setWybranyPlan(plan);
    setBlad("");
    setWidok("potwierdzenie");
  };

  const kupJedno = () => {
    if (!tailoringId) return;
    return zaplac("jednorazowo", {
      rodzaj: "jednorazowo",
      dopasowanieId: tailoringId,
    });
  };

  const handleOpenChange = (next: boolean) => {
    // Wyjście ze ścieżki subskrypcji proponuje tańszą opcję zamiast zamykać —
    // ale tylko wtedy, gdy jest konkretne dopasowanie do kupienia. Dotyczy
    // OBU kroków: rezygnacja na potwierdzeniu to nadal rezygnacja z planu.
    if (!next && widok !== "jednorazowo" && tailoringId) {
      setWidok("jednorazowo");
      resetZgod();
      return;
    }
    if (!next) {
      setWidok("cennik");
      setWybranyPlan(null);
      resetZgod();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/*
        Przewija się TYLKO środek, stopka stoi. Krzyżyk jest `absolute` względem
        `DialogContent` (patrz `ui/dialog.tsx`), więc zostaje na miejscu nawet
        wtedy, gdy nagłówek jedzie razem z treścią — a w cenniku jedzie celowo,
        żeby na telefonie oddać planom całą wysokość okna.
      */}
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col overflow-hidden shadow-dialog",
          widok === "cennik" ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        {widok === "cennik" ? (
          <>
            {/* Nagłówek JEST w obszarze przewijanym — na telefonie zabierał
                razem ze zgodami tyle miejsca, że na karty planów zostawała
                szczelina. Tu nie ma nic, co musi być widoczne przez cały czas:
                krzyżyk stoi osobno, a decyzja zapada przy kartach. */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DialogHeader className="items-center text-center">
                <span className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/15 sm:mb-2 sm:size-11">
                  <Zap className="size-4 text-primary sm:size-5" />
                </span>
                <p className="eyebrow text-primary">Dopasowanie CV do oferty</p>
                <DialogTitle className="text-xl sm:text-2xl">
                  Odblokuj dopasowania do ofert
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Tworzenie CV i pobieranie go w PDF zostaje bez opłat.
                  Subskrypcja odblokowuje dopasowywanie CV do ogłoszeń.
                </p>
              </DialogHeader>

              {/* Przełącznik okresu */}
              <div className="mx-auto mt-4 flex w-fit items-center gap-1 rounded-full bg-secondary p-1">
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
                      className="btn-label mt-5 gap-2 font-bold"
                      variant={plan.polecany ? "default" : "secondary"}
                      onClick={() => wybierzPlan(plan.id)}
                    >
                      {`Wybieram ${plan.nazwa}`}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

          </>
        ) : widok === "potwierdzenie" ? (
          <>
            {/* KROK 2 — tu i tylko tu zbieramy zgody (Regulamin § 4 ust. 8
                pkt 3). Użytkownik zna już wariant i kwotę, więc oświadczenie
                dotyczy umowy, której treść widzi nad checkboxami. */}
            <DialogHeader className="shrink-0 items-center text-center">
              <p className="eyebrow text-primary">Potwierdzenie zakupu</p>
              <DialogTitle className="text-xl sm:text-2xl">
                {planDoPotwierdzenia
                  ? `Subskrypcja ${planDoPotwierdzenia.nazwa}`
                  : "Subskrypcja"}
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
              {planDoPotwierdzenia && (
                <div className="rounded-lg border border-border bg-secondary p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-2xl font-bold">
                      {planDoPotwierdzenia.ceny[okres]} zł
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {OKRESY[okres].etykieta}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {okres === "rok"
                      ? `To ${miesiecznieZRocznego(planDoPotwierdzenia)} zł miesięcznie, płatne z góry.`
                      : "Cena brutto — tyle zapłacisz."}
                  </p>
                  <p className="mt-3 text-sm font-bold">
                    {planDoPotwierdzenia.limit} dopasowań miesięcznie
                  </p>
                  {/*
                    CZAS TRWANIA UMOWY I MINIMALNY CZAS ZOBOWIĄZAŃ — art. 17
                    ust. 1 pkt 3–4 u.p.k. wymaga podania tego BEZPOŚREDNIO
                    przed złożeniem zamówienia, więc zdanie musi stać przy
                    przycisku zapłaty, a nie w cenniku (tam żadnego zamówienia
                    się jeszcze nie składa). Reszta dawnej stopki — wyliczanka
                    metod płatności — była wyłącznie zachętą i została usunięta
                    (decyzja Marka 2026-08-13); metody i tak pokazuje Stripe
                    na następnym ekranie.
                  */}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {okres === "rok"
                      ? "Umowa na czas nieoznaczony, odnawia się co 12 miesięcy."
                      : "Umowa na czas nieoznaczony, odnawia się co miesiąc."}{" "}
                    Rezygnujesz w każdej chwili — dostęp zostaje do końca
                    opłaconego okresu.
                  </p>
                </div>
              )}

              <ZgodyZakupu
                zgodaRegulamin={zgodaRegulamin}
                setZgodaRegulamin={setZgodaRegulamin}
                zgodaOdstapienie={zgodaOdstapienie}
                setZgodaOdstapienie={setZgodaOdstapienie}
                prefiks="potwierdzenie"
              />
              {blad && <p className="text-sm text-destructive">{blad}</p>}
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-border pt-3">
              <Button
                className="btn-label h-11 w-full gap-2 font-bold"
                onClick={() => wybranyPlan && kupPlan(wybranyPlan)}
                disabled={wTrakcie !== null || !zgodyKompletne || !wybranyPlan}
              >
                {wTrakcie !== null && <Loader2 className="size-4 animate-spin" />}
                {wTrakcie !== null
                  ? "Przechodzę do płatności…"
                  : planDoPotwierdzenia
                    ? `Płacę ${planDoPotwierdzenia.ceny[okres]} zł`
                    : "Płacę"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setWidok("cennik");
                  setBlad("");
                }}
              >
                Wróć do planów
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Nagłówek i zgody przewijają się razem — same przyciski stoją.
                Wcześniej CAŁA ta gałąź była `shrink-0` w kontenerze
                `overflow-hidden`, więc na niskim ekranie treść nie tyle się
                przewijała, co ZNIKAŁA pod krawędzią okna, razem z przyciskiem
                zakupu. */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
              <DialogHeader className="items-center text-center">
                <span className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/15 sm:mb-2 sm:size-11">
                  <Target className="size-4 text-primary sm:size-5" />
                </span>
                <p className="eyebrow text-primary">Nie chcesz subskrypcji?</p>
                <DialogTitle className="text-xl sm:text-2xl">
                  Odblokuj to jedno dopasowanie za {CENA_JEDNORAZOWA} zł
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Jednorazowa płatność, bez odnawiania. Odblokowuje pełny raport
                  i przerobione CV dla tej jednej oferty — na zawsze. Kolejne
                  dopasowania możesz odblokowywać tak samo, pojedynczo.
                </p>
              </DialogHeader>

              <ZgodyZakupu
                zgodaRegulamin={zgodaRegulamin}
                setZgodaRegulamin={setZgodaRegulamin}
                zgodaOdstapienie={zgodaOdstapienie}
                setZgodaOdstapienie={setZgodaOdstapienie}
                prefiks="jednorazowo"
              />
              {blad && <p className="text-sm text-destructive">{blad}</p>}
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-border pt-3">
              <Button
                className="btn-label h-11 w-full gap-2 font-bold"
                onClick={kupJedno}
                disabled={wTrakcie !== null || !zgodyKompletne}
              >
                {wTrakcie === "jednorazowo" && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {wTrakcie === "jednorazowo"
                  ? "Przechodzę do płatności…"
                  : `Odblokuj to dopasowanie · ${CENA_JEDNORAZOWA} zł`}
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
