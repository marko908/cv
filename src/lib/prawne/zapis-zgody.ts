/**
 * Zapis udzielonych zgód (regulamin+polityka, zgoda na natychmiastowe
 * świadczenie usługi cyfrowej przed upływem terminu na odstąpienie) —
 * dziennik dowodowy wymagany przez art. 7 ust. 1 RODO: ciężar dowodu, że
 * zgoda została udzielona, spoczywa na administratorze. Checkbox bez
 * trwałego zapisu jest dowodowo bezwartościowy.
 *
 * NIGDY nie rzuca — wzorzec z `lib/mail.ts`. Brak zapisu w dzienniku (awaria
 * bazy, sieci) nie ma prawa zablokować użytkownikowi rejestracji ani zakupu.
 * Walidacja, że checkbox BYŁ zaznaczony, stoi OSOBNO: w UI (przycisk
 * disabled) i na serwerze przy zakupie (`/api/platnosc/checkout` odrzuca
 * żądanie bez obu zgód niezależnie od tego, czy sam zapis się powiedzie).
 *
 * Tabela `zgoda` (`supabase/migrations/20260805103000_zgody.sql`) jest
 * niezmiennym dziennikiem — bez UPDATE/DELETE nawet dla właściciela wiersza.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { WERSJA_DOKUMENTOW } from "./dane";
import type { Database } from "@/lib/supabase/typy-bazy";

export type RodzajZgody = Database["public"]["Enums"]["rodzaj_zgody"];

export async function zapiszZgode(params: {
  klient: SupabaseClient<Database>;
  userId: string;
  rodzaj: RodzajZgody;
  /** np. „rejestracja", „zakup_subskrypcja:pro:rok", „zakup_jednorazowo:<id>". */
  kontekst: string;
  /** Czas rzeczywistego zaznaczenia checkboxa — domyślnie „teraz". */
  udzielonoO?: string;
}): Promise<void> {
  const { klient, userId, rodzaj, kontekst, udzielonoO } = params;

  const { error } = await klient.from("zgoda").insert({
    user_id: userId,
    rodzaj,
    kontekst,
    wersja_dokumentow: WERSJA_DOKUMENTOW,
    udzielono_o: udzielonoO ?? new Date().toISOString(),
  });

  if (error) {
    console.error("[zgoda] nie udało się zapisać zgody", { rodzaj, kontekst, error });
  }
}
