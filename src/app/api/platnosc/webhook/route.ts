import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { klientAdmin } from "@/lib/supabase/klient-admin";
import type { Json } from "@/lib/supabase/typy-bazy";
import { czyStripeDostepny, planZCeny, statusZeStripe, stripe } from "@/lib/stripe";
import { czyMailDostepny, wyslijMail } from "@/lib/mail";
import {
  mailAnulowanieSubskrypcji,
  mailNieudanaPlatnosc,
  mailZakupJednorazowy,
  mailZakupSubskrypcja,
  type TrescMaila,
} from "@/lib/maile/tresci";
import { regulaminPdfBuffer } from "@/components/prawne/regulamin-pdf";
import { APLIKACJA } from "@/lib/prawne/dane";
import type { OkresRozliczeniowy, PlanId } from "@/lib/subscription";

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
  // Brakujące zmienne nazywamy WPROST i w odpowiedzi, nie tylko w logu.
  // Webhooka diagnozuje się z zewnątrz — z panelu Stripe'a albo `curl`em —
  // gdzie logów Vercela nie widać. Gołe 503 kazało zgadywać, której z dwóch
  // zmiennych brakuje (realnie kosztowało to jedną nieudaną płatność testową).
  const brakujace: string[] = [];
  if (!czyStripeDostepny()) brakujace.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET) brakujace.push("STRIPE_WEBHOOK_SECRET");

  if (brakujace.length > 0) {
    const opis = `Brak zmiennych środowiskowych: ${brakujace.join(", ")}.`;
    console.error(`[webhook] ${opis} Dodaj je i przebuduj wdrożenie.`);
    return NextResponse.json({ ok: false, error: opis }, { status: 503 });
  }

  const sekret = process.env.STRIPE_WEBHOOK_SECRET!;

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

/**
 * Wysyłka maila do właściciela konta — treść przychodzi gotowa z `lib/maile`.
 *
 * NIGDY nie rzuca. Webhook zdążył już nadać albo odebrać dostęp (upsert
 * `zakup`/`subskrypcja` poprzedza to wywołanie) — awaria maila nie ma prawa
 * tego cofnąć przez wywrócenie całej obsługi zdarzenia i wymuszenie ponowienia.
 *
 * `zRegulaminem` dokłada Regulamin w PDF. Dokładamy go WYŁĄCZNIE do maili
 * potwierdzających zawarcie umowy odpłatnej — art. 15 ust. 1 ustawy o prawach
 * konsumenta wymaga potwierdzenia na trwałym nośniku, i to ono domyka skutek
 * zgody na natychmiastowe świadczenie usługi (Regulamin § 8 ust. 5–7).
 * Powiadomienie o nieudanej płatności czy o rezygnacji umowy nie zawiera, więc
 * załącznik byłby tam tylko szumem.
 */
async function wyslijDoKonta(params: {
  admin: Admin;
  userId: string;
  tresc: TrescMaila;
  zRegulaminem?: boolean;
}) {
  const { admin, userId, tresc, zRegulaminem = false } = params;
  if (!czyMailDostepny()) return;

  try {
    const { data: profil } = await admin
      .from("profil")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    if (!profil?.email) return;

    const zalaczniki = zRegulaminem
      ? [{ nazwaPliku: "Regulamin-Aplikando.pdf", tresc: await regulaminPdfBuffer() }]
      : undefined;

    const wynik = await wyslijMail({ adresat: profil.email, ...tresc, zalaczniki });
    if (!wynik.ok) console.error("[webhook] mail nieudany:", wynik.blad);
  } catch (e) {
    console.error("[webhook] nie wysłano maila:", e);
  }
}

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

      // Kwota Z SESJI, nie ze stałej `CENA_JEDNORAZOWA` — potwierdzenie umowy
      // ma pokazywać to, co realnie obciążyło kartę. Gdyby cennik zmienił się
      // po zakupie, stała podałaby klientowi nieprawdziwą kwotę.
      await wyslijDoKonta({
        admin,
        userId,
        zRegulaminem: true,
        tresc: mailZakupJednorazowy({
          kwotaGrosze: sesja.amount_total ?? 0,
          zawartoUmowe: zdarzenie.created * 1000,
          linkDopasowania: `${APLIKACJA.adresWww}/app/dopasowania/${dopasowanieId}`,
        }),
      });
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
      const plan = (sub.metadata?.plan as PlanId) ?? zCeny?.plan;
      const okres = (sub.metadata?.okres as OkresRozliczeniowy) ?? zCeny?.okres;
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

      // Tylko przy ZAŁOŻENIU subskrypcji — `updated` przychodzi też przy
      // odnowieniu i zmianie planu, `deleted` przy anulowaniu; żadne z nich
      // nie jest „potwierdzeniem zamówienia".
      if (zdarzenie.type === "customer.subscription.created") {
        await wyslijDoKonta({
          admin,
          userId,
          zRegulaminem: true,
          tresc: mailZakupSubskrypcja({
            plan,
            okres,
            kwotaGrosze: pozycja?.price?.unit_amount ?? 0,
            zawartoUmowe: zdarzenie.created * 1000,
            koniecOkresu: koniec,
          }),
        });
      }

      // REZYGNACJA Z ODNOWIENIA. Interesuje nas moment PRZEŁĄCZENIA flagi,
      // nie jej wartość — `updated` przychodzi przy każdej zmianie subskrypcji
      // (odnowienie, zmiana karty, zmiana planu), a subskrypcja z ustawionym
      // `cancel_at_period_end` pozostaje w tym stanie do końca okresu. Bez
      // porównania z `previous_attributes` klient dostawałby „potwierdzamy
      // rezygnację" po każdej kolejnej zmianie na koncie.
      if (zdarzenie.type === "customer.subscription.updated") {
        const poprzednie = zdarzenie.data.previous_attributes as
          | Partial<Stripe.Subscription>
          | undefined;
        const wlasnieAnulowano =
          sub.cancel_at_period_end === true &&
          poprzednie?.cancel_at_period_end === false;

        if (wlasnieAnulowano) {
          await wyslijDoKonta({
            admin,
            userId,
            tresc: mailAnulowanieSubskrypcji({ plan, dostepDo: koniec }),
          });
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      // Regulamin § 5 ust. 7: brak zapłaty wstrzymuje dostęp z końcem
      // opłaconego okresu. Bez tego maila człowiek z wygasłą kartą traci
      // dostęp bez ostrzeżenia i dowiaduje się o tym dopiero wtedy, gdy
      // potrzebuje dopasowania.
      const faktura = zdarzenie.data.object as Stripe.Invoice;

      // Pierwsza faktura subskrypcji potrafi nie przejść zanim cokolwiek
      // aktywowaliśmy — nie ma wtedy czego stracić i nie ma o czym pisać.
      if (faktura.billing_reason === "subscription_create") break;

      const { data: konto } = await admin
        .from("profil")
        .select("id")
        .eq("stripe_customer_id", String(faktura.customer))
        .maybeSingle();
      if (!konto?.id) break;

      const { data: sub } = await admin
        .from("subskrypcja")
        .select("plan, koniec_okresu")
        .eq("user_id", konto.id)
        .maybeSingle();

      await wyslijDoKonta({
        admin,
        userId: konto.id,
        tresc: mailNieudanaPlatnosc({
          plan: (sub?.plan as PlanId | undefined) ?? null,
          kwotaGrosze: faktura.amount_due ?? null,
          dostepDo: sub?.koniec_okresu ?? null,
        }),
      });
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
