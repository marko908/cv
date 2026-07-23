import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

/**
 * WYBÓR MODELI — jedno miejsce, w którym decydujemy, co czym liczymy.
 *
 * Zaczynamy od najtańszej półki. Walidator anty-halucynacyjny działa tak samo
 * niezależnie od modelu, więc tańszy model nie zwiększa ryzyka zmyślania —
 * wpływa tylko na jakość języka i trafność przeformułowań.
 *
 * Modele zapisujemy w formacie „dostawca/model”, więc zmiana modelu albo
 * dostawcy to jedna zmienna w .env.local, bez ruszania kodu.
 */

/** Do zadań mechanicznych: parsowanie ogłoszenia, ekstrakcja z PDF. */
export const MODEL_TANI =
  process.env.CV_MODEL_TANI ?? "google/gemini-3.1-flash-lite";

/** Do planowania zmian — wymaga rozumienia kontekstu oferty. */
export const MODEL_SREDNI =
  process.env.CV_MODEL_SREDNI ?? "google/gemini-3.6-flash";

/**
 * Do przepisywania CV — tu liczy się jakość polszczyzny.
 * Jeśli teksty będą zbyt sztywne, to jest pierwszy model do podniesienia
 * (np. na „google/gemini-3.1-pro-preview”, „openai/gpt-5.6-terra”
 * albo „anthropic/claude-sonnet-5”).
 */
export const MODEL_MOCNY =
  process.env.CV_MODEL_MOCNY ?? "google/gemini-3.6-flash";

/**
 * Zamienia zapis „dostawca/model” na obiekt modelu.
 *
 * Dwie drogi, zależnie od tego, jaki klucz jest w .env.local:
 *  - AI_GATEWAY_API_KEY → przez Vercel AI Gateway (jeden klucz, wszyscy
 *    dostawcy; wtedy SDK sam rozumie string „dostawca/model”),
 *  - klucz konkretnego dostawcy → bezpośrednio przez jego moduł.
 *
 * Dzięki temu ten sam kod działa w obu konfiguracjach.
 */
export function model(id: string): LanguageModel {
  // Gateway obsługuje format „dostawca/model” natywnie.
  if (process.env.AI_GATEWAY_API_KEY) return id;

  const rozdzielnik = id.indexOf("/");
  const dostawca = rozdzielnik === -1 ? "" : id.slice(0, rozdzielnik);
  const nazwa = rozdzielnik === -1 ? id : id.slice(rozdzielnik + 1);

  switch (dostawca) {
    case "google":
      return google(nazwa);
    default:
      throw new Error(
        `Nie potrafię użyć modelu „${id}” bez klucza Gateway. ` +
          `Dodaj AI_GATEWAY_API_KEY do .env.local albo zainstaluj moduł dostawcy „${dostawca}”.`
      );
  }
}

/** Czy w ogóle mamy czym wywołać AI (klucz w .env.local). */
export function czyAiDostepne(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
  );
}
