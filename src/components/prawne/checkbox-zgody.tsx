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
  blad,
}: {
  id: string;
  zaznaczone: boolean;
  naZmiane: (wartosc: boolean) => void;
  children: React.ReactNode;
  /**
   * Komunikat błędu pod wierszem — pokazywany PO próbie wysłania formularza
   * bez zaznaczonej zgody (przycisk nie jest już z góry `disabled`, więc to
   * jedyny sposób, w jaki użytkownik dowiaduje się, czego brakuje).
   * Podświetla też sam checkbox na czerwono przez `aria-invalid`.
   */
  blad?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-muted-foreground"
      >
        <Checkbox
          id={id}
          checked={zaznaczone}
          onCheckedChange={(wartosc) => naZmiane(wartosc === true)}
          aria-invalid={blad ? true : undefined}
          aria-describedby={blad ? `${id}-blad` : undefined}
          className="mt-0.5"
        />
        <span>{children}</span>
      </label>
      {blad && (
        <p id={`${id}-blad`} className="mt-1 pl-[26px] text-xs text-destructive">
          {blad}
        </p>
      )}
    </div>
  );
}
