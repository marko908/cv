import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { przygotujTresc, sformatujDate } from "@/lib/blog/utils";
import type { WpisBloga, WpisNaLiscie } from "@/lib/blog/typy";
import { TrescWpisu } from "./tresc-wpisu";
import { FaqWpisu } from "./faq-wpisu";
import { CtaBloga } from "./cta-bloga";
import { PowiazaneWpisy } from "./powiazane-wpisy";
import { Udostepnij } from "./udostepnij";
import { PostepCzytania } from "./postep-czytania";
import { SpisTresciDesktop, SpisTresciMobile } from "./spis-tresci";

/**
 * Korpus artykułu — WSPÓLNY dla `/blog/[slug]` i `/blog/podglad/[token]`.
 *
 * Wydzielony celowo: obie strony mają wyglądać identycznie, a dwie kopie tego
 * layoutu rozjechałyby się przy pierwszej zmianie (podgląd służy do oceny, jak
 * wpis wygląda NAPRAWDĘ — jeśli różni się od wersji publicznej, nie spełnia
 * swojego zadania). Różnice między trasami siedzą wyłącznie w metadanych
 * i w banerze nad treścią, nie tutaj.
 */
export function Artykul({
  wpis,
  powiazane = [],
}: {
  wpis: WpisBloga;
  powiazane?: WpisNaLiscie[];
}) {
  const { tresc, naglowki } = przygotujTresc(wpis.tresc);
  const data = wpis.opublikowano_o ?? wpis.utworzono;
  // Pokazujemy „zaktualizowano" tylko przy realnej różnicy — przy świeżym
  // wpisie obie daty dzielą sekundy i para dat wyglądałaby na błąd.
  const zmieniono =
    new Date(wpis.updated_at).getTime() - new Date(data).getTime() >
    24 * 60 * 60 * 1000;

  return (
    <>
      <PostepCzytania />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <nav
          aria-label="Ścieżka nawigacji"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">Strona główna</Link>
          <ChevronRight className="size-3" />
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{wpis.kategoria}</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="eyebrow text-primary">{wpis.kategoria}</p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {wpis.tytul}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            <time dateTime={data}>{sformatujDate(data)}</time>
            {" · "}
            {wpis.czas_czytania_min} min czytania
            {zmieniono && (
              <>
                {" · "}
                <span>
                  zaktualizowano{" "}
                  <time dateTime={wpis.updated_at}>
                    {sformatujDate(wpis.updated_at)}
                  </time>
                </span>
              </>
            )}
          </p>
        </header>

        {wpis.okladka_url && (
          <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-xl bg-secondary">
            <Image
              src={wpis.okladka_url}
              alt={wpis.okladka_alt ?? ""}
              fill
              /* Okładka jest największym elementem nad zgięciem — `priority`
                 wyklucza ją z leniwego ładowania, co bezpośrednio poprawia LCP
                 (a ten wchodzi do Core Web Vitals, czyli do rankingu). */
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10 gap-10 lg:flex">
          <div className="min-w-0 flex-1">
            <SpisTresciMobile naglowki={naglowki} />

            <article id="artykul">
              <TrescWpisu html={tresc} />
            </article>

            <FaqWpisu faq={wpis.faq} />
            <CtaBloga wariant="pelne" />

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <Udostepnij tytul={wpis.tytul} />
              {wpis.tagi.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {wpis.tagi.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <PowiazaneWpisy wpisy={powiazane} />
          </div>

          <aside className="w-64 shrink-0">
            <SpisTresciDesktop naglowki={naglowki} />
          </aside>
        </div>
      </div>
    </>
  );
}
