import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s · Admin Burger By M" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink text-cream">{children}</div>;
}
