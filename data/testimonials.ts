/**
 * AVIS CLIENTS
 * Aucun avis officiel n'a été fourni : la liste est volontairement vide.
 * N'ajouter ici que de vrais avis, avec l'accord de leur auteur et leur source.
 * Tant que la liste est vide, la section affiche une invitation (aucune note, aucun faux avis).
 */
export interface Testimonial {
  id: string;
  author: string;
  text: string;
  source: "google" | "instagram" | "facebook" | "autre";
  date: string;
  /** Ne publier qu'avec published = true. */
  published: boolean;
}

export const testimonials: Testimonial[] = [
  // Exemple de structure (non publié) :
  // { id: "g-1", author: "Prénom N.", text: "…", source: "google", date: "2026-01-01", published: false },
];
