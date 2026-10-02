import type { Category, MenuGroup } from "@/types/category";

export const menuGroups: MenuGroup[] = [
  { id: "smash", label: "Smash" },
  { id: "classics", label: "Classics" },
  { id: "frenchys", label: "Frenchy’s" },
  { id: "sides", label: "Sides" },
  { id: "boissons", label: "Boissons" },
  { id: "desserts", label: "Desserts" },
];

/** Catégories de la carte (mentions reprises de la carte imprimée). */
export const categories: Category[] = [
  { id: "smash", group: "smash", name: "Burger Smash", title: "Smash.", note: "Servi dans un potatoes bun frais", imageId: "smashSpecial", order: 1, active: true },
  { id: "classics", group: "classics", name: "Burger Classic", title: "Classics.", note: "Steak façon bouchère 150 g", imageId: "spicyChicken", order: 2, active: true },
  { id: "frenchys", group: "frenchys", name: "Les Frenchy’s", title: "Frenchy’s.", note: "Servi dans une baguette briochée", imageId: "frenchyHot", order: 3, active: true },
  { id: "frites", group: "sides", name: "Frites", title: "Frites.", imageId: "loadedFries", order: 4, active: true },
  { id: "extras", group: "sides", name: "Extras", title: "Extras.", note: "Par 3 ou par 6", order: 5, active: true },
  { id: "kids", group: "sides", name: "Menu Kids", title: "Kids.", order: 6, active: true },
  { id: "boissons", group: "boissons", name: "Boissons", title: "Boissons.", note: "Canettes", order: 7, active: true },
  { id: "milkshakes", group: "desserts", name: "Milkshakes", title: "Shakes.", imageId: "dubaiShake", order: 8, active: true },
  { id: "desserts", group: "desserts", name: "Desserts", title: "Desserts.", order: 9, active: true },
];

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}
