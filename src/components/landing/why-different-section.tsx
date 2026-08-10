import { ShieldCheck, FileSearch, Gauge } from "lucide-react";

/**
 * Gwarancje po ludzku, nie po inżyniersku (Marek 2026-08-10): poprzednia
 * wersja opisywała walidator i podłogę wyniku od strony implementacji
 * ("kod sprawdza...", "gdyby wypadło gorzej, wracamy do oryginału") -
 * brzmiało to jak przyznanie się, że model czasem psuje CV, a nie jak
 * korzyść. Teraz każda karta mówi o REZULTACIE dla klienta, nie o mechanizmie
 * bezpieczeństwa za nim.
 */
const GWARANCJE = [
  {
    icon: FileSearch,
    tytul: "Rejestr faktów z Twojego CV",
    opis: "Zanim cokolwiek napisze, AI dostaje wyłącznie fakty, które sam podałeś - firmy, stanowiska, liczby, umiejętności.",
  },
  {
    icon: ShieldCheck,
    tytul: "Zero zmyślonych faktów",
    opis: "Przerobione CV zawiera wyłącznie prawdziwe firmy, stanowiska, liczby i umiejętności - nic, czego nie napisałeś sam.",
  },
  {
    icon: Gauge,
    tytul: "Ocena z jasnych kryteriów",
    opis: "Wynik liczony jest za każdym razem z tej samej, przejrzystej rubryki - nie z ogólnego wrażenia modelu.",
  },
] as const;

export function WhyDifferentSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-muted-foreground">Dlaczego my?</p>
          <h2 className="mt-2 text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            AI nie wymyśla Twojego CV
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Większość narzędzi „AI do CV” generuje treść od zera - bardzo prawdopodobne,
            że dopisze umiejętność, której nie masz, albo liczbę, która jest nieprawdziwa. 
            Aplikando działa odwrotnie: AI wybiera, porządkuje
            i przeformułowuje Twoje własne dane. Nigdy ich nie wymyśla.
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
