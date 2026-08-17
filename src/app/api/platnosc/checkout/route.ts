import { NextResponse } from "next/server";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import { klientAdmin } from "@/lib/supabase/klient-admin";
import {
  czyStripeDostepny,
  idCenyJednorazowej,
  idCenySubskrypcji,
  stripe,
} from "@/lib/stripe";
import { zapiszZgode } from "@/lib/prawne/zapis-zgody";
import type { OkresRozliczeniowy, PlanId } from "@/lib/subscription";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Rozpoczęcie płatności — zwraca adres, pod który przekierowujemy użytkownika.
 *
 * DWIE DROGI, zgodnie z modelem: subskrypcja (Start/Pro × miesiąc/rok) albo
 * jednorazowe odblokowanie JEDNEGO dopasowania.
 *
 * Czego tu świadomie NIE MA:
 *  - kwot — cena jest po stronie Stripe'a (identyfikator ceny z env). Gdyby
 *    kwota szła z żądania, klient mógłby ją sobie ustawić;
 *  - decyzji o dostępie — o tym, że użytkownik zapłacił, dowiadujemy się
 *    WYŁĄCZNIE z webhooka. Powrót z płatności to tylko przekierowanie
 *    w przeglądarce i nie jest żadnym dowodem.
 */

/**
 * DANE POTRZEBNE DO WYSTAWIENIA FAKTURY — wspólne dla obu rodzajów zakupu.
 *
 * Faktura musi zawierać imię, nazwisko i ADRES nabywcy (art. 106e ust. 1 pkt 3
 * ustawy o VAT) — również ta wystawiana konsumentowi. Bez `billing_address_collection`
 * Stripe przekazywał nam sam adres e-mail, więc Fakturownia nie miała czym
 * wypełnić dokumentu, który Regulamin § 5 ust. 4 i oba maile zakupowe obiecują
 * klientowi.
 *
 * `customer_update` NIE JEST ozdobnikiem: gdy do sesji przekazujemy istniejącego
 * `customer` (a przekazujemy zawsze, bo `stripe_customer_id` trzymamy w `profil`),
 * Stripe domyślnie NIE zapisuje zebranych danych na obiekcie klienta. Sesja by je
 * miała, obiekt klienta dalej byłby pusty — a integracja fakturowa czyta klienta.
 * To najczęstszy sposób, w jaki ta konfiguracja wygląda na działającą, a nie działa.
 *
 * `tax_id_collection` świadomie NIE MA (decyzja Marka 2026-08-17: sprzedaż B2C).
 * Gdyby doszła sprzedaż firmom, trzeba je włączyć — bez NIP-u nabywca-firma nie
 * odliczy VAT-u, a Regulamin przewiduje Usługobiorców będących Przedsiębiorcami.
 */
const DANE_DO_FAKTURY = {
  billing_address_collection: "required",
  customer_update: { address: "auto", name: "auto" },
} as const;
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
      { ok: false, error: "Zaloguj się, żeby dokonać zakupu." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe żądanie." },
      { status: 400 }
    );
  }

  const {
    rodzaj,
    plan,
    okres,
    dopasowanieId,
    zgodaRegulamin,
    zgodaOdstapienie,
    zgodaZnacznikCzasu,
  } = (body ?? {}) as {
    rodzaj?: string;
    plan?: PlanId;
    okres?: OkresRozliczeniowy;
    dopasowanieId?: string;
    zgodaRegulamin?: boolean;
    zgodaOdstapienie?: boolean;
    zgodaZnacznikCzasu?: string;
  };

  // Druga linia obrony obok `disabled` na przyciskach w paywall-dialog.tsx —
  // ktoś mógłby uderzyć w tę trasę bezpośrednio, z pominięciem checkboxów.
  // Bez zgody nr 2 (rozpoczęcie usługi przed upływem terminu na odstąpienie)
  // Odblokowanie Jednorazowe dałoby się „zwrócić" po pobraniu raportu.
  if (zgodaRegulamin !== true || zgodaOdstapienie !== true) {
    return NextResponse.json(
      { ok: false, error: "Zaznacz obie zgody, żeby kontynuować." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  try {
    // Klient Stripe'a jest własnością konta — jeden na użytkownika, żeby
    // historia płatności i panel klienta trzymały się kupy.
    const admin = klientAdmin();
    const { data: profil } = await admin
      .from("profil")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profil?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: profil?.email ?? user.email ?? undefined,
        // Po tym polu webhook odnajduje konto, nawet gdy zdarzenie nie niesie
        // naszych metadanych (np. przy zmianach robionych z panelu Stripe'a).
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profil")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    if (rodzaj === "subskrypcja") {
      if (!plan || !okres) {
        return NextResponse.json(
          { ok: false, error: "Nie wiem, który plan wykupić." },
          { status: 400 }
        );
      }

      const sesja = await stripe().checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: idCenySubskrypcji(plan, okres), quantity: 1 }],
        locale: "pl",
        ...DANE_DO_FAKTURY,
        // Metadane trafiają też do subskrypcji, bo webhook `customer.subscription.*`
        // nie widzi metadanych sesji checkoutu.
        subscription_data: { metadata: { user_id: user.id, plan, okres } },
        metadata: { user_id: user.id, plan, okres },
        success_url: `${origin}/app/ustawienia?platnosc=ok`,
        cancel_url: `${origin}/app/ustawienia?platnosc=anulowana`,
      });

      // Dziennik dowodowy zgód (art. 7 ust. 1 RODO) — nigdy nie rzuca, awaria
      // zapisu nie ma prawa zatrzymać przekierowania do płatności.
      const kontekst = `zakup_subskrypcja:${plan}:${okres}`;
      await Promise.all([
        zapiszZgode({
          klient: supabase,
          userId: user.id,
          rodzaj: "regulamin_polityka",
          kontekst,
          udzielonoO: zgodaZnacznikCzasu,
        }),
        zapiszZgode({
          klient: supabase,
          userId: user.id,
          rodzaj: "usluga_przed_odstapieniem",
          kontekst,
          udzielonoO: zgodaZnacznikCzasu,
        }),
      ]);

      return NextResponse.json({ ok: true, url: sesja.url });
    }

    if (rodzaj === "jednorazowo") {
      if (!dopasowanieId) {
        return NextResponse.json(
          { ok: false, error: "Nie wiem, które dopasowanie odblokować." },
          { status: 400 }
        );
      }

      // Dopasowanie MUSI należeć do tego użytkownika — inaczej dałoby się
      // opłacić cudzy rekord i (po stronie webhooka) nadać sobie do niego dostęp.
      const { data: dop } = await supabase
        .from("dopasowanie")
        .select("id, korzen_id")
        .eq("id", dopasowanieId)
        .maybeSingle();

      if (!dop) {
        return NextResponse.json(
          { ok: false, error: "Nie znaleziono tego dopasowania." },
          { status: 404 }
        );
      }

      // Kupujemy KORZEŃ łańcucha — dzięki temu przeliczenie po wywiadzie
      // (nowy rekord zamiast starego) nie odbiera opłaconego dostępu.
      const korzen = dop.korzen_id ?? dop.id;

      const sesja = await stripe().checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [{ price: idCenyJednorazowej(), quantity: 1 }],
        locale: "pl",
        ...DANE_DO_FAKTURY,
        payment_intent_data: {
          metadata: { user_id: user.id, dopasowanie_id: korzen },
        },
        metadata: { user_id: user.id, dopasowanie_id: korzen },
        success_url: `${origin}/app/dopasowania/${dopasowanieId}?platnosc=ok`,
        cancel_url: `${origin}/app/dopasowania/${dopasowanieId}?platnosc=anulowana`,
      });

      const kontekst = `zakup_jednorazowo:${korzen}`;
      await Promise.all([
        zapiszZgode({
          klient: supabase,
          userId: user.id,
          rodzaj: "regulamin_polityka",
          kontekst,
          udzielonoO: zgodaZnacznikCzasu,
        }),
        zapiszZgode({
          klient: supabase,
          userId: user.id,
          rodzaj: "usluga_przed_odstapieniem",
          kontekst,
          udzielonoO: zgodaZnacznikCzasu,
        }),
      ]);

      return NextResponse.json({ ok: true, url: sesja.url });
    }

    return NextResponse.json(
      { ok: false, error: "Nieznany rodzaj płatności." },
      { status: 400 }
    );
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json(
      { ok: false, error: "Nie udało się rozpocząć płatności." },
      { status: 500 }
    );
  }
}
