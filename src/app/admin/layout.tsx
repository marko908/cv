import { notFound } from "next/navigation";
import Link from "next/link";
import { klientSerwer } from "@/lib/supabase/klient-serwer";

/**
 * Bramka panelu redakcyjnego.
 *
 * `proxy.ts` odsiewa niezalogowanych; TUTAJ sprawdzamy rolę — jednym wywołaniem
 * RPC `czy_admin()`, tylko dla żądań pod `/admin`, zamiast obciążać nim cały
 * ruch w proxy.
 *
 * Brak roli daje `notFound()`, nie „403 brak uprawnień": komunikat o braku
 * uprawnień potwierdza, że panel istnieje pod tym adresem. 404 nie mówi nic.
 *
 * To jest DRUGA linia obrony, nie jedyna — nawet gdyby ktoś ją ominął, RLS na
 * `wpis_bloga` i tak nie pozwoli mu nic zapisać (polityka „admin robi
 * wszystko" pyta o tę samą funkcję po stronie bazy).
 */
export const dynamic = "force-dynamic";

export default async function LayoutAdmina({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await klientSerwer();
  const { data: czyAdmin } = await supabase.rpc("czy_admin");
  if (czyAdmin !== true) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-4">
          <Link href="/admin/blog" className="text-sm font-bold">
            Panel redakcyjny
          </Link>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Zobacz blog
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
