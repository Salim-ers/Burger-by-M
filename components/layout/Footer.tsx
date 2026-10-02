import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { legalNav, mainNav } from "@/data/navigation";
import { directionsUrl, restaurant } from "@/data/restaurant";
import { DAY_NAMES, DAY_ORDER, restaurantHours } from "@/data/opening-hours";
import { formatRangesShort } from "@/lib/hours";

export function Footer() {
  const socials = [
    { label: "Instagram", url: restaurant.socials.instagram.url },
    { label: "Facebook", url: restaurant.socials.facebook.url },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer className="scheme-dark bg-ink pt-14 pb-28 text-cream md:pt-16 md:pb-10">
      <div className="shell grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo size={64} />
          <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-cream/70">Smash burgers, Frenchy’s et recettes gourmandes à Rantigny. À emporter, commande en ligne.</p>
        </div>

        <nav aria-label="Pied de page" className="md:col-span-2">
          <h2 className="kicker text-cream/50">Navigation</h2>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream/85 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="kicker text-cream/50">Restaurant</h2>
          <address className="mt-4 space-y-2.5 text-cream/85 not-italic">
            <p>
              {restaurant.address.street}
              <br />
              {restaurant.address.postalCode} {restaurant.address.city}
            </p>
            <p>
              <a href={restaurant.phone.href} className="font-semibold hover:text-white">
                {restaurant.phone.display}
              </a>
            </p>
            <p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                Itinéraire
              </a>
            </p>
            {socials.map((s) => (
              <p key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {s.label}
                </a>
              </p>
            ))}
          </address>
        </div>

        <div className="md:col-span-3">
          <h2 className="kicker text-cream/50">Horaires</h2>
          <dl className="mt-4 space-y-1.5 text-[0.9rem]">
            {DAY_ORDER.map((d) => (
              <div key={d} className="flex justify-between gap-4">
                <dt className="text-cream/60">{DAY_NAMES[d]}</dt>
                <dd className="text-right text-cream/90 tabular-nums">{formatRangesShort(restaurantHours[d])}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="shell mt-12 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Burger By M · Rantigny</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
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
    </footer>
  );
}
