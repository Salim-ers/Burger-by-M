import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Anton, Instrument_Serif } from "next/font/google";
import { brand } from "@/data/brand";
import { defaultOgImage, siteUrl } from "@/lib/seo";
import "./globals.css";

/** Brut : SMASHED. MELTED. CRISPY. */
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
/** Éditorial : « by M », « Généreux par nature ». */
const instrument = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument", display: "swap" });
/** Interface : navigation, labels, formulaires. */
const manrope = localFont({ src: [{ path: "./fonts/manrope.woff2", style: "normal", weight: "200 800" }], variable: "--font-manrope", display: "swap" });

const title = "Burger By M — Smash burgers à Rantigny (Oise)";
const description =
  "Burger By M, smash burgers, Frenchy’s et créations généreuses préparées à la commande à Rantigny, près de Creil et Clermont (Oise). Carte, click & collect et retrait au 19 avenue de la Gare.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s · Burger By M Rantigny" },
  description,
  applicationName: brand.name,
  keywords: ["Burger By M", "Burger By M Rantigny", "burger Rantigny", "smash burger Rantigny", "restaurant Rantigny", "burger Oise", "smash burger Oise", "burger près de Creil", "click and collect Rantigny"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "fr_FR", siteName: brand.name, title, description, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title, description, images: [defaultOgImage.url] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning : la classe « intro-seen » est posée avant l'hydratation (script de l'intro).
    <html lang="fr" data-scroll-behavior="smooth" className={`${anton.variable} ${instrument.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
