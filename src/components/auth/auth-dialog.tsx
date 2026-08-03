"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUzytkownik } from "@/lib/supabase/uzytkownik";
import { FormularzAuth, TEKSTY_AUTH, type EkranAuth } from "./formularz-auth";

/**
 * BRAMKA KONTA — okienko logowania/rejestracji wywoływane AKCJĄ, nie trasą.
 *
 * Dlaczego modal, a nie przekierowanie: użytkownik klika „Pobierz PDF" tuż po
 * napisaniu CV. Gdyby cała strona zniknęła, pierwsza myśl brzmi „gdzie mi się
 * podziało CV" — dokładnie w momencie, w którym chcemy go pozyskać. Modal
 * zostawia CV widoczne za sobą, a kod z maila wpisuje się w tym samym oknie.
 * Aplikacja robi tak samo z paywallem (wzorzec „płatność w miejscu użycia").
 *
 * Domyślnie pokazujemy REJESTRACJĘ, nie logowanie: kto buduje CV bez konta,
 * ten najczęściej konta nie ma. Osoba, która je ma, zwykle jest już zalogowana.
 */
export function AuthDialog({
  otwarty,
  onOpenChange,
  tytul = "Załóż konto, żeby kontynuować",
  opis,
  ekranPoczatkowy = "rejestracja",
  onSukces,
}: {
  otwarty: boolean;
  onOpenChange: (v: boolean) => void;
  tytul?: string;
  opis?: string;
  ekranPoczatkowy?: EkranAuth;
  onSukces?: () => void;
}) {
  const [ekran, setEkran] = useState<EkranAuth>(ekranPoczatkowy);

  /**
   * Po zamknięciu okno wraca do ekranu wyjściowego — inaczej kolejne kliknięcie
   * „Pobierz PDF" otwiera formularz w miejscu, w którym ktoś skończył ostatnio.
   *
   * Reset robimy W OBSŁUDZE ZDARZENIA, nie w `useEffect`. Efekt z `setState`
   * wywołuje kaskadę renderów (i słusznie wytyka to `react-hooks/set-state-in-effect`),
   * a zamknięcie okna jest zwykłą interakcją — nie ma tu czego synchronizować
   * z systemem zewnętrznym.
   */
  function zmienOtwarcie(v: boolean) {
    if (!v) setEkran(ekranPoczatkowy);
    onOpenChange(v);
  }

  // Nagłówek z kontekstem akcji („żeby pobrać CV") ma sens tylko na ekranie
  // wyjściowym. Gdy użytkownik przełączy się na logowanie albo kod, oprawa musi
  // opisywać to, co faktycznie widzi.
  const wlasny = ekran === ekranPoczatkowy;
  const naglowek = wlasny ? tytul : TEKSTY_AUTH[ekran].tytul;
  const podpis = wlasny ? opis : TEKSTY_AUTH[ekran].opis;

  return (
    <Dialog open={otwarty} onOpenChange={zmienOtwarcie}>
      {/* dvh, nie vh — na telefonie vh liczy się do ekranu bez paska adresu
          i chowa dolne przyciski. Przewija się tylko środek. */}
      <DialogContent className="shadow-dialog flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>{naglowek}</DialogTitle>
          {podpis && <DialogDescription>{podpis}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pt-1">
          <FormularzAuth
            ekranPoczatkowy={ekranPoczatkowy}
            onEkran={setEkran}
            onSukces={onSukces}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Spina akcję wymagającą konta z okienkiem.
 *
 * `zZalogowanym(akcja)` wykonuje akcję od razu, gdy ktoś jest zalogowany,
 * a w przeciwnym razie otwiera okienko i URUCHAMIA AKCJĘ PO ZAŁOŻENIU KONTA.
 * To domknięcie jest istotne: bez niego użytkownik po rejestracji wraca do
 * edytora i musi kliknąć drugi raz, nie wiedząc, czy pierwszy klik zadziałał.
 */
export function useBramaKonta() {
  const { uzytkownik, ladowanie } = useUzytkownik();
  const [otwarty, setOtwarty] = useState(false);
  const akcjaRef = useRef<(() => void) | null>(null);

  function zZalogowanym(akcja: () => void) {
    if (uzytkownik) {
      akcja();
      return;
    }
    akcjaRef.current = akcja;
    setOtwarty(true);
  }

  function onOpenChange(v: boolean) {
    setOtwarty(v);
    if (!v) akcjaRef.current = null;
  }

  function onSukces() {
    setOtwarty(false);
    const akcja = akcjaRef.current;
    akcjaRef.current = null;
    akcja?.();
  }

  return {
    uzytkownik,
    ladowanie,
    zZalogowanym,
    propsyDialogu: { otwarty, onOpenChange, onSukces },
  };
}
