"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";

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

function makeStyles(accent: string) {
  return StyleSheet.create({
    page: {
      fontFamily: "Lato",
      fontSize: 10,
      color: "#1f2937",
      paddingVertical: 40,
      paddingHorizontal: 44,
      lineHeight: 1.4,
    },
    name: { fontSize: 22, fontWeight: "bold", color: accent },
    title: { fontSize: 12, color: "#4b5563", marginTop: 2 },
    contact: { fontSize: 9, color: "#6b7280", marginTop: 6 },
    section: { marginTop: 14 },
    heading: {
      fontSize: 9,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      borderBottomWidth: 1,
      borderBottomColor: accent === "#111827" ? "#d1d5db" : accent,
      paddingBottom: 3,
      marginBottom: 6,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemTitle: { fontWeight: "bold", color: "#111827" },
    itemMeta: { fontSize: 9, color: "#6b7280", textAlign: "right" },
    bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 6 },
    bulletDot: { width: 8, fontSize: 9 },
    bulletText: { flex: 1 },
    itemBlock: { marginBottom: 8 },
    para: { marginTop: 2 },
    rodo: {
      marginTop: 16,
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
  const accent = template === "nowoczesny" ? "#0057D9" : "#111827";
  const s = makeStyles(accent);

  const contact = [
    cv.personal_info.email,
    cv.personal_info.phone,
    cv.personal_info.location,
    cv.personal_info.linkedin_or_github,
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
          {contact ? <Text style={s.contact}>{contact}</Text> : null}
        </View>

        {/* Podsumowanie */}
        {cv.professional_summary ? (
          <View style={s.section}>
            <Text style={s.heading}>Podsumowanie zawodowe</Text>
            <Text>{cv.professional_summary}</Text>
          </View>
        ) : null}

        {/* Doświadczenie */}
        {cv.experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.heading}>Doświadczenie zawodowe</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={s.itemBlock}>
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
                  <View>
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
            <Text style={s.heading}>Projekty</Text>
            {cv.projects.map((proj, i) => (
              <View key={i} style={s.itemBlock}>
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
                  {proj.period ? (
                    <Text style={s.itemMeta}>{proj.period}</Text>
                  ) : null}
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
            <Text style={s.heading}>Umiejętności</Text>
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
            <Text style={s.heading}>Edukacja</Text>
            {cv.education.map((edu, i) => (
              <View key={i} style={[s.rowBetween, { marginBottom: 4 }]}>
                <Text>
                  <Text style={s.itemTitle}>
                    {edu.institution || "Uczelnia"}
                  </Text>
                  {edu.degree ? (
                    <Text style={{ color: "#4b5563" }}>
                      {"  —  "}
                      {edu.degree}
                    </Text>
                  ) : null}
                </Text>
                <View>
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
            <Text style={s.heading}>Języki obce</Text>
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
