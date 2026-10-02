import type { CartItem, SelectedOption } from "@/types/cart";
import type { Order, OrderStatus } from "@/types/order";
import type { Product } from "@/types/product";
import { sumCents, multiplyCents } from "./currency";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Nouvelle",
  ACCEPTED: "Acceptée",
  PREPARING: "En préparation",
  READY: "Prête",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

/** Transitions autorisées : garde-fou partagé front / futur backend. */
export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return STATUS_FLOW[from].includes(to);
}

export function formatOrderNumber(n: number) {
  return `BYM-${n}`;
}

export function lineIdFor(productId: string, options: SelectedOption[]) {
  const key = options
    .map((o) => `${o.groupId}:${o.choiceId}`)
    .sort()
    .join("|");
  return `${productId}__${key}`;
}

export function unitPriceFor(product: Product, options: SelectedOption[]) {
  return sumCents([product.price ?? 0, ...options.map((o) => o.priceDelta)]);
}

export function cartSubtotal(items: Pick<CartItem, "unitPrice" | "quantity">[]) {
  return sumCents(items.map((i) => multiplyCents(i.unitPrice, i.quantity)));
}

export function cartCount(items: Pick<CartItem, "quantity">[]) {
  return items.reduce((n, i) => n + i.quantity, 0);
}

export function itemCount(order: Pick<Order, "items">) {
  return order.items.reduce((n, i) => n + i.quantity, 0);
}

/** Options à afficher (on masque les choix neutres comme « Seul »). */
export function visibleOptions(options: SelectedOption[]) {
  return options.filter((o) => !(o.groupId === "formule" && o.choiceId === "seul"));
}
