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

export const metadata: Metadata = {
  /*
   * BEZ `metadataBase` Next renderuje `og:image` i `canonical` jako ścieżki
   * WZGLĘDNE. Crawlery i podglądy linków (Facebook, LinkedIn, Slack, WhatsApp)
   * wymagają adresów bezwzględnych — bez tego miniatura nie pokazuje się nigdzie,
   * a canonical jest ignorowany. Dotyczy CAŁEJ strony, nie tylko bloga; brak
   * tego pola był realnym błędem SEO od początku projektu.
   */
  metadataBase: new URL(APLIKACJA.adresWww),
  title: "Aplikando — CV dopasowane do oferty pracy",
  description:
    "Dopasuj lub stwórz CV pod konkretną ofertę pracy. AI wytrenowane pod polski rynek pracy: ATS, RODO, profesjonalna polszczyzna bez amerykańskiego hype'u.",
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
