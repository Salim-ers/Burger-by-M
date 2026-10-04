/** Navigation principale (header) : la carte, les signatures, le restaurant. */
export const mainNav = [
  { href: "/menu", label: "La carte" },
  { href: "/#signatures", label: "Nos signatures" },
  { href: "/restaurant", label: "Le restaurant" },
] as const;

/** Pages secondaires (menu mobile, pied de page). */
export const secondaryNav = [{ href: "/galerie", label: "Galerie" }] as const;

export const legalNav = [
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/cookies", label: "Cookies" },
] as const;

/** Libellé du volet de transition entre pages. */
export function transitionLabel(pathname: string): string | null {
  if (pathname === "/") return "Burger by M.";
  if (pathname.startsWith("/menu")) return "La carte.";
  if (pathname.startsWith("/restaurant")) return "Le restaurant.";
  if (pathname.startsWith("/galerie")) return "Galerie.";
  if (pathname.startsWith("/checkout")) return "Votre commande.";
  return null;
}
