"use client";

import type { TailoredCv } from "@/lib/cv-schema";
import type { AiMeta, SavedCv, Tailoring, SectionId, TemplateId } from "@/lib/store";
import type {
  OkresRozliczeniowy,
  PlanId,
  Subscription,
  UzycieMiesieczne,
} from "@/lib/subscription";
import { BRAK_SUBSKRYPCJI, kluczMiesiaca } from "@/lib/subscription";
import { klientPrzegladarka } from "./klient-przegladarka";
import type { Json } from "./typy-bazy";

/**
 * REPOZYTORIUM — jedyne miejsce, w którym kształt bazy spotyka się z kształtem
 * store'a. Reszta aplikacji nie wie, że dane pochodzą z Postgresa.
 *
 * Store trzyma daty jako liczby (ms), baza jako `timestamptz` — konwersja
 * siedzi TYLKO tutaj. Podobnie nazwy: store jest po angielsku (`SavedCv.name`),
 * tabele po polsku (`cv.nazwa`); jedno mapowanie zamiast dwóch konwencji
 * rozlanych po komponentach.
 *
 * `tresc`, `cv_bazowe`, `cv_dopasowane` i `ai_meta` to JSONB — baza zna tylko
 * `Json`. Rzutujemy w jednym miejscu, świadomie: kontraktem tych kolumn jest
 * `TailoredCv`/`AiMeta` z `cv-schema.ts`, a pilnuje go Zod przy zapisie CV
 * (`/api/dopasuj`, import) i sam edytor, który innego kształtu nie wyprodukuje.
 */

const ms = (iso: string | null): number => (iso ? Date.parse(iso) : Date.now());
const iso = (msek: number): string => new Date(msek).toISOString();

// ---------------------------------------------------------------- CV ------

export async function pobierzCv(): Promise<SavedCv[]> {
  const { data, error } = await klientPrzegladarka()
    .from("cv")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((w) => ({
    id: w.id,
    name: w.nazwa,
    cv: w.tresc as unknown as TailoredCv,
    template: w.szablon as TemplateId,
    enabledSections: (w.sekcje ?? []) as SectionId[],
    createdAt: ms(w.utworzono),
    updatedAt: ms(w.updated_at),
  }));
}

export async function zapiszCv(userId: string, pozycje: SavedCv[]): Promise<void> {
  if (pozycje.length === 0) return;
  const { error } = await klientPrzegladarka()
    .from("cv")
    .upsert(
      pozycje.map((p) => ({
        id: p.id,
        user_id: userId,
        nazwa: p.name,
        tresc: p.cv as unknown as Json,
        szablon: p.template,
        sekcje: p.enabledSections,
        utworzono: iso(p.createdAt),
        updated_at: iso(p.updatedAt),
      })),
      { onConflict: "id" }
    );
  if (error) throw error;
}

export async function usunCv(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await klientPrzegladarka().from("cv").delete().in("id", ids);
  if (error) throw error;
}

// -------------------------------------------------------- dopasowania ----

export async function pobierzDopasowania(): Promise<Tailoring[]> {
  const { data, error } = await klientPrzegladarka()
    .from("dopasowanie")
    .select("*")
    .order("utworzono", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((w) => ({
    id: w.id,
    createdAt: ms(w.utworzono),
    jobTitle: w.tytul_oferty,
    jobUrl: w.url_oferty,
    jobText: w.tresc_oferty,
    template: w.szablon as TemplateId,
    baseCv: w.cv_bazowe as unknown as TailoredCv,
    tailoredCv: w.cv_dopasowane as unknown as TailoredCv,
    aiMeta: w.ai_meta as unknown as AiMeta,
  }));
}

export async function zapiszDopasowania(
  userId: string,
  pozycje: Tailoring[]
): Promise<void> {
  if (pozycje.length === 0) return;
  const { error } = await klientPrzegladarka()
    .from("dopasowanie")
    .upsert(
      pozycje.map((t) => ({
        id: t.id,
        user_id: userId,
        tytul_oferty: t.jobTitle,
        url_oferty: t.jobUrl,
        tresc_oferty: t.jobText,
        szablon: t.template,
        cv_bazowe: t.baseCv as unknown as Json,
        cv_dopasowane: t.tailoredCv as unknown as Json,
        ai_meta: t.aiMeta as unknown as Json,
        utworzono: iso(t.createdAt),
      })),
      { onConflict: "id" }
    );
  if (error) throw error;
}

export async function usunDopasowania(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await klientPrzegladarka()
    .from("dopasowanie")
    .delete()
    .in("id", ids);
  if (error) throw error;
}

// --------------------------------------------------------- uprawnienia ----

/**
 * Subskrypcja, jednorazowe zakupy i licznik zużycia — czytane RAZEM, bo w UI
 * i tak zawsze idą w parze (paywall pyta o jedno i drugie).
 *
 * Tych danych NIGDY nie wypychamy ze store'a do bazy: zapisuje je wyłącznie
 * webhook Stripe'a rolą `service_role`. Klient ma tu tylko odczyt (RLS).
 */
export async function pobierzUprawnienia(): Promise<{
  subscription: Subscription;
  odblokowaneDopasowania: string[];
  usage: UzycieMiesieczne;
}> {
  const supabase = klientPrzegladarka();

  const [sub, zakupy, zuzycie] = await Promise.all([
    supabase
      .from("subskrypcja")
      .select("*")
      .neq("status", "anulowana")
      .maybeSingle(),
    supabase.from("zakup").select("dopasowanie_id").eq("status", "oplacony"),
    supabase
      .from("zuzycie_miesieczne")
      .select("*")
      .eq("miesiac", kluczMiesiaca())
      .maybeSingle(),
  ]);

  const s = sub.data;
  const subscription: Subscription = s
    ? {
        status: s.status,
        plan: s.plan as PlanId,
        okres: s.okres as OkresRozliczeniowy,
        koniecOkresu: s.koniec_okresu ? Date.parse(s.koniec_okresu) : null,
        stripeCustomerId: s.stripe_customer_id ?? undefined,
        stripeSubscriptionId: s.stripe_subscription_id ?? undefined,
      }
    : BRAK_SUBSKRYPCJI;

  return {
    subscription,
    odblokowaneDopasowania: (zakupy.data ?? []).map((z) => z.dopasowanie_id),
    usage: {
      miesiac: zuzycie.data?.miesiac ?? kluczMiesiaca(),
      dopasowania: zuzycie.data?.dopasowania ?? 0,
    },
  };
}
