import type { Metadata } from "next";
import { Builder } from "@/components/builder/builder";

export const metadata: Metadata = {
  title: "Edytor CV - Aplikando",
};

export default async function KreatorEdytorPage({
  searchParams,
}: {
  searchParams: Promise<{ sciezka?: string; oferta?: string }>;
}) {
  const { sciezka, oferta } = await searchParams;
  const path = sciezka === "nowe" ? "create" : "tailor";
  return <Builder initialPath={path} openTailor={oferta === "1"} />;
}
