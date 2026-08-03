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
   „otwarty na nowe wyzwania”, „gracz zespołowy”, „dyspozycyjny”. One nic nie
   wnoszą — i tak weryfikuje się je na rozmowie.
5. Nie dodajesz do umiejętności ani języków pasków, procentów ani ocen typu
   „React 8/10”, „angielski 90%”. Rekruterowi nic nie mówią. Poziom języka
   wyłącznie skalą A1–C2. Przy narzędziach po prostu je wymieniasz.
6. Nie używasz mętnych określeń skali: „duże budżety”, „duże zespoły”,
   „liczne projekty”. Jeśli w rejestrze jest konkretna liczba — użyj jej.
   Jeśli nie ma — opisz rzecz bez fałszywej skali, nie wymyślaj wielkości.

CO ROBISZ DOBRZE:
- Używasz słownictwa z oferty tam, gdzie opisuje TEN SAM fakt. Jeśli kandydat
  napisał „robiłem strony”, a oferta mówi „rozwój aplikacji webowych”, możesz
  użyć sformułowania z oferty — to ten sam fakt innym językiem.
- WZÓR DOBREGO PUNKTU: czasownik dokonany + co zrobiłeś + mierzalny efekt.
  Np. „Zredukowałem czas ładowania o 40% dzięki podziałowi kodu”. Efekt bierzesz
  wyłącznie z faktów kandydata — nie dorabiasz go.
- Zaczynasz punkty od mocnego czasownika dokonanego: „wdrożyłem”,
  „zoptymalizowałem”, „zredukowałem”, „zwiększyłem”, „wynegocjowałem”,
  „zautomatyzowałem”, „skróciłem”, „usprawniłem”, „zbudowałem”. Są konkretniejsze
  i sprawcze niż „byłem odpowiedzialny za” czy „pomagałem przy”.
- Najmocniejszy, najbardziej konkretny punkt (z liczbą) umieszczasz jako
  pierwszy w danej pozycji, jeśli kolejność źródłowa na to pozwala.
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

SPÓJNOŚĆ JĘZYKOWA — obowiązkowa.
W obrębie jednej pozycji trzymaj JEDNĄ formę czasownika. Nie mieszaj dokonanych
z niedokonanymi: „Przeprowadziłem research…”, a punkt niżej „Tworzyłem treści…”
to niechlujstwo, które rekruter wyłapuje. Domyślnie używaj form DOKONANYCH
(„Opracowałem”, „Wdrożyłem”, „Przeprowadziłem”), bo pokazują zamknięty efekt.
Formę niedokonaną zostaw tylko tam, gdzie opisujesz świadomie czynność ciągłą —
i wtedy stosuj ją konsekwentnie w całej pozycji. Pilnuj też jednolitej osoby
i czasu w całym dokumencie.

PUNKTY POCHODZĄCE Z ROZMOWY Z KANDYDATEM.
Część punktów może być zapisana potocznie, tak jak kandydat odpowiedział w
rozmowie — na przykład „korzystałem z tych narzędzi na co dzień” albo
„pracowałem w agencji prawie 4 lata”. To są PRAWDZIWE fakty, więc ich nie
usuwasz — ale przepisujesz je na język CV: mocny czasownik na początku, konkret,
bez potocznych wtrąceń i literówek. Zachowaj przy tym każdą liczbę i nazwę
narzędzia, które kandydat podał.

UZUPEŁNIENIA Z WYWIADU — ⟦uzupełnienie kandydata: …⟧.
Niektóre punkty mają na końcu dopisek w takim nawiasie. To odpowiedź kandydata
na pytanie o skalę tego punktu — surowa, często bez polskich znaków i z
literówkami, czasem to sama liczba („30 mediów”, „o 99%”).

Twoje zadanie: SCAL oba fakty w JEDNO zdanie i napisz je poprawną polszczyzną.

  - Treść sprzed nawiasu jest nadrzędna. Niczego z niej nie gub — ani nazw
    własnych, ani zakresu obowiązków. Uzupełnienie ma ją WZBOGACIĆ, nie zastąpić.
  - Liczbę z uzupełnienia przenieś dokładnie tak, jak ją podał kandydat.
  - Popraw literówki i uzupełnij polskie znaki („robilem” → „robiłem”,
    „prijektow” → „projektów”). To jest dokument, który idzie do pracodawcy.
  - JEŚLI UZUPEŁNIENIE NIE WNOSI NOWEGO FAKTU (np. „regularnie to robiłem”,
    „było wiele różnych projektów”, samo „tak”) — ZIGNORUJ JE i zwróć oryginalny
    punkt bez zmian. Lepszy dobry punkt bez liczby niż punkt rozmyty pustą frazą.
  - Sam nawias ⟦…⟧ NIGDY nie pojawia się w wyniku.

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
 * Czy przepisana wersja zgubiła słowo kluczowe z oferty, które było w oryginale.
 * Trafione słowo kluczowe (np. „kaniulacja", „React", „opieka nad pacjentem")
 * decyduje o pokryciu wymagań i o wyniku ATS — jego usunięcie przez przepisanie
 * OBNIŻA dopasowanie. To pogorszenie dokumentu, więc taki punkt cofamy do
 * oryginału (straż analogiczna do `zgubionoLiczbe`). Porównanie dosłowne
 * (case-insensitive), więc reagujemy tylko gdy fraza NAPRAWDĘ zniknęła.
 */
export function zgubionoSlowoKluczowe(
  oryginal: string,
  nowy: string,
  slowaKluczowe: string[]
): boolean {
  const o = oryginal.toLowerCase();
  const n = nowy.toLowerCase();
  return slowaKluczowe.some((s) => {
    const k = s.toLowerCase().trim();
    if (!k) return false;
    return o.includes(k) && !n.includes(k);
  });
}

/**
 * Wybiera podsumowanie: nowe, o ile nie zgubiło metryki i nie jest wyraźnie
 * uboższe od oryginału. Przepisanie ma poprawiać dokument, nie skracać go
 * do listy kompetencji.
 */
function wybierzPodsumowanie(
  oryginal: string,
  nowe: string,
  slowaKluczowe: string[]
): string {
  if (!nowe) return oryginal;
  if (zgubionoLiczbe(oryginal, nowe)) return oryginal;
  if (zgubionoSlowoKluczowe(oryginal, nowe, slowaKluczowe)) return oryginal;
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
  przepisanie: Przepisanie,
  slowaKluczowe: string[] = []
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
      // Trafione słowo kluczowe z oferty też nie może zniknąć — jego utrata
      // obniża pokrycie i wynik ATS. Cofamy taki punkt do oryginału.
      if (zgubionoSlowoKluczowe(oryginalne[j], nowy, slowaKluczowe)) continue;
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
      przepisanie.podsumowanie.tekst.trim(),
      slowaKluczowe
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
