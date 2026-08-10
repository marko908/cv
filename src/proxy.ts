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
  if (!uzytkownik && pathname.startsWith("/app")) {
    const cel = new URL("/logowanie", request.url);
    cel.searchParams.set("wroc", pathname + search);
    const przekierowanie = NextResponse.redirect(cel);
    // Ciasteczka odświeżonej sesji (jeśli `setAll` zdążyło coś zapisać na
    // `odpowiedz` powyżej) muszą przejść na TĘ odpowiedź — inaczej
    // przekierowanie zbudowane od zera by je zgubiło.
    for (const ciastko of odpowiedz.cookies.getAll()) {
      przekierowanie.cookies.set(ciastko);
    }
    return przekierowanie;
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
