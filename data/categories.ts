import type { Category } from "@/types/category";

/**
 * Catégories de la carte, dans l'ordre d'affichage.
 * Mentions reprises de la carte imprimée. Chaque section de /menu porte l'ancre « cat-<id> ».
 */
export const categories: Category[] = [
  { id: "smash", name: "Smash", title: "Burgers smash", note: "Servis dans un potatoes bun frais", imageId: "smashSpecial", order: 1, active: true },
  { id: "classics", name: "Classics", title: "Burgers classics", note: "Steak façon bouchère 150 g", imageId: "spicyChicken", order: 2, active: true },
  { id: "frenchys", name: "Frenchy’s", title: "Les Frenchy’s", note: "Servis dans une baguette briochée", imageId: "frenchyHot", order: 3, active: true },
  { id: "frites", name: "Frites", title: "Frites", imageId: "loadedFries", order: 4, active: true },
  { id: "extras", name: "Extras", title: "Extras", note: "Par 3 ou par 6", order: 5, active: true },
  { id: "kids", name: "Menu Kids", title: "Menu Kids", order: 6, active: true },
  { id: "desserts", name: "Desserts", title: "Desserts", order: 7, active: true },
  { id: "milkshakes", name: "Milkshakes", title: "Milkshakes", imageId: "dubaiShake", order: 8, active: true },
  { id: "boissons", name: "Boissons", title: "Boissons", note: "Canettes", order: 9, active: true },
];

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}
