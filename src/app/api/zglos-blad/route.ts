import { NextResponse } from "next/server";
import {
  MAIL_ZGLOSZENIA,
  czyMailDostepny,
  escapeHtml,
  wyslijMail,
} from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Odbiór zgłoszeń błędów dot. dopasowania/CV.
 *
 * Zgłoszenie leci mailem przez Resend (`lib/mail.ts`). Gdy brakuje klucza albo
 * wysyłka padnie, zgłoszenie i tak ZOSTAJE ZAPISANE w logu serwera i zwracamy
 * użytkownikowi sukces — on zrobił swoje, a nasza infrastruktura to nie jego
 * problem. Log jest dziś jedynym zapasowym kanałem; docelowo zgłoszenie idzie
 * też do tabeli `zgloszenie_bledu` w Supabase (po wpięciu klienta bazy).
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe zgłoszenie." },
      { status: 400 }
    );
  }
}
