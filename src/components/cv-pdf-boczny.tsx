"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TailoredCv } from "@/lib/cv-schema";
import { opisLinku } from "@/lib/utils";

/**
 * Eksport PDF układu „Boczny panel" — odpowiednik `CvBoczny` z podglądu HTML.
 * Oba muszą pozostać SPÓJNE: użytkownik pobiera to, co widzi na ekranie.
 *
 * `wrap` na sekcjach pozwala react-pdf łamać treść na kolejne strony. Lewy
 * panel rysujemy jako tło rozciągnięte na całą wysokość strony, żeby beż nie
 * urywał się w połowie przy dłuższym CV.
 */

const K = {
  panel: "#EFE9E1",
  tekst: "#2F2A26",
  linia: "#D8CFC3",
  wyrozn: "#1F2937",
  szary: "#6B7280",
};

const SZEROKOSC_PANELU = "34%";

const s = StyleSheet.create({
  page: {
    fontFamily: "Lato",
    fontSize: 9.5,
    lineHeight: 1.45,
    color: K.tekst,
    // row-reverse: kolumna główna jest PIERWSZA w drzewie, więc w strumieniu
    // tekstu PDF nazwisko i doświadczenie idą przed panelem bocznym (tak czyta
    // je parser ATS), a wizualnie panel dalej jest po lewej.
    flexDirection: "row-reverse",
  },
  // Tło lewej kolumny — osobna warwa, żeby ciągnęło się przez całą stronę.
  tloPanelu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SZEROKOSC_PANELU,
    backgroundColor: K.panel,
  },
  panel: {
    width: SZEROKOSC_PANELU,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  glowna: {
    flex: 1,
    paddingHorizontal: 26,
    paddingVertical: 30,
  },
  foto: {
    width: 120,
    height: 120,
    objectFit: "cover",
    borderRadius: 4,
    marginBottom: 18,
    alignSelf: "center",
  },
  sekcjaPanelu: { marginBottom: 16 },
  naglowekPanelu: {
    fontSize: 8.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: K.wyrozn,
    marginBottom: 6,
  },
  pozycjaPanelu: { fontSize: 8.5, marginBottom: 3 },
  naglowekGlownyBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    marginTop: 4,
  },
  kreska: { flex: 1, height: 1, backgroundColor: K.linia },
  naglowekGlowny: {
    fontSize: 10.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: K.wyrozn,
    marginHorizontal: 8,
  },
  imie: {
    fontSize: 22,
    fontWeight: "bold",
    color: K.wyrozn,
    lineHeight: 1.2,
    marginBottom: 3,
  },
  tytul: { fontSize: 11.5, color: K.szary, lineHeight: 1.3 },
  podsumowanie: { marginTop: 12, marginBottom: 4 },
  pozycja: { marginBottom: 10 },
  wierszPozycji: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  rola: {
    fontSize: 10.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: K.wyrozn,
    flex: 1,
    paddingRight: 8,
  },
  okres: { fontSize: 8.5, color: K.szary },
  firma: { fontSize: 9, color: K.szary, marginTop: 1 },
  punkt: { flexDirection: "row", marginTop: 3, paddingRight: 4 },
  kropka: { width: 8, fontSize: 9.5 },
  rodo: { marginTop: 16, fontSize: 7, fontStyle: "italic", color: "#9CA3AF" },
});

function SekcjaPanelu({
  tytul,
  children,
}: {
  tytul: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.sekcjaPanelu}>
      <Text style={s.naglowekPanelu}>{tytul}</Text>
      {children}
    </View>
  );
}

function NaglowekGlowny({ tytul }: { tytul: string }) {
  return (
    <View style={s.naglowekGlownyBox}>
      <View style={s.kreska} />
      <Text style={s.naglowekGlowny}>{tytul}</Text>
      <View style={s.kreska} />
    </View>
  );
}

function Punkty({ punkty }: { punkty: string[] }) {
  return (
    <>
      {punkty.filter(Boolean).map((b, i) => (
        <View key={i} style={s.punkt}>
          <Text style={s.kropka}>•</Text>
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </>
  );
}

export function CvPdfBoczny({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.tloPanelu} fixed />

        {/* ---------- Prawa kolumna ---------- */}
        <View style={s.glowna}>
          <View>
            <Text style={s.imie}>{p.full_name || "Imię i nazwisko"}</Text>
            {p.title ? <Text style={s.tytul}>{p.title}</Text> : null}
          </View>

          {cv.professional_summary ? (
            <Text style={s.podsumowanie}>{cv.professional_summary}</Text>
          ) : null}

          {cv.experience.length > 0 ? (
            <View>
              <NaglowekGlowny tytul="Doświadczenie" />
              {cv.experience.map((exp, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wierszPozycji}>
                    <Text style={s.rola}>{exp.role || "Stanowisko"}</Text>
                    {exp.period ? (
                      <Text style={s.okres}>{exp.period}</Text>
                    ) : null}
                  </View>
                  {exp.company || exp.location ? (
                    <Text style={s.firma}>
                      {[exp.company, exp.location].filter(Boolean).join(" · ")}
                    </Text>
                  ) : null}
                  <Punkty punkty={exp.bullets} />
                </View>
              ))}
            </View>
          ) : null}

          {cv.projects.length > 0 ? (
            <View>
              <NaglowekGlowny tytul="Projekty" />
              {cv.projects.map((proj, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wierszPozycji}>
                    <Text style={s.rola}>{proj.name || "Projekt"}</Text>
                    {proj.period ? (
                      <Text style={s.okres}>{proj.period}</Text>
                    ) : null}
                  </View>
                  {proj.technologies.filter(Boolean).length > 0 ? (
                    <Text style={s.firma}>
                      {proj.technologies.filter(Boolean).join(", ")}
                    </Text>
                  ) : null}
                  <Punkty punkty={proj.bullets} />
                </View>
              ))}
            </View>
          ) : null}

          {cv.education.length > 0 ? (
            <View>
              <NaglowekGlowny tytul="Edukacja" />
              {cv.education.map((edu, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wierszPozycji}>
                    <Text style={s.rola}>{edu.institution || "Uczelnia"}</Text>
                    {edu.period ? (
                      <Text style={s.okres}>{edu.period}</Text>
                    ) : null}
                  </View>
                  {edu.degree ? (
                    <Text style={s.firma}>{edu.degree}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {cv.rodo_clause ? (
            <Text style={s.rodo}>{cv.rodo_clause}</Text>
          ) : null}
        </View>
        {/* ---------- Lewa kolumna ---------- */}
        <View style={s.panel}>
          {p.photo ? <Image src={p.photo} style={s.foto} /> : null}

          {p.email || p.phone || p.location || link ? (
            <SekcjaPanelu tytul="Kontakt">
              {p.email ? <Text style={s.pozycjaPanelu}>{p.email}</Text> : null}
              {p.phone ? <Text style={s.pozycjaPanelu}>{p.phone}</Text> : null}
              {p.location ? (
                <Text style={s.pozycjaPanelu}>{p.location}</Text>
              ) : null}
              {link ? (
                link.href ? (
                  <Link src={link.href} style={s.pozycjaPanelu}>
                    {link.etykieta}
                  </Link>
                ) : (
                  <Text style={s.pozycjaPanelu}>{link.etykieta}</Text>
                )
              ) : null}
            </SekcjaPanelu>
          ) : null}

          {cv.skills.technical.filter(Boolean).length > 0 ? (
            <SekcjaPanelu tytul="Umiejętności">
              {cv.skills.technical.filter(Boolean).map((x, i) => (
                <Text key={i} style={s.pozycjaPanelu}>
                  • {x}
                </Text>
              ))}
            </SekcjaPanelu>
          ) : null}

          {cv.skills.soft_and_tools.filter(Boolean).length > 0 ? (
            <SekcjaPanelu tytul="Mocne strony">
              {cv.skills.soft_and_tools.filter(Boolean).map((x, i) => (
                <Text key={i} style={s.pozycjaPanelu}>
                  • {x}
                </Text>
              ))}
            </SekcjaPanelu>
          ) : null}

          {cv.languages.filter(Boolean).length > 0 ? (
            <SekcjaPanelu tytul="Języki obce">
              {cv.languages.filter(Boolean).map((x, i) => (
                <Text key={i} style={s.pozycjaPanelu}>
                  {x}
                </Text>
              ))}
            </SekcjaPanelu>
          ) : null}
        </View>

      </Page>
    </Document>
  );
}
