import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { legalNav, mainNav, secondaryNav } from "@/data/navigation";
import { brand, mapsLinks } from "@/data/brand";
import { DAY_NAMES, DAY_ORDER, formatRanges } from "@/lib/schedule";
import type { PublicStore } from "@/features/public-data";

export function SiteFooter({ store }: { store: PublicStore }) {
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const maps = mapsLinks(address);
  const socials = [
    { label: "Instagram", url: store.instagramUrl },
    { label: "Facebook", url: store.facebookUrl },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));
  return (
    <footer className="on-dark relative overflow-hidden bg-ink pt-20 pb-28 md:pt-28 md:pb-12">
      <div className="shell grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo size={80} />
          <p className="mt-8 font-serif text-3xl leading-tight">
            Brut. Généreux.
            <br />
            <span className="italic text-brass">Signé M.</span>
          </p>
        </div>
        <nav aria-label="Pied de page" className="md:col-span-2">
          <p className="kicker text-sub">Navigation</p>
          <ul className="mt-5 space-y-3 text-[0.95rem]">
            {[{ href: "/menu", label: "Commander" }, ...mainNav, ...secondaryNav].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-fg/80 transition-colors hover:text-brass">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="kicker text-sub">Le restaurant</p>
          <address className="mt-5 space-y-3 text-[0.95rem] text-fg/80 not-italic">
            <p>
              {store.street}
              <br />
              {store.postalCode} {store.city}
            </p>
            <p>
              <a href={store.phoneHref} className="hover:text-brass">
                {store.phone}
              </a>
            </p>
            <p>
              <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="underline decoration-fg/30 underline-offset-4 hover:text-brass">
                Itinéraire
              </a>
            </p>
            {socials.map((s) => (
              <p key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-brass">
                  {s.label}
                </a>
              </p>
            ))}
          </address>
        </div>
        <div className="md:col-span-3">
          <p className="kicker text-sub">Horaires</p>
          <dl className="mt-5 space-y-2 text-[0.9rem]">
            {DAY_ORDER.map((d) => (
              <div key={d} className="flex justify-between gap-4">
                <dt className="text-fg/55">{DAY_NAMES[d]}</dt>
                <dd className="text-right text-fg/85 tabular-nums">{formatRanges(store.schedule.weekly.filter((r) => r.dayOfWeek === d))}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="shell mt-16">
        <div className="hairline opacity-40" />
        <div className="flex flex-col gap-4 pt-6 text-xs text-fg/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legal.companyName} — {brand.legal.legalForm} — SIRET {brand.legal.siret}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none mt-16 text-center font-serif text-[16vw] leading-[0.8] tracking-[-0.04em] whitespace-nowrap text-fg/[0.05] select-none">
        Burger <span className="italic">by</span> M
      </p>
    </footer>
  );
}
