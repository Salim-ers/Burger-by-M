import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LocalBlock } from "./LocalBlock";
import { legalNav } from "@/data/navigation";
import { restaurant } from "@/data/restaurant";
import { DAY_NAMES, DAY_ORDER, restaurantHours } from "@/data/opening-hours";
import { formatRanges } from "@/lib/hours";

export function Footer() {
  const socials = [
    { label: "Instagram", url: restaurant.socials.instagram.url },
    { label: "Facebook", url: restaurant.socials.facebook.url },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer className="relative overflow-hidden bg-ink pt-24 text-cream md:pt-32">
      <div className="container-site">
        <LocalBlock className="border-b border-cream/12 pb-16" />

        <div className="grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo size={88} />
            <p className="mt-8 font-display text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[0.95] uppercase">
              Smashé avec amour.
              <br />
              <span className="text-rose">Servi à Rantigny.</span>
            </p>
          </div>

          <nav aria-label="Pied de page" className="md:col-span-2">
            <h2 className="text-xs font-bold tracking-[0.16em] text-cream/50 uppercase">Navigation</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {[
                { href: "/menu", label: "La carte" },
                { href: "/commander", label: "Commander" },
                { href: "/restaurant", label: "Le restaurant" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/80 transition-colors hover:text-rose">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="text-xs font-bold tracking-[0.16em] text-cream/50 uppercase">Horaires</h2>
            <dl className="mt-5 space-y-2 text-[0.9rem]">
              {DAY_ORDER.map((d) => (
                <div key={d} className="flex justify-between gap-4">
                  <dt className="text-cream/60">{DAY_NAMES[d]}</dt>
                  <dd className="text-right text-cream/85 tabular-nums">{formatRanges(restaurantHours[d])}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xs font-bold tracking-[0.16em] text-cream/50 uppercase">Infos</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem] text-cream/80">
              <li>À emporter</li>
              <li>Commande en ligne</li>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-rose">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-cream/12 py-8 text-xs text-cream/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Burger By M</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {restaurant.siteCredit.enabled && (
            <a href={restaurant.siteCredit.url} className="hover:text-cream">
              {restaurant.siteCredit.label}
            </a>
          )}
        </div>
      </div>

      <p aria-hidden className="pointer-events-none -mb-[0.2em] text-center font-display text-[15.5vw] leading-[0.8] tracking-[-0.04em] whitespace-nowrap text-cream/[0.045] uppercase select-none">
        Burger By M
      </p>
    </footer>
  );
}
