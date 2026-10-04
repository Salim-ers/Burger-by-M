/**
 * Mentions légales. Raison sociale, forme et SIRET : communiqués (data/brand.ts).
 * Les éléments ci-dessous restent à confirmer par l'exploitant avant la mise en ligne publique.
 */
export const legal = {
  /** Capital social — à compléter (ex. « au capital de 1 000 € »). */
  capital: null as string | null,
  /** Ville du greffe RCS — à compléter. */
  rcsCity: null as string | null,
  /** N° TVA intracommunautaire — à compléter. */
  vat: null as string | null,
  /** Directeur ou directrice de la publication — à compléter. */
  publicationDirector: null as string | null,
  /** Médiateur de la consommation (art. L612-1 du Code de la consommation) : nom, site — à compléter. */
  mediator: null as { name: string; url: string } | null,
  /** Hébergeur du site (Vercel par défaut). */
  host: "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com",
  /** Base de données (Neon). */
  database: "Neon Inc. (PostgreSQL), hébergement des données dans l’Union européenne (région à confirmer lors de la création du projet).",
  /** Prestataire de paiement. */
  payment: "Mollie B.V., Keizersgracht 126, 1015 CW Amsterdam, Pays-Bas — mollie.com",
  lastUpdate: "4 octobre 2026",
} as const;
