"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { useCvStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Import zewnętrznego CV (PDF/DOCX/TXT) — TYLKO w edytorze, wypełnia bieżące CV.
 * Plik trafia na serwer, gdzie tekst jest wyciągany kodem, a AI mapuje go na
 * naszą strukturę. Przy niepustym CV wymaga dodatkowego potwierdzenia, bo
 * nadpisanie danych jest nieodwracalne.
 */
export function CvImportButton({ className }: { className?: string }) {
  const loadCv = useCvStore((s) => s.loadCv);
  const cv = useCvStore((s) => s.cv);
  const inputRef = useRef<HTMLInputElement>(null);
  const [stan, setStan] = useState<"idle" | "ladowanie">("idle");
  const [blad, setBlad] = useState<string | null>(null);
  const [potwierdz, setPotwierdz] = useState(false);

  // Czy w bieżącym CV jest cokolwiek, co import by nadpisał.
  const maDane =
    cv.personal_info.full_name.trim().length > 0 ||
    cv.professional_summary.trim().length > 0 ||
    cv.experience.length > 0;

  const wybierz = () => {
    setBlad(null);
    // Nadpisanie wypełnionego CV wymaga świadomej zgody — jeden dodatkowy klik.
    if (maDane && !potwierdz) {
      setPotwierdz(true);
      return;
    }
    setPotwierdz(false);
    inputRef.current?.click();
  };

  const onPlik = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const plik = e.target.files?.[0];
    // Reset inputa, żeby ten sam plik dało się wgrać ponownie po błędzie.
    e.target.value = "";
    if (!plik) return;

    setStan("ladowanie");
    setBlad(null);
    try {
      const form = new FormData();
      form.append("plik", plik);
      const res = await fetch("/api/parsuj-cv", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setBlad(data?.error ?? "Nie udało się przetworzyć pliku.");
        setStan("idle");
        return;
      }

      loadCv(data.cv);
      // Od razu przepisz CV do biblioteki, zamiast czekać na debounce przy
      // następnej edycji. Inaczej na liście „Moje CV" wisi stara nazwa —
      // realnie zdarzyło się CV Marka podpisane „Anna Kowalska — Frontend
      // Developerka" (import nadpisał dane, etykieta została z przykładu).
      useCvStore.getState().syncActiveCv();
      setStan("idle");
    } catch {
      setBlad("Coś poszło nie tak przy wysyłaniu pliku. Spróbuj ponownie.");
      setStan("idle");
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={onPlik}
      />
      <button
        type="button"
        onClick={wybierz}
        onBlur={() => setPotwierdz(false)}
        disabled={stan === "ladowanie"}
        className="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-left transition-colors hover:border-primary/70 hover:bg-primary/10 disabled:opacity-70"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15">
          {stan === "ladowanie" ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <Upload className="size-4 text-primary" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">
            {stan === "ladowanie"
              ? "Analizuję plik…"
              : potwierdz
                ? "Kliknij ponownie, aby nadpisać to CV"
                : "Wgraj swoje CV (PDF / DOCX)"}
          </span>
          <span className="block text-xs text-muted-foreground">
            {stan === "ladowanie"
              ? "Wyciągam dane i mapuję je na formularz."
              : potwierdz
                ? "Obecne dane zostaną zastąpione danymi z pliku."
                : "Wypełnimy formularz automatycznie na podstawie pliku."}
          </span>
        </span>
      </button>

      {blad && (
        <p className="mt-2 flex items-start gap-1.5 px-1 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {blad}
        </p>
      )}
    </div>
  );
}
