"use client";

/**
 * Panel „Dostosuj" / „Ustawienia cookies" — przełączniki kategorii i pełna
 * informacja o każdym narzędziu.
 *
 * Wymóg informacyjny (specyfikacja, wiersz 6): przy każdym pliku musi stać jego
 * nazwa, dostawca, funkcja, zakres danych i okres działania. Dane pochodzą
 * z `lib/prawne/cookies-rejestr.ts` — z tego samego rejestru, z którego
 * generowana jest tabela w Polityce prywatności, więc panel nie może zacząć
 * mówić czegoś innego niż dokument.
 *
 * Układ modalu: `flex-col` z przewijanym WYŁĄCZNIE środkiem i wysokością w `dvh`
 * (nie `vh`) — konwencja z `STRUKTURA.md`. Na telefonie `vh` liczy się do ekranu
 * bez paska adresu, więc przyciski zapisu chowałyby się pod nim.
 */

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

import { useZgodyCookies } from "./kontekst-zgod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  ODRZUC_WSZYSTKO,
  PRZYJMIJ_WSZYSTKO,
  type KategoriaOpcjonalna,
  type WyborKategorii,
} from "@/lib/cookies/zgody";
import {
  narzedziaKategorii,
  type KategoriaCookies,
  type NarzedzieCookies,
} from "@/lib/prawne/cookies-rejestr";

type OpisKategorii = {
  kategoria: KategoriaCookies;
  tytul: string;
  opis: string;
};

/**
 * Opisy pisane prostym językiem — wymóg nr 1 ze specyfikacji. Kategorie muszą
 * być dokładnie te trzy co w tabeli Polityki prywatności.
 */
const KATEGORIE: readonly OpisKategorii[] = [
  {
    kategoria: "niezbędne",
    tytul: "Niezbędne",
    opis:
      "Bez nich Aplikacja nie działa: utrzymanie zalogowania, bezpieczna płatność, " +
      "pamięć kreatora CV i zapamiętanie tego, co teraz wybierzesz. Nie można ich wyłączyć.",
  },
  {
    kategoria: "analityczne",
    tytul: "Analityczne",
    opis:
      "Pokazują nam, ile osób korzysta z Aplikacji, skąd trafiają i w którym miejscu " +
      "napotykają problem. Używamy tego wyłącznie do poprawiania Aplikacji.",
  },
  {
    kategoria: "marketingowe",
    tytul: "Marketingowe",
    opis:
      "Pozwalają pokazać Ci naszą reklamę na Facebooku i Instagramie oraz sprawdzić, " +
      "czy była skuteczna.",
  },
];

function WierszSzczegolu({ etykieta, tresc }: { etykieta: string; tresc: string }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      <span className="font-medium text-foreground">{etykieta}:</span> {tresc}
    </p>
  );
}

function Narzedzie({ narzedzie }: { narzedzie: NarzedzieCookies }) {
  return (
    <li className="rounded-md bg-background/60 p-3">
      <p className="text-xs font-semibold text-foreground">{narzedzie.narzedzie}</p>
      <div className="mt-1.5 space-y-1">
        <WierszSzczegolu etykieta="Dostawca" tresc={narzedzie.dostawca} />
        <WierszSzczegolu etykieta="Do czego służy" tresc={narzedzie.funkcje} />
        <WierszSzczegolu etykieta="Okres działania" tresc={narzedzie.okres} />
      </div>
    </li>
  );
}

function SekcjaKategorii({
  opis,
  wlaczona,
  naZmiane,
}: {
  opis: OpisKategorii;
  wlaczona: boolean;
  /** Brak funkcji = kategoria niezbędna, przełącznik zablokowany. */
  naZmiane?: (wartosc: boolean) => void;
}) {
  const narzedzia = narzedziaKategorii(opis.kategoria);
  const idOpisu = `zgody-opis-${opis.kategoria}`;

  return (
    <section className="rounded-lg bg-secondary p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{opis.tytul}</h3>
          <p id={idOpisu} className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {opis.opis}
          </p>
        </div>

        <Switch
          className="mt-0.5 shrink-0"
          checked={wlaczona}
          disabled={!naZmiane}
          onCheckedChange={naZmiane}
          aria-label={`Zgoda na pliki: ${opis.tytul.toLowerCase()}`}
          aria-describedby={idOpisu}
        />
      </div>

      <CollapsiblePrimitive.Root className="mt-3">
        <CollapsiblePrimitive.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5 data-open:[&>svg]:rotate-180"
          >
            <ChevronDownIcon className="transition-transform" />
            {narzedzia.length === 1
              ? "Pokaż narzędzie i pliki"
              : `Pokaż narzędzia i pliki (${narzedzia.length})`}
          </Button>
        </CollapsiblePrimitive.Trigger>

        <CollapsiblePrimitive.Content>
          <ul className="mt-2 space-y-2">
            {narzedzia.map((narzedzie) => (
              <Narzedzie key={narzedzie.narzedzie} narzedzie={narzedzie} />
            ))}
          </ul>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    </section>
  );
}

/**
 * Wnętrze panelu — osobny komponent, bo TU mieszka stan przełączników.
 *
 * Radix odmontowuje zawartość zamkniętego okna, więc przy każdym otwarciu ten
 * komponent montuje się od nowa i `useState` startuje od `poczatkowy`. Dzięki
 * temu panel zawsze pokazuje AKTUALNIE zapisany wybór, bez efektu
 * synchronizującego stan (`useEffect` + `setState` przy otwarciu to kaskada
 * renderów, którą wytyka `react-hooks/set-state-in-effect`).
 */
function TrescPanelu({
  poczatkowy,
  zapisz,
}: {
  poczatkowy: WyborKategorii;
  zapisz: (wybor: WyborKategorii) => void;
}) {
  const [wybor, setWybor] = useState<WyborKategorii>(poczatkowy);

  const przelacz = (kategoria: KategoriaOpcjonalna) => (wartosc: boolean) =>
    setWybor((poprzedni) => ({ ...poprzedni, [kategoria]: wartosc }));

  return (
    <>
      <DialogHeader className="shrink-0 p-4 pr-12 text-left">
        <DialogTitle>Ustawienia plików cookies</DialogTitle>
        <DialogDescription>
          Zdecyduj, na co się zgadzasz. Odmowa niczego nie ogranicza — Aplikacja
          działa tak samo.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {KATEGORIE.map((opis) => {
          const opcjonalna = opis.kategoria !== "niezbędne";
          const klucz = opis.kategoria as KategoriaOpcjonalna;

          return (
            <SekcjaKategorii
              key={opis.kategoria}
              opis={opis}
              wlaczona={opcjonalna ? wybor[klucz] : true}
              naZmiane={opcjonalna ? przelacz(klucz) : undefined}
            />
          );
        })}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/50 p-4 sm:flex-row sm:justify-end">
        <Button
          size="lg"
          variant="secondary"
          className="btn-label"
          onClick={() => zapisz(ODRZUC_WSZYSTKO)}
        >
          Odrzuć wszystkie
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="btn-label"
          onClick={() => zapisz(PRZYJMIJ_WSZYSTKO)}
        >
          Akceptuję wszystkie
        </Button>
        <Button size="lg" className="btn-label" onClick={() => zapisz(wybor)}>
          Zapisz wybór
        </Button>
      </div>
    </>
  );
}

export function PanelCookies() {
  const { panelOtwarty, zamknijPanel, zapisz, zgody } = useZgodyCookies();

  return (
    <Dialog
      open={panelOtwarty}
      onOpenChange={(otwarty) => {
        if (!otwarty) zamknijPanel();
      }}
    >
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/*
          Zgoda nigdy nie jest wstępnie zaznaczona (wymóg nr 3 ze specyfikacji):
          bez zapisanego wyboru przełączniki startują z ODRZUC_WSZYSTKO.
        */}
        <TrescPanelu
          poczatkowy={zgody?.kategorie ?? ODRZUC_WSZYSTKO}
          zapisz={zapisz}
        />
      </DialogContent>
    </Dialog>
  );
}
