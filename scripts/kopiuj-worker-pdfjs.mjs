import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/**
 * Kopiuje workera pdf.js do `public/pdfjs/`.
 *
 * Podgląd CV renderuje PRAWDZIWY plik PDF (patrz `src/components/pdf-preview.tsx`),
 * a pdf.js robi to w osobnym wątku. Ścieżkę do workera trzeba podać jawnie —
 * `new URL(..., import.meta.url)` na specyfikator pakietu nie jest stabilnie
 * obsługiwane przez bundlery, a workera z CDN nie chcemy (aplikacja ma działać
 * bez sieci i bez zewnętrznych zależności runtime'owych).
 *
 * Kopiujemy Z `node_modules`, a nie trzymamy pliku w repo, bo pdf.js WYMAGA
 * zgodności wersji API i workera — przy niezgodności rzuca
 * „The API version does not match the Worker version". Kopia przy każdym
 * `install`/`dev`/`build` gwarantuje, że to ta sama wersja co zainstalowana.
 */
const require = createRequire(import.meta.url);
const zrodlo = join(
  dirname(require.resolve("pdfjs-dist/package.json")),
  "build",
  "pdf.worker.min.mjs"
);
const katalog = join(process.cwd(), "public", "pdfjs");

mkdirSync(katalog, { recursive: true });
copyFileSync(zrodlo, join(katalog, "pdf.worker.min.mjs"));

console.log(`worker pdf.js → public/pdfjs/pdf.worker.min.mjs`);
