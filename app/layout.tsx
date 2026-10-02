import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/layout/StoreHydrator";
import { siteUrl } from "@/lib/seo";
import { restaurant } from "@/data/restaurant";
import "./globals.css";

const bodoni = localFont({
  src: [
    { path: "./fonts/bodoni-moda.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/bodoni-moda-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-bodoni",
  display: "swap",
  preload: true,
});

const manrope = localFont({
  src: [{ path: "./fonts/manrope.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-manrope",
  display: "swap",
});

const description =
  "Smash burgers, Classics au steak façon bouchère, Frenchy’s, frites et milkshakes. Burger By M, 19 avenue de la Gare à Rantigny (60290). Commande à emporter en ligne.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Burger By M — Smash Burger à Rantigny",
    template: "%s · Burger By M Rantigny",
  },
  description,
  applicationName: restaurant.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: restaurant.name,
    title: "Burger By M — Smash Burger à Rantigny",
    description,
    images: [{ url: "/images/social/og-image.jpg", width: 1200, height: 630, alt: "Burger By M, smash burger à Rantigny" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Burger By M — Smash Burger à Rantigny",
    description,
    images: ["/images/social/og-image.jpg"],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
