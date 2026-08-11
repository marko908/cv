/**
 * Test wierności edytora bloga (`npm run test:edytor`).
 *
 * Pilnuje rzeczy, która psuje się CAŁKOWICIE PO CICHU: **otwarcie artykułu
 * w panelu i kliknięcie „Zapisz" nie może zmienić jego znaczenia.**
 *
 * Tiptap/ProseMirror nie przepuszcza HTML-a bez zmian — parsuje go do swojego
 * schematu, a czego w schemacie nie ma, znika przy zapisie. Skill `/blog-post`
 * pisze `<figure>`, `<p class="image-prompt">` i `<div class="blog-cta-inline">`,
 * a od tych dwóch klas zależy zachowanie `usunPromptyObrazkow` i `TrescWpisu`.
 * Utrata którejkolwiek nie wywala buildu ani `tsc` — widać ją dopiero na
 * opublikowanej stronie.
 *
 * Test round-trip'uje HTML przez `ROZSZERZENIA_EDYTORA`, czyli DOKŁADNIE ten
 * schemat, którego używa panel.
 *
 * **Dwa poziomy wymagań, bo nie wszystko da się utrzymać co do znaku:**
 *
 * 1. Konstrukcje niosące znaczenie (figure, klasy, linki, atrybuty) MUSZĄ
 *    przechodzić bez najmniejszej zmiany.
 * 2. Tabele i listy Tiptap normalizuje z założenia (`<thead>` wtapia się
 *    w `<tbody>`, treść komórek i punktów listy dostaje `<p>`, tabela dostaje
 *    `<colgroup>`). Tego nie da się wyłączyć opcją i nie ma sensu z tym
 *    walczyć — sprawdzamy więc IDEMPOTENCJĘ (drugi zapis nie zmienia już nic,
 *    czyli treść nie osypuje się z każdą edycją) oraz to, że semantyka
 *    przetrwała (`<th>` zostaje `<th>`, teksty się zgadzają).
 *
 * Uruchomienie: `npm run test:edytor`
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Window } from "happy-dom";
import { getSchema } from "@tiptap/core";
import { DOMParser, DOMSerializer } from "@tiptap/pm/model";
import {
  ROZSZERZENIA_EDYTORA,
  KLASA_PROMPTU,
  KLASA_CTA,
} from "../src/components/blog/admin/rozszerzenia-tiptap";

const okno = new Window();
const dokument = okno.document as unknown as Document;
const schema = getSchema(ROZSZERZENIA_EDYTORA);

/** HTML → dokument ProseMirror → HTML, czyli dokładnie to, co robi zapis. */
function przezEdytor(html: string): string {
  const wejscie = dokument.createElement("div");
  wejscie.innerHTML = html;
  const doc = DOMParser.fromSchema(schema).parse(wejscie as unknown as Node);
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(
    doc.content,
    { document: dokument }
  );
  const wyjscie = dokument.createElement("div");
  wyjscie.appendChild(fragment as unknown as Node);
  return wyjscie.innerHTML;
}

/**
 * Zrównuje formatowanie, nie treść: odstępy MIĘDZY znacznikami (wcięcia
 * ze źródła, których serializer nie odtwarza) i zapis samozamykający `<img />`.
 * Odstępy wewnątrz tekstu zostają — tam różnica byłaby realna.
 */
function znormalizuj(html: string): string {
  return html.replace(/\s*\/>/g, ">").replace(/>\s+</g, "><").trim();
}

/** Sam tekst, bez znaczników — do porównywania treści po normalizacji. */
function samTekst(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function ile(html: string, wzorzec: RegExp): number {
  return (html.match(wzorzec) ?? []).length;
}

let bledy = 0;
let zaliczone = 0;

function zdane(nazwa: string) {
  zaliczone++;
  console.log(`  OK   ${nazwa}`);
}

function nieZdane(nazwa: string, ...szczegoly: string[]) {
  bledy++;
  console.log(`  BŁĄD ${nazwa}`);
  for (const linia of szczegoly) console.log(`       ${linia}`);
}

/** Wymaga, żeby zapis nie zmienił ani jednego znaku. */
function bezZmian(nazwa: string, wejscie: string) {
  const wyjscie = przezEdytor(wejscie);
  if (znormalizuj(wyjscie) === znormalizuj(wejscie)) return zdane(nazwa);
  nieZdane(
    nazwa,
    `oczekiwano: ${znormalizuj(wejscie)}`,
    `otrzymano:  ${znormalizuj(wyjscie)}`
  );
}

function warunek(nazwa: string, spelniony: boolean, opis: string) {
  return spelniony ? zdane(nazwa) : nieZdane(nazwa, opis);
}

/**
 * Dla konstrukcji, które Tiptap z założenia przepisuje: zapis może zmienić
 * zapis HTML, ale KOLEJNY zapis nie może już zmienić nic (bez tego każda
 * edycja dokładałaby warstwę zmian), a treść musi przetrwać w całości.
 */
function idempotentne(nazwa: string, wejscie: string) {
  const raz = przezEdytor(wejscie);
  const dwa = przezEdytor(raz);
  if (znormalizuj(raz) !== znormalizuj(dwa)) {
    return nieZdane(
      `${nazwa} — idempotencja`,
      "drugi zapis znów zmienił treść, więc każda edycja ją osypuje",
      `po 1: ${znormalizuj(raz)}`,
      `po 2: ${znormalizuj(dwa)}`
    );
  }
  if (samTekst(raz) !== samTekst(wejscie)) {
    return nieZdane(
      `${nazwa} — treść`,
      `przed: ${samTekst(wejscie)}`,
      `po:    ${samTekst(raz)}`
    );
  }
  zdane(`${nazwa} — idempotencja i treść`);
}

console.log("\n1. Konstrukcje, które muszą przejść zapis BEZ ZMIAN:");

bezZmian(
  "figure + img + figcaption (podpis zachowuje oprawę prose-figcaption)",
  `<figure data-image-id="1" data-image-type="photo" data-image-brief="Co ma być na grafice."><img src="/blog/obrazki/x-01.webp" alt="Opis dla czytnika ekranu" width="800" height="450" loading="lazy"><figcaption>Podpis widoczny pod obrazkiem</figcaption></figure>`
);

bezZmian(
  `p.${KLASA_PROMPTU} (klasa steruje usunPromptyObrazkow)`,
  `<p class="${KLASA_PROMPTU}">📷 <strong>GRAFIKA 1 (photo)</strong> - prompt: opis grafiki. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>`
);

bezZmian(
  `div.${KLASA_CTA} (klasa powstrzymuje drugie, automatyczne CTA)`,
  `<div class="${KLASA_CTA}"><p><strong>Nagłówek zachęty.</strong> Zdanie o produkcie.</p><p><a href="/rejestracja">Załóż darmowe konto</a></p></div>`
);

bezZmian(
  "link wewnętrzny (bez doklejonego nofollow i target=_blank)",
  `<p>Sprawdź też <a href="/blog/ile-stron-cv">ile stron powinno mieć CV</a>.</p>`
);

bezZmian(
  "link z ŚWIADOMIE ustawionym target i rel",
  `<p><a target="_blank" rel="noopener" href="https://example.com">źródło</a></p>`
);

bezZmian(
  "cytat blokowy (wzór klauzuli RODO)",
  `<blockquote><p>Wyrażam zgodę na przetwarzanie moich danych osobowych.</p></blockquote>`
);

bezZmian("nagłówki H2/H3", `<h2>Nagłówek sekcji</h2><h3>Podsekcja</h3>`);

console.log("\n2. Konstrukcje normalizowane przez Tiptap (thead, <p> w komórkach):");

idempotentne(
  "tabela z nagłówkiem",
  `<table><thead><tr><th>Etap kariery</th><th>Długość</th></tr></thead><tbody><tr><td>Absolwent</td><td>1 strona</td></tr></tbody></table>`
);

idempotentne(
  "lista punktowana",
  `<ul><li>Punkt pierwszy</li><li>Punkt drugi</li></ul>`
);

const tabela = przezEdytor(
  `<table><thead><tr><th>Etap</th></tr></thead><tbody><tr><td>Absolwent</td></tr></tbody></table>`
);
warunek(
  "komórki nagłówkowe zostają <th> (czytniki ekranu i Google)",
  tabela.includes("<th"),
  `w wyniku nie ma <th>: ${tabela}`
);

console.log("\n3. Atrybuty, które muszą przetrwać zapis:");

const zObrazkiem = przezEdytor(
  `<figure data-image-id="2" data-image-type="infographic" data-image-brief="Brief do wygenerowania."><img src="/a.webp" alt="Alt tekst" width="800" height="450" loading="lazy"><figcaption>Podpis</figcaption></figure>`
);
warunek(
  "alt obrazka",
  zObrazkiem.includes('alt="Alt tekst"'),
  "alt zniknął — czytnik ekranu i Google nie mają czego przeczytać"
);
warunek(
  "wymiary (width/height chronią przed skokiem układu)",
  zObrazkiem.includes('width="800"') && zObrazkiem.includes('height="450"'),
  "wymiary zniknęły — wraca CLS, który liczy się do Core Web Vitals"
);
warunek(
  "brief grafiki (data-image-brief)",
  zObrazkiem.includes("data-image-brief"),
  "brief zniknął — nie wiadomo, co zamówić u generatora obrazków"
);
warunek(
  "loading=lazy",
  zObrazkiem.includes('loading="lazy"'),
  "leniwe ładowanie zniknęło"
);

const zLinkiem = przezEdytor(`<p><a href="/rejestracja">Załóż konto</a></p>`);
warunek(
  "link wewnętrzny BEZ rel=nofollow",
  !zLinkiem.includes("nofollow"),
  `edytor dokleił nofollow: ${zLinkiem}`
);
warunek(
  "link wewnętrzny BEZ target=_blank",
  !zLinkiem.includes("_blank"),
  `edytor dokleił target=_blank: ${zLinkiem}`
);

const pustyAlt = przezEdytor(
  `<figure><img src="/a.webp" alt=""><figcaption>Podpis</figcaption></figure>`
);
warunek(
  'pusty alt zostaje jako alt="" (a nie znika)',
  pustyAlt.includes('alt=""'),
  `brak atrybutu każe czytnikowi przeczytać nazwę pliku: ${pustyAlt}`
);

console.log("\n4. Wstawianie obrazka przyciskiem w panelu:");

/*
 * `EdytorTresci.zapiszObrazek` woła `insertContent({ type: "obrazekZPodpisem" })`.
 * Literówka w nazwie węzła albo schemat wymagający niepustej treści dałyby
 * ciche NIC — przycisk klika się, obrazek się nie wstawia, żaden błąd nie
 * leci. Sprawdzamy więc to, na czym stoi ta komenda.
 */
const wezelObrazka = schema.nodes.obrazekZPodpisem;
warunek(
  "węzeł `obrazekZPodpisem` istnieje w schemacie",
  !!wezelObrazka,
  "nazwa użyta w insertContent nie pasuje do schematu"
);

if (wezelObrazka) {
  // `createAndFill` = dokładnie ta ścieżka, którą idzie wstawianie z panelu;
  // zwraca null, gdy węzła nie da się zbudować z podanych atrybutów.
  const nowy = wezelObrazka.createAndFill({
    src: "/blog/obrazki/nowy.webp",
    alt: "Opis nowego obrazka",
  });
  warunek(
    "da się wstawić obrazek z PUSTYM podpisem (redaktor dopisze go w treści)",
    nowy !== null,
    "schemat nie pozwala utworzyć węzła bez treści — przycisk „Wstaw” nic nie zrobi"
  );

  if (nowy) {
    const wyjscie = dokument.createElement("div");
    wyjscie.appendChild(
      DOMSerializer.fromSchema(schema).serializeNode(nowy, {
        document: dokument,
      }) as unknown as Node
    );
    warunek(
      "wstawiony obrazek niesie alt podany w oknie",
      wyjscie.innerHTML.includes('alt="Opis nowego obrazka"'),
      `alt nie trafił do HTML: ${wyjscie.innerHTML}`
    );
  }
}

console.log("\n5. Prawdziwa treść artykułów (scripts/blog/insert-*.ts):");

const katalogBloga = join(__dirname, "blog");
const skrypty = readdirSync(katalogBloga).filter(
  (n) => n.startsWith("insert-") && n.endsWith(".ts")
);

if (skrypty.length === 0) console.log("  (brak skryptów insert-*.ts)");

for (const nazwaPliku of skrypty) {
  const zrodlo = readFileSync(join(katalogBloga, nazwaPliku), "utf8");
  // `\r?\n` — pliki w repo mają zakończenia CRLF (Windows, `core.autocrlf`).
  const dopasowanie = zrodlo.match(/tresc:\s*`([\s\S]*?)`,\r?\n\s*\}\)/);
  if (!dopasowanie) {
    nieZdane(nazwaPliku, "nie znalazłem pola `tresc` w skrypcie");
    continue;
  }
  const wejscie = dopasowanie[1];
  const wyjscie = przezEdytor(wejscie);

  idempotentne(nazwaPliku, wejscie);

  const niezmienniki: [string, number, number][] = [
    [
      "akapity z promptem",
      ile(wejscie, new RegExp(`class="${KLASA_PROMPTU}"`, "g")),
      ile(wyjscie, new RegExp(`class="${KLASA_PROMPTU}"`, "g")),
    ],
    [
      "bloki CTA",
      ile(wejscie, new RegExp(`class="${KLASA_CTA}"`, "g")),
      ile(wyjscie, new RegExp(`class="${KLASA_CTA}"`, "g")),
    ],
    ["obrazki z podpisem", ile(wejscie, /<figure/g), ile(wyjscie, /<figure/g)],
    ["podpisy", ile(wejscie, /<figcaption/g), ile(wyjscie, /<figcaption/g)],
    ["linki", ile(wejscie, /<a /g), ile(wyjscie, /<a /g)],
  ];

  for (const [co, przed, po] of niezmienniki) {
    warunek(
      `${nazwaPliku} — ${co} (${przed})`,
      przed === po,
      `było ${przed}, zostało ${po}`
    );
  }

  warunek(
    `${nazwaPliku} — żaden link nie dostał nofollow`,
    !wyjscie.includes("nofollow"),
    "edytor dokleił nofollow do linków wewnętrznych"
  );
}

console.log(
  `\n${bledy === 0 ? "WSZYSTKO OK" : "SĄ BŁĘDY"} — zaliczone: ${zaliczone}, błędy: ${bledy}\n`
);
process.exit(bledy === 0 ? 0 : 1);
