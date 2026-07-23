"use client";

import { useCvStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Miernik gotowości CV (wzorzec "BUILD RESUME x/5 STRONG" z ResuMax). */
export function Readiness() {
  const cv = useCvStore((s) => s.cv);

  const checks = [
    {
      label: "Kontakt",
      done:
        cv.personal_info.full_name.trim().length > 0 &&
        cv.personal_info.email.trim().length > 0 &&
        cv.personal_info.phone.trim().length > 0,
    },
    {
      label: "Podsumowanie",
      done: cv.professional_summary.trim().length >= 50,
    },
    {
      label: "Doświadczenie",
      done:
        cv.experience.length > 0 &&
        cv.experience.some((e) => e.bullets.filter(Boolean).length > 0),
    },
    {
      label: "Umiejętności",
      done: cv.skills.technical.filter(Boolean).length >= 3,
    },
    { label: "Edukacja", done: cv.education.length > 0 },
  ];
  const score = checks.filter((c) => c.done).length;

  return (
    <div className="rounded-lg bg-secondary p-4">
      <p className="eyebrow text-muted-foreground">Gotowość CV</p>
      <p className="mt-2 font-mono text-2xl font-bold">
        {score}
        <span className="text-sm text-muted-foreground"> / {checks.length}</span>
        {score === checks.length && (
          <span className="eyebrow ml-2 text-primary">Komplet</span>
        )}
      </p>
      <div className="mt-3 flex gap-1.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={cn(
              "h-1 flex-1 rounded-full",
              c.done ? "bg-primary" : "bg-accent"
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              c.done ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                c.done ? "bg-primary" : "border border-muted-foreground"
              )}
            />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
