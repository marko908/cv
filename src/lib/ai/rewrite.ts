import { z } from "zod";
import { generateObject } from "ai";
import type { TailoredCv } from "@/lib/cv-schema";
import { digitsIn, type FactLedger } from "./fact-ledger";
import type { ParsedOferta, Zuzycie } from "./job-offer";
import type { WynikDopasowania } from "./matching";
import { MODEL_MOCNY, model } from "./models";

/**
 * KROK 5 PIPELINE'U: przepisanie CV pod ofertę.
 *
 * Model dostaje wyłącznie rejestr faktów i wynik dopasowania. Nie tworzy
 * treści — wybiera, porządkuje i przeformułowuje to, co użytkownik już podał.
 *
 * Model NIE MOŻE zmieniać: nazw firm, stanowisk, okresów, uczelni, języków.
 * To są dane twarde — przepisujemy je z oryginału w kodzie, żeby model nie
 * miał nawet możliwości ich naruszyć. Model dotyka tylko podsumowania,
 * punktów opisujących osiągnięcia i kolejności umiejętności.
 */

const zZrodlami = z.object({
  tekst: z.string(),
  zrodla: z
    .array(z.string())
    .describe("Identyfikatory faktów (np. F012), z których pochodzi ta treść"),
});

/** Przepisany punkt — zawsze wskazuje, który punkt oryginału zastępuje. */
const punktSchema = z.object({
  punkt_zrodlowy: z
    .number()
    .int()
    .describe(
      "Numer punktu z oryginału, który przepisujesz (liczony od 0). Każdy punkt oryginału musi mieć swój odpowiednik — nie wolno żadnego pominąć ani połączyć dwóch w jeden."
    ),
  tekst: z.string(),
  zrodla: z.array(z.string()),
});

const przepisanieSchema = z.object({
  podsumowanie: zZrodlami.describe(
    "Podsumowanie zawodowe, 3-4 zdania, pod kątem tej konkretnej oferty"
  ),
  doswiadczenie: z.array(
    z.object({
      indeks: z
        .number()
        .int()
        .describe("Numer pozycji doświadczenia z oryginału, liczony od 0"),
      punkty: z.array(punktSchema),
    })
  ),
  projekty: z.array(
    z.object({
      indeks: z.number().int(),
      punkty: z.array(punktSchema),
    })
  ),
  umiejetnosci_techniczne: z
    .array(z.string())
    .describe(
      "Te same umiejętności co w oryginale, przestawione tak, by najistotniejsze dla oferty były pierwsze. Nie dodawaj nowych."
    ),
  umiejetnosci_miekkie: z.array(z.string()),
});

export type Przepisanie = z.infer<typeof przepisanieSchema>;

const INSTRUKCJA = `Jesteś doświadczonym doradcą zawodowym na polskim rynku pracy.

Przepisujesz CV kandydata pod konkretną ofertę.

ZASADA NACZELNA — NIE TWORZYSZ TREŚCI.
Masz rejestr faktów, które kandydat sam o sobie podał. Wolno Ci:
  - wybrać, które fakty wyeksponować,
  - zmienić ich kolejność,
  - przeformułować je językiem oferty.
Nie wolno Ci dodać niczego, czego nie ma w rejestrze.

CZEGO BEZWZGLĘDNIE NIE ROBISZ:
1. Nie wymyślasz liczb ani metryk. Jeśli w rejestrze jest „40%”, możesz użyć
   „40%”. Nie wolno Ci napisać „około 50%” ani „znacząco”.
2. Nie dopisujesz technologii, których w rejestrze nie ma — nawet jeśli oferta
   ich wymaga. Lista luk mówi Ci wprost, czego kandydat NIE ma. Tych rzeczy
   nie umieszczasz w CV w żadnej formie.
3. Nie podnosisz poziomu stanowiska ani stażu.
4. Nie używasz frazesów: „dynamiczny”, „zmotywowany”, „komunikatywny”,
   „otwarty na nowe wyzwania”. One nic nie wnoszą.

CO ROBISZ DOBRZE:
- Używasz słownictwa z oferty tam, gdzie opisuje TEN SAM fakt. Jeśli kandydat
  napisał „robiłem strony”, a oferta mówi „rozwój aplikacji webowych”, możesz
  użyć sformułowania z oferty — to ten sam fakt innym językiem.
- Zaczynasz punkty od czasownika i zachowujesz konkret.
- Piszesz zwięźle i naturalną polszczyzną. Bez amerykańskiego entuzjazmu.
- Do każdego fragmentu podajesz identyfikatory faktów w polu „zrodla”.
  To jest obowiązkowe — treść bez pokrycia w faktach zostanie odrzucona.

LICZBY SĄ NAJCENNIEJSZE.
Jeśli oryginał zawiera metrykę („o 40%”, „12 tys. użytkowników”, „3 zespoły”,
„z 62 do 90 punktów”), MUSI ona zostać w przepisanej wersji. Konkretna liczba
jest najmocniejszym elementem CV — usunięcie jej to pogorszenie dokumentu.
Nigdy nie zastępuj liczby słowem w rodzaju „znacząco” czy „istotnie”.

PODSUMOWANIE ZAWODOWE.
To ma być 3-4 zdania, które czyta się jak wypowiedź człowieka, a nie lista
technologii. Zachowaj formę gramatyczną z oryginału — jeśli kandydat pisze
o sobie w pierwszej osobie („Specjalizuję się”), pisz tak samo. Nie przechodź
na trzecią osobę. Wpleć najmocniejszy konkret z jego doświadczenia zamiast
wyliczać kompetencje.

KAŻDY PUNKT OSOBNO.
Dla każdego punktu z oryginału zwracasz dokładnie jeden przepisany punkt
z polem „punkt_zrodlowy” wskazującym jego numer. Nie łączysz dwóch punktów
w jeden i żadnego nie pomijasz.`;

/** Buduje opis rejestru faktów dla modelu. */
function opiszRejestr(ledger: FactLedger): string {
  return ledger.facts
    .map((f) => `${f.id} [${f.type}] ${f.value}`)
    .join("\n");
}

/** Buduje opis tego, co dopasowanie ustaliło — to jest plan zmian. */
function opiszPlan(oferta: ParsedOferta, dop: WynikDopasowania): string {
  const pokryte = dop.dopasowania
    .filter((d) => d.pokrycie !== "brak")
    .map(
      (d) =>
        `- ${d.wymaganie.tekst} → masz to w faktach: ${d.fakty
          .map((f) => f.id)
          .join(", ")}`
    )
    .join("\n");

  const luki = dop.luki
    .filter((d) => d.pokrycie === "brak")
    .map((d) => `- ${d.wymaganie.tekst}`)
    .join("\n");

  return `Stanowisko: ${oferta.stanowisko}
Firma: ${oferta.firma || "(nie podano)"}
Ton ogłoszenia: ${oferta.ton}

WYMAGANIA, KTÓRE KANDYDAT SPEŁNIA — wyeksponuj je:
${pokryte || "(brak)"}

CZEGO KANDYDAT NIE MA — o tym nie piszesz ani słowa:
${luki || "(brak)"}`;
}

/** Wywołuje model, żeby przepisał zmienne części CV. */
export async function przepiszCv(
  ledger: FactLedger,
  oferta: ParsedOferta,
  dopasowanie: WynikDopasowania
): Promise<{ przepisanie: Przepisanie; zuzycie: Zuzycie }> {
  const { object, usage } = await generateObject({
    model: model(MODEL_MOCNY),
    schema: przepisanieSchema,
    instructions: INSTRUKCJA,
    prompt: `REJESTR FAKTÓW KANDYDATA:
${opiszRejestr(ledger)}

PLAN — CO USTALILIŚMY O TEJ OFERCIE:
${opiszPlan(oferta, dopasowanie)}

Przepisz podsumowanie i punkty doświadczenia pod tę ofertę.`,
  });
  return {
    przepisanie: object,
    zuzycie: {
      wejscie: usage.inputTokens ?? 0,
      wyjscie: usage.outputTokens ?? 0,
    },
  };
}

/**
 * Czy przepisana wersja zgubiła którąś z liczb obecnych w oryginale.
 * „Skróciłam czas ładowania o 40%” → „Skróciłam czas ładowania” to
 * pogorszenie CV, nawet jeśli nic nie zostało zmyślone.
 */
export function zgubionoLiczbe(oryginal: string, nowy: string): boolean {
  const wNowym = new Set(digitsIn(nowy));
  return digitsIn(oryginal).some((d) => !wNowym.has(d));
}

/**
 * Wybiera podsumowanie: nowe, o ile nie zgubiło metryki i nie jest wyraźnie
 * uboższe od oryginału. Przepisanie ma poprawiać dokument, nie skracać go
 * do listy kompetencji.
 */
function wybierzPodsumowanie(oryginal: string, nowe: string): string {
  if (!nowe) return oryginal;
  if (zgubionoLiczbe(oryginal, nowe)) return oryginal;
  return nowe;
}

/**
 * Skleja przepisane fragmenty z oryginałem.
 *
 * Dane twarde (firmy, stanowiska, okresy, edukacja, języki, dane kontaktowe)
 * kopiujemy z oryginału — model nie ma jak ich naruszyć, bo w ogóle ich nie
 * zwracał. To pierwsza linia obrony przed halucynacją, przed walidatorem.
 */
export function zlozCv(
  oryginal: TailoredCv,
  przepisanie: Przepisanie
): TailoredCv {
  /**
   * Nakłada przepisane punkty na oryginalne, dopasowując po indeksie źródłowym.
   *
   * Zaczynamy od kopii oryginału i podmieniamy tylko te punkty, które model
   * faktycznie przepisał. Dzięki temu pominięcie punktu przez model oznacza
   * „zostaw jak było”, a nie „usuń” — fakt nie ma prawa zniknąć z CV.
   */
  const punktyDla = (
    lista: {
      indeks: number;
      punkty: { punkt_zrodlowy: number; tekst: string }[];
    }[],
    i: number,
    oryginalne: string[]
  ): string[] => {
    const wpis = lista.find((x) => x.indeks === i);
    if (!wpis) return oryginalne;
    const wynik = [...oryginalne];
    for (const p of wpis.punkty) {
      const j = p.punkt_zrodlowy;
      if (!Number.isInteger(j) || j < 0 || j >= wynik.length) continue;
      const nowy = p.tekst.trim();
      if (!nowy) continue;
      // Metryka z oryginału nie może zniknąć — konkretna liczba jest
      // najmocniejszym elementem CV. Prompt o tym mówi, ale to jest gwarancja.
      if (zgubionoLiczbe(oryginalne[j], nowy)) continue;
      wynik[j] = nowy;
    }
    return wynik;
  };

  // Do umiejętności wpuszczamy wyłącznie te, które były w oryginale.
  const dozwolone = (
    nowe: string[],
    stare: string[]
  ): string[] => {
    const zbior = new Set(stare.map((s) => s.toLowerCase().trim()));
    const wynik = nowe.filter((s) => zbior.has(s.toLowerCase().trim()));
    // Nic nie może zniknąć — dopinamy pominięte na koniec.
    for (const s of stare) {
      if (!wynik.some((w) => w.toLowerCase().trim() === s.toLowerCase().trim())) {
        wynik.push(s);
      }
    }
    return wynik;
  };

  return {
    ...oryginal,
    personal_info: oryginal.personal_info,
    professional_summary: wybierzPodsumowanie(
      oryginal.professional_summary,
      przepisanie.podsumowanie.tekst.trim()
    ),
    experience: oryginal.experience.map((exp, i) => ({
      ...exp,
      bullets: punktyDla(przepisanie.doswiadczenie, i, exp.bullets),
    })),
    projects: oryginal.projects.map((proj, i) => ({
      ...proj,
      bullets: punktyDla(przepisanie.projekty, i, proj.bullets),
    })),
    skills: {
      technical: dozwolone(
        przepisanie.umiejetnosci_techniczne,
        oryginal.skills.technical
      ),
      soft_and_tools: dozwolone(
        przepisanie.umiejetnosci_miekkie,
        oryginal.skills.soft_and_tools
      ),
    },
    education: oryginal.education,
    languages: oryginal.languages,
    rodo_clause: oryginal.rodo_clause,
  };
}
