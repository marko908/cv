/**
 * Schemat edytora bloga — WSPÓLNY dla panelu i dla testu regresji.
 *
 * **Dlaczego to osobny moduł, a nie lista w `edytor.tsx`:** Tiptap/ProseMirror
 * NIE przepuszcza HTML-a przez siebie bez zmian. Wszystko, czego nie ma
 * w schemacie, jest przy zapisie po cichu WYRZUCANE — a redaktor otwiera
 * artykuł napisany przez skilla `/blog-post`, więc cała jego struktura musi
 * dać się odwzorować węzłami. Test `npm run test:edytor` round-trip'uje realne
 * konstrukcje z artykułów przez DOKŁADNIE tę listę; gdyby lista mieszkała
 * w komponencie klienckim (`"use client"`, `@tiptap/react`), test nie mógłby
 * jej zaimportować w Node i sprawdzałby atrapę zamiast prawdy.
 *
 * Dlatego tu NIE MA nic reactowego ani `NodeView` — same węzły i renderowanie
 * do HTML-a. UI edytora (dialogi, pasek) siedzi w `edytor.tsx`.
 *
 * Trzy węzły własne odpowiadają trzem konstrukcjom, które bez nich ginęły:
 *
 * 1. `ObrazekZPodpisem` — `<figure><img><figcaption>`. Bez niego zostawał goły
 *    `<img>` + podpis jako ZWYKŁY akapit: `globals.css` stylizuje
 *    `prose-figcaption` (wyśrodkowany, mniejszy, wyciszony), więc podpis
 *    wyglądał jak kolejny akapit treści.
 * 2. `AkapitPromptu` — `<p class="image-prompt">`. Tiptap gubił samą KLASĘ,
 *    a `usunPromptyObrazkow` (`lib/blog/utils.ts`) rozpoznaje prompty właśnie
 *    po niej. Prompt do generatora obrazków trafiłby więc do czytelnika jako
 *    normalny akapit — dokładnie to, przed czym ten filtr miał chronić.
 * 3. `BlokCta` — `<div class="blog-cta-inline">`. `TrescWpisu` sprawdza tę
 *    klasę, żeby NIE dokładać drugiego, automatycznego CTA. Po utracie
 *    wrappera artykuł dostawał dwa CTA: ręczne (bez oprawy) i generyczne.
 */

import { Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";

/** Klasa akapitu z promptem do generatora grafik (usuwana przy renderze). */
export const KLASA_PROMPTU = "image-prompt";
/** Klasa ręcznego, kontekstowego CTA w treści. */
export const KLASA_CTA = "blog-cta-inline";

/**
 * Reguły parsowania wygrywają z domyślnymi (`p`, `div`) dzięki priorytetowi
 * wyższemu niż ProseMirrorowe 50 — inaczej `<p class="image-prompt">` złapałby
 * zwykły Paragraph i klasa i tak by przepadła.
 */
const PRIORYTET = 60;

/** Odsiewa `null`/`undefined`/`""` — DOMOutputSpec nie przyjmuje pustych wartości. */
function tylkoUstawione(
  atrybuty: Record<string, unknown>
): Record<string, string> {
  const wynik: Record<string, string> = {};
  for (const [klucz, wartosc] of Object.entries(atrybuty)) {
    if (wartosc !== null && wartosc !== undefined && wartosc !== "") {
      wynik[klucz] = String(wartosc);
    }
  }
  return wynik;
}

export const ObrazekZPodpisem = Node.create({
  name: "obrazekZPodpisem",
  group: "block",
  /** Treść węzła to PODPIS — dzięki temu redaktor pisze go wprost w edytorze. */
  content: "inline*",
  draggable: true,
  /** Kursor nie wychodzi z podpisu do sąsiednich bloków przy zaznaczaniu. */
  isolating: true,

  addAttributes() {
    return {
      src: { default: null },
      /**
       * Alt jest NIEWIDOCZNY w edytorze, więc łatwo go pominąć — dlatego
       * `FormularzWpisu` blokuje publikację artykułu z pustym altem
       * (czytnik ekranu i Google nie mają wtedy czego przeczytać).
       */
      alt: { default: "" },
      /** Bez wymiarów przeglądarka nie rezerwuje miejsca → skok układu (CLS). */
      width: { default: null },
      height: { default: null },
      // Notatki skilla `/blog-post`: co ma przedstawiać grafika. Zbędne po
      // wgraniu prawdziwego obrazka, ale dopóki stoi placeholder, są jedyną
      // informacją o tym, co zamówić u generatora — nie wolno ich zgubić.
      idObrazka: { default: null },
      typObrazka: { default: null },
      briefObrazka: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        priority: PRIORYTET,
        // Treścią węzła jest wyłącznie podpis; `<img>` czytamy do atrybutów.
        contentElement: "figcaption",
        getAttrs: (element) => {
          const figure = element as HTMLElement;
          const img = figure.querySelector("img");
          // `<figure>` bez obrazka to nie jest nasz węzeł — oddajemy go dalej.
          if (!img) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") ?? "",
            width: img.getAttribute("width"),
            height: img.getAttribute("height"),
            idObrazka: figure.getAttribute("data-image-id"),
            typObrazka: figure.getAttribute("data-image-type"),
            briefObrazka: figure.getAttribute("data-image-brief"),
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const a = node.attrs;
    return [
      "figure",
      tylkoUstawione({
        "data-image-id": a.idObrazka,
        "data-image-type": a.typObrazka,
        "data-image-brief": a.briefObrazka,
      }),
      [
        "img",
        {
          ...tylkoUstawione({ src: a.src }),
          // Alt wpisujemy ZAWSZE, także pusty — i dlatego omija
          // `tylkoUstawione`. To nie to samo: `alt=""` mówi czytnikowi ekranu
          // „pomiń, to dekoracja", a BRAK atrybutu każe mu przeczytać nazwę
          // pliku („klauzula-rodo-w-cv-01.webp"). Kolejność kluczy odpowiada
          // zapisowi ze skilla `/blog-post`, żeby zapis w panelu nie
          // przestawiał atrybutów i nie robił zmian widocznych w diffie.
          alt: a.alt ?? "",
          ...tylkoUstawione({
            width: a.width,
            height: a.height,
            loading: "lazy",
          }),
        },
      ],
      ["figcaption", 0],
    ];
  },
});

export const AkapitPromptu = Node.create({
  name: "akapitPromptu",
  group: "block",
  content: "inline*",

  parseHTML() {
    return [{ tag: `p.${KLASA_PROMPTU}`, priority: PRIORYTET }];
  },

  renderHTML() {
    return ["p", { class: KLASA_PROMPTU }, 0];
  },
});

export const BlokCta = Node.create({
  name: "blokCta",
  group: "block",
  content: "block+",

  parseHTML() {
    return [{ tag: `div.${KLASA_CTA}`, priority: PRIORYTET }];
  },

  renderHTML() {
    return ["div", { class: KLASA_CTA }, 0];
  },
});

/**
 * H1 JEST WYŁĄCZONY (`heading.levels: [2, 3]`) i to nie jest kwestia gustu:
 * H1 na stronie artykułu renderuje tytuł wpisu. Drugi H1 w treści rozmywa
 * Google'owi informację, o czym jest strona, i psuje strukturę dla czytników
 * ekranu. Redaktor ma do dyspozycji H2 i H3.
 *
 * `ImageExt` zostaje OBOK `ObrazekZPodpisem` — łapie gołe `<img>` (wklejone
 * skądś albo ze starszych wpisów), żeby zamiast zniknąć, zostały w treści.
 */
export const ROZSZERZENIA_EDYTORA = [
  /**
   * Link i podkreślenie SĄ CZĘŚCIĄ StarterKita w wersji 3 — konfigurujemy je
   * tutaj, a nie osobnymi wpisami na liście. Dopisanie ich obok dawało
   * „Duplicate extension names found: ['link', 'underline']", przy czym
   * wygrywała kopia ze StarterKita, więc ustawienia z drugiego wpisu po prostu
   * nie działały (na tym poległa pierwsza wersja tej poprawki).
   */
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      // W edytorze kliknięcie w link ma ustawiać kursor, a nie wyrzucać
      // redaktora ze strony na inną domenę.
      openOnClick: false,
      autolink: true,
      /**
       * ZERUJE domyślne `target="_blank"` + `rel="noopener noreferrer nofollow"`
       * tej wtyczki, które inaczej doklejają się do KAŻDEGO linku przy
       * pierwszym zapisie — także wewnętrznego. Na linkowaniu wewnętrznym stoi
       * cała strategia z `scripts/blog/PLAN-TRESCI.md`, a `nofollow` każe
       * Google'owi nie przenosić nim autorytetu, czyli kasuje sens takiego
       * linku; `_blank` dodatkowo wyrzucałby czytelnika z serwisu przy
       * przejściu na nasz własny artykuł.
       *
       * MUSI być jawne `null`, nie puste `{}` — `configure()` SCALA obiekty
       * zamiast je podmieniać, więc `{}` zostawiłoby domyślne wartości
       * nietknięte (na tym poległa druga wersja tej poprawki). `null`
       * odsiewa `mergeAttributes` przy renderowaniu.
       *
       * Atrybuty zostają w schemacie, więc gdy redaktor ustawi je świadomie
       * na konkretnym linku, przechodzą przez zapis bez zmian.
       */
      HTMLAttributes: { target: null, rel: null },
    },
  }),
  ImageExt,
  ObrazekZPodpisem,
  AkapitPromptu,
  BlokCta,
  Placeholder.configure({ placeholder: "Treść artykułu…" }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];
