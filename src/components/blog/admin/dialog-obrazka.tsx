"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WyborObrazka } from "./wybor-obrazka";

export interface DaneObrazka {
  src: string;
  alt: string;
}

/**
 * Okno wstawiania i edycji obrazka w treści.
 *
 * Powstało, bo alt dało się wcześniej ustawić WYŁĄCZNIE przyciskiem na pasku
 * narzędzi, który wywoływał `window.prompt` — nic nie pokazywało, że obrazek
 * alt w ogóle ma, ani jaki. Alt jest niewidoczny z definicji (czyta go czytnik
 * ekranu i Google), więc jedynym sposobem, żeby o nim nie zapomnieć, jest
 * pokazanie go wprost obok obrazka.
 *
 * PODPISU tu nie ma i to jest celowe: podpis widać na stronie, więc redaktor
 * pisze go bezpośrednio w treści, pod obrazkiem, jak każdy inny tekst.
 * Dublowanie go w oknie oznaczałoby dwa źródła tej samej wartości.
 */
export function DialogObrazka({
  otwarty,
  onOpenChange,
  wartosc,
  onZapisz,
}: {
  otwarty: boolean;
  onOpenChange: (v: boolean) => void;
  /** `null` = wstawiamy nowy obrazek; obiekt = edytujemy zaznaczony. */
  wartosc: DaneObrazka | null;
  onZapisz: (dane: DaneObrazka) => void;
}) {
  return (
    <Dialog open={otwarty} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {wartosc ? "Edytuj obrazek" : "Wstaw obrazek"}
          </DialogTitle>
        </DialogHeader>
        {/* Zawartość montowana dopiero po otwarciu — ten sam wzorzec, co
            `TrescBiblioteki` i `TrescPanelu`: stan startuje od aktualnych
            danych bez efektu synchronizującego. */}
        {otwarty && (
          <TrescDialogu
            wartosc={wartosc}
            onZapisz={onZapisz}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TrescDialogu({
  wartosc,
  onZapisz,
  onOpenChange,
}: {
  wartosc: DaneObrazka | null;
  onZapisz: (dane: DaneObrazka) => void;
  onOpenChange: (v: boolean) => void;
}) {
  const [src, setSrc] = useState(wartosc?.src ?? "");
  const [alt, setAlt] = useState(wartosc?.alt ?? "");
  const [bibliotekaOtwarta, setBibliotekaOtwarta] = useState(!wartosc?.src);

  const zapisz = () => {
    if (!src) return;
    onZapisz({ src, alt: alt.trim() });
    onOpenChange(false);
  };

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {src ? (
          <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
            <Image
              src={src}
              alt=""
              fill
              sizes="480px"
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground">
            Nie wybrano obrazka
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setBibliotekaOtwarta(true)}
        >
          {src ? "Zmień obrazek" : "Wybierz z biblioteki"}
        </Button>

        <div className="grid gap-1.5">
          <Label htmlFor="alt-obrazka">Opis alternatywny (alt)</Label>
          <Input
            id="alt-obrazka"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Co przedstawia grafika"
          />
          <p className="text-xs text-muted-foreground">
            Czyta go czytnik ekranu i Google - opisz, co widać, innymi słowami
            niż w podpisie pod obrazkiem. Zostaw pusty tylko dla czystej
            dekoracji.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          Anuluj
        </Button>
        <Button type="button" onClick={zapisz} disabled={!src}>
          {wartosc ? "Zapisz" : "Wstaw"}
        </Button>
      </div>

      <WyborObrazka
        otwarty={bibliotekaOtwarta}
        onOpenChange={setBibliotekaOtwarta}
        onWybierz={setSrc}
      />
    </>
  );
}
