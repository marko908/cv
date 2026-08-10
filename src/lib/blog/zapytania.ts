import { klientPubliczny } from "@/lib/supabase/klient-publiczny";
import type { PozycjaFaq, WpisBloga, WpisNaLiscie } from "./typy";

/**
 * Odczyty bloga. Wszystkie idą klientem PUBLICZNYM (klucz publishable, bez
 * sesji) — nie `service_role`. Uprawnień pilnuje RLS, dokładnie tak jak
 * w reszcie aplikacji; tutaj po prostu polityka mówi „opublikowane widzą
 * wszyscy".
 *
 * Dzięki temu strony bloga nadają się do generowania statycznego i mogą być
 * odpytywane w `sitemap.ts` oraz `generateStaticParams`, gdzie nie ma żądania.
 */

/** Kolumny listy — BEZ `tresc`, patrz komentarz przy `WpisNaLiscie`. */
const KOLUMNY_LISTY =
  "id, tytul, slug, zajawka, okladka_url, okladka_alt, kategoria, czas_czytania_min, opublikowano_o";

/**
 * `faq` przychodzi z bazy jako `Json`. Zamiast rzutować na ślepo, sprawdzamy
 * kształt: uszkodzony albo ręcznie zepsuty wpis ma nie wywalić całej strony
 * artykułu, tylko stracić sekcję FAQ.
 */
function odczytajFaq(surowe: unknown): PozycjaFaq[] {
  if (!Array.isArray(surowe)) return [];
  return surowe.filter(
    (p): p is PozycjaFaq =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as PozycjaFaq).pytanie === "string" &&
      typeof (p as PozycjaFaq).odpowiedz === "string"
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any -- wiersz z bazy niesie
   `faq` jako `Json`; zawężamy go tutaj, w jednym miejscu. */
function naWpis(wiersz: any): WpisBloga {
  return { ...wiersz, faq: odczytajFaq(wiersz.faq) } as WpisBloga;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const NA_STRONE = 12;

/** Opublikowane wpisy, od najnowszych. Zwraca też `ile` — do paginacji. */
export async function pobierzOpublikowane(
  strona = 1,
  naStrone = NA_STRONE
): Promise<{ wpisy: WpisNaLiscie[]; ile: number }> {
  const od = (strona - 1) * naStrone;
  const { data, count, error } = await klientPubliczny()
    .from("wpis_bloga")
    .select(KOLUMNY_LISTY, { count: "exact" })
    .eq("status", "opublikowany")
    .order("opublikowano_o", { ascending: false })
    .range(od, od + naStrone - 1);

  if (error) {
    console.error("[blog] pobierzOpublikowane:", error.message);
    return { wpisy: [], ile: 0 };
  }
  return { wpisy: (data ?? []) as WpisNaLiscie[], ile: count ?? 0 };
}

/** Pojedynczy opublikowany wpis. `null` = 404 (obsługuje strona). */
export async function pobierzPoSlugu(slug: string): Promise<WpisBloga | null> {
  const { data, error } = await klientPubliczny()
    .from("wpis_bloga")
    .select("*")
    .eq("slug", slug)
    .eq("status", "opublikowany")
    .maybeSingle();

  if (error) {
    console.error("[blog] pobierzPoSlugu:", error.message);
    return null;
  }
  return data ? naWpis(data) : null;
}

/**
 * Wpis po tokenie podglądu — NIEZALEŻNIE od statusu.
 *
 * Idzie przez `SECURITY DEFINER` RPC, nie przez klucz serwisowy: dzięki temu
 * podgląd szkicu nie wymaga wprowadzania do kodu stron klienta omijającego
 * RLS. Długość tokenu waliduje sama funkcja w bazie.
 */
export async function pobierzPoTokenie(token: string): Promise<WpisBloga | null> {
  const { data, error } = await klientPubliczny().rpc("wpis_po_tokenie", {
    p_token: token,
  });

  if (error) {
    console.error("[blog] pobierzPoTokenie:", error.message);
    return null;
  }
  const wiersz = Array.isArray(data) ? data[0] : data;
  return wiersz ? naWpis(wiersz) : null;
}

/**
 * Powiązane wpisy: najpierw z tej samej kategorii, a gdy jest ich za mało —
 * uzupełnione najnowszymi. Pusta sekcja „Przeczytaj również" na młodym blogu
 * byłaby regułą, nie wyjątkiem, a to właśnie te linki rozprowadzają ruch.
 */
export async function pobierzPowiazane(
  slug: string,
  kategoria: string,
  limit = 3
): Promise<WpisNaLiscie[]> {
  const klient = klientPubliczny();

  const { data: zKategorii } = await klient
    .from("wpis_bloga")
    .select(KOLUMNY_LISTY)
    .eq("status", "opublikowany")
    .eq("kategoria", kategoria)
    .neq("slug", slug)
    .order("opublikowano_o", { ascending: false })
    .limit(limit);

  const wpisy = (zKategorii ?? []) as WpisNaLiscie[];
  if (wpisy.length >= limit) return wpisy;

  const juzMam = new Set([slug, ...wpisy.map((w) => w.slug)]);
  const { data: najnowsze } = await klient
    .from("wpis_bloga")
    .select(KOLUMNY_LISTY)
    .eq("status", "opublikowany")
    .order("opublikowano_o", { ascending: false })
    .limit(limit + juzMam.size);

  const uzupelnienie = ((najnowsze ?? []) as WpisNaLiscie[]).filter(
    (w) => !juzMam.has(w.slug)
  );
  return [...wpisy, ...uzupelnienie].slice(0, limit);
}

/** Slugi + daty modyfikacji — do `generateStaticParams` i sitemapy. */
export async function pobierzSlugiOpublikowanych(): Promise<
  { slug: string; updated_at: string }[]
> {
  const { data, error } = await klientPubliczny()
    .from("wpis_bloga")
    .select("slug, updated_at")
    .eq("status", "opublikowany")
    .order("opublikowano_o", { ascending: false });

  if (error) {
    console.error("[blog] pobierzSlugiOpublikowanych:", error.message);
    return [];
  }
  return data ?? [];
}
