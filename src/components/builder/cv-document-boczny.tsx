import type { TailoredCv } from "@/lib/cv-schema";
import { opisLinku } from "@/lib/utils";

/**
 * Układ „Boczny panel" — dwie kolumny ze zdjęciem kandydata.
 *
 * Korzysta z DOKŁADNIE tego samego modelu danych co pozostałe szablony (jedyny
 * dodatek to `personal_info.photo`), więc wszystkie mechaniki — rubryka oceny,
 * dopasowanie, walidator anty-halucynacyjny, wywiad, eksport PDF — działają bez
 * żadnych zmian. Różni się wyłącznie szkielet wizualny.
 *
 * Uwaga ATS: układ dwukolumnowy czyta się gorzej automatom niż jedna kolumna.
 * Dlatego to świadomy wybór użytkownika, a nie domyślny szablon.
 */

export const BOCZNY = {
  panel: "#EFE9E1", // ciepły beż lewej kolumny
  tekst: "#2F2A26",
  linia: "#D8CFC3",
  wyrozn: "#1F2937",
};

/** Nagłówek sekcji w bocznym pasku. */
function NaglowekPanelu({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em]"
      style={{ color: BOCZNY.wyrozn }}
    >
      {children}
    </h2>
  );
}

/** Nagłówek sekcji w kolumnie głównej — wyśrodkowany, z cienkimi liniami. */
function NaglowekGlowny({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="h-px flex-1" style={{ background: BOCZNY.linia }} />
      <h2
        className="text-[13px] font-bold uppercase tracking-[0.2em]"
        style={{ color: BOCZNY.wyrozn }}
      >
        {children}
      </h2>
      <span className="h-px flex-1" style={{ background: BOCZNY.linia }} />
    </div>
  );
}

export function CvBoczny({ cv }: { cv: TailoredCv }) {
  const link = opisLinku(cv.personal_info.linkedin_or_github);
  const p = cv.personal_info;

  return (
    <div
      className="flex min-h-full grow bg-white text-[12.5px] leading-relaxed"
      style={{
        fontFamily: "var(--font-cv), Lato, system-ui, sans-serif",
        color: BOCZNY.tekst,
      }}
    >
      {/* ---------- Lewa kolumna ---------- */}
      <aside
        className="flex w-[34%] shrink-0 flex-col gap-6 px-7 py-9"
        style={{ background: BOCZNY.panel }}
      >
        {/* Zdjęcie — tylko gdy wgrane; bez niego układ się nie psuje. */}
        {p.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo}
            alt=""
            className="mx-auto aspect-square w-[74%] rounded-md object-cover"
          />
        )}

        {(p.email || p.phone || p.location || link) && (
          <section>
            <NaglowekPanelu>Kontakt</NaglowekPanelu>
            <ul className="flex flex-col gap-1.5 text-[11.5px]">
              {p.email && <li className="break-words">{p.email}</li>}
              {p.phone && <li>{p.phone}</li>}
              {p.location && <li>{p.location}</li>}
              {link && (
                <li className="break-words">
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {link.etykieta}
                    </a>
                  ) : (
                    link.etykieta
                  )}
                </li>
              )}
            </ul>
          </section>
        )}

        {cv.skills.technical.filter(Boolean).length > 0 && (
          <section>
            <NaglowekPanelu>Umiejętności</NaglowekPanelu>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-[11.5px]">
              {cv.skills.technical.filter(Boolean).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {cv.skills.soft_and_tools.filter(Boolean).length > 0 && (
          <section>
            <NaglowekPanelu>Mocne strony</NaglowekPanelu>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-[11.5px]">
              {cv.skills.soft_and_tools.filter(Boolean).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {cv.languages.filter(Boolean).length > 0 && (
          <section>
            <NaglowekPanelu>Języki obce</NaglowekPanelu>
            <ul className="flex flex-col gap-1 text-[11.5px]">
              {cv.languages.filter(Boolean).map((j, i) => (
                <li key={i}>{j}</li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* ---------- Prawa kolumna ---------- */}
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-9 py-9">
        <header>
          <h1
            className="text-[30px] font-bold leading-tight tracking-tight"
            style={{ color: BOCZNY.wyrozn }}
          >
            {p.full_name || "Imię i nazwisko"}
          </h1>
          {p.title && (
            <p className="mt-1 text-[15px] text-neutral-600">{p.title}</p>
          )}
        </header>

        {cv.professional_summary && (
          <section>
            <p className="text-[12.5px]">{cv.professional_summary}</p>
          </section>
        )}

        {cv.experience.length > 0 && (
          <section>
            <NaglowekGlowny>Doświadczenie</NaglowekGlowny>
            <div className="flex flex-col gap-4">
              {cv.experience.map((exp, i) => (
                <div key={i} className="relative pr-4">
                  {/* Kropka na osi czasu przy prawej krawędzi */}
                  <span
                    className="absolute right-0 top-1.5 size-1.5 rounded-full"
                    style={{ background: BOCZNY.linia }}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[13.5px] font-bold uppercase tracking-wide"
                      style={{ color: BOCZNY.wyrozn }}
                    >
                      {exp.role || "Stanowisko"}
                    </p>
                    {exp.period && (
                      <p className="shrink-0 text-[11px] text-neutral-500">
                        {exp.period}
                      </p>
                    )}
                  </div>
                  {(exp.company || exp.location) && (
                    <p className="text-[12px] text-neutral-600">
                      {[exp.company, exp.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-1.5 list-disc pl-4">
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

        {cv.projects.length > 0 && (
          <section>
            <NaglowekGlowny>Projekty</NaglowekGlowny>
            <div className="flex flex-col gap-3">
              {cv.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: BOCZNY.wyrozn }}
                    >
                      {proj.name || "Projekt"}
                    </p>
                    {proj.period && (
                      <p className="shrink-0 text-[11px] text-neutral-500">
                        {proj.period}
                      </p>
                    )}
                  </div>
                  {proj.technologies.filter(Boolean).length > 0 && (
                    <p className="text-[11.5px] text-neutral-600">
                      {proj.technologies.filter(Boolean).join(", ")}
                    </p>
                  )}
                  {proj.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-1 list-disc pl-4">
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

        {cv.education.length > 0 && (
          <section>
            <NaglowekGlowny>Edukacja</NaglowekGlowny>
            <div className="flex flex-col gap-2.5">
              {cv.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[12.5px] font-bold"
                      style={{ color: BOCZNY.wyrozn }}
                    >
                      {edu.institution || "Uczelnia"}
                    </p>
                    {edu.period && (
                      <p className="shrink-0 text-[11px] text-neutral-500">
                        {edu.period}
                      </p>
                    )}
                  </div>
                  {edu.degree && (
                    <p className="text-[12px] text-neutral-600">{edu.degree}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cv.rodo_clause && (
          <footer className="mt-auto pt-2 text-[9px] italic text-neutral-400">
            {cv.rodo_clause}
          </footer>
        )}
      </main>
    </div>
  );
}
