import { ShieldCheck, FileSearch, TrendingUp } from "lucide-react";

const GWARANCJE = [
  {
    icon: FileSearch,
    tytul: "Rejestr faktów z Twojego CV",
    opis: "Zanim cokolwiek napisze, AI dostaje wyłącznie fakty, które sam podałeś — firmy, stanowiska, liczby, umiejętności.",
  },
  {
    icon: ShieldCheck,
    tytul: "Walidator odrzuca zmyślone dane",
    opis: "To nie prośba w prompcie — kod sprawdza każdy wygenerowany fragment i cofa wszystko, czego nie ma w Twoim CV.",
  },
  {
    icon: TrendingUp,
    tytul: "Wynik nigdy nie spada",
    opis: "Jeśli dopasowanie mimo wszystko wypadłoby gorzej niż oryginał, wracamy do CV wejściowego. Najgorszy możliwy rezultat to brak zmiany.",
  },
] as const;

export function WhyDifferentSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-muted-foreground">Dlaczego to inne</p>
          <h2 className="mt-2 text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            AI nie wymyśla Twojego CV
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Większość narzędzi „AI do CV” generuje treść od zera — z ryzykiem,
            że dopisze umiejętność, której nie masz, albo liczbę, której nikt
            nie zweryfikuje. Aplikando działa odwrotnie: AI wybiera, porządkuje
            i przeformułowuje Twoje własne fakty. Nigdy ich nie dodaje.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {GWARANCJE.map((g) => (
            <div key={g.tytul} className="card-surface flex gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <g.icon className="size-5 text-primary" />
              </span>
              <div>
                <h3 className="text-sm font-bold">{g.tytul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {g.opis}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
