import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { cn, opisLinku } from "@/lib/utils";
import { CvBoczny } from "./cv-document-boczny";
import { CvPrestizowy } from "./cv-document-prestizowy";
import { CvGrafitowy } from "./cv-document-grafitowy";
import { CvPastelowy } from "./cv-document-pastelowy";

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
  // Układ dwukolumnowy ma własny render — inny szkielet, te same dane.
  if (template === "boczny") return <CvBoczny cv={cv} />;
  if (template === "prestizowy") return <CvPrestizowy cv={cv} />;
  if (template === "grafitowy") return <CvGrafitowy cv={cv} />;
  if (template === "pastelowy") return <CvPastelowy cv={cv} />;

  const styles = {
    nowoczesny: {
      page: "gap-5 px-12 py-10 text-[13px] leading-relaxed",
      name: "text-3xl tracking-tight text-[#0057D9]",
      accent: "text-[#0057D9]",
      rule: "border-[#0057D9]/30",
      heading: "pb-1 tracking-widest",
      sectionGap: "gap-3.5",
    },
    klasyczny: {
      page: "gap-5 px-12 py-10 text-[13px] leading-relaxed",
      name: "text-3xl tracking-tight text-neutral-900",
      accent: "text-neutral-900",
      rule: "border-neutral-300",
      heading: "pb-1 tracking-widest",
      sectionGap: "gap-3.5",
    },
    minimalny: {
      page: "gap-7 px-14 py-14 text-[13px] leading-relaxed",
      name: "text-[32px] tracking-[-0.03em] text-[#1f2937]",
      accent: "text-[#374151]",
      rule: "border-neutral-200",
      heading: "pb-1.5 tracking-[0.18em]",
      sectionGap: "gap-4",
    },
    elegancki: {
      page: "gap-6 px-14 py-12 text-[13px] leading-relaxed",
      name: "text-[32px] uppercase tracking-[0.12em] text-[#1E3A5F]",
      accent: "text-[#1E3A5F]",
      rule: "border-[#1E3A5F]/30",
      heading: "pb-1.5 tracking-[0.16em]",
      sectionGap: "gap-4",
    },
    prestizowy: {
      page: "gap-5 px-12 py-10 text-[13px] leading-relaxed",
      name: "text-3xl tracking-tight text-[#26303B]",
      accent: "text-[#12716A]",
      rule: "border-neutral-200",
      heading: "pb-1 tracking-widest",
      sectionGap: "gap-3.5",
    },
    pastelowy: {
      page: "gap-5 px-12 py-10 text-[13px] leading-relaxed",
      name: "text-3xl tracking-tight text-[#1C1917]",
      accent: "text-[#1C1917]",
      rule: "border-neutral-200",
      heading: "pb-1 tracking-widest",
      sectionGap: "gap-3.5",
    },
    grafitowy: {
      page: "gap-5 px-12 py-10 text-[13px] leading-relaxed",
      name: "text-3xl tracking-tight text-[#18181B]",
      accent: "text-[#18181B]",
      rule: "border-neutral-300",
      heading: "pb-1 tracking-widest",
      sectionGap: "gap-3.5",
    },
    boczny: {
      page: "gap-5 px-12 py-10 text-[13px] leading-relaxed",
      name: "text-3xl tracking-tight text-[#1f2937]",
      accent: "text-[#1f2937]",
      rule: "border-neutral-300",
      heading: "pb-1 tracking-widest",
      sectionGap: "gap-3.5",
    },
    kompaktowy: {
      page: "gap-3.5 px-9 py-8 text-[12px] leading-snug",
      name: "text-[27px] tracking-tight text-[#0057D9]",
      accent: "text-[#0057D9]",
      rule: "border-[#0057D9]/30",
      heading: "pb-0.5 tracking-[0.12em]",
      sectionGap: "gap-2.5",
    },
  }[template];

  // Link zostaje klikalny — sam napis „LinkedIn" bez adresu jest bezużyteczny.
  const link = opisLinku(cv.personal_info.linkedin_or_github);
  const contactParts = [
    cv.personal_info.email,
    cv.personal_info.phone,
    cv.personal_info.location,
  ].filter(Boolean);

  return (
    <div
      className={cn("flex grow flex-col bg-white text-[#1f2937]", styles.page)}
      style={{ fontFamily: "var(--font-cv), 'Lato', system-ui, sans-serif" }}
    >
      {/* Nagłówek */}
      <header>
        <h1
          className={cn(
            "font-bold",
            styles.name
          )}
        >
          {cv.personal_info.full_name || "Imię i nazwisko"}
        </h1>
        {cv.personal_info.title && (
          <p className="mt-0.5 text-base text-neutral-600">
            {cv.personal_info.title}
          </p>
        )}
        {(contactParts.length > 0 || link) && (
          <p className="mt-2 text-xs text-neutral-500">
            {contactParts.join("  •  ")}
            {link && (
              <>
                {contactParts.length > 0 && "  •  "}
                {link.href ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-neutral-300 underline-offset-2"
                  >
                    {link.etykieta}
                  </a>
                ) : (
                  link.etykieta
                )}
              </>
            )}
          </p>
        )}
      </header>

      {/* Podsumowanie */}
      {cv.professional_summary && (
        <section>
          <h2
            className={cn(
              "mb-1.5 border-b pb-1 text-xs font-bold uppercase tracking-widest",
              styles.accent,
              styles.rule,
              styles.heading
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
              styles.accent,
              styles.rule,
              styles.heading
            )}
          >
            Doświadczenie zawodowe
          </h2>
          <div className={cn("flex flex-col", styles.sectionGap)}>
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
              styles.accent,
              styles.rule,
              styles.heading
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
              styles.accent,
              styles.rule,
              styles.heading
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
              styles.accent,
              styles.rule,
              styles.heading
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
              styles.accent,
              styles.rule,
              styles.heading
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
