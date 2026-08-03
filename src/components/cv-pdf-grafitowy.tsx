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
import { MARGINES_STRONY_PT } from "@/lib/cv-templates";
import { opisLinku } from "@/lib/utils";

/**
 * Eksport PDF układu „Grafitowy" — odpowiednik `CvGrafitowy` z podglądu HTML.
 * Oba muszą pozostać SPÓJNE: użytkownik pobiera to, co widzi na ekranie.
 *
 * Ciemne tło panelu rysujemy osobną warstwą `position:"absolute"` + `fixed`,
 * inaczej kolor urywa się na drugiej stronie w miejscu, gdzie kończy się treść
 * panelu.
 */

const K = {
  panel: "#18181B",
  panelTekst: "#A1A1AA",
  panelJasny: "#F4F4F5",
  panelLinia: "#3F3F46",
  panelLink: "#D4D4D8",
  tekst: "#52525B",
  wyrozn: "#18181B",
  szary: "#71717A",
  linia: "#E4E4E7",
};

/** 35% szerokości A4 (595,28 pt) — w punktach, żeby zdjęcie pasowało co do pt. */
const SZEROKOSC_PANELU = 208;
const WYSOKOSC_ZDJECIA = 250;

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
  panelWnetrze: { paddingHorizontal: 22, paddingBottom: 30 },
  glowna: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: MARGINES_STRONY_PT.grafitowy,
  },
  /**
   * Górny margines KAŻDEJ strony. `fixed` powtarza element na wszystkich
   * kartkach; padding zwykłego <View> react-pdf nakłada RAZ na cały blok, więc
   * strony pośrednie zostawały bez marginesu (zmierzone: 8,4 pt od krawędzi).
   * Paddingu na <Page> użyć nie można — rozbija paginację układu dwukolumnowego
   * (kolumna główna przeskakuje o stronę, zostawiając pół kartki pustki).
   */
  odstepGory: { height: MARGINES_STRONY_PT.grafitowy },
  foto: {
    width: SZEROKOSC_PANELU,
    height: WYSOKOSC_ZDJECIA,
    objectFit: "cover",
  },

  /* ---------- Kolumna główna ---------- */
  naglowekBox: {
    borderBottomWidth: 1,
    borderBottomColor: K.linia,
    paddingBottom: 14,
    marginBottom: 14,
  },
  imie: {
    fontSize: 25,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: K.wyrozn,
    // Jawny lineHeight przy dużym foncie — bez tego react-pdf nakłada tytuł
    // na spód nazwiska (realny błąd wyłapany na renderze „Bocznego panelu").
    lineHeight: 1.2,
    // Bez `letterSpacing`: w PDF wstawia REALNE odstępy, przez co ekstrakcja
    // tekstu czyta „M A R K O". Nazwisko to kluczowe pole danych.
  },
  tytul: { fontSize: 11, color: K.szary, lineHeight: 1.3, marginTop: 5 },
  naglowekGlowny: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: K.wyrozn,
    marginBottom: 8,
  },
  sekcja: { marginBottom: 16 },
  pozycja: { marginBottom: 11 },
  wiersz: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  rola: { fontSize: 10.5, fontWeight: "bold", color: K.wyrozn, flex: 1, paddingRight: 8 },
  okres: { fontSize: 8.5, color: K.szary },
  firma: { fontSize: 9.5, fontWeight: "bold", color: K.szary, marginTop: 1 },
  punkt: { flexDirection: "row", marginTop: 3, paddingRight: 4 },
  kropka: { width: 8, fontSize: 9.5 },
  rodo: { marginTop: 20, fontSize: 7, color: "#A1A1AA", lineHeight: 1.3 },

  /* ---------- Panel boczny ---------- */
  sekcjaPanelu: { marginBottom: 18 },
  naglowekPanelu: {
    fontSize: 8.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: K.panelJasny,
    borderBottomWidth: 1,
    borderBottomColor: K.panelLinia,
    paddingBottom: 5,
    marginBottom: 7,
  },
  pozycjaPanelu: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: K.panelTekst,
    marginBottom: 3,
  },
  linkPanelu: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: K.panelLink,
    textDecoration: "underline",
    marginBottom: 3,
  },
});

// Nagłówek dostaje `minPresenceAhead`, żeby react-pdf nie zostawił go samego
// na dole strony — jeśli po nim nie zmieści się kawałek treści, cały nagłówek
// razem z nią przechodzi na kolejną stronę. https://react-pdf.org/advanced#orphan-&-widow-protection
const MIN_PRESENCE_GLOWNY = 55; // nagłówek + rola/firma + ok. 1 punkt
const MIN_PRESENCE_PANELU = 25; // nagłówek + 1-2 linijki listy w panelu

function SekcjaPanelu({
  tytul,
  children,
}: {
  tytul: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.sekcjaPanelu}>
      <Text style={s.naglowekPanelu} minPresenceAhead={MIN_PRESENCE_PANELU}>
        {tytul}
      </Text>
      {children}
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

export function CvPdfGrafitowy({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.tloPanelu} fixed />

        {/* ---------- Kolumna główna ---------- */}
        <View style={s.glowna}>
          <View style={s.odstepGory} fixed />
          <View style={s.naglowekBox}>
            <Text style={s.imie}>{p.full_name || "Imię i nazwisko"}</Text>
            {p.title ? <Text style={s.tytul}>{p.title}</Text> : null}
          </View>

          {cv.professional_summary ? (
            <View style={s.sekcja}>
              <Text>{cv.professional_summary}</Text>
            </View>
          ) : null}

          {cv.experience.length > 0 ? (
            <View style={s.sekcja}>
              <View minPresenceAhead={MIN_PRESENCE_GLOWNY} wrap={false}>
                <Text style={s.naglowekGlowny}>Doświadczenie</Text>
              </View>
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
              <View minPresenceAhead={MIN_PRESENCE_GLOWNY} wrap={false}>
                <Text style={s.naglowekGlowny}>Projekty</Text>
              </View>
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
              <View minPresenceAhead={MIN_PRESENCE_GLOWNY} wrap={false}>
                <Text style={s.naglowekGlowny}>Edukacja</Text>
              </View>
              {cv.education.map((edu, i) => (
                <View key={i} style={s.pozycja} wrap={false}>
                  <View style={s.wiersz}>
                    <Text style={s.rola}>{edu.institution || "Uczelnia"}</Text>
                    {edu.period ? (
                      <Text style={s.okres}>{edu.period}</Text>
                    ) : null}
                  </View>
                  {edu.degree || edu.location ? (
                    <Text>
                      {[edu.degree, edu.location].filter(Boolean).join(", ")}
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

          <View style={[s.panelWnetrze, { paddingTop: p.photo ? 24 : 34 }]}>
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

          {/* Zwarty, zawijający się akapit — spójne z podglądem HTML
              (cv-document-grafitowy.tsx). */}
          {cv.skills.technical.filter(Boolean).length > 0 ? (
            <SekcjaPanelu tytul="Technologie">
              <Text style={s.pozycjaPanelu}>
                {cv.skills.technical.filter(Boolean).join(" · ")}
              </Text>
            </SekcjaPanelu>
          ) : null}

          {cv.skills.soft_and_tools.filter(Boolean).length > 0 ? (
            <SekcjaPanelu tytul="Umiejętności">
              <Text style={s.pozycjaPanelu}>
                {cv.skills.soft_and_tools.filter(Boolean).join(" · ")}
              </Text>
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
        </View>
      </Page>
    </Document>
  );
}
