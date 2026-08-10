/**
 * Generuje statyczne miniatury PNG kilku szablonów CV do użytku na landingu
 * (marquee w tle hero) — PRAWDZIWY PDF (ten sam komponent co eksport), a nie
 * osobna implementacja podglądu. Wynik trafia do `public/marketing/szablony/`
 * i jest commitowany — to gotowe assety produktowe, nie zrzut roboczy.
 *
 * Uruchom: npx tsx scripts/generuj-miniatury-marketing.ts
 */
import path from "node:path";
import fs from "node:fs";
import React from "react";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { pdf as pdfDoObrazu } from "pdf-to-img";
import { demoCv } from "../src/lib/demo-cv";
import { templateUsesPhoto } from "../src/lib/cv-templates";
import type { TailoredCv } from "../src/lib/cv-schema";
import type { TemplateId } from "../src/lib/store";

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

/** Wybór różnorodny wizualnie: ze zdjęciem/bez, jasne/ciemne panele. */
const SZABLONY: TemplateId[] = [
  "nowoczesny",
  "klasyczny",
  "prestizowy",
  "boczny",
  "grafitowy",
  "pastelowy",
];

async function main() {
  const { CvPdf } = await import("../src/components/cv-pdf");
  const zdjecie = fs.readFileSync(path.resolve("public/stock/kandydat.jpg"));
  const zdjecieDataUri = `data:image/jpeg;base64,${zdjecie.toString("base64")}`;

  const out = path.resolve("public/marketing/szablony");
  fs.mkdirSync(out, { recursive: true });

  for (const id of SZABLONY) {
    const cv: TailoredCv = structuredClone(demoCv);
    if (templateUsesPhoto(id)) cv.personal_info.photo = zdjecieDataUri;

    const buf = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(CvPdf, { cv, template: id }) as any
    );

    // Skala niska celowo: to miniatura tła, nie podgląd do czytania —
    // mniejszy plik ważniejszy niż ostrość liter, których i tak nikt nie czyta.
    const dokument = await pdfDoObrazu(buf, { scale: 0.55 });
    for await (const strona of dokument) {
      fs.writeFileSync(path.join(out, `${id}.png`), strona);
      break; // tylko pierwsza strona
    }
    console.log(`OK: ${id}`);
  }

  console.log(`\nZapisano do: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
