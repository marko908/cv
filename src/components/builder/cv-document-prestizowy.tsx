import type { TailoredCv } from "@/lib/cv-schema";
import { opisLinku } from "@/lib/utils";

/**
 * Układ „Prestiżowy" — jedna kolumna, okrągłe zdjęcie w nagłówku.
 *
 * Przeciwieństwo „Bocznego panelu": zamiast kolorowej kolumny stawia na światło
 * i jeden stonowany akcent (morska zieleń) użyty tylko w nazwie sekcji, cienkiej
 * kresce i wąskim pasku przy krawędzi. Umiejętności jako delikatne kafelki.
 *
 * Ten sam model danych co pozostałe szablony — jedyny dodatek to
 * `personal_info.photo`. Jedna kolumna oznacza też, że kolejność tekstu w PDF
 * jest naturalnie poprawna dla parserów: nazwisko → podsumowanie → doświadczenie.
 */

export const PRESTIZ = {
  akcent: "#12716A", // głęboka morska zieleń — jedyny kolor akcentowy
  tekst: "#26303B",
  szary: "#6B7683",
  linia: "#E2E6E9",
  kafel: "#F1F5F4",
};

function Naglowek({ children }: { children: React.ReactNode }) {
  return (
    <div data-blok="naglowek" className="mb-2.5">
      <h2
        className="text-[11.5px] font-bold uppercase tracking-[0.18em]"
        style={{ color: PRESTIZ.akcent }}
      >
        {children}
      </h2>
      <span
        className="mt-1 block h-[2px] w-8"
        style={{ background: PRESTIZ.akcent }}
      />
    </div>
  );
}

function Punkty({ punkty }: { punkty: string[] }) {
  const lista = punkty.filter(Boolean);
  if (lista.length === 0) return null;
  return (
    <ul className="mt-1.5 flex flex-col gap-1">
      {lista.map((b, i) => (
        <li key={i} className="flex gap-2">
          <span
            className="mt-[6px] size-1 shrink-0 rounded-full"
            style={{ background: PRESTIZ.akcent }}
          />
          <span className="min-w-0">{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function CvPrestizowy({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);
  const kontakt = [p.email, p.phone, p.location].filter(Boolean);

  return (
    <div
      className="relative flex min-h-full grow flex-col bg-white text-[12.5px] leading-relaxed"
      style={{
        fontFamily: "var(--font-cv), Lato, system-ui, sans-serif",
        color: PRESTIZ.tekst,
      }}
    >
      {/* Wąski pasek akcentu przy lewej krawędzi — subtelny znak firmowy */}
      <span
        className="absolute inset-y-0 left-0 w-[6px]"
        style={{ background: PRESTIZ.akcent }}
      />

      <div className="flex flex-col gap-6 px-12 py-10 pl-14">
        {/* ---------- Nagłówek ---------- */}
        <header className="flex items-center gap-6">
          {p.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photo}
              alt=""
              className="size-[104px] shrink-0 rounded-full object-cover"
              style={{ outline: `2px solid ${PRESTIZ.akcent}`, outlineOffset: 3 }}
            />
          )}
          <div className="min-w-0">
            <h1 className="text-[31px] font-bold leading-tight tracking-tight">
              {p.full_name || "Imię i nazwisko"}
            </h1>
            {p.title && (
              <p
                className="mt-1 text-[12.5px] font-bold uppercase tracking-[0.14em]"
                style={{ color: PRESTIZ.akcent }}
              >
                {p.title}
              </p>
            )}
            {(kontakt.length > 0 || link) && (
              <p
                className="mt-2 text-[11px]"
                style={{ color: PRESTIZ.szary }}
              >
                {kontakt.join("  ·  ")}
                {link && (
                  <>
                    {kontakt.length > 0 && "  ·  "}
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
                  </>
                )}
              </p>
            )}
          </div>
        </header>

        <span
          className="block h-px w-full"
          style={{ background: PRESTIZ.linia }}
        />

        {/* ---------- Podsumowanie ---------- */}
        {cv.professional_summary && (
          <section>
            <Naglowek>Profil</Naglowek>
            <p>{cv.professional_summary}</p>
          </section>
        )}

        {/* ---------- Doświadczenie ---------- */}
        {cv.experience.length > 0 && (
          <section>
            <Naglowek>Doświadczenie</Naglowek>
            <div className="flex flex-col gap-3.5">
              {cv.experience.map((exp, i) => (
                <div key={i} data-blok="pozycja">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[13px] font-bold">
                      {exp.role || "Stanowisko"}
                    </p>
                    {exp.period && (
                      <p
                        className="shrink-0 text-[11px]"
                        style={{ color: PRESTIZ.szary }}
                      >
                        {exp.period}
                      </p>
                    )}
                  </div>
                  {(exp.company || exp.location) && (
                    <p
                      className="text-[12px] font-bold"
                      style={{ color: PRESTIZ.akcent }}
                    >
                      {[exp.company, exp.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <Punkty punkty={exp.bullets} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Projekty ---------- */}
        {cv.projects.length > 0 && (
          <section>
            <Naglowek>Projekty</Naglowek>
            <div className="flex flex-col gap-3">
              {cv.projects.map((proj, i) => (
                <div key={i} data-blok="pozycja">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[13px] font-bold">
                      {proj.name || "Projekt"}
                    </p>
                    {proj.period && (
                      <p
                        className="shrink-0 text-[11px]"
                        style={{ color: PRESTIZ.szary }}
                      >
                        {proj.period}
                      </p>
                    )}
                  </div>
                  {proj.technologies.filter(Boolean).length > 0 && (
                    <p
                      className="text-[12px] font-bold"
                      style={{ color: PRESTIZ.akcent }}
                    >
                      {proj.technologies.filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <Punkty punkty={proj.bullets} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Umiejętności jako kafelki ---------- */}
        {(cv.skills.technical.filter(Boolean).length > 0 ||
          cv.skills.soft_and_tools.filter(Boolean).length > 0) && (
          <section>
            <Naglowek>Umiejętności</Naglowek>
            <div className="flex flex-col gap-2">
              {cv.skills.technical.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.technical.filter(Boolean).map((s, i) => (
                    <span
                      key={i}
                      className="rounded px-2 py-[3px] text-[11.5px]"
                      style={{ background: PRESTIZ.kafel }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {cv.skills.soft_and_tools.filter(Boolean).length > 0 && (
                <p className="text-[12px]" style={{ color: PRESTIZ.szary }}>
                  {cv.skills.soft_and_tools.filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ---------- Edukacja i języki obok siebie ---------- */}
        {(cv.education.length > 0 ||
          cv.languages.filter(Boolean).length > 0) && (
          <section className="flex gap-8">
            {cv.education.length > 0 && (
              <div className="min-w-0 flex-1">
                <Naglowek>Edukacja</Naglowek>
                <div className="flex flex-col gap-2">
                  {cv.education.map((edu, i) => (
                    <div key={i} data-blok="pozycja">
                      <p className="text-[12.5px] font-bold">
                        {edu.institution || "Uczelnia"}
                      </p>
                      {edu.degree && (
                        <p className="text-[12px]">{edu.degree}</p>
                      )}
                      {edu.period && (
                        <p
                          className="text-[11px]"
                          style={{ color: PRESTIZ.szary }}
                        >
                          {edu.period}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cv.languages.filter(Boolean).length > 0 && (
              <div className="w-[38%] shrink-0">
                <Naglowek>Języki</Naglowek>
                <div className="flex flex-col gap-1">
                  {cv.languages.filter(Boolean).map((j, i) => (
                    <p key={i} className="text-[12px]">
                      {j}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {cv.rodo_clause && (
          <footer
            data-blok="pozycja"
            className="pt-2 text-[9px] italic"
            style={{ color: "#9CA3AF" }}
          >
            {cv.rodo_clause}
          </footer>
        )}
      </div>
    </div>
  );
}
