/**
 * POBRANIE TREŚCI OGŁOSZENIA Z LINKU.
 *
 * Użytkownik może podać sam link, sam tekst albo jedno i drugie. Gdy jest tylko
 * link, próbujemy wyciągnąć treść tutaj — best effort, bo część portali renderuje
 * ofertę dopiero w przeglądarce (JavaScript) albo blokuje roboty. Dlatego każdy
 * błąd kończy się jasnym komunikatem, a nie cichym niepowodzeniem: użytkownik
 * dostaje wtedy prośbę o wklejenie treści ręcznie i pipeline ma komplet danych.
 *
 * Kolejność prób:
 *  1. JSON-LD `JobPosting` (schema.org) — wiele portali je publikuje i daje
 *     gotowe pola: stanowisko, firma, opis. To najlepszy możliwy input dla AI.
 *  2. Zwykły HTML → tekst.
 *
 * Bez AI — czysty kod, więc nic nie kosztuje i niczego nie zmyśla.
 */

import { BladAdresu, pobierzBezpiecznie } from "@/lib/bezpieczenstwo/adresy";
import {
  czyPoprawnyLink as czyPoprawny,
  czySerwisOfert,
  KOMUNIKAT_NIEZNANY_SERWIS,
} from "./serwisy-ofert";

const LIMIT_ZNAKOW = 20000; // ogłoszenia bywają długie; więcej nie wnosi nic dla modelu
const TIMEOUT_MS = 12000;
/** Twardy limit pobieranej strony — ogłoszenie to kilkaset kB HTML-a, nie więcej. */
const MAX_BAJTOW_ODPOWIEDZI = 5 * 1024 * 1024;

export class BladPobraniaOferty extends Error {}

/*
 * `czyPoprawnyLink` i lista serwisów mieszkają w `serwisy-ofert.ts` — module
 * BEZ zależności od Node. Ten plik importuje `node:dns` (przez kontrolę SSRF),
 * więc gdyby komponent kliencki sięgał po walidację tutaj, wciągałby moduły
 * serwerowe do bundla przeglądarki.
 */
export { czyPoprawnyLink } from "./serwisy-ofert";

function odkodujEncje(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** HTML → czytelny tekst (bez skryptów, stylów i nawigacji). */
function htmlNaTekst(html: string): string {
  const bezSmieci = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer|header|svg)[\s\S]*?<\/\1>/gi, " ");

  return odkodujEncje(
    bezSmieci
      // Elementy blokowe zamieniamy na złamania linii, żeby nie skleić listy
      // wymagań w jedno zdanie.
      .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

type JobPostingLd = {
  "@type"?: string | string[];
  title?: string;
  description?: string;
  hiringOrganization?: { name?: string } | string;
  jobLocation?: unknown;
  employmentType?: string | string[];
};

function jestJobPosting(x: JobPostingLd): boolean {
  const t = x?.["@type"];
  return Array.isArray(t) ? t.includes("JobPosting") : t === "JobPosting";
}

/** Szuka ogłoszenia w blokach JSON-LD (schema.org). */
function zJsonLd(html: string): string | null {
  const bloki = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];

  for (const blok of bloki) {
    let dane: unknown;
    try {
      dane = JSON.parse(blok[1].trim());
    } catch {
      continue;
    }
    // Bywa obiekt, tablica albo @graph — spłaszczamy wszystkie warianty.
    const kandydaci: JobPostingLd[] = Array.isArray(dane)
      ? (dane as JobPostingLd[])
      : [
          dane as JobPostingLd,
          ...(((dane as { "@graph"?: JobPostingLd[] })?.["@graph"] ??
            []) as JobPostingLd[]),
        ];

    const oferta = kandydaci.find((k) => k && jestJobPosting(k));
    if (!oferta) continue;

    const firma =
      typeof oferta.hiringOrganization === "string"
        ? oferta.hiringOrganization
        : oferta.hiringOrganization?.name;
    const opis = oferta.description ? htmlNaTekst(oferta.description) : "";
    if (opis.replace(/\s+/g, "").length < 80) continue;

    // Składamy w formę, którą parser oferty czyta najlepiej.
    return [
      oferta.title ? `Stanowisko: ${oferta.title}` : "",
      firma ? `Firma: ${firma}` : "",
      oferta.employmentType
        ? `Typ zatrudnienia: ${[oferta.employmentType].flat().join(", ")}`
        : "",
      "",
      opis,
    ]
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return null;
}

/**
 * Pobiera treść ogłoszenia spod adresu. Rzuca `BladPobraniaOferty`
 * z komunikatem dla użytkownika, gdy się nie uda.
 */
export async function pobierzTrescOferty(url: string): Promise<string> {
  if (!czyPoprawny(url)) {
    throw new BladPobraniaOferty("To nie wygląda na poprawny adres strony.");
  }

  /*
   * Filtr JAKOŚCI wejścia, nie zabezpieczenie (patrz `serwisy-ofert.ts`):
   * odsiewa przypadkowo wklejone adresy, które nie prowadzą do ogłoszenia.
   * Odrzucenie kieruje do wklejenia treści ręcznie, więc nikogo nie blokuje.
   */
  if (!czySerwisOfert(url)) {
    throw new BladPobraniaOferty(KOMUNIKAT_NIEZNANY_SERWIS);
  }
  const pelny = /^https?:\/\//i.test(url.trim())
    ? url.trim()
    : `https://${url.trim()}`;

  let html: string;
  try {
    /*
     * OCHRONA PRZED SSRF (audyt 2026-08-10). Wcześniej szło tu zwykłe `fetch`
     * z `redirect: "follow"` na adres wprost od użytkownika, a treść
     * odpowiedzi wracała do niego jako „treść oferty". To znaczyło, że każdy
     * zalogowany mógł kazać serwerowi odpytać `http://127.0.0.1:…`, adres
     * w sieci prywatnej albo punkt metadanych chmury i przeczytać wynik —
     * dawna walidacja przepuszczała je, bo sprawdzała tylko, czy host zawiera
     * kropkę.
     *
     * `pobierzBezpiecznie` sprawdza schemat, rozwiązuje host i weryfikuje
     * adres IP, powtarza tę kontrolę przy KAŻDYM przekierowaniu i ucina
     * odpowiedź na limicie rozmiaru.
     */
    html = await pobierzBezpiecznie(pelny, {
      timeoutMs: TIMEOUT_MS,
      maxBajtow: MAX_BAJTOW_ODPOWIEDZI,
      naglowki: {
        // Bez nagłówka przeglądarki część portali odsyła pustą stronę.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (e) {
    if (e instanceof BladPobraniaOferty) throw e;
    // Komunikat z kontroli adresu jest zrozumiały dla użytkownika i nie
    // zdradza, co siedzi po drugiej stronie — przepuszczamy go dalej.
    if (e instanceof BladAdresu) throw new BladPobraniaOferty(e.message);
    throw new BladPobraniaOferty(
      "Nie udało się połączyć ze stroną ogłoszenia."
    );
  }

  const zeStruktury = zJsonLd(html);
  const tekst = (zeStruktury ?? htmlNaTekst(html)).slice(0, LIMIT_ZNAKOW);

  // Portale renderowane w przeglądarce zwracają szkielet bez treści — wtedy
  // uczciwie mówimy, że się nie udało, zamiast karmić model śmieciem.
  if (tekst.replace(/\s+/g, "").length < 300) {
    throw new BladPobraniaOferty(
      "Pod tym adresem nie znaleźliśmy treści ogłoszenia."
    );
  }
  return tekst;
}
