import { normalize } from "./fact-ledger";

/**
 * KURATOWANA WIEDZA BRANŻOWA — polski rynek pracy.
 *
 * Dopasowanie leksykalne samo w sobie generuje fałszywe negatywy: kandydat ma
 * w CV „Praca w Scrum”, oferta wymaga „metodyk zwinnych” — zero wspólnych liter,
 * a chodzi o to samo. Zaniżony wynik jest dla produktu groźniejszy niż zawyżony,
 * bo mówi dobrze dopasowanemu kandydatowi, żeby nie aplikował.
 *
 * Ten plik piszemy my, nie model — dzięki temu wiedza jest sprawdzalna
 * i nie podlega halucynacjom. Rozbudowujemy go, gdy trafiamy na kolejne pary.
 */

/** Grupy określeń, które na polskim rynku znaczą to samo. */
const GRUPY: string[][] = [
  ["metodyki zwinne", "metodyka zwinna", "agile", "scrum", "kanban", "sprint"],
  [
    "testy jednostkowe",
    "unit testy",
    "testowanie jednostkowe",
    "jest",
    "vitest",
    "junit",
  ],
  ["testy e2e", "testy end-to-end", "cypress", "playwright", "selenium"],
  ["ci/cd", "continuous integration", "ciagla integracja", "github actions", "jenkins", "gitlab ci"],
  ["konteneryzacja", "docker", "kubernetes", "k8s"],
  ["baza danych", "bazy danych", "sql", "postgresql", "mysql", "database"],
  ["kontrola wersji", "git", "github", "gitlab", "bitbucket"],
  ["praca zdalna", "zdalnie", "remote", "home office"],
  ["praca hybrydowa", "hybrydowo", "hybrid"],
  ["react", "react.js", "reactjs"],
  ["node", "node.js", "nodejs"],
  ["js", "javascript"],
  ["ts", "typescript"],
  ["css", "scss", "sass", "tailwind", "tailwind css"],
  ["ux", "ui", "user experience", "figma"],
  ["komunikatywnosc", "komunikacja", "wspolpraca z klientem", "komunikacja z klientem"],
];

/** Wyrazy pomocnicze — same w sobie nic nie znaczą przy dopasowaniu. */
export const SLOWA_POMOCNICZE = new Set([
  "znajomosc", "znajomosci", "doswiadczenie", "doswiadczenia", "umiejetnosc",
  "umiejetnosci", "praca", "pracy", "poziom", "poziomie", "minimum", "min",
  "lata", "lat", "roku", "rok", "komercyjne", "komercyjnego", "bardzo",
  "dobra", "dobrej", "mile", "widziane", "jezyk", "jezyka", "jezykiem",
  "obsluga", "obslugi", "zakresie", "srodowisku", "narzedzia", "narzedzi",
  "i", "w", "z", "na", "do", "oraz", "lub", "dla", "od", "po", "przy", "o",
  "the", "and", "or", "of", "in", "to", "a", "an",
]);

/** Najdłuższa końcówka fleksyjna, jaką dopuszczamy po którejkolwiek stronie. */
const MAX_KONCOWKA = 5;

/** Polskie końcówki fleksyjne zaczynają się od samogłoski (-y, -ów, -ach, -ego). */
const SAMOGLOSKA = /^[aeiouy]/;

/**
 * Czy dwa wyrazy to ta sama podstawa w różnych formach gramatycznych.
 *
 * Reguła jest celowo wąska, bo luźne porównanie rdzeni myli nazwy technologii:
 * „JUnit” wyglądałby jak „Junior”, a „Vitest” jak „Vite”. Nazwy narzędzi
 * w polskich CV się nie odmieniają, więc wymagamy, by odcinana i doklejana
 * część wyglądały na prawdziwe końcówki fleksyjne.
 */
export function rdzenPasuje(a: string, b: string): boolean {
  if (a === b) return true;

  let wspolny = 0;
  while (wspolny < a.length && wspolny < b.length && a[wspolny] === b[wspolny]) {
    wspolny += 1;
  }
  if (wspolny < 4) return false;

  const odciete = a.slice(wspolny);
  const doklejone = b.slice(wspolny);
  if (odciete.length > MAX_KONCOWKA || doklejone.length > MAX_KONCOWKA) {
    return false;
  }

  // Długi wspólny rdzeń — sama długość końcówek wystarczy za dowód.
  if (wspolny >= 5) return true;

  // Krótki rdzeń (4 znaki) — obie końcówki muszą wyglądać na fleksyjne.
  // „testy”/„testów” przechodzi (y, ów), „JUnit”/„Junior” nie (t, or).
  return (
    (odciete === "" || SAMOGLOSKA.test(odciete)) &&
    (doklejone === "" || SAMOGLOSKA.test(doklejone))
  );
}

/** Znaczące człony frazy (bez wyrazów pomocniczych). */
function czlony(fraza: string): string[] {
  return normalize(fraza)
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length >= 3 && !SLOWA_POMOCNICZE.has(t));
}

/**
 * Czy dwie frazy to ta sama rzecz w innej formie gramatycznej.
 *
 * Model zwraca słowa kluczowe w brzmieniu z ogłoszenia („metodykach zwinnych”),
 * bo tego wymagają systemy ATS. Słownik trzymamy w formach podstawowych
 * („metodyki zwinne”), więc dopasowanie musi znieść odmianę.
 */
function podobne(a: string, b: string): boolean {
  if (normalize(a) === normalize(b)) return true;
  const ca = czlony(a);
  const cb = czlony(b);
  if (ca.length === 0 || ca.length !== cb.length) return false;
  return ca.every((t, i) => rdzenPasuje(t, cb[i]));
}

/** Zwraca frazę wraz z jej odpowiednikami z tej samej grupy. */
export function zSynonimami(fraza: string): string[] {
  const wynik = new Set<string>([normalize(fraza)]);
  for (const grupa of GRUPY) {
    if (grupa.some((g) => podobne(g, fraza))) {
      for (const g of grupa) wynik.add(normalize(g));
    }
  }
  return [...wynik];
}

/* ---------------------------------------------------------------------- */
/* Poziomy językowe — porównywalne, a nie tylko dopasowywane tekstowo.      */
/* ---------------------------------------------------------------------- */

const POZIOMY: Record<string, number> = {
  a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 6,
  podstawowy: 1,
  komunikatywny: 3,
  sredniozaawansowany: 4,
  zaawansowany: 5,
  biegly: 6,
  ojczysty: 7,
  natywny: 7,
};

/** Nazwy języków, które rozpoznajemy po obu stronach porównania. */
const JEZYKI = [
  "angielski", "niemiecki", "francuski", "hiszpanski", "wloski", "rosyjski",
  "ukrainski", "czeski", "polski", "niderlandzki", "szwedzki", "norweski",
];

/** Znajduje nazwę języka w tekście (dowolna forma odmieniona). */
function wykryjJezyk(tekst: string): string | null {
  const t = normalize(tekst);
  for (const j of JEZYKI) {
    // rdzeń wystarczy: „angielskiego”, „angielskim” → „angielsk”
    if (t.includes(j.slice(0, Math.max(5, j.length - 2)))) return j;
  }
  return null;
}

/** Znajduje poziom (CEFR lub słowny) w tekście. */
function wykryjPoziom(tekst: string): number {
  const t = normalize(tekst);
  let najwyzszy = 0;
  for (const [nazwa, ranga] of Object.entries(POZIOMY)) {
    const re = new RegExp(`(^|[^a-z0-9])${nazwa}([^a-z0-9]|$)`);
    if (re.test(t) && ranga > najwyzszy) najwyzszy = ranga;
  }
  return najwyzszy;
}

export type WymogJezykowy = { jezyk: string; poziom: number };

/** Czy to wymaganie dotyczy znajomości języka obcego. */
export function wykryjWymogJezykowy(tekst: string): WymogJezykowy | null {
  const jezyk = wykryjJezyk(tekst);
  if (!jezyk) return null;
  return { jezyk, poziom: wykryjPoziom(tekst) };
}

/**
 * Czy deklaracje z CV spełniają wymóg językowy z oferty.
 *
 * Kluczowe: porównujemy POZIOMY, nie napisy. Kandydat z C1 spełnia wymóg B2,
 * mimo że w CV nie ma nigdzie ciągu znaków „B2”.
 */
export function spelniaWymogJezykowy(
  wymog: WymogJezykowy,
  deklaracjeZCv: string[]
): boolean {
  for (const deklaracja of deklaracjeZCv) {
    if (wykryjJezyk(deklaracja) !== wymog.jezyk) continue;
    const posiadany = wykryjPoziom(deklaracja);
    // Brak poziomu po którejś stronie: sama zgodność języka wystarcza.
    if (wymog.poziom === 0 || posiadany === 0) return true;
    if (posiadany >= wymog.poziom) return true;
  }
  return false;
}
