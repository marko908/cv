import { Suspense } from "react";
import type { Metadata } from "next";
import { StronaAuth } from "@/components/auth/strona-auth";

export const metadata: Metadata = { title: "Załóż konto — Aplikando" };

// Suspense jest wymagane: StronaAuth czyta `?wroc=` przez useSearchParams,
// a bez granicy zawieszenia build wywala się na prerenderze tej trasy.
export default function Page() {
  return (
    <Suspense>
      <StronaAuth ekranPoczatkowy="rejestracja" />
    </Suspense>
  );
}
