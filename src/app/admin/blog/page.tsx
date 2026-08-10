import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import { AkcjeWiersza } from "@/components/blog/admin/akcje-wiersza";
import { sformatujDate } from "@/lib/blog/utils";
import type { StatusWpisu } from "@/lib/blog/typy";
import { cn } from "@/lib/utils";

/**
 * Lista wszystkich artykułów — WSZYSTKICH statusów, inaczej niż publiczne
 * `/blog`. Widzi je dzięki polityce „admin robi wszystko"; ten sam kod
 * uruchomiony przez kogokolwiek innego zwróci pustą listę, bo RLS odfiltruje
 * nieopublikowane.
 */
export const dynamic = "force-dynamic";

const KOLOR: Record<StatusWpisu, string> = {
  opublikowany: "bg-primary",
  szkic: "bg-yellow-500",
  zarchiwizowany: "bg-muted-foreground",
};

export default async function ListaWpisow() {
  const supabase = await klientSerwer();
  const { data: wpisy } = await supabase
    .from("wpis_bloga")
    .select("id, tytul, slug, status, opublikowano_o, updated_at, kategoria, token_podgladu")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Artykuły</h1>
        <Button asChild className="font-bold">
          <Link href="/admin/blog/nowy">
            <Plus className="size-4" />
            Nowy artykuł
          </Link>
        </Button>
      </div>

      {!wpisy || wpisy.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          Nie ma jeszcze żadnego artykułu.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {wpisy.map((w) => (
            <div
              key={w.id}
              className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn("size-2 shrink-0 rounded-full", KOLOR[w.status as StatusWpisu])}
                  />
                  <Link
                    href={`/admin/blog/${w.id}/edytuj`}
                    className="truncate font-bold hover:text-primary"
                  >
                    {w.tytul}
                  </Link>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {w.kategoria} · /blog/{w.slug}
                  {w.opublikowano_o &&
                    ` · opublikowany ${sformatujDate(w.opublikowano_o)}`}
                </p>
              </div>

              <AkcjeWiersza
                id={w.id}
                status={w.status as StatusWpisu}
                token={w.token_podgladu}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
