import { KartaWpisu } from "./karta-wpisu";
import type { WpisNaLiscie } from "@/lib/blog/typy";

/**
 * Powiązane artykuły pod wpisem.
 *
 * To nie jest ozdobnik, tylko linkowanie wewnętrzne: rozprowadza autorytet
 * strony po nowych wpisach i daje Google ścieżkę do przeindeksowania świeżych
 * treści bez czekania na ponowne odwiedziny sitemapy. Dlatego stoi na KAŻDYM
 * artykule, także krótkim.
 */
export function PowiazaneWpisy({ wpisy }: { wpisy: WpisNaLiscie[] }) {
  if (wpisy.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-extrabold tracking-tight">
        Przeczytaj również
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wpisy.map((w) => (
          <KartaWpisu key={w.id} wpis={w} />
        ))}
      </div>
    </section>
  );
}
