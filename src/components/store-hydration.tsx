"use client";

import { useEffect } from "react";
import { useCvStore } from "@/lib/store";

/** Rehydruje store z localStorage po montażu (patrz skipHydration w store.ts). */
export function StoreHydration() {
  useEffect(() => {
    void useCvStore.persist.rehydrate();
  }, []);
  return null;
}
