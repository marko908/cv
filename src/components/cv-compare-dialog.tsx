"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumb } from "@/components/template-thumb";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Arkusz CV przeskalowany do szerokości kontenera (responsywnie, czytelnie). */
function FittedCvSheet({
  cv,
  template,
}: {
  cv: TailoredCv;
  template: TemplateId;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <TemplateThumb
          cv={cv}
          template={template}
          width={width}
          full
          className="w-full"
        />
      )}
    </div>
  );
}

/** Modal pełnoekranowego porównania CV przed / po dopasowaniu. */
export function CvCompareDialog({
  baseCv,
  tailoredCv,
  template,
  trigger,
  locked = false,
  onUnlock,
}: {
  baseCv: TailoredCv;
  tailoredCv: TailoredCv;
  template: TemplateId;
  trigger: React.ReactNode;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  const [view, setView] = useState<"before" | "after">(
    locked ? "before" : "after"
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton
        style={{ display: "flex", flexDirection: "column" }}
        // `dvh`, nie `vh`: na telefonie `vh` liczy się do wysokości ekranu BEZ
        // paska adresu, więc modal na 94vh wystawał pod pasek i dolne przyciski
        // były nieosiągalne. `dvh` śledzi realnie widoczny obszar.
        className="h-[94dvh] w-[96vw] max-w-[1400px] gap-0 overflow-hidden p-0 shadow-dialog sm:max-w-[1400px]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 py-3 pl-4 pr-11 lg:pr-4">
          <DialogTitle className="text-sm font-bold">
            Porównanie CV - przed i po dopasowaniu
          </DialogTitle>
          {/* Przełącznik na mniejszych ekranach (poniżej lg) */}
          <div className="flex gap-1 rounded-full bg-secondary p-1 lg:hidden">
            <button
              type="button"
              onClick={() => setView("before")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                view === "before"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Przed
            </button>
            <button
              type="button"
              onClick={() => setView("after")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                view === "after"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              Po
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-auto bg-[#07080c] p-4 lg:grid-cols-2">
          {/* Przed */}
          <div
            className={cn(
              "min-w-0 flex-col gap-2",
              view === "before" ? "flex" : "hidden lg:flex"
            )}
          >
            <p className="eyebrow text-center text-muted-foreground">Przed</p>
            <FittedCvSheet cv={baseCv} template={template} />
          </div>
          {/* Po */}
          <div
            className={cn(
              "min-w-0 flex-col gap-2",
              view === "after" ? "flex" : "hidden lg:flex"
            )}
          >
            <p className="eyebrow text-center text-primary">Po dopasowaniu</p>
            {locked ? (
              <div className="relative">
                <div className="blur-sm">
                  <FittedCvSheet cv={baseCv} template={template} />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-sm bg-background/70 p-6 text-center backdrop-blur-[2px]">
                  <Lock className="size-7 text-primary" />
                  <p className="text-sm font-bold">
                    Przerobione CV jest zablokowane
                  </p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Odblokuj dopasowanie, aby zobaczyć i pobrać gotowe CV.
                  </p>
                  {onUnlock && (
                    <Button
                      size="sm"
                      className="btn-label font-bold"
                      onClick={onUnlock}
                    >
                      Odblokuj
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <FittedCvSheet cv={tailoredCv} template={template} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
