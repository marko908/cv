/**
 * Treść dwóch checkboxów zgody — JEDNO ŹRÓDŁO, używane w DWÓCH miejscach:
 * przy rejestracji (`formularz-auth.tsx`) i przy zakupie (`paywall-dialog.tsx`).
 *
 * Brzmienie zgodne z `dokumenty-prawne/wzory-zgod.md` (zgoda nr 1 i nr 2).
 * Regulamin § 4 ust. 2 pkt 3 i ust. 8 pkt 3 opisuje te same dwa oświadczenia —
 * gdy zmienisz tekst tutaj, zmień go też w tamtych dwóch miejscach, bo inaczej
 * regulamin zacznie opisywać checkbox, który realnie mówi coś innego.
 *
 * Linki otwierają się w nowej karcie (`target="_blank"`), żeby kliknięcie
 * w Regulamin nie wyrzuciło użytkownika z wypełnianego formularza rejestracji
 * ani z procesu płatności.
 */

import Link from "next/link";
import { SCIEZKI } from "@/lib/prawne/dane";

const KLASA_LINKU =
  "underline underline-offset-2 hover:text-foreground";

export function EtykietaZgodaRegulamin() {
  return (
    <>
      Oświadczam, że zapoznałem/-am się z{" "}
      <Link href={SCIEZKI.regulamin} target="_blank" className={KLASA_LINKU}>
        Regulaminem
      </Link>{" "}
      i{" "}
      <Link
        href={SCIEZKI.politykaPrywatnosci}
        target="_blank"
        className={KLASA_LINKU}
      >
        Polityką prywatności
      </Link>{" "}
      oraz akceptuję ich postanowienia.
    </>
  );
}

/**
 * Zgoda z Kroku V instrukcji prawnika: bez niej Usługobiorca mógłby pobrać
 * pełny raport i przerobione CV, po czym odstąpić od umowy w 14 dni i zażądać
 * zwrotu. Regulamin § 8 ust. 5–6 opiera się na tym, że ta zgoda realnie
 * istnieje w procesie zakupu.
 */
export function EtykietaZgodaOdstapienie() {
  return (
    <>
      Wyrażam zgodę na rozpoczęcie dostarczania usługi cyfrowej przed upływem
      terminu na odstąpienie od umowy. Przyjmuję do wiadomości, że po pełnym
      wykonaniu usługi przez Usługodawcę utracę prawo odstąpienia od umowy.
    </>
  );
}
