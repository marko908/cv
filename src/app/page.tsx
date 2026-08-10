import type { Metadata } from "next";
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
import { Stopka } from "@/components/stopka";
import { CvTemplateMarquee } from "@/components/cv-template-marquee";
import { ProofSection } from "@/components/landing/proof-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { WhyDifferentSection } from "@/components/landing/why-different-section";
import { TemplateShowcaseSection } from "@/components/landing/template-showcase-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import {
  schemaAplikacji,
  schemaFaqLandingu,
  schemaOrganizacji,
  schemaWitryny,
} from "@/lib/schema-strony";

/**
 * Canonical stoi TUTAJ, a nie w `layout.tsx`. Metadane w Next są dziedziczone,
 * więc `alternates.canonical` w korzeniu przypisałby adres strony głównej
 * KAŻDEJ podstronie, która go nie nadpisuje — czyli powiedziałby Google, że
 * blog i dokumenty prawne to duplikaty landingu.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
      "Aktualna polska klauzula o przetwarzaniu danych - zawsze na miejscu.",
  },
  {
    icon: ListChecks,
    title: "Dziennik zmian",
    description:
      "Widzisz dokładnie, co AI zmieniło w Twoim CV i dlaczego - masz pełną kontrolę.",
  },
  {
    icon: Languages,
    title: "Polski rynek pracy",
    description:
      "Pełne dostosowanie do języka polskiego i polskiego rybku pracy.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/*
        Dane strukturalne. Osobne tagi zamiast jednego `@graph` — ta sama
        decyzja co na blogu: przy błędzie Search Console wskazuje KONKRETNY
        schemat. Encje spina `@id`, więc wyszukiwarka i tak widzi jedną
        organizację, a nie cztery luźne bloki.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganizacji()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWitryny()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAplikacji()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaqLandingu()) }}
      />

      <SiteHeader />

      <main className="flex-1">
        {/* Hero — treść świeci, UI znika w czerni. Karuzela w tle jest CAŁEJ
            SZEROKOŚCI (poza max-w-4xl treści), dlatego mieszka w osobnym,
            nieograniczonym `section`, a treść stoi w wewnętrznym,
            wyśrodkowanym kontenerze nad nią (`relative z-10`). */}
        <section className="relative overflow-hidden">
          <CvTemplateMarquee />
          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center">
            <span className="mb-6 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-[1.4px] text-muted-foreground">
              AI pod polski rynek pracy
            </span>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Dopasuj swoje CV
              <br />
              do oferty <span className="text-primary">w 60 sekund</span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Wklej opis stanowiska lub link do ogłoszenia, a Aplikando zoptymalizuje Twoje CV pod ofertę
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
          </div>
        </section>

        <ProofSection />
        <HowItWorksSection />
        <WhyDifferentSection />

        {/* Dwie ścieżki — karty jak playlisty */}
        <section className="mx-auto grid w-full max-w-4xl gap-4 px-4 pb-20 sm:grid-cols-2">
          <Link href="/app/kreator" className="group">
            <div className="card-surface card-surface-hover flex h-full flex-col p-6 transition-shadow group-hover:shadow-elevated">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary">
                <FileSearch className="size-5 text-foreground transition-colors group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold">Mam już CV</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Wgraj obecne CV i wklej ofertę pracy, a AI dopasuje
                treść, słowa kluczowe i dane.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">
                Dopasuj CV do oferty
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <Link href="/app/kreator" className="group">
            <div className="card-surface card-surface-hover flex h-full flex-col p-6 transition-shadow group-hover:shadow-elevated">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary">
                <FilePlus2 className="size-5 text-foreground transition-colors group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold">Nie mam CV</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Podaj podstawowe dane i wklej ofertę, na którą chcesz aplikować. AI ułoży
                profesjonalne CV od zera w wybranym przez Ciebie szablonie.
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

        <TemplateShowcaseSection />
        <PricingSection />
        <FaqSection />

        {/* CTA */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-24 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Gotowy na nową pracę?
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Każda oferta pracy to inne słowa kluczowe. Przestań wysyłać wszędzie
            to samo CV.
          </p>
        </section>
      </main>

      {/*
        Poprzednia stopka głosiła: „Twoje dane nie opuszczają przeglądarki,
        dopóki nie użyjesz funkcji AI". Po przejściu na Supabase (2026-08-02)
        to nieprawda — CV zapisane na koncie idzie do bazy przy każdej zmianie.
        Zdanie o zakresie przetwarzania danych na stronie sprzedażowej to
        informacja handlowa; niezgodne z Polityką prywatności byłoby ryzykiem
        wprowadzenia konsumenta w błąd. Prawdziwy opis stoi teraz w Polityce.
      */}
      <Stopka />
    </div>
  );
}
