import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DokonczRejestracje } from "@/components/auth/dokoncz-rejestracje";
import { klientSerwer, zalogowanyUzytkownik } from "@/lib/supabase/klient-serwer";
import { maZgodeRegulaminowa } from "@/lib/prawne/zapis-zgody";
import { APLIKACJA } from "@/lib/prawne/dane";

export const metadata: Metadata = {
  title: `Dokończ rejestrację - ${APLIKACJA.nazwa}`,
  // Ekran przejściowy jednego użytkownika — nie ma czego indeksować.
  robots: { index: false, follow: false },
};

/**
 * Bramka zgody dla kont założonych przez Google (patrz komentarz w komponencie).
 *
 * Sprawdzenie stoi PO STRONIE SERWERA, nie tylko w `/auth/callback`: bez tego
 * ekran dałoby się ominąć wpisując adres docelowy wprost w pasku przeglądarki.
 * Kto ma już zgodę w dzienniku, jest stąd odsyłany — inaczej zalogowany
 * użytkownik trafiłby na prośbę o zgodę, której dawno udzielił.
 */
export default async function StronaDokonczRejestracje() {
  const user = await zalogowanyUzytkownik();
  if (!user) redirect("/logowanie");

  const supabase = await klientSerwer();
  if (await maZgodeRegulaminowa(supabase, user.id)) redirect("/app");

  return (
    // `useSearchParams` w komponencie wymaga granicy Suspense — bez niej build
    // wywala się na prerenderze tej trasy.
    <Suspense>
      <DokonczRejestracje />
    </Suspense>
  );
}
