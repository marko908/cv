"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KartaKonta } from "@/components/auth/karta-konta";
import { SavedIndicator } from "@/components/saved-indicator";
import {
  useCvStore,
  useLimitPlanu,
  useMaSubskrypcje,
  useNazwaPlanu,
  usePozostaloDopasowan,
} from "@/lib/store";
import { emptyCv } from "@/lib/cv-schema";
import { PaywallDialog } from "@/components/builder/paywall-dialog";
import { CENA_JEDNORAZOWA, PLANY } from "@/lib/subscription";

function SettingsCard({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card-surface p-6 ${className ?? ""}`}>
      <p className="eyebrow mb-4 text-foreground">{eyebrow}</p>
      {children}
    </section>
  );
}

export default function UstawieniaPage() {
  const { cv, template, jobPosting, aiMeta, loadCv, setJobPosting, setAiMeta } =
    useCvStore();
  const tailorings = useCvStore((s) => s.tailorings);
  const subscription = useCvStore((s) => s.subscription);
  const maDostep = useMaSubskrypcje();
  const nazwaPlanu = useNazwaPlanu();
  const limitPlanu = useLimitPlanu();
  const pozostalo = usePozostaloDopasowan();
  const odblokowane = useCvStore((s) => s.odblokowaneDopasowania);
  const [confirmClear, setConfirmClear] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [otwieramPanel, setOtwieramPanel] = useState(false);
  const [bladPlatnosci, setBladPlatnosci] = useState("");

  /**
   * Zarządzanie subskrypcją oddajemy panelowi Stripe'a.
   *
   * Wcześniej „Zrezygnuj" wołało `anulujSubskrypcje` w store — czyli zmieniało
   * stan tylko w przeglądarce. Po podpięciu bazy uprawnienia czyta się
   * z Postgresa, więc taka „rezygnacja" znikałaby przy odświeżeniu, a w Stripe
   * subskrypcja biegłaby dalej i dalej pobierałaby pieniądze.
   */
  const otworzPanelPlatnosci = async () => {
    setOtwieramPanel(true);
    setBladPlatnosci("");
    try {
      const res = await fetch("/api/platnosc/portal", { method: "POST" });
      const dane = await res.json().catch(() => null);
      if (!res.ok || !dane?.url) {
        throw new Error(dane?.error ?? "Nie udało się otworzyć panelu płatności.");
      }
      window.location.assign(dane.url as string);
    } catch (e) {
      setOtwieramPanel(false);
      setBladPlatnosci(
        e instanceof Error ? e.message : "Nie udało się otworzyć panelu płatności."
      );
    }
  };

  const koniecOkresu = subscription.koniecOkresu
    ? new Date(subscription.koniecOkresu).toLocaleDateString("pl-PL")
    : null;

  // Licznik liczony z historii dopasowań — każda analiza zapisuje rekord.
  // Wcześniej stała tu myślnik i przypis „dostępne w kroku 2", choć silnik AI
  // działa już od dawna.
  const analizyWTymMiesiacu = (() => {
    const teraz = new Date();
    return tailorings.filter((t) => {
      const d = new Date(t.createdAt);
      return (
        d.getMonth() === teraz.getMonth() &&
        d.getFullYear() === teraz.getFullYear()
      );
    }).length;
  })();

  const exportJson = () => {
    const data = { cv, template, jobPosting, aiMeta };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-copilot-dane.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    loadCv(emptyCv);
    setJobPosting({ url: "", text: "" });
    setAiMeta({ addedKeywords: [], changesLog: [] });
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">Ustawienia</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight">
            Plan, dane i konto
          </h1>
        </div>
        <SavedIndicator />
      </div>

      {/* Plan */}
      <SettingsCard eyebrow="Dostęp i płatności">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-3xl font-bold">
              {maDostep ? (
                <>
                  {nazwaPlanu}{" "}
                  <span className="text-base text-muted-foreground">
                    {subscription.plan && subscription.okres
                      ? `${PLANY[subscription.plan].ceny[subscription.okres]} zł ${
                          subscription.okres === "rok" ? "/ rok" : "/ mies."
                        }`
                      : ""}
                  </span>
                </>
              ) : (
                <>
                  Bez dostępu{" "}
                  <span className="text-base text-muted-foreground">
                    do dopasowań
                  </span>
                </>
              )}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {maDostep
                ? koniecOkresu
                  ? `Dostęp aktywny do ${koniecOkresu}. Tworzenie CV i pobieranie PDF pozostaje bez opłat.`
                  : "Dostęp aktywny. Tworzenie CV i pobieranie PDF pozostaje bez opłat."
                : `Tworzysz CV i pobierasz je w PDF bez opłat. Dopasowanie do ogłoszenia wymaga subskrypcji albo jednorazowego odblokowania za ${CENA_JEDNORAZOWA} zł.`}
            </p>
          </div>
          {maDostep ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={otworzPanelPlatnosci}
              disabled={otwieramPanel}
            >
              {otwieramPanel ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Zarządzaj subskrypcją
            </Button>
          ) : (
            <Button size="sm" onClick={() => setPaywallOpen(true)}>
              <Sparkles className="size-4" />
              Wykup dostęp
            </Button>
          )}
        </div>
        {bladPlatnosci && (
          <p className="mt-3 text-sm text-destructive">{bladPlatnosci}</p>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary p-4">
            <p className="font-mono text-2xl font-bold">{analizyWTymMiesiacu}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {analizyWTymMiesiacu === 1
                ? "dopasowanie CV do oferty w tym miesiącu"
                : "dopasowań CV do ofert w tym miesiącu"}
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <p className="eyebrow pt-1 text-muted-foreground">
              Limit dopasowań
            </p>
            <p className="mt-2 text-sm">
              {maDostep
                ? `Zostało ${pozostalo} z ${limitPlanu} dopasowań w tym miesiącu.`
                : odblokowane.length > 0
                  ? `${odblokowane.length} ${
                      odblokowane.length === 1
                        ? "dopasowanie odblokowane"
                        : "dopasowań odblokowanych"
                    } jednorazowo.`
                  : `Plan ${PLANY.start.nazwa}: ${PLANY.start.limit} dopasowań, plan ${PLANY.pro.nazwa}: ${PLANY.pro.limit}.`}
            </p>
          </div>
        </div>
      </SettingsCard>

      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />

      {/* Dane */}
      <SettingsCard eyebrow="Twoje dane">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary p-4">
            <div>
              <p className="text-sm font-bold">Eksport danych (JSON)</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Pobierz swoje CV, ofertę i wyniki analizy jako plik JSON.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={exportJson}>
              <Download className="size-4" />
              Pobierz
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary p-4">
            <div>
              <p className="text-sm font-bold">Wyczyść dane lokalne</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Usuwa CV, ofertę i wyniki z tej przeglądarki. Nieodwracalne.
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={clearAll}
            >
              <Trash2 className="size-4" />
              {confirmClear ? "Na pewno? Kliknij ponownie" : "Wyczyść"}
            </Button>
          </div>
        </div>
      </SettingsCard>

      {/* Konto */}
      <SettingsCard eyebrow="Konto">
        <KartaKonta />
      </SettingsCard>

      {/* Na początek */}
      <SettingsCard eyebrow="Na początek">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Chcesz zobaczyć stronę produktu albo zacząć od nowa?
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/">
              <ExternalLink className="size-4" />
              Strona główna
            </Link>
          </Button>
        </div>
      </SettingsCard>

      <p className="eyebrow pb-4 text-center text-muted-foreground/60">
        Twoje dane są przechowywane lokalnie i nie opuszczają przeglądarki,
        dopóki nie użyjesz funkcji AI.
      </p>
    </div>
  );
}
