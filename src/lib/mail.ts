import { Resend } from "resend";

/**
 * WYSYŁKA MAILI — jedno miejsce, przez które aplikacja wysyła pocztę.
 *
 * UWAGA, ŻEBY NIE POMYLIĆ DWÓCH RZECZY:
 *  - Maile AUTORYZACYJNE (kod aktywacyjny, reset hasła) wysyła SUPABASE, przez
 *    SMTP Resendu. Ten plik ich NIE dotyczy i nigdy nie będzie — konfiguracja
 *    siedzi w panelu Supabase (Authentication → Emails → SMTP Settings), a ten
 *    sam klucz `re_...` wpisuje się tam jako HASŁO SMTP.
 *  - Maile WŁASNE aplikacji (zgłoszenie błędu, w przyszłości np. powiadomienia)
 *    idą stąd, przez API Resendu.
 *
 * ZASADA: wysyłka NIGDY nie wywraca żądania użytkownika. Człowiek, który
 * zgłasza błąd, nie ma prawa zobaczyć „coś poszło nie tak" tylko dlatego, że
 * nasz dostawca poczty ma awarię. Funkcje stąd zwracają wynik, nie rzucają.
 */

const KLUCZ = process.env.RESEND_API_KEY;

/**
 * Nadawca. Do czasu kupienia domeny sensowny jest `onboarding@resend.dev` —
 * adres testowy Resendu, który wysyła WYŁĄCZNIE na adres właściciela konta.
 * Po weryfikacji domeny podmieniamy na `Aplikando <noreply@…>` w .env.local.
 */
export const MAIL_OD = process.env.MAIL_OD ?? "Aplikando <onboarding@resend.dev>";

/** Skrzynka, na którą lecą zgłoszenia błędów od użytkowników. */
export const MAIL_ZGLOSZENIA = process.env.MAIL_ZGLOSZENIA ?? "";

/** Czy mamy czym wysłać (klucz + adresat zgłoszeń). Wzorzec z `czyAiDostepne`. */
export function czyMailDostepny(): boolean {
  return Boolean(KLUCZ);
}

let klient: Resend | null = null;

/** Leniwy singleton — bez klucza w ogóle nie tworzymy klienta. */
function resend(): Resend {
  if (!KLUCZ) throw new Error("Brak RESEND_API_KEY.");
  klient ??= new Resend(KLUCZ);
  return klient;
}

export type WynikWysylki =
  | { ok: true; id: string | null }
  | { ok: false; blad: string };

export interface ZalacznikMaila {
  nazwaPliku: string;
  /** Resend przyjmuje surowe bajty — Buffer z `renderToBuffer` (react-pdf) pasuje wprost. */
  tresc: Buffer;
}

export interface Mail {
  adresat: string | string[];
  temat: string;
  html: string;
  /** Wersja tekstowa — bez niej filtry antyspamowe patrzą na maila gorzej. */
  text?: string;
  /** Adres do odpowiedzi, gdy inny niż nadawca (np. mail zgłaszającego). */
  odpowiedzDo?: string;
  /** Np. Regulamin w PDF przy potwierdzeniu konta/zamówienia. */
  zalaczniki?: ZalacznikMaila[];
}

/**
 * Wysyła maila i ZAWSZE zwraca wynik — nie rzuca wyjątkiem.
 * Wołający decyduje, czy niepowodzenie jest dla użytkownika istotne.
 */
export async function wyslijMail(mail: Mail): Promise<WynikWysylki> {
  if (!czyMailDostepny()) {
    return { ok: false, blad: "Brak RESEND_API_KEY — wysyłka wyłączona." };
  }

  try {
    const { data, error } = await resend().emails.send({
      from: MAIL_OD,
      to: mail.adresat,
      subject: mail.temat,
      html: mail.html,
      text: mail.text,
      replyTo: mail.odpowiedzDo,
      attachments: mail.zalaczniki?.map((z) => ({
        filename: z.nazwaPliku,
        content: z.tresc,
      })),
    });

    // Resend zwraca błąd W ODPOWIEDZI, nie przez wyjątek — samo `await` bez
    // sprawdzenia `error` wygląda na sukces przy odrzuconej wysyłce.
    if (error) return { ok: false, blad: `${error.name}: ${error.message}` };

    return { ok: true, id: data?.id ?? null };
  } catch (e) {
    return { ok: false, blad: e instanceof Error ? e.message : String(e) };
  }
}

/** Escapowanie treści od użytkownika — trafia do HTML-a maila. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
