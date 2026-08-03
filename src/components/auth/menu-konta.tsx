"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Loader2, UserRound } from "lucide-react";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { useUzytkownik } from "@/lib/supabase/uzytkownik";
import { cn } from "@/lib/utils";

/**
 * Stan konta w interfejsie — jedno źródło zachowania dla sidebara i landingu.
 *
 * `ladowanie` obsługujemy JAWNIE, a nie przez „skoro nie ma użytkownika, to
 * pokaż zaloguj": przy pierwszym renderze sesja nie jest jeszcze znana, więc
 * zalogowanemu mignąłby przycisk „Zaloguj się". To wygląda jak wylogowanie
 * i budzi niepotrzebny niepokój.
 */

/** Wylogowanie — wspólne dla wszystkich miejsc w UI. */
function useWyloguj() {
  const router = useRouter();
  const [wTrakcie, setWTrakcie] = useState(false);

  async function wyloguj() {
    setWTrakcie(true);
    await klientPrzegladarka().auth.signOut();
    // `refresh()` przeładowuje render serwerowy — bez tego strona dalej
    // pokazywałaby stan sprzed wylogowania.
    router.refresh();
    setWTrakcie(false);
  }

  return { wyloguj, wTrakcie };
}

/**
 * Sekcja konta na dole paska bocznego: adres e-mail + wylogowanie,
 * a dla niezalogowanego — wejście do logowania.
 */
export function MenuKonta({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { uzytkownik, ladowanie } = useUzytkownik();
  const { wyloguj, wTrakcie } = useWyloguj();

  if (ladowanie) {
    // Miejsce o tej samej wysokości co docelowa treść — bez tego dolna część
    // sidebara podskakuje po sprawdzeniu sesji.
    return <div className="h-9" aria-hidden />;
  }

  if (!uzytkownik) {
    return (
      <Link
        href="/logowanie"
        title="Zaloguj się"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md py-2 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground",
          collapsed ? "justify-center px-0" : "px-3"
        )}
      >
        <LogIn className="size-4 shrink-0" />
        {!collapsed && "Zaloguj się"}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={wyloguj}
        disabled={wTrakcie}
        title={`${uzytkownik.email} — wyloguj`}
        className="flex w-full items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {wTrakcie ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <UserRound className="size-4 shrink-0 text-muted-foreground" />
      {/* min-w-0 + truncate: długi adres nie ma prawa rozepchnąć sidebara */}
      <span
        className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
        title={uzytkownik.email}
      >
        {uzytkownik.email}
      </span>
      <button
        type="button"
        onClick={wyloguj}
        disabled={wTrakcie}
        title="Wyloguj się"
        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        {wTrakcie ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
      </button>
    </div>
  );
}

/**
 * Przyciski konta w nagłówku landingu.
 *
 * Niezalogowany widzi „Zaloguj się" obok głównego CTA — część odwiedzających
 * to wracający użytkownicy, a bez tego przycisku musieliby szukać logowania
 * przez wejście do aplikacji.
 */
export function PrzyciskiKontaNaglowek() {
  const { uzytkownik, ladowanie } = useUzytkownik();
  const { wyloguj, wTrakcie } = useWyloguj();

  if (ladowanie) return <div className="h-9 w-24" aria-hidden />;

  if (!uzytkownik) {
    return (
      <>
        <Link
          href="/logowanie"
          className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          Zaloguj się
        </Link>
        <Link
          href="/app"
          className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
        >
          Otwórz aplikację
        </Link>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={wyloguj}
        disabled={wTrakcie}
        className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {wTrakcie ? "Wylogowuję…" : "Wyloguj"}
      </button>
      <Link
        href="/app"
        className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
      >
        Otwórz aplikację
      </Link>
    </>
  );
}
