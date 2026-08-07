import { NextResponse, type NextRequest } from "next/server";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import { maZgodeRegulaminowa } from "@/lib/prawne/zapis-zgody";

export const runtime = "nodejs";

/**
 * POWRÓT Z LOGOWANIA GOOGLE — wymiana kodu OAuth na sesję.
 *
 * Google odsyła użytkownika tutaj z jednorazowym `code`. Wymiana MUSI iść przez
 * serwer: `exchangeCodeForSession` zapisuje ciasteczka sesji, a Server
 * Components nie mają prawa zapisu (ta sama przyczyna, dla której istnieje
 * `proxy.ts`). Stąd trasa, nie strona.
 *
 * Adres tej trasy trzeba wpisać jako Redirect URL w panelu Supabase
 * (Authentication → URL Configuration). W samym Google Cloud rejestruje się
 * co innego — callback Supabase (`https://<projekt>.supabase.co/auth/v1/callback`),
 * bo to Supabase jest stroną rozmawiającą z Google, nie ta aplikacja.
 */

/** `?wroc=` przyjmuje TYLKO adresy wewnętrzne — inaczej byłby to otwarty redirect. */
function bezpiecznyPowrot(zadany: string | null): string {
  if (!zadany) return "/app";
  return zadany.startsWith("/") && !zadany.startsWith("//") ? zadany : "/app";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const wroc = bezpiecznyPowrot(searchParams.get("wroc"));

  // Użytkownik mógł kliknąć „Anuluj" na ekranie Google — to nie jest awaria,
  // tylko decyzja. Wracamy na logowanie z czytelnym komunikatem zamiast
  // zostawiać go na białej stronie.
  const bladOauth = searchParams.get("error");
  if (bladOauth) {
    const opis = searchParams.get("error_description") ?? bladOauth;
    console.error("[auth/callback] Google odrzucił logowanie:", opis);
    return NextResponse.redirect(`${origin}/logowanie?blad=google`);
  }

  const kod = searchParams.get("code");
  if (!kod) {
    return NextResponse.redirect(`${origin}/logowanie?blad=google`);
  }

  const supabase = await klientSerwer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(kod);

  if (error || !data.user) {
    console.error("[auth/callback] wymiana kodu na sesję nieudana:", error);
    return NextResponse.redirect(`${origin}/logowanie?blad=google`);
  }

  // BRAMKA ZGODY. Konto przez OAuth powstaje bez naszego formularza, więc ktoś,
  // kto kliknął „Kontynuuj z Google" na ekranie LOGOWANIA, ma właśnie założone
  // konto, a checkboxa nie widział. Regulamin § 4 ust. 19 wymaga od niego
  // oświadczenia z ust. 2 pkt 3 — dlatego zanim wpuścimy go do aplikacji,
  // sprawdzamy dziennik zgód i w razie potrzeby odsyłamy na ekran dokończenia.
  const maZgode = await maZgodeRegulaminowa(supabase, data.user.id);
  const cel = maZgode
    ? wroc
    : `/dokoncz-rejestracje?wroc=${encodeURIComponent(wroc)}`;

  return NextResponse.redirect(`${origin}${cel}`);
}
