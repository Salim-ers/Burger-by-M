import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { brand } from "@/data/brand";
import { siteUrl } from "@/lib/seo";
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
  "Burger By M, smash burgers et créations généreuses à Rantigny (Oise) : carte, commande en ligne et retrait au 19 avenue de la Gare. Près de Clermont et Creil.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Burger By M — Smash burgers à Rantigny", template: "%s · Burger By M Rantigny" },
  description,
  applicationName: brand.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: brand.name,
    title: "Burger By M — Smash burgers à Rantigny",
    description,
    images: [{ url: "/images/social/og-burger-by-m.jpg", width: 1200, height: 630, alt: "Smash Double Burger By M : double steak smash et cheddar fondu" }],
  },
  twitter: { card: "summary_large_image", title: "Burger By M — Smash burgers à Rantigny", description, images: ["/images/social/og-burger-by-m.jpg"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
