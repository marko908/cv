import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  FilePlus2,
  ShieldCheck,
  ScanSearch,
  ListChecks,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

const features = [
  {
    icon: ScanSearch,
    title: "Przyjazne dla ATS",
    description:
      "Struktura i formatowanie, które bezbłędnie czytają systemy rekrutacyjne.",
  },
  {
    icon: ShieldCheck,
    title: "Klauzula RODO",
    description:
      "Aktualna polska klauzula o przetwarzaniu danych — zawsze na miejscu.",
  },
  {
    icon: ListChecks,
    title: "Dziennik zmian",
    description:
      "Widzisz dokładnie, co AI zmieniło w Twoim CV i dlaczego — pełna kontrola.",
  },
  {
    icon: Languages,
    title: "Polski rynek pracy",
    description:
      "Profesjonalna polszczyzna, realia UoP i B2B. Zero amerykańskiego hype'u.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — treść świeci, UI znika w czerni */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center">
          <span className="mb-6 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-[1.4px] text-muted-foreground">
            AI pod polski rynek pracy
          </span>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Dopasuj swoje CV
            <br />
            do oferty <span className="text-primary">w 60 sekund</span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Wklej opis stanowiska lub link do ogłoszenia, a CV Copilot zoptymalizuje Twoje CV pod ofertę
            i oczekiwania rekrutera - po polsku, z zachowaniem formatowania
            i z klauzulą RODO.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-label mt-10 h-12 px-10 text-sm font-bold hover:scale-[1.04] hover:bg-primary"
          >
            <Link href="/app">Zacznij teraz</Link>
          </Button>
        </section>

        {/* Dwie ścieżki — karty jak playlisty */}
        <section className="mx-auto grid w-full max-w-4xl gap-4 px-4 pb-20 sm:grid-cols-2">
          <Link href="/app/kreator?sciezka=dopasuj" className="group">
            <div className="card-surface card-surface-hover flex h-full flex-col p-6 transition-shadow group-hover:shadow-elevated">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary">
                <FileSearch className="size-5 text-foreground transition-colors group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold">Mam już CV</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Wgraj obecne CV, wklej ofertę pracy, a AI dopasuje
                treść, słowa kluczowe i akcenty - z dziennikiem zmian.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">
                Dopasuj CV do oferty
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <Link href="/app/kreator?sciezka=nowe" className="group">
            <div className="card-surface card-surface-hover flex h-full flex-col p-6 transition-shadow group-hover:shadow-elevated">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary">
                <FilePlus2 className="size-5 text-foreground transition-colors group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold">Nie mam CV</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Podaj podstawowe dane i ofertę, na którą aplikujesz. AI ułoży
                profesjonalne CV od zera — w gotowym szablonie ATS.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">
                Stwórz CV od zera
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </section>

        {/* Cechy */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card-surface card-surface-hover p-5"
              >
                <feature.icon className="mb-3 size-5 text-primary" />
                <h3 className="text-sm font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-24 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Gotowy na rozmowę kwalifikacyjną?
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Każda oferta pracy to inne słowa kluczowe. Przestań wysyłać wszędzie
            to samo CV.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-label mt-8 h-12 px-10 text-sm font-bold hover:scale-[1.04] hover:bg-primary"
          >
            <Link href="/app">Otwórz aplikację</Link>
          </Button>
        </section>
      </main>

      <footer className="py-8">
        <p className="text-center text-xs text-muted-foreground">
          CV Copilot PL — MVP. Twoje dane nie opuszczają przeglądarki, dopóki
          nie użyjesz funkcji AI.
        </p>
      </footer>
    </div>
  );
}
