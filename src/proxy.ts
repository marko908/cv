import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ODŚWIEŻANIE SESJI przed każdym żądaniem.
 *
 * UWAGA NA NAZWĘ PLIKU: w tej wersji Next konwencja `middleware.ts` jest
 * WYCOFANA i nazywa się `proxy.ts` (eksport funkcji `proxy`). Plik leży obok
 * `app/`, czyli w `src/`.
 *
 * Po co to jest: token dostępu Supabase żyje krótko i trzeba go odnawiać
 * tokenem odświeżającym. Server Components NIE MOGĄ zapisywać ciasteczek, więc
 * gdyby odnawianie zostawić im, użytkownik wylatywałby z konta w losowym
 * momencie — na przykład w połowie edycji CV. `proxy` biegnie wcześniej i ma
 * prawo zapisu, dlatego to jego zadanie.
 *
 * Zasada: `getUser()`, nie `getSession()`. `getSession()` ufa zawartości
 * ciasteczka, `getUser()` weryfikuje token u Supabase. To jest różnica między
 * „sesja wygląda na ważną" a „sesja jest ważna".
 */
export async function proxy(request: NextRequest) {
  let odpowiedz = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const klucz = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Brak konfiguracji NIE MOŻE położyć całej strony. Ten plik wykonuje się przy
  // KAŻDYM żądaniu, więc wyjątek tutaj oznacza 500 na landingu, w kreatorze
  // i wszędzie indziej — zamiast samego niedziałającego logowania.
  // Realny przypadek: pierwsze wdrożenie na produkcję przed dodaniem zmiennych
  // środowiskowych w panelu hostingu.
  if (!url || !klucz) {
    console.error(
      "[proxy] Brak NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — " +
        "sesja nie będzie odświeżana, logowanie nie zadziała. Uzupełnij zmienne środowiskowe."
    );
    return odpowiedz;
  }

  const supabase = createServerClient(url, klucz, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(doUstawienia) {
        // Ciasteczka trzeba wpisać w DWA miejsca: do żądania (żeby dalszy kod
        // renderujący widział już odświeżoną sesję) i do odpowiedzi (żeby
        // przeglądarka je zapamiętała). Pominięcie któregokolwiek daje
        // trudne do namierzenia losowe wylogowania.
        for (const { name, value } of doUstawienia) {
          request.cookies.set(name, value);
        }
        odpowiedz = NextResponse.next({ request });
        for (const { name, value, options } of doUstawienia) {
          odpowiedz.cookies.set(name, value, options);
        }
      },
    },
  });

  // Awaria Supabase też nie ma prawa położyć strony — w najgorszym razie
  // użytkownik zostanie wylogowany.
  let uzytkownik = null;
  try {
    const { data } = await supabase.auth.getUser();
    uzytkownik = data.user;
  } catch (e) {
    console.error("[proxy] Nie udało się odświeżyć sesji:", e);
  }

  // BRAMKA KONTA (decyzja Marka 2026-08-10): CAŁA aplikacja pod `/app` wymaga
  // zalogowania — zastępuje wcześniejsze „kreator działa bez konta". Bez tej
  // bramki serwerowej dałoby się wejść na `/app/kreator` wpisując adres
  // wprost, mimo że UI już nigdzie do niego nie prowadzi niezalogowanego.
  const { pathname, search } = request.nextUrl;

  /**
   * Przekierowanie zachowujące ciasteczka odświeżonej sesji.
   *
   * `NextResponse.redirect` buduje odpowiedź od zera, więc wszystko, co
   * `setAll` zdążyło zapisać na `odpowiedz`, musi tu przejść ręcznie —
   * inaczej odświeżony token ginie i użytkownik wylatuje z konta w chwili
   * przekierowania.
   */
  function przekierujDo(cel: URL) {
    const przekierowanie = NextResponse.redirect(cel);
    for (const ciastko of odpowiedz.cookies.getAll()) {
      przekierowanie.cookies.set(ciastko);
    }
    return przekierowanie;
  }

  /*
   * KOD OAUTH, KTÓRY TRAFIŁ POZA `/auth/callback` — odsyłamy go na właściwą
   * trasę zamiast zostawiać człowieka na landingu z kodem w pasku adresu.
   *
   * Skąd się tam bierze: przy niepełnej liście Redirect URLs w panelu Supabase
   * powrót z Google nie idzie pod adres, o który prosimy, tylko pod Site URL.
   * Wystarczy do tego rzecz tak drobna jak `www` — `https://aplikando.pl/**`
   * NIE obejmuje `https://www.aplikando.pl/auth/callback` (dla Supabase to inny
   * host). Realny przebieg zgłoszony przez Marka 2026-08-13.
   *
   * To NIE JEST obejście bramki zgody, tylko doprowadzenie do niej: kod idzie
   * do tej samej trasy serwerowej, która wymienia go na sesję i sprawdza
   * dziennik zgód. Odwrotność `detectSessionInUrl`, które robiło z tego sesję
   * po cichu, z pominięciem `/auth/callback` (patrz `klient-przegladarka.ts`).
   *
   * Zły albo zużyty kod nie jest problemem — `/auth/callback` odeśle wtedy na
   * `/logowanie?blad=google`, czyli tam, gdzie i tak trzeba trafić.
   */
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const cel = new URL("/auth/callback", request.url);
    cel.search = search;
    return przekierujDo(cel);
  }

  /*
   * ZALOGOWANY NIE OGLĄDA LANDINGU (decyzja Marka 2026-08-12). Strona główna
   * sprzedaje produkt komuś, kto go jeszcze nie ma — kto ma konto, chce wejść
   * do aplikacji, nie czytać oferty. Dlatego z nagłówka zniknął przycisk
   * „Otwórz aplikację" (`menu-konta.tsx`), a jego rolę przejęło to
   * przekierowanie: wejście na `/` prowadzi prosto do `/app`.
   *
   * Serwerowo, nie w komponencie — przekierowanie po hydracji dałoby błysk
   * landingu przy każdym wejściu.
   *
   * Konsekwencja, o której trzeba pamiętać: zalogowany nie dosięgnie już
   * `/#cennik` ani FAQ z landingu (kotwica nie dociera do serwera, więc
   * odbija się razem z całą stroną). Cennik dla posiadacza konta żyje
   * w `paywall-dialog.tsx`; blog i dokumenty prawne są nietknięte.
   */
  if (uzytkownik && pathname === "/") {
    return przekierujDo(new URL("/app", request.url));
  }

  /*
   * PANEL REDAKCYJNY `/admin` — wymaga nie tylko konta, ale roli `admin`.
   *
   * Tu sprawdzamy WYŁĄCZNIE zalogowanie; samą rolę weryfikuje layout panelu
   * (`app/admin/layout.tsx`) przez RPC `czy_admin()`. Podział jest celowy:
   * `proxy` biegnie przy KAŻDYM żądaniu pasującym do matchera, więc dokładanie
   * tu odpytania bazy o rolę obciążałoby cały ruch — również ten na blogu
   * i landingu — żeby obsłużyć jedną osobę.
   *
   * Zalogowany bez roli dostaje 404 z layoutu, nie przekierowanie na logowanie:
   * „nie ma takiej strony" nie zdradza, że panel istnieje.
   */
  if (!uzytkownik && (pathname.startsWith("/app") || pathname.startsWith("/admin"))) {
    const cel = new URL("/logowanie", request.url);
    cel.searchParams.set("wroc", pathname + search);
    return przekierujDo(cel);
  }

  return odpowiedz;
}

export const config = {
  // Bez matchera proxy biegnie także dla plików statycznych, obrazków i fontów —
  // czyli dokładałby wywołanie sieciowe do każdego pliku CSS i każdej czcionki.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|pdfjs|stock|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|ttf|woff2?)$).*)",
  ],
};
