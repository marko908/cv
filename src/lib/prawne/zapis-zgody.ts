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

/**
 * Czy użytkownik ma w dzienniku zgodę na Regulamin i Politykę?
 *
 * To jest nasz jedyny wiarygodny sygnał „ten człowiek przeszedł już przez
 * bramkę zgody". Potrzebny przy logowaniu przez Google: OAuth tworzy konto
 * bez naszego formularza, więc nowy użytkownik, który kliknął „Kontynuuj
 * z Google" na ekranie LOGOWANIA, ma konto, a checkboxa nigdy nie widział.
 *
 * Nie da się tego zastąpić datą utworzenia konta ani `last_sign_in_at`:
 * pierwsze jest nieprecyzyjne (ile sekund to „nowe konto"?), a drugie
 * aktualizuje się przy każdym logowaniu. Brak wiersza w dzienniku to fakt,
 * nie heurystyka.
 *
 * Przy błędzie odczytu zwracamy `true` — czyli „nie zawracaj mu głowy".
 * Odwrotny domyślny wybór przy awarii sieci wysyłałby zalogowanego użytkownika
 * na ekran zgód w kółko, mimo że zgodę dawno udzielił.
 */
export async function maZgodeRegulaminowa(
  klient: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { data, error } = await klient
    .from("zgoda")
    .select("id")
    .eq("user_id", userId)
    .eq("rodzaj", "regulamin_polityka")
    .limit(1);

  if (error) {
    console.error("[zgoda] nie udało się sprawdzić zgody regulaminowej", error);
    return true;
  }
  return (data?.length ?? 0) > 0;
}

/**
 * Zgoda marketingowa — STAN + HISTORIA, dwa różne zapisy o dwóch różnych rolach.
 *
 * `profil.zgoda_marketing` to stan bieżący: jedyne pole, którego pyta się kod
 * przed wysyłką i które użytkownik przestawia w ustawieniach. Dziennik `zgoda`
 * to historia zmian tego stanu — niezmienna, więc wycofanie NIE jest zmianą
 * wiersza, tylko nowym wpisem `marketing_wycofanie`.
 *
 * Po co jedno i drugie: przy sporze o wysyłkę po wycofaniu faktem spornym jest
 * MOMENT wycofania, a sam `profil.zgoda_marketing = false` nie mówi, kiedy się
 * to stało (art. 7 ust. 3 RODO — wycofanie ma być tak łatwe jak udzielenie,
 * a więc i tak samo dowodliwe).
 *
 * KOLEJNOŚĆ MA ZNACZENIE: najpierw stan, potem dziennik. Gdyby padło po
 * dzienniku, mielibyśmy wpis o zgodzie, której nikt nie egzekwuje — czyli
 * dokument mówiący, że wysyłamy, przy stanie mówiącym, że nie. Odwrotna
 * kolejność (dziennik pierwszy) dałaby przy awarii coś gorszego: wysyłkę bez
 * śladu w dzienniku. Gdy zapis stanu się nie powiedzie, wpisu do dziennika
 * w ogóle nie robimy.
 *
 * NIGDY nie rzuca — jak `zapiszZgode` i `lib/mail.ts`. Zwraca `true`, gdy stan
 * realnie się zapisał; wołający może to pokazać w UI, ale rejestracji to nie
 * blokuje: konto ma powstać nawet wtedy, gdy nie udało się zapisać zgody,
 * której udzielenie i tak było dobrowolne.
 */
export async function ustawZgodeMarketingowa(params: {
  klient: SupabaseClient<Database>;
  userId: string;
  /** `true` — udzielenie zgody, `false` — jej wycofanie. */
  zgoda: boolean;
  /** np. „rejestracja", „ustawienia". */
  kontekst: string;
  udzielonoO?: string;
}): Promise<boolean> {
  const { klient, userId, zgoda, kontekst, udzielonoO } = params;

  const { error } = await klient
    .from("profil")
    .update({ zgoda_marketing: zgoda })
    .eq("id", userId);

  if (error) {
    console.error("[zgoda] nie udało się zapisać zgody marketingowej", {
      zgoda,
      kontekst,
      error,
    });
    return false;
  }

  await zapiszZgode({
    klient,
    userId,
    rodzaj: zgoda ? "marketing" : "marketing_wycofanie",
    kontekst,
    udzielonoO,
  });

  return true;
}
