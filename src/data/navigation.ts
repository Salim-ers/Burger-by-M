/** Navigation principale (barre flottante et menu mobile). */
export const mainNav = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "La carte" },
  { href: "/restaurant", label: "Le restaurant" },
  { href: "/galerie", label: "Galerie" },
] as const;

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
