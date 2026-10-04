import { ButtonLink } from "@/components/ui/Button";

export default function ProductNotFound() {
  return (
    <section data-theme="dark" className="on-dark flex min-h-[80svh] items-end bg-ink pt-36 pb-20 md:pb-28">
      <div className="container-bm">
        <p className="t-label text-cheddar">Erreur 404</p>
        <h1 className="mt-6">
          <span className="t-xl block">Pas à</span>
          <span className="s-xl block">la carte.</span>
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-cream/70">Ce produit a peut-être changé de nom, ou quitté la carte. Les autres vous attendent.</p>
        <ButtonLink href="/menu" variant="cheddar" size="lg" arrow className="mt-10">
          Voir la carte
        </ButtonLink>
      </div>
    </section>
  );
}
