"use client";

import { useEffect, useRef } from "react";
import { emptyCv } from "@/lib/cv-schema";
import {
  DEFAULT_SECTIONS,
  useCvStore,
  type SavedCv,
  type Tailoring,
} from "@/lib/store";
import { BRAK_SUBSKRYPCJI, PUSTE_UZYCIE } from "@/lib/subscription";
import { useUzytkownik } from "@/lib/supabase/uzytkownik";
import {
  pobierzCv,
  pobierzDopasowania,
  pobierzUprawnienia,
  usunCv,
  usunDopasowania,
  zapiszCv,
  zapiszDopasowania,
} from "@/lib/supabase/repo";

/**
 * SYNCHRONIZACJA STORE ↔ BAZA.
 *
 * Baza jest źródłem prawdy, Zustand zostaje jako pamięć podręczna interfejsu.
 * Dzięki temu KOMPONENTY SIĘ NIE ZMIENIAJĄ — dalej czytają store, tylko jego
 * zawartość pochodzi teraz z Postgresa.
 *
 * Trzy zadania:
 *  1. Po zalogowaniu wciągnij dane z bazy.
 *  2. Przy pierwszym logowaniu wypchnij to, co użytkownik zbudował BEZ konta
 *     (kreator jest otwarty, więc CV powstaje przed rejestracją).
 *  3. Zapisuj kolejne zmiany do bazy (z debounce).
 *
 * Konflikty rozstrzygamy per rekord: wygrywa ostatni zapis. Przy jednym
 * użytkowniku na kilku urządzeniach to wystarcza, a nie wymaga wersjonowania.
 */

/** Debounce zapisu — edycja CV generuje zmianę na każdy znak. */
const ODSTEP_MS = 900;

/** Czy CV ma cokolwiek wartego zapisania (odpowiednik `cvHasData` ze store'a). */
function maTresc(p: SavedCv): boolean {
  return (
    p.cv.personal_info.full_name.trim().length > 0 || p.cv.experience.length > 0
  );
}

function wyczyscLokalne() {
  useCvStore.setState({
    cv: emptyCv,
    cvs: [],
    tailorings: [],
    activeCvId: null,
    enabledSections: DEFAULT_SECTIONS,
    aiMeta: { addedKeywords: [], changesLog: [] },
    subscription: BRAK_SUBSKRYPCJI,
    usage: PUSTE_UZYCIE,
    odblokowaneDopasowania: [],
  });
}

export function SynchronizacjaKonta() {
  /**
   * `undefined` = sesji jeszcze nie znamy, `null` = na pewno wylogowany.
   * To rozróżnienie jest krytyczne: bez niego pierwszy render kogoś, kto NIGDY
   * się nie logował, wyglądałby jak wylogowanie i skasowałby CV zbudowane
   * anonimowo — czyli dokładnie tę pracę, dla której robimy otwarty kreator.
   */
  const poprzedniUser = useRef<string | null | undefined>(undefined);
  const { uzytkownik, ladowanie } = useUzytkownik();

  /** Id rekordów, o których wiemy, że są w bazie — do wykrywania skasowanych. */
  const znaneCv = useRef<Set<string>>(new Set());
  const znaneDopasowania = useRef<Set<string>>(new Set());
  /** Zapisujemy dopiero po wciągnięciu danych, żeby nie nadpisać bazy pustką. */
  const gotoweDoZapisu = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);

  // ---- 1 i 2: wciągnięcie z bazy + migracja lokalnych danych ----
  useEffect(() => {
    if (ladowanie) return;
    const uid = uzytkownik?.id ?? null;
    if (poprzedniUser.current === uid) return;

    const pierwszyPomiar = poprzedniUser.current === undefined;
    const bylZalogowany = Boolean(poprzedniUser.current);
    poprzedniUser.current = uid;
    userIdRef.current = uid;
    gotoweDoZapisu.current = false;

    if (!uid) {
      // Czyścimy TYLKO przy realnym wylogowaniu. Na wspólnym komputerze kolejna
      // osoba nie ma prawa zobaczyć cudzych CV.
      if (!pierwszyPomiar && bylZalogowany) wyczyscLokalne();
      return;
    }

    void (async () => {
      try {
        const [zBazy, dopasowaniaZBazy, uprawnienia] = await Promise.all([
          pobierzCv(),
          pobierzDopasowania(),
          pobierzUprawnienia(),
        ]);

        const stan = useCvStore.getState();
        const wBazie = new Set(zBazy.map((c) => c.id));
        const wBazieDop = new Set(dopasowaniaZBazy.map((d) => d.id));

        // Migracja: lokalne rekordy, których w bazie nie ma. Puste CV pomijamy —
        // edytor tworzy je automatycznie i zaśmiecałyby bibliotekę na zawsze.
        const doWyslania = stan.cvs.filter((c) => !wBazie.has(c.id) && maTresc(c));
        const dopDoWyslania = stan.tailorings.filter((t) => !wBazieDop.has(t.id));

        if (doWyslania.length > 0) await zapiszCv(uid, doWyslania);
        if (dopDoWyslania.length > 0) await zapiszDopasowania(uid, dopDoWyslania);

        const cvs: SavedCv[] = [...doWyslania, ...zBazy].sort(
          (a, b) => b.updatedAt - a.updatedAt
        );
        const tailorings: Tailoring[] = [
          ...dopDoWyslania,
          ...dopasowaniaZBazy,
        ].sort((a, b) => b.createdAt - a.createdAt);

        znaneCv.current = new Set(cvs.map((c) => c.id));
        znaneDopasowania.current = new Set(tailorings.map((t) => t.id));

        // Aktywne CV: zostaw bieżące, jeśli przetrwało, inaczej pierwsze z listy.
        const aktywne =
          stan.activeCvId && cvs.some((c) => c.id === stan.activeCvId)
            ? stan.activeCvId
            : (cvs[0]?.id ?? null);
        const aktywneCv = cvs.find((c) => c.id === aktywne);

        useCvStore.setState({
          cvs,
          tailorings,
          activeCvId: aktywne,
          ...(aktywneCv
            ? {
                cv: aktywneCv.cv,
                template: aktywneCv.template,
                enabledSections: aktywneCv.enabledSections,
              }
            : {}),
          subscription: uprawnienia.subscription,
          usage: uprawnienia.usage,
          odblokowaneDopasowania: uprawnienia.odblokowaneDopasowania,
        });

        gotoweDoZapisu.current = true;
      } catch (e) {
        // Nie blokujemy pracy: użytkownik dalej edytuje CV lokalnie, a zapis
        // do bazy ruszy przy kolejnym wejściu. Gorzej byłoby wyczyścić ekran.
        console.error("[synchronizacja] Nie udało się wczytać danych konta:", e);
      }
    })();
  }, [uzytkownik, ladowanie]);

  // ---- 3: zapis zmian do bazy ----
  useEffect(() => {
    const odsubskrybuj = useCvStore.subscribe((stan, poprzedni) => {
      if (!gotoweDoZapisu.current || !userIdRef.current) return;
      if (stan.cvs === poprzedni.cvs && stan.tailorings === poprzedni.tailorings)
        return;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const uid = userIdRef.current;
        if (!uid) return;
        const { cvs, tailorings } = useCvStore.getState();

        void (async () => {
          try {
            const usunieteCv = [...znaneCv.current].filter(
              (id) => !cvs.some((c) => c.id === id)
            );
            const usunieteDop = [...znaneDopasowania.current].filter(
              (id) => !tailorings.some((t) => t.id === id)
            );

            await Promise.all([
              zapiszCv(uid, cvs.filter(maTresc)),
              zapiszDopasowania(uid, tailorings),
              usunCv(usunieteCv),
              usunDopasowania(usunieteDop),
            ]);

            znaneCv.current = new Set(cvs.map((c) => c.id));
            znaneDopasowania.current = new Set(tailorings.map((t) => t.id));
          } catch (e) {
            console.error("[synchronizacja] Nie udało się zapisać do bazy:", e);
          }
        })();
      }, ODSTEP_MS);
    });

    return () => {
      odsubskrybuj();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
