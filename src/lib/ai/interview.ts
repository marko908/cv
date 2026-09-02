import type { TailoredCv } from "@/lib/cv-schema";
import { digitsIn } from "./fact-ledger";
import type { DopasowanieWymagania } from "./matching";

/**
 * WYWIAD — dopytywanie o brakujące konkrety.
 *
 * Gdy dopasowanie znajduje lukę (oferta czegoś wymaga, w CV tego nie ma),
 * AI nie zmyśla — PYTA użytkownika. Odpowiedź „tak, mam to” staje się nowym
 * faktem, więc CV może legalnie zawierać więcej, a wynik rośnie UCZCIWIE.
 *
 * To rozwiązuje dwie rzeczy naraz:
 *  - płaski wynik dobrze dopasowanego CV (użytkownik może go realnie podnieść),
 *  - obie ścieżki produktu: tworzenie od zera i wgrane CV z brakami.
 *
 * Pytania budujemy w KODZIE z treści luki — bez AI, więc bez halucynacji
 * i bez kosztu. Model nie wymyśla pytań o kompetencje, których oferta
 * nie wymaga.
 */

export type PytanieWywiadu = {
  id: string;
  /**
   * Rodzaj pytania — zmienia framing i miejsce docelowe:
   *  - „doswiadczenie": twarda kompetencja, pytamy o realne doświadczenie,
   *    potwierdzenie może dać punkt w doświadczeniu;
   *  - „cecha": kompetencja miękka / postawa, to NIE doświadczenie — pytamy,
   *    czy kandydat chce ją wskazać, i trafia tylko do umiejętności miękkich.
   */
  typ: "doswiadczenie" | "cecha";
  pytanie: string;
  /** Podpowiedź, co wpisać (tylko dla „doswiadczenie"). */
  hint: string;
  /**
   * Dosłowny fragment ogłoszenia, z którego wzięło się to pytanie.
   *
   * Samo wymaganie bywa zwięzłe do granicy („Docker", „code review") i wyrwane
   * z kontekstu brzmi jak zagadka — nie widać, czy oferta chce doświadczenia
   * produkcyjnego, czy tylko styczności. Cytat z ogłoszenia pokazujemy pod
   * pytaniem, żeby użytkownik odpowiadał na to, co pracodawca faktycznie
   * napisał. Puste, gdy cytat nic nie dodaje ponad treść wymagania.
   */
  kontekst?: string;
  /** Słowa kluczowe z oferty, które to pytanie pokrywa. */
  slowa: string[];
  /** Priorytet wymagania — pytamy najpierw o wymagane. */
  wazne: boolean;
  /**
   * Cel pytania o metrykę: konkretny punkt doświadczenia, który po odpowiedzi
   * ZASTĘPUJEMY wersją z liczbą (a nie dopisujemy obok). Ustawiane tylko dla
   * pytań o kwantyfikację.
   */
  cel?: { exp: number; bullet: number };
};

export type OdpowiedzWywiadu = {
  id: string;
  /** Czy użytkownik potwierdził, że ma tę kompetencję. */
  ma: boolean;
  /** Opcjonalny konkret w słowach użytkownika (np. „testy w Jest, 2 lata”). */
  szczegol?: string;
};

/**
 * Tworzy pytania z luk dopasowania.
 *
 * Pytamy tylko o luki, na które użytkownik może sensownie odpowiedzieć —
 * czyli o kompetencje twarde i miękkie. Wymagań formalnych (wykształcenie,
 * poziom języka) nie „dopytujemy”, bo tego się nie nadrabia deklaracją.
 *
 * Framing zależy od rodzaju wymagania. Kompetencji twardej dotyczy pytanie
 * o doświadczenie („czy masz doświadczenie z X”). Cechy/postawy nie pytamy
 * o doświadczenie — bo „chęć do dzielenia się wiedzą” to nie doświadczenie,
 * tylko coś, co kandydat może chcieć w CV wskazać.
 */
export function zbudujPytania(luki: DopasowanieWymagania[]): PytanieWywiadu[] {
  return luki
    .filter(
      (l) =>
        l.pokrycie === "brak" &&
        (l.wymaganie.rodzaj === "twarda" || l.wymaganie.rodzaj === "miekka")
    )
    .map((l) => {
      const t = cytat(l.wymaganie.tekst);
      const twarda = l.wymaganie.rodzaj === "twarda";
      const slowa =
        l.wymaganie.slowa_kluczowe.filter(Boolean).length > 0
          ? l.wymaganie.slowa_kluczowe.filter(Boolean)
          : [t];

      return {
        id: l.wymaganie.id,
        typ: twarda ? ("doswiadczenie" as const) : ("cecha" as const),
        pytanie: twarda
          ? `Czy masz doświadczenie z tym: „${t}”?`
          : `Czy chcesz wskazać w CV: „${t}”?`,
        hint: twarda
          ? "Jeśli tak, opisz krótko - gdzie i jak długo (np. w projekcie X). Jeśli nie, pomiń."
          : "",
        kontekst: kontekstOferty(l.wymaganie.cytat, l.wymaganie.tekst),
        slowa,
        wazne: l.wymaganie.priorytet === "wymagane",
      };
    });
}

/**
 * Cytat z ogłoszenia do pokazania pod pytaniem — albo nic.
 *
 * Pomijamy go, gdy nie wnosi kontekstu: jest pusty, jest praktycznie tym samym
 * co treść wymagania (parafraza znak w znak) albo jest od niej krótszy. Lepiej
 * nie pokazać nic niż powtórzyć to samo zdanie dwa razy pod rząd.
 */
function kontekstOferty(surowy: string, wymaganie: string): string | undefined {
  const c = (surowy ?? "").trim().replace(/\s+/g, " ");
  if (!c) return undefined;
  const zwykly = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const cz = zwykly(c);
  const wz = zwykly(wymaganie);
  if (!cz || cz === wz) return undefined;
  if (cz.length <= wz.length && wz.includes(cz)) return undefined;
  return cytat(c);
}

/** Czy wśród luk jest o co pytać. */
export function czyWartoWywiad(luki: DopasowanieWymagania[]): boolean {
  return zbudujPytania(luki).length > 0;
}

/**
 * Cytat punktu w treści pytania.
 *
 * Cytujemy CAŁY punkt, a nie jego początek. Wcześniejsze ucinanie po 60 znakach
 * gubiło kontekst dokładnie tam, gdzie jest on potrzebny: „Czy możesz dodać
 * konkretną liczbę do: «Odpowiadam za komunikację PR marki oraz współprace
 * z influ…»" — użytkownik nie wie, o którym fragmencie mowa i do czego miałby tę
 * liczbę dopisać. Punkty CV mieszczą się zwykle w 100–150 znakach, więc pełny
 * cytat jest krótki, a pytanie w interfejsie i tak zawija się do kilku wierszy
 * (nie ma tam `truncate`).
 *
 * Limit istnieje wyłącznie jako bezpiecznik dla patologicznie długiego wpisu
 * (wklejony akapit) i tnie NA GRANICY SŁOWA — nigdy w połowie wyrazu.
 */
const MAX_CYTATU = 220;

function cytat(tekst: string, max = MAX_CYTATU): string {
  const t = tekst.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const przyciety = t.slice(0, max);
  const ostatniaSpacja = przyciety.lastIndexOf(" ");
  // Gdy w limicie nie ma ani jednej spacji (jeden gigantyczny „wyraz"),
  // zostaje twarde cięcie — inaczej cytat byłby pusty.
  const baza = ostatniaSpacja > max * 0.6 ? przyciety.slice(0, ostatniaSpacja) : przyciety;
  return baza.trim() + "…";
}

/**
 * Pytania o KWANTYFIKACJĘ — najmocniejszy element CV to konkretna liczba
 * (RUB-07). Znajdujemy istotne punkty doświadczenia BEZ liczby i pytamy, czy
 * kandydat potrafi je uściślić metryką. To nie zmyślanie: liczbę podaje sam
 * użytkownik, a my zastępujemy nią mętny punkt.
 *
 * Pytamy o trzy najnowsze pozycje (najistotniejsze) i maksymalnie o pięć
 * punktów. Limit trzyma sensowną granicę, ale jest na tyle wysoki, by wypełnić
 * pulę pytań, gdy CV nie ma wielu luk wobec oferty.
 */
export function zbudujPytaniaOMetryki(cv: TailoredCv): PytanieWywiadu[] {
  const pytania: PytanieWywiadu[] = [];

  // BEZ LIMITU (decyzja Marka 2026-08-02): pytamy o wszystko, co da się wzmocnić.
  // Wywiad pokazujemy RAZ na analizę — kto nie odpowie, ten nie skorzysta,
  // więc sztuczne ograniczanie puli tylko zabierało chętnym okazję.
  for (let e = 0; e < cv.experience.length; e++) {
    const exp = cv.experience[e];
    exp.bullets.forEach((b, j) => {
      const tekst = (b ?? "").trim();
      if (tekst.length < 25) return;
      if (maJuzKonkret(tekst)) return;
      pytania.push({
        id: `metryka-${e}-${j}`,
        typ: "doswiadczenie",
        pytanie: `Czy możesz podać skalę tego: „${cytat(tekst)}”?`,
        hint: "Ilu klientów, ile projektów, jak duży zespół, o ile szybciej? Wystarczy sama liczba albo krótkie zdanie - resztę dopiszemy za Ciebie. Nie masz liczby? Pomiń.",
        slowa: [],
        wazne: false,
        cel: { exp: e, bullet: j },
      });
    });
  }

  return pytania;
}

/**
 * Czy punkt niesie już konkret na tyle mocny, że pytanie o skalę byłoby
 * zawracaniem głowy.
 *
 * Liczba to oczywisty przypadek. Drugi to WYLICZENIE NAZW WŁASNYCH —
 * „Przeprowadziłem projekty komunikacyjne dla marek: Intel, LG, Xbox oraz ESL"
 * jest konkretny, tylko konkretem są marki, nie cyfry. Pytanie „podaj skalę"
 * przy takim punkcie brzmi absurdalnie i realnie kończyło się odpowiedzią
 * „było wiele różnych projektów, tak" (feedback Marka 2026-08-02).
 */
function maJuzKonkret(tekst: string): boolean {
  if (digitsIn(tekst).length > 0) return true;

  // Nazwy własne w środku zdania: słowa z wielkiej litery, które nie są
  // pierwszym wyrazem ani nie stoją po kropce. Trzy i więcej = wyliczenie.
  const wyrazy = tekst.split(/\s+/);
  let nazwy = 0;
  for (let i = 1; i < wyrazy.length; i++) {
    const poprzedni = wyrazy[i - 1];
    if (/[.!?]$/.test(poprzedni)) continue;
    const w = wyrazy[i].replace(/^[(„"']+/, "");
    if (/^\p{Lu}\p{L}+/u.test(w)) nazwy++;
  }
  return nazwy >= 3;
}

/**
 * UZUPEŁNIENIA Z WYWIADU — dlaczego doklejamy zamiast zastępować.
 *
 * Wcześniej odpowiedź na pytanie o metrykę PODMIENIAŁA punkt, o ile miała
 * ≥10 znaków. Nikt nie sprawdzał, czy w ogóle zawiera liczbę. Odtworzenie
 * realnej sesji (2026-08-02) pokazało skutek: punkt „Przeprowadziłem projekty
 * komunikacyjne dla marek: Intel, LG, Xbox oraz ESL" zamienił się w „Bylo wiele
 * roznych prijektow, tak.", a „Zarządzałem procesem tworzenia treści…"
 * w „Regularnie to robilem." Cztery z pięciu punktów wyszły z wywiadu GORSZE
 * niż weszły — razem z literówkami i bez polskich znaków. Narzędzie, które ma
 * naprawiać CV, psuło je i wysyłało kandydata z tym na rozmowę.
 *
 * Teraz odpowiedź jest DOKLEJANA w znaczniku, a scalaniem zajmuje się model
 * w kroku przepisywania: łączy oba fakty w jedno zdanie i pisze je poprawną
 * polszczyzną. Kandydat nie musi formułować gotowego punktu — może rzucić samą
 * liczbą. Gdy odpowiedź nie wnosi nic nowego, model zostawia oryginał.
 *
 * Znacznik NIGDY nie ma prawa trafić do dokumentu — `usunZnacznikiUzupelnien`
 * czyści to, czego model nie przetworzył (np. gdy nie ma klucza API i pipeline
 * schodzi na wariant awaryjny), zostawiając NIETKNIĘTY oryginał. Najgorszy
 * możliwy wynik wywiadu to „bez zmian", nigdy „gorzej niż było".
 */
const ZNACZNIK_OTWARCIA = " ⟦uzupełnienie kandydata: ";
const ZNACZNIK_ZAMKNIECIA = "⟧";

function oznaczUzupelnienie(oryginal: string, odpowiedz: string): string {
  return `${oryginal.trim()}${ZNACZNIK_OTWARCIA}${odpowiedz}${ZNACZNIK_ZAMKNIECIA}`;
}

/** Wydobywa uzupełnienia z punktu — do promptu i do testów. */
export function czytajUzupelnienie(punkt: string): string | null {
  const i = punkt.indexOf(ZNACZNIK_OTWARCIA);
  if (i === -1) return null;
  const j = punkt.indexOf(ZNACZNIK_ZAMKNIECIA, i);
  if (j === -1) return null;
  return punkt.slice(i + ZNACZNIK_OTWARCIA.length, j).trim();
}

/**
 * Usuwa nieprzetworzone znaczniki, zostawiając sam oryginał punktu.
 * Bezpiecznik na każdej drodze wyjścia z pipeline'u.
 */
export function usunZnacznikiUzupelnien(cv: TailoredCv): TailoredCv {
  const czysc = (s: string) => {
    const i = s.indexOf(ZNACZNIK_OTWARCIA);
    if (i === -1) return s;
    const j = s.indexOf(ZNACZNIK_ZAMKNIECIA, i);
    const reszta = j === -1 ? "" : s.slice(j + ZNACZNIK_ZAMKNIECIA.length);
    return (s.slice(0, i) + reszta).trim();
  };

  return {
    ...cv,
    experience: cv.experience.map((e) => ({
      ...e,
      bullets: e.bullets.map(czysc),
    })),
    projects: cv.projects.map((p) => ({ ...p, bullets: p.bullets.map(czysc) })),
  };
}

/** Klucz porównania punktu — do deduplikacji (trim + zwężenie spacji + lower). */
function znormalizujBullet(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Czyści odpowiedź z wywiadu, zanim trafi do CV jako punkt.
 *
 * Użytkownik odpowiada w oknie czatu, więc pisze jak w rozmowie: „tak,
 * korzystałem z tych narzędzi na co dzień”. Wklejenie tego wprost do CV daje
 * punkt zaczynający się od „tak,”, małą literą i bez kropki — czyli psuje
 * dokument, który kandydat wysyła pracodawcy. Obcinamy potwierdzenie na
 * początku, poprawiamy wielką literę i domykamy zdanie kropką.
 *
 * To NIE jest zmiana treści — to higiena zapisu tego samego faktu.
 */
export function oczyscOdpowiedz(surowa: string): string {
  let t = surowa.trim().replace(/\s+/g, " ");
  if (!t) return "";

  // Wstępne potwierdzenie („tak”, „owszem”, „no tak”) — w CV nic nie wnosi.
  const potwierdzenia =
    /^(no\s+)?(tak|owszem|zgadza się|oczywiście|jasne|pewnie|ano tak)\b[\s,.:;–—-]*/i;
  const bez = t.replace(potwierdzenia, "").trim();
  // Jeśli po obcięciu nic sensownego nie zostało, zachowaj oryginał.
  if (bez.length >= 10) t = bez;

  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += ".";
  return t;
}

function dodajUnikalne(lista: string[], nowe: string[]): string[] {
  const zbior = new Set(lista.map((s) => s.toLowerCase().trim()));
  const wynik = [...lista];
  for (const n of nowe) {
    if (n.trim() && !zbior.has(n.toLowerCase().trim())) {
      wynik.push(n.trim());
      zbior.add(n.toLowerCase().trim());
    }
  }
  return wynik;
}

/**
 * Nakłada potwierdzone odpowiedzi na CV.
 *
 * To NIE jest zmyślanie: dodajemy wyłącznie to, co użytkownik sam potwierdził
 * jako swoje. Potwierdzona kompetencja trafia do umiejętności (dzięki temu
 * dopasowanie ją zaliczy), a opcjonalny konkret — jako punkt do najnowszego
 * doświadczenia, w słowach użytkownika.
 *
 * Zwraca KOPIĘ CV — nie nadpisujemy oryginału bez zgody użytkownika.
 */
export function zastosujOdpowiedzi(
  cv: TailoredCv,
  pytania: PytanieWywiadu[],
  odpowiedzi: OdpowiedzWywiadu[]
): TailoredCv {
  const wynik: TailoredCv = structuredClone(cv);
  const poId = new Map(pytania.map((p) => [p.id, p]));

  const noweTech: string[] = [];
  const noweMiekkie: string[] = [];
  const noweBullety: string[] = [];

  for (const odp of odpowiedzi) {
    if (!odp.ma) continue;
    const p = poId.get(odp.id);
    if (!p) continue;

    // Pytanie o skalę: DOKLEJAMY uzupełnienie do punktu, nigdy go nie
    // zastępujemy. Dalej robi z tym porządek model w kroku przepisywania —
    // scala oba fakty w jedno zdanie i pisze je poprawną polszczyzną.
    if (p.cel) {
      const szczegol = (odp.szczegol ?? "").trim().replace(/\s+/g, " ");
      const poz = wynik.experience[p.cel.exp];
      const oryginal = poz?.bullets[p.cel.bullet];
      if (szczegol.length >= 3 && oryginal !== undefined) {
        poz.bullets[p.cel.bullet] = oznaczUzupelnienie(oryginal, szczegol);
      }
      continue;
    }

    if (p.typ === "doswiadczenie") {
      // Twarda kompetencja: do umiejętności technicznych, a konkret (jeśli
      // podany) jako punkt doświadczenia w słowach użytkownika — ale zapisany
      // po ludzku, nie jako urwana odpowiedź z czatu.
      noweTech.push(...p.slowa);
      const szczegol = oczyscOdpowiedz(odp.szczegol ?? "");
      if (szczegol && szczegol.length >= 10) noweBullety.push(szczegol);
    } else {
      // Cecha/postawa: tylko do umiejętności miękkich. NIE robimy z niej
      // punktu doświadczenia — to nie jest osiągnięcie zawodowe.
      noweMiekkie.push(...p.slowa);
    }
  }

  wynik.skills.technical = dodajUnikalne(wynik.skills.technical, noweTech);
  wynik.skills.soft_and_tools = dodajUnikalne(
    wynik.skills.soft_and_tools,
    noweMiekkie
  );

  // Konkrety z wywiadu dopinamy do najnowszej pozycji doświadczenia —
  // pomijając te, które już tam są (inaczej wielokrotne „Mam to” z tym samym
  // szczegółem dublowałoby punkty).
  if (noweBullety.length > 0 && wynik.experience.length > 0) {
    const istniejace = new Set(
      wynik.experience[0].bullets.map((b) => znormalizujBullet(b))
    );
    const doDodania: string[] = [];
    for (const b of noweBullety) {
      const klucz = znormalizujBullet(b);
      if (istniejace.has(klucz)) continue;
      istniejace.add(klucz);
      doDodania.push(b);
    }
    if (doDodania.length > 0) {
      wynik.experience[0] = {
        ...wynik.experience[0],
        bullets: [...wynik.experience[0].bullets, ...doDodania],
      };
    }
  }

  return wynik;
}
