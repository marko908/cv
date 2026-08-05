"use client";

/**
 * Odnośnik „Ustawienia cookies" w stopce — otwiera panel zgód.
 *
 * Polityka prywatności (sekcja „Pliki cookies", ust. 5) OBIECUJE, że taki
 * odnośnik jest stale dostępny w stopce, a specyfikacja banera stawia to jako
 * wymóg nr 5: decyzję musi dać się zmienić w każdej chwili, a nie tylko przy
 * pierwszej wizycie.
 *
 * Osobny komponent klienta, żeby `stopka.tsx` mogła pozostać komponentem
 * serwerowym — resztę stopki renderujemy bez JS.
 */

import { useZgodyCookies } from "./kontekst-zgod";

export function PrzyciskUstawienCookies({
  className,
}: {
  className?: string;
}) {
  const { otworzPanel } = useZgodyCookies();

  return (
    <button type="button" onClick={otworzPanel} className={className}>
      Ustawienia cookies
    </button>
  );
}
