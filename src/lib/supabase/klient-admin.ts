import { createClient } from "@supabase/supabase-js";
import type { Database } from "./typy-bazy";

/**
 * Klient z rolą `service_role` — OMIJA RLS.
 *
 * Wolno go użyć TYLKO tam, gdzie nie ma zalogowanego użytkownika, a mimo to
 * trzeba zapisać dane: webhook Stripe'a (`subskrypcja`, `zakup`,
 * `zdarzenie_stripe`). Wszędzie indziej używamy `klient-serwer.ts`, żeby
 * zapytania przechodziły przez RLS.
 *
 * Dlaczego to jest niebezpieczne: ten klient może czytać i pisać CV każdego
 * użytkownika. Jedna pomyłka — import w komponencie „use client" — i klucz
 * ląduje w paczce JS wysyłanej do przeglądarki. Stąd twarda blokada niżej:
 * lepiej wywalić się na starcie niż wyciec po cichu.
 */
export function klientAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "klientAdmin() użyty w przeglądarce. Ten klient omija RLS i wolno go " +
        "wołać wyłącznie po stronie serwera."
    );
  }

  const klucz = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!klucz) throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY.");

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, klucz, {
    // Bez sesji i bez odświeżania tokenu — to nie jest klient użytkownika,
    // tylko jednorazowe połączenie serwisowe.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
