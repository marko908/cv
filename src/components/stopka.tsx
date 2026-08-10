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
 * „Ustawienia cookies" stoi w tym samym rzędzie co dokumenty, bo Polityka
 * prywatności (sekcja „Pliki cookies", ust. 5) obiecuje stały dostęp do panelu
 * zgód właśnie ze stopki. To przycisk, nie odnośnik — otwiera panel na miejscu,
 * bez zmiany trasy.
 */

import Link from "next/link";
import { PrzyciskUstawienCookies } from "@/components/cookies/przycisk-ustawien-cookies";
import { APLIKACJA, FIRMA, SCIEZKI } from "@/lib/prawne/dane";

/*
 * Regulamin newslettera wrócił do stopki 2026-08-07 razem ze zgodą marketingową
 * przy rejestracji. Instrukcja prawnika (Krok III) wymaga, żeby dokument stał
 * na osobnej podstronie, a treść zgody odsyłała do niego aktywnym linkiem —
 * odnośnik w stopce daje do niego dostęp także po rejestracji, gdy checkboxa
 * już nikt nie widzi.
 */
const ODNOSNIKI = [
  // Blog stoi PRZED dokumentami prawnymi: to jedyna pozycja, którą czytelnik
  // realnie klika, a przy okazji daje wyszukiwarce link do bloga z każdej
  // podstrony serwisu (najtańsze linkowanie wewnętrzne, jakie mamy).
  { href: "/blog", etykieta: "Blog" },
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
          <PrzyciskUstawienCookies className="text-left hover:text-foreground hover:underline sm:text-right" />
        </nav>
      </div>
    </footer>
  );
}
