import type { TailoredCv } from "@/lib/cv-schema";
import { opisLinku } from "@/lib/utils";

/**
 * Układ „Pastelowy" — dwie kolumny z ciepłym, jasnym panelem i dużym zdjęciem
 * sięgającym krawędzi.
 *
 * Odróżnia się od „Bocznego panelu" i „Grafitowego" lekkością: cieńszy krój
 * nazwiska, jaśniejsza paleta (kość słoniowa #F9F6F0) i wypunktowania także
 * w panelu bocznym. Pod branże kreatywne i marketing.
 *
 * Uwaga ATS: kolumna główna jest PIERWSZA w drzewie (`flex-row-reverse`), więc
 * nazwisko i doświadczenie trafiają do strumienia tekstu przed panelem bocznym.
 */

export const PASTELOWY = {
  panel: "#F9F6F0", // ciepła kość słoniowa
  panelLinia: "#D6D3D1",
  tekst: "#52525B",
  wyrozn: "#1C1917",
  szary: "#78716C",
  data: "#A8A29E",
  linia: "#E7E5E4",
};

/** Nagłówek sekcji — ten sam rysunek w obu kolumnach, inna wielkość. */
function Naglowek({
  children,
  maly = false,
}: {
  children: React.ReactNode;
  maly?: boolean;
}) {
  return (
    <h2
      data-blok="naglowek"
      className={`mb-3 border-b pb-1 font-bold uppercase tracking-[0.08em] ${
        maly ? "text-[10px]" : "text-[11px]"
      }`}
      style={{
        color: PASTELOWY.wyrozn,
        borderColor: maly ? PASTELOWY.panelLinia : PASTELOWY.linia,
      }}
    >
      {children}
    </h2>
  );
}

/** Punkt listy — kropka w osobnej kolumnie, tak jak w PDF. */
function Punkt({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <span className="mt-px text-[10px]">•</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export function CvPastelowy({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);
  const techniczne = cv.skills.technical.filter(Boolean);
  const miekkie = cv.skills.soft_and_tools.filter(Boolean);
  const jezyki = cv.languages.filter(Boolean);

  return (
    <div
      className="flex min-h-full grow flex-row-reverse bg-white text-[11.5px] leading-relaxed"
      style={{
        fontFamily: "var(--font-cv), Lato, system-ui, sans-serif",
        color: PASTELOWY.tekst,
      }}
    >
      {/* ---------- Kolumna główna (wizualnie po prawej, pierwsza w drzewie) --- */}
      <main className="flex min-w-0 flex-1 flex-col gap-7 px-10 py-10">
        <header>
          <h1
            className="text-[34px] uppercase leading-tight tracking-[0.02em]"
            style={{ color: PASTELOWY.wyrozn }}
          >
            {p.full_name || "Imię i nazwisko"}
          </h1>
          {p.title && (
            <p
              className="mt-1 text-[12.5px] font-bold uppercase tracking-[0.05em]"
              style={{ color: PASTELOWY.szary }}
            >
              {p.title}
            </p>
          )}
        </header>

        {cv.professional_summary && (
          <section>
            <Naglowek>O mnie</Naglowek>
            <p>{cv.professional_summary}</p>
          </section>
        )}

        {cv.experience.length > 0 && (
          <section>
            <Naglowek>Doświadczenie</Naglowek>
            <div className="flex flex-col gap-4">
              {cv.experience.map((exp, i) => (
                <div key={i} data-blok="pozycja">
                  <div className="flex items-baseline justify-between gap-4">
                    <p
                      className="min-w-0 text-[12px] font-bold uppercase"
                      style={{ color: PASTELOWY.wyrozn }}
                    >
                      {exp.role || "Stanowisko"}
                    </p>
                    {exp.period && (
                      <p
                        className="shrink-0 text-[10px]"
                        style={{ color: PASTELOWY.data }}
                      >
                        {exp.period}
                      </p>
                    )}
                  </div>
                  {(exp.company || exp.location) && (
                    <p className="mb-1 text-[11px]">
                      {[exp.company, exp.location].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="flex flex-col gap-0.5">
                      {exp.bullets.filter(Boolean).map((b, j) => (
                        <Punkt key={j}>{b}</Punkt>
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
            <Naglowek>Projekty</Naglowek>
            <div className="flex flex-col gap-4">
              {cv.projects.map((proj, i) => (
                <div key={i} data-blok="pozycja">
                  <div className="flex items-baseline justify-between gap-4">
                    <p
                      className="min-w-0 text-[12px] font-bold uppercase"
                      style={{ color: PASTELOWY.wyrozn }}
                    >
                      {proj.name || "Projekt"}
                    </p>
                    {proj.period && (
                      <p
                        className="shrink-0 text-[10px]"
                        style={{ color: PASTELOWY.data }}
                      >
                        {proj.period}
                      </p>
                    )}
                  </div>
                  {(proj.technologies.filter(Boolean).length > 0 ||
                    proj.link) && (
                    <p className="mb-1 break-words text-[10.5px]">
                      {[
                        proj.technologies.filter(Boolean).join(", "),
                        proj.link,
                      ]
                        .filter(Boolean)
                        .join("  |  ")}
                    </p>
                  )}
                  {proj.bullets.filter(Boolean).length > 0 && (
                    <ul className="flex flex-col gap-0.5">
                      {proj.bullets.filter(Boolean).map((b, j) => (
                        <Punkt key={j}>{b}</Punkt>
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
            <Naglowek>Edukacja</Naglowek>
            <div className="flex flex-col gap-3">
              {cv.education.map((edu, i) => (
                <div key={i} data-blok="pozycja">
                  <div className="flex items-baseline justify-between gap-4">
                    <p
                      className="min-w-0 text-[11.5px] font-bold uppercase"
                      style={{ color: PASTELOWY.wyrozn }}
                    >
                      {edu.degree || "Kierunek"}
                    </p>
                    {edu.period && (
                      <p
                        className="shrink-0 text-[10px]"
                        style={{ color: PASTELOWY.data }}
                      >
                        {edu.period}
                      </p>
                    )}
                  </div>
                  {(edu.institution || edu.location) && (
                    <p className="text-[11px]">
                      {[edu.institution, edu.location]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cv.rodo_clause && (
          <footer
            data-blok="pozycja"
            className="pt-8 text-justify text-[8.5px] leading-tight"
            style={{ color: PASTELOWY.data }}
          >
            {cv.rodo_clause}
          </footer>
        )}
      </main>

      {/* ---------- Panel boczny (wizualnie po lewej, drugi w drzewie) -------- */}
      <aside
        className="flex w-[32%] shrink-0 flex-col"
        style={{ background: PASTELOWY.panel }}
      >
        {/* Zdjęcie na całą szerokość panelu; proporcja ta sama co w PDF. */}
        {p.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo}
            alt=""
            className="w-full shrink-0 object-cover object-center"
            style={{ aspectRatio: "190 / 240" }}
          />
        )}

        <div
          className="flex flex-col gap-6 px-7"
          style={{ paddingTop: p.photo ? 26 : 36, paddingBottom: 32 }}
        >
          {(p.email || p.phone || p.location || link) && (
            <section data-blok="tresc">
              <Naglowek maly>Kontakt</Naglowek>
              <ul className="flex flex-col gap-1 text-[10.5px]">
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
                        style={{ textDecorationColor: PASTELOWY.panelLinia }}
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
          {techniczne.length > 0 && (
            <section data-blok="tresc">
              <Naglowek maly>Umiejętności</Naglowek>
              <p className="text-[10.5px] leading-relaxed">
                {techniczne.join(" · ")}
              </p>
            </section>
          )}

          {miekkie.length > 0 && (
            <section data-blok="tresc">
              <Naglowek maly>Narzędzia i cechy</Naglowek>
              <p className="text-[10.5px] leading-relaxed">
                {miekkie.join(" · ")}
              </p>
            </section>
          )}

          {jezyki.length > 0 && (
            <section data-blok="tresc">
              <Naglowek maly>Języki obce</Naglowek>
              <ul className="flex flex-col gap-1 text-[10.5px]">
                {jezyki.map((j, i) => (
                  <Punkt key={i}>{j}</Punkt>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
