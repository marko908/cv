import { Suspense } from "react";
import type { Metadata } from "next";
import { StronaAuth } from "@/components/auth/strona-auth";

export const metadata: Metadata = { title: "Zaloguj się — Aplikando" };

export default function Page() {
  return (
    <Suspense>
      <StronaAuth ekranPoczatkowy="logowanie" />
    </Suspense>
  );
}
