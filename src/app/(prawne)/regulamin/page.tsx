import type { Metadata } from "next";
import { DokumentPrawny } from "@/components/prawne/dokument-prawny";
import { APLIKACJA, DATA_OBOWIAZYWANIA } from "@/lib/prawne/dane";
import { REGULAMIN } from "@/lib/prawne/regulamin";

export const metadata: Metadata = {
  title: `Regulamin — ${APLIKACJA.nazwa}`,
  description: `Regulamin aplikacji ${APLIKACJA.nazwa}. Zasady korzystania, płatności, reklamacje, prawo odstąpienia i wykorzystanie AI. Obowiązuje od ${DATA_OBOWIAZYWANIA} r.`,
};

export default function StronaRegulaminu() {
  return <DokumentPrawny zrodlo={REGULAMIN} />;
}
