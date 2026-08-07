/**
 * Treść trzech checkboxów zgody — JEDNO ŹRÓDŁO, używane w DWÓCH miejscach:
 * przy rejestracji (`formularz-auth.tsx`: zgoda nr 1 wymagana + nr 3
 * nieobowiązkowa) i przy zakupie (`paywall-dialog.tsx`: nr 1 i nr 2, obie
 * wymagane).
 *
 * Brzmienie zgodne z `dokumenty-prawne/wzory-zgod.md` (zgody nr 1–3).
 * Regulamin § 4 ust. 2 pkt 3, ust. 8 pkt 3 i ust. 20 opisuje te same
 * oświadczenia — gdy zmienisz tekst tutaj, zmień go też w tamtych miejscach,
 * bo inaczej regulamin zacznie opisywać checkbox, który realnie mówi coś
 * innego.
 *
 * Linki otwierają się w nowej karcie (`target="_blank"`), żeby kliknięcie
 * w Regulamin nie wyrzuciło użytkownika z wypełnianego formularza rejestracji
 * ani z procesu płatności.
 */

import Link from "next/link";
import { APLIKACJA, FIRMA, SCIEZKI } from "@/lib/prawne/dane";

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

/**
 * Zgoda nr 3 z `wzory-zgod.md` — informacje handlowe pocztą elektroniczną.
 *
 * NIEOBOWIĄZKOWA I NIGDY NIĄ NIE BĘDZIE. Zasada wspólna nr 5 z `wzory-zgod.md`:
 * zgoda, która nie jest niezbędna do świadczenia usługi, nie może warunkować
 * korzystania z niej. Odmowa nie ma prawa zablokować rejestracji — dlatego
 * ten checkbox NIE wchodzi do warunku `disabled` przycisku „Załóż konto".
 *
 * Oznaczenie przedsiębiorcy i nazwa aplikacji idą z `dane.ts`, nie z literału:
 * instrukcja prawnika wymaga, żeby były identyczne we wszystkich dokumentach
 * i formularzach, a zgoda wskazująca innego nadawcę niż regulamin byłaby
 * wadliwa.
 *
 * Link prowadzi do Regulaminu newslettera — Krok III instrukcji wymaga tego
 * wprost („w treści zgody na newsletter umieść aktywny link do tego
 * regulaminu"). Dokument musi więc pozostać opublikowany tak długo, jak długo
 * ten checkbox istnieje.
 */
export function EtykietaZgodaMarketing() {
  return (
    <>
      Wyrażam zgodę na otrzymywanie informacji handlowych o nowościach
      i promocjach w aplikacji „{APLIKACJA.nazwa}
      {"”"}, przesyłanych przez {FIRMA.nazwa} pod podany przeze mnie adres
      poczty elektronicznej. Ponadto
      oświadczam, że zapoznałem/-am się z{" "}
      <Link
        href={SCIEZKI.regulaminNewslettera}
        target="_blank"
        className={KLASA_LINKU}
      >
        Regulaminem newslettera
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
