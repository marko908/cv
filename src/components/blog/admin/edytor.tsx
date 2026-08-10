"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
// Wszystkie cztery z JEDNEGO pakietu: `@tiptap/extension-table` re-eksportuje
// wiersz, nagłówek i komórkę, a samo `Table` nie ma eksportu domyślnego —
// stąd import nazwany, inaczej niż przy pozostałych rozszerzeniach.
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, List,
  ListOrdered, Quote, Minus, AlignLeft, AlignCenter, AlignRight, Link2,
  Link2Off, ImagePlus, Table as TableIcon, Undo2, Redo2, TextCursorInput,
} from "lucide-react";
import { WyborObrazka } from "./wybor-obrazka";
import { cn } from "@/lib/utils";

/**
 * Przycisk paska narzędzi. MUSI stać na poziomie modułu, nie w ciele
 * `EdytorTresci` — komponent zdefiniowany przy renderze rodzica jest przy
 * każdym renderze NOWYM typem, więc React odmontowuje go i montuje od nowa.
 * Repo ma już tę lekcję opisaną przy `PoleHasla` w `formularz-auth.tsx`
 * (tam kosztowała gubienie fokusu przy każdym naciśnięciu klawisza); tutaj
 * przemontowywanie dwudziestu przycisków przy każdym uderzeniu w klawiaturę
 * byłoby po prostu wolne.
 */
function PrzyciskPaska({
  dziala,
  aktywne,
  etykieta,
  children,
}: {
  dziala: () => void;
  aktywne?: boolean;
  etykieta: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={dziala}
      title={etykieta}
      aria-label={etykieta}
      aria-pressed={aktywne}
      className={cn(
        "flex size-8 items-center justify-center rounded transition-colors",
        aktywne
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Edytor treści wpisu (Tiptap).
 *
 * H1 JEST WYŁĄCZONY (`heading.levels: [2, 3]`) i to nie jest kwestia gustu:
 * H1 na stronie artykułu renderuje tytuł wpisu. Drugi H1 w treści rozmywa
 * Google'owi informację, o czym jest strona, i psuje strukturę dla czytników
 * ekranu. Redaktor ma do dyspozycji H2 i H3.
 */
export function EdytorTresci({
  wartosc,
  onZmiana,
}: {
  wartosc: string;
  onZmiana: (html: string) => void;
}) {
  const [obrazkiOtwarte, setObrazkiOtwarte] = useState(false);

  const editor = useEditor({
    // Tiptap renderuje najpierw po stronie serwera, a jego HTML nie zgadza się
    // z klienckim — bez tego Next zgłasza błąd niezgodności hydratacji.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      // `openOnClick: false` — w edytorze kliknięcie w link ma ustawiać kursor,
      // a nie wyrzucać redaktora ze strony na inną domenę.
      LinkExt.configure({ openOnClick: false, autolink: true }),
      ImageExt,
      Placeholder.configure({ placeholder: "Treść artykułu…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: wartosc,
    onUpdate: ({ editor }) => onZmiana(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tresc-wpisu min-h-[50vh] focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const wstawLink = () => {
    const poprzedni = editor.getAttributes("link").href as string | undefined;
    const adres = window.prompt("Adres linku:", poprzedni ?? "https://");
    if (adres === null) return;
    if (adres === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: adres }).run();
  };

  /**
   * Alt obrazka edytujemy osobnym przyciskiem, bo `WyborObrazka` zwraca sam
   * adres. Alt MUSI różnić się od podpisu (`figcaption`): podpis czyta
   * człowiek, alt czyta czytnik ekranu i Google, a powielenie tej samej frazy
   * marnuje jedno z dwóch miejsc na opis.
   */
  const zmienAlt = () => {
    const obecny = editor.getAttributes("image").alt as string | undefined;
    const alt = window.prompt("Tekst alternatywny obrazka:", obecny ?? "");
    if (alt === null) return;
    editor.chain().focus().updateAttributes("image", { alt }).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Pasek przykleja się do góry PRZEWIJANEGO kontenera edytora, nie okna —
          przy długim artykule narzędzia zostają w zasięgu bez skakania po
          stronie. */}
      <div className="sticky top-0 z-10 flex flex-wrap gap-0.5 border-b border-border bg-secondary p-1.5">
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleBold().run()} aktywne={editor.isActive("bold")} etykieta="Pogrubienie"><Bold className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleItalic().run()} aktywne={editor.isActive("italic")} etykieta="Kursywa"><Italic className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleUnderline().run()} aktywne={editor.isActive("underline")} etykieta="Podkreślenie"><UnderlineIcon className="size-4" /></PrzyciskPaska>
        <span className="mx-1 w-px bg-border" />
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aktywne={editor.isActive("heading", { level: 2 })} etykieta="Nagłówek H2"><Heading2 className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aktywne={editor.isActive("heading", { level: 3 })} etykieta="Nagłówek H3"><Heading3 className="size-4" /></PrzyciskPaska>
        <span className="mx-1 w-px bg-border" />
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleBulletList().run()} aktywne={editor.isActive("bulletList")} etykieta="Lista punktowana"><List className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleOrderedList().run()} aktywne={editor.isActive("orderedList")} etykieta="Lista numerowana"><ListOrdered className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().toggleBlockquote().run()} aktywne={editor.isActive("blockquote")} etykieta="Cytat"><Quote className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().setHorizontalRule().run()} etykieta="Linia pozioma"><Minus className="size-4" /></PrzyciskPaska>
        <span className="mx-1 w-px bg-border" />
        <PrzyciskPaska dziala={() => editor.chain().focus().setTextAlign("left").run()} aktywne={editor.isActive({ textAlign: "left" })} etykieta="Do lewej"><AlignLeft className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().setTextAlign("center").run()} aktywne={editor.isActive({ textAlign: "center" })} etykieta="Wyśrodkuj"><AlignCenter className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().setTextAlign("right").run()} aktywne={editor.isActive({ textAlign: "right" })} etykieta="Do prawej"><AlignRight className="size-4" /></PrzyciskPaska>
        <span className="mx-1 w-px bg-border" />
        <PrzyciskPaska dziala={wstawLink} aktywne={editor.isActive("link")} etykieta="Wstaw link"><Link2 className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().unsetLink().run()} etykieta="Usuń link"><Link2Off className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => setObrazkiOtwarte(true)} etykieta="Wstaw obrazek"><ImagePlus className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={zmienAlt} etykieta="Edytuj alt obrazka"><TextCursorInput className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} etykieta="Wstaw tabelę"><TableIcon className="size-4" /></PrzyciskPaska>
        <span className="mx-1 w-px bg-border" />
        <PrzyciskPaska dziala={() => editor.chain().focus().undo().run()} etykieta="Cofnij"><Undo2 className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().redo().run()} etykieta="Ponów"><Redo2 className="size-4" /></PrzyciskPaska>
      </div>

      <div className="max-h-[70vh] overflow-y-auto bg-background p-4">
        <EditorContent editor={editor} />
      </div>

      <WyborObrazka
        otwarty={obrazkiOtwarte}
        onOpenChange={setObrazkiOtwarte}
        onWybierz={(url) =>
          editor.chain().focus().setImage({ src: url, alt: "" }).run()
        }
      />
    </div>
  );
}
