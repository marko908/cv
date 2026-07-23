import { redirect } from "next/navigation";

/** Stary adres kreatora — przeniesiony do shella aplikacji (/app/kreator). */
export default async function LegacyKreatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [
      string,
      string,
    ][]
  ).toString();
  redirect(query ? `/app/kreator?${query}` : "/app/kreator");
}
