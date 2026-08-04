/**
 * Uzgodnienie stanu subskrypcji: Stripe → baza.
 * Uruchom: npm run stripe:synchronizuj
 *
 * Po co to istnieje: webhook potrafi nie dojść. Endpoint bywa chwilowo
 * niedostępny, brakuje zmiennej po wdrożeniu, ktoś zmieni subskrypcję z panelu
 * Stripe'a przy wyłączonym webhooku. Wtedy klient zapłacił, a aplikacja o tym
 * nie wie — i to jest najgorszy możliwy rodzaj błędu, bo dotyka ludzi, którzy
 * właśnie dali nam pieniądze.
 *
 * Ten skrypt czyta prawdę ze Stripe'a i dopisuje ją do bazy. Używa TYCH SAMYCH
 * funkcji mapujących co webhook (`statusZeStripe`, `planZCeny`), więc nie ma
 * drugiej, rozjeżdżającej się interpretacji statusów.
 *
 * Jest idempotentny — uruchamiaj do skutku, niczego nie zdubluje.
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { planZCeny, statusZeStripe } from "../src/lib/stripe";
import type { Database } from "../src/lib/supabase/typy-bazy";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function main() {
  const saldo = await stripe.balance.retrieve();
  console.log(`Konto Stripe: ${saldo.livemode ? "PRODUKCJA" : "sandbox"}\n`);

  const subskrypcje = await stripe.subscriptions.list({ limit: 100, status: "all" });
  if (subskrypcje.data.length === 0) return console.log("Brak subskrypcji w Stripe.");

  for (const sub of subskrypcje.data) {
    const status = statusZeStripe(sub.status);
    if (!status) {
      console.log(`${sub.id}: status „${sub.status}" — pomijam (nikt nie zapłacił).`);
      continue;
    }

    const { data: profil } = await admin
      .from("profil")
      .select("id, email")
      .eq("stripe_customer_id", String(sub.customer))
      .maybeSingle();

    if (!profil) {
      console.log(`${sub.id}: brak konta z klientem ${sub.customer} — pomijam.`);
      continue;
    }

    const pozycja = sub.items.data[0];
    const zCeny = pozycja?.price?.id ? planZCeny(pozycja.price.id) : null;
    const plan = (sub.metadata?.plan as "start" | "pro") ?? zCeny?.plan;
    const okres = (sub.metadata?.okres as "miesiac" | "rok") ?? zCeny?.okres;

    if (!plan || !okres) {
      console.log(`${sub.id}: nie rozpoznaję ceny ${pozycja?.price?.id} — pomijam.`);
      continue;
    }

    const { error } = await admin.from("subskrypcja").upsert(
      {
        user_id: profil.id,
        stripe_subscription_id: sub.id,
        stripe_customer_id: String(sub.customer),
        plan,
        okres,
        status,
        stripe_status: sub.status,
        koniec_okresu: pozycja?.current_period_end
          ? new Date(pozycja.current_period_end * 1000).toISOString()
          : null,
        anuluje_sie: sub.cancel_at_period_end ?? false,
        tryb_testowy: !sub.livemode,
      },
      { onConflict: "stripe_subscription_id" }
    );

    console.log(
      error
        ? `${sub.id}: BŁĄD ${error.message}`
        : `${sub.id}: ${profil.email} → plan ${plan}/${okres}, status ${status}` +
          `${sub.livemode ? "" : " (test)"}`
    );
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
