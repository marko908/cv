import { APLIKACJA } from "@/lib/prawne/dane";

/**
 * Podgląd wyniku w Google, na żywo obok pól formularza.
 *
 * Sens jest praktyczny: `meta_tytul` i `meta_opis` mają twarde limity długości
 * (Google ucina ~60 i ~155 znaków), a licznik znaków sam z siebie nie pokazuje,
 * gdzie zdanie zostanie przerwane w połowie. Tutaj widać to od razu.
 *
 * Pola pokazują wartości ZASTĘPCZE dokładnie tak, jak robi to strona artykułu:
 * gdy `meta_tytul` jest pusty, w wynikach pojawi się `tytul` — więc podgląd
 * musi pokazywać to samo, inaczej uczyłby redaktora nieprawdy.
 */
export function PodgladSeo({
  tytul,
  metaTytul,
  slug,
  zajawka,
  metaOpis,
}: {
  tytul: string;
  metaTytul: string;
  slug: string;
  zajawka: string;
  metaOpis: string;
}) {
  const t = metaTytul.trim() || tytul.trim() || "Tytuł artykułu";
  const o =
    metaOpis.trim() ||
    zajawka.trim() ||
    "Opis pojawi się tu, gdy uzupełnisz zajawkę albo meta opis.";

  return (
    <div className="card-surface p-4">
      <p className="eyebrow mb-3 text-muted-foreground">Podgląd w Google</p>
      <div className="rounded-lg bg-background p-3">
        <p className="truncate text-xs text-muted-foreground">
          {APLIKACJA.domena}/blog/{slug || "adres-artykulu"}
        </p>
        <p className="mt-1 line-clamp-2 text-base leading-snug text-[#8ab4f8]">
          {t} | {APLIKACJA.nazwa}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{o}</p>
      </div>
    </div>
  );
}
