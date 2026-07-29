"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
  pdf,
} from "@react-pdf/renderer";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { opisLinku } from "@/lib/utils";
import { CvPdfBoczny } from "./cv-pdf-boczny";
import { CvPdfPrestizowy } from "./cv-pdf-prestizowy";
import { CvPdfGrafitowy } from "./cv-pdf-grafitowy";
import { CvPdfPastelowy } from "./cv-pdf-pastelowy";

// Font z pełną obsługą polskich znaków (wbudowane Helvetica ich nie ma).
Font.register({
  family: "Lato",
  fonts: [
    { src: "/fonts/Lato-Regular.ttf" },
    { src: "/fonts/Lato-Bold.ttf", fontWeight: "bold" },
    { src: "/fonts/Lato-Italic.ttf", fontStyle: "italic" },
  ],
});
// Nie dziel słów z myślnikiem — polskie CV czyta się lepiej bez przenoszenia.
Font.registerHyphenationCallback((word) => [word]);

type PdfTemplateStyle = {
  accent: string;
  pagePaddingVertical: number;
  pagePaddingHorizontal: number;
  fontSize: number;
  lineHeight: number;
  nameFontSize: number;
  nameLetterSpacing?: number;
  nameTransform?: "uppercase";
  sectionMarginTop: number;
  /**
   * MAKSYMALNIE 8% rozmiaru fontu. `letterSpacing` w react-pdf wstawia do pliku
   * REALNE odstępy — powyżej ~10% ekstrakcja tekstu czyta „D O Ś W I A D…",
   * a systemy rekrutacyjne rozpoznają sekcje CV po nazwach nagłówków.
   * Zmierzone: przy foncie 10 pt granica leży między 1,0 a 1,2.
   */
  headingLetterSpacing: number;
  headingPaddingBottom: number;
  headingMarginBottom: number;
  itemMarginBottom: number;
  rodoMarginTop: number;
};

/**
 * Ile pt musi się jeszcze zmieścić PO nagłówku sekcji, żeby react-pdf go
 * w ogóle wyrenderował — bez tego nagłówek zostawał sam na dole strony, a
 * pierwsza pozycja (np. projekt) startowała dopiero na kolejnej, wizualnie
 * urywając sekcję w połowie (realny bug zgłoszony przez użytkownika: „Projekty”
 * osierocone na dole strony 1). Gdy nie starczy miejsca, react-pdf przenosi
 * cały nagłówek RAZEM z dalszą treścią na nową stronę — to nie wymusza
 * podziału, tylko chroni przed sierotą. Wartość liczona z rozmiaru fontu
 * szablonu: nagłówek + linia stanowiska/firmy + jeden punkt.
 * https://react-pdf.org/advanced#orphan-&-widow-protection
 */
function minPresenceHeading(config: PdfTemplateStyle): number {
  return Math.round(config.fontSize * config.lineHeight * 3 + config.itemMarginBottom);
}

const PDF_TEMPLATE_STYLES: Record<TemplateId, PdfTemplateStyle> = {
  nowoczesny: {
    accent: "#0057D9", pagePaddingVertical: 40, pagePaddingHorizontal: 44,
    fontSize: 10, lineHeight: 1.4, nameFontSize: 22, sectionMarginTop: 14,
    headingLetterSpacing: 0.7, headingPaddingBottom: 3, headingMarginBottom: 6,
    itemMarginBottom: 8, rodoMarginTop: 16,
  },
  klasyczny: {
    accent: "#111827", pagePaddingVertical: 40, pagePaddingHorizontal: 44,
    fontSize: 10, lineHeight: 1.4, nameFontSize: 22, sectionMarginTop: 14,
    headingLetterSpacing: 0.7, headingPaddingBottom: 3, headingMarginBottom: 6,
    itemMarginBottom: 8, rodoMarginTop: 16,
  },
  minimalny: {
    accent: "#374151", pagePaddingVertical: 54, pagePaddingHorizontal: 52,
    fontSize: 10, lineHeight: 1.45, nameFontSize: 24, sectionMarginTop: 19,
    headingLetterSpacing: 0.7, headingPaddingBottom: 4, headingMarginBottom: 8,
    itemMarginBottom: 10, rodoMarginTop: 20,
  },
  elegancki: {
    accent: "#1E3A5F", pagePaddingVertical: 48, pagePaddingHorizontal: 52,
    fontSize: 10, lineHeight: 1.4, nameFontSize: 24, nameLetterSpacing: 1.7,
    nameTransform: "uppercase", sectionMarginTop: 17, headingLetterSpacing: 0.7,
    headingPaddingBottom: 4, headingMarginBottom: 7, itemMarginBottom: 10,
    rodoMarginTop: 18,
  },
  // Układy własne („boczny", „prestizowy", „grafitowy", „pastelowy") renderują
  // osobne komponenty — te wpisy istnieją tylko po to, by mapa pokrywała cały
  // typ TemplateId.
  pastelowy: {
    accent: "#1C1917", pagePaddingVertical: 32, pagePaddingHorizontal: 30,
    fontSize: 9.5, lineHeight: 1.45, nameFontSize: 27, sectionMarginTop: 16,
    headingLetterSpacing: 0.7, headingPaddingBottom: 4, headingMarginBottom: 9,
    itemMarginBottom: 11, rodoMarginTop: 24,
  },
  grafitowy: {
    accent: "#18181B", pagePaddingVertical: 34, pagePaddingHorizontal: 30,
    fontSize: 9.5, lineHeight: 1.45, nameFontSize: 25, sectionMarginTop: 16,
    headingLetterSpacing: 0.7, headingPaddingBottom: 3, headingMarginBottom: 8,
    itemMarginBottom: 11, rodoMarginTop: 20,
  },
  prestizowy: {
    accent: "#12716A", pagePaddingVertical: 34, pagePaddingHorizontal: 40,
    fontSize: 9.5, lineHeight: 1.45, nameFontSize: 23, sectionMarginTop: 14,
    headingLetterSpacing: 0.7, headingPaddingBottom: 3, headingMarginBottom: 7,
    itemMarginBottom: 9, rodoMarginTop: 12,
  },
  boczny: {
    accent: "#1F2937", pagePaddingVertical: 30, pagePaddingHorizontal: 26,
    fontSize: 9.5, lineHeight: 1.45, nameFontSize: 22, sectionMarginTop: 12,
    headingLetterSpacing: 0.7, headingPaddingBottom: 3, headingMarginBottom: 9,
    itemMarginBottom: 10, rodoMarginTop: 16,
  },
  kompaktowy: {
    accent: "#0057D9", pagePaddingVertical: 32, pagePaddingHorizontal: 34,
    fontSize: 9, lineHeight: 1.25, nameFontSize: 20, sectionMarginTop: 9,
    headingLetterSpacing: 0.6, headingPaddingBottom: 2, headingMarginBottom: 4,
    itemMarginBottom: 5, rodoMarginTop: 10,
  },
};

function makeStyles(config: PdfTemplateStyle) {
  const accent = config.accent;
  return StyleSheet.create({
    page: {
      fontFamily: "Lato",
      fontSize: config.fontSize,
      color: "#1f2937",
      paddingVertical: config.pagePaddingVertical,
      paddingHorizontal: config.pagePaddingHorizontal,
      lineHeight: config.lineHeight,
    },
    name: {
      fontSize: config.nameFontSize,
      fontWeight: "bold",
      color: accent,
      letterSpacing: config.nameLetterSpacing,
      textTransform: config.nameTransform,
      // Jawna wysokość wiersza: @react-pdf nie dziedziczy jej ze strony do
      // nagłówka, więc bez tego pole nazwiska było za niskie i tytuł wchodził
      // na jego spód (nachodzenie w PDF, choć podgląd HTML był poprawny).
      lineHeight: 1.2,
      marginBottom: 2,
    },
    title: { fontSize: 12, color: "#4b5563", marginTop: 2 },
    contact: { fontSize: 9, color: "#6b7280", marginTop: 6 },
    section: { marginTop: config.sectionMarginTop },
    heading: {
      fontSize: 9,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: config.headingLetterSpacing,
      borderBottomWidth: 1,
      borderBottomColor: accent === "#111827" ? "#d1d5db" : accent,
      paddingBottom: config.headingPaddingBottom,
      marginBottom: config.headingMarginBottom,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    // flex:1 + paddingRight zapobiega nachodzeniu tytułu na daty po prawej
    itemTitle: {
      flex: 1,
      paddingRight: 10,
      fontWeight: "bold",
      color: "#111827",
    },
    metaCol: { flexShrink: 0, alignItems: "flex-end" },
    itemMeta: { fontSize: 9, color: "#6b7280", textAlign: "right" },
    bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 6 },
    bulletDot: { width: 8, fontSize: 9 },
    bulletText: { flex: 1 },
    itemBlock: { marginBottom: config.itemMarginBottom },
    para: { marginTop: 2 },
    rodo: {
      marginTop: config.rodoMarginTop,
      fontSize: 8,
      fontStyle: "italic",
      color: "#9ca3af",
    },
  });
}

export function CvPdf({
  cv,
  template,
}: {
  cv: TailoredCv;
  template: TemplateId;
}) {
  // Układ dwukolumnowy ma własny dokument — inny szkielet, te same dane.
  if (template === "boczny") return <CvPdfBoczny cv={cv} />;
  if (template === "prestizowy") return <CvPdfPrestizowy cv={cv} />;
  if (template === "grafitowy") return <CvPdfGrafitowy cv={cv} />;
  if (template === "pastelowy") return <CvPdfPastelowy cv={cv} />;

  const config = PDF_TEMPLATE_STYLES[template];
  const s = makeStyles(config);
  const minPresence = minPresenceHeading(config);

  // Link musi zostac klikalny takze w PDF — inaczej rekruter widzi sam napis.
  const link = opisLinku(cv.personal_info.linkedin_or_github);
  const contact = [
    cv.personal_info.email,
    cv.personal_info.phone,
    cv.personal_info.location,
  ]
    .filter(Boolean)
    .join("  •  ");

  const techLine = cv.skills.technical.filter(Boolean).join(", ");
  const softLine = cv.skills.soft_and_tools.filter(Boolean).join(", ");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Nagłówek */}
        <View>
          <Text style={s.name}>
            {cv.personal_info.full_name || "Imię i nazwisko"}
          </Text>
          {cv.personal_info.title ? (
            <Text style={s.title}>{cv.personal_info.title}</Text>
          ) : null}
          {contact || link ? (
            <Text style={s.contact}>
              {contact}
              {link ? (
                <>
                  {contact ? "  •  " : ""}
                  {link.href ? (
                    <Link src={link.href} style={s.contact}>
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

        {/* Podsumowanie */}
        {cv.professional_summary ? (
          <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={minPresence}>
              Podsumowanie zawodowe
            </Text>
            <Text>{cv.professional_summary}</Text>
          </View>
        ) : null}

        {/* Doświadczenie */}
        {cv.experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={minPresence}>
              Doświadczenie zawodowe
            </Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={s.itemBlock} wrap={false}>
                <View style={s.rowBetween}>
                  <Text style={s.itemTitle}>
                    {exp.role || "Stanowisko"}
                    {exp.company ? (
                      <Text style={{ fontWeight: "normal", color: "#4b5563" }}>
                        {"  —  "}
                        {exp.company}
                      </Text>
                    ) : null}
                  </Text>
                  <View style={s.metaCol}>
                    {exp.period ? (
                      <Text style={s.itemMeta}>{exp.period}</Text>
                    ) : null}
                    {exp.location ? (
                      <Text style={s.itemMeta}>{exp.location}</Text>
                    ) : null}
                  </View>
                </View>
                {exp.bullets.filter(Boolean).map((b, j) => (
                  <View key={j} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projekty */}
        {cv.projects.length > 0 ? (
          <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={minPresence}>
              Projekty
            </Text>
            {cv.projects.map((proj, i) => (
              <View key={i} style={s.itemBlock} wrap={false}>
                <View style={s.rowBetween}>
                  <Text style={s.itemTitle}>
                    {proj.name || "Projekt"}
                    {proj.technologies.filter(Boolean).length > 0 ? (
                      <Text style={{ fontWeight: "normal", color: "#4b5563" }}>
                        {"  —  "}
                        {proj.technologies.filter(Boolean).join(", ")}
                      </Text>
                    ) : null}
                  </Text>
                  <View style={s.metaCol}>
                    {proj.period ? (
                      <Text style={s.itemMeta}>{proj.period}</Text>
                    ) : null}
                  </View>
                </View>
                {proj.link ? (
                  <Text style={{ fontSize: 9, color: "#6b7280" }}>
                    {proj.link}
                  </Text>
                ) : null}
                {proj.bullets.filter(Boolean).map((b, j) => (
                  <View key={j} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Umiejętności */}
        {techLine || softLine ? (
          <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={minPresence}>
              Umiejętności
            </Text>
            {techLine ? (
              <Text style={s.para}>
                <Text style={{ fontWeight: "bold" }}>Techniczne: </Text>
                {techLine}
              </Text>
            ) : null}
            {softLine ? (
              <Text style={s.para}>
                <Text style={{ fontWeight: "bold" }}>
                  Miękkie i narzędzia:{" "}
                </Text>
                {softLine}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Edukacja */}
        {cv.education.length > 0 ? (
          <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={minPresence}>
              Edukacja
            </Text>
            {cv.education.map((edu, i) => (
              <View
                key={i}
                style={[s.rowBetween, { marginBottom: 4 }]}
                wrap={false}
              >
                <Text style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontWeight: "bold", color: "#111827" }}>
                    {edu.institution || "Uczelnia"}
                  </Text>
                  {edu.degree ? (
                    <Text style={{ color: "#4b5563" }}>
                      {"  —  "}
                      {edu.degree}
                    </Text>
                  ) : null}
                </Text>
                <View style={s.metaCol}>
                  {edu.period ? (
                    <Text style={s.itemMeta}>{edu.period}</Text>
                  ) : null}
                  {edu.location ? (
                    <Text style={s.itemMeta}>{edu.location}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Języki */}
        {cv.languages.filter(Boolean).length > 0 ? (
          <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={minPresence}>
              Języki obce
            </Text>
            <Text>{cv.languages.filter(Boolean).join(", ")}</Text>
          </View>
        ) : null}

        {/* RODO */}
        {cv.rodo_clause ? (
          <Text style={s.rodo}>{cv.rodo_clause}</Text>
        ) : null}
      </Page>
    </Document>
  );
}

/** Generuje PDF i od razu pobiera plik na komputer. */
export async function downloadCvPdf(
  cv: TailoredCv,
  template: TemplateId,
  filename = "CV.pdf"
) {
  const blob = await pdf(<CvPdf cv={cv} template={template} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
