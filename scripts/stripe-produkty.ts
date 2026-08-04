/**
 * Zakłada w Stripe produkty i ceny zgodne z cennikiem z `subscription.ts`.
 * Uruchom: npm run stripe:produkty
 *
 * BEZPIECZNIK: skrypt ODMAWIA działania na kluczu produkcyjnym. Zakładanie
 * cennika to operacja, którą robi się raz i na spokojnie — pomyłka trybu
 * oznaczałaby produkty widoczne dla prawdziwych klientów, zanim cokolwiek
 * przetestowaliśmy. Produkcyjne ceny zakłada się świadomie, przez `--produkcja`.
 *
 * IDEMPOTENTNY: rozpoznaje własne wpisy po `metadata.aplikando`, więc kolejne
 * uruchomienie niczego nie duplikuje — wypisuje identyfikatory już istniejące.
 *
 * Skrypt NIGDY nie wypisuje klucza. Na wyjściu są wyłącznie identyfikatory cen,
 * które i tak trafiają do konfiguracji.
 */
import Stripe from "stripe";
import {
  CENA_JEDNORAZOWA,
  LISTA_PLANOW,
  type OkresRozliczeniowy,
} from "../src/lib/subscription";

const klucz = process.env.STRIPE_SECRET_KEY;
if (!klucz) {
  console.error("✗ Brak STRIPE_SECRET_KEY w .env.local.");
  process.exit(1);
}

const naProdukcje = process.argv.includes("--produkcja");
const stripe = new Stripe(klucz);

/** Nazwa zmiennej środowiskowej dla danej ceny — musi zgadzać się z lib/stripe.ts. */
const ZMIENNE: Record<string, string> = {
  "start-miesiac": "STRIPE_CENA_START_MIES",
  "start-rok": "STRIPE_CENA_START_ROK",
  "pro-miesiac": "STRIPE_CENA_PRO_MIES",
  "pro-rok": "STRIPE_CENA_PRO_ROK",
  jednorazowo: "STRIPE_CENA_JEDNORAZOWA",
};

async function znajdzLubUtworzProdukt(klucz: string, nazwa: string, opis: string) {
  const istniejace = await stripe.products.search({
    query: `metadata['aplikando']:'${klucz}'`,
  });
  if (istniejace.data[0]) return istniejace.data[0];

  return stripe.products.create({
    name: nazwa,
    description: opis,
    metadata: { aplikando: klucz },
  });
}

async function znajdzLubUtworzCene(
  produktId: string,
  kluczCeny: string,
  zlote: number,
  interval?: "month" | "year"
) {
  const ceny = await stripe.prices.list({ product: produktId, active: true, limit: 100 });
  const pasuje = ceny.data.find(
    (c) =>
      c.metadata?.aplikando === kluczCeny &&
      c.unit_amount === zlote * 100 &&
      (interval ? c.recurring?.interval === interval : !c.recurring)
  );
  if (pasuje) return { cena: pasuje, nowa: false };

  const cena = await stripe.prices.create({
    product: produktId,
    currency: "pln",
    // Kwoty w GROSZACH. Ceny są BRUTTO — konsument ma widzieć to, co zapłaci.
    unit_amount: zlote * 100,
    ...(interval ? { recurring: { interval } } : {}),
    metadata: { aplikando: kluczCeny },
  });
  return { cena, nowa: true };
}

async function main() {
  // Tryb bierzemy z API, nie z prefiksu klucza — to jedyne pewne źródło.
  const saldo = await stripe.balance.retrieve();
  const produkcja = saldo.livemode;

  console.log(`Tryb konta: ${produkcja ? "PRODUKCJA (live)" : "sandbox (test)"}\n`);

  if (produkcja && !naProdukcje) {
    console.error(
      "✗ To jest klucz PRODUKCYJNY, a nie podano --produkcja.\n" +
        "  Przerywam. Cennik na żywym koncie zakłada się świadomie:\n" +
        "  npm run stripe:produkty -- --produkcja"
    );
    process.exit(1);
  }
  if (!produkcja && naProdukcje) {
    console.error("✗ Podano --produkcja, ale klucz jest testowy. Przerywam.");
    process.exit(1);
  }

  const wynik: Record<string, string> = {};

  for (const plan of LISTA_PLANOW) {
    const produkt = await znajdzLubUtworzProdukt(
      plan.id,
      `Aplikando ${plan.nazwa}`,
      `${plan.opis} ${plan.limit} dopasowań CV do ofert miesięcznie.`
    );
    for (const okres of ["miesiac", "rok"] as OkresRozliczeniowy[]) {
      const kluczCeny = `${plan.id}-${okres}`;
      const { cena, nowa } = await znajdzLubUtworzCene(
        produkt.id,
        kluczCeny,
        plan.ceny[okres],
        okres === "miesiac" ? "month" : "year"
      );
      wynik[ZMIENNE[kluczCeny]] = cena.id;
      console.log(
        `${nowa ? "utworzono" : "istnieje "}  ${plan.nazwa} ${okres}: ${plan.ceny[okres]} zł`
      );
    }
  }

  const produktJednorazowy = await znajdzLubUtworzProdukt(
    "jednorazowo",
    "Aplikando — jedno dopasowanie",
    "Pełny raport z jednego dopasowania CV do oferty."
  );
  const { cena, nowa } = await znajdzLubUtworzCene(
    produktJednorazowy.id,
    "jednorazowo",
    CENA_JEDNORAZOWA
  );
  wynik[ZMIENNE.jednorazowo] = cena.id;
  console.log(`${nowa ? "utworzono" : "istnieje "}  Jednorazowo: ${CENA_JEDNORAZOWA} zł`);

  console.log("\n--- do .env.local ---");
  for (const [zmienna, id] of Object.entries(wynik)) console.log(`${zmienna}=${id}`);
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
