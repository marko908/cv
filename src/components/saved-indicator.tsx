"use client";

import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Dyskretny wskaźnik autosave (wzorzec "● SAVED" z ResuMax).
 * Store zapisuje się do localStorage przy każdej zmianie — my tylko
 * sygnalizujemy to użytkownikowi.
 */
export function SavedIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = useCvStore.subscribe(() => {
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("saved"), 600);
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "eyebrow flex items-center gap-1.5",
        status === "saved" ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "saved" ? "bg-primary" : "animate-pulse bg-muted-foreground"
        )}
      />
      {status === "saved" ? "Zapisano" : "Zapisywanie…"}
    </span>
  );
}
