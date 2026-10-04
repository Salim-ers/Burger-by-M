import type { Metadata, Viewport } from "next";

// Toujours rendu à la demande (session, données en direct) : rien n'est généré au build.
export const dynamic = "force-dynamic";

/** Administration : jamais indexée, installable comme application (écran cuisine). */
export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin Burger By M" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "BBM Cuisine", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
  referrer: "same-origin",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="on-dark min-h-dvh bg-ink text-fg">{children}</div>;
}
