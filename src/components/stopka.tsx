/**
 * Stopka z odnośnikami do dokumentów prawnych.
 *
 * Checklista wdrożeniowa prawnika (poz. 1 i 4) wymaga, żeby regulamin
 * i polityka prywatności były dostępne z każdego miejsca, w którym użytkownik
 * może zawrzeć umowę — dlatego stopka stoi na landingu i na wszystkich
 * podstronach z dokumentami.
 *
 * Dane firmy pochodzą z `lib/prawne/dane.ts` — instrukcja prawnika wymaga,
 * żeby oznaczenie przedsiębiorcy w stopce było IDENTYCZNE z tym w regulaminie
 * i polityce prywatności.
 *
 * ⚠️ DO DODANIA RAZEM Z BANEREM COOKIES: przycisk „Ustawienia cookies"
 * otwierający panel zgód. Polityka prywatności (sekcja „Pliki cookies", ust. 5)
 * obiecuje, że taki odnośnik jest stale dostępny w stopce — dopóki banera nie
 * ma, nie ma też tego przycisku i obie rzeczy muszą trafić na produkcję razem.
 * Szczegóły: `dokumenty-prawne/specyfikacja-baner-cookies.md`.
 */

import Link from "next/link";
import { APLIKACJA, FIRMA, SCIEZKI } from "@/lib/prawne/dane";

const ODNOSNIKI = [
  { href: SCIEZKI.regulamin, etykieta: "Regulamin" },
  { href: SCIEZKI.politykaPrywatnosci, etykieta: "Polityka prywatności" },
  { href: SCIEZKI.regulaminNewslettera, etykieta: "Regulamin newslettera" },
] as const;

export function Stopka() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">{APLIKACJA.nazwa}</p>
          <p className="mt-1">{FIRMA.nazwa}</p>
          <p>
            {FIRMA.ulica}, {FIRMA.kodMiasto}
          </p>
          <p>
            NIP {FIRMA.nip} · REGON {FIRMA.regon}
          </p>
          <p className="mt-1">
            <a
              href={`mailto:${FIRMA.email}`}
              className="hover:text-foreground hover:underline"
            >
              {FIRMA.email}
            </a>
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-xs text-muted-foreground sm:items-end">
          {ODNOSNIKI.map(({ href, etykieta }) => (
            <Link key={href} href={href} className="hover:text-foreground hover:underline">
              {etykieta}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
