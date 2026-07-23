import { normalize, type Fact, type FactLedger } from "./fact-ledger";
import type { ParsedOferta, Wymaganie } from "./job-offer";

/**
 * KROK 3 PIPELINE'U: dopasowanie fakt ↔ wymaganie.
 *
 * To jest KOD, nie model. Dzięki temu wynik 0-100 jest:
 *  - powtarzalny (dwa uruchomienia na tych samych danych dają to samo),
 *  - wytłumaczalny (widać, które wymaganie pokrywa który fakt),
 *  - odporny na halucynacje (model nie ma jak wymyślić, że kandydat coś umie).
 *
 * Wynik liczbowy, który pokazujemy użytkownikowi, musi być czymś, czego da się
 * bronić. Liczba wymyślona przez model tego kryterium nie spełnia.
 */

export type Pokrycie = "pelne" | "czesciowe" | "brak";

export type DopasowanieWymagania = {
  wymaganie: Wymaganie;
  pokrycie: Pokrycie;
  /** Które słowa kluczowe z oferty znaleziono w CV. */
  trafioneSlowa: string[];
  /** Których nie znaleziono — to materiał na wywiad i raport luk. */
  brakujaceSlowa: string[];
  /** Fakty z CV, które pokrywają to wymaganie (do cytowania w uzasadnieniach). */
  fakty: Fact[];
};

export type WynikDopasowania = {
  /** 0-100, ważony priorytetem wymagań. */
  wynik: number;
  dopasowania: DopasowanieWymagania[];
  /** Wymagania niepokryte lub pokryte częściowo, od najważniejszych. */
  luki: DopasowanieWymagania[];
  /** Procent słów kluczowych z oferty obecnych w CV (istotne dla ATS). */
  pokrycieSlowKluczowych: number;
  werdykt: Werdykt;
};

export type Werdykt = {
  poziom: "dobre" | "przecietne" | "slabe";
  naglowek: string;
  uzasadnienie: string;
};

/** Wagi priorytetów — wymagania obowiązkowe ważą trzy razy więcej. */
const WAGA: Record<Wymaganie["priorytet"], number> = {
  wymagane: 3,
  mile_widziane: 1,
};

/** Ile punktów daje dany stopień pokrycia. */
const PUNKTY: Record<Pokrycie, number> = {
  pelne: 1,
  czesciowe: 0.5,
  brak: 0,
};

/** Słowa zbyt pospolite, by cokolwiek znaczyły przy dopasowaniu. */
const STOP = new Set([
  "i", "w", "z", "na", "do", "oraz", "lub", "dla", "od", "po", "przy", "o",
  "the", "and", "or", "of", "in", "to", "a", "an",
]);

/**
 * Najdłuższa końcówka fleksyjna, jaką dopuszczamy przy dopasowaniu rdzenia.
 * Polskie końcówki („-ach”, „-ami”, „-ych”, „-owych”) mieszczą się w pięciu
 * znakach. Bez tego limitu „Java” trafiałaby w „JavaScript”, co zawyżałoby
 * wynik dopasowania.
 */
const MAX_KONCOWKA = 5;

/** Czy fraza występuje dosłownie, ale na granicy słowa (nie w środku wyrazu). */
function zawieraDoslownie(tekst: string, fraza: string): boolean {
  const granica = (znak: string) => znak === "" || !/[a-z0-9]/.test(znak);
  let od = 0;
  for (;;) {
    const i = tekst.indexOf(fraza, od);
    if (i === -1) return false;
    const przed = i === 0 ? "" : tekst[i - 1];
    const po = i + fraza.length >= tekst.length ? "" : tekst[i + fraza.length];
    if (granica(przed) && granica(po)) return true;
    od = i + 1;
  }
}

/**
 * Czy fraza z oferty występuje w tekście z CV.
 *
 * Uwzględnia polską odmianę: porównujemy rdzenie, więc „testy jednostkowe”
 * z oferty trafia w „testów jednostkowych” z CV. Bez tego dopasowanie
 * gubiłoby większość trafień i zaniżało wynik.
 *
 * Jednocześnie pilnuje granic słowa, żeby „Java” nie trafiała w „JavaScript”
 * ani „SQL” w „NoSQL” — fałszywy pozytyw zawyżyłby wynik, a wynik ma być
 * czymś, czego da się bronić przed użytkownikiem.
 */
export function frazaWystepuje(fraza: string, tekst: string): boolean {
  const f = normalize(fraza);
  const t = normalize(tekst);
  if (!f) return false;

  if (zawieraDoslownie(t, f)) return true;

  const slowaTekstu = t.split(/[^a-z0-9+#.]+/).filter(Boolean);
  const tokeny = f
    .split(/[^a-z0-9+#.]+/)
    .filter((x) => x.length >= 3 && !STOP.has(x));
  if (tokeny.length === 0) return false;

  // Każdy człon frazy musi mieć w tekście słowo o wspólnym rdzeniu,
  // różniące się co najwyżej końcówką fleksyjną.
  return tokeny.every((token) => {
    const rdzen = token.slice(0, Math.max(4, token.length - 3));
    return slowaTekstu.some(
      (slowo) =>
        slowo.startsWith(rdzen) && slowo.length <= rdzen.length + MAX_KONCOWKA
    );
  });
}

/** Fakty, w których występuje dana fraza. */
function faktyZFraza(ledger: FactLedger, fraza: string): Fact[] {
  return ledger.facts.filter((f) => frazaWystepuje(fraza, f.value));
}

/** Dopasowuje pojedyncze wymaganie do rejestru faktów. */
export function dopasujWymaganie(
  wymaganie: Wymaganie,
  ledger: FactLedger
): DopasowanieWymagania {
  const slowa =
    wymaganie.slowa_kluczowe.filter(Boolean).length > 0
      ? wymaganie.slowa_kluczowe.filter(Boolean)
      : [wymaganie.tekst];

  const trafioneSlowa: string[] = [];
  const brakujaceSlowa: string[] = [];
  const fakty = new Map<string, Fact>();

  for (const slowo of slowa) {
    const znalezione = faktyZFraza(ledger, slowo);
    if (znalezione.length > 0) {
      trafioneSlowa.push(slowo);
      for (const f of znalezione) fakty.set(f.id, f);
    } else {
      brakujaceSlowa.push(slowo);
    }
  }

  const pokrycie: Pokrycie =
    trafioneSlowa.length === 0
      ? "brak"
      : brakujaceSlowa.length === 0
        ? "pelne"
        : "czesciowe";

  return {
    wymaganie,
    pokrycie,
    trafioneSlowa,
    brakujaceSlowa,
    fakty: [...fakty.values()],
  };
}

/** Buduje uczciwy werdykt — także wtedy, gdy brzmi niewygodnie. */
function zbudujWerdykt(
  wynik: number,
  luki: DopasowanieWymagania[]
): Werdykt {
  const krytyczne = luki.filter(
    (l) => l.wymaganie.priorytet === "wymagane" && l.pokrycie === "brak"
  );

  if (wynik >= 75) {
    return {
      poziom: "dobre",
      naglowek: "Dobre dopasowanie",
      uzasadnienie:
        "Twoje CV pokrywa większość wymagań z tej oferty. Warto aplikować.",
    };
  }
  if (wynik >= 50) {
    return {
      poziom: "przecietne",
      naglowek: "Przeciętne dopasowanie",
      uzasadnienie: krytyczne.length
        ? `Spełniasz część wymagań, ale brakuje ${krytyczne.length === 1 ? "jednego kluczowego" : `${krytyczne.length} kluczowych`}. Aplikowanie ma sens, jeśli potrafisz to nadrobić w liście motywacyjnym.`
        : "Spełniasz część wymagań. Aplikowanie ma sens, ale konkurencja może być lepiej dopasowana.",
    };
  }
  return {
    poziom: "slabe",
    naglowek: "Słabe dopasowanie",
    uzasadnienie: krytyczne.length
      ? `Ta oferta wymaga rzeczy, których nie ma w Twoim CV (${krytyczne
          .slice(0, 3)
          .map((l) => l.wymaganie.tekst)
          .join(", ")}). Samo przepisanie CV tego nie nadrobi — rozważ ofertę bliższą Twojemu doświadczeniu.`
      : "Twoje CV pokrywa niewiele wymagań z tej oferty. Rozważ ofertę bliższą Twojemu doświadczeniu.",
  };
}

/** Pełne dopasowanie CV do oferty. Deterministyczne — bez udziału modelu. */
export function dopasuj(
  oferta: ParsedOferta,
  ledger: FactLedger
): WynikDopasowania {
  const dopasowania = oferta.wymagania.map((w) => dopasujWymaganie(w, ledger));

  let sumaWag = 0;
  let zdobyte = 0;
  for (const d of dopasowania) {
    const waga = WAGA[d.wymaganie.priorytet];
    sumaWag += waga;
    zdobyte += waga * PUNKTY[d.pokrycie];
  }
  const wynik = sumaWag === 0 ? 0 : Math.round((zdobyte / sumaWag) * 100);

  const wszystkieSlowa = dopasowania.flatMap((d) => [
    ...d.trafioneSlowa,
    ...d.brakujaceSlowa,
  ]);
  const trafione = dopasowania.flatMap((d) => d.trafioneSlowa);
  const pokrycieSlowKluczowych =
    wszystkieSlowa.length === 0
      ? 0
      : Math.round((trafione.length / wszystkieSlowa.length) * 100);

  const luki = dopasowania
    .filter((d) => d.pokrycie !== "pelne")
    .sort((a, b) => {
      const wagaRoznica =
        WAGA[b.wymaganie.priorytet] - WAGA[a.wymaganie.priorytet];
      if (wagaRoznica !== 0) return wagaRoznica;
      return PUNKTY[a.pokrycie] - PUNKTY[b.pokrycie];
    });

  return {
    wynik,
    dopasowania,
    luki,
    pokrycieSlowKluczowych,
    werdykt: zbudujWerdykt(wynik, luki),
  };
}
