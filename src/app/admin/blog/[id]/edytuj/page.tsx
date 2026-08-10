import { notFound } from "next/navigation";
import { FormularzWpisu } from "@/components/blog/admin/formularz-wpisu";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import type { PozycjaFaq, WpisBloga } from "@/lib/blog/typy";

export const dynamic = "force-dynamic";

export default async function EdycjaWpisu({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await klientSerwer();

  // Czytamy klientem SESYJNYM, nie publicznym: edytujemy też szkice, więc
  // zapytanie musi biec jako zalogowany admin (polityka „admin robi wszystko").
  const { data } = await supabase
    .from("wpis_bloga")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  // `faq` przychodzi jako `Json`; zawężamy je w jednym miejscu, tak samo jak
  // robi to `zapytania.ts` dla strony publicznej.
  const wpis: WpisBloga = {
    ...data,
    faq: Array.isArray(data.faq) ? (data.faq as unknown as PozycjaFaq[]) : [],
  } as WpisBloga;

  return <FormularzWpisu wpis={wpis} />;
}
