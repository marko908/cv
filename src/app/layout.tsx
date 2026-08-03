import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { StoreHydration } from "@/components/store-hydration";
import { Analytics } from "@vercel/analytics/next";

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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
