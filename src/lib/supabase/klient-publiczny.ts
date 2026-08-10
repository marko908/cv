import { createClient } from "@supabase/supabase-js";
import type { Database } from "./typy-bazy";

/**
 * Klient do odczytu TREŚCI PUBLICZNYCH (blog) — bez sesji i bez ciasteczek.
 *
 * Czym różni się od pozostałych trzech i dlaczego istnieje:
 *  - `klient-serwer.ts` czyta `cookies()`, czyli API czasu żądania. Użyty na
 *    stronie bloga ZDEGRADOWAŁBY ją z generowanej statycznie do renderowanej
 *    przy każdym wejściu, a blog SEO ma być statyczny (ISR). Nie da się go też
 *    użyć w `sitemap.ts` ani w `generateStaticParams`, bo tam żądania nie ma.
 *  - `klient-przegladarka.ts` działa tylko w przeglądarce.
 *  - `klient-admin.ts` omija RLS i wolno go wołać WYŁĄCZNIE w webhooku Stripe'a.
 *
 * Ten klient używa klucza publishable, więc podlega RLS jak każdy inny —
 * zobaczy dokładnie tyle, ile polityka „wpis_bloga: publiczny odczyt
 * opublikowanych" pozwala anonimowi. Szkice są dla niego niewidoczne.
 *
 * `persistSession: false` jest istotne: to proces serwerowy współdzielony
 * przez wszystkie żądania, więc trzymanie w nim jakiejkolwiek sesji
 * oznaczałoby wyciek stanu między użytkownikami.
 */
export function klientPubliczny() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
