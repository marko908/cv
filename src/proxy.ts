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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
    }
  );

  await supabase.auth.getUser();

  return odpowiedz;
}

export const config = {
  // Bez matchera proxy biegnie także dla plików statycznych, obrazków i fontów —
  // czyli dokładałby wywołanie sieciowe do każdego pliku CSS i każdej czcionki.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|pdfjs|stock|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|ttf|woff2?)$).*)",
  ],
};
