import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * OCHRONA PRZED SSRF — pobieranie treści spod adresu podanego przez
 * użytkownika.
 *
 * Problem, który to rozwiązuje (znaleziony w audycie 2026-08-10): trasa
 * `/api/dopasuj` pobiera ogłoszenie o pracę spod adresu wklejonego przez
 * użytkownika, a jego treść ODSYŁA MU Z POWROTEM jako „treść oferty". Bez
 * kontroli adresu to gotowy kanał do czytania rzeczy widocznych z serwera,
 * a nie z internetu: usług na `localhost`, adresów w sieci prywatnej
 * i punktów metadanych chmury (`169.254.169.254`), które potrafią zwracać
 * poświadczenia.
 *
 * Wcześniejsza walidacja (`hostname.includes(".")`) tego nie łapała —
 * `127.0.0.1` też zawiera kropki.
 *
 * Trzy warstwy:
 *  1. tylko `http:`/`https:` (odcina `file:`, `gopher:`, `data:` itd.),
 *  2. host rozwiązywany przez DNS, a wynikowy adres IP sprawdzany względem
 *     zakresów prywatnych, pętli zwrotnej i lokalnych łącza,
 *  3. przekierowania obsługiwane RĘCZNIE — każdy skok przechodzi tę samą
 *     kontrolę, bo inaczej publiczny adres mógłby przekierować na wewnętrzny
 *     (`redirect: "follow"` sprawdziłby wyłącznie pierwszy adres).
 *
 * Czego to NIE rozwiązuje: przepięcia DNS (host zwraca inne IP przy zapytaniu
 * kontrolnym, a inne przy właściwym połączeniu). Pełna odporność wymagałaby
 * łączenia się wprost ze sprawdzonym adresem IP i ręcznego ustawiania nagłówka
 * `Host` wraz z weryfikacją certyfikatu. Nieproporcjonalne do ryzyka:
 * funkcja jest za logowaniem, a zwracamy tekst ogłoszenia, nie dowolne pliki.
 */

export class BladAdresu extends Error {}

/** Maksymalna liczba skoków przekierowań. */
const MAX_PRZEKIEROWAN = 3;

/**
 * Zakresy IPv4, których serwer nie ma prawa odpytywać na życzenie użytkownika.
 * Zapis jako [pierwszy oktet, maska, wartość] byłby nieczytelny, więc
 * sprawdzamy jawnie — to lista, do której się wraca i którą się czyta.
 */
function czyPrywatneIPv4(ip: string): boolean {
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((n) => Number.isNaN(n))) return true;
  const [a, b] = o;

  if (a === 0) return true; // 0.0.0.0/8 — „ten host"
  if (a === 10) return true; // sieć prywatna
  if (a === 127) return true; // pętla zwrotna
  if (a === 169 && b === 254) return true; // link-local + metadane chmury
  if (a === 172 && b >= 16 && b <= 31) return true; // sieć prywatna
  if (a === 192 && b === 168) return true; // sieć prywatna
  if (a === 192 && b === 0) return true; // 192.0.0/24 — przypisania IETF
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true; // testy wydajności
  if (a >= 224) return true; // multicast (224/4) i zarezerwowane (240/4)
  return false;
}

function czyPrywatneIPv6(ip: string): boolean {
  const a = ip.toLowerCase();
  if (a === "::" || a === "::1") return true; // nieokreślony / pętla zwrotna
  if (a.startsWith("fc") || a.startsWith("fd")) return true; // unikalne lokalne
  if (a.startsWith("fe8") || a.startsWith("fe9") || a.startsWith("fea") || a.startsWith("feb"))
    return true; // link-local
  // Adres IPv4 zapisany w IPv6 (`::ffff:127.0.0.1`) — sprawdzamy część IPv4,
  // inaczej pętla zwrotna przeszłaby w innym zapisie.
  const mapowany = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapowany) return czyPrywatneIPv4(mapowany[1]);
  return false;
}

function czyPrywatny(ip: string): boolean {
  const wersja = isIP(ip);
  if (wersja === 4) return czyPrywatneIPv4(ip);
  if (wersja === 6) return czyPrywatneIPv6(ip);
  return true; // nierozpoznany zapis — odrzucamy
}

/**
 * Sprawdza adres i zwraca go w postaci znormalizowanej. Rzuca `BladAdresu`
 * z komunikatem nadającym się do pokazania użytkownikowi.
 */
export async function sprawdzAdresPubliczny(surowy: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(surowy);
  } catch {
    throw new BladAdresu("To nie wygląda na poprawny adres strony.");
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new BladAdresu("Obsługujemy wyłącznie adresy http i https.");
  }

  // Host podany wprost jako adres IP nie wymaga DNS — sprawdzamy od razu.
  if (isIP(u.hostname)) {
    if (czyPrywatny(u.hostname)) {
      throw new BladAdresu("Ten adres nie jest publicznie dostępny.");
    }
    return u;
  }

  if (!u.hostname.includes(".")) {
    // Nazwy bez kropki to hosty z sieci lokalnej (`intranet`, `localhost`).
    throw new BladAdresu("Ten adres nie jest publicznie dostępny.");
  }

  let adresy: { address: string }[];
  try {
    adresy = await lookup(u.hostname, { all: true });
  } catch {
    throw new BladAdresu("Nie udało się odnaleźć tej domeny.");
  }

  if (adresy.length === 0 || adresy.some((a) => czyPrywatny(a.address))) {
    // Odrzucamy, gdy CHOĆ JEDEN wynik jest prywatny — host zwracający kilka
    // adresów nie może przemycić wewnętrznego obok publicznego.
    throw new BladAdresu("Ten adres nie jest publicznie dostępny.");
  }

  return u;
}

/**
 * `fetch` z kontrolą każdego skoku przekierowania i limitem rozmiaru
 * odpowiedzi.
 *
 * Limit rozmiaru jest tu równie ważny jak sama kontrola adresu: bez niego
 * wskazanie pliku na kilka gigabajtów wywraca funkcję na pamięci, zanim
 * cokolwiek zdążymy odrzucić.
 */
export async function pobierzBezpiecznie(
  surowy: string,
  opcje: { timeoutMs: number; maxBajtow: number; naglowki?: Record<string, string> }
): Promise<string> {
  let adres = await sprawdzAdresPubliczny(surowy);

  for (let skok = 0; skok <= MAX_PRZEKIEROWAN; skok++) {
    const res = await fetch(adres, {
      redirect: "manual",
      signal: AbortSignal.timeout(opcje.timeoutMs),
      headers: opcje.naglowki,
    });

    if (res.status >= 300 && res.status < 400) {
      const cel = res.headers.get("location");
      if (!cel) throw new BladAdresu("Strona odesłała niepoprawne przekierowanie.");
      // Adres względny rozwijamy względem bieżącego, potem sprawdzamy od nowa.
      adres = await sprawdzAdresPubliczny(new URL(cel, adres).toString());
      continue;
    }

    if (!res.ok) {
      throw new BladAdresu(`Strona odpowiedziała błędem ${res.status}.`);
    }

    return await odczytajZLimitem(res, opcje.maxBajtow);
  }

  throw new BladAdresu("Za dużo przekierowań pod tym adresem.");
}

/** Czyta odpowiedź strumieniowo i przerywa po przekroczeniu limitu. */
async function odczytajZLimitem(res: Response, maxBajtow: number): Promise<string> {
  const czytnik = res.body?.getReader();
  if (!czytnik) return "";

  const kawalki: Uint8Array[] = [];
  let razem = 0;
  while (true) {
    const { done, value } = await czytnik.read();
    if (done) break;
    razem += value.length;
    if (razem > maxBajtow) {
      await czytnik.cancel();
      break;
    }
    kawalki.push(value);
  }

  const bufor = new Uint8Array(razem > maxBajtow ? maxBajtow : razem);
  let poz = 0;
  for (const k of kawalki) {
    if (poz + k.length > bufor.length) break;
    bufor.set(k, poz);
    poz += k.length;
  }
  return new TextDecoder("utf-8").decode(bufor);
}
