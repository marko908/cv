/**
 * Kontrola plików wgrywanych przez użytkownika (import CV).
 *
 * Kontekst z audytu 2026-08-10. Co jest, a czego NIE MA w zagrożeniach:
 *
 * Plik NIE JEST nigdzie zapisywany ani nikomu serwowany — trafia do pamięci
 * funkcji, zostaje z niego wyciągnięty tekst i znika. Klasyczne „ktoś wgra
 * wirusa, a my go rozdamy dalej" tutaj nie występuje. Realne ryzyko jest inne:
 * biblioteka parsująca dostaje wrogo spreparowane bajty i to ONA jest celem.
 *
 * Stąd dwie kontrole przed przekazaniem czegokolwiek do parsera:
 *  1. SYGNATURA, nie rozszerzenie. Wcześniej format rozpoznawała wyłącznie
 *     końcówka nazwy (`plik.name`), czyli dana w pełni kontrolowana przez
 *     wysyłającego — dowolne bajty nazwane `cv.pdf` szły prosto do pdf.js.
 *  2. WSPÓŁCZYNNIK KOMPRESJI dla DOCX (to zwykły ZIP). Archiwum o rozmiarze
 *     kilku megabajtów potrafi rozpakować się do gigabajtów i wywrócić funkcję
 *     na pamięci, zanim jakikolwiek limit tekstu zdąży zadziałać.
 */

export type FormatPliku = "pdf" | "docx" | "txt";

export class BladPliku extends Error {}

/** Ile razy większa może być zawartość od archiwum, zanim uznamy ją za bombę. */
const MAX_WSPOLCZYNNIK_KOMPRESJI = 120;
/** Twardy limit rozpakowanej zawartości DOCX. */
const MAX_ROZPAKOWANE = 80 * 1024 * 1024;

function zaczynaSie(bajty: Uint8Array, sygnatura: number[]): boolean {
  if (bajty.length < sygnatura.length) return false;
  return sygnatura.every((b, i) => bajty[i] === b);
}

/**
 * Rozpoznaje format po ZAWARTOŚCI. Nazwa pliku służy wyłącznie do odróżnienia
 * DOCX od innych archiwów ZIP — oba mają tę samą sygnaturę `PK\x03\x04`.
 */
export function rozpoznajFormat(bajty: Uint8Array, nazwa: string): FormatPliku {
  const n = nazwa.toLowerCase();

  // %PDF-
  if (zaczynaSie(bajty, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf";

  // PK\x03\x04 — kontener ZIP, czyli m.in. DOCX (ale też XLSX, ODT, JAR…).
  if (zaczynaSie(bajty, [0x50, 0x4b, 0x03, 0x04])) {
    if (!n.endsWith(".docx")) {
      throw new BladPliku(
        "To archiwum, ale nie plik DOCX. Wgraj CV jako PDF, DOCX lub TXT."
      );
    }
    return "docx";
  }

  /*
   * TXT nie ma sygnatury, więc rozpoznajemy go przez wykluczenie: brak bajtów
   * zerowych w próbce (te oznaczają plik binarny) i deklarowane rozszerzenie.
   * Dzięki temu `.exe` przemianowany na `.txt` odpada tutaj, a nie dopiero
   * w dekoderze.
   */
  if (n.endsWith(".txt")) {
    const probka = bajty.subarray(0, 4096);
    if (probka.includes(0)) {
      throw new BladPliku("Ten plik nie jest tekstem. Wgraj PDF, DOCX lub TXT.");
    }
    return "txt";
  }

  throw new BladPliku(
    "Nieobsługiwany format pliku. Wgraj CV w formacie PDF, DOCX lub TXT."
  );
}

/**
 * Sprawdza deklarowane rozmiary wpisów w centralnym katalogu ZIP-a.
 *
 * Czytamy metadane archiwum, a nie rozpakowujemy je — to cały sens: decyzja
 * zapada, ZANIM cokolwiek trafi do pamięci. Uszkodzonego archiwum tu nie
 * odrzucamy (brak katalogu centralnego = przepuszczamy dalej); od zgłoszenia
 * błędu formatu jest parser, a my pilnujemy wyłącznie rozmiaru.
 */
export function sprawdzArchiwumDocx(bajty: Uint8Array): void {
  const EOCD = 0x06054b50;
  const WPIS = 0x02014b50;
  const widok = new DataView(bajty.buffer, bajty.byteOffset, bajty.byteLength);

  // Koniec katalogu centralnego leży na końcu pliku, za komentarzem
  // o długości do 65535 bajtów.
  let eocd = -1;
  const dolnaGranica = Math.max(0, bajty.length - (0xffff + 22));
  for (let i = bajty.length - 22; i >= dolnaGranica; i--) {
    if (widok.getUint32(i, true) === EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) return;

  const wpisow = widok.getUint16(eocd + 10, true);
  let poz = widok.getUint32(eocd + 16, true);

  let rozpakowane = 0;
  for (let i = 0; i < wpisow; i++) {
    if (poz + 46 > bajty.length) return; // katalog niespójny — zostawiamy parserowi
    if (widok.getUint32(poz, true) !== WPIS) return;

    const rozmiar = widok.getUint32(poz + 24, true);
    // 0xFFFFFFFF to znacznik ZIP64: prawdziwy rozmiar siedzi w polu dodatkowym.
    // Nie rozwijamy tego formatu — plik tej wielkości i tak jest poza skalą CV.
    if (rozmiar === 0xffffffff) {
      throw new BladPliku("Ten plik jest zbyt duży do przetworzenia.");
    }
    rozpakowane += rozmiar;

    const dlNazwy = widok.getUint16(poz + 28, true);
    const dlDodatkowe = widok.getUint16(poz + 30, true);
    const dlKomentarza = widok.getUint16(poz + 32, true);
    poz += 46 + dlNazwy + dlDodatkowe + dlKomentarza;
  }

  if (
    rozpakowane > MAX_ROZPAKOWANE ||
    rozpakowane > bajty.length * MAX_WSPOLCZYNNIK_KOMPRESJI
  ) {
    throw new BladPliku("Ten plik jest zbyt duży do przetworzenia.");
  }
}
