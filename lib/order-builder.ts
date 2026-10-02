import type { OrderItem } from "@/types/order";
import type { SelectedOption } from "@/types/cart";
import { getProductById } from "@/data/products";
import { unitPriceFor } from "./order";

/** Construit une ligne de commande cohérente avec la carte (prix calculés depuis data/products.ts). */
export function buildItem(productId: string, quantity: number, picks: Record<string, string[]> = {}): OrderItem | null {
  const product = getProductById(productId);
  if (!product || product.price === null) return null;
  const options: SelectedOption[] = [];
  for (const group of product.options) {
    const chosen = picks[group.id] ?? (group.required ? [group.choices[0]?.id ?? ""] : []);
    for (const id of chosen) {
      const choice = group.choices.find((c) => c.id === id);
      if (choice) options.push({ groupId: group.id, groupLabel: group.label, choiceId: choice.id, label: choice.label, priceDelta: choice.priceDelta });
    }
  }
  return { productId, name: product.name, quantity, unitPrice: unitPriceFor(product, options), options };
}

export function compactItems(items: (OrderItem | null)[]): OrderItem[] {
  return items.filter((i): i is OrderItem => i !== null);
}
