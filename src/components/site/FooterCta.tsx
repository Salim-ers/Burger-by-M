"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Bouton « Commander » du pied de page : masqué sur l'accueil, dont la dernière séquence est déjà ce bouton. */
export function FooterCta() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <Link href="/menu" className="t-label inline-flex h-14 items-center justify-center bg-cheddar px-10 text-ink transition-colors hover:bg-cream">
      Commander
    </Link>
  );
}
