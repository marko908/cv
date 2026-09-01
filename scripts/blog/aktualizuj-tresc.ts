/**
 * Wgrywa treść z `insert-<slug>.ts` do ISTNIEJĄCEGO szkicu w bazie.
 *
 * Po co: gdy artykuł jest już wstawiony, a poprawka powstała w repo (bo tam
 * jest źródło treści), nie ma sensu kasować wiersza i wstawiać go od nowa —
 * zmieniłoby to id, a więc i link do edycji w panelu.
 *
 * Uruchomienie (slugi WYMAGANE, po spacji):
 *   node --env-file=.env.local --import tsx scripts/blog/aktualizuj-tresc.ts zdjecie-w-cv ats-cv
 *
 * DWA BEZPIECZNIKI, oba celowe:
 *
 * 1. Skrypt NIE MA trybu „wszystkie". Slugi trzeba wypisać z ręki, bo to
 *    operacja NADPISUJĄCA treść: gdybyś zdążył poprawić artykuł w panelu,
 *    ta zmiana przepadnie. Wypisanie slugów jest świadomą decyzją, że repo
 *    jest w tym momencie nowszym źródłem niż baza.
 * 2. Aktualizuje wyłącznie wiersze o statusie `szkic`. Opublikowanego
 *    artykułu nie tknie — tam treść żyje już własnym życiem po redakcji,
 *    a podmiana pod ruchem z wyszukiwarki to ostatnia rzecz, jakiej chcemy.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Wyciąga pole `tresc` (literał szablonowy) z pliku insertu. */
function trescZPliku(slug: string): string {
  const zrodlo = readFileSync(`scripts/blog/insert-${slug}.ts`, "utf8");
  // `\r?\n`, bo git zapisuje w tym repo pliki z CRLF — sam `\n` nie trafia.
  const m = zrodlo.match(/tresc: `([\s\S]*?)`,\r?\n/);
  if (!m) throw new Error(`Nie znalazłem pola tresc w insert-${slug}.ts`);
  return m[1];
}

async function main() {
  const slugi = process.argv.slice(2).filter((a) => !a.startsWith("-"));

  if (slugi.length === 0) {
    console.error(
      "✗ Podaj slugi do aktualizacji, np.:\n" +
        "  node --env-file=.env.local --import tsx scripts/blog/aktualizuj-tresc.ts zdjecie-w-cv"
    );
    process.exit(1);
  }

  let zmienione = 0;
  for (const slug of slugi) {
    const tresc = trescZPliku(slug);

    const { data, error } = await supabase
      .from("wpis_bloga")
      .update({ tresc })
      .eq("slug", slug)
      .eq("status", "szkic")
      .select("id, slug");

    if (error) {
      console.error(`✗ ${slug}: ${error.message}`);
      continue;
    }
    if (!data || data.length === 0) {
      console.error(`✗ ${slug}: brak szkicu o tym slugu (opublikowany albo nie istnieje)`);
      continue;
    }
    console.log(`zaktualizowano  ${slug}  (${tresc.length} znaków)`);
    zmienione++;
  }

  console.log(`\nGotowe: ${zmienione} z ${slugi.length}`);
  if (zmienione !== slugi.length) process.exit(1);
}

main();
