import type { MetadataRoute } from "next";
import { APLIKACJA } from "@/lib/prawne/dane";

/**
 * robots.txt — generowany, nie statyczny, żeby adres sitemapy szedł z
 * `dane.ts` (jedno źródło domeny) i nie rozjechał się przy zmianie domeny.
 *
 * Wskazanie sitemapy jest tu najważniejsze: bez niego Google musi odkrywać
 * wpisy bloga wyłącznie przez linkowanie, co przy nowej domenie bez profilu
 * linków oznacza tygodnie zwłoki w indeksacji.
 *
 * Blokujemy to, co nie ma prawa trafić do wyników: panel aplikacji i panel
 * redakcyjny (treść za logowaniem, zero wartości w indeksie), trasy API oraz
 * podglądy szkiców. `/blog/podglad/` ma dodatkowo `noindex` w metadanych
 * strony — robots.txt sam w sobie NIE usuwa strony z indeksu, jeśli ktoś do
 * niej podlinkuje, więc te dwa mechanizmy muszą działać razem.
 */

/**
 * Ścieżki zamknięte dla KAŻDEGO robota. Jedna lista, żeby dopisanie trasy
 * za logowaniem nie wymagało pamiętania o trzech grupach niżej.
 */
const ZAMKNIETE = [
  "/app/",
  "/admin/",
  "/api/",
  "/blog/podglad/",
  "/auth/",
  "/dokoncz-rejestracje",
];

/**
 * Roboty asystentów AI odpytujące strony NA ŻYWO, żeby odpowiedzieć
 * użytkownikowi i podać źródło. To one przynoszą ruch i cytowania — dla nich
 * blokada byłaby strzałem w stopę: bez dostępu asystent i tak odpowie, tylko
 * powoła się na konkurencję.
 */
const ROBOTY_WYSZUKIWANIA_AI = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "Applebot",
];

/**
 * Roboty zbierające treść do TRENOWANIA modeli. Tu wybór jest realny, bo nic
 * nie oddają w zamian bezpośrednio — ale treść bloga jest publiczna i pisana
 * właśnie po to, żeby marka pojawiała się w odpowiedziach modeli. Dlatego
 * ZGODA (decyzja do zmiany jedną linijką: `allow` → `disallow: "/"`).
 *
 * `Google-Extended` i `Applebot-Extended` NIE są robotami — to przełączniki
 * zgody na trenowanie dla botów, które i tak indeksują stronę. Ich blokada
 * nie wpływa na pozycje w wyszukiwarce.
 */
const ROBOTY_TRENUJACE = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Meta-ExternalAgent",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Diffbot",
  "Timpibot",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    /*
     * Grupy są WYPISANE, mimo że wszystkie mają te same reguły co „*".
     * Powód nie jest kosmetyczny: robot, który znajdzie grupę ze swoją nazwą,
     * ignoruje grupę „*" w całości. Jawny wpis oznacza więc, że przyszła
     * zmiana reguł ogólnych nie ominie po cichu botów AI — i że polityka
     * wobec nich jest decyzją zapisaną w kodzie, a nie skutkiem ubocznym.
     */
    rules: [
      { userAgent: "*", allow: "/", disallow: ZAMKNIETE },
      { userAgent: ROBOTY_WYSZUKIWANIA_AI, allow: "/", disallow: ZAMKNIETE },
      { userAgent: ROBOTY_TRENUJACE, allow: "/", disallow: ZAMKNIETE },
    ],
    sitemap: `${APLIKACJA.adresWww}/sitemap.xml`,
  };
}
