import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LIMIT_DARMOWY,
  LISTA_PLANOW,
  rabatRoczny,
  ZAKRES_BEZPLATNY,
  ZAKRES_PLATNY,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

/**
 * Cennik na landingu - czysto informacyjny (bez wyboru okresu rozliczeniowego
 * i bez logiki zakupu, ta żyje w `paywall-dialog.tsx` po zalogowaniu). Dane
 * z `subscription.ts`, JEDNEGO źródła cen - nic tu nie jest wpisane na sztywno.
 *
 * `id="cennik"` - Regulamin (§ 2 ust. 1 pkt 2) i `SCIEZKI.cennik` w
 * `lib/prawne/dane.ts` wskazują na `/#cennik`; do tej sekcji ten adres
 * wcześniej nie prowadził NIGDZIE (kotwica bez celu).
 *
 * Karta „Darmowy" NIE pochodzi z `LISTA_PLANOW` - to lista PŁATNYCH planów,
 * używana też przez `paywall-dialog.tsx` do renderowania przycisków zakupu;
 * pokazanie tam przycisku „kup" przy planie za 0 zł nie miałoby sensu.
 * Limit darmowego dopasowania (`LIMIT_DARMOWY`) i mechanizm przyznawania go
 * opisane są przy stałej w `subscription.ts`.
 *
 * Karty mają CELOWO różne wysokości (Marek 2026-08-10: pierwsza najniższa,
 * druga najwyższa, trzecia pośrednia) - `items-center` na siatce (nie
 * domyślny `stretch`), więc grid nie wyrównuje ich do najwyższej, tylko
 * centruje każdą względem wspólnej poziomej osi wiersza (górne krawędzie
 * NIE są równe - to zamierzone, środki są). Przyciski mimo to lądują w tej
 * samej odległości od DOLNEJ KRAWĘDZI KAŻDEJ karty (`mt-auto` w kolumnie
 * flex + jednakowy `p-6` na wszystkich kartach).
 */
const WYSOKOSC_KARTY = [
  "sm:min-h-[420px]",
  "sm:min-h-[500px]",
  "sm:min-h-[460px]",
] as const;

const KORZYSCI_DARMOWY = [
  `${LIMIT_DARMOWY} w pełni odblokowane dopasowanie / mies.`,
  "Wszystkie 9 szablonów CV",
  "Bez karty płatniczej",
] as const;

const KORZYSCI_PLANU: Record<string, readonly string[]> = {
  start: [
    "30 dopasowań / mies.",
    "Pełny raport i wywiad uzupełniający",
    "Dla aktywnie szukających pracy",
  ],
  pro: [
    "100 dopasowań / mies.",
    "Najniższa cena za jedno dopasowanie",
    "Dla aplikujących seryjnie",
  ],
};

function Korzysci({ pozycje }: { pozycje: readonly string[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {pozycje.map((p) => (
        <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          {p}
        </li>
      ))}
    </ul>
  );
}

export function PricingSection() {
  return (
    <section id="cennik" className="mx-auto w-full max-w-5xl scroll-mt-16 px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Cennik</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        Zacznij za darmo, płać dopiero gdy potrzebujesz więcej
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-center text-muted-foreground">
        Konto, kreator i pierwsze dopasowanie w miesiącu - bez opłat.
      </p>

      <div className="mt-10 grid items-center gap-4 sm:grid-cols-3">
        <div
          className={cn(
            "card-surface flex flex-col p-6",
            WYSOKOSC_KARTY[0]
          )}
        >
          <h3 className="text-lg font-bold">Darmowy</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Wypróbuj pełne dopasowanie, zanim zapłacisz.
          </p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight">0 zł</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">na zawsze</p>
          <Korzysci pozycje={KORZYSCI_DARMOWY} />
          <Button asChild className="mt-auto w-full" variant="secondary">
            <Link href="/rejestracja">Załóż konto</Link>
          </Button>
        </div>

        {LISTA_PLANOW.map((plan, i) => (
          <div
            key={plan.id}
            className={cn(
              "card-surface flex flex-col p-6",
              WYSOKOSC_KARTY[i + 1],
              plan.polecany && "ring-1 ring-primary"
            )}
          >
            {plan.polecany && (
              <span className="eyebrow mb-3 w-fit rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
                Najlepszy stosunek ceny
              </span>
            )}
            <h3 className="text-lg font-bold">{plan.nazwa}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.opis}</p>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight">
                {plan.ceny.miesiac} zł
              </span>
              <span className="text-sm text-muted-foreground">/ mies.</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              albo {plan.ceny.rok} zł rocznie - {rabatRoczny(plan)}% taniej
            </p>
            <Korzysci pozycje={KORZYSCI_PLANU[plan.id] ?? []} />
            <Button
              asChild
              className="mt-auto w-full"
              variant={plan.polecany ? "default" : "secondary"}
            >
              <Link href="/rejestracja">Załóż konto</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="eyebrow text-muted-foreground">Bezpłatnie</p>
          <ul className="mt-3 flex flex-col gap-2">
            {ZAKRES_BEZPLATNY.map((z) => (
              <li key={z} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {z}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-muted-foreground">Płatne (Dopasowanie)</p>
          <ul className="mt-3 flex flex-col gap-2">
            {ZAKRES_PLATNY.map((z) => (
              <li key={z} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {z}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
