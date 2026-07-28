"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { TemplateId } from "@/lib/store";
import { TemplateThumb } from "@/components/template-thumb";
import { demoCv } from "@/lib/demo-cv";
import {
  TEMPLATE_CATEGORIES,
  templatesByTag,
  type CvTemplate,
} from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

/**
 * Galeria szablonów: jeden WIERSZ na kategorię, przewijany w bok strzałkami.
 * W pionie przeglądasz kategorie, w poziomie szablony w obrębie kategorii.
 *
 * Trzy rzeczy pilnowane celowo:
 *  1. ZAWSZE widać kawałek następnej karty — szerokość karty liczymy z szerokości
 *     wiersza tak, by mieściło się N pełnych kart + wystający fragment kolejnej.
 *     Bez tego przy „równym" ekranie użytkownik nie wie, że w bok jest coś dalej.
 *  2. ZAWSZE widać kawałek następnej kategorii — wysokość obszaru przewijania
 *     docinamy tak, żeby dolna krawędź wypadła WEWNĄTRZ kolejnego wiersza.
 *  3. Podglądy są wyrównane i wypełnione — wszystkie miniatury mają proporcje
 *     A4 i te same dane (`demoCv`), które wypełniają całą stronę.
 *
 * Kategorie i przypisanie szablonów pochodzą z tagów w `cv-templates.ts` —
 * ten komponent nie zna konkretnych szablonów.
 */

/**
 * Szerokość karty jako UŁAMEK szerokości wiersza — „n pełnych kart + 0,32
 * kolejnej". Liczy to CSS (`calc` na `100%` kontenera przewijania), więc podgląd
 * następnej karty jest gwarantowany niezależnie od szerokości ekranu i odporny
 * na skalowanie okna dialogowego (pomiar w JS się przy nim rozjeżdżał).
 */
const SZEROKOSC_KARTY =
  "w-[calc((100%-12px)/1.32)] sm:w-[calc((100%-24px)/2.32)] lg:w-[calc((100%-36px)/3.32)]";
/** Ile pikseli kolejnej kategorii musi być widoczne na dole. */
const PODGLAD_KATEGORII = 56;
const ODSTEP = 12; // gap-3

export function TemplateGallery({
  selected,
  onSelect,
  className,
}: {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [wysokosc, setWysokosc] = useState<number | undefined>();

  // Docinamy wysokość tak, by dolna krawędź wypadła w środku kolejnego wiersza.
  // Dzięki temu użytkownik zawsze widzi, że pod spodem jest jeszcze kategoria.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const przelicz = () => {
      const dostepna = el.parentElement?.clientHeight ?? 0;
      if (!dostepna) return;
      const sekcje = [...el.querySelectorAll<HTMLElement>("[data-kategoria]")];
      if (sekcje.length < 2) {
        setWysokosc(undefined);
        return;
      }
      const gora = el.getBoundingClientRect().top;
      // Szukamy pierwszej sekcji, której początek wypada poniżej dostępnej
      // wysokości — obcinamy tuż ZA jej górną krawędzią.
      for (const s of sekcje.slice(1)) {
        const poczatek = s.getBoundingClientRect().top - gora;
        if (poczatek > dostepna - PODGLAD_KATEGORII) {
          setWysokosc(Math.max(240, poczatek + PODGLAD_KATEGORII));
          return;
        }
      }
      setWysokosc(undefined); // wszystko się mieści — nie ma czego zapowiadać
    };

    przelicz();
    const ro = new ResizeObserver(przelicz);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      style={wysokosc ? { maxHeight: wysokosc } : undefined}
      className={cn("flex flex-col gap-6 overflow-y-auto", className)}
    >
      {TEMPLATE_CATEGORIES.map((kat) => {
        const szablony = templatesByTag(kat.tag);
        if (szablony.length === 0) return null;
        return (
          <WierszKategorii
            key={kat.tag}
            label={kat.label}
            opis={kat.opis}
            szablony={szablony}
            selected={selected}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

function WierszKategorii({
  label,
  opis,
  szablony,
  selected,
  onSelect,
}: {
  label: string;
  opis: string;
  szablony: CvTemplate[];
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  const pasRef = useRef<HTMLDivElement>(null);
  const [wLewo, setWLewo] = useState(false);
  const [wPrawo, setWPrawo] = useState(false);

  const odswiezStrzalki = useCallback(() => {
    const el = pasRef.current;
    if (!el) return;
    setWLewo(el.scrollLeft > 4);
    setWPrawo(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = pasRef.current;
    if (!el) return;
    odswiezStrzalki();
    const ro = new ResizeObserver(odswiezStrzalki);
    ro.observe(el);
    return () => ro.disconnect();
  }, [odswiezStrzalki]);

  const przewin = (kierunek: 1 | -1) => {
    const el = pasRef.current;
    if (!el) return;
    // Przewijamy o ~80% widocznego obszaru — zawsze ląduje na kolejnych kartach.
    el.scrollBy({ left: kierunek * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section data-kategoria className="min-w-0">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h4 className="text-sm font-bold">{label}</h4>
        <span className="eyebrow shrink-0 text-muted-foreground">
          {szablony.length}
        </span>
      </div>
      <p className="mt-0.5 px-1 text-xs text-muted-foreground">{opis}</p>

      <div className="relative mt-3">
        <div
          ref={pasRef}
          onScroll={odswiezStrzalki}
          className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {szablony.map((t) => (
            <KartaSzablonu
              key={t.id}
              szablon={t}
              wybrany={selected === t.id}
              onSelect={onSelect}
            />
          ))}
        </div>

        <StrzalkaPrzewijania
          kierunek="lewo"
          widoczna={wLewo}
          onClick={() => przewin(-1)}
        />
        <StrzalkaPrzewijania
          kierunek="prawo"
          widoczna={wPrawo}
          onClick={() => przewin(1)}
        />
      </div>
    </section>
  );
}

function StrzalkaPrzewijania({
  kierunek,
  widoczna,
  onClick,
}: {
  kierunek: "lewo" | "prawo";
  widoczna: boolean;
  onClick: () => void;
}) {
  if (!widoczna) return null;
  const Ikona = kierunek === "lewo" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={kierunek === "lewo" ? "Poprzednie szablony" : "Kolejne szablony"}
      className={cn(
        "absolute top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-elevated backdrop-blur transition-colors hover:bg-accent",
        kierunek === "lewo" ? "-left-1" : "-right-1"
      )}
    >
      <Ikona className="size-4" />
    </button>
  );
}

function KartaSzablonu({
  szablon: t,
  wybrany,
  onSelect,
}: {
  szablon: CvTemplate;
  wybrany: boolean;
  onSelect: (id: TemplateId) => void;
}) {
  // Szerokość karty ustala CSS, więc miniaturę skalujemy do realnie zmierzonej
  // szerokości wnętrza — dzięki temu podgląd zawsze wypełnia kartę co do piksela.
  const wnetrzeRef = useRef<HTMLDivElement>(null);
  const [szerMiniatury, setSzerMiniatury] = useState(0);

  useLayoutEffect(() => {
    const el = wnetrzeRef.current;
    if (!el) return;
    const zmierz = () => setSzerMiniatury(el.clientWidth);
    zmierz();
    const ro = new ResizeObserver(zmierz);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={() => onSelect(t.id)}
      aria-pressed={wybrany}
      className={cn(
        "relative min-w-0 shrink-0 snap-start rounded-lg bg-secondary p-3 text-left transition-all",
        SZEROKOSC_KARTY,
        wybrany ? "shadow-elevated ring-2 ring-primary" : "hover:bg-accent"
      )}
    >
      {t.recommended && (
        <span className="eyebrow absolute left-5 top-5 z-10 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
          Polecany
        </span>
      )}
      {wybrany && (
        <span className="absolute right-5 top-5 z-10 flex size-5 items-center justify-center rounded-full bg-primary">
          <Check className="size-3 text-primary-foreground" />
        </span>
      )}

      {/* Te same dane i proporcje A4 → miniatury wyrównane i w pełni wypełnione. */}
      <div ref={wnetrzeRef} className="w-full">
        {szerMiniatury > 0 && (
          <TemplateThumb
            template={t.id}
            cv={demoCv}
            width={szerMiniatury}
            demo
          />
        )}
      </div>

      <span className="mt-3 block truncate text-sm font-bold">{t.name}</span>
      <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
        {t.description}
      </span>
    </button>
  );
}
