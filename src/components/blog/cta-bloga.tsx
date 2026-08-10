import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIMIT_DARMOWY } from "@/lib/subscription";

/**
 * CTA bloga — JEDNO źródło treści i adresu dla obu wariantów oraz dla skilla
 * `/blog-post` (który wstawia `blog-cta-inline` prosto w HTML artykułu).
 *
 * Adres to `/rejestracja`, nie `/app`: konto jest wymagane do korzystania
 * z aplikacji, więc kierowanie czytelnika bloga na `/app` kończyłoby się
 * przekierowaniem na logowanie — jeden krok w lejku zmarnowany.
 */
export const CTA_ADRES = "/rejestracja";
export const CTA_TEKST = "Załóż darmowe konto";

export function CtaBloga({ wariant }: { wariant: "inline" | "pelne" }) {
  if (wariant === "inline") {
    return (
      <div className="not-prose my-8 rounded-lg bg-secondary p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">
            Sprawdź, jak Twoje CV wypada przy konkretnej ofercie.
          </strong>{" "}
          Aplikando ocenia je w skali 0-100 i pokazuje, czego brakuje względem
          ogłoszenia. Pierwsze dopasowanie w miesiącu jest bezpłatne.
        </p>
        <Link
          href={CTA_ADRES}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          {CTA_TEKST}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="not-prose card-surface mt-12 p-6 sm:p-8">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
        Zobacz, jak Twoje CV wypada przy konkretnej ofercie
      </h2>
      <p className="mt-3 text-pretty text-muted-foreground">
        Wklej ogłoszenie, a Aplikando pokaże wynik dopasowania z rozbiciem na
        kryteria i podpowie, co poprawić - bez zmyślania czegokolwiek za Ciebie.
      </p>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li>Ocena CV 0-100 z jasnych kryteriów</li>
        <li>Konkretne braki względem ogłoszenia</li>
        <li>
          {LIMIT_DARMOWY} pełne dopasowanie miesięcznie za darmo, bez karty
        </li>
      </ul>
      <Button asChild size="lg" className="btn-label mt-6 font-bold">
        <Link href={CTA_ADRES}>{CTA_TEKST}</Link>
      </Button>
    </div>
  );
}
