import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="scheme-light flex min-h-dvh flex-col bg-cream">
      <div className="shell flex h-16 items-center md:h-[72px]">
        <Link href="/" aria-label="Burger By M — accueil">
          <Logo size={44} />
        </Link>
      </div>
      <div className="shell flex flex-1 flex-col items-center justify-center pb-20 text-center">
        <p className="font-display text-[7rem] leading-none md:text-[10rem]" aria-hidden>
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">Cette page n’existe pas</h1>
        <p className="mt-2 text-muted">Elle a peut-être été déplacée. La carte, elle, est toujours là.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/menu" variant="dark" size="lg">
            Voir la carte
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Accueil
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
