import type { Metadata } from "next";
import { DokumentPrawny } from "@/components/prawne/dokument-prawny";
import { APLIKACJA, DATA_OBOWIAZYWANIA } from "@/lib/prawne/dane";
import { POLITYKA_PRYWATNOSCI } from "@/lib/prawne/polityka-prywatnosci";

export const metadata: Metadata = {
  title: `Polityka prywatności — ${APLIKACJA.nazwa}`,
  description: `Jak ${APLIKACJA.nazwa} przetwarza dane osobowe: cele, podstawy prawne, okresy przechowywania, odbiorcy danych, pliki cookies i Twoje uprawnienia. Obowiązuje od ${DATA_OBOWIAZYWANIA} r.`,
};

export default function StronaPolitykiPrywatnosci() {
  return <DokumentPrawny zrodlo={POLITYKA_PRYWATNOSCI} />;
}
