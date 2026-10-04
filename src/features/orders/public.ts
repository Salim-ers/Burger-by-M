import type { OrderView } from "./service";

/** Vue client d'une commande : rien d'interne (identifiants, notes cuisine, téléphone complet). */
export interface PublicOrder {
  orderNumber: string;
  firstName: string;
  requestedTime: string;
  isAsap: boolean;
  totalCents: number;
  paymentMethod: "card" | "on_site";
  paymentStatus: OrderView["paymentStatus"];
  orderStatus: OrderView["orderStatus"];
  createdAt: string;
  items: { name: string; quantity: number; lineTotalCents: number; details: string[] }[];
}

export function toPublicOrder(o: OrderView): PublicOrder {
  return {
    orderNumber: o.orderNumber,
    firstName: o.customerFirstName,
    requestedTime: o.requestedTime,
    isAsap: o.isAsap,
    totalCents: o.totalCents,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      lineTotalCents: i.lineTotalCents,
      details: [...i.modifiers.filter((m) => m.name !== "Seul").map((m) => (m.priceDeltaCents > 0 ? `+ ${m.name}` : m.name)), ...i.removedIngredients.map((r) => `Sans ${r.toLowerCase()}`), ...(i.note ? [`« ${i.note} »`] : [])],
    })),
  };
}
