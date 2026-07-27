import { generateObject } from "ai";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import {
  DEFAULT_RODO_CLAUSE,
  tailoredCvSchema,
  type TailoredCv,
} from "@/lib/cv-schema";
import type { Zuzycie } from "./job-offer";
import { MODEL_SREDNI, model } from "./models";

/**
 * IMPORT ZEWNĘTRZNEGO CV: plik (PDF/DOCX/TXT) → surowy tekst → struktura.
 *
 * Dwa etapy:
 *   1. ekstrakcja tekstu z pliku — czysty kod (unpdf / mammoth),
 *   2. zmapowanie tekstu na schemat CV — AI (tani/średni model).
 *
 * Zasada naczelna aplikacji obowiązuje też tutaj: przy IMPORCIE AI ma tylko
 * PRZEPISAĆ to, co jest w pliku, do naszej struktury — nie wolno mu niczego
 * dopisywać ani zawyżać. To wyłącznie porządkowanie danych użytkownika.
 */

export type WynikImportu = {
  cv: TailoredCv;
  /** Ile tekstu udało się wyciągnąć — do diagnostyki jakości parsera. */
  dlugoscTekstu: number;
  zuzycie: Zuzycie;
};

const OBSLUGIWANE = [".pdf", ".docx", ".txt"] as const;

export function czyObslugiwanyPlik(nazwa: string): boolean {
  const n = nazwa.toLowerCase();
  return OBSLUGIWANE.some((ext) => n.endsWith(ext));
}

/**
 * Zbiera adresy URL ukryte pod hiperłączami.
 *
 * W CV napis „LinkedIn" bardzo często jest KLIKALNYM linkiem — sam tekst nie
 * niesie adresu. Ekstrakcja tekstu gubi taki odnośnik, więc do struktury
 * trafiał martwy napis zamiast działającego linku. Zbieramy adresy osobno i
 * dokładamy je do materiału dla modelu.
 */
async function zbierzLinki(
  bytes: Uint8Array,
  nazwa: string
): Promise<string[]> {
  const n = nazwa.toLowerCase();
  const linki = new Set<string>();

  try {
    if (n.endsWith(".pdf")) {
      const pdf = await getDocumentProxy(bytes);
      for (let i = 1; i <= pdf.numPages; i++) {
        const strona = await pdf.getPage(i);
        const adnotacje = await strona.getAnnotations();
        for (const a of adnotacje as { url?: string; unsafeUrl?: string }[]) {
          const url = a.url ?? a.unsafeUrl;
          if (url) linki.add(url.trim());
        }
      }
    } else if (n.endsWith(".docx")) {
      const { value } = await mammoth.convertToHtml({
        buffer: Buffer.from(bytes),
      });
      for (const m of value.matchAll(/href="([^"]+)"/g)) {
        if (m[1]) linki.add(m[1].trim());
      }
    }
  } catch {
    // Brak adnotacji lub uszkodzony plik — link to dodatek, nie blokujemy importu.
  }

  // Adresy mailto/tel mamy już z tekstu; interesują nas odnośniki webowe.
  return [...linki].filter((u) => /^https?:\/\//i.test(u));
}

/** Wyciąga surowy tekst z pliku CV. Bez AI — deterministyczna ekstrakcja. */
export async function wyodrebnijTekst(
  bytes: Uint8Array,
  nazwa: string
): Promise<string> {
  const n = nazwa.toLowerCase();

  if (n.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return (Array.isArray(text) ? text.join("\n") : text).trim();
  }

  if (n.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({
      buffer: Buffer.from(bytes),
    });
    return value.trim();
  }

  if (n.endsWith(".txt")) {
    return new TextDecoder("utf-8").decode(bytes).trim();
  }

  throw new Error("Nieobsługiwany format pliku. Wgraj PDF, DOCX lub TXT.");
}

/**
 * Tekst CV wzbogacony o wykryte hiperłącza — to trafia do modelu.
 * Linki podajemy osobną listą, żeby model mógł podstawić prawdziwy adres tam,
 * gdzie w tekście stoi sam napis („LinkedIn", „Portfolio", „GitHub").
 */
export async function wyodrebnijTekstZLinkami(
  bytes: Uint8Array,
  nazwa: string
): Promise<{ tekst: string; linki: string[] }> {
  const tekst = await wyodrebnijTekst(bytes, nazwa);
  const linki = await zbierzLinki(bytes, nazwa);
  return { tekst, linki };
}

const INSTRUKCJA = `Jesteś precyzyjnym parserem CV. Dostajesz surowy tekst
wyciągnięty z pliku CV kandydata i masz przepisać go do ustrukturyzowanej formy.

ZASADA NACZELNA — PRZEPISUJESZ, NIE TWORZYSZ.
Wypełniasz pola WYŁĄCZNIE informacjami, które są w tekście. Niczego nie
dopisujesz, nie zawyżasz, nie „poprawiasz". Jeśli czegoś nie ma w tekście —
zostaw puste (pusty string lub pusta lista). Nie zgaduj adresu e-mail, telefonu
ani nazw firm.

MAPOWANIE:
- personal_info: imię i nazwisko, tytuł zawodowy (jeśli podany pod nazwiskiem),
  e-mail, telefon, miasto (samo miasto), link do LinkedIn/GitHub jeśli jest.
  W polu linkedin_or_github wpisz PEŁNY ADRES (https://…), nigdy samego napisu
  „LinkedIn". Jeśli w tekście stoi tylko etykieta, weź adres z listy WYKRYTE
  HIPERŁĄCZA poniżej — tam są adresy, które w oryginalnym pliku były podpięte
  pod klikalny tekst. Dopasuj po domenie (linkedin.com → LinkedIn,
  github.com → GitHub). Jeśli pasującego adresu nie ma, zostaw pole puste.
- professional_summary: jeśli w CV jest sekcja „o mnie"/„podsumowanie", przepisz
  ją. Jeśli nie ma — zostaw pusty string. NIE wymyślaj podsumowania.
- experience: każda pozycja to firma, stanowisko (role), okres (period, w formie
  z CV), miasto/tryb (location, jeśli jest) i punkty (bullets) — dokładnie tak,
  jak w CV, w kolejności od najnowszej.
- education: uczelnia (institution), kierunek i stopień (degree), okres.
- skills.technical: technologie i umiejętności twarde. skills.soft_and_tools:
  umiejętności miękkie i narzędzia. Rozdziel je sensownie.
- projects: jeśli są — nazwa, technologie, link, okres, punkty.
- languages: język z poziomem, np. „angielski – B2". Zachowaj poziom z CV.
- rodo_clause: jeśli w tekście jest klauzula RODO/zgoda, przepisz ją; w przeciwnym
  razie zostaw pusty string (uzupełnimy standardową w kodzie).

Zachowaj oryginalne liczby i metryki w punktach — są najcenniejsze. Pisz po
polsku (jeśli CV jest po polsku) lub w języku oryginału CV.`;

/** Mapuje surowy tekst CV na schemat — przez AI. */
export async function parsujCvZTekstu(
  tekst: string,
  linki: string[] = []
): Promise<WynikImportu> {
  const blokLinkow = linki.length
    ? `\n\nWYKRYTE HIPERŁĄCZA (adresy podpięte pod tekst w oryginalnym pliku):\n${linki
        .map((u) => `- ${u}`)
        .join("\n")}`
    : "";

  const { object, usage } = await generateObject({
    model: model(MODEL_SREDNI),
    schema: tailoredCvSchema,
    instructions: INSTRUKCJA,
    prompt: `SUROWY TEKST CV:\n\n${tekst}${blokLinkow}`,
  });

  // RODO: jeśli parser nie znalazł klauzuli, wstawiamy standardową polską.
  const cv: TailoredCv = {
    ...object,
    rodo_clause: object.rodo_clause?.trim() || DEFAULT_RODO_CLAUSE,
  };

  return {
    cv,
    dlugoscTekstu: tekst.length,
    zuzycie: {
      wejscie: usage.inputTokens ?? 0,
      wyjscie: usage.outputTokens ?? 0,
    },
  };
}
