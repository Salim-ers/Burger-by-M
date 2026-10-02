/**
 * DONNÉES DE DÉMONSTRATION — commandes fictives.
 * Les clients sont inventés (nom « Démo », téléphones 06 00 00 00 0X) : aucune donnée personnelle réelle.
 */
import type { Order, OrderStatus } from "@/types/order";
import { buildItem, compactItems } from "@/lib/order-builder";
import { cartSubtotal, formatOrderNumber } from "@/lib/order";

interface Seed {
  n: number;
  first: string;
  status: OrderStatus;
  createdAgo: number;
  pickupIn: number;
  items: Parameters<typeof buildItem>[];
  notes?: string;
  announced?: number;
}

const seeds: Seed[] = [
  { n: 1042, first: "Salim", status: "PENDING", createdAgo: 2, pickupIn: 25,
    items: [["le-special", 1, { formule: ["menu"], retirer: ["sans-cornichons"], supplements: ["cheddar"] }], ["dubai-shake", 1]],
    notes: "Sauce à part, svp." },
  { n: 1041, first: "Inès", status: "PENDING", createdAgo: 4, pickupIn: 30,
    items: [["spicy-chicken", 2, { formule: ["seul"] }], ["canette", 2, { boisson: ["coca-zero"] }]] },
  { n: 1040, first: "Karim", status: "ACCEPTED", createdAgo: 9, pickupIn: 18, announced: 20,
    items: [["smash-tower", 1, { formule: ["menu"] }], ["extra-mozza-sticks", 1, { quantite: ["x6"] }]] },
  { n: 1039, first: "Léa", status: "PREPARING", createdAgo: 14, pickupIn: 8, announced: 20,
    items: [["le-hot", 1, { formule: ["seul"] }], ["tiramisu", 1, { parfum: ["pistache-framboise"] }]] },
  { n: 1038, first: "Yanis", status: "PREPARING", createdAgo: 17, pickupIn: 5, announced: 20,
    items: [["le-montagnard", 2, { formule: ["menu"] }], ["menu-kids", 1, { plat: ["nuggets"] }]] },
  { n: 1037, first: "Camille", status: "READY", createdAgo: 26, pickupIn: -2, announced: 20,
    items: [["vegg", 1, { formule: ["seul"], retirer: ["sans-oignons-rouges"] }], ["milkshake-a-composer", 1, { topping: ["oreo"], coulis: ["caramel"] }]] },
  { n: 1036, first: "Mehdi", status: "COMPLETED", createdAgo: 55, pickupIn: -30, announced: 25,
    items: [["barbecu", 1, { formule: ["menu"] }], ["bueno-bomb", 1]] },
  { n: 1035, first: "Sarah", status: "CANCELLED", createdAgo: 70, pickupIn: -40,
    items: [["le-chevre-miel", 1, { formule: ["seul"] }]] },
];

export function buildDemoOrders(now = Date.now()): Order[] {
  return seeds.map((s, idx) => {
    const items = compactItems(s.items.map((args) => buildItem(...args)));
    const subtotal = cartSubtotal(items);
    const created = new Date(now - s.createdAgo * 60_000).toISOString();
    const pickupDate = new Date(now + s.pickupIn * 60_000);
    pickupDate.setSeconds(0, 0);
    return {
      id: `demo_${s.n}`,
      number: formatOrderNumber(s.n),
      status: s.status,
      createdAt: created,
      updatedAt: created,
      pickup: { mode: idx % 3 === 0 ? "asap" : "scheduled", time: pickupDate.toISOString() },
      customer: {
        firstName: s.first,
        lastName: "Démo",
        phone: `06 00 00 00 ${String(idx + 1).padStart(2, "0")}`,
        email: `${s.first.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@exemple.test`,
        marketingOptIn: false,
      },
      items,
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod: "cash_on_pickup",
      paymentStatus: s.status === "COMPLETED" ? "paid" : "unpaid",
      notes: s.notes,
      announcedMinutes: s.announced,
      isDemo: true,
    } satisfies Order;
  });
}

/** Prénoms fictifs pour le bouton « Simuler une nouvelle commande ». */
export const DEMO_FIRST_NAMES = ["Nora", "Adam", "Jade", "Rayan", "Chloé", "Ilyes", "Manon", "Sofiane", "Lina", "Théo"];

/** Paniers types utilisés par la simulation. */
export const DEMO_BASKETS: Parameters<typeof buildItem>[][] = [
  [["le-special", 1, { formule: ["menu"] }], ["canette", 1, { boisson: ["coca"] }]],
  [["smash-double", 2, { formule: ["menu"] }], ["dubai-shake", 1]],
  [["jalathai", 1, { formule: ["seul"], supplements: ["bacon"] }], ["extra-nugget-s", 1, { quantite: ["x3"] }]],
  [["smashy", 1, { formule: ["menu"] }], ["bueno-bomb", 2]],
  [["roquefort", 1, { formule: ["seul"] }], ["bacon-crispy", 1, { formule: ["menu"], retirer: ["sans-cornichons"] }]],
];
