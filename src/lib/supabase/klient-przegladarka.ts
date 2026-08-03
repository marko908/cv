import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./typy-bazy";

/**
 * Klient Supabase dla PRZEGLĄDARKI (komponenty „use client").
 *
 * Klucz publishable jest jawny i ma prawo być w kodzie klienta — całe
 * bezpieczeństwo stoi na RLS, nie na tajności tego klucza. Nigdy nie wolno tu
 * użyć `SUPABASE_SERVICE_ROLE_KEY`: ta rola omija RLS, więc wystawiona
 * w przeglądarce daje każdemu dostęp do CV wszystkich użytkowników.
 *
 * `createBrowserClient` sam trzyma jeden egzemplarz per karta, więc wołanie tej
 * funkcji w wielu komponentach nie tworzy wielu połączeń.
 */
export function klientPrzegladarka() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
