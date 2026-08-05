/**
 * ZGODY NA PLIKI COOKIES — odczyt, zapis i sprzątanie po wycofaniu.
 *
 * Czysta logika, bez Reacta — dzięki temu da się ją wywołać także spoza drzewa
 * komponentów (np. z modułu ładującego skrypty) i przetestować bez renderu.
 *
 * Podstawa prawna: art. 398 ustawy z 12 lipca 2024 r. – Prawo komunikacji
 * elektronicznej (dawny art. 173 Prawa telekomunikacyjnego). Zgoda PRZED
 * instalacją pliku, wyjątek wyłącznie dla plików niezbędnych.
 * Wymagania w `dokumenty-prawne/specyfikacja-baner-cookies.md`.
 */

import {
  plikiKategorii,
  type KategoriaCookies,
} from "@/lib/prawne/cookies-rejestr";

/**
 * Wersja zestawu zgód. **PODNIEŚ przy każdej zmianie listy narzędzi**
 * (`lib/prawne/cookies-rejestr.ts`).
 *
 * Podniesienie unieważnia wszystkie zapisane zgody i pokazuje baner ponownie.
 * Bez tego dodanie np. Clarity oznaczałoby, że u osoby, która zgodziła się na
 * WĘŻSZY zestaw analityczny, ładujemy narzędzie, na które nigdy nie przystała —
 * czyli przetwarzanie bez zgody.
 */
export const WERSJA_ZGODY = 1;

export const NAZWA_COOKIE_ZGOD = "aplikando_zgody_cookies";

/** 12 miesięcy — tyle deklaruje tabela w Polityce prywatności. */
const WAZNOSC_SEKUND = 60 * 60 * 24 * 365;

/** Kategorie, które użytkownik może wyłączyć. Niezbędne działają zawsze. */
export type KategoriaOpcjonalna = Extract<
  KategoriaCookies,
  "analityczne" | "marketingowe"
>;

export const KATEGORIE_OPCJONALNE = [
  "analityczne",
  "marketingowe",
] as const satisfies readonly KategoriaOpcjonalna[];

export type WyborKategorii = Record<KategoriaOpcjonalna, boolean>;

export type ZapisZgod = {
  wersja: number;
  kategorie: WyborKategorii;
  /** Znacznik czasu ISO — dowód, kiedy zgoda została wyrażona. */
  data: string;
};

/**
 * Stan domyślny: WSZYSTKO WYŁĄCZONE. Przełączniki w panelu startują z tego
 * obiektu, więc żadna zgoda nie jest wstępnie zaznaczona (wymóg nr 3 ze
 * specyfikacji i art. 4 pkt 11 RODO — zgoda musi być czynnością pozytywną).
 */
export const ODRZUC_WSZYSTKO: WyborKategorii = {
  analityczne: false,
  marketingowe: false,
};

export const PRZYJMIJ_WSZYSTKO: WyborKategorii = {
  analityczne: true,
  marketingowe: true,
};

function czyWyborKategorii(wartosc: unknown): wartosc is WyborKategorii {
  if (typeof wartosc !== "object" || wartosc === null) return false;
  const rekord = wartosc as Record<string, unknown>;
  return KATEGORIE_OPCJONALNE.every((k) => typeof rekord[k] === "boolean");
}

function odczytajSurowe(nazwa: string): string | null {
  if (typeof document === "undefined") return null;
  const szukane = `${nazwa}=`;
  for (const kawalek of document.cookie.split("; ")) {
    if (kawalek.startsWith(szukane)) return kawalek.slice(szukane.length);
  }
  return null;
}

/**
 * Zapisany wybór albo `null`, gdy użytkownik jeszcze nie zdecydował — ORAZ gdy
 * zapis pochodzi ze starszej wersji zestawu narzędzi lub jest uszkodzony.
 * `null` zawsze znaczy „pytaj", nigdy „zakładaj zgodę".
 */
export function odczytajZgody(): ZapisZgod | null {
  const surowe = odczytajSurowe(NAZWA_COOKIE_ZGOD);
  if (!surowe) return null;

  try {
    const dane: unknown = JSON.parse(decodeURIComponent(surowe));
    if (typeof dane !== "object" || dane === null) return null;

    const { wersja, kategorie, data } = dane as Record<string, unknown>;
    if (wersja !== WERSJA_ZGODY) return null;
    if (!czyWyborKategorii(kategorie)) return null;

    return {
      wersja: WERSJA_ZGODY,
      kategorie: { ...kategorie },
      data: typeof data === "string" ? data : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function zapiszZgody(kategorie: WyborKategorii): ZapisZgod {
  const zapis: ZapisZgod = {
    wersja: WERSJA_ZGODY,
    kategorie: { ...kategorie },
    data: new Date().toISOString(),
  };

  if (typeof document !== "undefined") {
    // `Secure` tylko na HTTPS: przeglądarka ODRZUCA takie ciasteczko na zwykłym
    // http, więc na wdrożeniu bez certyfikatu wybór nie zapisałby się w ogóle
    // i baner wracałby po każdym kliknięciu. Produkcja i preview Vercela idą
    // po HTTPS, więc realnie atrybut jest ustawiony zawsze.
    const bezpieczne = window.location.protocol === "https:" ? "; Secure" : "";
    const wartosc = encodeURIComponent(JSON.stringify(zapis));
    document.cookie =
      `${NAZWA_COOKIE_ZGOD}=${wartosc}; Path=/; Max-Age=${WAZNOSC_SEKUND}` +
      `; SameSite=Lax${bezpieczne}`;
  }

  return zapis;
}

/**
 * Domeny, na których mogło zostać założone ciasteczko narzędzia.
 *
 * GA zakłada `_ga` na domenie rejestrowalnej (`.aplikando.pl`), a nie na
 * dokładnym hoście — kasowanie wyłącznie z bieżącego hosta zostawiłoby plik
 * nietknięty. Kasujemy więc „w ciemno" na wszystkich sensownych wariantach;
 * usunięcie nieistniejącego ciasteczka jest bezkosztowe.
 */
function domenyDoCzyszczenia(): (string | null)[] {
  const host = window.location.hostname;
  const warianty: (string | null)[] = [null, host, `.${host}`];

  const czlony = host.split(".");
  if (czlony.length > 2) {
    const rejestrowalna = czlony.slice(-2).join(".");
    warianty.push(rejestrowalna, `.${rejestrowalna}`);
  }

  return warianty;
}

function usunCookie(nazwa: string) {
  for (const domena of domenyDoCzyszczenia()) {
    const czescDomeny = domena ? `; Domain=${domena}` : "";
    document.cookie = `${nazwa}=; Path=/; Max-Age=0${czescDomeny}`;
  }
}

/**
 * Kasuje pliki założone przez narzędzia z podanych kategorii.
 *
 * Wycofanie zgody musi REALNIE działać — samo zaprzestanie wysyłania zdarzeń
 * nie wystarcza, bo plik dalej leży na urządzeniu (wymóg ze specyfikacji).
 * Wzorce z gwiazdką (`_ga_*`) dopasowujemy prefiksem, bo identyfikator strumienia
 * GA jest częścią nazwy.
 */
export function usunPlikiKategorii(kategorie: readonly KategoriaCookies[]) {
  if (typeof document === "undefined") return;

  const wzorce = kategorie.flatMap((k) => plikiKategorii(k));
  if (wzorce.length === 0) return;

  const obecne = document.cookie
    .split("; ")
    .map((kawalek) => kawalek.split("=")[0])
    .filter(Boolean);

  for (const wzorzec of wzorce) {
    if (wzorzec.endsWith("*")) {
      const prefiks = wzorzec.slice(0, -1);
      for (const nazwa of obecne) {
        if (nazwa.startsWith(prefiks)) usunCookie(nazwa);
      }
    } else {
      usunCookie(wzorzec);
    }
  }
}

/** Kategorie, które były zaznaczone wcześniej, a w nowym wyborze już nie są. */
export function wycofaneKategorie(
  poprzednie: WyborKategorii | null,
  nowe: WyborKategorii,
): KategoriaOpcjonalna[] {
  if (!poprzednie) return [];
  return KATEGORIE_OPCJONALNE.filter((k) => poprzednie[k] && !nowe[k]);
}
