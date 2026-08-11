/**
 * Pomocnicze funkcje bloga — bez zależności od bazy i od Reacta, więc działają
 * tak samo w komponencie serwerowym, w panelu i w skryptach `scripts/blog/`.
 */

/**
 * Polskie znaki na ASCII. `normalize("NFD")` sam w sobie NIE wystarcza:
 * rozkłada „ą" na „a" + ogonek (który potem odsiewamy), ale „ł" nie ma formy
 * rozłożonej i przeżyłoby jako znak spoza [a-z0-9], czyli zniknęłoby ze slugu
 * („człowiek" → „cz-owiek"). Stąd jawna mapa.
 */
const ZNAKI_PL: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n", Ó: "o", Ś: "s", Ź: "z", Ż: "z",
};

/** Znaki diakrytyczne łączące, zostałe po rozkładzie NFD (np. w „José"). */
const DIAKRYTYKI = /[̀-ͯ]/g;

/** Tytuł → slug URL-owy. Bez ogonków, bez spacji, max 80 znaków. */
export function zrobSlug(tekst: string): string {
  return tekst
    .split("")
    .map((z) => ZNAKI_PL[z] ?? z)
    .join("")
    .normalize("NFD")
    .replace(DIAKRYTYKI, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    // Obcięcie na 80 znaków mogło zostawić myślnik na końcu.
    .replace(/-+$/g, "");
}

/** Czas czytania w minutach (~200 słów/min), zawsze co najmniej 1. */
export function czasCzytania(html: string): number {
  const tekst = html.replace(/<[^>]*>/g, " ");
  const slowa = tekst.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(slowa / 200));
}

/** Data w formacie czytelnym dla człowieka (np. „10 sierpnia 2026"). */
export function sformatujDate(data: string): string {
  return new Date(data).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface Naglowek {
  id: string;
  tekst: string;
  poziom: 2 | 3;
}

/**
 * Dopisuje `id` do nagłówków H2/H3, które go nie mają.
 *
 * MUSI biec PRZED `wyciagnijNaglowki` — spis treści linkuje kotwicami, więc
 * nagłówek bez `id` po prostu z niego wypada. Kolejność wymuszona w
 * `przygotujTresc()` niżej, żeby nie dało się jej pomylić w komponencie.
 */
export function dopiszIdNaglowkom(html: string): string {
  let licznik = 0;
  return html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
    (calosc, poziom: string, atrybuty: string, wnetrze: string) => {
      if (/\sid\s*=/.test(atrybuty)) return calosc;
      const tekst = wnetrze.replace(/<[^>]*>/g, "").trim();
      const id = zrobSlug(tekst) || `sekcja-${++licznik}`;
      return `<h${poziom}${atrybuty} id="${id}">${wnetrze}</h${poziom}>`;
    }
  );
}

/** Wyciąga nagłówki H2/H3 (tylko te z `id`) na spis treści. */
export function wyciagnijNaglowki(html: string): Naglowek[] {
  const wzorzec = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/gi;
  const wynik: Naglowek[] = [];
  let m: RegExpExecArray | null;
  while ((m = wzorzec.exec(html)) !== null) {
    wynik.push({
      poziom: Number(m[1]) as 2 | 3,
      id: m[2],
      tekst: m[3].replace(/<[^>]*>/g, "").trim(),
    });
  }
  return wynik;
}

/**
 * Usuwa akapity `<p class="image-prompt">` — instrukcje dla generatora obrazów,
 * które skill `/blog-post` zostawia w treści dla redaktora.
 *
 * Filtr działa PRZY RENDERZE, nie przy zapisie: prompt ma zostać w bazie
 * (redaktor musi go widzieć w edytorze, dopóki nie wgra grafiki), ale nie ma
 * prawa wyciec na stronę publiczną, gdyby ktoś opublikował wpis przed
 * podmianą obrazków. Bez tego czytelnik zobaczyłby „📷 GRAFIKA 1 (photo) —
 * prompt do generatora…" w środku artykułu.
 */
export function usunPromptyObrazkow(html: string): string {
  return html.replace(
    /<p[^>]*class="[^"]*image-prompt[^"]*"[^>]*>[\s\S]*?<\/p>/gi,
    ""
  );
}

/**
 * Ile obrazków w treści nie ma opisu alternatywnego.
 *
 * Alt jest niewidoczny na stronie, więc jego brak nie rzuca się w oczy przy
 * korekcie — a to jedyna treść, jaką z grafiki dostaje czytnik ekranu
 * i wyszukiwarka. `FormularzWpisu` blokuje tym publikację; zapis szkicu
 * przechodzi, żeby dało się pracować nad wpisem etapami.
 *
 * Liczy TYLKO obrazki w treści. Alt okładki to osobne pole (`okladka_alt`).
 */
export function obrazkiBezAltu(html: string): number {
  const obrazki = html.match(/<img\b[^>]*>/gi) ?? [];
  return obrazki.filter((img) => {
    const alt = img.match(/\salt\s*=\s*"([^"]*)"/i);
    return !alt || alt[1].trim() === "";
  }).length;
}

/**
 * Jedno wejście dla strony artykułu: treść oczyszczona z promptów, z kotwicami
 * w nagłówkach, plus gotowy spis treści. Dzięki temu nie da się wywołać tych
 * funkcji w złej kolejności ani zapomnieć o filtrze promptów.
 */
export function przygotujTresc(html: string): {
  tresc: string;
  naglowki: Naglowek[];
} {
  const tresc = dopiszIdNaglowkom(usunPromptyObrazkow(html));
  return { tresc, naglowki: wyciagnijNaglowki(tresc) };
}
