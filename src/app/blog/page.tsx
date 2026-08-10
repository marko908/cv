import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { KartaWpisu } from "@/components/blog/karta-wpisu";
import { NA_STRONE, pobierzOpublikowane } from "@/lib/blog/zapytania";
import { APLIKACJA } from "@/lib/prawne/dane";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const TYTUL = "Blog o CV i szukaniu pracy";
const OPIS =
  "Praktyczne poradniki o pisaniu CV, systemach ATS i rekrutacji na polskim rynku pracy. Konkrety, bez ogólników.";

/**
 * Metadane listy.
 *
 * PAGINACJA A DUPLICATE CONTENT: strony 2+ dostają `noindex, follow`.
 * Zawierają te same zajawki co strona 1 w innej kolejności, więc w indeksie są
 * bezwartościowe i rozcieńczają sygnały — ale `follow` zostaje, żeby Google
 * przeszedł po linkach do samych artykułów. Canonical na stronach 2+ celowo
 * NIE wskazuje strony 1 (to byłby błąd: canonical na inną treść Google
 * ignoruje), tylko na siebie.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const strona = Math.max(1, Number(page) || 1);
  const sufiks = strona > 1 ? ` - strona ${strona}` : "";

  return {
    title: `${TYTUL}${sufiks} | ${APLIKACJA.nazwa}`,
    description: OPIS,
    alternates: {
      canonical: strona > 1 ? `/blog?page=${strona}` : "/blog",
    },
    robots: strona > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${TYTUL} | ${APLIKACJA.nazwa}`,
      description: OPIS,
      url: strona > 1 ? `/blog?page=${strona}` : "/blog",
      type: "website",
    },
  };
}

export default async function StronaBloga({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const strona = Math.max(1, Number(page) || 1);
  const { wpisy, ile } = await pobierzOpublikowane(strona);
  const stron = Math.max(1, Math.ceil(ile / NA_STRONE));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <p className="eyebrow text-muted-foreground">Blog</p>
      <h1 className="mt-2 max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
        {TYTUL}
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
        {OPIS}
      </p>

      {wpisy.length === 0 ? (
        <p className="mt-16 text-muted-foreground">
          Pierwsze artykuły pojawią się tu wkrótce.
        </p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wpisy.map((w) => (
            <KartaWpisu key={w.id} wpis={w} />
          ))}
        </div>
      )}

      {stron > 1 && (
        <nav className="mt-12 flex items-center justify-between gap-4">
          <LinkStrony strona={strona - 1} aktywny={strona > 1} kierunek="wstecz" />
          <span className="text-sm text-muted-foreground">
            Strona {strona} z {stron}
          </span>
          <LinkStrony
            strona={strona + 1}
            aktywny={strona < stron}
            kierunek="dalej"
          />
        </nav>
      )}
    </div>
  );
}

function LinkStrony({
  strona,
  aktywny,
  kierunek,
}: {
  strona: number;
  aktywny: boolean;
  kierunek: "wstecz" | "dalej";
}) {
  const etykieta = kierunek === "wstecz" ? "Poprzednia" : "Następna";
  const klasa = cn(
    "inline-flex items-center gap-1.5 text-sm font-bold",
    aktywny ? "text-foreground hover:text-primary" : "pointer-events-none opacity-40"
  );

  // Nieaktywna strzałka zostaje jako `span`, nie link — kotwica prowadząca
  // donikąd jest myląca dla czytników ekranu i crawlerów.
  if (!aktywny) {
    return (
      <span className={klasa} aria-hidden>
        {kierunek === "wstecz" && <ArrowLeft className="size-4" />}
        {etykieta}
        {kierunek === "dalej" && <ArrowRight className="size-4" />}
      </span>
    );
  }

  return (
    <Link href={strona === 1 ? "/blog" : `/blog?page=${strona}`} className={klasa}>
      {kierunek === "wstecz" && <ArrowLeft className="size-4" />}
      {etykieta}
      {kierunek === "dalej" && <ArrowRight className="size-4" />}
    </Link>
  );
}
