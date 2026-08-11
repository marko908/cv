import { CtaBloga } from "./cta-bloga";

/**
 * Treść artykułu + CTA wstawione W ŚRODKU tekstu.
 *
 * Czytelnik, który dotarł do połowy artykułu, jest najcieplejszym leadem, jaki
 * blog produkuje - CTA wyłącznie na końcu łapie tylko tych, którzy doczytali
 * do ostatniego akapitu. Dzielimy więc HTML po `</p>` i wstawiamy blok mniej
 * więcej po 40% akapitów.
 *
 * Przy krótkim wpisie (≤3 akapity) NIE przerywamy niczego - blok w połowie
 * trzyakapitowego tekstu czyta się jak reklama wklejona w zdanie.
 *
 * **Jeśli treść już zawiera własny `<div class="blog-cta-inline">`** (skill
 * `/blog-post` pisze go ręcznie, nawiązując do haczyka konkretnego artykułu -
 * generyczny automat konwertuje gorzej niż CTA dopasowane do tego, co
 * czytelnik właśnie przeczytał), NIE wstawiamy drugiego, automatycznego CTA
 * obok - dublowałoby się z tym, co już jest w treści. Renderujemy wtedy HTML
 * wprost, bez dzielenia.
 *
 * Dzielenie po `</p>` (a nie parsowanie DOM) jest świadomie prymitywne: HTML
 * pochodzi od nas, nie od użytkownika, więc nie ma tu klasy wejść, których ten
 * podział by nie obsłużył. Gdyby CTA miało kiedyś trafiać po nagłówku sekcji,
 * TO jest miejsce, w którym trzeba sięgnąć po prawdziwy parser.
 */
const PROG_AKAPITOW = 3;
const UDZIAL = 0.4;
const MA_WLASNE_CTA = /class="[^"]*\bblog-cta-inline\b/;

export function TrescWpisu({ html }: { html: string }) {
  if (MA_WLASNE_CTA.test(html)) {
    return (
      <div
        className="tresc-wpisu"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const czesci = html.split("</p>");

  if (czesci.length <= PROG_AKAPITOW + 1) {
    return (
      <div
        className="tresc-wpisu"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const punkt = Math.floor(czesci.length * UDZIAL);
  const gora = czesci.slice(0, punkt).join("</p>") + "</p>";
  const dol = czesci.slice(punkt).join("</p>");

  return (
    <div className="tresc-wpisu">
      <div dangerouslySetInnerHTML={{ __html: gora }} />
      <CtaBloga wariant="inline" />
      <div dangerouslySetInnerHTML={{ __html: dol }} />
    </div>
  );
}
