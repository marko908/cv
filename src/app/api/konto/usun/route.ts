import { NextResponse } from "next/server";
import { klientSerwer } from "@/lib/supabase/klient-serwer";
import { czyMailDostepny, wyslijMail } from "@/lib/mail";
import { mailKontoUsuniete } from "@/lib/maile/tresci";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Usunięcie konta (RODO art. 17, Regulamin § 4 ust. 14) wraz z potwierdzeniem
 * mailowym.
 *
 * TRASA ISTNIEJE WYŁĄCZNIE PO TO, ŻEBY KOLEJNOŚĆ BYŁA WYKONALNA. Wcześniej
 * `karta-konta.tsx` wołało RPC wprost z przeglądarki — i po tym wywołaniu nie
 * ma już skąd wziąć adresu e-mail, bo kaskada z `profil` czyści wszystko.
 * Adres odczytujemy PRZED kasowaniem, a mail wysyłamy PO potwierdzonym
 * sukcesie: gdyby padło RPC, człowiek dostałby potwierdzenie usunięcia konta,
 * które nadal istnieje.
 *
 * RPC leci klientem SESYJNYM, nie adminem — `usun_moje_konto()` bierze
 * użytkownika z `auth.uid()`, więc nie da się nim skasować cudzego konta,
 * nawet gdyby ta trasa została wywołana z czymkolwiek w body. Body zresztą
 * nie czytamy.
 *
 * Awaria maila NIE zmienia wyniku. Konto jest już usunięte, a prawo do bycia
 * zapomnianym nie zależy od tego, czy dostawca poczty akurat odpowiada.
 */
export async function POST() {
  const supabase = await klientSerwer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Brak sesji." }, { status: 401 });
  }

  const adres = user.email;

  const { error } = await supabase.rpc("usun_moje_konto");
  if (error) {
    console.error("[konto/usun]", error.message);
    return NextResponse.json(
      { ok: false, error: "Nie udało się usunąć konta." },
      { status: 500 }
    );
  }

  if (adres && czyMailDostepny()) {
    const wynik = await wyslijMail({ adresat: adres, ...mailKontoUsuniete() });
    if (!wynik.ok) console.error("[konto/usun] POTWIERDZENIE NIEUDANE:", wynik.blad);
  }

  return NextResponse.json({ ok: true });
}
