import { NextResponse } from "next/server";
import { klientSerwer, zalogowanyUzytkownik } from "@/lib/supabase/klient-serwer";
import { czyMailDostepny, wyslijMail, type ZalacznikMaila } from "@/lib/mail";
import { mailPowitalny } from "@/lib/maile/tresci";
import {
  regulaminNewsletteraPdfBuffer,
  regulaminPdfBuffer,
} from "@/components/prawne/regulamin-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Mail powitalny po utworzeniu Konta — checklista prawnika (poz. 1):
 * „Wdrożenie systemu wysyłającego regulamin w postaci pliku PDF jako
 * załącznik do każdej wiadomości potwierdzającej utworzenie konta".
 *
 * Przy udzielonej zgodzie marketingowej ta sama wiadomość potwierdza także
 * zawarcie Umowy o dostarczanie Newslettera i niesie DRUGI załącznik —
 * regulamin newslettera w PDF (checklista, poz. 42). Nie robimy z tego
 * osobnego maila: zapis następuje w tej samej chwili co rejestracja, więc
 * dwie wiadomości o jednym zdarzeniu byłyby tylko szumem w skrzynce.
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
    // Zgodę czytamy Z BAZY, nie z treści żądania — inaczej ktokolwiek mógłby
    // uderzyć w tę trasę z `{"zgodaMarketing": true}` i dostać potwierdzenie
    // zapisu na newsletter, którego nigdy nie było. Klient zdążył ją zapisać:
    // `zapiszZgodyRejestracji` w `formularz-auth.tsx` kończy się przed tym
    // wywołaniem. Błąd odczytu traktujemy jak brak zgody — mail bez akapitu
    // o newsletterze jest zawsze prawdziwy, mail z akapitem może nie być.
    const supabase = await klientSerwer();
    const { data: profil } = await supabase
      .from("profil")
      .select("zgoda_marketing")
      .eq("id", user.id)
      .single();
    const zgodaMarketing = profil?.zgoda_marketing === true;

    const zalaczniki: ZalacznikMaila[] = [
      { nazwaPliku: "Regulamin-Aplikando.pdf", tresc: await regulaminPdfBuffer() },
    ];
    if (zgodaMarketing) {
      zalaczniki.push({
        nazwaPliku: "Regulamin-newslettera-Aplikando.pdf",
        tresc: await regulaminNewsletteraPdfBuffer(),
      });
    }

    const tresc = mailPowitalny(zgodaMarketing);

    const wynik = await wyslijMail({
      adresat: user.email,
      ...tresc,
      zalaczniki,
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
