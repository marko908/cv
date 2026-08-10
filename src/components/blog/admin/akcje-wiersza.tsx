"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Button } from "@/components/ui/button";
import type { StatusWpisu } from "@/lib/blog/typy";

/**
 * Akcje przy wierszu listy artykułów: publikacja/cofnięcie, kopiowanie linku
 * podglądu, usunięcie.
 *
 * Kasowanie idzie przez `ConfirmDeleteButton` — jedyny dozwolony kosz na
 * listach w tym repo (widoczny na dotyku, potwierdzenie drugim kliknięciem).
 * Artykuł to praca kilku godzin, więc pojedyncze tapnięcie nie ma prawa go
 * usunąć.
 */
export function AkcjeWiersza({
  id,
  status,
  token,
}: {
  id: string;
  status: StatusWpisu;
  token: string | null;
}) {
  const router = useRouter();
  const supabase = klientPrzegladarka();
  const [pracuje, setPracuje] = useState(false);
  const [skopiowano, setSkopiowano] = useState(false);

  const opublikowany = status === "opublikowany";

  const przelacz = async () => {
    setPracuje(true);
    const nowy: StatusWpisu = opublikowany ? "szkic" : "opublikowany";

    /*
     * Datę publikacji ustawiamy TYLKO przy pierwszym opublikowaniu. Stąd
     * odczyt przed zapisem: gdyby `opublikowano_o` nadpisywało się przy każdym
     * przełączeniu, cofnięcie artykułu do szkicu i ponowna publikacja
     * przestawiłyby go na górę listy i zafałszowały `datePublished`
     * w schemacie Article (Google traktuje to jak nową treść).
     */
    let opublikowanoO: string | undefined;
    if (nowy === "opublikowany") {
      const { data } = await supabase
        .from("wpis_bloga")
        .select("opublikowano_o")
        .eq("id", id)
        .single();
      if (data && !data.opublikowano_o) {
        opublikowanoO = new Date().toISOString();
      }
    }

    await supabase
      .from("wpis_bloga")
      .update({
        status: nowy,
        ...(opublikowanoO ? { opublikowano_o: opublikowanoO } : {}),
      })
      .eq("id", id);

    setPracuje(false);
    router.refresh();
  };

  const usun = async () => {
    setPracuje(true);
    await supabase.from("wpis_bloga").delete().eq("id", id);
    setPracuje(false);
    router.refresh();
  };

  const kopiuj = async () => {
    if (!token) return;
    await navigator.clipboard
      .writeText(`${window.location.origin}/blog/podglad/${token}`)
      .then(() => {
        setSkopiowano(true);
        setTimeout(() => setSkopiowano(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={opublikowany ? "secondary" : "default"}
        onClick={przelacz}
        disabled={pracuje}
      >
        {pracuje && <Loader2 className="size-3.5 animate-spin" />}
        {opublikowany ? "Cofnij do szkicu" : "Opublikuj"}
      </Button>

      {token && (
        <button
          type="button"
          onClick={kopiuj}
          aria-label="Kopiuj link podglądu"
          className="flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          {skopiowano ? (
            <Check className="size-4 text-primary" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      )}

      <ConfirmDeleteButton onDelete={usun} label="Usuń artykuł" />
    </div>
  );
}
