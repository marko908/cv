"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckboxZgody } from "@/components/prawne/checkbox-zgody";
import {
  EtykietaZgodaMarketing,
  EtykietaZgodaRegulamin,
} from "@/components/prawne/etykiety-zgod";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { ustawZgodeMarketingowa, zapiszZgode } from "@/lib/prawne/zapis-zgody";
import { odbierzZgodyPrzedOauth } from "@/lib/prawne/zgody-oauth";

/**
 * DOKOŃCZENIE REJESTRACJI PO LOGOWANIU GOOGLE.
 *
 * Kiedy się pokazuje: `/auth/callback` wpuszcza tu każdego, kto ma świeżą sesję,
 * ale NIE ma wpisu `regulamin_polityka` w dzienniku zgód. W praktyce oznacza to
 * jedną sytuację — nowy użytkownik kliknął „Kontynuuj z Google" na ekranie
 * LOGOWANIA, więc Google założyło mu konto, a checkboxa nikt mu nie pokazał.
 * Regulamin § 4 ust. 19 wymaga od niego oświadczenia z ust. 2 pkt 3, więc
 * musimy je zebrać, zanim wpuścimy go do aplikacji.
 *
 * DLACZEGO NIE DA SIĘ TEGO POMINĄĆ ANI ODŁOŻYĆ: konto już istnieje w chwili,
 * w której ten ekran się renderuje — Google utworzyło je przy uwierzytelnieniu,
 * zanim nasz kod cokolwiek zobaczył. Nie możemy więc „nie założyć konta bez
 * zgody"; możemy tylko nie wpuścić do aplikacji i dać wyjście: zgoda albo
 * usunięcie konta. Stąd drugi przycisk.
 *
 * Zgoda przeniesiona przez `sessionStorage` (`zgody-oauth.ts`) NIE zastępuje
 * kliknięcia na tym ekranie i nie podpowiada checkboxów. Jeżeli ktoś zaznaczył
 * je przed przekierowaniem, tego ekranu w ogóle nie zobaczy — `/auth/callback`
 * znajdzie zapisaną zgodę i wpuści go dalej. Sięgamy po nią wyłącznie po
 * ZNACZNIK CZASU, na wypadek wyścigu, w którym zapis nie zdążył się wykonać.
 */
export function DokonczRejestracje() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = klientPrzegladarka();

  const [zgodaRegulamin, setZgodaRegulamin] = useState(false);
  const [zgodaMarketing, setZgodaMarketing] = useState(false);
  const [zajete, setZajete] = useState(false);
  const [rezygnuje, setRezygnuje] = useState(false);
  const [potwierdzam, setPotwierdzam] = useState(false);
  const [blad, setBlad] = useState("");

  const zadany = params.get("wroc") ?? "";
  const wroc = zadany.startsWith("/") && !zadany.startsWith("//") ? zadany : "/app";

  async function zatwierdz() {
    if (!zgodaRegulamin) {
      setBlad("Zaznacz zgodę na Regulamin i Politykę prywatności.");
      return;
    }
    setZajete(true);
    setBlad("");

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setZajete(false);
      setBlad("Sesja wygasła. Zaloguj się ponownie.");
      return;
    }

    // Czas rzeczywistego zaznaczenia. Odczyt jest tutaj, a nie w efekcie na
    // starcie, z dwóch powodów: kasuje wpis (a więc jest zdarzeniem, nie
    // synchronizacją), i `sessionStorage` nie istnieje przy renderze
    // serwerowym.
    //
    // W praktyce prawie zawsze wypadnie gałąź `??`: kto zaznaczył checkboxy
    // przed przekierowaniem, ma już zgodę w dzienniku, więc `/auth/callback`
    // wpuścił go prosto do aplikacji i tego ekranu nigdy nie zobaczył. Odczyt
    // zostaje na wypadek wyścigu, w którym zapis nie zdążył się wykonać —
    // wtedy znacznik z sessionStorage jest prawdziwszy niż „teraz".
    const znacznik = odbierzZgodyPrzedOauth()?.znacznik ?? new Date().toISOString();

    await zapiszZgode({
      klient: supabase,
      userId: data.user.id,
      rodzaj: "regulamin_polityka",
      kontekst: "rejestracja_google",
      udzielonoO: znacznik,
    });

    if (zgodaMarketing) {
      await ustawZgodeMarketingowa({
        klient: supabase,
        userId: data.user.id,
        zgoda: true,
        kontekst: "rejestracja_google",
        udzielonoO: znacznik,
      });
    }

    // Mail powitalny z Regulaminem w PDF — art. 15 ust. 1 u.p.k. wymaga
    // potwierdzenia na trwałym nośniku. Fire-and-forget, jak przy rejestracji
    // hasłem: konto już istnieje, awaria poczty to nie porażka użytkownika.
    fetch("/api/konto/powitanie", { method: "POST" }).catch(() => {});

    router.push(wroc);
    router.refresh();
  }

  /**
   * Wyjście dla kogoś, kto zgody udzielić nie chce. Konto powstało bez jego
   * świadomej decyzji o Regulaminie, więc musi mieć jak je skasować — bez tego
   * jedynym wyjściem byłoby zamknięcie karty i zostawienie po sobie konta,
   * którego nie chciał.
   */
  async function usunKonto() {
    if (!potwierdzam) {
      setPotwierdzam(true);
      setTimeout(() => setPotwierdzam(false), 5000);
      return;
    }
    setRezygnuje(true);
    const odpowiedz = await fetch("/api/konto/usun", { method: "POST" }).catch(
      () => null
    );
    if (!odpowiedz?.ok) {
      setRezygnuje(false);
      setPotwierdzam(false);
      setBlad("Nie udało się usunąć konta. Napisz do nas, a zrobimy to ręcznie.");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image
          src="/aplikando-icon.png"
          alt=""
          width={32}
          height={32}
          className="size-8"
          priority
        />
        <span className="text-lg font-bold tracking-tight">Aplikando</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-dialog sm:p-8">
        <h1 className="text-xl font-bold tracking-tight">Jeszcze jedna rzecz</h1>
        <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
          Zalogowaliśmy Cię kontem Google. Zanim zaczniesz, potrzebujemy Twojej
          akceptacji Regulaminu.
        </p>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2.5">
            <CheckboxZgody
              id="dokoncz-zgoda-regulamin"
              zaznaczone={zgodaRegulamin}
              naZmiane={setZgodaRegulamin}
            >
              <EtykietaZgodaRegulamin />
            </CheckboxZgody>
            <CheckboxZgody
              id="dokoncz-zgoda-marketing"
              zaznaczone={zgodaMarketing}
              naZmiane={setZgodaMarketing}
            >
              <EtykietaZgodaMarketing />{" "}
              <span className="text-muted-foreground/70">
                (nieobowiązkowe - możesz to wycofać w każdej chwili
                w ustawieniach konta)
              </span>
            </CheckboxZgody>
          </div>

          {blad && <p className="text-sm text-destructive">{blad}</p>}

          <Button
            type="button"
            className="btn-label w-full font-bold"
            onClick={zatwierdz}
            disabled={zajete || rezygnuje || !zgodaRegulamin}
          >
            {zajete && <Loader2 className="size-4 animate-spin" />}
            {zajete ? "Zapisuję…" : "Przejdź do aplikacji"}
          </Button>

          <button
            type="button"
            onClick={usunKonto}
            disabled={zajete || rezygnuje}
            className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-60"
          >
            {rezygnuje
              ? "Usuwam konto…"
              : potwierdzam
                ? "Na pewno? Kliknij ponownie, żeby usunąć konto"
                : "Nie zgadzam się - usuń założone konto"}
          </button>
        </div>
      </div>
    </main>
  );
}
