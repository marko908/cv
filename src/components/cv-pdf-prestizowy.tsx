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
 * Eksport PDF układu „Prestiżowy" — odpowiednik `CvPrestizowy` z podglądu HTML.
 * Oba muszą pozostać SPÓJNE: użytkownik pobiera to, co widzi na ekranie.
 *
 * Jedna kolumna, więc kolejność tekstu w pliku jest naturalnie poprawna dla
 * parserów (nazwisko → profil → doświadczenie) — bez sztuczek z `row-reverse`.
 */

const K = {
  akcent: "#12716A",
  tekst: "#26303B",
  szary: "#6B7683",
  linia: "#E2E6E9",
  kafel: "#F1F5F4",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Lato",
    fontSize: 9.5,
    lineHeight: 1.45,
    color: K.tekst,
    paddingTop: 34,
    paddingBottom: 34,
    paddingLeft: 42,
    paddingRight: 38,
  },
  // Pasek akcentu przy lewej krawędzi — `fixed`, żeby był na każdej stronie.
  pasek: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 5,
    backgroundColor: K.akcent,
  },
  naglowekGorny: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  foto: {
    width: 78,
    height: 78,
    borderRadius: 39,
    objectFit: "cover",
    marginRight: 18,
    borderWidth: 1.5,
    borderColor: K.akcent,
  },
  imie: { fontSize: 23, fontWeight: "bold", lineHeight: 1.2, marginBottom: 2 },
  tytul: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    // Bez rozstrzelenia liter: w PDF `letterSpacing` wstawia realne odstępy,
    // przez co ekstrakcja tekstu czyta „F R O N T E N D" zamiast „FRONTEND".
    // Stanowisko to kluczowe pole danych, więc tu wygrywa czytelność maszynowa.
    color: K.akcent,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  kontakt: { fontSize: 8.5, color: K.szary },
  kreskaGorna: { height: 1, backgroundColor: K.linia, marginBottom: 14 },

  sekcja: { marginBottom: 14 },
  naglowek: {
    fontSize: 9.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: K.akcent,
  },
  podkreslenie: {
    height: 1.6,
    width: 24,
    backgroundColor: K.akcent,
    marginTop: 3,
    marginBottom: 7,
  },

  pozycja: { marginBottom: 9 },
  wiersz: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  rola: { fontSize: 10.5, fontWeight: "bold", flex: 1, paddingRight: 8 },
  okres: { fontSize: 8.5, color: K.szary },
  firma: { fontSize: 9.5, fontWeight: "bold", color: K.akcent, marginTop: 1 },

  punkt: { flexDirection: "row", marginTop: 2.5, paddingRight: 4 },
  kropka: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: K.akcent,
    marginTop: 5,
    marginRight: 6,
  },

  kafelki: { flexDirection: "row", flexWrap: "wrap" },
  kafel: {
    backgroundColor: K.kafel,
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  kafelTekst: { fontSize: 8.5 },
  miekkie: { fontSize: 9, color: K.szary, marginTop: 2 },

  dol: { flexDirection: "row" },
  dolLewa: { flex: 1, paddingRight: 20 },
  dolPrawa: { width: "38%" },

  rodo: { marginTop: 12, fontSize: 7, fontStyle: "italic", color: "#9CA3AF" },
});

function Naglowek({ tytul }: { tytul: string }) {
  return (
    <View>
      <Text style={s.naglowek}>{tytul}</Text>
      <View style={s.podkreslenie} />
    </View>
  );
}

function Punkty({ punkty }: { punkty: string[] }) {
  return (
    <>
      {punkty.filter(Boolean).map((b, i) => (
        <View key={i} style={s.punkt}>
          <View style={s.kropka} />
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </>
  );
}

export function CvPdfPrestizowy({ cv }: { cv: TailoredCv }) {
  const p = cv.personal_info;
  const link = opisLinku(p.linkedin_or_github);
  const kontakt = [p.email, p.phone, p.location].filter(Boolean).join("  ·  ");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.pasek} fixed />

        {/* ---------- Nagłówek ---------- */}
        <View style={s.naglowekGorny}>
          {p.photo ? <Image src={p.photo} style={s.foto} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={s.imie}>{p.full_name || "Imię i nazwisko"}</Text>
            {p.title ? <Text style={s.tytul}>{p.title}</Text> : null}
            {kontakt || link ? (
              <Text style={s.kontakt}>
                {kontakt}
                {link ? (
                  <>
                    {kontakt ? "  ·  " : ""}
                    {link.href ? (
                      <Link src={link.href} style={s.kontakt}>
                        {link.etykieta}
                      </Link>
                    ) : (
                      link.etykieta
                    )}
                  </>
                ) : null}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={s.kreskaGorna} />

        {/* ---------- Profil ---------- */}
        {cv.professional_summary ? (
          <View style={s.sekcja}>
            <Naglowek tytul="Profil" />
            <Text>{cv.professional_summary}</Text>
          </View>
        ) : null}

        {/* ---------- Doświadczenie ---------- */}
        {cv.experience.length > 0 ? (
          <View style={s.sekcja}>
            <Naglowek tytul="Doświadczenie" />
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
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </Text>
                ) : null}
                <Punkty punkty={exp.bullets} />
              </View>
            ))}
          </View>
        ) : null}

        {/* ---------- Projekty ---------- */}
        {cv.projects.length > 0 ? (
          <View style={s.sekcja}>
            <Naglowek tytul="Projekty" />
            {cv.projects.map((proj, i) => (
              <View key={i} style={s.pozycja} wrap={false}>
                <View style={s.wiersz}>
                  <Text style={s.rola}>{proj.name || "Projekt"}</Text>
                  {proj.period ? (
                    <Text style={s.okres}>{proj.period}</Text>
                  ) : null}
                </View>
                {proj.technologies.filter(Boolean).length > 0 ? (
                  <Text style={s.firma}>
                    {proj.technologies.filter(Boolean).join(" · ")}
                  </Text>
                ) : null}
                <Punkty punkty={proj.bullets} />
              </View>
            ))}
          </View>
        ) : null}

        {/* ---------- Umiejętności ---------- */}
        {cv.skills.technical.filter(Boolean).length > 0 ||
        cv.skills.soft_and_tools.filter(Boolean).length > 0 ? (
          <View style={s.sekcja}>
            <Naglowek tytul="Umiejętności" />
            {cv.skills.technical.filter(Boolean).length > 0 ? (
              <View style={s.kafelki}>
                {cv.skills.technical.filter(Boolean).map((x, i) => (
                  <View key={i} style={s.kafel}>
                    <Text style={s.kafelTekst}>{x}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {cv.skills.soft_and_tools.filter(Boolean).length > 0 ? (
              <Text style={s.miekkie}>
                {cv.skills.soft_and_tools.filter(Boolean).join(" · ")}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* ---------- Edukacja + języki ---------- */}
        {cv.education.length > 0 || cv.languages.filter(Boolean).length > 0 ? (
          <View style={s.dol}>
            {cv.education.length > 0 ? (
              <View style={s.dolLewa}>
                <Naglowek tytul="Edukacja" />
                {cv.education.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                    <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                      {edu.institution || "Uczelnia"}
                    </Text>
                    {edu.degree ? <Text>{edu.degree}</Text> : null}
                    {edu.period ? (
                      <Text style={s.okres}>{edu.period}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
            {cv.languages.filter(Boolean).length > 0 ? (
              <View style={s.dolPrawa}>
                <Naglowek tytul="Języki" />
                {cv.languages.filter(Boolean).map((j, i) => (
                  <Text key={i}>{j}</Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {cv.rodo_clause ? <Text style={s.rodo}>{cv.rodo_clause}</Text> : null}
      </Page>
    </Document>
  );
}
