import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Czysty render dokumentu CV (bez store'a i bez ramki arkusza).
 * Używany w podglądzie na żywo i w miniaturach szablonów.
 * Layout zablokowany: jedna kolumna, ATS-safe. Ten sam układ
 * odtworzymy 1:1 w @react-pdf/renderer (krok 3).
 */
export function CvDocument({
  cv: rawCv,
  template,
}: {
  cv: TailoredCv;
  template: TemplateId;
}) {
  // Normalizacja na wejściu — chroni renderer przed niekompletnymi danymi
  // (starszy zapis w localStorage, przyszłe odpowiedzi AI itd.).
  const cv: TailoredCv = {
    ...rawCv,
    experience: rawCv.experience ?? [],
    projects: rawCv.projects ?? [],
    education: rawCv.education ?? [],
    languages: rawCv.languages ?? [],
    skills: rawCv.skills ?? { technical: [], soft_and_tools: [] },
  };
  const modern = template === "nowoczesny";
  const accent = modern ? "text-[#0057D9]" : "text-neutral-900";
  const rule = modern ? "border-[#0057D9]/30" : "border-neutral-300";

  const contactLine = [
    cv.personal_info.email,
    cv.personal_info.phone,
    cv.personal_info.location,
    cv.personal_info.linkedin_or_github,
  ]
    .filter(Boolean)
    .join("  •  ");

  return (
    <div
      className="flex flex-col gap-5 bg-white px-12 py-10 text-[13px] leading-relaxed text-[#1f2937]"
      style={{ fontFamily: "var(--font-cv), 'Lato', system-ui, sans-serif" }}
    >
      {/* Nagłówek */}
      <header>
        <h1
          className={cn(
            "text-3xl font-bold tracking-tight",
            modern ? "text-[#0057D9]" : "text-neutral-900"
          )}
        >
          {cv.personal_info.full_name || "Imię i nazwisko"}
        </h1>
        {cv.personal_info.title && (
          <p className="mt-0.5 text-base text-neutral-600">
            {cv.personal_info.title}
          </p>
        )}
        {contactLine && (
          <p className="mt-2 text-xs text-neutral-500">{contactLine}</p>
        )}
      </header>

      {/* Podsumowanie */}
      {cv.professional_summary && (
        <section>
          <h2
            className={cn(
              "mb-1.5 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              accent,
              rule
            )}
          >
            Podsumowanie zawodowe
          </h2>
          <p>{cv.professional_summary}</p>
        </section>
      )}

      {/* Doświadczenie */}
      {cv.experience.length > 0 && (
        <section>
          <h2
            className={cn(
              "mb-2 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              accent,
              rule
            )}
          >
            Doświadczenie zawodowe
          </h2>
          <div className="flex flex-col gap-3.5">
            {cv.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-bold text-neutral-900">
                    {exp.role || "Stanowisko"}
                    {exp.company && (
                      <span className="font-normal text-neutral-600">
                        {" "}
                        — {exp.company}
                      </span>
                    )}
                  </p>
                  <div className="shrink-0 text-right text-xs text-neutral-500">
                    {exp.period && <p>{exp.period}</p>}
                    {exp.location && <p>{exp.location}</p>}
                  </div>
                </div>
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {exp.bullets.filter(Boolean).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projekty */}
      {cv.projects.length > 0 && (
        <section>
          <h2
            className={cn(
              "mb-2 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              accent,
              rule
            )}
          >
            Projekty
          </h2>
          <div className="flex flex-col gap-3">
            {cv.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-bold text-neutral-900">
                    {proj.name || "Projekt"}
                    {proj.technologies.filter(Boolean).length > 0 && (
                      <span className="font-normal text-neutral-600">
                        {" "}
                        — {proj.technologies.filter(Boolean).join(", ")}
                      </span>
                    )}
                  </p>
                  {proj.period && (
                    <p className="shrink-0 text-xs text-neutral-500">
                      {proj.period}
                    </p>
                  )}
                </div>
                {proj.link && (
                  <p className="text-xs text-neutral-500">{proj.link}</p>
                )}
                {proj.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {proj.bullets.filter(Boolean).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Umiejętności */}
      {(cv.skills.technical.length > 0 ||
        cv.skills.soft_and_tools.length > 0) && (
        <section>
          <h2
            className={cn(
              "mb-1.5 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              accent,
              rule
            )}
          >
            Umiejętności
          </h2>
          {cv.skills.technical.length > 0 && (
            <p>
              <span className="font-bold">Techniczne: </span>
              {cv.skills.technical.filter(Boolean).join(", ")}
            </p>
          )}
          {cv.skills.soft_and_tools.length > 0 && (
            <p className="mt-1">
              <span className="font-bold">Miękkie i narzędzia: </span>
              {cv.skills.soft_and_tools.filter(Boolean).join(", ")}
            </p>
          )}
        </section>
      )}

      {/* Edukacja */}
      {cv.education.length > 0 && (
        <section>
          <h2
            className={cn(
              "mb-2 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              accent,
              rule
            )}
          >
            Edukacja
          </h2>
          <div className="flex flex-col gap-2">
            {cv.education.map((edu, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-4"
              >
                <p>
                  <span className="font-bold text-neutral-900">
                    {edu.institution || "Uczelnia"}
                  </span>
                  {edu.degree && (
                    <span className="text-neutral-600"> — {edu.degree}</span>
                  )}
                </p>
                <div className="shrink-0 text-right text-xs text-neutral-500">
                  {edu.period && <p>{edu.period}</p>}
                  {edu.location && <p>{edu.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Języki */}
      {cv.languages.filter(Boolean).length > 0 && (
        <section>
          <h2
            className={cn(
              "mb-1.5 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              accent,
              rule
            )}
          >
            Języki obce
          </h2>
          <p>{cv.languages.filter(Boolean).join(", ")}</p>
        </section>
      )}

      {/* RODO */}
      {cv.rodo_clause && (
        <footer className="mt-auto pt-4">
          <p className="text-[10px] italic leading-snug text-neutral-400">
            {cv.rodo_clause}
          </p>
        </footer>
      )}
    </div>
  );
}
