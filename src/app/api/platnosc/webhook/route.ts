import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { klientAdmin } from "@/lib/supabase/klient-admin";
import type { Json } from "@/lib/supabase/typy-bazy";
import { czyStripeDostepny, planZCeny, statusZeStripe, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * WEBHOOK STRIPE — jedyne miejsce, które nadaje dostęp.
 *
 * Powrót użytkownika z płatności (`success_url`) NIE jest dowodem zapłaty —
 * to zwykłe przekierowanie, które da się wpisać ręcznie w pasku adresu.
 * Dlatego `subskrypcja` i `zakup` zapisywane są WYŁĄCZNIE tutaj, rolą
 * `service_role` (klient ma do tych tabel tylko odczyt).
 *
 * IDEMPOTENCJA. Stripe dostarcza zdarzenia CO NAJMNIEJ RAZ i ponawia po każdym
 * błędzie oraz po timeoucie. Wstawienie id zdarzenia do `zdarzenie_stripe` jest
 * bramką: konflikt = już obsłużone, wychodzimy z 200 i nic nie robimy. Bez tego
 * ponowione `checkout.session.completed` zapisałoby drugi zakup za tę samą
 * płatność.
 *
 * ZASADA ODPOWIEDZI: 200 = „przyjęliśmy, nie ponawiaj". Błędy naszej bazy
 * zwracamy jako 500, żeby Stripe ponowił — ale błędy podpisu jako 400, bo
 * ponawianie czegoś, czego nie umiemy zweryfikować, nic nie da.
 */
export async function POST(request: Request) {
  if (!czyStripeDostepny()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const sekret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sekret) {
    console.error("[webhook] Brak STRIPE_WEBHOOK_SECRET.");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const podpis = request.headers.get("stripe-signature");
  if (!podpis) return NextResponse.json({ ok: false }, { status: 400 });

  // Podpis liczy się z SUROWEGO ciała — `request.json()` by je zmienił
  // i weryfikacja zawsze by padała.
  const surowe = await request.text();

  let zdarzenie: Stripe.Event;
  try {
    zdarzenie = stripe().webhooks.constructEvent(surowe, podpis, sekret);
  } catch (e) {
    console.error("[webhook] Podpis nie zgadza się:", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = klientAdmin();

  // Bramka idempotencji.
  const { error: bladWstawienia } = await admin.from("zdarzenie_stripe").insert({
    id: zdarzenie.id,
    typ: zdarzenie.type,
    tryb_testowy: !zdarzenie.livemode,
    payload: zdarzenie as unknown as Json,
  });

  if (bladWstawienia) {
    // 23505 = duplikat klucza głównego, czyli zdarzenie już obsłużone.
    if (bladWstawienia.code === "23505") {
      return NextResponse.json({ ok: true, powtorzone: true });
    }
    console.error("[webhook] Nie zapisano zdarzenia:", bladWstawienia.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    await obsluz(zdarzenie, admin);
    await admin
      .from("zdarzenie_stripe")
      .update({ przetworzono: new Date().toISOString() })
      .eq("id", zdarzenie.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const opis = e instanceof Error ? e.message : String(e);
    console.error(`[webhook] ${zdarzenie.type}:`, opis);
    await admin
      .from("zdarzenie_stripe")
      .update({ blad: opis })
      .eq("id", zdarzenie.id);
    // 500 → Stripe ponowi. Wpis w tabeli już jest, więc ponowienie trafi
    // w bramkę idempotencji; ślad błędu zostaje do diagnozy.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

type Admin = ReturnType<typeof klientAdmin>;

async function obsluz(zdarzenie: Stripe.Event, admin: Admin) {
  switch (zdarzenie.type) {
    case "checkout.session.completed": {
      // Obiekt zdarzenia siedzi w `data.object` — `zdarzenie.object` to literalny
      // string „event" i rzutowanie go dawałoby ciche `undefined` w każdym polu.
      const sesja = zdarzenie.data.object as Stripe.Checkout.Session;
      // Subskrypcje obsługujemy zdarzeniami `customer.subscription.*` — one
      // przychodzą też przy odnowieniu i anulowaniu, więc jedno miejsce zamiast
      // dwóch rozjeżdżających się ścieżek.
      if (sesja.mode !== "payment") break;
      if (sesja.payment_status !== "paid") break;

      const userId = sesja.metadata?.user_id;
      const dopasowanieId = sesja.metadata?.dopasowanie_id;
      if (!userId || !dopasowanieId) {
        throw new Error("Płatność bez metadanych user_id/dopasowanie_id.");
      }

      const { error } = await admin.from("zakup").upsert(
        {
          user_id: userId,
          dopasowanie_id: dopasowanieId,
          stripe_payment_intent_id: String(sesja.payment_intent),
          kwota_grosze: sesja.amount_total ?? 0,
          waluta: sesja.currency ?? "pln",
          status: "oplacony",
          metoda: sesja.payment_method_types?.[0] ?? null,
          tryb_testowy: !zdarzenie.livemode,
        },
        { onConflict: "stripe_payment_intent_id" }
      );
      if (error) throw new Error(error.message);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = zdarzenie.data.object as Stripe.Subscription;

      const status = statusZeStripe(sub.status);
      // Statusy sprzed pierwszej udanej płatności (`incomplete`) pomijamy —
      // nikt jeszcze nie zapłacił, więc nie ma czego zapisywać.
      if (!status) break;

      const userId = sub.metadata?.user_id ?? (await userIdZKlienta(sub, admin));
      if (!userId) throw new Error("Subskrypcja bez powiązania z kontem.");

      const pozycja = sub.items.data[0];
      const zCeny = pozycja?.price?.id ? planZCeny(pozycja.price.id) : null;
      const plan = (sub.metadata?.plan as "start" | "pro") ?? zCeny?.plan;
      const okres = (sub.metadata?.okres as "miesiac" | "rok") ?? zCeny?.okres;
      if (!plan || !okres) {
        throw new Error(`Nie rozpoznaję ceny ${pozycja?.price?.id ?? "?"}.`);
      }

      // Koniec opłaconego okresu = do kiedy dostęp obowiązuje mimo `past_due`
      // czy `canceled`. Pole siedzi na pozycji subskrypcji.
      const koniec = pozycja?.current_period_end
        ? new Date(pozycja.current_period_end * 1000).toISOString()
        : null;

      const { error } = await admin.from("subskrypcja").upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: String(sub.customer),
          plan,
          okres,
          status: zdarzenie.type === "customer.subscription.deleted" ? "anulowana" : status,
          stripe_status: sub.status,
          koniec_okresu: koniec,
          anuluje_sie: sub.cancel_at_period_end ?? false,
          tryb_testowy: !zdarzenie.livemode,
        },
        { onConflict: "stripe_subscription_id" }
      );
      if (error) throw new Error(error.message);
      break;
    }

    default:
      // Reszta zdarzeń nas nie dotyczy — zapisaliśmy je w logu i tyle.
      break;
  }
}

/**
 * Awaryjne odnalezienie konta po kliencie Stripe'a.
 *
 * Subskrypcja założona albo zmieniona z panelu Stripe'a nie ma naszych
 * metadanych. `profil.stripe_customer_id` jest wtedy jedynym powiązaniem.
 */
async function userIdZKlienta(
  sub: Stripe.Subscription,
  admin: Admin
): Promise<string | null> {
  const { data } = await admin
    .from("profil")
    .select("id")
    .eq("stripe_customer_id", String(sub.customer))
    .maybeSingle();
  return data?.id ?? null;
}
