import type { ReviewFinding } from "@/lib/store";
import { bezPauz } from "@/lib/utils";

/**
 * Treść jednej wskazówki: akapit, opcjonalna lista i zdanie zamykające.
 *
 * WSPÓLNA dla ekranu wyniku w kreatorze (`tailor-flow`) i szczegółów
 * dopasowania (`/app/dopasowania/[id]`) - te same dane w dwóch miejscach mają
 * wyglądać tak samo, a dwie kopie renderu prędzej czy później by się
 * rozjechały (ten sam powód, co przy `score-breakdown`).
 */

/**
 * Rozbija wskazówkę zapisaną PRZED wprowadzeniem pola `items` (2026-09-02).
 *
 * Stare rekordy siedzą w bazie z listą sklejoną w jedno zdanie („Brakuje: A;
 * B; C. Jeśli faktycznie…") i żadna zmiana w `changes.ts` ich nie odmieni -
 * a to właśnie na nich użytkownik ogląda swoją historię dopasowań. Dlatego
 * odzyskujemy strukturę przy renderowaniu.
 *
 * Warunek trzech pozycji jest celowo ostrożny: zwykły akapit z dwukropkiem
 * i jednym średnikiem ma zostać akapitem, a nie zamienić się w listę.
 */
function rozbijStaryZapis(detail: string): {
  detail: string;
  items?: string[];
  podsumowanie?: string;
} {
  const dwukropek = detail.indexOf(": ");
  if (dwukropek === -1) return { detail };

  const czesci = detail
    .slice(dwukropek + 1)
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);
  if (czesci.length < 3) return { detail };

  // Ostatnia pozycja niesie jeszcze zdanie domykające („…od nowa.").
  const ostatnia = czesci[czesci.length - 1];
  const koniec = ostatnia.indexOf(". ");
  const podsumowanie =
    koniec === -1 ? undefined : ostatnia.slice(koniec + 1).trim();
  if (koniec !== -1) czesci[czesci.length - 1] = ostatnia.slice(0, koniec + 1);

  return {
    detail: detail.slice(0, dwukropek + 1),
    items: czesci,
    podsumowanie,
  };
}

export function TrescWskazowki({ finding }: { finding: ReviewFinding }) {
  const maListe = finding.items && finding.items.length > 0;
  const tresc = maListe
    ? {
        detail: finding.detail,
        items: finding.items,
        podsumowanie: finding.podsumowanie,
      }
    : rozbijStaryZapis(finding.detail);

  return (
    <div className="mt-1.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
      <p>{bezPauz(tresc.detail)}</p>
      {tresc.items && tresc.items.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {tresc.items.map((pozycja) => (
            <li key={pozycja}>{bezPauz(pozycja)}</li>
          ))}
        </ul>
      )}
      {(tresc.podsumowanie ?? finding.podsumowanie) && (
        <p>{bezPauz(tresc.podsumowanie ?? finding.podsumowanie ?? "")}</p>
      )}
    </div>
  );
}
