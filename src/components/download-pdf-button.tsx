"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Generuje PDF (dynamiczny import @react-pdf, więc nie ładuje się na serwerze)
 * i od razu pobiera plik na komputer.
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
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      disabled={loading}
      onClick={download}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      <span>{loading ? "Generuję PDF…" : label}</span>
    </Button>
  );
}
