import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // W katalogu domowym użytkownika istnieje dodatkowy package-lock.json,
  // przez co Next błędnie zgaduje root workspace'u.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    /*
     * Okładki i grafiki wpisów bloga leżą w Supabase Storage (publiczny bucket
     * `blog-obrazki`), czyli na OBCEJ domenie. `next/image` domyślnie odmawia
     * optymalizacji zewnętrznych adresów — bez tego wpisu każdy obrazek na
     * blogu kończy się błędem 400, a nie cichym pominięciem optymalizacji.
     *
     * Host bierzemy ze zmiennej środowiskowej, a nie na sztywno: ten sam kod
     * musi działać po ewentualnej migracji projektu Supabase. Wpis powstaje
     * tylko wtedy, gdy zmienna istnieje (przy jej braku i tak nic nie działa).
     */
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: "https" as const,
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
