import { NextResponse } from "next/server";

/**
 * Odbiór zgłoszeń błędów dot. dopasowania/CV.
 * NA RAZIE tylko loguje zgłoszenie po stronie serwera.
 *
 * TODO (Krok 4): wysyłać e-mail do zespołu przez Resend, np.:
 *   await resend.emails.send({
 *     from: "zgloszenia@cvcopilot.pl",
 *     to: "support@cvcopilot.pl",
 *     subject: `Zgłoszenie: ${category}`,
 *     text: `${message}\n\nDopasowanie: ${tailoringId}\nStanowisko: ${jobTitle}`,
 *   });
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

    // Placeholder do czasu podłączenia Resend (Krok 4).
    console.log("[zgłoszenie błędu]", {
      category,
      message,
      tailoringId: tailoringId ?? null,
      jobTitle: jobTitle ?? null,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe zgłoszenie." },
      { status: 400 }
    );
  }
}
