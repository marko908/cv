"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog, useBramaKonta } from "@/components/auth/auth-dialog";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Generuje PDF (dynamiczny import @react-pdf, więc nie ładuje się na serwerze)
 * i od razu pobiera plik na komputer.
 *
 * BRAMKA KONTA: kreator jest otwarty dla wszystkich, ale pobranie pliku wymaga
 * konta (decyzja Marka 2026-08-02 — mail zbieramy w chwili, gdy wartość jest
 * już widoczna, nie na wejściu). Niezalogowanemu otwieramy okienko rejestracji,
 * a po jej ukończeniu PDF pobiera się SAM — bez drugiego kliknięcia.
 */
export function DownloadPdfButton({
  cv,
  template,
  label = "Pobierz PDF",
  variant = "default",
  size = "default",
  className,
}: {
  cv: TailoredCv;
  template: TemplateId;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { zZalogowanym, propsyDialogu } = useBramaKonta();

  const download = async () => {
    setLoading(true);
    try {
      const { downloadCvPdf } = await import("@/components/cv-pdf");
      const name = cv.personal_info.full_name.trim().replace(/\s+/g, "_");
      await downloadCvPdf(cv, template, name ? `CV_${name}.pdf` : "CV.pdf");
    } catch (err) {
      console.error("Nie udało się wygenerować PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        disabled={loading}
        onClick={() => zZalogowanym(download)}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        <span>{loading ? "Generuję PDF…" : label}</span>
      </Button>

      <AuthDialog
        {...propsyDialogu}
        tytul="Załóż konto, żeby pobrać CV"
        opis="Twoje CV zostaje tam, gdzie jest — konto daje do niego dostęp z każdego urządzenia i pozwala wrócić do niego później. Po założeniu konta plik pobierze się sam."
      />
    </>
  );
}
