import type { Metadata, Viewport } from "next";

// Rendu à la demande : la politique de sécurité (CSP) du site repose sur un nonce généré à chaque requête.
export const dynamic = "force-dynamic";

/** Pages de démonstration hors du site (cuisine, paiement simulé) : jamais indexées, aucune donnée réelle. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export const viewport: Viewport = { themeColor: "#0a0a0a", colorScheme: "dark" };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
