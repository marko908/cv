"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, List,
  ListOrdered, Quote, Minus, AlignLeft, AlignCenter, AlignRight, Link2,
  Link2Off, ImagePlus, Table as TableIcon, Undo2, Redo2,
} from "lucide-react";
import { ROZSZERZENIA_EDYTORA } from "./rozszerzenia-tiptap";
import { DialogObrazka, type DaneObrazka } from "./dialog-obrazka";
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
 * Schemat siedzi w `rozszerzenia-tiptap.ts` — osobno, żeby test
 * `npm run test:edytor` mógł sprawdzać DOKŁADNIE tę samą listę rozszerzeń,
 * której używa panel. Powód jest poważniejszy niż porządek: wszystko, czego
 * nie ma w schemacie, Tiptap wyrzuca przy zapisie po cichu (szczegóły
 * i historia w komentarzu tamtego pliku).
 */
export function EdytorTresci({
  wartosc,
  onZmiana,
}: {
  wartosc: string;
  onZmiana: (html: string) => void;
}) {
  const [obrazekOtwarty, setObrazekOtwarty] = useState(false);

  const editor = useEditor({
    // Tiptap renderuje najpierw po stronie serwera, a jego HTML nie zgadza się
    // z klienckim — bez tego Next zgłasza błąd niezgodności hydratacji.
    immediatelyRender: false,
    extensions: ROZSZERZENIA_EDYTORA,
    content: wartosc,
    onUpdate: ({ editor }) => onZmiana(editor.getHTML()),
    editorProps: {
      attributes: {
        // `edytor-tresci` obok `tresc-wpisu`: ta pierwsza klasa istnieje TYLKO
        // w panelu, więc podwieszamy pod nią podpowiedzi dla redaktora
        // (ostrzeżenie o pustym alcie, oprawa akapitu z promptem). Czytelnik
        // bloga dostaje samo `tresc-wpisu`, bez tych oznaczeń.
        class: "tresc-wpisu edytor-tresci min-h-[50vh] focus:outline-none",
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

  // Gdy kursor stoi na obrazku, ten sam przycisk EDYTUJE go zamiast wstawiać
  // nowy — dzięki temu alt istniejącej grafiki da się poprawić bez usuwania
  // i wstawiania jej od nowa.
  const zaznaczonyObrazek = editor.isActive("obrazekZPodpisem")
    ? {
        src: (editor.getAttributes("obrazekZPodpisem").src as string) ?? "",
        alt: (editor.getAttributes("obrazekZPodpisem").alt as string) ?? "",
      }
    : null;

  const zapiszObrazek = (dane: DaneObrazka) => {
    if (zaznaczonyObrazek) {
      editor.chain().focus().updateAttributes("obrazekZPodpisem", dane).run();
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({ type: "obrazekZPodpisem", attrs: dane })
      .run();
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
        <PrzyciskPaska
          dziala={() => setObrazekOtwarty(true)}
          aktywne={!!zaznaczonyObrazek}
          etykieta={
            zaznaczonyObrazek
              ? "Edytuj obrazek (opis alternatywny)"
              : "Wstaw obrazek"
          }
        >
          <ImagePlus className="size-4" />
        </PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} etykieta="Wstaw tabelę"><TableIcon className="size-4" /></PrzyciskPaska>
        <span className="mx-1 w-px bg-border" />
        <PrzyciskPaska dziala={() => editor.chain().focus().undo().run()} etykieta="Cofnij"><Undo2 className="size-4" /></PrzyciskPaska>
        <PrzyciskPaska dziala={() => editor.chain().focus().redo().run()} etykieta="Ponów"><Redo2 className="size-4" /></PrzyciskPaska>
      </div>

      <div className="max-h-[70vh] overflow-y-auto bg-background p-4">
        <EditorContent editor={editor} />
      </div>

      <DialogObrazka
        otwarty={obrazekOtwarty}
        onOpenChange={setObrazekOtwarty}
        wartosc={zaznaczonyObrazek}
        onZapisz={zapiszObrazek}
      />
    </div>
  );
}
