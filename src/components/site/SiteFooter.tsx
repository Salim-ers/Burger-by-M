import Image from "next/image";
import Link from "next/link";
import { legalNav } from "@/data/navigation";
import { brand, mapsLinks } from "@/data/brand";
import { DAY_NAMES, DAY_ORDER, formatRanges } from "@/lib/schedule";
import type { PublicStore } from "@/features/public-data";
import type { MenuCategory } from "@/features/menu/types";

/** Pied de page noir : très grand « BURGER BY M » qui sort du cadre, colonnes, coordonnées réelles. */
export function SiteFooter({ store, menu }: { store: PublicStore; menu: Pick<MenuCategory, "slug" | "name">[] }) {
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const maps = mapsLinks(address);
  const socials = [
    { label: "Instagram", url: store.instagramUrl },
    { label: "Facebook", url: store.facebookUrl },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer data-theme="dark" className="on-dark relative overflow-hidden bg-ink pt-24 md:pt-32">
      <div className="container-bm">
        <div className="flex flex-col gap-10 border-b border-rule pb-16 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <Image src={brand.logo.src} alt="Logo Burger By M" width={96} height={96} className="size-20 rounded-full md:size-24" />
            <p className="s-m max-w-xs text-cream/90">Généreux par nature. Préparé à la commande, à {store.city}.</p>
          </div>
          <Link href="/menu" className="t-label inline-flex h-14 items-center justify-center bg-cheddar px-10 text-ink transition-colors hover:bg-cream">
            Commander
          </Link>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.45fr_1fr_1fr]">
          <nav aria-label="La carte">
            <p className="t-label text-sub">Carte</p>
            <ul className="mt-5 space-y-2.5 text-[0.95rem]">
              {menu.map((c) => (
                <li key={c.slug}>
                  <Link href={`/menu#cat-${c.slug}`} className="text-cream/80 transition-colors hover:text-cheddar">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="t-label text-sub">Restaurant</p>
            <address className="mt-5 space-y-2.5 text-[0.95rem] text-cream/80 not-italic">
              <p>
                {store.street}
                <br />
                {store.postalCode} {store.city}
              </p>
              <p>
                <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4 hover:text-cheddar">
                  Itinéraire
                </a>
              </p>
              <p>
                <Link href="/restaurant" className="hover:text-cheddar">
                  Le restaurant
                </Link>
              </p>
              <p>
                <Link href="/galerie" className="hover:text-cheddar">
                  Galerie
                </Link>
              </p>
            </address>
          </div>
          <div>
            <p className="t-label text-sub">Horaires</p>
            <dl className="mt-5 space-y-1.5 text-[0.88rem]">
              {DAY_ORDER.map((d) => (
                <div key={d} className="flex justify-between gap-4">
                  <dt className="text-cream/55">{DAY_NAMES[d]}</dt>
                  <dd className="text-right whitespace-nowrap text-cream/85 tabular-nums">{formatRanges(store.schedule.weekly.filter((r) => r.dayOfWeek === d))}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="t-label text-sub">Commander</p>
            <ul className="mt-5 space-y-2.5 text-[0.95rem] text-cream/80">
              <li>
                <Link href="/menu" className="hover:text-cheddar">
                  Click &amp; collect
                </Link>
              </li>
              <li>Retrait sur place</li>
              <li>{store.paymentMethods.includes("card") ? "Carte en ligne ou au retrait" : "Paiement au retrait"}</li>
            </ul>
          </div>
          <div>
            <p className="t-label text-sub">Contact</p>
            <ul className="mt-5 space-y-2.5 text-[0.95rem] text-cream/80">
              <li>
                <a href={store.phoneHref} className="hover:text-cheddar">
                  {store.phone}
                </a>
              </li>
              {store.email && (
                <li>
                  <a href={`mailto:${store.email}`} className="break-all hover:text-cheddar">
                    {store.email}
                  </a>
                </li>
              )}
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-cheddar">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-rule py-6 text-xs text-cream/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legal.companyName} · {brand.legal.legalForm} · SIRET {brand.legal.siret}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p aria-hidden className="pointer-events-none -mb-[5vw] flex items-baseline justify-center gap-[2vw] leading-[0.78] whitespace-nowrap text-cream select-none">
        <span className="font-display text-[23vw] tracking-[-0.01em]">BURGER</span>
        <span className="font-serif text-[17vw] text-pink italic">by M</span>
      </p>
    </footer>
  );
}
