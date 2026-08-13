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
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        /**
         * SESJA MOŻE POWSTAĆ TYLKO W `/auth/callback` — nigdzie indziej.
         *
         * Domyślnie `detectSessionInUrl` jest WŁĄCZONE: klient przeglądarki
         * przy starcie ogląda adres strony i jeśli znajdzie w nim `?code=`,
         * sam wymienia go na sesję. Brzmi wygodnie, a jest dziurą w bramce
         * zgody (Regulamin § 4 ust. 19).
         *
         * Realny przebieg, zgłoszony przez Marka 2026-08-13: przy niepełnej
         * konfiguracji Redirect URLs w panelu Supabase powrót z Google nie
         * trafia do `/auth/callback`, tylko na Site URL — czyli na landing,
         * z kodem w adresie. Nagłówek landingu montuje `useUzytkownik`, ten
         * tworzy klienta przeglądarki, klient widzi `?code=` i po cichu
         * zakłada sesję. Użytkownik jest zalogowany, konta nie zakładał
         * przez nasz formularz, a `maZgodeRegulaminowa` nigdy się nie
         * wykonała, bo trasa callbacku w ogóle nie została odwiedzona.
         * Zgód nie widział nikt.
         *
         * Po wyłączeniu tej opcji błędna konfiguracja daje objaw WIDOCZNY
         * (logowanie po prostu się nie kończy) zamiast cichego wpuszczenia
         * kogoś do aplikacji z pominięciem oświadczenia woli. Aplikacja nic
         * na tym nie traci: hasło i kody idą przez `signInWithPassword`
         * /`verifyOtp` (żadnych parametrów w adresie), a jedyna ścieżka
         * z kodem w URL-u — Google — ma własną trasę serwerową, która i tak
         * musi wymienić kod sama, żeby zapisać ciasteczka sesji.
         */
        detectSessionInUrl: false,
      },
    }
  );
}
