import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CENA_JEDNORAZOWA,
  LISTA_PLANOW,
  rabatRoczny,
  ZAKRES_BEZPLATNY,
  ZAKRES_PLATNY,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

/**
 * Cennik na landingu — czysto informacyjny (bez wyboru okresu rozliczeniowego
 * i bez logiki zakupu, ta żyje w `paywall-dialog.tsx` po zalogowaniu). Dane
 * z `subscription.ts`, JEDNEGO źródła cen — nic tu nie jest wpisane na sztywno.
 *
 * `id="cennik"` — Regulamin (§ 2 ust. 1 pkt 2) i `SCIEZKI.cennik` w
 * `lib/prawne/dane.ts` wskazują na `/#cennik`; do tej sekcji ten adres
 * wcześniej nie prowadził NIGDZIE (kotwica bez celu).
 */
export function PricingSection() {
  return (
    <section id="cennik" className="mx-auto w-full max-w-4xl scroll-mt-16 px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Cennik</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        Konto i kreator zawsze bez opłat
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-center text-muted-foreground">
        Płacisz wyłącznie za dopasowanie CV do konkretnej oferty.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {LISTA_PLANOW.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "card-surface flex flex-col p-6",
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
              albo {plan.ceny.rok} zł rocznie — {rabatRoczny(plan)}% taniej
            </p>
            <p className="mt-4 text-sm font-bold">
              {plan.limit} dopasowań / mies.
            </p>
            <Button
              asChild
              className="mt-6 w-full"
              variant={plan.polecany ? "default" : "secondary"}
            >
              <Link href="/rejestracja">Załóż konto</Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Potrzebujesz tylko jednego dopasowania?{" "}
        <span className="font-bold text-foreground">
          Odblokuj je za {CENA_JEDNORAZOWA} zł
        </span>
        , bez subskrypcji.
      </p>

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
