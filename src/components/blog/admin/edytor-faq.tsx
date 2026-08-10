"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PozycjaFaq } from "@/lib/blog/typy";

/**
 * FAQ wpisu. To nie jest ozdobnik na końcu artykułu — z tych par generuje się
 * schemat `FAQPage`, czyli realna szansa na rozwijane pytania w wynikach
 * Google i najczęściej cytowany przez asystentów AI fragment strony.
 */
export function EdytorFaq({
  wartosc,
  onZmiana,
}: {
  wartosc: PozycjaFaq[];
  onZmiana: (v: PozycjaFaq[]) => void;
}) {
  const zmien = (i: number, pole: keyof PozycjaFaq, v: string) =>
    onZmiana(wartosc.map((p, j) => (i === j ? { ...p, [pole]: v } : p)));

  return (
    <div className="flex flex-col gap-4">
      {wartosc.map((p, i) => (
        <div key={i} className="card-surface flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor={`faq-p-${i}`}>Pytanie {i + 1}</Label>
              <Input
                id={`faq-p-${i}`}
                value={p.pytanie}
                onChange={(e) => zmien(i, "pytanie", e.target.value)}
                placeholder="Np. Ile stron powinno mieć CV?"
              />
            </div>
            <button
              type="button"
              onClick={() => onZmiana(wartosc.filter((_, j) => j !== i))}
              aria-label={`Usuń pytanie ${i + 1}`}
              className="mt-7 flex size-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`faq-o-${i}`}>Odpowiedź</Label>
            <Textarea
              id={`faq-o-${i}`}
              value={p.odpowiedz}
              onChange={(e) => zmien(i, "odpowiedz", e.target.value)}
              rows={3}
              placeholder="Dwa-trzy zdania konkretnej odpowiedzi."
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => onZmiana([...wartosc, { pytanie: "", odpowiedz: "" }])}
        className="w-fit"
      >
        <Plus className="size-4" />
        Dodaj pytanie
      </Button>
    </div>
  );
}
