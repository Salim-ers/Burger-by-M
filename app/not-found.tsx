import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grain scheme-dark flex min-h-dvh flex-col bg-ink">
      <div className="shell flex h-20 items-center md:h-24">
        <Link href="/" aria-label="Burger By M — accueil">
          <Logo size={44} />
        </Link>
      </div>
      <div className="shell flex flex-1 flex-col justify-center pb-16">
        <p className="font-display text-[clamp(9rem,42vw,34rem)] leading-[0.78] text-bone" aria-hidden>
          404<span className="text-cheddar">.</span>
        </p>
        <div className="mt-8 flex flex-col gap-10 border-t border-graphite pt-8 md:flex-row md:items-end md:justify-between">
          <h1 className="font-display text-d3">
            Ce burger
            <br />
            n’est pas
            <br />
            à la carte.
          </h1>
          <ButtonLink href="/menu" variant="primary" size="xl" arrow className="self-start md:self-auto">
            Voir le menu
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
