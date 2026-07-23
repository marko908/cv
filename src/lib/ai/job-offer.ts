import { z } from "zod";
import { generateObject } from "ai";
import { MODEL_TANI } from "./models";

/**
 * KROK 2 PIPELINE'U: ogłoszenie → ustrukturyzowane wymagania z wagami.
 *
 * Tu AI tylko czyta i porządkuje treść ogłoszenia. Nie ocenia kandydata,
 * nie zna jeszcze jego CV i nie ma prawa korzystać z własnej „wiedzy”
 * o firmie — to główny wektor halucynacji (dane treningowe bywają
 * nieaktualne). Wszystko pochodzi wyłącznie z wklejonego tekstu.
 */

export const wymaganieSchema = z.object({
  id: z.string().describe("Krótki identyfikator, np. W1, W2"),
  tekst: z
    .string()
    .describe(
      "Wymaganie sformułowane zwięźle, ale wiernie wobec treści ogłoszenia"
    ),
  cytat: z
    .string()
    .describe(
      "Dosłowny fragment ogłoszenia, z którego pochodzi to wymaganie. Kopiuj znak w znak."
    ),
  rodzaj: z
    .enum(["twarda", "miekka", "formalna"])
    .describe(
      "twarda = technologia lub konkretna umiejętność; miekka = cecha lub sposób pracy; formalna = wykształcenie, certyfikat, język, dyspozycyjność"
    ),
  priorytet: z
    .enum(["wymagane", "mile_widziane"])
    .describe(
      "wymagane = sekcja wymagań obowiązkowych; mile_widziane = nice to have"
    ),
  slowa_kluczowe: z
    .array(z.string())
    .describe(
      "Słowa i frazy w DOKŁADNYM brzmieniu z ogłoszenia — po nich systemy ATS filtrują CV"
    ),
});

export const ofertaSchema = z.object({
  stanowisko: z.string().describe("Nazwa stanowiska z ogłoszenia"),
  firma: z
    .string()
    .describe("Nazwa firmy, jeśli występuje w tekście. Jeśli nie ma — pusty string."),
  poziom: z
    .enum(["staz", "junior", "mid", "senior", "lead", "nieokreslony"])
    .describe("Poziom stanowiska, jeśli wynika z ogłoszenia"),
  branza: z.string().describe("Branża, jeśli wynika z ogłoszenia"),
  ton: z
    .enum(["formalny", "neutralny", "swobodny"])
    .describe("Rejestr językowy ogłoszenia — wpłynie na styl CV"),
  wymagania: z.array(wymaganieSchema),
});

export type Wymaganie = z.infer<typeof wymaganieSchema>;
export type ParsedOferta = z.infer<typeof ofertaSchema>;

const INSTRUKCJA = `Jesteś analitykiem ogłoszeń o pracę na polskim rynku.

Twoje jedyne zadanie: rozłożyć treść ogłoszenia na listę wymagań.

ZASADY BEZWZGLĘDNE:
1. Pracujesz WYŁĄCZNIE na tekście, który dostajesz. Nie korzystasz z własnej
   wiedzy o firmie, branży ani rynku. Jeśli czegoś nie ma w tekście, nie ma tego
   w wyniku.
2. Pole „cytat” musi być dosłownym fragmentem ogłoszenia. Nie parafrazuj go.
3. Pole „slowa_kluczowe” zachowuje pisownię z ogłoszenia (jeśli w ofercie jest
   „React.js”, nie zapisuj „React”). Systemy ATS dopasowują dosłownie.
4. Nie dopisuj wymagań „oczywistych”, których w ogłoszeniu nie ma. Jeśli
   ogłoszenie nie wspomina o angielskim, nie twórz takiego wymagania.
5. Rozdzielaj wymagania złożone. „React, TypeScript i testy jednostkowe” to trzy
   osobne wymagania, bo kandydat może spełniać część z nich.
6. Priorytet ustalasz po strukturze ogłoszenia: sekcja wymagań obowiązkowych to
   „wymagane”, sekcja „mile widziane” / „dodatkowym atutem będzie” to
   „mile_widziane”. Gdy ogłoszenie nie rozdziela — ustaw „wymagane”.

Odpowiadasz po polsku, poprawną polszczyzną.`;

/**
 * Parsuje wklejoną treść ogłoszenia do struktury wymagań.
 * Wymaga skonfigurowanego klucza API (patrz models.ts).
 */
export async function parsujOferte(trescOferty: string): Promise<ParsedOferta> {
  const { object } = await generateObject({
    model: MODEL_TANI,
    schema: ofertaSchema,
    instructions: INSTRUKCJA,
    prompt: `Rozłóż to ogłoszenie na wymagania:\n\n${trescOferty}`,
  });
  return object;
}
