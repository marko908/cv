"use client";

/**
 * Stan zgód cookies dla całej aplikacji + montaż banera, panelu i skryptów
 * narzędzi. Dostawca stoi w `app/layout.tsx`, więc obowiązuje na każdej trasie.
 *
 * BRAK MIGOTANIA: cookie odczytujemy w efekcie po hydracji, a do tego czasu
 * `gotowe === false` i baner NIE jest renderowany. Osoba, która już
 * zdecydowała, nigdy nie zobaczy błysku banera — bo baner pojawia się dopiero
 * wtedy, gdy WIEMY, że zapisanej zgody nie ma. Odwrotny układ (render banera
 * od razu, chowanie po odczycie) dawałby błysk przy każdym wejściu.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { BanerCookies } from "./baner-cookies";
import { PanelCookies } from "./panel-cookies";
import { SkryptyNarzedzi } from "./skrypty-narzedzi";
import {
  ODRZUC_WSZYSTKO,
  KATEGORIE_OPCJONALNE,
  odczytajZgody,
  usunPlikiKategorii,
  wycofaneKategorie,
  zapiszZgody,
  type KategoriaOpcjonalna,
  type WyborKategorii,
  type ZapisZgod,
} from "@/lib/cookies/zgody";
import {
  ustawDomyslneZgodyGoogle,
  zaktualizujZgodyGoogle,
} from "@/lib/cookies/tryb-zgody-google";

type KontekstZgod = {
  /** Zapisany wybór albo `null` — użytkownik jeszcze nie zdecydował. */
  zgody: ZapisZgod | null;
  /** `false` do czasu odczytu cookie po hydracji. */
  gotowe: boolean;
  panelOtwarty: boolean;
  otworzPanel: () => void;
  zamknijPanel: () => void;
  zapisz: (wybor: WyborKategorii) => void;
};

const Kontekst = createContext<KontekstZgod | null>(null);

export function useZgodyCookies(): KontekstZgod {
  const kontekst = useContext(Kontekst);
  if (!kontekst) {
    throw new Error(
      "useZgodyCookies wymaga DostawcaZgodCookies (app/layout.tsx)",
    );
  }
  return kontekst;
}

/** Kategorie, na które NIE ma zgody — ich pliki nie mają prawa leżeć na dysku. */
function bezZgody(zgody: ZapisZgod | null): KategoriaOpcjonalna[] {
  return KATEGORIE_OPCJONALNE.filter((k) => !zgody?.kategorie[k]);
}

export function DostawcaZgodCookies({
  children,
}: {
  children: React.ReactNode;
}) {
  const [zgody, setZgody] = useState<ZapisZgod | null>(null);
  const [gotowe, setGotowe] = useState(false);
  const [panelOtwarty, setPanelOtwarty] = useState(false);

  useEffect(() => {
    // Polityka zgód Google musi stać w kolejce przed jakimkolwiek skryptem —
    // to same wpisy do dataLayer, żadnych plików ani żądań sieciowych.
    ustawDomyslneZgodyGoogle();

    const zapis = odczytajZgody();
    setZgody(zapis);
    setGotowe(true);
    if (zapis) zaktualizujZgodyGoogle(zapis.kategorie);

    // Sprzątanie przy KAŻDYM wejściu, nie tylko w chwili wycofania zgody.
    // Powody: (a) narzędzie mogło zdążyć zapisać plik w milisekundach między
    // kliknięciem „wycofuję" a przeładowaniem strony, (b) zgoda mogła wygasnąć
    // albo unieważnić się podniesieniem WERSJA_ZGODY, a pliki zostały.
    usunPlikiKategorii(bezZgody(zapis));
  }, []);

  const zapisz = useCallback(
    (wybor: WyborKategorii) => {
      const wycofane = wycofaneKategorie(zgody?.kategorie ?? null, wybor);

      setZgody(zapiszZgody(wybor));
      setPanelOtwarty(false);
      zaktualizujZgodyGoogle(wybor);

      if (wycofane.length === 0) return;

      // Wycofanie zgody musi działać naprawdę: kasujemy pliki narzędzia
      // i przeładowujemy stronę. Samo odmontowanie <script> nie usuwa kodu,
      // który już działa w pamięci karty — dopóki strona żyje, narzędzie
      // mogłoby dalej nasłuchiwać i wysyłać zdarzenia.
      usunPlikiKategorii(wycofane);
      window.location.reload();
    },
    [zgody],
  );

  const wartosc = useMemo<KontekstZgod>(
    () => ({
      zgody,
      gotowe,
      panelOtwarty,
      otworzPanel: () => setPanelOtwarty(true),
      zamknijPanel: () => setPanelOtwarty(false),
      zapisz,
    }),
    [zgody, gotowe, panelOtwarty, zapisz],
  );

  const kategorie = zgody?.kategorie ?? ODRZUC_WSZYSTKO;

  return (
    <Kontekst.Provider value={wartosc}>
      {children}
      {gotowe && !zgody && !panelOtwarty && <BanerCookies />}
      <PanelCookies />
      <SkryptyNarzedzi kategorie={kategorie} />
    </Kontekst.Provider>
  );
}
