const KROKI = [
  {
    numer: "01",
    tytul: "Dodaj CV",
    opis: "Wgraj obecne CV albo stwórz je w darmowym kreatorze.",
  },
  {
    numer: "02",
    tytul: "Wybierz ofertę",
    opis: "Wklej link do ogłoszenia albo jego treść. Reszta dzieje się automatycznie.",
  },
  {
    numer: "03",
    tytul: "Sprawdź wyniki",
    opis: "Zobacz ocenę, słowa kluczowe, dziennik zmian i przerobione CV do pobrania.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-20">
      <p className="eyebrow text-center text-muted-foreground">Jak to działa</p>
      <h2 className="mt-2 text-balance text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        Trzy kroki dzielą Cię od dopasowanego CV
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {KROKI.map((k) => (
          <div key={k.numer} className="card-surface p-6">
            <span className="eyebrow text-primary">{k.numer}</span>
            <h3 className="mt-3 text-base font-bold">{k.tytul}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {k.opis}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
