"use client";

/**
 * PRZENIESIENIE ZGÓD PRZEZ PRZEKIEROWANIE DO GOOGLE.
 *
 * Problem: przy rejestracji hasłem zgoda i utworzenie konta dzieją się w tym
 * samym wywołaniu, więc znacznik czasu wystarczy trzymać w stanie Reacta.
 * Przy OAuth między zaznaczeniem checkboxa a powrotem z sesją leży pełne
 * przekierowanie na obcą domenę — stan komponentu, a często i cała karta,
 * tego nie przeżywają.
 *
 * Dlatego przed `signInWithOAuth` odkładamy tu dwie rzeczy: **czas
 * RZECZYWISTEGO zaznaczenia** (dziennik zgód ma nosić chwilę aktu woli, nie
 * chwilę powrotu z Google, a między nimi bywa minuta ekranu wyboru konta)
 * i to, czy zaznaczona była zgoda marketingowa.
 *
 * `sessionStorage`, nie `localStorage`: to dane jednego, trwającego właśnie
 * przepływu rejestracji. `localStorage` przeżyłby zamknięcie karty i przy
 * następnej wizycie mógłby dokleić zgodę do zupełnie innego logowania.
 *
 * NIE JEST TO ŹRÓDŁO UPRAWNIENIA. Zawartość pochodzi z przeglądarki, więc da
 * się ją podmienić — ale najgorsze, co można nią zrobić, to zapisać sobie
 * własną zgodę marketingową albo przesunąć własny znacznik czasu. Bramką
 * pozostaje ekran `/dokoncz-rejestracje`, który sprawdza stan w BAZIE.
 */

const KLUCZ = "aplikando_zgody_oauth";

export interface ZgodyPrzedOauth {
  /** ISO 8601 — chwila zaznaczenia checkboxów, sprzed przekierowania. */
  znacznik: string;
  marketing: boolean;
}

export function zapamietajZgodyPrzedOauth(dane: ZgodyPrzedOauth): void {
  try {
    sessionStorage.setItem(KLUCZ, JSON.stringify(dane));
  } catch {
    // Tryb prywatny albo zablokowany storage. Rejestracja ma działać dalej —
    // zgoda zapisze się wtedy z czasem powrotu zamiast czasu zaznaczenia,
    // a marketingowa zostanie nieudzielona. Gorzej, ale nie fałszywie.
  }
}

/** Odczytuje i OD RAZU kasuje — te dane dotyczą jednego przepływu. */
export function odbierzZgodyPrzedOauth(): ZgodyPrzedOauth | null {
  try {
    const surowe = sessionStorage.getItem(KLUCZ);
    sessionStorage.removeItem(KLUCZ);
    if (!surowe) return null;

    const dane: unknown = JSON.parse(surowe);
    if (typeof dane !== "object" || dane === null) return null;
    const { znacznik, marketing } = dane as Partial<ZgodyPrzedOauth>;
    if (typeof znacznik !== "string") return null;

    return { znacznik, marketing: marketing === true };
  } catch {
    return null;
  }
}
