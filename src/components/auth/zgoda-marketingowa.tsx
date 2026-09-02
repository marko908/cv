"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { ustawZgodeMarketingowa } from "@/lib/prawne/zapis-zgody";
import { SCIEZKI } from "@/lib/prawne/dane";

/**
 * WYCOFANIE (i udzielenie) ZGODY MARKETINGOWEJ — sekcja „Konto" w ustawieniach.
 *
 * Art. 7 ust. 3 RODO: wycofanie zgody musi być tak samo łatwe jak jej
 * udzielenie. Zgody udziela się jednym kliknięciem w checkbox przy rejestracji,
 * więc wycofanie też musi być jednym kliknięciem — nie mailem z prośbą i nie
 * formularzem kontaktowym. Regulamin § 4 ust. 20 i Polityka prywatności (cel
 * nr 12) OBIECUJĄ ten przełącznik wprost; gdyby go tu nie było, oba dokumenty
 * opisywałyby funkcję, której nie ma.
 *
 * Przełącznik działa też w drugą stronę: kto przy rejestracji zgody nie
 * zaznaczył, może ją tu udzielić. To ten sam akt woli i ten sam zapis
 * w dzienniku, tylko z innym `kontekst`.
 *
 * STAN CZYTAMY Z BAZY, nie ze store'a: `profil.zgoda_marketing` to jedyne
 * źródło prawdy o tym, czy wolno wysyłać. Gdyby przełącznik pokazywał wartość
 * z cache'u UI, mógłby twierdzić „wyłączone" przy włączonej zgodzie w bazie —
 * a to jest dokładnie ta pomyłka, która kończy się wysyłką do kogoś, kto się
 * jej zrzekł.
 */
export function ZgodaMarketingowa({ userId }: { userId: string }) {
  const [zgoda, setZgoda] = useState<boolean | null>(null);
  const [zapisuje, setZapisuje] = useState(false);
  const [blad, setBlad] = useState("");

  useEffect(() => {
    let aktualne = true;
    // `catch` jest tu konieczny, nie ozdobny: przy zerwanej sieci `fetch` pod
    // spodem ODRZUCA obietnicę, zamiast zwrócić `{ error }`. Bez tego mielibyśmy
    // nieobsłużone odrzucenie, a przełącznik i tak zostałby nieaktywny — czyli
    // dokładnie ten stan, który chcemy pokazać przy nieudanym odczycie.
    (async () => {
      try {
        const { data } = await klientPrzegladarka()
          .from("profil")
          .select("zgoda_marketing")
          .eq("id", userId)
          .single();
        if (aktualne) setZgoda(data?.zgoda_marketing === true);
      } catch {
        if (aktualne) setBlad("Nie udało się odczytać ustawienia.");
      }
    })();
    return () => {
      aktualne = false;
    };
  }, [userId]);

  async function przelacz(nowa: boolean) {
    // Optymistycznie, żeby przełącznik nie „zacinał się" na czas żądania —
    // ale przy niepowodzeniu WRACAMY do poprzedniej wartości. Zostawienie
    // nowej pozycji przy nieudanym zapisie pokazywałoby wycofaną zgodę, która
    // w bazie dalej jest udzielona.
    const poprzednia = zgoda;
    setZgoda(nowa);
    setZapisuje(true);
    setBlad("");

    const ok = await ustawZgodeMarketingowa({
      klient: klientPrzegladarka(),
      userId,
      zgoda: nowa,
      kontekst: "ustawienia",
    });

    setZapisuje(false);
    if (!ok) {
      setZgoda(poprzednia);
      setBlad("Nie udało się zapisać. Spróbuj ponownie za chwilę.");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-bold">Informacje handlowe</p>
          <p className="mt-0.5 max-w-md text-sm text-muted-foreground">
            Nowości i promocje w Aplikando, pocztą elektroniczną. Całkowicie
            dobrowolne - wyłączenie nie wpływa na konto ani na żadną z usług.
            Zasady:{" "}
            <Link
              href={SCIEZKI.regulaminNewslettera}
              target="_blank"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Regulamin newslettera
            </Link>
            .
          </p>
          {blad && <p className="mt-1.5 text-sm text-destructive">{blad}</p>}
        </div>
      </div>
      <Switch
        checked={zgoda === true}
        onCheckedChange={przelacz}
        // Do czasu odczytu z bazy przełącznik jest nieaktywny. Klikalny
        // przełącznik pokazujący domyślne „wyłączone" kusiłby do przestawienia
        // go w oparciu o wartość, której jeszcze nie znamy.
        disabled={zgoda === null || zapisuje}
        aria-label="Zgoda na otrzymywanie informacji handlowych"
      />
    </div>
  );
}
