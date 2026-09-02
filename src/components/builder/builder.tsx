"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutTemplate, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCvStore, type CvPath } from "@/lib/store";
import { isCvComplete, missingCvSections } from "@/lib/cv-schema";
import { SavedIndicator } from "@/components/saved-indicator";
import { NewCvDialog } from "@/components/new-cv-dialog";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { AuthDialog, useBramaKonta } from "@/components/auth/auth-dialog";
import { SectionList } from "./section-list";
import { Readiness } from "./readiness";
import { MatchResults } from "./match-results";
import { TailorFlow } from "./tailor-flow";
import { CvPreview } from "./cv-preview";
import { cn } from "@/lib/utils";

export function Builder({
  initialPath,
  openTailor = false,
}: {
  initialPath: CvPath;
  openTailor?: boolean;
}) {
  const setPath = useCvStore((s) => s.setPath);
  const cv = useCvStore((s) => s.cv);
  const template = useCvStore((s) => s.template);
  const initialized = useRef(false);
  // Widok mobilny: edycja albo podgląd (na desktopie oba widoczne obok siebie).
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  // Bramka konta na dopasowaniu (kreator zostaje otwarty dla wszystkich).
  const { uzytkownik, ladowanie, zZalogowanym, propsyDialogu } = useBramaKonta();
  const [otworzPoLogowaniu, setOtworzPoLogowaniu] = useState(false);
  // W trakcie sprawdzania sesji pokazujemy wariant dla zalogowanego. Okno to
  // ułamek sekundy, a odwrotne założenie kazałoby ZALOGOWANEMU zobaczyć
  // formularz rejestracji przy szybkim kliknięciu — to gorszy błąd niż
  // wpuszczenie kogoś na ekran konfiguracji dopasowania sekundę za wcześnie.
  const przepuscDoFlow = ladowanie || Boolean(uzytkownik);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setPath(initialPath);
      // Zapewnij aktywne CV: otwórz pierwsze z biblioteki albo utwórz nowe.
      const s = useCvStore.getState();
      if (!s.activeCvId) {
        if (s.cvs.length > 0) s.openCv(s.cvs[0].id);
        else s.newCv();
      }
    }
  }, [initialPath, setPath]);

  const fullName = cv.personal_info.full_name;
  const complete = isCvComplete(cv);
  const missing = missingCvSections(cv);

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        {/* Pasek edytora */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="eyebrow hidden truncate text-foreground sm:block">
              {fullName ? `CV - ${fullName}` : "CV bez tytułu"}
            </span>
            <SavedIndicator />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {complete ? (
              przepuscDoFlow ? (
                <TailorFlow
                  defaultOpen={openTailor || otworzPoLogowaniu}
                  trigger={
                    <Button size="sm" className="gap-2 font-bold">
                      <Target className="size-4" />
                      <span className="hidden sm:inline">Dopasuj do oferty</span>
                      <span className="sm:hidden">Dopasuj</span>
                    </Button>
                  }
                />
              ) : (
                // Niezalogowany: najpierw konto, potem od razu ekran dopasowania.
                <Button
                  size="sm"
                  className="gap-2 font-bold"
                  onClick={() => zZalogowanym(() => setOtworzPoLogowaniu(true))}
                >
                  <Target className="size-4" />
                  <span className="hidden sm:inline">Dopasuj do oferty</span>
                  <span className="sm:hidden">Dopasuj</span>
                </Button>
              )
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button size="sm" disabled className="gap-2 font-bold">
                      <Target className="size-4" />
                      <span className="hidden sm:inline">Dopasuj do oferty</span>
                      <span className="sm:hidden">Dopasuj</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Uzupełnij CV, aby dopasować je do oferty. Brakuje:{" "}
                  {missing.join(", ")}.
                </TooltipContent>
              </Tooltip>
            )}
            <NewCvDialog
              redirectTo={null}
              trigger={
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  aria-label="Zmień szablon"
                >
                  <LayoutTemplate className="size-4" />
                  <span className="hidden capitalize sm:inline">{template}</span>
                </Button>
              }
            />
            <DownloadPdfButton
              cv={cv}
              template={template}
              size="sm"
              variant="secondary"
              label="Pobierz PDF"
              className="[&>span]:hidden sm:[&>span]:inline"
            />
          </div>
        </header>

        <AuthDialog
          {...propsyDialogu}
          tytul="Załóż konto, żeby dopasować CV"
          opis="Dopasowanie zapisuje się w Twojej historii - konto pozwala do niego wrócić i porównać wersje CV. Po założeniu konta przejdziemy dalej automatycznie."
        />

        {/* Mobilny przełącznik Edycja / Podgląd (ukryty na md+) */}
        <div className="flex shrink-0 gap-1 border-b border-border/60 p-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileView("edit")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-bold transition-colors",
              mobileView === "edit"
                ? "bg-accent text-foreground"
                : "text-muted-foreground"
            )}
          >
            Edycja
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-bold transition-colors",
              mobileView === "preview"
                ? "bg-accent text-foreground"
                : "text-muted-foreground"
            )}
          >
            Podgląd
          </button>
        </div>

        {/* Split: lewy panel edycji + prawy podgląd na żywo */}
        <div className="flex min-h-0 flex-1">
          <aside
            className={cn(
              "w-full flex-col border-r border-border/60 md:flex md:w-[380px] md:shrink-0",
              mobileView === "edit" ? "flex" : "hidden"
            )}
          >
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-4 p-4 pb-8">
                <Readiness />
                <MatchResults />
                <SectionList />
              </div>
            </ScrollArea>
          </aside>

          <section
            className={cn(
              "min-w-0 flex-1 overflow-auto bg-background p-4 md:block md:p-6 lg:p-10",
              mobileView === "preview" ? "block" : "hidden"
            )}
          >
            <CvPreview />
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
