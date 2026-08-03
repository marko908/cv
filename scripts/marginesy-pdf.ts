/** Mierzy marginesy górny/dolny na KAŻDEJ stronie wygenerowanego PDF-a. */
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { getDocumentProxy } from "unpdf";
import { sampleCv } from "../src/lib/sample-cv";
import type { TemplateId } from "../src/lib/store";
import type { TailoredCv } from "../src/lib/cv-schema";

// W node ścieżki „/fonts/..." nie istnieją — rejestrujemy z dysku, jak verify-szablon.
const FONTS = path.resolve("public/fonts");
Font.register({
  family: "Lato",
  fonts: [
    { src: path.join(FONTS, "Lato-Regular.ttf") },
    { src: path.join(FONTS, "Lato-Bold.ttf"), fontWeight: "bold" },
    { src: path.join(FONTS, "Lato-Italic.ttf"), fontStyle: "italic" },
  ],
});
Font.registerHyphenationCallback((w: string) => [w]);

const dlugieCv: TailoredCv = {
  ...sampleCv,
  experience: [0, 1, 2, 3, 4].map((i) => ({
    ...sampleCv.experience[0],
    company: `Firma ${i + 1} Sp. z o.o.`,
    role: i % 2 ? "Account Executive" : "Junior PR Executive",
    period: `202${i} - 202${i + 1}`,
    bullets: [
      "Wspierałem obsługę PR marek sprzętowych z branży gamingowej.",
      "Prowadziłem analizę rynku i trendów technologicznych, tworzyłem treści na social media, współpracowałem z influencerami oraz przygotowywałem i dystrybuowałem materiały prasowe.",
      "Klienci: Acer, Predator, ADATA, XPG",
    ],
  })),
  projects: [0, 1, 2, 3, 4, 5].map((i) => ({
    ...sampleCv.projects[0],
    name: `Projekt numer ${i + 1}`,
    bullets: [
      "Pakiet narzędzi automatyzujący raportowanie PR: rozszerzenie przeglądarki masowo wgrywające publikacje do systemu oraz aplikacja desktopowa czyszcząca i walidująca dane raportowe.",
    ],
  })),
};

async function zmierz(id: TemplateId) {
  const { CvPdf } = await import("../src/components/cv-pdf");
  const buf = await renderToBuffer(
    React.createElement(CvPdf, { cv: dlugieCv, template: id }) as never
  );
  const out = path.join(process.cwd(), "scripts", "_podglad");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `margines-${id}.pdf`), buf);

  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const wiersze: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const st = await pdf.getPage(i);
    const vp = st.getViewport({ scale: 1 });
    const tc = await st.getTextContent();
    const items = (tc.items as { str: string; transform: number[] }[]).filter(
      (it) => it.str.trim()
    );
    if (!items.length) continue;
    const ys = items.map((it) => vp.height - it.transform[5]);
    const SEKCJE = [
      "doświadczenie", "doswiadczenie", "doświadczenie zawodowe",
      "projekty", "umiejętności", "umiejetnosci", "edukacja",
      "języki obce", "jezyki obce", "podsumowanie", "podsumowanie zawodowe",
      "kontakt", "technologie",
    ];
    const posortowane = items
      .map((it, n) => ({ y: ys[n], s: it.str }))
      .sort((a, b) => a.y - b.y);
    const ostatni = posortowane[posortowane.length - 1].s.trim();
    const osierocony =
      i < pdf.numPages && SEKCJE.includes(ostatni.toLowerCase());
    wiersze.push(
      `  s.${i}: góra ${Math.min(...ys).toFixed(1)}pt · dół ${(
        vp.height - Math.max(...ys)
      ).toFixed(1)}pt · koniec „${ostatni.slice(0, 26)}"${
        osierocony ? "  <-- OSIEROCONY NAGŁÓWEK" : ""
      }`
    );
  }
  console.log(`${id} — stron: ${pdf.numPages}`);
  console.log(wiersze.join("\n"));
}

async function main() {
  for (const id of (process.argv.slice(2) as TemplateId[])) await zmierz(id);
}
main();
