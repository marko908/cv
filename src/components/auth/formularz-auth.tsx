"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxZgody } from "@/components/prawne/checkbox-zgody";
import {
  EtykietaZgodaMarketing,
  EtykietaZgodaRegulamin,
} from "@/components/prawne/etykiety-zgod";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { ustawZgodeMarketingowa, zapiszZgode } from "@/lib/prawne/zapis-zgody";
import { zapamietajZgodyPrzedOauth } from "@/lib/prawne/zgody-oauth";

/**
 * Logo Google w przycisku — wklejone jako SVG, nie pobierane z serwerów Google.
 * Zewnętrzny obrazek na ekranie logowania oznaczałby żądanie do Google przy
 * każdym wejściu na stronę, także od osoby, która odmówiła wszystkich zgód
 * na cookies. Cztery ścieżki to tańsza cena niż wyjątek w polityce prywatności.
 */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/**
 * Mail powitalny z Regulaminem w PDF — fire-and-forget. Autoryzacja trasy
 * idzie przez sesję (cookies dołączane automatycznie przy żądaniu
 * same-origin), nie przez nic, co wysyłamy w body. Rejestracja NIE czeka na
 * wynik i NIE pokazuje błędu, gdyby wysyłka się nie powiodła — konto już
 * istnieje, a awaria maila to nie porażka użytkownika.
 *
 * To, czy mail potwierdzi także zapis na newsletter i dołączy jego regulamin
 * w PDF, trasa ustala SAMA — czytając `profil.zgoda_marketing` z bazy. Nie
 * przekazujemy tego w body, bo body i tak nie byłoby wiarygodne, a stan w bazie
 * jest już zapisany: `zapiszZgodyRejestracji` kończy się przed tym wywołaniem.
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
    opis: "Zostało ostatnie kliknięcie - przepisz kod, który do Ciebie wysłaliśmy.",
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
    return "Konto z tym adresem już istnieje - zaloguj się.";
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
  bladPoczatkowy = "",
  onSukces,
  onEkran,
}: {
  ekranPoczatkowy?: EkranAuth;
  /**
   * Błąd do pokazania od razu po zamontowaniu — dziś używa go wyłącznie powrót
   * z nieudanego logowania Google (`/logowanie?blad=google`). Komunikat musi
   * przyjść z zewnątrz, bo powstał w trasie serwerowej, a nie w formularzu.
   */
  bladPoczatkowy?: string;
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
  const [blad, setBlad] = useState(bladPoczatkowy);
  const [info, setInfo] = useState("");
  const [odliczanie, setOdliczanie] = useState(0);

  // Zgoda na Regulamin i Politykę prywatności — wymagana do rejestracji
  // (Regulamin § 4 ust. 2 pkt 3). Domyślnie odznaczona: użytkownik musi
  // zaznaczyć ją sam.
  const [zgodaRegulamin, setZgodaRegulamin] = useState(false);
  // Przyciski „Załóż konto" / „Kontynuuj z Google" NIE są z góry `disabled`
  // przy braku zgody — walidacja idzie dopiero po kliknięciu, a jej wynik
  // podświetla konkretne pole/checkbox na czerwono zamiast po cichu blokować
  // przycisk (decyzja Marka 2026-08-10: użytkownik ma zobaczyć, CZEGO
  // brakuje, zamiast zgadywać, czemu przycisk nie reaguje).
  const [zgloszonoRejestracje, setZgloszonoRejestracje] = useState(false);
  const [bladZgodyRegulamin, setBladZgodyRegulamin] = useState(false);
  // Moment RZECZYWISTEGO zaznaczenia — złapany przy submicie formularza.
  // Gdy rejestracja wymaga potwierdzenia kodem z maila, wiersz w tabeli
  // `zgoda` powstaje dopiero PO potwierdzeniu, ale ma nosić czas zgody,
  // nie czas zapisu (mogą dzielić je sekundy albo minuty).
  const [znacznikZgodyRejestracji, setZnacznikZgodyRejestracji] = useState<
    string | null
  >(null);

  // Zgoda na informacje handlowe — NIEOBOWIĄZKOWA (Regulamin § 4 ust. 20).
  // Świadomie NIE wchodzi do warunku `disabled` przycisku: zgoda, która nie
  // jest niezbędna do świadczenia usługi, nie może warunkować korzystania
  // z niej (wzory-zgod.md, zasada wspólna nr 5).
  const [zgodaMarketing, setZgodaMarketing] = useState(false);

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
    setZgodaMarketing(false);
    setZnacznikZgodyRejestracji(null);
    setZgloszonoRejestracje(false);
    setBladZgodyRegulamin(false);
  }

  /**
   * Zapis obu zgód po powstaniu konta. Wołane z DWÓCH ścieżek rejestracji
   * (sesja od razu / dopiero po potwierdzeniu kodu z maila), więc musi być
   * jedno miejsce — rozjazd między nimi znaczyłby, że część użytkowników nie
   * ma dowodu zgody, a część nie dostaje maili, na które się zgodziła.
   *
   * `znacznik` to czas RZECZYWISTEGO zaznaczenia checkboxów, nie czas zapisu.
   * Żaden z tych zapisów nie rzuca ani nie blokuje rejestracji.
   */
  async function zapiszZgodyRejestracji(userId: string, znacznik?: string) {
    await zapiszZgode({
      klient: supabase,
      userId,
      rodzaj: "regulamin_polityka",
      kontekst: "rejestracja",
      udzielonoO: znacznik,
    });
    // Wyłącznie przy zaznaczonym checkboxie. Brak zgody to stan domyślny
    // w bazie (`zgoda_marketing` ma `default false`) — nie zapisujemy
    // „wycofania" czegoś, czego nikt nie udzielił, bo zaśmiecałoby to dziennik
    // zdarzeniami, które nigdy nie nastąpiły.
    if (zgodaMarketing) {
      await ustawZgodeMarketingowa({
        klient: supabase,
        userId,
        zgoda: true,
        kontekst: "rejestracja",
        udzielonoO: znacznik,
      });
    }
  }

  // Widoczne, gdy użytkownik zaczął wpisywać powtórzenie ALBO już próbował
  // wysłać formularz — inaczej pusty drugi pole po nieudanym submicie nie
  // pokazywałoby żadnego wizualnego sygnału, mimo że hasła realnie się różnią.
  const hasloNiezgodne =
    (zgloszonoRejestracje || powtorzHaslo.length > 0) && haslo !== powtorzHaslo;
  const hasloZaKrotkie = zgloszonoRejestracje && haslo.length < MIN_HASLO;

  async function zarejestruj(e: React.FormEvent) {
    e.preventDefault();
    setZgloszonoRejestracje(true);
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
    // Druga linia obrony obok czerwonego podświetlenia checkboxa — gdyby ktoś
    // jednak wysłał formularz bez zgody (np. programowo).
    if (!zgodaRegulamin) {
      setBladZgodyRegulamin(true);
      setBlad("Zaznacz zgodę na Regulamin i Politykę prywatności.");
      return;
    }
    setBladZgodyRegulamin(false);
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
      return setBlad("Konto z tym adresem już istnieje - zaloguj się.");
    }

    // Gdy potwierdzanie maila jest wyłączone, sesja jest od razu — możemy
    // zapisać zgodę już teraz, `auth.uid()` w RLS zobaczy świeżą sesję.
    if (data.session && data.user) {
      await zapiszZgodyRejestracji(data.user.id, znacznik);
      wyslijMailPowitalny();
      return onSukces?.();
    }

    // Sesji jeszcze nie ma — zapiszemy zgodę po potwierdzeniu kodu, ale ze
    // znacznikiem czasu z TEJ chwili, nie z chwili zapisu.
    setZnacznikZgodyRejestracji(znacznik);
    setOdliczanie(ODSTEP_S);
    setEkran("kod-rejestracji");
  }

  /**
   * LOGOWANIE / REJESTRACJA KONTEM GOOGLE.
   *
   * Google nie rozróżnia jednego od drugiego — ten sam przepływ zakłada konto
   * albo loguje do istniejącego. Dlatego zgodę zbieramy PRZED przekierowaniem
   * (na ekranie rejestracji gatuje przycisk), a po powrocie `/auth/callback`
   * i tak sprawdza dziennik w bazie i w razie czego odsyła na
   * `/dokoncz-rejestracje`. Dwie bramki, bo żadna z osobna nie wystarcza:
   * pierwsza nie zadziała przy wejściu z ekranu logowania, druga nie zna
   * chwili, w której użytkownik realnie kliknął checkbox.
   *
   * `wroc` niesiemy w adresie powrotnym, żeby po zalogowaniu wrócić tam, skąd
   * użytkownik przyszedł. Waliduje go trasa callbacku, nie my — parametr
   * przeżyje podróż przez Google i wraca jako dana z zewnątrz.
   */
  async function zalogujGoogle() {
    // Czytamy `ekran` wprost, nie przez `rejestracja` — ta stała jest
    // deklarowana dopiero przy renderze ostatniego ekranu i w innych gałęziach
    // bywa przesłonięta lokalną zmienną o tej samej nazwie.
    const zRejestracji = ekran === "rejestracja";

    if (zRejestracji && !zgodaRegulamin) {
      setBladZgodyRegulamin(true);
      setBlad("Zaznacz zgodę na Regulamin i Politykę prywatności.");
      return;
    }
    setBladZgodyRegulamin(false);

    // Znacznik czasu i zgoda marketingowa muszą przeżyć przekierowanie —
    // stan Reacta nie przeżyje, a dziennik ma nosić chwilę zaznaczenia, nie
    // chwilę powrotu z Google (dzieli je ekran wyboru konta).
    if (zRejestracji) {
      zapamietajZgodyPrzedOauth({
        znacznik: new Date().toISOString(),
        marketing: zgodaMarketing,
      });
    }

    zacznij();

    const wroc = new URLSearchParams(window.location.search).get("wroc");
    const powrot = new URL("/auth/callback", window.location.origin);
    if (wroc) powrot.searchParams.set("wroc", wroc);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: powrot.toString() },
    });

    // Sukces oznacza, że przeglądarka właśnie odchodzi do Google — `setZajete`
    // zostawiamy włączone, żeby przycisk nie zamigał „gotowy" na ułamek sekundy
    // przed zniknięciem strony.
    if (error) {
      setZajete(false);
      setBlad(poPolsku(error.message));
    }
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
      await zapiszZgodyRejestracji(
        data.user.id,
        znacznikZgodyRejestracji ?? undefined
      );
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
        return setInfo("Dokończ aktywację - wpisz kod z maila.");
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
        bladPola={
          hasloZaKrotkie
            ? `Hasło musi mieć co najmniej ${MIN_HASLO} znaków.`
            : undefined
        }
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
        <div className="grid gap-2.5">
          <CheckboxZgody
            id="auth-zgoda-regulamin"
            zaznaczone={zgodaRegulamin}
            naZmiane={(v) => {
              setZgodaRegulamin(v);
              if (v) setBladZgodyRegulamin(false);
            }}
            blad={
              bladZgodyRegulamin
                ? "Zaznacz zgodę na Regulamin i Politykę prywatności."
                : undefined
            }
          >
            <EtykietaZgodaRegulamin />
          </CheckboxZgody>
          {/* Osobny checkbox, nigdy wspólny z powyższym — łączenie zgody
              wymaganej z dobrowolną czyni tę drugą nieświadomą i niedobrowolną,
              czyli nieważną (wzory-zgod.md, zasada wspólna nr 3). */}
          <CheckboxZgody
            id="auth-zgoda-marketing"
            zaznaczone={zgodaMarketing}
            naZmiane={setZgodaMarketing}
          >
            <EtykietaZgodaMarketing />
          </CheckboxZgody>
        </div>
      )}

      {komunikaty}
      {przyciskGlowny(
        rejestracja ? "Załóż konto" : "Zaloguj się",
        rejestracja ? "Zakładam konto…" : "Loguję…"
      )}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">albo</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Na ekranie REJESTRACJI walidacja zgody idzie PO kliknięciu (patrz
          `zalogujGoogle`), nie przez `disabled` — Google zakłada konto tym
          samym kliknięciem, więc brak zgody i tak zatrzymuje przekierowanie,
          tylko z czerwonym podświetleniem checkboxa zamiast martwego
          przycisku. Przy LOGOWANIU bramki nie ma: logowanie nie zawiera nowej
          umowy, a gdyby konto jednak okazało się nowe, złapie to
          `/auth/callback`. */}
      <Button
        type="button"
        variant="secondary"
        className="btn-label w-full font-bold"
        onClick={zalogujGoogle}
        disabled={zajete}
      >
        <LogoGoogle />
        Kontynuuj z Google
      </Button>

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
