/**
 * Regulamin jako plik PDF — załącznik do maili potwierdzających (checklista
 * prawnika, poz. 1: „Wdrożenie w aplikacji systemu wysyłającego regulamin
 * w postaci pliku PDF jako załącznik do każdej wiadomości potwierdzającej
 * złożenie zamówienia oraz utworzenie konta").
 *
 * SERWEROWY, NIE „use client" — renderowany wyłącznie w trasach API
 * (`renderToBuffer`, wołane z `/api/konto/powitanie` i z webhooka Stripe'a),
 * nigdy w przeglądarce. Stąd font ładowany z dysku (`path.join`), nie spod
 * `/fonts/...` jak w `cv-pdf.tsx` — tam działa `fetch` przeglądarki, tutaj
 * trzeba realnej ścieżki na dysku funkcji serwerowej.
 *
 * Treść bierze się z `parsujDokument`/`rozbijInline` (`lib/prawne/`) — TEN
 * SAM parser, którego używa `dokument-prawny.tsx` na stronie WWW. Jedno
 * źródło składni: zmiana sposobu zapisu Regulaminu (np. nowy rodzaj bloku)
 * nie może po cichu przestać działać w PDF-ie, skoro strona wygląda dobrze.
 */

import path from "node:path";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  parsujDokument,
  rozbijInline,
  type FragmentInline,
} from "@/lib/prawne/parsuj-dokument";
import { APLIKACJA } from "@/lib/prawne/dane";
import { REGULAMIN } from "@/lib/prawne/regulamin";
import { REGULAMIN_NEWSLETTERA } from "@/lib/prawne/regulamin-newslettera";

let fontZarejestrowany = false;

/** Rejestracja raz na proces — kolejne wywołania w tej samej funkcji lambda są tanie. */
function zarejestrujFont() {
  if (fontZarejestrowany) return;
  fontZarejestrowany = true;
  const katalog = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Lato",
    fonts: [
      { src: path.join(katalog, "Lato-Regular.ttf") },
      { src: path.join(katalog, "Lato-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(katalog, "Lato-Italic.ttf"), fontStyle: "italic" },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

const style = StyleSheet.create({
  strona: {
    fontFamily: "Lato",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#1a1a1a",
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
  },
  h1: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
  },
  h2: {
    fontSize: 12.5,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    paddingTop: 10,
    borderTopWidth: 0.75,
    borderTopColor: "#cccccc",
  },
  h3: {
    fontSize: 10.5,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  akapit: {
    marginBottom: 6,
  },
  pozycjaWiersz: {
    flexDirection: "row",
    marginBottom: 4,
  },
  znacznik: {
    flexShrink: 0,
  },
  tresc: {
    flex: 1,
  },
  pogrubienie: {
    fontWeight: "bold",
  },
  link: {
    color: "#0057D9",
    textDecoration: "underline",
  },
  tabela: {
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 0.75,
    borderColor: "#cccccc",
  },
  tabelaWiersz: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: "#cccccc",
  },
  tabelaKomorka: {
    flex: 1,
    padding: 4,
    fontSize: 8.5,
    borderRightWidth: 0.75,
    borderRightColor: "#cccccc",
  },
  tabelaNaglowek: {
    fontWeight: "bold",
    backgroundColor: "#f2f2f2",
  },
  stopka: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 0.75,
    borderTopColor: "#cccccc",
    fontSize: 8,
    color: "#666666",
  },
});

/** Wcięcie i szerokość markera rosną z poziomem — te same proporcje co na stronie WWW. */
const WCIECIE_PT = [0, 18, 36] as const;
const SZEROKOSC_MARKERA_PT = [24, 20, 18] as const;

/** Ścieżki wewnętrzne (`/regulamin`) w PDF-ie muszą być pełnym adresem — nie ma routera. */
function pelnyAdres(adres: string): string {
  if (adres.startsWith("/")) return `${APLIKACJA.adresWww}${adres}`;
  return adres;
}

function Inline({ tekst }: { tekst: string }) {
  return (
    <>
      {rozbijInline(tekst).map((fragment: FragmentInline, i) => {
        if (fragment.typ === "pogrubienie") {
          return (
            <Text key={i} style={style.pogrubienie}>
              {fragment.tresc}
            </Text>
          );
        }
        if (fragment.typ === "link") {
          return (
            <Link key={i} src={pelnyAdres(fragment.adres)} style={style.link}>
              {fragment.etykieta}
            </Link>
          );
        }
        return <Text key={i}>{fragment.tresc}</Text>;
      })}
    </>
  );
}

/**
 * Dokument PDF gotowy do `renderToBuffer`. `zrodlo` to string ze
 * `src/lib/prawne/regulamin.ts` (albo innego dokumentu w tej samej składni).
 */
export function DokumentPdf({ zrodlo }: { zrodlo: string }) {
  zarejestrujFont();
  const bloki = parsujDokument(zrodlo);

  return (
    <Document>
      <Page size="A4" style={style.strona} wrap>
        {bloki.map((blok, i) => {
          switch (blok.typ) {
            case "naglowek": {
              const stylNaglowka =
                blok.poziom === 1 ? style.h1 : blok.poziom === 2 ? style.h2 : style.h3;
              return (
                <Text key={i} style={stylNaglowka}>
                  {blok.tekst}
                </Text>
              );
            }

            case "akapit":
              return (
                <Text key={i} style={style.akapit}>
                  <Inline tekst={blok.tekst} />
                </Text>
              );

            case "pozycja":
              return (
                <View
                  key={i}
                  style={[style.pozycjaWiersz, { paddingLeft: WCIECIE_PT[blok.poziom] }]}
                  wrap={false}
                >
                  <Text style={[style.znacznik, { width: SZEROKOSC_MARKERA_PT[blok.poziom] }]}>
                    {blok.znacznik}
                  </Text>
                  <Text style={style.tresc}>
                    <Inline tekst={blok.tekst} />
                  </Text>
                </View>
              );

            case "tabela": {
              const [naglowki, ...reszta] = blok.wiersze;
              return (
                <View key={i} style={style.tabela}>
                  <View style={style.tabelaWiersz}>
                    {naglowki.map((komorka, k) => (
                      <Text
                        key={k}
                        style={[style.tabelaKomorka, style.tabelaNaglowek]}
                      >
                        {komorka}
                      </Text>
                    ))}
                  </View>
                  {reszta.map((wiersz, w) => (
                    <View key={w} style={style.tabelaWiersz}>
                      {wiersz.map((komorka, k) => (
                        <Text key={k} style={style.tabelaKomorka}>
                          {komorka}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              );
            }
          }
        })}

        <Text style={style.stopka} fixed>
          {APLIKACJA.nazwa} — {APLIKACJA.adresWww}
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Gotowy Buffer z aktualnym Regulaminem — do dołączenia jako załącznik maila.
 * Jedno miejsce wołane z `/api/konto/powitanie` i z webhooka Stripe'a, żeby
 * oba maile zawsze niosły TĘ SAMĄ, aktualną wersję dokumentu.
 */
export async function regulaminPdfBuffer(): Promise<Buffer> {
  return renderToBuffer(<DokumentPdf zrodlo={REGULAMIN} />);
}

/**
 * Regulamin newslettera jako PDF — załącznik do wiadomości potwierdzającej
 * zapis (checklista prawnika, poz. 42: „system wysyłający regulamin w postaci
 * pliku PDF jako załącznik do każdej wiadomości potwierdzającej zapis do
 * newslettera"; instrukcja, Krok III).
 *
 * Zapis następuje przez checkbox przy rejestracji, więc wiadomością
 * potwierdzającą jest mail powitalny — stąd wołane z `/api/konto/powitanie`,
 * obok `regulaminPdfBuffer`, ale TYLKO gdy zgoda została udzielona.
 */
export async function regulaminNewsletteraPdfBuffer(): Promise<Buffer> {
  return renderToBuffer(<DokumentPdf zrodlo={REGULAMIN_NEWSLETTERA} />);
}
