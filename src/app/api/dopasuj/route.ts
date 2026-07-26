import { NextResponse } from "next/server";
import { tailoredCvSchema, type TailoredCv } from "@/lib/cv-schema";
import { czyAiDostepne } from "@/lib/ai/models";
import { uruchomDopasowanie } from "@/lib/ai/pipeline";

/**
 * Uruchamia prawdziwe dopasowanie CV do oferty (pipeline AI).
 *
 * Klucz API żyje wyłącznie po stronie serwera, więc cała praca z modelem
 * dzieje się tutaj. Gdy klucza brak, zwracamy 503 — klient wtedy pokazuje
 * demo na mocku, żeby aplikacja działała bez konfiguracji.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request) {
  if (!czyAiDostepne()) {
    return NextResponse.json(
      { ok: false, error: "Brak klucza API — działa tryb demo (mock)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe żądanie." },
      { status: 400 }
    );
  }

  const {
    cv,
    oryginalCv,
    obsluzonePytania,
    template,
    jobText,
    jobUrl = "",
  } = (body ?? {}) as {
    cv?: unknown;
    oryginalCv?: unknown;
    obsluzonePytania?: unknown;
    template?: string;
    jobText?: string;
    jobUrl?: string;
  };

  if (!jobText || jobText.trim().length < 40) {
    return NextResponse.json(
      { ok: false, error: "Wklej pełną treść ogłoszenia (min. 40 znaków)." },
      { status: 400 }
    );
  }

  // Walidujemy CV schematem — nie ufamy kształtowi z klienta.
  const parsed = tailoredCvSchema.safeParse(cv);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe dane CV." },
      { status: 400 }
    );
  }
  const baseCv: TailoredCv = parsed.data;

  // Oryginalne CV (sprzed wywiadu) — opcjonalne odniesienie dla wyniku „przed"
  // i diffu na re-runie. Walidujemy tym samym schematem; przy braku/błędzie
  // pipeline użyje baseCv (zachowanie jak dla pierwszego przebiegu).
  const oryginalParsed = tailoredCvSchema.safeParse(oryginalCv);
  const oryginal: TailoredCv | undefined = oryginalParsed.success
    ? oryginalParsed.data
    : undefined;

  // Id pytań już obsłużonych w tej sesji — tylko stringi, ignorujemy śmieci.
  const obsluzone: string[] = Array.isArray(obsluzonePytania)
    ? obsluzonePytania.filter((x): x is string => typeof x === "string")
    : [];

  try {
    const wynik = await uruchomDopasowanie(baseCv, jobText, {
      oryginalCv: oryginal,
      obsluzonePytania: obsluzone,
    });

    const tailoring = {
      id: makeId(),
      createdAt: Date.now(),
      jobTitle: wynik.jobTitle,
      jobUrl,
      jobText,
      template: template ?? "klasyczny",
      // Punkt wyjścia rekordu = oryginał (gdy podany), by porównanie i historia
      // pokazywały pełną, skumulowaną różnicę, nie tylko ostatnią rundę.
      baseCv: oryginal ?? baseCv,
      tailoredCv: wynik.tailoredCv,
      aiMeta: wynik.aiMeta,
    };

    // Diagnostyka trafia tylko do logów serwera — nie do klienta.
    console.log("[dopasuj]", {
      jobTitle: wynik.jobTitle,
      wynik: `${wynik.aiMeta.matchScoreBefore}→${wynik.aiMeta.matchScoreAfter}`,
      odrzucone: wynik.odrzucone.length,
      ...wynik.diagnostyka,
    });

    return NextResponse.json({ ok: true, tailoring, pytania: wynik.pytania });
  } catch (e) {
    console.error("[dopasuj] błąd pipeline:", e);
    return NextResponse.json(
      { ok: false, error: "Nie udało się przygotować dopasowania." },
      { status: 500 }
    );
  }
}
