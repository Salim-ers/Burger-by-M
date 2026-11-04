import Link from "next/link";
import { cn } from "@/lib/utils";

const ArrowGlyph = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-4">
    <path d="M2.5 8h10.5M9 4l4 4-4 4" />
  </svg>
);

/**
 * Bouton de l'accueil : au survol, le disque de la flèche s'étend jusqu'à remplir le bouton, le libellé roule
 * et la flèche repart de la gauche. Lisible et complet sans survol (tactile) comme sans animation.
 */
export function Cta({ href, label, tone = "solid", className }: { href: string; label: string; tone?: "solid" | "glass"; className?: string }) {
  return (
    <Link href={href} className={cn("cta", tone === "solid" ? "cta-solid" : "cta-glass", className)}>
      <span className="cta-label" data-text={label}>
        <span>{label}</span>
      </span>
      <span aria-hidden className="cta-disc">
        <span className="cta-arrow">
          <ArrowGlyph />
          <ArrowGlyph />
        </span>
      </span>
    </Link>
  );
}

/** Lien texte secondaire : le trait se dessine, la flèche avance. */
export function QuietLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("quiet-link", className)}>
      <span className="quiet-link-text">{children}</span>
      <ArrowGlyph />
    </Link>
  );
}
