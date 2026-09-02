import type { TailoredCv } from "@/lib/cv-schema";
import { cvChecklist } from "@/lib/cv-schema";
import { digitsIn, normalize } from "./fact-ledger";
import type { WynikDopasowania } from "./matching";
import { pluralize } from "@/lib/utils";

/**
 * RUBRYKA OCENY CV 0–100.
 *
 * Wynik NIE jest liczbą wymyśloną przez model. To suma jawnych, ważonych
 * kryteriów, z których każde da się policzyć w kodzie i wytłumaczyć jednym
 * zdaniem. Dwa cele:
 *   1. UZASADNIALNOŚĆ — użytkownik widzi, z czego wynika liczba.
 *   2. KONSEKWENCJA — te same dane dają zawsze ten sam wynik.
 *
 * Podział wag (suma 100):
 *   - Dopasowanie do oferty (zależne od ogłoszenia): 50 pkt
 *   - Ogólna jakość CV (niezależna od oferty):       50 pkt
 *
 * Kryteria wyprowadzone z syntezy 16 poradników o CV (patrz
 * `wiedza-cv-z-transkryptow.md`, sekcja 4). ID zgodne z tamtą rubryką.
 */

export type KryteriumWyniku = {
  id: string;
  etykieta: string;
  waga: number;
  /** 0..waga — zaokrąglone do 1 miejsca po przecinku. */
  zdobyte: number;
  /** Zdanie wyjaśniające dla użytkownika (edukacja). */
  opis: string;
  zalezyOdOferty: boolean;
};

export type RubrykaWyniku = {
  /** 0–100, suma zdobytych punktów (zaokrąglona). */
  wynik: number;
  kryteria: KryteriumWyniku[];
};

/** Mocne czasowniki dokonane — początek dobrego punktu osiągnięcia. */
const CZASOWNIKI = [
  "wdrozylem","wdrozylam","zoptymalizowalem","zoptymalizowalam","zredukowalem",
  "zredukowalam","zwiekszylem","zwiekszylam","obnizylem","obnizylam","opracowalem",
  "opracowalam","zbudowalem","zbudowalam","uruchomilem","uruchomilam",
  "wynegocjowalem","wynegocjowalam","pozyskalem","pozyskalam","skrocilem",
  "skrocilam","zautomatyzowalem","zautomatyzowalam","zarzadzalem","zarzadzalam",
  "skoordynowalem","skoordynowalam","przeszkolilem","przeszkolilam","wprowadzilem",
  "wprowadzilam","usprawnilem","usprawnilam","przyspieszylem","przyspieszylam",
  "podnioslem","podnioslam","stworzylem","stworzylam","zaprojektowalem",
  "zaprojektowalam","wdrozylismy","zrealizowalem","zrealizowalam","dostarczylem",
  "dostarczylam","rozwinolem","rozwinelam","wdrazalem","wdrazalam",
  // Dokonane czasowniki sprawcze spoza IT — bez nich rubryka zaniżała wynik
  // CV z PR, marketingu, sprzedaży czy administracji (realny przypadek:
  // „Przeprowadziłem", „Zidentyfikowałem", „Przełożyłem" były odrzucane).
  "przeprowadzilem","przeprowadzilam","zidentyfikowalem","zidentyfikowalam",
  "przelozylem","przelozylam","przygotowalem","przygotowalam","zorganizowalem",
  "zorganizowalam","nawiazalem","nawiazalam","zawarlem","zawarlam",
  "wypracowalem","wypracowalam","rozliczylem","rozliczylam","zweryfikowalem",
  "zweryfikowalam","przeanalizowalem","przeanalizowalam","zaplanowalem",
  "zaplanowalam","wykonalem","wykonalam","osiagnalem","osiagnelam",
  "zdobylem","zdobylam","obslugiwalem","obslugiwalam","prowadzilem","prowadzilam",
  "utworzylem","utworzylam","wdrozylismy","zredagowalem","zredagowalam",
  "napisalem","napisalam","przeszedlem","przeszlam","ukonczylem","ukonczylam",
  "wprowadzalem","wprowadzalam","nadzorowalem","nadzorowalam","kierowalem",
  "kierowalam","wspolpracowalem","wspolpracowalam","szkolilem","szkolilam",
  "sprzedalem","sprzedalam","negocjowalem","negocjowalam","optymalizowalem",
  "optymalizowalam","automatyzowalem","automatyzowalam","testowalem","testowalam",
];

/**
 * Czasowniki DOKONANE (co zrobiłem i skończyłem) — „Wdrożyłem", „Przeprowadziłem".
 * Rekomendowana forma w CV: pokazuje zamknięty efekt, nie proces.
 */
const DOKONANE = [
  "wdrozylem","wdrozylam","zoptymalizowalem","zoptymalizowalam","zredukowalem",
  "zredukowalam","zwiekszylem","zwiekszylam","obnizylem","obnizylam","opracowalem",
  "opracowalam","zbudowalem","zbudowalam","uruchomilem","uruchomilam",
  "wynegocjowalem","wynegocjowalam","pozyskalem","pozyskalam","skrocilem",
  "skrocilam","zautomatyzowalem","zautomatyzowalam","skoordynowalem",
  "skoordynowalam","przeszkolilem","przeszkolilam","wprowadzilem","wprowadzilam",
  "usprawnilem","usprawnilam","przyspieszylem","przyspieszylam","podnioslem",
  "podnioslam","stworzylem","stworzylam","zaprojektowalem","zaprojektowalam",
  "zrealizowalem","zrealizowalam","dostarczylem","dostarczylam","przeprowadzilem",
  "przeprowadzilam","zidentyfikowalem","zidentyfikowalam","przelozylem",
  "przelozylam","przygotowalem","przygotowalam","zorganizowalem","zorganizowalam",
  "nawiazalem","nawiazalam","zawarlem","zawarlam","wypracowalem","wypracowalam",
  "rozliczylem","rozliczylam","zweryfikowalem","zweryfikowalam","przeanalizowalem",
  "przeanalizowalam","zaplanowalem","zaplanowalam","wykonalem","wykonalam",
  "osiagnalem","osiagnelam","zdobylem","zdobylam","utworzylem","utworzylam",
  "zredagowalem","zredagowalam","napisalem","napisalam","ukonczylem","ukonczylam",
];

/**
 * Czasowniki NIEDOKONANE (opis trwającej czynności) — „Prowadziłem", „Tworzyłem".
 * Same w sobie nie są błędem, ale MIESZANIE ich z dokonanymi w jednej pozycji
 * czyta się niechlujnie (realne zgłoszenie: „Przeprowadziłem research…" tuż nad
 * „Tworzyłem treści…”).
 */
const NIEDOKONANE = [
  "prowadzilem","prowadzilam","tworzylem","tworzylam","utrzymywalem","utrzymywalam",
  "wykorzystywalem","wykorzystywalam","opracowywalem","opracowywalam","nawiazywalem",
  "nawiazywalam","zajmowalem","zajmowalam","wspieralem","wspieralam","realizowalem",
  "realizowalam","budowalem","budowalam","pomagalem","pomagalam","odpowiadalem",
  "odpowiadalam","dbalem","dbalam","rozwijalem","rozwijalam","testowalem","testowalam",
  "obslugiwalem","obslugiwalam","wprowadzalem","wprowadzalam","nadzorowalem",
  "nadzorowalam","kierowalem","kierowalam","wspolpracowalem","wspolpracowalam",
  "szkolilem","szkolilam","negocjowalem","negocjowalam","optymalizowalem",
  "optymalizowalam","automatyzowalem","automatyzowalam","zarzadzalem","zarzadzalam",
  "wdrazalem","wdrazalam","przygotowywalem","przygotowywalam","analizowalem",
  "analizowalam","planowalem","planowalam","organizowalem","organizowalam",
];

/** Sformułowania „obowiązkowe" — słabsze niż osiągnięcie. */
const OBOWIAZEK = [
  "odpowiedzialny za","odpowiedzialna za","bylem odpowiedzialny","bylam odpowiedzialna",
  "zajmowalem sie","zajmowalam sie","do moich obowiazkow","do obowiazkow nalezalo",
  "praca polegala na","moim zadaniem bylo","pomagalem przy","pomagalam przy",
  "uczestniczylem w","uczestniczylam w",
];

/** Mętne określenia skali bez konkretu — słabsze niż liczba. */
const METNE = [
  "duze budzety","duzymi budzetami","duzym budzetem","duze zespoly","duzymi zespolami",
  "wieloma projektami","liczne","licznymi","znaczaco","znaczace","wiele projektow",
  "duza sprzedaz","wysoka sprzedaz",
];

/** Frazesy bez wartości (spójne z walidatorem). */
const FRAZESY = [
  "komunikatywny","komunikatywna","dyspozycyjny","gracz zespolowy","praca zespolowa",
  "kreatywny","obsluga komputera","obsluga urzadzen biurowych","zmotywowany",
  "sumienny","ambitny","dobra organizacja czasu pracy","chec do nauki",
];

/** Dane wrażliwe, które nie powinny znaleźć się w CV (ryzyko dyskryminacji). */
const WRAZLIWE = [
  "data urodzenia","pesel","stan cywilny","zamezna","zonaty","kawaler","panna",
  "narodowosc","obywatelstwo",
];

/** Wszystkie punkty doświadczenia i projektów (materiał na osiągnięcia). */
function punkty(cv: TailoredCv): string[] {
  return [
    ...cv.experience.flatMap((e) => e.bullets.filter(Boolean)),
    ...cv.projects.flatMap((p) => p.bullets.filter(Boolean)),
  ];
}

function pierwszeSlowo(tekst: string): string {
  return normalize(tekst).split(/[^a-z0-9]+/).filter(Boolean)[0] ?? "";
}

function zawiera(tekst: string, frazy: string[]): boolean {
  const n = normalize(tekst);
  return frazy.some((f) => n.includes(f));
}

/**
 * Ile pozycji doświadczenia miesza aspekt dokonany z niedokonanym.
 * Liczymy w obrębie JEDNEJ pozycji — tam niespójność najbardziej razi.
 */
function pozycjeZMieszanymAspektem(cv: TailoredCv): number {
  const grupy = [
    ...cv.experience.map((e) => e.bullets),
    ...cv.projects.map((p) => p.bullets),
  ];
  return grupy.filter((bullets) => {
    const slowa = bullets.filter(Boolean).map(pierwszeSlowo);
    const dok = slowa.some((s) => DOKONANE.includes(s));
    const nie = slowa.some((s) => NIEDOKONANE.includes(s));
    return dok && nie;
  }).length;
}

/** Czy punkt jest „osiągnięciowy": mocny czasownik lub liczba, bez frazy obowiązku. */
function czyOsiagniecie(b: string): boolean {
  if (zawiera(b, OBOWIAZEK)) return false;
  if (CZASOWNIKI.includes(pierwszeSlowo(b))) return true;
  if (digitsIn(b).length > 0) return true;
  return false;
}

/** Zaokrągla zdobyte punkty do 1 miejsca po przecinku. */
function zaokr(zdobyte: number): number {
  return Math.round(zdobyte * 10) / 10;
}

/**
 * Ocenia jedno CV względem oferty. `dopasowanie` to wynik `dopasuj()` dla tego
 * właśnie CV — dostarcza część „zależną od oferty".
 */
export function ocenCv(
  cv: TailoredCv,
  dopasowanie: WynikDopasowania
): RubrykaWyniku {
  const kryteria: KryteriumWyniku[] = [];
  const bullety = punkty(cv);
  const push = (
    id: string,
    etykieta: string,
    waga: number,
    zdobyte: number,
    opis: string,
    zalezyOdOferty: boolean
  ) => kryteria.push({ id, etykieta, waga, zdobyte: zaokr(zdobyte), opis, zalezyOdOferty });

  // ── Część zależna od oferty (50) ──────────────────────────────────────────

  // RUB-DOP: pokrycie wymagań oferty (rdzeń — z deterministycznego matchera).
  const dop = (dopasowanie.wynik / 100) * 40;
  push(
    "RUB-DOP",
    "Dopasowanie do wymagań oferty",
    40,
    dop,
    `CV pokrywa ${dopasowanie.wynik}% ważonych wymagań z tego ogłoszenia (wymagania obowiązkowe liczą się najmocniej).`,
    true
  );

  // RUB-ATS-KW: pokrycie słów kluczowych (ATS).
  const kw = (dopasowanie.pokrycieSlowKluczowych / 100) * 10;
  push(
    "RUB-ATS-KW",
    "Słowa kluczowe pod ATS",
    10,
    kw,
    `Systemy ATS filtrują CV po słowach z ogłoszenia. Twoje CV zawiera ${dopasowanie.pokrycieSlowKluczowych}% słów kluczowych z tej oferty - wplecionych naturalnie, tylko tam, gdzie masz je w doświadczeniu.`,
    true
  );

  // ── Ogólna jakość CV (50) ────────────────────────────────────────────────

  // RUB-06: orientacja na osiągnięcia (nie listę obowiązków).
  const osiag = bullety.length
    ? bullety.filter(czyOsiagniecie).length / bullety.length
    : 0;
  push(
    "RUB-06",
    "Osiągnięcia zamiast obowiązków",
    12,
    osiag * 12,
    bullety.length
      ? `${Math.round(osiag * 100)}% punktów zaczyna się od konkretu (mocny czasownik lub liczba), a nie od „byłem odpowiedzialny za…". Rekruter woli efekty od spisu zadań.`
      : "Brak punktów doświadczenia do oceny.",
    false
  );

  // RUB-07: kwantyfikacja (liczby/metryki), z karą za mętne określenia skali.
  const zLiczba = bullety.length
    ? bullety.filter((b) => digitsIn(b).length > 0).length / bullety.length
    : 0;
  const metneW = [cv.professional_summary, ...bullety].filter((t) =>
    zawiera(t, METNE)
  ).length;
  const karaMetne = Math.min(0.2, metneW * 0.1);
  const licz = Math.max(0, zLiczba - karaMetne);
  push(
    "RUB-07",
    "Konkretne liczby i metryki",
    10,
    licz * 10,
    bullety.length
      ? `${Math.round(zLiczba * 100)}% punktów zawiera konkretną liczbę (%, kwota, skala).${metneW ? ` Uwaga: ${metneW} raz(y) pojawia się mętne określenie („duże budżety/zespoły") - warto zastąpić je liczbą.` : " Liczby to najmocniejszy element CV."}`
      : "Brak punktów do oceny kwantyfikacji.",
    false
  );

  // RUB-08: podsumowanie zawodowe.
  const sumLen = cv.professional_summary.trim().length;
  const sum = sumLen >= 120 ? 1 : sumLen >= 50 ? 0.6 : 0;
  push(
    "RUB-08",
    "Podsumowanie zawodowe",
    8,
    sum * 8,
    sumLen >= 120
      ? "Masz mocne podsumowanie u góry - rekruter czyta je jako pierwsze i od niego zależy pierwsze wrażenie."
      : sumLen >= 50
        ? "Podsumowanie jest, ale krótkie - warto rozwinąć do 3-4 zdań (kim jesteś, kluczowe osiągnięcia, cel)."
        : "Brak podsumowania zawodowego. To pierwsza rzecz, którą czyta rekruter - jego brak odbiera CV ludzki aspekt.",
    false
  );

  // RUB-09: struktura i kompletność sekcji.
  const checklist = cvChecklist(cv);
  const strukt = checklist.filter((c) => c.done).length / checklist.length;
  const braki = checklist.filter((c) => !c.done).map((c) => c.label);
  push(
    "RUB-09",
    "Kompletność sekcji",
    8,
    strukt * 8,
    braki.length
      ? `Brakuje lub jest niepełne: ${braki.join(", ")}. Komplet sekcji buduje profesjonalny obraz.`
      : "Wszystkie kluczowe sekcje są uzupełnione.",
    false
  );

  // RUB-10: spójność formatu (daty MM.RRRR, brak pasków/„%" przy skillu).
  const okresy = [
    ...cv.experience.map((e) => e.period),
    ...cv.education.map((e) => e.period),
  ].filter(Boolean);
  // Kryterium mierzy SPÓJNOŚĆ, nie zgodność z jednym wybranym zapisem. „2023 –
  // 2025" powtórzone w całym CV jest spójne i czytelne, więc nie ma powodu go
  // karać (wcześniej wymagaliśmy MM.RRRR i takie CV dostawało 0/6 — mylące,
  // zwłaszcza że dat i tak nie przepisujemy, bo to dane twarde).
  const wzorzecDaty = (p: string): string => {
    if (/obecnie|obecny|present|nadal/i.test(p)) return "z-obecnie";
    if (/\d{1,2}\.\d{4}/.test(p)) return "MM.RRRR";
    if (/\d{1,2}\/\d{4}/.test(p)) return "MM/RRRR";
    if (/\d{4}\s*[-–—]\s*\d{4}/.test(p)) return "RRRR-RRRR";
    if (/[a-ząćęłńóśźż]{3,}\s+\d{4}/i.test(p)) return "slownie RRRR";
    if (/\d{4}/.test(p)) return "RRRR";
    return "inny";
  };
  const wzorce = new Set(okresy.map(wzorzecDaty));
  // Zapisy „do teraz" mieszają się z każdym formatem, więc ich nie liczymy
  // jako osobnej niespójności.
  wzorce.delete("z-obecnie");
  const nierozpoznane = okresy.filter((p) => wzorzecDaty(p) === "inny").length;
  const spojneDaty = okresy.length
    ? Math.max(0, 1 - Math.max(0, wzorce.size - 1) * 0.5 - nierozpoznane / okresy.length * 0.5)
    : 1;
  // Paski / procenty / „x/10" przy umiejętnościach — nic nie znaczą.
  const paskiSkill = [...cv.skills.technical, ...cv.skills.soft_and_tools].filter(
    (s) => /\d+\s*%|\d\s*\/\s*10|★|●|▮/.test(s)
  ).length;
  // Spójność językowa: mieszanie aspektu w obrębie jednej pozycji.
  const mieszanyAspekt = pozycjeZMieszanymAspektem(cv);
  const format = Math.max(
    0,
    spojneDaty -
      Math.min(0.5, paskiSkill * 0.25) -
      Math.min(0.4, mieszanyAspekt * 0.2)
  );
  push(
    "RUB-10",
    "Spójny format i język",
    6,
    format * 6,
    mieszanyAspekt
      ? `W ${pluralize(mieszanyAspekt, "pozycji", "pozycjach", "pozycjach")} mieszasz formy dokonane („Wdrożyłem") z niedokonanymi („Wdrażałem") - trzymaj jedną konwencję w obrębie stanowiska, najlepiej dokonaną.`
      : paskiSkill
        ? `Przy umiejętnościach pojawiają się paski/procenty poziomu (${paskiSkill}) - rekruterowi nic nie mówią; użyj skali A1-C2 dla języków, a przy narzędziach po prostu ich wymień.`
        : okresy.length && spojneDaty < 1
          ? `Daty są zapisane na ${wzorce.size} różne sposoby (${[...wzorce].join(", ")}) - ujednolić je do jednego formatu w całym CV.`
          : "Daty i formy czasowników spójne w całym CV, bez pasków poziomu przy umiejętnościach.",
    false
  );

  // RUB-13: brak frazesów i danych wrażliwych.
  const teksty = [
    cv.professional_summary,
    ...bullety,
    ...cv.skills.soft_and_tools,
  ];
  const frazesyW = teksty.filter((t) => zawiera(t, FRAZESY)).length;
  const wrazliweW = teksty.filter((t) => zawiera(t, WRAZLIWE)).length;
  const czystosc = Math.max(0, 1 - frazesyW * 0.25 - wrazliweW * 0.5);
  push(
    "RUB-13",
    "Bez frazesów i danych zbędnych",
    4,
    czystosc * 4,
    frazesyW || wrazliweW
      ? `${frazesyW ? `Frazesy typu „komunikatywny"/„gracz zespołowy" (${frazesyW}) - i tak weryfikuje się je na rozmowie. ` : ""}${wrazliweW ? `Dane wrażliwe (wiek/stan cywilny/PESEL) - usuń, to ryzyko dyskryminacji. ` : ""}`.trim()
      : "Bez pustych frazesów i bez danych wrażliwych - dobrze.",
    false
  );

  // RUB-14: higiena danych kontaktowych + RODO.
  const p = cv.personal_info;
  const kontakt =
    (p.email.trim() ? 1 : 0) +
    (p.phone.trim() ? 1 : 0) +
    (p.location.trim() ? 1 : 0) +
    (cv.rodo_clause.trim() ? 1 : 0);
  const kontaktProc = kontakt / 4;
  push(
    "RUB-14",
    "Dane kontaktowe i RODO",
    2,
    kontaktProc * 2,
    kontakt === 4
      ? "Komplet danych kontaktowych i klauzula RODO - bez tego (na rynku PL) CV bywa odrzucane bez czytania."
      : "Uzupełnij dane kontaktowe (mail, telefon, miasto) i klauzulę RODO - na rynku PL jej brak potrafi wykluczyć CV z rekrutacji.",
    false
  );

  const wynik = Math.round(
    kryteria.reduce((s, k) => s + k.zdobyte, 0)
  );
  return { wynik: Math.min(100, Math.max(0, wynik)), kryteria };
}
