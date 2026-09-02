"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Edytor bulletów (wzorzec ResuMax: lista pól + „Dodaj punkt"). */
export function BulletsEditor({
  bullets,
  onChange,
  placeholder = "Opisz osiągnięcie - użyj metody STAR, liczb i czasowników dokonanych…",
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
}) {
  const list = bullets.length > 0 ? bullets : [""];

  const update = (i: number, value: string) =>
    onChange(list.map((b, idx) => (idx === i ? value : b)));
  const add = () => onChange([...list, ""]);
  const remove = (i: number) => {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length > 0 ? next : [""]);
  };

  return (
    <div className="flex flex-col gap-2">
      {list.map((bullet, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
          <Textarea
            rows={2}
            value={bullet}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-1.5"
            onClick={() => remove(i)}
            aria-label="Usuń punkt"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="gap-1.5 self-start"
        onClick={add}
      >
        <Plus className="size-4" />
        Dodaj punkt
      </Button>
    </div>
  );
}

/** Chip-input dla list tagów (technologie, umiejętności, języki). */
export function TagInput({
  tags,
  onChange,
  placeholder = "Wpisz i naciśnij Enter…",
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const clean = tags.filter(Boolean);

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...clean];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 rounded-md border border-input bg-field p-2"
      )}
    >
      {clean.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(clean.filter((_, idx) => idx !== i))}
            aria-label={`Usuń ${tag}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Input
        value={draft}
        placeholder={clean.length === 0 ? placeholder : ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && draft === "" && clean.length > 0) {
            onChange(clean.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        onPaste={(e) => {
          if (e.clipboardData.getData("text").includes(",")) {
            e.preventDefault();
            commit(e.clipboardData.getData("text"));
          }
        }}
        className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
