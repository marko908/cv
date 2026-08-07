import { NextResponse } from "next/server";
import {
  MAIL_ZGLOSZENIA,
  czyMailDostepny,
  escapeHtml,
  wyslijMail,
} from "@/lib/mail";
import { mailZgloszenieOdebrane } from "@/lib/maile/tresci";
import { zalogowanyUzytkownik } from "@/lib/supabase/klient-serwer";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Odbiór zgłoszeń błędów dot. dopasowania/CV.
 *
 * DWA MAILE, dwa różne cele. Do nas (`MAIL_ZGLOSZENIA`) leci raport z treścią
 * zgłoszenia — goły HTML, bo to poczta wewnętrzna, nie komunikacja z klientem.
 * Do zgłaszającego leci potwierdzenie przyjęcia we wspólnej oprawie: zgłoszenie
 * może być reklamacją w rozumieniu Regulaminu § 7, a wtedy biegnie nam 14-dniowy
 * termin na odpowiedź — człowiek ma prawo wiedzieć, że jego pismo dotarło.
 *
 * Gdy brakuje klucza albo wysyłka padnie, zgłoszenie i tak ZOSTAJE ZAPISANE
 * w logu serwera i zwracamy użytkownikowi sukces — on zrobił swoje, a nasza
 * infrastruktura to nie jego problem. Log jest dziś jedynym zapasowym kanałem;
 * docelowo zgłoszenie idzie też do tabeli `zgloszenie_bledu` w Supabase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, message, tailoringId, jobTitle } = body ?? {};

    if (!category || !message || String(message).trim().length < 5) {
      return NextResponse.json(
        { ok: false, error: "Uzupełnij kategorię i opis (min. 5 znaków)." },
        { status: 400 }
      );
    }

    const zgloszenie = {
      category: String(category),
      message: String(message).trim(),
      tailoringId: tailoringId ? String(tailoringId) : null,
      jobTitle: jobTitle ? String(jobTitle) : null,
      at: new Date().toISOString(),
    };

    console.log("[zgłoszenie błędu]", zgloszenie);

    if (czyMailDostepny() && MAIL_ZGLOSZENIA) {
      const wiersze = [
        ["Kategoria", zgloszenie.category],
        ["Dopasowanie", zgloszenie.tailoringId ?? "—"],
        ["Stanowisko", zgloszenie.jobTitle ?? "—"],
        ["Zgłoszono", zgloszenie.at],
      ]
        .map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v)}</p>`)
        .join("");

      const wynik = await wyslijMail({
        adresat: MAIL_ZGLOSZENIA,
        temat: `Aplikando — zgłoszenie: ${zgloszenie.category}`,
        html: `${wiersze}<hr><p>${escapeHtml(zgloszenie.message).replace(/\n/g, "<br>")}</p>`,
        text: `Kategoria: ${zgloszenie.category}\nDopasowanie: ${zgloszenie.tailoringId ?? "—"}\nStanowisko: ${zgloszenie.jobTitle ?? "—"}\n\n${zgloszenie.message}`,
      });

      // Głośno w logach, cicho dla użytkownika — patrz komentarz nad funkcją.
      if (!wynik.ok) console.error("[zgłoszenie błędu] WYSYŁKA NIEUDANA:", wynik.blad);
    } else {
      console.warn(
        "[zgłoszenie błędu] Mail pominięty — brak RESEND_API_KEY lub MAIL_ZGLOSZENIA."
      );
    }

    // Potwierdzenie dla zgłaszającego. Adres bierzemy WYŁĄCZNIE z sesji, nigdy
    // z treści żądania — inaczej ta trasa byłaby otwartym nadajnikiem, którym
    // da się wysłać wiadomość na dowolny cudzy adres. Zgłoszenie od
    // niezalogowanego zostaje bez potwierdzenia; formularz i tak stoi przy
    // dopasowaniu, czyli za bramką konta.
    if (czyMailDostepny()) {
      const user = await zalogowanyUzytkownik();
      if (user?.email) {
        const potwierdzenie = await wyslijMail({
          adresat: user.email,
          ...mailZgloszenieOdebrane({ kategoria: zgloszenie.category }),
          // Odpowiedź na potwierdzenie ma trafiać do obsługi, nie w próżnię
          // adresu nadawczego, którego nikt nie czyta.
          odpowiedzDo: MAIL_ZGLOSZENIA || undefined,
        });
        if (!potwierdzenie.ok) {
          console.error("[zgłoszenie błędu] POTWIERDZENIE NIEUDANE:", potwierdzenie.blad);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe zgłoszenie." },
      { status: 400 }
    );
  }
}
