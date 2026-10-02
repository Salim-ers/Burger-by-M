import Image from "next/image";
import { RevealText } from "@/components/animations/RevealText";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { ButtonLink } from "@/components/ui/Button";
import { images } from "@/data/images";

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="relative isolate overflow-hidden bg-ink py-32 md:py-48">
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-full md:w-[52%]">
        <Image src={images.plateau.src} alt="" fill sizes="(min-width: 768px) 52vw, 100vw" className="object-cover object-[60%_30%] opacity-60 md:opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink/0 max-md:bg-ink/60" />
      </div>
      <div className="container-site">
        <RevealText id="final-title" lines={["Tu commandes", "quoi ?"]} className="font-display text-giant font-medium uppercase" />
        <p className="mt-8 max-w-sm text-lg text-cream/75">Commande en ligne, retrait au 19 avenue de la Gare. Paiement sur place.</p>
        <div className="mt-12">
          <MagneticButton>
            <ButtonLink href="/commander" variant="cream" size="xl" arrow data-cursor="Go">
              Je choisis mon burger
            </ButtonLink>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
