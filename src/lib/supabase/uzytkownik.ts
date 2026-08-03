"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { klientPrzegladarka } from "./klient-przegladarka";

/**
 * Zalogowany użytkownik po stronie przeglądarki.
 *
 * `ladowanie` jest tu istotne, a nie kosmetyczne: przy pierwszym renderze nie
 * wiemy jeszcze, czy ktoś jest zalogowany. Bez tego stanu przycisk „Pobierz PDF"
 * mignąłby na ułamek sekundy jako „załóż konto" komuś, kto konto ma — a to
 * wygląda jak wylogowanie i budzi niepokój akurat przy pobieraniu pliku.
 *
 * Nasłuch `onAuthStateChange` jest po to, żeby po zalogowaniu w MODALU cała
 * strona wiedziała o nowej sesji bez przeładowania.
 */
export function useUzytkownik() {
  const [uzytkownik, setUzytkownik] = useState<User | null>(null);
  const [ladowanie, setLadowanie] = useState(true);

  useEffect(() => {
    const supabase = klientPrzegladarka();
    let aktywny = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!aktywny) return;
      setUzytkownik(data.user ?? null);
      setLadowanie(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_zdarzenie, sesja) => {
      if (!aktywny) return;
      setUzytkownik(sesja?.user ?? null);
      setLadowanie(false);
    });

    return () => {
      aktywny = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { uzytkownik, ladowanie };
}
