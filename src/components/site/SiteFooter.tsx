import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { legalNav, mainNav } from "@/data/navigation";
import { brand, mapsLinks } from "@/data/brand";
import type { PublicStore } from "@/features/public-data";

const LINK = "inline-flex min-h-11 items-center transition-colors duration-300 hover:text-cream md:min-h-0";

/**
 * Pied de page : l'essentiel, sur deux lignes en grand écran. Coordonnées réelles (base), liens utiles, mentions légales.
 * La carte et les horaires ont leur page ; « Commander » reste toujours accessible dans la barre flottante.
 * Marge basse sur mobile : la barre du panier ne doit jamais cacher les mentions légales.
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
        <div className="flex flex-col gap-6 border-b border-rule pb-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-10">
            <Link href="/" aria-label={`${store.name} — accueil`} className="flex w-fit shrink-0 items-center gap-3 text-cream">
              <Image src={brand.logo.src} alt="" width={56} height={56} sizes="56px" className="size-14 rounded-full" />
              <Wordmark accent className="text-[clamp(1.5rem,2.2vw,2rem)]" />
            </Link>
            <nav aria-label="Liens du site">
              <ul className="flex flex-wrap gap-x-6 gap-y-0 font-semibold text-cream/85">
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
          </div>

          <address className="not-italic lg:text-right">
            <p>
              {address}{" "}
              <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline decoration-cream/30 underline-offset-4 transition-colors duration-300 hover:text-cream">
                Itinéraire
              </a>
            </p>
            <ul className="mt-1 flex flex-wrap gap-x-5 lg:justify-end">
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

        <div className="flex flex-col gap-3 pt-5 text-xs text-cream/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legal.companyName}, {brand.legal.legalForm}, SIRET {brand.legal.siret}
          </p>
          <ul className="flex flex-wrap gap-x-5">
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
