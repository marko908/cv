"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxZgody } from "@/components/prawne/checkbox-zgody";
import { EtykietaZgodaRegulamin } from "@/components/prawne/etykiety-zgod";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { zapiszZgode } from "@/lib/prawne/zapis-zgody";

/**
 * Mail powitalny z Regulaminem w PDF — fire-and-forget. Autoryzacja trasy
 * idzie przez sesję (cookies dołączane automatycznie przy żądaniu
 * same-origin), nie przez nic, co wysyłamy w body. Rejestracja NIE czeka na
 * wynik i NIE pokazuje błędu, gdyby wysyłka się nie powiodła — konto już
 * istnieje, a awaria maila to nie porażka użytkownika.
 */
function wyslijMailPowitalny() {
  fetch("/api/konto/powitanie", { method: "POST" }).catch(() => {});
}

/**
 * FORMULARZ KONTA — jeden komponent na wszystkie ekrany: rejestrację,
 * przepisanie kodu z maila, logowanie i odzyskiwanie hasła.
 *
 * Używany W DWÓCH MIEJSCACH: w modalu (`auth-dialog.tsx`, wywoływanym akcją
 * typu „Pobierz PDF") oraz na pełnych trasach `/rejestracja`, `/logowanie`,
 * `/reset-hasla`. Jedna implementacja, bo to repo ma już kosztowną lekcję
 * o dwóch równoległych rendererach tego samego (podgląd CV vs plik PDF).
 *
 * Trasy muszą istnieć niezależnie od modalu: potrzebuje ich link z maila,
 * powrót z logowania Google i menedżery haseł, które w modalach działają gorzej.
 *
 * AKTYWACJA IDZIE KODEM, NIE LINKIEM — szablon „Confirm sign up" w Supabase
 * używa `{{ .Token }}`. Dzięki temu użytkownik kończy rejestrację w tym samym
 * oknie, w którym budował CV, i nie traci kontekstu.
 */

export type EkranAuth =
  | "rejestracja"
  | "logowanie"
  | "kod-rejestracji"
  | "reset-prosba"
  | "reset-kod"
  | "reset-haslo";

/** Odstęp między mailami do tego samego użytkownika — ustawiony też w SMTP. */
const ODSTEP_S = 60;
const MIN_HASLO = 8;

/**
 * POLE HASŁA — z podglądem treści i miejscem na błąd POD polem.
 *
 * Musi stać na poziomie modułu, nie wewnątrz `FormularzAuth`: komponent trzyma
 * własny `useState` (podgląd wł./wył.), a definicja w ciele rodzica tworzyłaby
 * przy każdym renderze nowy typ komponentu — React odmontowałby pole przy
 * każdym naciśnięciu klawisza, gubiąc fokus i stan podglądu.
 *
 * Podgląd jest tu ważniejszy niż zwykle, bo od tej zmiany rejestracja ma DWA
 * pola hasła: bez możliwości sprawdzenia, co się wpisało, jedyną informacją
 * o literówce jest komunikat „hasła nie są takie same" po submicie.
 *
 * Przycisk oka ZOSTAJE w kolejności tabulacji (bez `tabIndex={-1}`) — osoba
 * korzystająca wyłącznie z klawiatury też musi móc podejrzeć wpisane hasło.
 */
function PoleHasla({
  id,
  etykieta,
  wartosc,
  naZmiane,
  autoComplete,
  placeholder,
  obokEtykiety,
  bladPola,
}: {
  id: string;
  etykieta: string;
  wartosc: string;
  naZmiane: (v: string) => void;
  autoComplete: "new-password" | "current-password";
  placeholder?: string;
  /** Np. odnośnik „Nie pamiętam hasła" po prawej stronie etykiety. */
  obokEtykiety?: React.ReactNode;
  /** Komunikat pod polem; ustawia też `aria-invalid`. */
  bladPola?: string;
}) {
  const [widoczne, setWidoczne] = useState(false);

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{etykieta}</Label>
        {obokEtykiety}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={widoczne ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={wartosc}
          onChange={(e) => naZmiane(e.target.value)}
          placeholder={placeholder}
          aria-invalid={bladPola ? true : undefined}
          aria-describedby={bladPola ? `${id}-blad` : undefined}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setWidoczne((w) => !w)}
          aria-label={widoczne ? "Ukryj hasło" : "Pokaż hasło"}
          aria-pressed={widoczne}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {widoczne ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {bladPola && (
        <p id={`${id}-blad`} className="text-xs text-destructive">
          {bladPola}
        </p>
      )}
    </div>
  );
}

/**
 * Nagłówki dla każdego ekranu. Formularz przełącza się WEWNĘTRZNIE (rejestracja
 * ↔ logowanie ↔ kod ↔ reset), więc oprawa musi za nim nadążać — inaczej strona
 * krzyczy „Załóż konto" nad formularzem logowania. Stąd `onEkran`: to jedyne
 * źródło prawdy o tym, co użytkownik właśnie widzi.
 */
export const TEKSTY_AUTH: Record<EkranAuth, { tytul: string; opis: string }> = {
  rejestracja: {
    tytul: "Załóż konto",
    opis: "Konto daje dostęp do Twoich CV z każdego urządzenia i pozwala wrócić do nich później.",
  },
  logowanie: {
    tytul: "Zaloguj się",
    opis: "Wróć do swoich CV i historii dopasowań.",
  },
  "kod-rejestracji": {
    tytul: "Potwierdź adres e-mail",
    opis: "Zostało ostatnie kliknięcie — przepisz kod, który do Ciebie wysłaliśmy.",
  },
  "reset-prosba": {
    tytul: "Nie pamiętasz hasła?",
    opis: "Wyślemy Ci kod, którym ustawisz nowe.",
  },
  "reset-kod": {
    tytul: "Przepisz kod",
    opis: "Kod z wiadomości potwierdzi, że to Ty prosisz o zmianę hasła.",
  },
  "reset-haslo": {
    tytul: "Ustaw nowe hasło",
    opis: "Od tej chwili logujesz się nowym hasłem.",
  },
};

/**
 * Supabase zwraca komunikaty po angielsku. Użytkownik ma prawo dostać
 * poprawną polszczyznę — a przy „Invalid login credentials" jeszcze podpowiedź,
 * co z tym zrobić.
 */
function poPolsku(komunikat: string): string {
  const m = komunikat.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Nieprawidłowy e-mail lub hasło.";
  if (m.includes("email not confirmed"))
    return "Konto nie jest jeszcze aktywowane. Sprawdź kod w skrzynce.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Konto z tym adresem już istnieje — zaloguj się.";
  if (m.includes("token has expired") || m.includes("invalid token") || m.includes("otp"))
    return "Kod jest nieprawidłowy albo wygasł. Wyślij nowy.";
  if (m.includes("password should be at least"))
    return `Hasło musi mieć co najmniej ${MIN_HASLO} znaków.`;
  if (m.includes("password") && m.includes("pwned"))
    return "To hasło pojawiło się w wycieku danych. Wymyśl inne.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Za dużo prób. Odczekaj chwilę i spróbuj ponownie.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Ten adres e-mail wygląda na nieprawidłowy.";
  return komunikat;
}

export function FormularzAuth({
  ekranPoczatkowy = "rejestracja",
  onSukces,
  onEkran,
}: {
  ekranPoczatkowy?: EkranAuth;
  /** Wołane po zalogowaniu/aktywacji. W modalu domyka okno i wznawia akcję. */
  onSukces?: () => void;
  /** Zgłasza aktualny ekran, żeby oprawa (tytuł, opis) nadążała za formularzem. */
  onEkran?: (ekran: EkranAuth) => void;
}) {
  const [ekran, setEkran] = useState<EkranAuth>(ekranPoczatkowy);
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  // Powtórzenie hasła — TYLKO tam, gdzie hasło jest USTALANE (rejestracja,
  // ustawianie nowego hasła po resecie). Przy logowaniu byłoby szkodliwe:
  // hasło już istnieje, a literówkę i tak wyłapuje serwer.
  const [powtorzHaslo, setPowtorzHaslo] = useState("");
  const [kod, setKod] = useState("");
  const [zajete, setZajete] = useState(false);
  const [blad, setBlad] = useState("");
  const [info, setInfo] = useState("");
  const [odliczanie, setOdliczanie] = useState(0);

  // Zgoda na Regulamin i Politykę prywatności — wymagana do rejestracji
  // (Regulamin § 4 ust. 2 pkt 3). Domyślnie odznaczona: użytkownik musi
  // zaznaczyć ją sam.
  const [zgodaRegulamin, setZgodaRegulamin] = useState(false);
  // Moment RZECZYWISTEGO zaznaczenia — złapany przy submicie formularza.
  // Gdy rejestracja wymaga potwierdzenia kodem z maila, wiersz w tabeli
  // `zgoda` powstaje dopiero PO potwierdzeniu, ale ma nosić czas zgody,
  // nie czas zapisu (mogą dzielić je sekundy albo minuty).
  const [znacznikZgodyRejestracji, setZnacznikZgodyRejestracji] = useState<
    string | null
  >(null);

  useEffect(() => {
    onEkran?.(ekran);
    // `onEkran` celowo poza zależnościami: rodzic zwykle przekazuje świeżą
    // funkcję przy każdym renderze, co dałoby pętlę aktualizacji.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ekran]);

  // Odliczanie do ponownej wysyłki. Bez niego użytkownik klika „wyślij ponownie"
  // i dostaje suchy błąd o limicie — zamiast informacji, ile ma poczekać.
  useEffect(() => {
    if (odliczanie <= 0) return;
    const t = setTimeout(() => setOdliczanie((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [odliczanie]);

  const supabase = klientPrzegladarka();

  function zacznij() {
    setZajete(true);
    setBlad("");
    setInfo("");
  }

  /**
   * Przejście między ekranami tego samego formularza.
   *
   * Czyści komunikaty, powtórzenie hasła ORAZ ZGODĘ. Odznaczenie zgody jest
   * celowe i wynika z tej samej zasady, co `resetZgod()` w oknie zakupu:
   * zaznaczenie checkboxa ma być świadomym aktem podjętym przy TYM
   * formularzu rejestracji, a nie stanem odziedziczonym po wcześniejszym
   * kliknięciu (art. 7 ust. 1 RODO + Regulamin § 4 ust. 2 pkt 3).
   *
   * Samego hasła nie kasujemy — przy „Masz już konto? Zaloguj się" ktoś, kto
   * właśnie je wpisał, chce się nim zalogować.
   */
  function przelaczEkran(nowy: EkranAuth) {
    setEkran(nowy);
    setBlad("");
    setInfo("");
    setPowtorzHaslo("");
    setZgodaRegulamin(false);
    setZnacznikZgodyRejestracji(null);
  }

  /** Widoczne dopiero wtedy, gdy użytkownik zaczął wpisywać powtórzenie. */
  const hasloNiezgodne = powtorzHaslo.length > 0 && haslo !== powtorzHaslo;

  async function zarejestruj(e: React.FormEvent) {
    e.preventDefault();
    if (haslo.length < MIN_HASLO) {
      setBlad(`Hasło musi mieć co najmniej ${MIN_HASLO} znaków.`);
      return;
    }
    // Bez tego literówka w haśle daje konto, do którego nikt się nie zaloguje —
    // odzyskiwanie idzie kodem z maila, więc użytkownik odkrywa problem dopiero
    // przy następnym logowaniu, już bez możliwości sprawdzenia, co wpisał.
    if (haslo !== powtorzHaslo) {
      setBlad("Hasła nie są takie same.");
      return;
    }
    // Druga linia obrony obok `disabled` na przycisku — gdyby ktoś jednak
    // wysłał formularz bez zgody (np. programowo).
    if (!zgodaRegulamin) {
      setBlad("Zaznacz zgodę na Regulamin i Politykę prywatności.");
      return;
    }
    const znacznik = new Date().toISOString();
    zacznij();
    const { data, error } = await supabase.auth.signUp({ email, password: haslo });
    setZajete(false);

    if (error) return setBlad(poPolsku(error.message));

    // Supabase przy istniejącym koncie zwraca użytkownika z PUSTĄ listą
    // tożsamości zamiast błędu — celowo, żeby nie dało się sprawdzać, kto ma
    // u nas konto. Musimy to rozpoznać sami, inaczej człowiek czeka na kod,
    // który nigdy nie przyjdzie.
    if (data.user && data.user.identities?.length === 0) {
      przelaczEkran("logowanie");
      return setBlad("Konto z tym adresem już istnieje — zaloguj się.");
    }

    // Gdy potwierdzanie maila jest wyłączone, sesja jest od razu — możemy
    // zapisać zgodę już teraz, `auth.uid()` w RLS zobaczy świeżą sesję.
    if (data.session && data.user) {
      await zapiszZgode({
        klient: supabase,
        userId: data.user.id,
        rodzaj: "regulamin_polityka",
        kontekst: "rejestracja",
        udzielonoO: znacznik,
      });
      wyslijMailPowitalny();
      return onSukces?.();
    }

    // Sesji jeszcze nie ma — zapiszemy zgodę po potwierdzeniu kodu, ale ze
    // znacznikiem czasu z TEJ chwili, nie z chwili zapisu.
    setZnacznikZgodyRejestracji(znacznik);
    setOdliczanie(ODSTEP_S);
    setEkran("kod-rejestracji");
  }

  async function potwierdzKod(e: React.FormEvent) {
    e.preventDefault();
    zacznij();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: kod.trim(),
      type: "signup",
    });
    setZajete(false);
    if (error) return setBlad(poPolsku(error.message));

    if (data.user) {
      await zapiszZgode({
        klient: supabase,
        userId: data.user.id,
        rodzaj: "regulamin_polityka",
        kontekst: "rejestracja",
        udzielonoO: znacznikZgodyRejestracji ?? undefined,
      });
      wyslijMailPowitalny();
    }
    onSukces?.();
  }

  async function wyslijKodPonownie() {
    if (odliczanie > 0) return;
    zacznij();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setZajete(false);
    if (error) return setBlad(poPolsku(error.message));
    setOdliczanie(ODSTEP_S);
    setInfo("Wysłaliśmy nowy kod.");
  }

  async function zaloguj(e: React.FormEvent) {
    e.preventDefault();
    zacznij();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: haslo,
    });
    setZajete(false);
    if (error) {
      // Konto istnieje, ale nieaktywowane — zamiast błędu prowadzimy do kodu.
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setEkran("kod-rejestracji");
        setOdliczanie(0);
        return setInfo("Dokończ aktywację — wpisz kod z maila.");
      }
      return setBlad(poPolsku(error.message));
    }
    onSukces?.();
  }

  async function poprosOReset(e: React.FormEvent) {
    e.preventDefault();
    zacznij();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setZajete(false);
    if (error) return setBlad(poPolsku(error.message));
    setOdliczanie(ODSTEP_S);
    setEkran("reset-kod");
  }

  async function potwierdzResetKod(e: React.FormEvent) {
    e.preventDefault();
    zacznij();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: kod.trim(),
      type: "recovery",
    });
    setZajete(false);
    if (error) return setBlad(poPolsku(error.message));
    setHaslo("");
    setPowtorzHaslo("");
    setEkran("reset-haslo");
  }

  async function ustawNoweHaslo(e: React.FormEvent) {
    e.preventDefault();
    if (haslo.length < MIN_HASLO) {
      setBlad(`Hasło musi mieć co najmniej ${MIN_HASLO} znaków.`);
      return;
    }
    if (haslo !== powtorzHaslo) {
      setBlad("Hasła nie są takie same.");
      return;
    }
    zacznij();
    const { error } = await supabase.auth.updateUser({ password: haslo });
    setZajete(false);
    if (error) return setBlad(poPolsku(error.message));
    onSukces?.();
  }

  const poleEmail = (
    <div className="grid gap-1.5">
      <Label htmlFor="auth-email">Adres e-mail</Label>
      <Input
        id="auth-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jan.kowalski@example.com"
      />
    </div>
  );

  const komunikaty = (
    <>
      {blad && <p className="text-sm text-destructive">{blad}</p>}
      {info && !blad && <p className="text-sm text-muted-foreground">{info}</p>}
    </>
  );

  function przyciskGlowny(
    etykieta: string,
    wTrakcie: string,
    dodatkowoWylaczony = false
  ) {
    return (
      <Button
        type="submit"
        className="btn-label w-full font-bold"
        disabled={zajete || dodatkowoWylaczony}
      >
        {zajete && <Loader2 className="size-4 animate-spin" />}
        {zajete ? wTrakcie : etykieta}
      </Button>
    );
  }

  // ------------------------------------------------------------------ kod ---
  if (ekran === "kod-rejestracji" || ekran === "reset-kod") {
    const rejestracja = ekran === "kod-rejestracji";
    return (
      <form
        onSubmit={rejestracja ? potwierdzKod : potwierdzResetKod}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15">
            <MailCheck className="size-6 text-primary" />
          </span>
          <p className="text-sm text-muted-foreground">
            Wysłaliśmy kod na <strong className="text-foreground">{email}</strong>.
            Przepisz go poniżej.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="auth-kod">Kod z wiadomości</Label>
          <Input
            id="auth-kod"
            inputMode="numeric"
            autoComplete="one-time-code"
            // Kod z tego projektu Supabase ma 8 cyfr (nie domyślne 6).
            maxLength={8}
            required
            value={kod}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, ""))}
            placeholder="00000000"
            className="text-center text-lg tracking-[0.4em]"
          />
        </div>

        {komunikaty}
        {przyciskGlowny("Potwierdź", "Sprawdzam…")}

        {rejestracja && (
          <button
            type="button"
            onClick={wyslijKodPonownie}
            disabled={odliczanie > 0 || zajete}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60"
          >
            {odliczanie > 0
              ? `Wyślij ponownie za ${odliczanie} s`
              : "Nie dostałeś maila? Wyślij ponownie"}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setKod("");
            przelaczEkran(rejestracja ? "rejestracja" : "reset-prosba");
          }}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Wróć
        </button>
      </form>
    );
  }

  // ------------------------------------------------------------ nowe hasło ---
  if (ekran === "reset-haslo") {
    return (
      <form onSubmit={ustawNoweHaslo} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Kod potwierdzony. Ustaw nowe hasło do konta.
        </p>
        <PoleHasla
          id="auth-nowe-haslo"
          etykieta="Nowe hasło"
          wartosc={haslo}
          naZmiane={setHaslo}
          autoComplete="new-password"
          placeholder={`Co najmniej ${MIN_HASLO} znaków`}
        />
        <PoleHasla
          id="auth-nowe-haslo-powtorz"
          etykieta="Powtórz nowe hasło"
          wartosc={powtorzHaslo}
          naZmiane={setPowtorzHaslo}
          autoComplete="new-password"
          placeholder="Wpisz to samo hasło"
          bladPola={hasloNiezgodne ? "Hasła nie są takie same." : undefined}
        />
        {komunikaty}
        {przyciskGlowny("Zapisz nowe hasło", "Zapisuję…")}
      </form>
    );
  }

  // ------------------------------------------------------- prośba o reset ---
  if (ekran === "reset-prosba") {
    return (
      <form onSubmit={poprosOReset} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Podaj adres, na który założyłeś konto. Wyślemy kod do ustawienia
          nowego hasła.
        </p>
        {poleEmail}
        {komunikaty}
        {przyciskGlowny("Wyślij kod", "Wysyłam…")}
        <button
          type="button"
          onClick={() => {
            setEkran("logowanie");
            setBlad("");
          }}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Wróć do logowania
        </button>
      </form>
    );
  }

  // ------------------------------------------- rejestracja i logowanie ---
  const rejestracja = ekran === "rejestracja";
  return (
    <form
      onSubmit={rejestracja ? zarejestruj : zaloguj}
      className="flex flex-col gap-4"
    >
      {poleEmail}

      <PoleHasla
        id="auth-haslo"
        etykieta="Hasło"
        wartosc={haslo}
        naZmiane={setHaslo}
        autoComplete={rejestracja ? "new-password" : "current-password"}
        placeholder={rejestracja ? `Co najmniej ${MIN_HASLO} znaków` : "Twoje hasło"}
        obokEtykiety={
          !rejestracja && (
            <button
              type="button"
              onClick={() => {
                setEkran("reset-prosba");
                setBlad("");
              }}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Nie pamiętam hasła
            </button>
          )
        }
      />

      {rejestracja && (
        <PoleHasla
          id="auth-haslo-powtorz"
          etykieta="Powtórz hasło"
          wartosc={powtorzHaslo}
          naZmiane={setPowtorzHaslo}
          autoComplete="new-password"
          placeholder="Wpisz to samo hasło"
          bladPola={hasloNiezgodne ? "Hasła nie są takie same." : undefined}
        />
      )}

      {rejestracja && (
        <CheckboxZgody
          id="auth-zgoda-regulamin"
          zaznaczone={zgodaRegulamin}
          naZmiane={setZgodaRegulamin}
        >
          <EtykietaZgodaRegulamin />
        </CheckboxZgody>
      )}

      {komunikaty}
      {przyciskGlowny(
        rejestracja ? "Załóż konto" : "Zaloguj się",
        rejestracja ? "Zakładam konto…" : "Loguję…",
        rejestracja && !zgodaRegulamin
      )}

      <p className="text-center text-sm text-muted-foreground">
        {rejestracja ? "Masz już konto?" : "Nie masz jeszcze konta?"}{" "}
        <button
          type="button"
          onClick={() => przelaczEkran(rejestracja ? "logowanie" : "rejestracja")}
          className="text-foreground underline underline-offset-4"
        >
          {rejestracja ? "Zaloguj się" : "Załóż konto"}
        </button>
      </p>
    </form>
  );
}
