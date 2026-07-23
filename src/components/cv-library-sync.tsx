"use client";

import { useEffect, useRef } from "react";
import { useCvStore } from "@/lib/store";

/**
 * Utrzymuje bibliotekę CV w zgodzie z aktualnie edytowanym CV.
 * Gdy zmienia się cv / szablon / sekcje, po krótkim debounce zapisuje je
 * do odpowiedniej pozycji w bibliotece (cvs[activeCvId]).
 */
export function CvLibrarySync() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = useCvStore.subscribe((state, prev) => {
      if (!state.activeCvId) return;
      const changed =
        state.cv !== prev.cv ||
        state.template !== prev.template ||
        state.enabledSections !== prev.enabledSections;
      if (!changed) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        useCvStore.getState().syncActiveCv();
      }, 500);
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
