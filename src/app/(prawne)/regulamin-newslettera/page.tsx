import type { Metadata } from "next";
import { DokumentPrawny } from "@/components/prawne/dokument-prawny";
import { APLIKACJA, DATA_OBOWIAZYWANIA } from "@/lib/prawne/dane";
import { REGULAMIN_NEWSLETTERA } from "@/lib/prawne/regulamin-newslettera";

export const metadata: Metadata = {
  title: `Regulamin newslettera — ${APLIKACJA.nazwa}`,
  description: `Zasady dostarczania newslettera ${APLIKACJA.nazwa}: zapis, rezygnacja, reklamacje i dane osobowe. Obowiązuje od ${DATA_OBOWIAZYWANIA} r.`,
};

export default function StronaRegulaminuNewslettera() {
  return <DokumentPrawny zrodlo={REGULAMIN_NEWSLETTERA} />;
}
