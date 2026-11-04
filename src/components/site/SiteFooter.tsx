import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { legalNav, mainNav } from "@/data/navigation";
import { brand, mapsLinks } from "@/data/brand";
import type { PublicStore } from "@/features/public-data";

const LINK = "inline-flex min-h-11 items-center transition-colors duration-300 hover:text-cream md:min-h-0";

/**
 * Pied de page : liens à gauche, logo Burger by M en petit au centre, coordonnées à droite, mentions légales dessous.
 * Les informations d'entreprise (forme, SIRET) sont dans les mentions légales.
 * Marge basse sur mobile : la barre du panier ne doit jamais cacher les liens légaux.
 */
export function SiteFooter({ store }: { store: PublicStore }) {
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const maps = mapsLinks(address);
  const contacts = [
    { label: store.phone, href: store.phoneHref },
    ...(store.email ? [{ label: store.email, href: `mailto:${store.email}` }] : []),
    ...(store.instagramUrl ? [{ label: "Instagram", href: store.instagramUrl, external: true }] : []),
    ...(store.facebookUrl ? [{ label: "Facebook", href: store.facebookUrl, external: true }] : []),
  ];

  return (
    <footer data-theme="dark" className="on-dark bg-ink pt-10 pb-24 text-[0.92rem] text-cream/70 md:pt-14 md:pb-8">
      <div className="container-cine">
        <div className="grid items-center gap-7 border-b border-rule pb-8 text-center md:grid-cols-[1fr_auto_1fr] md:text-left">
          <nav aria-label="Liens du site" className="order-2 md:order-1">
            <ul className="flex flex-wrap justify-center gap-x-6 font-semibold text-cream/85 md:justify-start">
              {mainNav
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={LINK}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              <li>
                <Link href="/restaurant#horaires-title" className={LINK}>
                  Horaires
                </Link>
              </li>
            </ul>
          </nav>

          <Link href="/" aria-label={`${store.name} — accueil`} className="order-1 flex flex-col items-center gap-2 justify-self-center text-cream md:order-2">
            <Image src={brand.logo.src} alt="" width={56} height={56} sizes="56px" className="size-14 rounded-full" />
            <Wordmark accent className="text-[1.25rem]" />
          </Link>

          <address className="order-3 not-italic md:text-right">
            <p>
              {address}{" "}
              <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline decoration-cream/30 underline-offset-4 transition-colors duration-300 hover:text-cream">
                Itinéraire
              </a>
            </p>
            <ul className="mt-1 flex flex-wrap justify-center gap-x-5 md:justify-end">
              {contacts.map((c) => (
                <li key={c.href}>
                  <a href={c.href} {...("external" in c ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${LINK} break-all`}>
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </address>
        </div>

        <div className="flex flex-col items-center gap-2 pt-5 text-xs text-cream/45 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}
          </p>
          <ul className="flex flex-wrap justify-center gap-x-5">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
