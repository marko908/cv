/**
 * Subskrypcja, jednorazowe odblokowania i uprawnienia — JEDNO źródło prawdy
 * o tym, za co użytkownik zapłacił.
 *
 * Dwie drogi do dostępu:
 *  1. SUBSKRYPCJA — konto ma dostęp do wszystkich dopasowań, w ramach limitu planu.
 *  2. JEDNORAZOWE ODBLOKOWANIE — użytkownik kupuje JEDNO wybrane dopasowanie.
 *     Może ich kupić dowolnie wiele; każde dotyczy konkretnego rekordu.
 *
 * ZASADA: kod NIGDY nie pyta „czy ten rekord ma flagę unlocked". Pyta
 * `maDostepDo(id)`, które sprawdza subskrypcję ALBO listę kupionych rekordów.
 * Dzięki temu przeliczenie po wywiadzie (nowy rekord zastępuje stary) nie może
 * odebrać opłaconego dostępu — realny błąd sprzed tej zmiany. Przy zastąpieniu
 * rekordu store PRZENOSI jednorazowe odblokowanie na nowe id
 * (`przeniesOdblokowanie`), więc płacący za jedno dopasowanie może swobodnie
 * korzystać z wywiadu.
 *
 * PRZYGOTOWANE POD STRIPE + SUPABASE: `Subscription` odwzorowuje model Stripe'a
 * (`status`, `current_period_end`), jednorazowe zakupy to Payment Intents
 * powiązane z id dopasowania. Po podpięciu bazy podmieniamy WYŁĄCZNIE źródło
 * danych w hookach w `store.ts` — reszta aplikacji zostaje bez zmian.
 */

/**
 * Darmowa oferta (decyzja Marka 2026-08-10): jedno w pełni odblokowane
 * dopasowanie miesięcznie, dla KAŻDEGO konta — nie tylko subskrybentów.
 * Odnawia się co miesiąc, jak limity `PLANY`, ale to NIE jest subskrypcja
 * (konto bez planu dostaje dostęp do JEDNEGO wybranego dopasowania, nie do
 * wszystkich) — mechanizm w bazie: kolumna `zuzycie_miesieczne
 * .darmowy_dopasowanie_id` + funkcja `zuzyj_darmowe_dopasowanie`
 * (`supabase/migrations/20260810130000_darmowe_dopasowanie.sql`), wołana
 * z `tailor-flow.tsx` zaraz po utworzeniu nowego dopasowania.
 */
export const LIMIT_DARMOWY = 1;

/** Co użytkownik dostaje BEZ płacenia — darmowy zakres produktu. */
export const ZAKRES_BEZPLATNY = [
  "Konto i kreator CV",
  "Wszystkie szablony i podgląd na żywo",
  "Pobranie własnego CV w PDF",
  `${LIMIT_DARMOWY} w pełni odblokowane dopasowanie miesięcznie`,
] as const;

/** Co odblokowuje dostęp. Tylko rzeczy, które REALNIE istnieją w kodzie. */
export const ZAKRES_PLATNY = [
  "Kolejne dopasowania CV do oferty (pierwsze w miesiącu jest darmowe)",
  "Wynik z rozbiciem na kryteria - widzisz, skąd się bierze",
  "Raport: co zmieniliśmy w CV i dlaczego",
  "Wywiad uzupełniający, który podnosi wynik",
  "Przerobione CV do edycji i pobrania",
] as const;

export type OkresRozliczeniowy = "miesiac" | "rok";
export type PlanId = "start" | "pro";

export interface Plan {
  id: PlanId;
  nazwa: string;
  /** Ile dopasowań miesięcznie mieści się w planie. */
  limit: number;
  /** Ceny BRUTTO w złotych — konsument ma widzieć kwotę, którą zapłaci. */
  ceny: Record<OkresRozliczeniowy, number>;
  opis: string;
  /** Wyróżniony w cenniku — bo ma realnie lepszy stosunek ceny do limitu. */
  polecany?: boolean;
}

/**
 * Droższy plan MUSI mieć lepszy stosunek ceny do liczby dopasowań, inaczej
 * nie ma powodu, żeby ktokolwiek go wybrał: 29/30 ≈ 0,97 zł za dopasowanie,
 * 49/100 ≈ 0,49 zł. Roczny = 10× cena miesięczna (dwa miesiące gratis).
 */
export const PLANY: Record<PlanId, Plan> = {
  start: {
    id: "start",
    nazwa: "Start",
    limit: 30,
    ceny: { miesiac: 29, rok: 290 },
    opis: "Dla szukających pracy tu i teraz.",
  },
  pro: {
    id: "pro",
    nazwa: "Pro",
    limit: 100,
    ceny: { miesiac: 49, rok: 490 },
    opis: "Dla aplikujących seryjnie - trzykrotnie więcej za mniej niż dwa razy tyle.",
    polecany: true,
  },
};

export const LISTA_PLANOW: Plan[] = [PLANY.start, PLANY.pro];

/** Cena jednorazowego odblokowania POJEDYNCZEGO dopasowania (brutto). */
export const CENA_JEDNORAZOWA = 12;

export const OKRESY: Record<OkresRozliczeniowy, { etykieta: string; przyrostek: string }> = {
  miesiac: { etykieta: "Miesięcznie", przyrostek: "/ mies." },
  rok: { etykieta: "Rocznie", przyrostek: "/ rok" },
};

/** Rabat rocznego względem 12× miesięcznego, w pełnych procentach. */
export function rabatRoczny(plan: Plan): number {
  return Math.round((1 - plan.ceny.rok / (plan.ceny.miesiac * 12)) * 100);
}

/** Miesięczny ekwiwalent ceny rocznej — zaokrąglony W GÓRĘ, żeby nie obiecywać mniej. */
export function miesiecznieZRocznego(plan: Plan): number {
  return Math.ceil(plan.ceny.rok / 12);
}

/** Status prosto z modelu Stripe'a — nie wymyślamy własnego słownika. */
export type StatusSubskrypcji =
  | "brak"
  | "aktywna"
  | "zalega" // past_due — płatność nie przeszła, dostęp jeszcze jest
  | "anulowana"; // canceled — dostęp do końca opłaconego okresu

export interface Subscription {
  status: StatusSubskrypcji;
  plan: PlanId | null;
  okres: OkresRozliczeniowy | null;
  /** Kiedy kończy się opłacony okres (ms). Null = brak subskrypcji. */
  koniecOkresu: number | null;
  /** Ustawiane po podpięciu Stripe'a — do panelu klienta i webhooków. */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const BRAK_SUBSKRYPCJI: Subscription = {
  status: "brak",
  plan: null,
  okres: null,
  koniecOkresu: null,
};

/**
 * Czy konto ma AKTYWNĄ SUBSKRYPCJĘ.
 * `zalega` i `anulowana` dają dostęp do końca opłaconego okresu — tak działa
 * Stripe i tak samo musi działać UI, żeby nie odcinać ludzi w trakcie okresu.
 */
export function czyAktywna(s: Subscription | undefined, teraz = Date.now()): boolean {
  if (!s || s.status === "brak") return false;
  if (s.status === "aktywna") return true;
  return s.koniecOkresu !== null && s.koniecOkresu > teraz;
}

/** Limit dopasowań wynikający z planu (0, gdy brak subskrypcji). */
export function limitPlanu(s: Subscription | undefined): number {
  if (!czyAktywna(s) || !s?.plan) return 0;
  return PLANY[s.plan].limit;
}

/**
 * Realny miesięczny limit konta = limit planu. BEZ subskrypcji jest ZERO —
 * dopasowań nie ma w darmowym zakresie (patrz `ZAKRES_BEZPLATNY`), a dostęp
 * kupuje się subskrypcją albo jednorazowo za `CENA_JEDNORAZOWA`.
 *
 * Osobna funkcja, bo serwer musi mieć jedną, jawną odpowiedź na pytanie
 * „ile temu koncie wolno w tym miesiącu" i brać ją stąd, a nie liczyć samemu.
 */
export function limitKonta(s: Subscription | undefined): number {
  return limitPlanu(s);
}

/** Licznik użycia w bieżącym miesiącu — po Supabase liczony po stronie serwera. */
export interface UzycieMiesieczne {
  /** Klucz „RRRR-MM" — zmiana klucza zeruje licznik. */
  miesiac: string;
  dopasowania: number;
}

export function kluczMiesiaca(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const PUSTE_UZYCIE: UzycieMiesieczne = {
  miesiac: kluczMiesiaca(),
  dopasowania: 0,
};

/** Zużycie w bieżącym miesiącu (stary klucz = 0). */
export function zuzytoWTymMiesiacu(u: UzycieMiesieczne | undefined): number {
  if (!u || u.miesiac !== kluczMiesiaca()) return 0;
  return u.dopasowania;
}

/** Ile dopasowań zostało w ramach planu (nigdy poniżej zera). */
export function pozostaloDopasowan(
  s: Subscription | undefined,
  u: UzycieMiesieczne | undefined
): number {
  return Math.max(0, limitPlanu(s) - zuzytoWTymMiesiacu(u));
}
