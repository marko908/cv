import type { TailoredCv } from "@/lib/cv-schema";
import { opisLinku } from "@/lib/utils";

/**
 * Układ „Grafitowy" — dwie kolumny z ciemnym panelem i dużym zdjęciem
 * opartym o krawędzie.
 *
 * Różni się od „Bocznego panelu" nie samym kolorem: tam jest ciepły beż,
 * wyśrodkowane nagłówki i małe zdjęcie w ramce, tu ciemny grafit, nagłówki
 * dosunięte do lewej z cienką linią pod spodem i fotografia na całą szerokość
 * panelu. Dla kandydatów, którzy chcą mocnego pierwszego wrażenia.
 *
 * Model danych identyczny jak w pozostałych szablonach (jedyny dodatek to
 * `personal_info.photo`), więc ocena, dopasowanie, walidator i wywiad działają
 * bez zmian.
 *
 * Uwaga ATS: kolumna główna jest PIERWSZA w drzewie (`flex-row-reverse`), więc
 * nazwisko i doświadczenie trafiają do strumienia tekstu przed panelem bocznym.
 */

export const GRAFITOWY = {
  panel: "#18181B", // grafit lewej kolumny
  panelTekst: "#A1A1AA",
  panelJasny: "#F4F4F5",
  panelLinia: "#3F3F46",
  tekst: "#52525B",
  wyrozn: "#18181B",
  szary: "#71717A",
  linia: "#E4E4E7",
};

/** Nagłówek sekcji w ciemnym panelu — jasny tekst, cienka linia pod spodem. */
function NaglowekPanelu({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-2.5 border-b pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em]"
      style={{ color: GRAFITOWY.panelJasny, borderColor: GRAFITOWY.panelLinia }}
    >
      {children}
    </h2>
  );
}

/** Nagłówek sekcji w kolumnie głównej — dosunięty do lewej, bez ozdobników. */
function NaglowekGlowny({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]"
      style={{ color: GRAFITOWY.wyrozn }}
    >
      {children}
    </h2>
  );
}

export function CvGrafitowy({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);

  return (
    <div
      className="flex min-h-full grow flex-row-reverse bg-white text-[12px] leading-relaxed"
      style={{
        fontFamily: "var(--font-cv), Lato, system-ui, sans-serif",
        color: GRAFITOWY.tekst,
      }}
    >
      {/* ---------- Kolumna główna (wizualnie po prawej, pierwsza w drzewie) --- */}
      <main className="flex min-w-0 flex-1 flex-col gap-7 px-10 py-10">
        <header
          className="border-b pb-5"
          style={{ borderColor: GRAFITOWY.linia }}
        >
          <h1
            className="text-[34px] font-bold uppercase leading-tight tracking-[0.03em]"
            style={{ color: GRAFITOWY.wyrozn }}
          >
            {p.full_name || "Imię i nazwisko"}
          </h1>
          {p.title && (
            <p
              className="mt-1.5 text-[14px]"
              style={{ color: GRAFITOWY.szary }}
            >
              {p.title}
            </p>
          )}
        </header>

        {cv.professional_summary && <p>{cv.professional_summary}</p>}

        {cv.experience.length > 0 && (
          <section>
            <NaglowekGlowny>Doświadczenie</NaglowekGlowny>
            <div className="flex flex-col gap-4">
              {cv.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: GRAFITOWY.wyrozn }}
                    >
                      {exp.role || "Stanowisko"}
                    </p>
                    {exp.period && (
                      <p
                        className="shrink-0 text-[10.5px]"
                        style={{ color: GRAFITOWY.szary }}
                      >
                        {exp.period}
                      </p>
                    )}
                  </div>
                  {(exp.company || exp.location) && (
                    <p
                      className="text-[11.5px] font-bold"
                      style={{ color: GRAFITOWY.szary }}
                    >
                      {[exp.company, exp.location].filter(Boolean).join(", ")}
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
            <div className="flex flex-col gap-4">
              {cv.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: GRAFITOWY.wyrozn }}
                    >
                      {proj.name || "Projekt"}
                    </p>
                    {proj.period && (
                      <p
                        className="shrink-0 text-[10.5px]"
                        style={{ color: GRAFITOWY.szary }}
                      >
                        {proj.period}
                      </p>
                    )}
                  </div>
                  {(proj.technologies.filter(Boolean).length > 0 ||
                    proj.link) && (
                    <p
                      className="break-words text-[11px]"
                      style={{ color: GRAFITOWY.szary }}
                    >
                      {[
                        proj.technologies.filter(Boolean).join(", "),
                        proj.link,
                      ]
                        .filter(Boolean)
                        .join("  |  ")}
                    </p>
                  )}
                  {proj.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-1.5 list-disc pl-4">
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
            <div className="flex flex-col gap-3">
              {cv.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="text-[12.5px] font-bold"
                      style={{ color: GRAFITOWY.wyrozn }}
                    >
                      {edu.institution || "Uczelnia"}
                    </p>
                    {edu.period && (
                      <p
                        className="shrink-0 text-[10.5px]"
                        style={{ color: GRAFITOWY.szary }}
                      >
                        {edu.period}
                      </p>
                    )}
                  </div>
                  {(edu.degree || edu.location) && (
                    <p className="text-[11.5px]">
                      {[edu.degree, edu.location].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cv.rodo_clause && (
          <footer
            className="mt-auto pt-6 text-[9px] leading-snug"
            style={{ color: "#A1A1AA" }}
          >
            {cv.rodo_clause}
          </footer>
        )}
      </main>

      {/* ---------- Panel boczny (wizualnie po lewej, drugi w drzewie) -------- */}
      <aside
        className="flex w-[35%] shrink-0 flex-col"
        style={{ background: GRAFITOWY.panel }}
      >
        {/* Zdjęcie na całą szerokość panelu; proporcja ta sama co w PDF. */}
        {p.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo}
            alt=""
            className="w-full shrink-0 object-cover object-top"
            style={{ aspectRatio: "208 / 250" }}
          />
        )}

        <div
          className="flex flex-col gap-7 px-7"
          style={{ paddingTop: p.photo ? 28 : 40, paddingBottom: 36 }}
        >
          {(p.email || p.phone || p.location || link) && (
            <section>
              <NaglowekPanelu>Kontakt</NaglowekPanelu>
              <ul
                className="flex flex-col gap-1.5 text-[11px]"
                style={{ color: GRAFITOWY.panelTekst }}
              >
                {p.phone && <li>{p.phone}</li>}
                {p.email && <li className="break-words">{p.email}</li>}
                {p.location && <li>{p.location}</li>}
                {link && (
                  <li className="break-words">
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                        style={{ color: "#D4D4D8" }}
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

          {/* Zwarty, zawijający się akapit zamiast wiersza na umiejętność —
              przy szerokim stacku pionowa lista zajmowała połowę panelu. */}
          {cv.skills.technical.filter(Boolean).length > 0 && (
            <section>
              <NaglowekPanelu>Technologie</NaglowekPanelu>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: GRAFITOWY.panelTekst }}
              >
                {cv.skills.technical.filter(Boolean).join(" · ")}
              </p>
            </section>
          )}

          {cv.skills.soft_and_tools.filter(Boolean).length > 0 && (
            <section>
              <NaglowekPanelu>Umiejętności</NaglowekPanelu>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: GRAFITOWY.panelTekst }}
              >
                {cv.skills.soft_and_tools.filter(Boolean).join(" · ")}
              </p>
            </section>
          )}

          {cv.languages.filter(Boolean).length > 0 && (
            <section>
              <NaglowekPanelu>Języki obce</NaglowekPanelu>
              <ul
                className="flex flex-col gap-1.5 text-[11px]"
                style={{ color: GRAFITOWY.panelTekst }}
              >
                {cv.languages.filter(Boolean).map((j, i) => (
                  <li key={i}>{j}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
