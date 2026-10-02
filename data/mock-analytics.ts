/**
 * DONNÉES DE DÉMONSTRATION — statistiques fictives pour illustrer le tableau de bord.
 * Elles ne reflètent PAS l'activité réelle du restaurant.
 */
export const DEMO_ANALYTICS = {
  isDemo: true,
  week: [
    { day: "Lun", orders: 0, revenue: 0 },
    { day: "Mar", orders: 18, revenue: 26450 },
    { day: "Mer", orders: 31, revenue: 44120 },
    { day: "Jeu", orders: 27, revenue: 38700 },
    { day: "Ven", orders: 46, revenue: 68910 },
    { day: "Sam", orders: 52, revenue: 77830 },
    { day: "Dim", orders: 38, revenue: 54260 },
  ],
  topProducts: [
    { name: "Le Spécial", qty: 64 },
    { name: "Smash Double", qty: 51 },
    { name: "Spicy Chicken", qty: 43 },
    { name: "Le Montagnard", qty: 38 },
    { name: "Dubai Shake", qty: 29 },
  ],
  categories: [
    { name: "Smash", value: 38 },
    { name: "Classics", value: 27 },
    { name: "Frenchy’s", value: 14 },
    { name: "Sides", value: 11 },
    { name: "Desserts & shakes", value: 10 },
  ],
} as const;
