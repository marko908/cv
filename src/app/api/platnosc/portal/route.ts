import { NextResponse } from "next/server";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import { klientAdmin } from "@/lib/supabase/klient-admin";
import { czyStripeDostepny, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Panel klienta Stripe — zmiana karty, faktury, anulowanie subskrypcji.
 *
 * Dlaczego nie budujemy tego sami: anulowanie, zmiana planu i pobieranie faktur
 * to obowiązki, które muszą działać BEZBŁĘDNIE, a każdy z nich osobno wymaga
 * obsługi proporcjonalnych rozliczeń i stanów przejściowych. Panel Stripe'a robi
 * to poprawnie, po polsku i bez naszego kodu — a zmiany wracają do nas
 * webhookiem `customer.subscription.updated`, więc baza pozostaje spójna.
 *
 * Anulowanie NIE odbiera dostępu od razu: subskrypcja dostaje
 * `cancel_at_period_end`, a `czyAktywna` trzyma dostęp do końca opłaconego
 * okresu. Tak działa Stripe i tak samo musi działać aplikacja.
 */
export async function POST(request: Request) {
  if (!czyStripeDostepny()) {
    return NextResponse.json(
      { ok: false, error: "Płatności nie są jeszcze skonfigurowane." },
      { status: 503 }
    );
  }

  const supabase = await klientSerwer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Zaloguj się, żeby zarządzać subskrypcją." },
      { status: 401 }
    );
  }

  const { data: profil } = await klientAdmin()
    .from("profil")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil?.stripe_customer_id) {
    // Konto, które nigdy niczego nie kupiło, nie ma czego zarządzać.
    return NextResponse.json(
      { ok: false, error: "Nie masz jeszcze żadnych płatności." },
      { status: 400 }
    );
  }

  try {
    const sesja = await stripe().billingPortal.sessions.create({
      customer: profil.stripe_customer_id,
      locale: "pl",
      return_url: `${new URL(request.url).origin}/app/ustawienia`,
    });
    return NextResponse.json({ ok: true, url: sesja.url });
  } catch (e) {
    console.error("[portal]", e);
    return NextResponse.json(
      { ok: false, error: "Nie udało się otworzyć panelu płatności." },
      { status: 500 }
    );
  }
}
