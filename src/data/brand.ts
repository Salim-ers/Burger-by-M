/**
 * Identité et informations légales de Burger By M.
 * Les coordonnées affichées sur le site (adresse, téléphone, horaires) viennent des réglages en base
 * (/admin/settings) ; ces valeurs servent de référence (métadonnées, mentions légales, JSON-LD).
 */
export const brand = {
  name: "Burger By M",
  tagline: "Brut. Généreux. Signé M.",
  description: "Smash burgers, créations généreuses et recettes maison à Rantigny.",
  legal: {
    companyName: "BURGER BY M",
    legalForm: "SAS",
    siret: "937 935 609 00027",
    siren: "937 935 609",
  },
  address: { street: "19 avenue de la Gare", postalCode: "60290", city: "Rantigny", region: "Oise", country: "FR" },
  phone: { display: "03 44 24 89 18", e164: "+33344248918" },
  logo: { src: "/images/logo/burger-by-m.webp", png: "/images/logo/burger-by-m.png", width: 532, height: 532 },
} as const;

export const fullAddress = `${brand.address.street}, ${brand.address.postalCode} ${brand.address.city}`;

export function mapsLinks(address: string) {
  const q = encodeURIComponent(`Burger By M, ${address}, France`);
  return {
    search: `https://www.google.com/maps/search/?api=1&query=${q}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    embed: `https://www.google.com/maps?q=${q}&output=embed`,
  };
}
