import { NextResponse } from "next/server";
import { zalogowanyUzytkownik } from "@/lib/supabase/klient-serwer";
import { czyMailDostepny, wyslijMail } from "@/lib/mail";
import { mailPowitalny } from "@/lib/maile/tresci";
import { regulaminPdfBuffer } from "@/components/prawne/regulamin-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Mail powitalny po utworzeniu Konta — checklista prawnika (poz. 1):
 * „Wdrożenie systemu wysyłającego regulamin w postaci pliku PDF jako
 * załącznik do każdej wiadomości potwierdzającej utworzenie konta".
 *
 * WOŁANE FIRE-AND-FORGET z `formularz-auth.tsx`, zaraz po zapisaniu zgody na
 * regulamin — rejestracja NIE czeka na tę trasę i NIE pokazuje błędu, gdyby
 * ta się nie powiodła. Autoryzacja idzie przez sesję (`klientSerwer`), nie
 * przez treść żądania — więc nie da się wysłać maila powitalnego na cudzy
 * adres, podając go w body.
 *
 * Nieidempotentne z rozmysłem: to pojedynczy mail powitalny, nie stan konta.
 * Podwójne wywołanie (np. podwójny klik) da co najwyżej dwa identyczne maile
 * — nieszkodliwe, więc nie budujemy dla tego osobnej ochrony.
 */
export async function POST() {
  const user = await zalogowanyUzytkownik();
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Brak sesji." }, { status: 401 });
  }

  if (!czyMailDostepny()) {
    return NextResponse.json({ ok: true, pominieto: true });
  }

  try {
    const pdf = await regulaminPdfBuffer();
    const tresc = mailPowitalny();

    const wynik = await wyslijMail({
      adresat: user.email,
      ...tresc,
      zalaczniki: [{ nazwaPliku: "Regulamin-Aplikando.pdf", tresc: pdf }],
    });

    if (!wynik.ok) console.error("[konto/powitanie] WYSYŁKA NIEUDANA:", wynik.blad);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[konto/powitanie]", e);
    // Awaria generowania PDF-a albo wysyłki nie ma prawa wyglądać dla
    // użytkownika na nieudaną rejestrację — konto już istnieje.
    return NextResponse.json({ ok: true });
  }
}
