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
 * Eksport PDF układu „Pastelowy" — odpowiednik `CvPastelowy` z podglądu HTML.
 * Oba muszą pozostać SPÓJNE: użytkownik pobiera to, co widzi na ekranie.
 *
 * Jasne tło panelu rysujemy osobną warstwą `position:"absolute"` + `fixed`,
 * inaczej kolor urywa się na drugiej stronie tam, gdzie kończy się treść panelu.
 */

const K = {
  panel: "#F9F6F0",
  panelLinia: "#D6D3D1",
  tekst: "#52525B",
  wyrozn: "#1C1917",
  szary: "#78716C",
  data: "#A8A29E",
  linia: "#E7E5E4",
};

/** 32% szerokości A4 (595,28 pt) — w punktach, żeby zdjęcie pasowało co do pt. */
const SZEROKOSC_PANELU = 190;
const WYSOKOSC_ZDJECIA = 240;

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
  tloPanelu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SZEROKOSC_PANELU,
    backgroundColor: K.panel,
  },
  panel: { width: SZEROKOSC_PANELU },
  // Padding trzymamy w warstwie WEWNĘTRZNEJ, żeby zdjęcie mogło sięgać krawędzi
  // panelu bez ujemnych marginesów.
  panelWnetrze: { paddingHorizontal: 20, paddingBottom: 28 },
  glowna: { flex: 1, paddingHorizontal: 30, paddingVertical: 32 },
  foto: {
    width: SZEROKOSC_PANELU,
    height: WYSOKOSC_ZDJECIA,
    objectFit: "cover",
  },

  /* ---------- Kolumna główna ---------- */
  naglowekBox: { marginBottom: 18 },
  imie: {
    fontSize: 27,
    textTransform: "uppercase",
    color: K.wyrozn,
    // Jawny lineHeight przy dużym foncie — bez tego react-pdf nakłada tytuł
    // na spód nazwiska.
    lineHeight: 1.2,
    letterSpacing: 0.5, // 1,9% fontu — bezpiecznie poniżej progu ekstrakcji
  },
  tytul: {
    fontSize: 10.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: K.szary,
    letterSpacing: 0.5,
    lineHeight: 1.3,
    marginTop: 4,
  },
  naglowekGlowny: {
    fontSize: 9.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: K.wyrozn,
    letterSpacing: 0.7,
    borderBottomWidth: 1,
    borderBottomColor: K.linia,
    paddingBottom: 4,
    marginBottom: 9,
  },
  sekcja: { marginBottom: 16 },
  // Bez justowania: dzielenie wyrazów jest w aplikacji wyłączone (polskie CV
  // czyta się lepiej bez przenoszenia), więc justunek rozpychałby odstępy.
  podsumowanie: {},
  pozycja: { marginBottom: 11 },
  wiersz: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  // flex:1 + paddingRight: bez tego długie stanowisko wchodzi na daty po prawej
  rola: {
    fontSize: 10.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: K.wyrozn,
    flex: 1,
    paddingRight: 8,
  },
  okres: { fontSize: 8.5, color: K.data },
  firma: { fontSize: 9.5, marginTop: 1, marginBottom: 3 },
  rodo: {
    marginTop: 24,
    fontSize: 7,
    color: K.data,
    textAlign: "justify",
    lineHeight: 1.3,
  },

  /* ---------- Panel boczny ---------- */
  sekcjaPanelu: { marginBottom: 18 },
  naglowekPanelu: {
    fontSize: 8.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: K.wyrozn,
    letterSpacing: 0.6,
    borderBottomWidth: 1,
    borderBottomColor: K.panelLinia,
    paddingBottom: 4,
    marginBottom: 7,
  },
  pozycjaPanelu: { fontSize: 8.5, lineHeight: 1.5, marginBottom: 2 },
  linkPanelu: {
    fontSize: 8.5,
    lineHeight: 1.5,
    marginBottom: 2,
    color: K.tekst,
    textDecoration: "underline",
  },

  /* ---------- Wypunktowania (wspólne dla obu kolumn) ---------- */
  punkt: { flexDirection: "row", marginTop: 2.5, paddingRight: 4 },
  kropka: { width: 8 },
  // flex:1 na tekście punktu — inaczej długa treść wychodzi poza kolumnę
  trescPunktu: { flex: 1 },
});

function Punkty({
  punkty,
  maly = false,
}: {
  punkty: string[];
  maly?: boolean;
}) {
  const rozmiar = maly ? { fontSize: 8.5, lineHeight: 1.5 } : {};
  return (
    <>
      {punkty.filter(Boolean).map((b, i) => (
        <View key={i} style={s.punkt}>
          <Text style={[s.kropka, rozmiar]}>•</Text>
          <Text style={[s.trescPunktu, rozmiar]}>{b}</Text>
        </View>
      ))}
    </>
  );
}

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

export function CvPdfPastelowy({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);
  const techniczne = cv.skills.technical.filter(Boolean);
  const miekkie = cv.skills.soft_and_tools.filter(Boolean);
  const jezyki = cv.languages.filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.tloPanelu} fixed />

        {/* ---------- Kolumna główna ---------- */}
        <View style={s.glowna}>
          <View style={s.naglowekBox}>
            <Text style={s.imie}>{p.full_name || "Imię i nazwisko"}</Text>
            {p.title ? <Text style={s.tytul}>{p.title}</Text> : null}
          </View>

          {cv.professional_summary ? (
            <View style={s.sekcja}>
              <Text style={s.naglowekGlowny}>O mnie</Text>
              <Text style={s.podsumowanie}>{cv.professional_summary}</Text>
            </View>
          ) : null}

          {cv.experience.length > 0 ? (
            <View style={s.sekcja}>
              <Text style={s.naglowekGlowny}>Doświadczenie</Text>
              {cv.experience.map((exp, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wiersz}>
                    <Text style={s.rola}>{exp.role || "Stanowisko"}</Text>
                    {exp.period ? (
                      <Text style={s.okres}>{exp.period}</Text>
                    ) : null}
                  </View>
                  {exp.company || exp.location ? (
                    <Text style={s.firma}>
                      {[exp.company, exp.location].filter(Boolean).join(", ")}
                    </Text>
                  ) : null}
                  <Punkty punkty={exp.bullets} />
                </View>
              ))}
            </View>
          ) : null}

          {cv.projects.length > 0 ? (
            <View style={s.sekcja}>
              <Text style={s.naglowekGlowny}>Projekty</Text>
              {cv.projects.map((proj, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wiersz}>
                    <Text style={s.rola}>{proj.name || "Projekt"}</Text>
                    {proj.period ? (
                      <Text style={s.okres}>{proj.period}</Text>
                    ) : null}
                  </View>
                  {proj.technologies.filter(Boolean).length > 0 || proj.link ? (
                    <Text style={s.firma}>
                      {[proj.technologies.filter(Boolean).join(", "), proj.link]
                        .filter(Boolean)
                        .join("  |  ")}
                    </Text>
                  ) : null}
                  <Punkty punkty={proj.bullets} />
                </View>
              ))}
            </View>
          ) : null}

          {cv.education.length > 0 ? (
            <View style={s.sekcja}>
              <Text style={s.naglowekGlowny}>Edukacja</Text>
              {cv.education.map((edu, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wiersz}>
                    <Text style={s.rola}>{edu.degree || "Kierunek"}</Text>
                    {edu.period ? (
                      <Text style={s.okres}>{edu.period}</Text>
                    ) : null}
                  </View>
                  {edu.institution || edu.location ? (
                    <Text style={s.firma}>
                      {[edu.institution, edu.location]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {cv.rodo_clause ? (
            <Text style={s.rodo}>{cv.rodo_clause}</Text>
          ) : null}
        </View>

        {/* ---------- Panel boczny ---------- */}
        <View style={s.panel}>
          {p.photo ? <Image src={p.photo} style={s.foto} /> : null}

          <View style={[s.panelWnetrze, { paddingTop: p.photo ? 22 : 32 }]}>
            {p.email || p.phone || p.location || link ? (
              <SekcjaPanelu tytul="Kontakt">
                {p.phone ? <Text style={s.pozycjaPanelu}>{p.phone}</Text> : null}
                {p.email ? <Text style={s.pozycjaPanelu}>{p.email}</Text> : null}
                {p.location ? (
                  <Text style={s.pozycjaPanelu}>{p.location}</Text>
                ) : null}
                {link ? (
                  link.href ? (
                    <Link src={link.href} style={s.linkPanelu}>
                      {link.etykieta}
                    </Link>
                  ) : (
                    <Text style={s.pozycjaPanelu}>{link.etykieta}</Text>
                  )
                ) : null}
              </SekcjaPanelu>
            ) : null}

            {techniczne.length > 0 ? (
              <SekcjaPanelu tytul="Umiejętności">
                <Punkty punkty={techniczne} maly />
              </SekcjaPanelu>
            ) : null}

            {miekkie.length > 0 ? (
              <SekcjaPanelu tytul="Narzędzia i cechy">
                <Punkty punkty={miekkie} maly />
              </SekcjaPanelu>
            ) : null}

            {jezyki.length > 0 ? (
              <SekcjaPanelu tytul="Języki obce">
                <Punkty punkty={jezyki} maly />
              </SekcjaPanelu>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
