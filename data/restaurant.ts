/**
 * SOURCE UNIQUE des informations de l'établissement.
 * Toute modification (adresse, téléphone, réseaux, réglages de commande…) se fait ICI.
 * Les valeurs `null` sont des TODO : non confirmées, donc jamais affichées.
 */
export const restaurant = {
  name: "Burger By M",
  legalName: null as string | null, // TODO: raison sociale (non communiquée)
  logo: {
    src: "/images/logo/burger-by-m.webp",
    png: "/images/logo/burger-by-m.png",
    width: 532,
    height: 532,
    alt: "Logo Burger By M",
  },
  address: {
    street: "19 Avenue de la Gare",
    postalCode: "60290",
    city: "Rantigny",
    region: "Oise",
    country: "FR",
    countryName: "France",
  },
  phone: {
    display: "03 44 24 89 18",
    e164: "+33344248918",
    href: "tel:0344248918",
  },
  email: null as string | null, // TODO: email de contact (non communiqué)
  /** TODO: coordonnées GPS exactes à confirmer avant de les ajouter au JSON-LD. */
  geo: null as { lat: number; lng: number } | null,
  socials: {
    // Comptes mentionnés sur la carte imprimée. Les URLs exactes ne sont pas confirmées :
    // tant que `url` vaut null, aucun lien n'est affiché sur le site.
    instagram: { handle: "Burgerbym", url: null as string | null },
    facebook: { handle: "Burger By M", url: null as string | null },
  },
  /** URL de dépôt d'avis Google (TODO). */
  googleReviewUrl: null as string | null,
  services: {
    takeaway: true,
    // La carte imprimée mentionne une livraison (« soir uniquement ») : non proposée en ligne pour le moment.
    onlineDelivery: false,
  },
  /** Crédit agence en pied de page (optionnel). */
  siteCredit: { enabled: false, label: "", url: "" },
} as const;

/** Réglages par défaut du Click & Collect (surchargés localement depuis /admin en mode démo). */
export const orderingDefaults = {
  /** Temps de préparation moyen ; la carte affiche une fourchette ± prepSpreadMinutes (20 → « 15–25 min »). */
  prepMinutes: 20,
  prepSpreadMinutes: 5,
  /** false : quand le restaurant est fermé, on peut consulter la carte et préparer son panier, mais pas commander. */
  allowOrdersWhenClosed: false,
  rushPrepMinutes: 40,
  slotIntervalMinutes: 15,
  maxOrdersPerSlot: 8,
  /** Nombre de créneaux proposés au client. */
  slotsShown: 12,
  /** Supplément « formule menu » indiqué sur la carte (MENU +2€). */
  menuFormulaPrice: 200,
} as const;

export const fullAddress = `${restaurant.address.street}, ${restaurant.address.postalCode} ${restaurant.address.city}`;

const mapsQuery = encodeURIComponent(`Burger By M, ${fullAddress}, France`);
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
