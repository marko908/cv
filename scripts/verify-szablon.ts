/**
 * Weryfikacja szablonu CV — renderuje PRAWDZIWY PDF (tym samym komponentem co
 * eksport w aplikacji), zapisuje strony jako PNG i wypisuje KOLEJNOŚĆ tekstu
 * odczytaną z pliku (to właśnie czyta parser ATS).
 *
 * Uruchom: npx tsx scripts/verify-szablon.ts grafitowy
 *
 * Dwa błędy, które wychodzą tylko tutaj (oba realnie się zdarzyły):
 *  - nazwisko nachodzące na tytuł przy dużym foncie bez jawnego `lineHeight`,
 *  - `letterSpacing` na polu danych — ekstrakcja czyta „M A R K O".
 */
import path from "node:path";
import fs from "node:fs";
import zlib from "node:zlib";
import React from "react";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { pdf as pdfDoObrazu } from "pdf-to-img";
import { extractText, getDocumentProxy } from "unpdf";
import { demoCv } from "../src/lib/demo-cv";
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
  const cialo = Buffer.concat([Buffer.from(typ, "ascii"), dane]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cialo));
  return Buffer.concat([len, cialo, crc]);
}
function zrobPng(szer: number, wys: number): string {
  const surowe: number[] = [];
  for (let y = 0; y < wys; y++) {
    surowe.push(0); // filtr „none" na początku każdej linii
    for (let x = 0; x < szer; x++) {
      // Gradient + jaśniejszy owal — widać kadrowanie i proporcje.
      const dx = (x - szer / 2) / (szer / 2);
      const dy = (y - wys / 2) / (wys / 2);
      const owal = dx * dx + dy * dy < 0.55;
      surowe.push(owal ? 232 : 90 + Math.round(60 * (y / wys)));
      surowe.push(owal ? 226 : 120 + Math.round(50 * (y / wys)));
      surowe.push(owal ? 216 : 150 + Math.round(40 * (x / szer)));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(szer, 0);
  ihdr.writeUInt32BE(wys, 4);
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
  const id = (process.argv[2] || "grafitowy") as TemplateId;
  const { CvPdf } = await import("../src/components/cv-pdf");

  const cv: TailoredCv = structuredClone(demoCv);
  cv.personal_info.photo = zrobPng(320, 400);
  cv.personal_info.linkedin_or_github = "https://linkedin.com/in/anna-kowalska";

  // rzutowanie: renderToBuffer oczekuje elementu <Document>, a taki właśnie
  // zwraca CvPdf — TypeScript sam tego nie wywnioskuje.
  const buf = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(CvPdf, { cv, template: id }) as any
  );

  const out = path.resolve("scripts/_podglad");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `${id}.pdf`), buf);

  const dokument = await pdfDoObrazu(buf, { scale: 2 });
  let stron = 0;
  for await (const strona of dokument) {
    stron++;
    fs.writeFileSync(path.join(out, `${id}-${stron}.png`), strona);
  }

  // Kolejność tekstu w pliku — dokładnie to, co przeczyta parser ATS.
  const proxy = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(proxy, { mergePages: true });
  const tekst = (Array.isArray(text) ? text.join("\n") : text).trim();

  console.log(`OK — PDF ${buf.length} B, stron: ${stron}`);
  console.log(`Podgląd: ${out}`);
  console.log("\n--- pierwsze 400 znaków strumienia tekstu ---");
  console.log(tekst.slice(0, 400));

  // Kontrola: nazwisko musi trafić do pliku PRZED panelem bocznym.
  const nazwisko = tekst.indexOf(cv.personal_info.full_name.toUpperCase());
  const nazwiskoZwykle = tekst.indexOf(cv.personal_info.full_name);
  const iNazwisko = Math.max(nazwisko, nazwiskoZwykle);
  const iKontakt = tekst.indexOf(cv.personal_info.email);
  console.log("\n--- kontrola kolejności ---");
  console.log(`nazwisko: ${iNazwisko}, e-mail (panel): ${iKontakt}`);
  console.log(
    iNazwisko >= 0 && iNazwisko < iKontakt
      ? "OK — kolumna główna przed panelem bocznym"
      : "BŁĄD — panel boczny czytany przed nazwiskiem"
  );

  // Kontrola: brak rozstrzelonych liter (letterSpacing na polu danych).
  const rozstrzelone = /(?:\p{L} ){4,}\p{L}/u.exec(tekst);
  console.log(
    rozstrzelone
      ? `BŁĄD — rozstrzelone litery w tekście: „${rozstrzelone[0]}"`
      : "OK — brak rozstrzelonych liter"
  );

  // Wariant ubogi: bez zdjęcia, projektów, języków, linku i klauzuli RODO.
  // Każda sekcja jest warunkowa, więc układ nie ma prawa się rozjechać.
  const ubogie: TailoredCv = structuredClone(demoCv);
  ubogie.personal_info.photo = undefined;
  ubogie.personal_info.linkedin_or_github = "";
  ubogie.projects = [];
  ubogie.languages = [];
  ubogie.skills.soft_and_tools = [];
  ubogie.professional_summary = "";
  ubogie.rodo_clause = "";
  const bufU = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(CvPdf, { cv: ubogie, template: id }) as any
  );
  fs.writeFileSync(path.join(out, `${id}-ubogie.pdf`), bufU);
  const dokU = await pdfDoObrazu(bufU, { scale: 2 });
  let stronU = 0;
  for await (const strona of dokU) {
    stronU++;
    fs.writeFileSync(path.join(out, `${id}-ubogie-${stronU}.png`), strona);
  }
  console.log(`\nOK — wariant ubogi: ${bufU.length} B, stron: ${stronU}`);
}

main().catch((e) => {
  console.error("BŁĄD:", e);
  process.exit(1);
});
