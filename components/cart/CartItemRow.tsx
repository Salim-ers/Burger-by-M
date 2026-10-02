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

/** Ligne de panier : photo, nom, options, quantité, prix, modifier / supprimer. */
export function CartItemRow({ item, compact }: { item: CartItem; compact?: boolean }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const openProduct = useUiStore((s) => s.openProduct);
  const product = useProduct(item.productId);
  const editable = (getProductById(item.productId)?.options.length ?? 0) > 0;
  const opts = visibleOptions(item.options);

  return (
    <li className={cn("flex gap-3", compact ? "py-4" : "py-5 md:gap-4")}>
      {product ? (
        <ProductVisual product={{ ...product, available: true }} sizes="96px" className={cn("shrink-0 rounded-lg", compact ? "size-14" : "size-20 md:size-24")} />
      ) : (
        <div className={cn("shrink-0 rounded-lg bg-stone/50", compact ? "size-14" : "size-20 md:size-24")} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("leading-snug font-bold", compact ? "text-[0.95rem]" : "text-base md:text-lg")}>{item.name}</h3>
          <p className="shrink-0 font-bold tabular-nums">{formatPrice(multiplyCents(item.unitPrice, item.quantity))}</p>
        </div>
        {opts.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-[0.85rem] text-muted">
            {opts.map((o) => (
              <li key={`${o.groupId}-${o.choiceId}`}>
                {o.groupId === "supplements" || o.groupId === "toppings-sup" ? `+ ${o.label}` : o.label}
                {o.priceDelta > 0 && <span> ({formatPrice(o.priceDelta)})</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
          <QuantitySelector size="sm" value={item.quantity} min={1} onChange={(q) => updateQuantity(item.lineId, q)} label={`Quantité de ${item.name}`} />
          {editable && (
            <button type="button" onClick={() => openProduct(item.productId, item.lineId)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:bg-ink/5 hover:text-ink">
              <Pencil className="size-3.5" aria-hidden /> Modifier
            </button>
          )}
          <button type="button" onClick={() => removeItem(item.lineId)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:bg-danger/10 hover:text-danger" aria-label={`Supprimer ${item.name}`}>
            <Trash2 className="size-3.5" aria-hidden /> Supprimer
          </button>
        </div>
      </div>
    </li>
  );
}
