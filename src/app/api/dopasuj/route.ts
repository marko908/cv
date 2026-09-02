import { NextResponse } from "next/server";
import { tailoredCvSchema, type TailoredCv } from "@/lib/cv-schema";
import { czyAiDostepne, MODEL_MOCNY } from "@/lib/ai/models";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import { klientAdmin } from "@/lib/supabase/klient-admin";
import {
  czyAktywna,
  limitKonta,
  type OkresRozliczeniowy,
  type PlanId,
  type Subscription,
} from "@/lib/subscription";
import { uruchomDopasowanie } from "@/lib/ai/pipeline";
import { ofertaSchema } from "@/lib/ai/job-offer";
import {
  BladPobraniaOferty,
  czyPoprawnyLink,
  pobierzTrescOferty,
} from "@/lib/ai/fetch-oferta";

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

/**
 * Sesja + limit planu.
 *
 * MODEL (ustalony z Markiem): dopasowanie można uruchomić w każdej chwili —
 * PAYWALL STOI PRZY PEŁNYM RAPORCIE, nie przed analizą. Dlatego konto BEZ
 * subskrypcji przechodzi tędy bez przeszkód; płaci dopiero za wynik
 * (subskrypcja albo jednorazowe odblokowanie tego dopasowania).
 *
 * Limit z planu (30/100) dotyczy więc WYŁĄCZNIE kont z aktywną subskrypcją i
 * tylko im podbijamy licznik — inaczej ktoś, kto wykupi plan w połowie
 * miesiąca, zastałby pulę nadgryzioną przez okres sprzed zakupu.
 *
 * Dla subskrybenta limit zużywamy PRZED wywołaniem modelu: przy odwrotnej
 * kolejności padnięcie zapisu po opłaconej przez nas analizie oddawałoby ją
 * za darmo. RPC sprawdza próg i zwiększa licznik jedną instrukcją, więc dwa
 * równoległe żądania nie przepchną się ponad limit.
 */
async function sprawdzDostep(): Promise<{
  userId: string;
  odpowiedzBledu: null;
} | { userId: null; odpowiedzBledu: NextResponse }> {
  const supabase = await klientSerwer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      odpowiedzBledu: NextResponse.json(
        {
          ok: false,
          kod: "brak-konta",
          error: "Zaloguj się, żeby dopasować CV do oferty.",
        },
        { status: 401 }
      ),
    };
  }

  const { data: s } = await supabase
    .from("subskrypcja")
    .select("*")
    .neq("status", "anulowana")
    .maybeSingle();

  const subskrypcja: Subscription | undefined = s
    ? {
        status: s.status,
        plan: s.plan as PlanId,
        okres: s.okres as OkresRozliczeniowy,
        koniecOkresu: s.koniec_okresu ? Date.parse(s.koniec_okresu) : null,
      }
    : undefined;

  // Konto bez subskrypcji: przepuszczamy. Analiza jest dostępna zawsze,
  // płatność dotyczy PEŁNEGO RAPORTU (paywall w wyniku i w szczegółach
  // dopasowania). Licznika też nie ruszamy — dotyczy puli z planu.
  if (!czyAktywna(subskrypcja)) {
    return { userId: user.id, odpowiedzBledu: null };
  }

  const limit = limitKonta(subskrypcja);
  const { error } = await supabase.rpc("zuzyj_dopasowanie", { p_limit: limit });

  if (error) {
    const wyczerpany = error.message.includes("LIMIT_WYCZERPANY");
    if (!wyczerpany) {
      console.error("[dopasuj] zuzyj_dopasowanie:", error.message);
    }

    return {
      userId: null,
      odpowiedzBledu: NextResponse.json(
        {
          ok: false,
          kod: wyczerpany ? "limit" : "blad-limitu",
          error: wyczerpany
            ? `Wykorzystałeś limit ${limit} dopasowań w tym miesiącu. Odnowi się pierwszego dnia kolejnego miesiąca.`
            : "Nie udało się sprawdzić limitu. Spróbuj ponownie za chwilę.",
        },
        { status: wyczerpany ? 429 : 500 }
      ),
    };
  }

  return { userId: user.id, odpowiedzBledu: null };
}

export async function POST(request: Request) {
  if (!czyAiDostepne()) {
    return NextResponse.json(
      { ok: false, error: "Brak klucza API - działa tryb demo (mock)." },
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
    oferta,
    template,
    jobText,
    jobUrl = "",
  } = (body ?? {}) as {
    cv?: unknown;
    oryginalCv?: unknown;
    obsluzonePytania?: unknown;
    oferta?: unknown;
    template?: string;
    jobText?: string;
    jobUrl?: string;
  };

  // Wystarczy JEDNO z dwóch: treść albo link. Gdy jest sam link, próbujemy
  // pobrać treść tutaj; gdy się nie uda, prosimy o ręczne wklejenie (kod
  // „link-nieudany"), żeby model zawsze dostał komplet informacji.
  let trescOferty = (jobText ?? "").trim();
  if (trescOferty.length < 40) {
    if (!czyPoprawnyLink(jobUrl ?? "")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Podaj link do oferty albo wklej treść ogłoszenia.",
        },
        { status: 400 }
      );
    }
    try {
      trescOferty = await pobierzTrescOferty(jobUrl);
    } catch (e) {
      // `pobierzTrescOferty` zwraca już kompletny, przyjazny komunikat
      // (z prośbą o wklejenie treści) — nic tu nie dokładamy, żeby nie
      // dublować tej samej instrukcji dwa razy w jednym zdaniu.
      const powod =
        e instanceof BladPobraniaOferty
          ? e.message
          : "Nie udało się pobrać treści ogłoszenia z tego linku. Skopiuj całą treść ogłoszenia i wklej ją poniżej, a dopasowanie policzymy dokładnie.";
      return NextResponse.json(
        { ok: false, kod: "link-nieudany", error: powod },
        { status: 422 }
      );
    }
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

  // Sparsowana oferta z wcześniejszej rundy — walidujemy schematem; przy
  // braku/niepoprawnej pipeline sparsuje ofertę od nowa (jak pierwszy przebieg).
  const ofertaParsed = ofertaSchema.safeParse(oferta);
  const ofertaCache = ofertaParsed.success ? ofertaParsed.data : undefined;

  // Sesja i limit sprawdzane PO walidacji wejścia — źle sformułowane żądanie
  // nie ma prawa zjeść komuś dopasowania z puli.
  const dostep = await sprawdzDostep();
  if (dostep.odpowiedzBledu) return dostep.odpowiedzBledu;
  const userId = dostep.userId;

  try {
    const wynik = await uruchomDopasowanie(baseCv, trescOferty, {
      oryginalCv: oryginal,
      obsluzonePytania: obsluzone,
      oferta: ofertaCache,
    });

    const tailoring = {
      id: makeId(),
      createdAt: Date.now(),
      jobTitle: wynik.jobTitle,
      jobUrl,
      jobText: trescOferty,
      template: template ?? "klasyczny",
      // Punkt wyjścia rekordu = oryginał (gdy podany), by porównanie i historia
      // pokazywały pełną, skumulowaną różnicę, nie tylko ostatnią rundę.
      baseCv: oryginal ?? baseCv,
      tailoredCv: wynik.tailoredCv,
      aiMeta: wynik.aiMeta,
    };

    // Dziennik zużycia AI. Rolą `service_role`, bo `zuzycie_ai` jest dla
    // klienta tylko do odczytu (inaczej dałoby się podrobić własne koszty).
    // Zapis nie może wywrócić odpowiedzi — użytkownik ma swój wynik niezależnie
    // od tego, czy nasza telemetria zadziałała.
    try {
      await klientAdmin()
        .from("zuzycie_ai")
        .insert({
          user_id: userId,
          etap: "dopasowanie",
          model: MODEL_MOCNY,
          tokeny_wejscie: wynik.diagnostyka.tokenyWejscie,
          tokeny_wyjscie: wynik.diagnostyka.tokenyWyjscie,
          trwalo_ms: wynik.diagnostyka.czasMs,
          // koszt_usd zostaje 0 do czasu dodania cennika per model — tokeny są
          // faktem zmierzonym, cena byłaby zgadywaniem.
        });
    } catch (e) {
      console.error("[dopasuj] nie zapisano zużycia AI:", e);
    }

    // Diagnostyka trafia tylko do logów serwera — nie do klienta.
    console.log("[dopasuj]", {
      jobTitle: wynik.jobTitle,
      wynik: `${wynik.aiMeta.matchScoreBefore}→${wynik.aiMeta.matchScoreAfter}`,
      odrzucone: wynik.odrzucone.length,
      ...wynik.diagnostyka,
    });

    // Zwracamy sparsowaną ofertę, by klient odesłał ją przy re-runie (cache).
    return NextResponse.json({
      ok: true,
      tailoring,
      pytania: wynik.pytania,
      oferta: wynik.oferta,
    });
  } catch (e) {
    console.error("[dopasuj] błąd pipeline:", e);
    return NextResponse.json(
      { ok: false, error: "Nie udało się przygotować dopasowania." },
      { status: 500 }
    );
  }
}
