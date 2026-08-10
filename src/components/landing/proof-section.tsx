/**
 * Sekcja „Dowód" — landing, tuż pod hero.
 *
 * Statyczny, ręcznie przygotowany przykład (decyzja Marka 2026-08-10), nie
 * żywy komponent liczący rubrykę na serwerze przy każdym wejściu na stronę.
 * Kategorie i wagi ODPOWIADAJĄ realnej rubryce w `lib/ai/scoring.ts` (RUB-DOP,
 * RUB-ATS-KW, RUB-06, RUB-07, RUB-08) — pokazujemy 5 z 9 kryteriów, stąd
 * dopisek "5 z 9 kryteriów rubryki" zamiast twierdzenia, że te liczby sumują
 * się do całego wyniku.
 *
 * Przykład „przed/po" NIE dodaje żadnej nowej liczby ani umiejętności —
 * tylko przestawia i doprecyzowuje fakty, które kandydat już podał. To
 * najważniejsze zdanie na tej stronie: pokazujemy DOWÓD zasady „AI nie pisze
 * CV", nie tylko o niej mówimy (ta zasada ma własną sekcję niżej).
 */

const KRYTERIA = [
  { etykieta: "Dopasowanie do wymagań oferty", zdobyte: 34, waga: 40 },
  { etykieta: "Słowa kluczowe pod ATS", zdobyte: 8, waga: 10 },
  { etykieta: "Osiągnięcia zamiast obowiązków", zdobyte: 10, waga: 12 },
  { etykieta: "Konkretne liczby i metryki", zdobyte: 8, waga: 10 },
  { etykieta: "Podsumowanie zawodowe", zdobyte: 7, waga: 8 },
] as const;

function PasekKryterium({
  etykieta,
  zdobyte,
  waga,
}: {
  etykieta: string;
  zdobyte: number;
  waga: number;
}) {
  const procent = Math.round((zdobyte / waga) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">{etykieta}</span>
        <span className="shrink-0 text-sm font-bold">
          {zdobyte}/{waga}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${procent}%` }}
        />
      </div>
    </div>
  );
}

export function ProofSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Dowód</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        Każde CV punktowane jest w różnych kategoriach
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-center text-muted-foreground">
          Taki sam widok zoabczysz po dopasowaniu swojego CV. 
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        {/* Wynik i rozbicie na kryteria */}
        <div className="card-surface p-6 lg:col-span-3">
          <p className="eyebrow text-muted-foreground">
            CV dopasowane do oferty: Senior Frontend Developer
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-extrabold tracking-tight text-primary">
              87
            </span>
            <span className="text-lg text-muted-foreground">/ 100</span>
            <span className="eyebrow ml-auto rounded-full bg-primary/15 px-3 py-1 text-primary">
              Bardzo dobry
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {KRYTERIA.map((k) => (
              <PasekKryterium key={k.etykieta} {...k} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            5 z 9 kryteriów rubryki — pełny raport pokazuje wszystkie, z
            uzasadnieniem przy każdym.
          </p>
        </div>

        {/* Przed / po jednego punktu CV */}
        <div className="card-surface flex flex-col p-6 lg:col-span-2">
          <p className="eyebrow text-muted-foreground">Jeden punkt CV</p>
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="eyebrow text-muted-foreground">Przed</p>
              <p className="mt-1.5 text-sm leading-relaxed">
                Odpowiadałem za rozwój strony sklepu internetowego w zespole
                frontendowym.
              </p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
              <p className="eyebrow text-primary">Po</p>
              <p className="mt-1.5 text-sm leading-relaxed">
                Rozwijałem stronę sklepu internetowego w zespole
                frontendowym, koncentrując się na optymalizacji wydajności i
                SEO - kluczowych wymaganiach z tej oferty.
              </p>
            </div>
          </div>
          <p className="mt-4 flex-1 text-xs text-muted-foreground">
            Żadna liczba ani umiejętność nie została dodana - AI tylko
            uporządkowała fakty, które już były w Twoim CV.
          </p>
        </div>
      </div>
    </section>
  );
}
