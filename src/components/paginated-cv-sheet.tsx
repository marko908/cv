"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { CvDocument } from "@/components/builder/cv-document";

const SHEET_WIDTH = 794; // szerokość A4 przy 96 dpi
const SHEET_HEIGHT = 1123; // wysokość A4 przy 96 dpi

/**
 * Ile pikseli treści musi zostać PO nagłówku sekcji, żeby nagłówek mógł na tej
 * stronie zostać. Odpowiednik `minPresenceAhead` z `cv-pdf*.tsx`: bez tego
 * nagłówek („Projekty") zostaje sam na dole strony, a sekcja zaczyna się dopiero
 * na następnej. ~48 px to nazwa pozycji + pierwszy wiersz opisu.
 */
const MIN_PO_NAGLOWKU = 48;

/**
 * Blok wyższy niż tyle i tak nie zmieści się w całości na stronie, więc wolno go
 * dzielić (inaczej zostawiałby pustą stronę i dalej był rozcięty).
 */
const MAX_NIEPODZIELNEGO = SHEET_HEIGHT * 0.9;

/**
 * Typy bloków, których nie wolno rozcinać między stronami.
 *
 * `naglowek` jest tu nie tylko dla porządku: sam nagłówek sekcji potrafi trafić
 * dokładnie na granicę i wtedy zostaje z niego na stronie 1 pasek grubości
 * jednego piksela (realny przypadek: „Umiejętności" w szablonie „nowoczesny"
 * zaczynało się na 1122 px przy cięciu na 1123 px). Reguła 2 niżej łapie tylko
 * nagłówki, które mieszczą się nad cięciem w całości.
 */
const NIEPODZIELNE = new Set(["pozycja", "tresc", "naglowek"]);

type Blok = { typ: string; gora: number; dol: number };

/**
 * Odległość górnej krawędzi elementu od korzenia dokumentu, liczona po
 * `offsetTop`, a NIE po `getBoundingClientRect`.
 *
 * To nie jest kwestia gustu. Rect jest liczony po transformacjach przodków,
 * a kopie stron siedzą w `transform: scale(...)`, dodatkowo w modalu porównania
 * (`cv-compare-dialog`) w trakcie otwierania działa animacja `zoom-in-95`.
 * Pomiar rectami wychodził więc raz dobry, raz przeskalowany o przypadkowy
 * ułamek — realny objaw: w modalu porównania strona łamała się na 1108 px
 * zamiast na 1069 px (górze bloku „LGePR"), przez co blok był rozcięty mimo
 * poprawnej logiki. `offsetTop` jest wartością LAYOUTOWĄ: transformacje go nie
 * dotyczą, więc wynik jest ten sam niezależnie od skali i animacji.
 *
 * Warunek: korzeń musi być `position: relative`, żeby łańcuch `offsetParent`
 * na nim się kończył (ustawiane niżej w obu kopiach).
 */
function gornaKrawedz(el: HTMLElement, root: HTMLElement): number {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

function zmierzBloki(root: HTMLElement): Blok[] {
  return [...root.querySelectorAll<HTMLElement>("[data-blok]")]
    .map((el) => {
      const gora = gornaKrawedz(el, root);
      return {
        typ: el.dataset.blok ?? "",
        gora,
        dol: gora + el.offsetHeight,
      };
    })
    .filter((b) => b.dol > b.gora)
    .sort((a, b) => a.gora - b.gora);
}

/**
 * Liczy, w których miejscach (w pikselach treści) zaczynają się kolejne strony.
 *
 * Naiwne cięcie co `SHEET_HEIGHT` pokazywało w podglądzie coś, czego
 * w wyeksportowanym PDF-ie NIE MA: rozcięty w pół wiersz tekstu i osierocone
 * nagłówki. Realny przypadek z testów na telefonie — wiersz „Stworzyłem pakiet
 * narzędzi w JavaScript i Power Automate Desktop" (15 px wysokości) był widoczny
 * na 7,3 px, a reszta lądowała na stronie 2, podczas gdy w prawdziwym pliku ten
 * projekt mieścił się w całości.
 *
 * Odtwarzamy więc obie ochrony, które `@react-pdf/renderer` ma w eksporcie:
 *  - `wrap={false}` na pozycji → `data-blok="pozycja"` (wpis doświadczenia,
 *    projektu, edukacji, klauzula RODO): blok nigdy nie zostaje rozcięty, tylko
 *    schodzi w całości na następną stronę,
 *  - `minPresenceAhead` na nagłówku → `data-blok="naglowek"`: nagłówek sekcji
 *    schodzi razem z nią, jeśli po nim nie zostało dość miejsca.
 *
 * `data-blok="tresc"` to akapity (podsumowanie, umiejętności, panel boczny) —
 * traktujemy je tak samo, dopóki mieszczą się na stronie; dopiero akapit dłuższy
 * niż `MAX_NIEPODZIELNEGO` wolno podzielić, bo inaczej nie dałoby się go złożyć.
 */
function policzStartyStron(bloki: Blok[], wysokoscTresci: number): number[] {
  const starty = [0];
  let start = 0;
  // Bezpiecznik pętli: 40 stron A4 to i tak absurd jak na CV.
  for (let i = 0; i < 40 && start + SHEET_HEIGHT < wysokoscTresci; i++) {
    const granica = start + SHEET_HEIGHT;
    let przerwa = granica;

    // 1) Blok przecięty granicą → schodzi w całości na następną stronę.
    const przeciety = bloki.find(
      (b) =>
        NIEPODZIELNE.has(b.typ) &&
        b.gora > start + 1 &&
        b.gora < granica &&
        b.dol > granica &&
        b.dol - b.gora <= MAX_NIEPODZIELNEGO
    );
    if (przeciety) przerwa = przeciety.gora;

    // 2) Nagłówek osierocony na dole strony → schodzi razem z sekcją.
    const naglowek = [...bloki]
      .reverse()
      .find((b) => b.typ === "naglowek" && b.gora > start + 1 && b.dol <= przerwa);
    if (naglowek && przerwa - naglowek.dol < MIN_PO_NAGLOWKU) {
      przerwa = naglowek.gora;
    }

    // Nie ma jak przenieść (blok wyższy niż strona, dziwny układ) — tniemy na
    // granicy. Inaczej pętla stanęłaby w miejscu.
    if (przerwa <= start + 1) przerwa = granica;

    starty.push(przerwa);
    start = przerwa;
  }
  return starty;
}

/**
 * Jedna kartka A4 — okno na wspólną treść, przesunięte o `start`.
 *
 * Treść, która należy już do następnej strony, ODSUWAMY w dół (margines na
 * bloku otwierającym kolejną stronę), zamiast przycinać okno wcześniej. To nie
 * jest sztuczka kosmetyczna, tylko jedyny sposób, żeby jednocześnie:
 *  - nie pokazać na dole strony początku bloku, który w całości idzie dalej
 *    (bez tego ten sam nagłówek widniał na obu kartkach),
 *  - zachować TŁO do samego dołu kartki — kolorowy panel boczny (`boczny`,
 *    `grafitowy`, `pastelowy`) musi sięgać krawędzi strony, dokładnie jak
 *    w PDF, gdzie jest rysowany jako `fixed`. Przycięcie okna zostawiałoby
 *    w tym miejscu biały pas, czyli błąd, który właśnie naprawiamy.
 *
 * Przesunięcie jest czysto wizualne i dotyczy TYLKO tej kopii — pomiar
 * (`policzStartyStron`) idzie z osobnej kopii pomiarowej, której nie ruszamy.
 */
function StronaCv({
  cv,
  template,
  start,
  koniec,
  width,
  scale,
  wysokoscDokumentu,
}: {
  cv: TailoredCv;
  template: TemplateId;
  start: number;
  koniec: number;
  width: number;
  scale: number;
  wysokoscDokumentu: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Zawsze najpierw cofnij poprzednie przesunięcie — inaczej marginesy
    // kumulowałyby się przy każdej zmianie CV.
    const poprzedni = root.querySelector<HTMLElement>("[data-przesuniety]");
    if (poprzedni) {
      poprzedni.style.marginTop = "";
      poprzedni.removeAttribute("data-przesuniety");
    }

    const luka = start + SHEET_HEIGHT - koniec;
    if (luka < 0.5) return; // strona kończy się równo z krawędzią

    // Ten sam pomiar layoutowy co w kopii pomiarowej — patrz `gornaKrawedz`.
    const cel = [...root.querySelectorAll<HTMLElement>("[data-blok]")].find(
      (el) => Math.abs(gornaKrawedz(el, root) - koniec) < 1
    );
    if (!cel) return;

    const wlasny = parseFloat(getComputedStyle(cel).marginTop) || 0;
    cel.style.marginTop = `${wlasny + luka}px`;
    cel.setAttribute("data-przesuniety", "");
  }, [cv, template, start, koniec, scale]);

  return (
    <div
      className="overflow-hidden rounded-lg bg-white shadow-dialog"
      style={{ width, height: Math.round(SHEET_HEIGHT * scale) }}
    >
      <div
        style={{
          width: SHEET_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* `translateY`, NIE `marginTop`: transform nie podlega zwijaniu
            marginesów i nie rusza layoutu przodków. */}
        {/* `position: relative` — kotwica dla `offsetParent`, patrz `gornaKrawedz`. */}
        <div
          ref={ref}
          className="relative flex flex-col"
          style={{
            minHeight: wysokoscDokumentu,
            transform: `translateY(${-start}px)`,
          }}
        >
          <CvDocument cv={cv} template={template} />
        </div>
      </div>
    </div>
  );
}

/**
 * Wielostronicowy podgląd CV jako PRAWDZIWE, ODDZIELNE strony A4 — każda we
 * własnym, wizualnie odgrodzonym prostokącie (cień, odstęp), tak jak
 * w przeglądarkowym podglądzie PDF.
 *
 * Technika „przesuwane okno": treść renderujemy RAZ, poza ekranem, żeby zmierzyć
 * układ i policzyć miejsca łamania. Do wyświetlenia każda strona dostaje własną
 * kopię dokumentu (to samo `cv`+`template`, więc identyczny wygląd) przesuniętą
 * o początek tej strony i przyciętą `overflow: hidden` do jednej kartki.
 *
 * Minimalna wysokość dokumentu w kopiach wyświetlanych obejmuje WSZYSTKIE strony
 * — dzięki temu kolorowy panel boczny sięga dołu ostatniej kartki, zamiast
 * urywać się w jej połowie i zostawiać biały pas (zgłoszony „ucięty pasek").
 * Kopia pomiarowa celowo takiej wysokości NIE dostaje: rosłaby razem z liczbą
 * stron i karmiła sam pomiar (2 strony → wysokość 2 stron → wyszłaby 3.).
 * Rozciągnięcie nie rusza pozycji treści, bo żaden szablon nie rozdziela wolnego
 * miejsca w pionie (`mt-auto` przy klauzuli RODO zostało usunięte — w PDF
 * klauzula też stoi tuż pod treścią).
 */
export function PaginatedCvSheet({
  cv,
  template,
  width,
  className,
}: {
  cv: TailoredCv;
  template: TemplateId;
  /** Docelowa szerokość NA EKRANIE (px) — skala liczona względem SHEET_WIDTH. */
  width: number;
  className?: string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [starty, setStarty] = useState<number[]>([0]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      const nowe = policzStartyStron(
        zmierzBloki(el),
        el.scrollHeight || SHEET_HEIGHT
      );
      setStarty((stare) =>
        stare.length === nowe.length && stare.every((v, i) => v === nowe[i])
          ? stare
          : nowe
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cv, template]);

  const poprawnaSzerokosc = Number.isFinite(width) && width > 0;
  const scale = poprawnaSzerokosc ? width / SHEET_WIDTH : 0;
  const wysokoscDokumentu = starty.length * SHEET_HEIGHT;

  return (
    <div className={className}>
      {/* Kopia WYŁĄCZNIE do pomiaru — poza ekranem, nie wpływa na layout. */}
      <div
        aria-hidden
        style={{ position: "absolute", left: -99999, top: 0, width: SHEET_WIDTH }}
      >
        <div
          ref={measureRef}
          className="relative flex flex-col"
          style={{ minHeight: SHEET_HEIGHT }}
        >
          <CvDocument cv={cv} template={template} />
        </div>
      </div>

      {poprawnaSzerokosc && (
        <div className="flex flex-col gap-4">
          {starty.map((start, i) => (
            <StronaCv
              key={i}
              cv={cv}
              template={template}
              start={start}
              koniec={starty[i + 1] ?? start + SHEET_HEIGHT}
              width={width}
              scale={scale}
              wysokoscDokumentu={wysokoscDokumentu}
            />
          ))}
        </div>
      )}
    </div>
  );
}
