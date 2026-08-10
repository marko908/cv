import Image from "next/image";
import Link from "next/link";
import { sformatujDate } from "@/lib/blog/utils";
import type { WpisNaLiscie } from "@/lib/blog/typy";

/** Kafelek wpisu na liście `/blog` i w „Powiązanych". */
export function KartaWpisu({ wpis }: { wpis: WpisNaLiscie }) {
  return (
    <Link href={`/blog/${wpis.slug}`} className="group flex flex-col">
      <div className="card-surface card-surface-hover flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-elevated">
        <div className="relative aspect-[16/9] bg-secondary">
          {wpis.okladka_url ? (
            <Image
              src={wpis.okladka_url}
              alt={wpis.okladka_alt ?? ""}
              fill
              /* Lista jest siatką 1/2/3 kolumn - bez `sizes` Next zakłada pełną
                 szerokość ekranu i serwuje na telefon obrazek ~3x za duży. */
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="eyebrow text-primary">{wpis.kategoria}</p>
          <h2 className="mt-2 text-balance text-base font-bold leading-snug">
            {wpis.tytul}
          </h2>
          {wpis.zajawka && (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {wpis.zajawka}
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            {wpis.opublikowano_o && (
              <>
                <time dateTime={wpis.opublikowano_o}>
                  {sformatujDate(wpis.opublikowano_o)}
                </time>
                {" · "}
              </>
            )}
            {wpis.czas_czytania_min} min czytania
          </p>
        </div>
      </div>
    </Link>
  );
}
