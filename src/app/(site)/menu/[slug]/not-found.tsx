import { ButtonLink } from "@/components/ui/Button";

export default function ProductNotFound() {
  return (
    <section className="on-light bg-ivory pt-36 pb-28 md:pt-48">
      <div className="shell">
        <p className="kicker text-brass-deep">Erreur 404</p>
        <h1 className="display-2 mt-6">
          Ce burger n’est pas <span className="italic">à la carte.</span>
        </h1>
        <p className="mt-6 max-w-md text-sub">Il a peut-être changé de nom, ou quitté la carte. Les autres vous attendent.</p>
        <ButtonLink href="/menu" variant="ink" size="lg" arrow className="mt-10">
          Voir la carte
        </ButtonLink>
      </div>
    </section>
  );
}
