import { NextResponse } from "next/server";
import { czyAiDostepne } from "@/lib/ai/models";
import {
  czyObslugiwanyPlik,
  parsujCvZTekstu,
  przytnijDoModelu,
  wyodrebnijTekstZLinkami,
} from "@/lib/ai/parse-cv";
import {
  BladPliku,
  rozpoznajFormat,
  sprawdzArchiwumDocx,
} from "@/lib/bezpieczenstwo/pliki";

/**
 * Import zewnętrznego CV: plik (PDF/DOCX/TXT) → ustrukturyzowane CV.
 *
 * Ekstrakcja tekstu jest kodem; mapowanie na schemat robi AI, więc trasa
 * wymaga klucza (bez niego 503). Klucz żyje tylko po stronie serwera.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  if (!czyAiDostepne()) {
    return NextResponse.json(
      { ok: false, error: "Brak klucza API - import CV wymaga podłączonego modelu." },
      { status: 503 }
    );
  }

  let plik: File | null = null;
  try {
    const form = await request.formData();
    const wartosc = form.get("plik");
    if (wartosc instanceof File) plik = wartosc;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowe żądanie." },
      { status: 400 }
    );
  }

  if (!plik) {
    return NextResponse.json(
      { ok: false, error: "Nie wgrano pliku." },
      { status: 400 }
    );
  }
  if (!czyObslugiwanyPlik(plik.name)) {
    return NextResponse.json(
      { ok: false, error: "Nieobsługiwany format. Wgraj PDF, DOCX lub TXT." },
      { status: 400 }
    );
  }
  if (plik.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Plik jest za duży (maks. 5 MB)." },
      { status: 400 }
    );
  }

  try {
    const bytes = new Uint8Array(await plik.arrayBuffer());

    /*
     * Kontrola ZAWARTOŚCI przed oddaniem bajtów parserowi. Sprawdzenie
     * rozszerzenia wyżej jest tylko szybkim odsianiem — nazwa pliku pochodzi
     * od wysyłającego, więc sama w sobie nie jest żadnym zabezpieczeniem.
     */
    const format = rozpoznajFormat(bytes, plik.name);
    if (format === "docx") sprawdzArchiwumDocx(bytes);

    // Razem z tekstem zbieramy adresy ukryte pod hiperłączami (np. napis
    // „LinkedIn" podpięty pod prawdziwy adres profilu).
    const { tekst, linki } = await wyodrebnijTekstZLinkami(bytes, plik.name);

    if (tekst.replace(/\s+/g, "").length < 40) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nie udało się odczytać tekstu z pliku. Jeśli to skan (obraz), zapisz CV jako PDF z tekstem lub wgraj wersję DOCX/TXT.",
        },
        { status: 422 }
      );
    }

    const wynik = await parsujCvZTekstu(przytnijDoModelu(tekst), linki);

    // Diagnostyka tylko do logów serwera — pomaga oceniać jakość parsera.
    console.log("[parsuj-cv]", {
      plik: plik.name,
      dlugoscTekstu: wynik.dlugoscTekstu,
      linki: linki.length,
      pozycje: wynik.cv.experience.length,
      umiejetnosci: wynik.cv.skills.technical.length,
      tokeny: wynik.zuzycie,
    });

    return NextResponse.json({
      ok: true,
      cv: wynik.cv,
      dlugoscTekstu: wynik.dlugoscTekstu,
      linki: linki.length,
    });
  } catch (e) {
    // Odrzucenie z powodu formatu/rozmiaru to informacja DLA użytkownika
    // (wgrał nie to, co trzeba), a nie awaria serwera — stąd 400 i własny
    // komunikat zamiast ogólnego 500.
    if (e instanceof BladPliku) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    console.error("[parsuj-cv] błąd:", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Nie udało się przetworzyć pliku. Spróbuj ponownie lub wgraj inny format (PDF/DOCX/TXT).",
      },
      { status: 500 }
    );
  }
}
