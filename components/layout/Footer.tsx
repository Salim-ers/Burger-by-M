import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { legalNav } from "@/data/navigation";
import { directionsUrl, restaurant } from "@/data/restaurant";
import { DAY_NAMES, DAY_ORDER, restaurantHours } from "@/data/opening-hours";
import { formatRanges } from "@/lib/hours";

export function Footer() {
  const socials = [
    { label: "Instagram", url: restaurant.socials.instagram.url },
    { label: "Facebook", url: restaurant.socials.facebook.url },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer className="scheme-dark relative overflow-hidden border-t border-graphite bg-coal pt-16 md:pt-24">
      <div className="shell">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-4">
            <Logo size={72} />
            <p className="mt-8 font-display text-d4 text-bone">
              No forks.
              <br />
              <span className="text-cheddar">No bullshit.</span>
            </p>
          </div>

          <nav aria-label="Pied de page" className="col-span-6 md:col-span-2 md:col-start-6">
            <h2 className="kicker text-bone/45">Site</h2>
            <ul className="mt-5 space-y-2">
              {[
                { href: "/menu", label: "La carte" },
                { href: "/commander", label: "Commander" },
                { href: "/restaurant", label: "Le restaurant" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-display text-xl leading-tight text-bone/85 transition-colors hover:text-cheddar">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 md:col-span-2">
            <h2 className="kicker text-bone/45">Restaurant</h2>
            <address className="mt-5 space-y-2 text-[0.95rem] leading-relaxed text-bone/80 not-italic">
              <p>
                {restaurant.address.street}
                <br />
                {restaurant.address.postalCode} {restaurant.address.city}
              </p>
              <p>
                <a href={restaurant.phone.href} className="hover:text-cheddar">
                  {restaurant.phone.display}
                </a>
              </p>
              <p>
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-bone/30 underline-offset-4 hover:text-cheddar">
                  Itinéraire
                </a>
              </p>
              <p className="text-bone/55">À emporter · Commande en ligne</p>
              {socials.map((s) => (
                <p key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-cheddar">
                    {s.label}
                  </a>
                </p>
              ))}
            </address>
          </div>

          <div className="col-span-12 md:col-span-3">
            <h2 className="kicker text-bone/45">Horaires</h2>
            <dl className="mt-5 divide-y divide-graphite border-y border-graphite text-[0.88rem]">
              {DAY_ORDER.map((d) => (
                <div key={d} className="flex justify-between gap-4 py-2">
                  <dt className="text-bone/55">{DAY_NAMES[d]}</dt>
                  <dd className="text-right text-bone/85 tabular-nums">{formatRanges(restaurantHours[d])}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-graphite py-6 text-xs text-bone/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Burger By M — Rantigny</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-bone">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {restaurant.siteCredit.enabled && (
            <a href={restaurant.siteCredit.url} className="hover:text-bone">
              {restaurant.siteCredit.label}
            </a>
          )}
        </div>
      </div>

      <p aria-hidden className="pointer-events-none -mb-[0.12em] text-center font-display text-[18.5vw] leading-[0.8] whitespace-nowrap text-graphite uppercase select-none">
        Burger By M
      </p>
    </footer>
  );
}
