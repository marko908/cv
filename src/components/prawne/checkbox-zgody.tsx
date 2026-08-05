"use client";

/**
 * Jeden wiersz zgody: checkbox + treść. Używany przy rejestracji i przy
 * zakupie, żeby oba miejsca wyglądały identycznie.
 *
 * DOMYŚLNIE ODZNACZONY — o stan startowy dba wywołujący (`useState(false)`),
 * ten komponent tylko renderuje to, co dostanie. Wymóg z instrukcji prawnika
 * (Krok IV): checkbox przy zgodzie musi być zaznaczony przez użytkownika,
 * nigdy za niego.
 */

import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxZgody({
  id,
  zaznaczone,
  naZmiane,
  children,
}: {
  id: string;
  zaznaczone: boolean;
  naZmiane: (wartosc: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-muted-foreground"
    >
      <Checkbox
        id={id}
        checked={zaznaczone}
        onCheckedChange={(wartosc) => naZmiane(wartosc === true)}
        className="mt-0.5"
      />
      <span>{children}</span>
    </label>
  );
}
