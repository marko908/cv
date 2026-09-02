import { APLIKACJA, FIRMA, OZNACZENIE_PRZEDSIEBIORCY, SCIEZKI } from "@/lib/prawne/dane";
import { CENA_JEDNORAZOWA, LIMIT_DARMOWY, LISTA_PLANOW } from "@/lib/subscription";
import { FAQ_LANDING } from "@/lib/faq-landing";
import { pobierzOpublikowane } from "@/lib/blog/zapytania";

/**
 * `/llms.txt` — zwięzła, maszynowo czytelna mapa serwisu dla modeli językowych.
 *
 * CZYM TO JEST: nieformalna konwencja (llmstxt.org) — plik tekstowy w Markdown
 * u korzenia domeny, który mówi asystentowi AI, czym jest ta strona i gdzie
 * leży sensowna treść. Żaden dostawca nie gwarantuje, że go przeczyta; koszt
 * utrzymania jest jednak zerowy, bo plik składa się z tych samych stałych, co
 * cennik i dokumenty prawne.
 *
 * PO CO, SKORO JEST `sitemap.xml`: sitemapa mówi „te adresy istnieją”. Tutaj
 * mówimy „to robi ten produkt, tyle kosztuje, tego NIE robi” — czyli dokładnie
 * to, co model musi wiedzieć, żeby odpowiedzieć na pytanie użytkownika bez
 * zgadywania. Zgadywanie kończy się zacytowaniem nieaktualnej ceny albo
 * funkcji, której nie mamy.
 *
 * ZASADA JAK W CENNIKU: żadnego zdania, którego nie pokrywa kod. Liczby idą
 * z `subscription.ts`, dane firmy z `dane.ts`, pytania z `faq-landing.ts`,
 * lista wpisów z bazy. Ręcznie wpisana kwota rozjechałaby się przy pierwszej
 * zmianie cennika — a rozjazd akurat tutaj oznacza, że asystent AI podaje
 * ludziom cenę, której nie honorujemy.
 *
 * `revalidate` — ten sam powód co w `sitemap.ts`: Route Handler jest domyślnie
 * cache'owany na stałe, więc bez tego nowy wpis bloga nie trafiłby do pliku aż
 * do kolejnego wdrożenia.
 */
export const revalidate = 3600;

/** Ile wpisów bloga wymieniamy. Plik ma być mapą, nie archiwum. */
const MAKS_WPISOW = 100;

export async function GET() {
  const baza = APLIKACJA.adresWww;
  const { wpisy } = await pobierzOpublikowane(1, MAKS_WPISOW);

  const cennik = LISTA_PLANOW.map(
    (p) =>
      `- ${p.nazwa}: ${p.ceny.miesiac} zł/mies. lub ${p.ceny.rok} zł/rok (brutto), ${p.limit} dopasowań miesięcznie.`
  ).join("\n");

  const artykuly =
    wpisy.length > 0
      ? wpisy
          .map((w) => `- [${w.tytul}](${baza}/blog/${w.slug})${w.zajawka ? `: ${w.zajawka}` : ""}`)
          .join("\n")
      : "- Blog wystartował - pierwsze wpisy są w przygotowaniu.";

  const faq = FAQ_LANDING.map((p) => `### ${p.pytanie}\n${p.odpowiedz}`).join("\n\n");

  const tresc = `# ${APLIKACJA.nazwa}

> Aplikacja webowa (SaaS), która dopasowuje CV kandydata do konkretnej oferty
> pracy na polskim rynku. Działa po polsku, pod polskie realia rekrutacyjne:
> systemy ATS, klauzula RODO, stonowany język bez amerykańskiego marketingu.

## Jak to działa

1. Użytkownik wgrywa istniejące CV (PDF/DOCX) albo tworzy je w kreatorze.
2. Wkleja treść ogłoszenia lub link do oferty z serwisu rekrutacyjnego.
3. Aplikacja wypisuje wymagania z ogłoszenia i sprawdza, które z nich CV pokrywa.
4. Przepisuje zmienne części CV (podsumowanie, punkty doświadczenia, kolejność
   umiejętności) i pokazuje wynik przed/po wraz z rozbiciem na kryteria oceny.
5. Zadaje pytania uzupełniające o brakujące konkrety i przelicza wynik.
6. Użytkownik pobiera gotowe CV w PDF w jednym z dziewięciu szablonów.

## Czego ta aplikacja NIE robi

- Nie zmyśla treści CV. Model dostaje wyłącznie fakty podane przez użytkownika
  i może je wybrać, uporządkować i przeformułować - nigdy dopisać. Pilnuje tego
  walidator w kodzie, który odrzuca wymyślone liczby, umiejętności, firmy,
  stanowiska i podniesione poziomy znajomości języków.
- Nie obiecuje zatrudnienia ani zaproszenia na rozmowę.
- Nie pisze listów motywacyjnych ani nie prowadzi symulacji rozmowy (na dziś).

## Cennik (brutto, PLN)

- Bezpłatnie i bez limitu: konto, kreator CV, wszystkie szablony, podgląd na
  żywo, pobranie własnego CV w PDF.
- Bezpłatnie co miesiąc: ${LIMIT_DARMOWY} w pełni odblokowane dopasowanie CV do oferty.
- Kolejne dopasowanie jednorazowo: ${CENA_JEDNORAZOWA} zł.
${cennik}

## Najważniejsze strony

- [Strona główna](${baza}): opis produktu, przykład wyniku, cennik, FAQ.
- [Cennik](${baza}${SCIEZKI.cennik}): plany, limity i cena jednorazowa.
- [Blog](${baza}/blog): poradniki o CV, ATS i rekrutacji na polskim rynku pracy.
- [Regulamin](${baza}${SCIEZKI.regulamin})
- [Polityka prywatności](${baza}${SCIEZKI.politykaPrywatnosci})
- [Regulamin newslettera](${baza}${SCIEZKI.regulaminNewslettera})

## Artykuły

${artykuly}

## Najczęstsze pytania

${faq}

## Wydawca

${OZNACZENIE_PRZEDSIEBIORCY}.
Adres: ${FIRMA.ulica}, ${FIRMA.kodMiasto}, Polska. Kontakt: ${FIRMA.email}.
`;

  return new Response(tresc, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      /*
       * `s-maxage` zgodne z `revalidate` powyżej, `stale-while-revalidate`
       * żeby odświeżenie nie było widoczne jako wolniejsza odpowiedź.
       */
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
