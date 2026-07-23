/**
 * WYBÓR MODELI — jedno miejsce, w którym decydujemy, co czym liczymy.
 *
 * Zaczynamy od najtańszej półki. Walidator anty-halucynacyjny działa tak samo
 * niezależnie od modelu, więc tańszy model nie zwiększa ryzyka zmyślania —
 * wpływa tylko na jakość języka i trafność przeformułowań.
 *
 * Podmiana modelu = jedna zmienna w .env.local, bez ruszania kodu.
 * Modele podajemy w formacie „dostawca/model” (Vercel AI Gateway), więc
 * przejście na OpenAI czy Anthropic to również tylko zmiana tego stringa.
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

/** Czy w ogóle mamy czym wywołać AI (klucz w .env.local). */
export function czyAiDostepne(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
  );
}
