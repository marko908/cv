"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { useUzytkownik } from "@/lib/supabase/uzytkownik";
import { ZgodaMarketingowa } from "./zgoda-marketingowa";

/**
 * Sekcja „Konto" w ustawieniach: kto jest zalogowany, zgoda na informacje
 * handlowe, wylogowanie i usunięcie konta (RODO art. 17).
 *
 * Usuwanie idzie przez RPC `usun_moje_konto()` — kasuje wpis w `auth.users`,
 * a kaskada z `profil` sprząta CV, dopasowania, zakupy i liczniki. Nie kasuje
 * klienta w Stripe, bo faktury podlegają przepisom księgowym; to musi być
 * napisane w polityce prywatności, a nie ukryte.
 *
 * Potwierdzenie drugim kliknięciem jest tu MINIMUM, nie ozdobnikiem: to jedyna
 * akcja w aplikacji, której nie da się cofnąć.
 */
export function KartaKonta() {
  const router = useRouter();
  const { uzytkownik, ladowanie } = useUzytkownik();
  const [wylogowuje, setWylogowuje] = useState(false);
  const [potwierdzam, setPotwierdzam] = useState(false);
  const [kasuje, setKasuje] = useState(false);
  const [blad, setBlad] = useState("");

  if (ladowanie) {
    return <div className="h-16" aria-hidden />;
  }

  if (!uzytkownik) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            Nie jesteś zalogowany. Twoje CV są zapisane tylko w tej przeglądarce -
            konto daje do nich dostęp z każdego urządzenia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/logowanie?wroc=/app/ustawienia">Zaloguj się</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/rejestracja?wroc=/app/ustawienia">Załóż konto</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function wyloguj() {
    setWylogowuje(true);
    await klientPrzegladarka().auth.signOut();
    router.refresh();
    setWylogowuje(false);
  }

  async function usunKonto() {
    if (!potwierdzam) {
      setPotwierdzam(true);
      setTimeout(() => setPotwierdzam(false), 5000);
      return;
    }
    setKasuje(true);
    setBlad("");
    // Kasowanie idzie przez trasę serwerową, a nie RPC wprost z przeglądarki:
    // adres e-mail do potwierdzenia trzeba odczytać PRZED kaskadą, która czyści
    // `profil`. Szczegóły kolejności w `/api/konto/usun`.
    const odpowiedz = await fetch("/api/konto/usun", { method: "POST" }).catch(
      () => null
    );
    if (!odpowiedz?.ok) {
      setKasuje(false);
      setPotwierdzam(false);
      setBlad("Nie udało się usunąć konta. Spróbuj ponownie za chwilę.");
      return;
    }
    await klientPrzegladarka().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary p-4">
        <div className="flex min-w-0 items-start gap-3">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-bold">Zalogowany</p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {uzytkownik.email}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={wyloguj}
          disabled={wylogowuje}
        >
          {wylogowuje ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Wyloguj się
        </Button>
      </div>

      <ZgodaMarketingowa userId={uzytkownik.id} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary p-4">
        <div>
          <p className="text-sm font-bold">Usuń konto</p>
          <p className="mt-0.5 max-w-md text-sm text-muted-foreground">
            Kasuje konto wraz z zapisanymi CV, historią dopasowań i danymi
            rozliczeniowymi w aplikacji. Nieodwracalne.
          </p>
          {blad && <p className="mt-1.5 text-sm text-destructive">{blad}</p>}
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={usunKonto}
          disabled={kasuje}
        >
          {kasuje ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {potwierdzam ? "Na pewno? Kliknij ponownie" : "Usuń konto"}
        </Button>
      </div>
    </div>
  );
}
