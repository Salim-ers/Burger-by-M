"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { CartItem } from "@/types/cart";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { ProductVisual } from "@/components/product/ProductVisual";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useProduct } from "@/hooks/use-menu";
import { getProductById } from "@/data/products";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { visibleOptions } from "@/lib/order";
import { cn } from "@/lib/utils";

/** Ligne de panier (couleurs du schéma courant). */
export function CartItemRow({ item, size = "md" }: { item: CartItem; size?: "md" | "lg" }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const openProduct = useUiStore((s) => s.openProduct);
  const product = useProduct(item.productId);
  const editable = (getProductById(item.productId)?.options.length ?? 0) > 0;
  const opts = visibleOptions(item.options);
  const lg = size === "lg";

  return (
    <li className="flex gap-4 py-5">
      {product ? (
        <ProductVisual product={{ ...product, available: true }} sizes="112px" className={cn("shrink-0", lg ? "size-24 md:size-28" : "size-18")} />
      ) : (
        <div className={cn("shrink-0 bg-graphite", lg ? "size-24 md:size-28" : "size-18")} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-display leading-none", lg ? "text-2xl md:text-3xl" : "text-xl")}>{item.name}</h3>
          <p className="shrink-0 font-display text-xl tabular-nums">{formatPrice(multiplyCents(item.unitPrice, item.quantity))}</p>
        </div>
        {opts.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-[0.82rem] text-fg/60">
            {opts.map((o) => (
              <li key={`${o.groupId}-${o.choiceId}`}>
                {o.groupId === "supplements" || o.groupId === "toppings-sup" ? `+ ${o.label}` : o.label}
                {o.priceDelta > 0 && <span className="text-fg/40"> ({formatPrice(o.priceDelta)})</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
          <QuantitySelector size="sm" value={item.quantity} min={1} onChange={(q) => updateQuantity(item.lineId, q)} label={`Quantité de ${item.name}`} />
          {editable && (
            <button type="button" onClick={() => openProduct(item.productId, item.lineId)} className="inline-flex h-10 items-center gap-1.5 px-2.5 text-xs font-semibold tracking-wide text-fg/65 uppercase hover:text-fg">
              <Pencil className="size-3.5" aria-hidden /> Modifier
            </button>
          )}
          <button type="button" onClick={() => removeItem(item.lineId)} className="inline-flex h-10 items-center gap-1.5 px-2.5 text-xs font-semibold tracking-wide text-fg/65 uppercase hover:text-danger" aria-label={`Supprimer ${item.name}`}>
            <Trash2 className="size-3.5" aria-hidden /> Retirer
          </button>
        </div>
      </div>
    </li>
  );
}
