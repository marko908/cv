import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./typy-bazy";

/**
 * Klient Supabase dla SERWERA (Server Components, Route Handlers, Server Actions).
 *
 * Działa w kontekście ZALOGOWANEGO użytkownika — czyta jego sesję z ciasteczek,
 * więc wszystkie zapytania przechodzą przez RLS. To jest domyślny klient
 * serwerowy; `klient-admin.ts` używamy wyłącznie tam, gdzie nie ma użytkownika
 * (webhook Stripe'a).
 *
 * `cookies()` jest w tej wersji Next ASYNCHRONICZNE — stąd `await` i dlatego
 * cała funkcja jest async.
 */
export async function klientSerwer() {
  const ciasteczka = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return ciasteczka.getAll();
        },
        setAll(doUstawienia) {
          try {
            for (const { name, value, options } of doUstawienia) {
              ciasteczka.set(name, value, options);
            }
          } catch {
            // Server Component nie może zapisywać ciasteczek — i nie musi.
            // Odświeżeniem sesji zajmuje się `proxy.ts`, które biegnie wcześniej
            // i ma do tego prawo. Ten catch jest celowo pusty.
          }
        },
      },
    }
  );
}

/**
 * Zalogowany użytkownik albo `null`.
 *
 * ZAWSZE przez `getUser()`, nigdy przez `getSession()` w kodzie serwerowym:
 * `getSession()` czyta ciasteczko i wierzy jego zawartości, a `getUser()`
 * weryfikuje token u Supabase. Na serwerze ta różnica decyduje o tym, czy
 * podrobione ciasteczko wpuści kogoś na cudze konto.
 */
export async function zalogowanyUzytkownik() {
  const supabase = await klientSerwer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
