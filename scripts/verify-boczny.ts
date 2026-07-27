/**
 * Weryfikacja wizualna szablonu „Boczny panel" — renderuje PRAWDZIWY PDF
 * (tym samym komponentem co eksport w aplikacji) i zapisuje strony jako PNG.
 *
 * Uruchom: npx tsx scripts/verify-boczny.ts
 */
import path from "node:path";
import fs from "node:fs";
import zlib from "node:zlib";
import React from "react";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { pdf } from "pdf-to-img";
import { sampleCv } from "../src/lib/sample-cv";
import type { TailoredCv } from "../src/lib/cv-schema";

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

/* ---- Minimalny generator PNG (zastępcze „zdjęcie" kandydata) ---- */
function crc32(buf: Buffer): number {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(typ: string, dane: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dane.length);
  const ciało = Buffer.concat([Buffer.from(typ, "ascii"), dane]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(ciało));
  return Buffer.concat([len, ciało, crc]);
}
function zrobPng(bok: number): string {
  const surowe: number[] = [];
  for (let y = 0; y < bok; y++) {
    surowe.push(0); // filtr „none" na początku każdej linii
    for (let x = 0; x < bok; x++) {
      // Prosty gradient + jaśniejszy owal, żeby było widać kadrowanie.
      const dx = (x - bok / 2) / (bok / 2);
      const dy = (y - bok / 2) / (bok / 2);
      const owal = dx * dx + dy * dy < 0.55;
      surowe.push(owal ? 232 : 90 + Math.round(60 * (y / bok)));
      surowe.push(owal ? 226 : 120 + Math.round(50 * (y / bok)));
      surowe.push(owal ? 216 : 150 + Math.round(40 * (x / bok)));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(bok, 0);
  ihdr.writeUInt32BE(bok, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.from(surowe))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function main() {
  const { CvPdfBoczny } = await import("../src/components/cv-pdf-boczny");

  const cv: TailoredCv = structuredClone(sampleCv);
  cv.personal_info.photo = zrobPng(240);
  cv.personal_info.linkedin_or_github = "https://linkedin.com/in/anna-kowalska";

  // rzutowanie: renderToBuffer oczekuje elementu <Document>, a taki właśnie
  // zwraca CvPdfBoczny — TypeScript sam tego nie wywnioskuje.
  const buf = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(CvPdfBoczny, { cv }) as any
  );
  const out = path.resolve("scripts/_podglad");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "boczny.pdf"), buf);

  const dokument = await pdf(buf, { scale: 2 });
  let i = 0;
  for await (const strona of dokument) {
    i++;
    fs.writeFileSync(path.join(out, `boczny-${i}.png`), strona);
  }
  console.log(`OK — PDF ${buf.length} B, stron: ${i}`);
  console.log(`Podgląd: ${out}`);
}
main().catch((e) => {
  console.error("BŁĄD:", e);
  process.exit(1);
});
