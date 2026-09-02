import Stripe from "stripe";
import {
  CENA_JEDNORAZOWA,
  PLANY,
  type OkresRozliczeniowy,
  type PlanId,
} from "./subscription";

/**
 * WARSTWA STRIPE — wyłącznie serwer.
 *
 * Klucz tajny nigdy nie może trafić do przeglądarki, dlatego ten moduł nie ma
 * prawa być zaimportowany z komponentu „use client". Blokada niżej wywala się
 * głośno zamiast po cichu wysłać klucz w paczce JS.
 *
 * TRYB (sandbox vs produkcja) wynika WYŁĄCZNIE z użytego klucza — nie mamy
 * osobnej flagi środowiska i nie chcemy jej mieć. Do zapisów w bazie bierzemy
 * `livemode` prosto ze zdarzenia Stripe'a, bo to jedyne źródło prawdy o tym,
 * czy pieniądze były prawdziwe.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "lib/stripe.ts użyty w przeglądarce. Ten moduł trzyma klucz tajny i wolno " +
      "go importować wyłącznie po stronie serwera."
  );
}

/** Czy płatności są w ogóle skonfigurowane (jak `czyAiDostepne`). */
export function czyStripeDostepny(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let klient: Stripe | null = null;

export function stripe(): Stripe {
  const klucz = process.env.STRIPE_SECRET_KEY;
  if (!klucz) throw new Error("Brak STRIPE_SECRET_KEY.");
  klient ??= new Stripe(klucz);
  return klient;
}

/**
 * Identyfikatory cen z Stripe'a — po jednym na plan i okres.
 *
 * Kwoty NIE są tu duplikowane. Ceny mieszkają w `subscription.ts` (jedno
 * źródło prawdy dla UI), a tutaj trzymamy wyłącznie identyfikatory, bo tylko
 * one różnią się między sandboxem a produkcją. Gdyby kwota była w dwóch
 * miejscach, prędzej czy później cennik pokazywałby co innego niż kasa.
 */
const KLUCZE_CEN: Record<PlanId, Record<OkresRozliczeniowy, string>> = {
  start: {
    miesiac: "STRIPE_CENA_START_MIES",
    rok: "STRIPE_CENA_START_ROK",
  },
  pro: {
    miesiac: "STRIPE_CENA_PRO_MIES",
    rok: "STRIPE_CENA_PRO_ROK",
  },
};

export function idCenySubskrypcji(plan: PlanId, okres: OkresRozliczeniowy): string {
  const zmienna = KLUCZE_CEN[plan][okres];
  const id = process.env[zmienna];
  if (!id) {
    throw new Error(
      `Brak ${zmienna} - nie wiem, którą cenę Stripe'a wystawić dla planu ` +
        `${PLANY[plan].nazwa} (${okres}).`
    );
  }
  return id;
}

export function idCenyJednorazowej(): string {
  const id = process.env.STRIPE_CENA_JEDNORAZOWA;
  if (!id) {
    throw new Error(
      `Brak STRIPE_CENA_JEDNORAZOWA - nie wiem, którą cenę wystawić za ` +
        `jednorazowe odblokowanie (${CENA_JEDNORAZOWA} zł).`
    );
  }
  return id;
}

/**
 * Mapowanie statusu Stripe'a na nasz słownik.
 *
 * `past_due` i `canceled` NIE odbierają dostępu od razu — trwa on do końca
 * opłaconego okresu (`czyAktywna` w subscription.ts). Statusy przed pierwszą
 * udaną płatnością (`incomplete`, `incomplete_expired`) traktujemy jak brak
 * subskrypcji: nikt jeszcze nie zapłacił.
 */
export function statusZeStripe(
  s: Stripe.Subscription.Status
): "aktywna" | "zalega" | "anulowana" | null {
  switch (s) {
    case "active":
    case "trialing":
      return "aktywna";
    case "past_due":
    case "unpaid":
      return "zalega";
    case "canceled":
      return "anulowana";
    default:
      return null;
  }
}

/** Odwrotność `idCenySubskrypcji` — z ceny w zdarzeniu na nasz plan i okres. */
export function planZCeny(
  idCeny: string
): { plan: PlanId; okres: OkresRozliczeniowy } | null {
  for (const plan of Object.keys(KLUCZE_CEN) as PlanId[]) {
    for (const okres of ["miesiac", "rok"] as OkresRozliczeniowy[]) {
      if (process.env[KLUCZE_CEN[plan][okres]] === idCeny) return { plan, okres };
    }
  }
  return null;
}
