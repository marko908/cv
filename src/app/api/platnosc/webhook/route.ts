import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { klientAdmin } from "@/lib/supabase/klient-admin";
import type { Json } from "@/lib/supabase/typy-bazy";
import { czyStripeDostepny, planZCeny, statusZeStripe, stripe } from "@/lib/stripe";
import { czyMailDostepny, wyslijMail } from "@/lib/mail";
import { regulaminPdfBuffer } from "@/components/prawne/regulamin-pdf";
import { APLIKACJA } from "@/lib/prawne/dane";
import { CENA_JEDNORAZOWA, OKRESY, PLANY } from "@/lib/subscription";

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
 * Mail potwierdzający zakup, z Regulaminem w PDF — checklista prawnika
 * (poz. 1) oraz art. 15 ust. 1 Ustawy o prawach konsumenta: potwierdzenie na
 * trwałym nośniku jest tym, co domyka skutek zgody na natychmiastowe
 * świadczenie usługi (Regulamin § 8 ust. 5–7). Dlatego treść wprost cytuje
 * TĘ zgodę, a nie tylko fakt zakupu — i to inaczej dla Odblokowania
 * Jednorazowego (prawo odstąpienia przepada od razu, art. 38 ust. 1 pkt 1)
 * i dla Subskrypcji (14 dni zostaje, rozliczenie proporcjonalne, art. 35).
 *
 * NIGDY nie rzuca. Webhook już nadał dostęp (upsert `zakup`/`subskrypcja`
 * poprzedza to wywołanie) — awaria maila nie ma prawa cofnąć tego przez
 * wywrócenie całej obsługi zdarzenia.
 */
async function wyslijMailPotwierdzeniaZakupu(params: {
  admin: Admin;
  userId: string;
  tytul: string;
  opisUslugi: string;
  paragrafZgody: string;
}) {
  const { admin, userId, tytul, opisUslugi, paragrafZgody } = params;
  if (!czyMailDostepny()) return;

  try {
    const { data: profil } = await admin
      .from("profil")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    if (!profil?.email) return;

    const pdf = await regulaminPdfBuffer();
    const linkAplikacji = `${APLIKACJA.adresWww}/app`;

    const wynik = await wyslijMail({
      adresat: profil.email,
      temat: `${APLIKACJA.nazwa} — potwierdzenie zamówienia: ${tytul}`,
      html: `
        <p>Cześć!</p>
        <p>Potwierdzamy: <strong>${opisUslugi}</strong>.</p>
        <p>${paragrafZgody} Aktualną treść Regulaminu znajdziesz też
        w załączniku do tej wiadomości (PDF).</p>
        <p>Przejdź do aplikacji: <a href="${linkAplikacji}">${linkAplikacji}</a></p>
        <p>Pozdrawiamy,<br>${APLIKACJA.nazwa}</p>
      `,
      text: `Cześć!\n\nPotwierdzamy: ${opisUslugi}.\n\n${paragrafZgody} Aktualną treść Regulaminu znajdziesz też w załączniku do tej wiadomości (PDF).\n\nPrzejdź do aplikacji: ${linkAplikacji}\n\nPozdrawiamy,\n${APLIKACJA.nazwa}`,
      zalaczniki: [{ nazwaPliku: "Regulamin-Aplikando.pdf", tresc: pdf }],
    });

    if (!wynik.ok) console.error("[webhook] mail potwierdzenia nieudany:", wynik.blad);
  } catch (e) {
    console.error("[webhook] nie wysłano maila potwierdzenia:", e);
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

      await wyslijMailPotwierdzeniaZakupu({
        admin,
        userId,
        tytul: `odblokowanie dopasowania (${CENA_JEDNORAZOWA} zł)`,
        opisUslugi: `Odblokowałeś/-aś pełny wynik jednego Dopasowania za ${CENA_JEDNORAZOWA} zł`,
        paragrafZgody:
          "Przy zakupie potwierdziłeś/-aś zapoznanie się z Regulaminem i Polityką " +
          "prywatności oraz wyraziłeś/-aś zgodę na rozpoczęcie świadczenia usługi " +
          "cyfrowej przed upływem terminu na odstąpienie od umowy. Zgodnie z art. 38 " +
          "ust. 1 pkt 1 ustawy o prawach konsumenta oznacza to, że po pełnym " +
          "wykonaniu usługi (czyli udostępnieniu pełnego wyniku Dopasowania) prawo " +
          "odstąpienia od tej umowy Ci nie przysługuje.",
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

      // Tylko przy ZAŁOŻENIU subskrypcji — `updated` przychodzi też przy
      // odnowieniu i zmianie planu, `deleted` przy anulowaniu; żadne z nich
      // nie jest „potwierdzeniem zamówienia".
      if (zdarzenie.type === "customer.subscription.created") {
        await wyslijMailPotwierdzeniaZakupu({
          admin,
          userId,
          tytul: `Subskrypcja ${PLANY[plan].nazwa} (${OKRESY[okres].etykieta.toLowerCase()})`,
          opisUslugi: `Aktywowaliśmy Twoją subskrypcję ${PLANY[plan].nazwa} (${OKRESY[okres].etykieta.toLowerCase()}) — ${PLANY[plan].limit} dopasowań miesięcznie`,
          paragrafZgody:
            "Przy zakupie potwierdziłeś/-aś zapoznanie się z Regulaminem i Polityką " +
            "prywatności oraz wyraziłeś/-aś zgodę na rozpoczęcie świadczenia usługi " +
            "cyfrowej przed upływem terminu na odstąpienie od umowy. Mimo to, jeśli " +
            "jesteś Konsumentem albo Przedsiębiorcą na prawach Konsumenta, masz prawo " +
            "odstąpić od tej umowy bez podania przyczyny w terminie 14 dni od jej " +
            "zawarcia — jeżeli w tym czasie korzystałeś/-aś z usługi, zwrócimy Ci " +
            "opłatę pomniejszoną proporcjonalnie do zakresu spełnionego świadczenia.",
        });
      }
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
