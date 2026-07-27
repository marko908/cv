"use client";

import { Check } from "lucide-react";
import type { TailoredCv } from "@/lib/cv-schema";
import type { TemplateId } from "@/lib/store";
import { TemplateThumb } from "@/components/template-thumb";
import {
  TEMPLATE_CATEGORIES,
  templatesByTag,
  type CvTemplate,
} from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

/**
 * Galeria szablonów: jeden WIERSZ na kategorię, przewijany w bok.
 * W pionie przeglądasz kategorie, w poziomie szablony w obrębie kategorii.
 *
 * Kategorie i przypisanie szablonów pochodzą z tagów w `cv-templates.ts` —
 * ten komponent nie zna konkretnych szablonów, więc nowy podział wystarczy
 * dopisać tam, bez zmian tutaj.
 *
 * Miniatury działają w trybie `demo`: układy ze zdjęciem dostają zdjęcie
 * poglądowe, żeby od razu było widać, że mają na nie miejsce.
 */
export function TemplateGallery({
  cv,
  selected,
  onSelect,
  thumbWidth = 210,
  cardClassName,
}: {
  cv: TailoredCv;
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
  thumbWidth?: number;
  cardClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {TEMPLATE_CATEGORIES.map((kat) => {
        const szablony = templatesByTag(kat.tag);
        if (szablony.length === 0) return null;

        return (
          <section key={kat.tag} className="min-w-0">
            <div className="flex items-baseline justify-between gap-3 px-1">
              <h4 className="text-sm font-bold">{kat.label}</h4>
              <span className="eyebrow shrink-0 text-muted-foreground">
                {szablony.length}
              </span>
            </div>
            <p className="mt-0.5 px-1 text-xs text-muted-foreground">
              {kat.opis}
            </p>

            {/* Przewijanie w bok — karty mają stałą szerokość i przyciąganie. */}
            <div className="-mx-1 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
              {szablony.map((t) => (
                <KartaSzablonu
                  key={t.id}
                  szablon={t}
                  cv={cv}
                  wybrany={selected === t.id}
                  onSelect={onSelect}
                  thumbWidth={thumbWidth}
                  className={cardClassName}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function KartaSzablonu({
  szablon: t,
  cv,
  wybrany,
  onSelect,
  thumbWidth,
  className,
}: {
  szablon: CvTemplate;
  cv: TailoredCv;
  wybrany: boolean;
  onSelect: (id: TemplateId) => void;
  thumbWidth: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(t.id)}
      aria-pressed={wybrany}
      className={cn(
        "relative shrink-0 snap-start rounded-lg bg-secondary p-3 text-left transition-all",
        wybrany ? "shadow-elevated ring-2 ring-primary" : "hover:bg-accent",
        className
      )}
      style={{ width: thumbWidth + 24 }}
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

      <TemplateThumb
        template={t.id}
        cv={cv}
        width={thumbWidth}
        demo
        className="mx-auto"
      />

      <span className="mt-3 block text-sm font-bold">{t.name}</span>
      <span className="mt-1 line-clamp-3 block text-xs text-muted-foreground">
        {t.description}
      </span>
    </button>
  );
}
