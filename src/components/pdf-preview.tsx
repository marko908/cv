"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist/types/src/display/api";
import { Loader2 } from "lucide-react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * PODGLĄD CV = PRAWDZIWY PLIK PDF.
 *
 * Wcześniej podgląd był RÓWNOLEGŁĄ IMPLEMENTACJĄ każdego szablonu w HTML/CSS
 * (`builder/cv-document.tsx`) z własnym stronicowaniem (`paginated-cv-sheet.tsx`),
 * a eksport szedł przez `@react-pdf/renderer`. To dwa NIEZALEŻNE silniki układu:
 * przeglądarka i Yoga. Różnią się algorytmem łamania wiersza, zaokrąglaniem
 * metryk fontu i modelem marginesów, więc ta sama treść potrafiła dać inną
 * liczbę stron i inne miejsca podziału. Każda poprawka zmniejszała różnicę,
 * ale żadna nie mogła jej wyzerować — bo zgodność dwóch silników trzeba by
 * utrzymywać w nieskończoność, przy każdej zmianie każdego szablonu.
 *
 * Dlatego drugiego silnika już nie ma. Generujemy plik PDF W PRZEGLĄDARCE
 * (dokładnie ten sam kod i te same komponenty, co „Pobierz PDF") i rysujemy go
 * przez pdf.js. Podgląd nie ODWZOROWUJE pliku — podgląd JEST plikiem. Zgodność
 * 1:1 przestaje być celem do osiągnięcia, a staje się właściwością konstrukcji:
 * nie da się jej zepsuć zmianą w szablonie, bo nie ma czego rozjeżdżać.
 *
 * Koszt: podgląd aktualizuje się z opóźnieniem (`OPOZNIENIE_MS`), a tekst na
 * kartce nie jest zaznaczalny (to rastrowany PDF, nie DOM).
 */

/**
 * Ile czekamy po ostatniej zmianie CV, zanim wygenerujemy plik.
 *
 * Generowanie PDF to pełne przeliczenie układu — przy pisaniu w formularzu
 * odpalałoby się na każdy znak. 350 ms to typowa przerwa między słowami:
 * podgląd nadąża za myślą, a nie za klawiszem.
 */
const OPOZNIENIE_MS = 350;

/**
 * Górna granica gęstości rastra. Na ekranach 2x+ (i przy skalowaniu Windows
 * 150–200%) `devicePixelRatio` potrafi wynieść 3, co czterokrotnie zwiększa
 * powierzchnię do narysowania bez widocznego zysku na ostrości tekstu.
 */
const MAX_DPR = 2;

/* ---------------------------------------------------------------------- */
/* Generowanie pliku — kolejka i pamięć podręczna                          */
/* ---------------------------------------------------------------------- */

/**
 * Jedno generowanie naraz.
 *
 * Galeria szablonów pokazuje 9 miniatur jednocześnie; bez kolejki 9 renderów
 * Yogi startuje równolegle na jednym wątku i blokuje interfejs na sekundy.
 * Szeregowo każda miniatura pojawia się osobno, a strona pozostaje responsywna.
 */
let kolejka: Promise<unknown> = Promise.resolve();

function wKolejce<T>(zadanie: () => Promise<T>): Promise<T> {
  const wynik = kolejka.then(zadanie, zadanie);
  kolejka = wynik.catch(() => undefined);
  return wynik;
}

/** Bajty gotowych plików — klucz to treść CV + szablon. */
const PAMIEC = new Map<string, Uint8Array>();
const MAX_PAMIEC = 16;

function zapamietaj(klucz: string, bajty: Uint8Array) {
  PAMIEC.set(klucz, bajty);
  while (PAMIEC.size > MAX_PAMIEC) {
    const najstarszy = PAMIEC.keys().next().value;
    if (najstarszy === undefined) break;
    PAMIEC.delete(najstarszy);
  }
}

async function generujPdf(
  cv: TailoredCv,
  template: TemplateId,
  klucz: string
): Promise<Uint8Array> {
  const gotowe = PAMIEC.get(klucz);
  if (gotowe) return gotowe;

  const bajty = await wKolejce(async () => {
    // Dynamiczny import: `@react-pdf/renderer` waży kilkaset kB i nie ma po co
    // ładować się w pakiecie wejściowym ani wykonywać na serwerze.
    // `renderujCvPdf` to TA SAMA funkcja, której używa „Pobierz PDF" — podgląd
    // pokazuje dokładnie ten plik, który dostanie użytkownik.
    const { renderujCvPdf } = await import("@/components/cv-pdf");
    const blob = await renderujCvPdf(cv, template);
    return new Uint8Array(await blob.arrayBuffer());
  });

  zapamietaj(klucz, bajty);
  return bajty;
}

/* ---------------------------------------------------------------------- */
/* pdf.js                                                                   */
/* ---------------------------------------------------------------------- */

type Pdfjs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<Pdfjs> | null = null;

function pdfjs(): Promise<Pdfjs> {
  pdfjsPromise ??= import("pdfjs-dist").then((mod) => {
    // Ścieżka do workera z `public/` — kopiowanego z `node_modules` przez
    // `scripts/kopiuj-worker-pdfjs.mjs` (uruchamiany w `predev`/`prebuild`).
    // pdf.js wymaga ZGODNOŚCI wersji API i workera, więc plik nie leży w repo.
    mod.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
    return mod;
  });
  return pdfjsPromise;
}

/**
 * Wczytuje bajty do dokumentu pdf.js.
 *
 * `slice()` jest KONIECZNE: pdf.js przekazuje bufor do workera przez transfer,
 * co ODŁĄCZA go po stronie głównego wątku. Bez kopii ten sam wpis w `PAMIEC`
 * dałby się użyć tylko raz, a przy drugim odczycie pdf.js dostałby pusty bufor.
 */
async function otworzDokument(bajty: Uint8Array): Promise<PDFDocumentProxy> {
  const mod = await pdfjs();
  return mod.getDocument({ data: bajty.slice() }).promise;
}

/* ---------------------------------------------------------------------- */
/* Hook: CV + szablon → dokument PDF                                        */
/* ---------------------------------------------------------------------- */

type StanPdf = {
  doc: PDFDocumentProxy | null;
  /** Pierwsze wygenerowanie jeszcze trwa — nie ma czego pokazać. */
  ladowanie: boolean;
  /** Trwa odświeżanie, ale poprzednia wersja jest widoczna. */
  odswiezanie: boolean;
  blad: boolean;
};

function useDokumentPdf(cv: TailoredCv, template: TemplateId): StanPdf {
  /*
   * Klucz z TREŚCI, nie z tożsamości obiektu.
   *
   * Wywołujący często tworzą nowy obiekt CV przy każdym renderze (np.
   * `TemplateThumb` podmienia zdjęcie poglądowe w ciele funkcji). Zależność od
   * tożsamości dawałaby pętlę: render → efekt → `setState` → render → nowy
   * obiekt → efekt. Klucz treściowy przerywa ją u źródła.
   */
  const klucz = useMemo(
    () => `${template}|${JSON.stringify(cv)}`,
    [cv, template]
  );

  /*
   * W stanie trzymamy WYŁĄCZNIE wyniki pracy, każdy podpisany kluczem, z którego
   * powstał. Postęp („ładuję", „odświeżam") liczymy przy renderze z porównania
   * podpisu z kluczem bieżącym.
   *
   * To nie jest upiększanie: gdyby fazy siedziały w stanie, efekt musiałby na
   * starcie zrobić synchroniczny `setState` (bieżący wynik jest już nieaktualny),
   * a to kaskada renderów przy każdym naciśnięciu klawisza w formularzu.
   */
  const [wynik, setWynik] = useState<{
    klucz: string;
    doc: PDFDocumentProxy;
  } | null>(null);
  const [bladKlucz, setBladKlucz] = useState<string | null>(null);

  // Dokument trzymamy też w ref, żeby sprzątanie nie zależało od tego, czy
  // React zdążył przetworzyć `setState`.
  const aktualny = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let aktualne = true;

    const timer = setTimeout(async () => {
      try {
        const bajty = await generujPdf(cv, template, klucz);
        const doc = await otworzDokument(bajty);
        if (!aktualne) {
          // Efekt zdążył się unieważnić w trakcie — dokument nikomu nie posłuży.
          void doc.destroy();
          return;
        }
        const poprzedni = aktualny.current;
        aktualny.current = doc;
        setWynik({ klucz, doc });
        // Poprzedni dokument zwalniamy DOPIERO po podmianie — inaczej strony
        // rysowane z niego rzucałyby wyjątkiem w trakcie przejścia.
        void poprzedni?.destroy();
      } catch (err) {
        if (!aktualne) return;
        console.error("Nie udało się wygenerować podglądu PDF:", err);
        setBladKlucz(klucz);
      }
    }, OPOZNIENIE_MS);

    return () => {
      aktualne = false;
      clearTimeout(timer);
    };
    // `cv`/`template` celowo poza zależnościami — reprezentuje je `klucz`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klucz]);

  // Zwolnienie ostatniego dokumentu przy odmontowaniu komponentu.
  useEffect(() => {
    return () => {
      void aktualny.current?.destroy();
      aktualny.current = null;
    };
  }, []);

  return {
    doc: wynik?.doc ?? null,
    ladowanie: wynik === null && bladKlucz !== klucz,
    // Wynik jest, ale pochodzi z poprzedniej wersji CV — zostaje na ekranie,
    // bo lepiej pokazać treść starszą o pół sekundy niż pustą kartkę.
    odswiezanie: wynik !== null && wynik.klucz !== klucz,
    blad: bladKlucz === klucz,
  };
}

/* ---------------------------------------------------------------------- */
/* Jedna strona na kanwie                                                   */
/* ---------------------------------------------------------------------- */

function StronaPdf({
  doc,
  numer,
  width,
  /** Widoczna wysokość (px). Mniejsza niż strona = miniatura ucięta od dołu. */
  wysokoscWidoczna,
  className,
}: {
  doc: PDFDocumentProxy;
  numer: number;
  width: number;
  wysokoscWidoczna?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Proporcje A4 do czasu pierwszego pomiaru — kartka nie „podskakuje".
  const [wysokosc, setWysokosc] = useState(Math.round(width * 1.4142));
  /*
   * Czy na tej kanwie cokolwiek już narysowano.
   *
   * Kanwa montuje się pusta, a rysowanie trwa. Bez tej flagi po każdym
   * przemontowaniu (przełączenie zakładki „Edycja”/„Podgląd”, otwarcie
   * modala) użytkownik dostawał przez ułamek sekundy CZYSTĄ BIAŁĄ KARTKĘ —
   * nieodróżnialną od pustego CV.
   */
  const [narysowane, setNarysowane] = useState(false);

  useEffect(() => {
    let aktualne = true;
    let zadanie: RenderTask | null = null;

    (async () => {
      const page = await doc.getPage(numer);
      if (!aktualne) return;

      const bazowy = page.getViewport({ scale: 1 });
      const skala = width / bazowy.width;
      const wys = Math.round(bazowy.height * skala);
      setWysokosc(wys);

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const viewport = page.getViewport({ scale: skala * dpr });

      /*
       * Rysujemy najpierw POZA EKRANEM, a na widoczną kanwę przenosimy gotowy
       * obraz jednym `drawImage`.
       *
       * pdf.js czyści kanwę na starcie renderowania, więc rysowanie wprost na
       * widocznym elemencie dawałoby przy każdej zmianie CV mignięcie białą
       * plamą. Z buforem poprzednia strona zostaje na ekranie do momentu,
       * w którym następna jest w całości gotowa.
       */
      const bufor = document.createElement("canvas");
      bufor.width = Math.round(viewport.width);
      bufor.height = Math.round(viewport.height);
      const ctxBufora = bufor.getContext("2d");
      if (!ctxBufora) return;

      zadanie = page.render({ canvas: bufor, canvasContext: ctxBufora, viewport });
      try {
        await zadanie.promise;
      } catch {
        return; // anulowane (np. zmiana szerokości) — nowy render już leci
      }
      if (!aktualne) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = bufor.width;
      canvas.height = bufor.height;
      canvas.getContext("2d")?.drawImage(bufor, 0, 0);
      setNarysowane(true);
    })();

    return () => {
      aktualne = false;
      zadanie?.cancel();
    };
  }, [doc, numer, width]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white shadow-dialog",
        className
      )}
      style={{ width, height: wysokoscWidoczna ?? wysokosc }}
    >
      <canvas
        ref={canvasRef}
        style={{ width, height: wysokosc, display: "block" }}
      />
      {!narysowane && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-neutral-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Publiczne komponenty                                                     */
/* ---------------------------------------------------------------------- */

function Zastepnik({
  width,
  wysokosc,
  tekst,
  className,
}: {
  width: number;
  wysokosc: number;
  tekst?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg bg-white text-neutral-400 shadow-dialog",
        className
      )}
      style={{ width, height: wysokosc }}
    >
      <Loader2 className="size-6 animate-spin" />
      {tekst && <p className="text-sm">{tekst}</p>}
    </div>
  );
}

/**
 * Wszystkie strony CV jako osobne kartki A4 — wyrenderowane z pliku PDF.
 *
 * Zamiennik dawnego `PaginatedCvSheet`: te same właściwości, ta sama oprawa
 * wizualna (biała kartka, cień, odstęp między stronami), ale treść pochodzi
 * z pliku, a nie z równoległej implementacji w HTML.
 */
export function PdfPreview({
  cv,
  template,
  width,
  className,
}: {
  cv: TailoredCv;
  template: TemplateId;
  /** Docelowa szerokość kartki na ekranie (px). */
  width: number;
  className?: string;
}) {
  const { doc, ladowanie, odswiezanie, blad } = useDokumentPdf(cv, template);
  const poprawnaSzerokosc = Number.isFinite(width) && width > 0;
  if (!poprawnaSzerokosc) return null;

  const wysokoscKartki = Math.round(width * 1.4142);

  if (blad) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg bg-white p-6 text-center text-sm text-neutral-500 shadow-dialog",
          className
        )}
        style={{ width, height: wysokoscKartki }}
      >
        Nie udało się przygotować podglądu. Spróbuj odświeżyć stronę.
      </div>
    );
  }

  if (!doc || ladowanie) {
    return (
      <Zastepnik
        width={width}
        wysokosc={wysokoscKartki}
        tekst="Przygotowuję podgląd…"
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-col gap-4">
        {Array.from({ length: doc.numPages }, (_, i) => (
          <StronaPdf key={i} doc={doc} numer={i + 1} width={width} />
        ))}
      </div>

      {/* Sygnał odświeżania — bez zasłaniania treści, która wciąż jest aktualna
          w 99% i nadal czytelna podczas pisania. */}
      {odswiezanie && (
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
          <Loader2 className="size-3 animate-spin" />
          Aktualizuję
        </div>
      )}
    </div>
  );
}

/**
 * Miniatura CV — pierwsza strona pliku PDF, opcjonalnie ucięta od dołu.
 *
 * Ucinamy WYŁĄCZNIE w pionie: pełna szerokość szablonu jest widoczna zawsze,
 * bo czytelność CV bierze się z szerokości (obcięty bok wygląda jak zepsuty
 * układ, obcięty dół czyta się jak dalszy ciąg strony).
 */
export function PdfThumb({
  cv,
  template,
  width,
  /** Widoczna wysokość jako wielokrotność szerokości. Domyślnie cała kartka. */
  crop,
  className,
}: {
  cv: TailoredCv;
  template: TemplateId;
  width: number;
  crop?: number;
  className?: string;
}) {
  const { doc, blad } = useDokumentPdf(cv, template);
  const poprawnaSzerokosc = Number.isFinite(width) && width > 0;
  if (!poprawnaSzerokosc) return null;

  const wysokosc = Math.round(width * (crop ?? 1.4142));

  if (!doc || blad) {
    return (
      <Zastepnik width={width} wysokosc={wysokosc} className={className} />
    );
  }

  return (
    <StronaPdf
      doc={doc}
      numer={1}
      width={width}
      wysokoscWidoczna={wysokosc}
      className={cn("pointer-events-none select-none", className)}
    />
  );
}
