import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { DostawcaZgodCookies } from "@/components/cookies/kontekst-zgod";
import { StoreHydration } from "@/components/store-hydration";
import { APLIKACJA } from "@/lib/prawne/dane";

// Figtree — najbliższy dostępny odpowiednik kroju Circular/SpotifyMix.
const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Lato — ten sam krój, którym renderujemy PDF (@react-pdf), by podgląd CV
// odzwierciedlał rzeczywisty wygląd pobieranego pliku.
const lato = localFont({
  variable: "--font-cv",
  src: [
    { path: "../../public/fonts/Lato-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Lato-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Lato-Italic.ttf", weight: "400", style: "italic" },
  ],
});

/** Tytuł i opis w jednym miejscu — powtarza je Open Graph i karta Twittera. */
const TYTUL = "Aplikando — CV dopasowane do oferty pracy";
const OPIS =
  "Dopasuj lub stwórz CV pod konkretną ofertę pracy. AI wytrenowane pod polski rynek pracy: ATS, RODO, profesjonalna polszczyzna bez amerykańskiego hype'u.";

export const metadata: Metadata = {
  /*
   * BEZ `metadataBase` Next renderuje `og:image` i `canonical` jako ścieżki
   * WZGLĘDNE. Crawlery i podglądy linków (Facebook, LinkedIn, Slack, WhatsApp)
   * wymagają adresów bezwzględnych — bez tego miniatura nie pokazuje się nigdzie,
   * a canonical jest ignorowany. Dotyczy CAŁEJ strony, nie tylko bloga; brak
   * tego pola był realnym błędem SEO od początku projektu.
   */
  metadataBase: new URL(APLIKACJA.adresWww),
  title: TYTUL,
  description: OPIS,
  applicationName: APLIKACJA.nazwa,
  /*
   * `canonical` NIE stoi tutaj celowo — metadane są dziedziczone, więc adres
   * z korzenia przykleiłby się do każdej podstrony, która go nie nadpisuje.
   * Canonical ustawia każda strona u siebie (`page.tsx`, `blog/[slug]`, …).
   */
  openGraph: {
    type: "website",
    siteName: APLIKACJA.nazwa,
    locale: "pl_PL",
    url: "/",
    title: TYTUL,
    description: OPIS,
    /*
     * TYMCZASOWO logo, nie grafika promocyjna. Docelowo warto tu dać obraz
     * 1200×630 (`opengraph-image.tsx`) — ikona 512×409 wyświetli się jako
     * mały kafelek, ale brak `og:image` oznacza link BEZ ŻADNEJ miniatury
     * na LinkedInie i Facebooku, a tam ląduje większość udostępnień.
     */
    images: [{ url: "/aplikando-icon.png", width: 512, height: 409, alt: APLIKACJA.nazwa }],
  },
  twitter: {
    // `summary`, nie `summary_large_image` — duży wariant przycina obraz do
    // proporcji 1,91:1, więc kwadratowe logo zostałoby obcięte z góry i dołu.
    card: "summary",
    title: TYTUL,
    description: OPIS,
    images: ["/aplikando-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    /*
     * Domyślnie Google skraca opis w wynikach i pokazuje miniatury w małym
     * rozmiarze. Te trzy dyrektywy zdejmują limit — ma to znaczenie nie tylko
     * dla klasycznych wyników, ale i dla odpowiedzi generowanych przez AI:
     * krótszy dozwolony fragment to mniejsza szansa, że zacytowany zostanie
     * sensowny kawałek tekstu.
     */
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`dark ${figtree.variable} ${geistMono.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreHydration />
        {/*
          Zgody cookies obejmują CAŁĄ aplikację, więc dostawca stoi w korzeniu.
          `children` przekazujemy jako prop z komponentu serwerowego — drzewo
          stron zostaje serwerowe, klientem staje się wyłącznie sam mechanizm
          zgód. Skrypty narzędzi analitycznych i marketingowych ładuje ten
          dostawca i tylko po zgodzie właściwej kategorii.
        */}
        <DostawcaZgodCookies>{children}</DostawcaZgodCookies>
      </body>
    </html>
  );
}
