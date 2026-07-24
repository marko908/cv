/**
 * Weryfikacja wizualna szablonu PDF — renderuje nagłówek (nazwisko + tytuł)
 * w stylu danego szablonu i zapisuje PNG, żeby sprawdzić, czy nazwisko nie
 * nachodzi na tytuł. Używa TYCH SAMYCH wartości stylu co cv-pdf.tsx.
 *
 * Uruchom: npx tsx scripts/render-template.ts elegancki
 */
import path from "node:path";
import fs from "node:fs";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { pdf } from "pdf-to-img";
import { sampleCv } from "../src/lib/sample-cv";

const FONTS = path.resolve("public/fonts");
Font.register({
  family: "Lato",
  fonts: [
    { src: path.join(FONTS, "Lato-Regular.ttf") },
    { src: path.join(FONTS, "Lato-Bold.ttf"), fontWeight: "bold" },
    { src: path.join(FONTS, "Lato-Italic.ttf"), fontStyle: "italic" },
  ],
});
Font.registerHyphenationCallback((w) => [w]);

// Style skopiowane 1:1 z cv-pdf.tsx (z fixem nazwiska).
const STYLE: Record<string, any> = {
  elegancki: {
    accent: "#1E3A5F", padV: 48, padH: 52, fontSize: 10, lineHeight: 1.4,
    nameSize: 24, nameLS: 1.7, nameUpper: true, secMt: 17,
  },
  minimalny: {
    accent: "#374151", padV: 54, padH: 52, fontSize: 10, lineHeight: 1.45,
    nameSize: 24, secMt: 19,
  },
  kompaktowy: {
    accent: "#0057D9", padV: 32, padH: 34, fontSize: 9, lineHeight: 1.25,
    nameSize: 20, secMt: 9,
  },
  nowoczesny: {
    accent: "#0057D9", padV: 40, padH: 44, fontSize: 10, lineHeight: 1.4,
    nameSize: 22, secMt: 14,
  },
};

function build(id: string) {
  const cfg = STYLE[id];
  const s = StyleSheet.create({
    page: {
      fontFamily: "Lato", fontSize: cfg.fontSize, color: "#1f2937",
      paddingVertical: cfg.padV, paddingHorizontal: cfg.padH, lineHeight: cfg.lineHeight,
    },
    name: {
      fontSize: cfg.nameSize, fontWeight: "bold", color: cfg.accent,
      letterSpacing: cfg.nameLS, textTransform: cfg.nameUpper ? "uppercase" : undefined,
      lineHeight: 1.2, marginBottom: 2, // <-- fix nachodzenia
    },
    title: { fontSize: 12, color: "#4b5563", marginTop: 2 },
    contact: { fontSize: 9, color: "#6b7280", marginTop: 6 },
    heading: {
      fontSize: 9, fontWeight: "bold", color: cfg.accent, textTransform: "uppercase",
      letterSpacing: 1.3, borderBottomWidth: 1, borderBottomColor: cfg.accent,
      paddingBottom: 4, marginBottom: 7, marginTop: cfg.secMt,
    },
  });
  const cv = sampleCv;
  const contact = [cv.personal_info.email, cv.personal_info.phone, cv.personal_info.location]
    .filter(Boolean).join("  •  ");
  return React.createElement(
    Document, null,
    React.createElement(Page, { size: "A4", style: s.page },
      React.createElement(View, null,
        React.createElement(Text, { style: s.name }, cv.personal_info.full_name),
        React.createElement(Text, { style: s.title }, cv.personal_info.title),
        React.createElement(Text, { style: s.contact }, contact),
      ),
      React.createElement(Text, { style: s.heading }, "Podsumowanie zawodowe"),
      React.createElement(Text, null, cv.professional_summary),
    ),
  );
}

async function main() {
  const id = process.argv[2] || "elegancki";
  fs.mkdirSync("tmp/verify", { recursive: true });
  const buf = await renderToBuffer(build(id) as any);
  const doc = await pdf(buf, { scale: 2 });
  let n = 0;
  for await (const page of doc) {
    fs.writeFileSync(`tmp/verify/${id}-header.png`, page);
    n++;
    break; // tylko pierwsza strona
  }
  console.log(`OK — tmp/verify/${id}-header.png (${n} strona)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
