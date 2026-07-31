"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sampleCvs, type SampleCv } from "@/lib/sample-cv";
import type { TailoredCv } from "@/lib/cv-schema";

export function SampleCvPicker({
  onSelect,
  buttonLabel = "Wczytaj przykład",
  compact = false,
}: {
  onSelect: (cv: TailoredCv, sample: SampleCv) => void;
  buttonLabel?: string;
  compact?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(sampleCvs[0].id);
  const selected = sampleCvs.find((sample) => sample.id === selectedId) ?? sampleCvs[0];

  return (
    <div
      className={
        compact
          ? // Na wąskim panelu (telefon) select dostaje CAŁY wiersz dla siebie.
            // Trzy kontrolki w jednej linii ściskały go do 84 px, przez co
            // z „Anna Kowalska — Frontend Developerka" zostawało „Kowalska ·"
            // — fragment, z którego nie da się rozpoznać, co się wczyta.
            "flex min-w-0 flex-1 basis-full flex-wrap gap-1.5 sm:basis-auto sm:flex-nowrap"
          : "flex gap-2"
      }
    >
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger
          size="sm"
          aria-label="Wybierz przykładowe CV"
          // w-auto nadpisuje bazowe w-fit (twMerge), a max-w ogranicza max-content
          // triggera — bez tego długa nazwa CV rozpycha cały lewy panel edytora
          // (kontener rośnie do max-content i wychodzi poza panel → ucinanie).
          className={
            compact
              ? "w-full min-w-0 flex-1 text-xs sm:w-auto sm:max-w-[170px]"
              : "w-auto min-w-0 max-w-72"
          }
        >
          {/* Jawny `truncate`: bazowy `line-clamp-1` triggera przy
              `whitespace-nowrap` ucina tekst BEZ wielokropka, więc nie widać,
              że nazwa jest dłuższa. */}
          <SelectValue>
            <span className="block truncate">{selected.name}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {sampleCvs.map((sample) => (
            <SelectItem key={sample.id} value={sample.id}>
              {sample.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="secondary"
        className={compact ? "shrink-0 gap-1.5 text-xs" : "gap-1.5"}
        onClick={() => onSelect(selected.cv, selected)}
      >
        <FileUp className="size-3.5" />
        {buttonLabel}
      </Button>
    </div>
  );
}
