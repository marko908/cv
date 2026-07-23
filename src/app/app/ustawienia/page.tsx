"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Trash2,
  UserRound,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedIndicator } from "@/components/saved-indicator";
import { useCvStore } from "@/lib/store";
import { emptyCv } from "@/lib/cv-schema";

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
  const [confirmClear, setConfirmClear] = useState(false);

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
      <SettingsCard eyebrow="Plan i płatności">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-3xl font-bold">
              MVP <span className="text-base text-muted-foreground">0 zł</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              W fazie MVP wszystko jest darmowe. Płatności (BLIK / Przelewy24 /
              karta) pojawią się w kroku 4.
            </p>
          </div>
          <Button size="sm" variant="secondary" disabled>
            <Sparkles className="size-4" />
            Plany — wkrótce
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary p-4">
            <p className="font-mono text-2xl font-bold">—</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Generacje AI w tym miesiącu (dostępne w kroku 2)
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <p className="eyebrow pt-1 text-muted-foreground">Subskrypcja</p>
            <p className="mt-2 text-sm">◦ Plan darmowy</p>
          </div>
        </div>
      </SettingsCard>

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
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Logowanie i synchronizacja między urządzeniami pojawią się w kroku 4
            (Supabase). Na razie wszystko trzymamy lokalnie w Twojej
            przeglądarce.
          </p>
        </div>
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
