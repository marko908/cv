"use client";

/**
 * Baner zgód przy pierwszej wizycie.
 *
 * Wymagania, które ten komponent realizuje wprost (specyfikacja, sekcja 1):
 *   - prosty język, bez żargonu prawniczego,
 *   - nie zasłania strony — pasek przy dolnej krawędzi, treść pozostaje czytelna
 *     i przewijalna,
 *   - „Odrzuć wszystkie" stoi OBOK „Akceptuję wszystkie": ten sam rozmiar, ta
 *     sama szerokość, ten sam rząd, jedno kliknięcie. Odmowa schowana pod
 *     dodatkowym krokiem to wzorzec, który UODO uznaje za wymuszanie zgody,
 *   - baner NIE MA krzyżyka: zamknięcie bez wyboru nie może uchodzić za zgodę,
 *     a „zamykam i nic nie wybieram" to dokładnie to samo co odmowa — od tego
 *     jest przycisk „Odrzuć wszystkie",
 *   - link do Polityki prywatności.
 *
 * Baner celowo nie jest modalem — nie przechwytuje fokusu i nie blokuje strony.
 */

import Link from "next/link";

import { useZgodyCookies } from "./kontekst-zgod";
import { Button } from "@/components/ui/button";
import { SCIEZKI } from "@/lib/prawne/dane";
import { ODRZUC_WSZYSTKO, PRZYJMIJ_WSZYSTKO } from "@/lib/cookies/zgody";

export function BanerCookies() {
  const { zapisz, otworzPanel } = useZgodyCookies();

  return (
    <div
      role="region"
      aria-label="Zgoda na pliki cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card shadow-dialog"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-8 lg:py-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            Używamy plików cookies.
          </span>{" "}
          Te niezbędne działają zawsze — bez nich nie da się zalogować ani
          zapłacić. Na statystyki i reklamy potrzebujemy Twojej zgody. Możesz ją
          w każdej chwili zmienić lub wycofać. Szczegóły w{" "}
          <Link
            href={SCIEZKI.politykaPrywatnosci}
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            Polityce prywatności
          </Link>
          .
        </p>

        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Button
            size="lg"
            className="btn-label sm:w-40"
            onClick={() => zapisz(PRZYJMIJ_WSZYSTKO)}
          >
            Akceptuję wszystkie
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="btn-label sm:w-40"
            onClick={() => zapisz(ODRZUC_WSZYSTKO)}
          >
            Odrzuć wszystkie
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="btn-label sm:w-32"
            onClick={otworzPanel}
          >
            Dostosuj
          </Button>
        </div>
      </div>
    </div>
  );
}
