"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import type { CartItem } from "@/types/cart";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { getImage } from "@/data/images";
import { getProductById } from "@/data/products";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { visibleOptions } from "@/lib/order";
import { BurgerLineArt } from "@/components/ui/LineArt";
import { cn } from "@/lib/utils";

export function CartItemRow({ item, size = "md" }: { item: CartItem; size?: "md" | "lg" }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const openProduct = useUiStore((s) => s.openProduct);
  const image = getImage(item.image);
  const editable = (getProductById(item.productId)?.options.length ?? 0) > 0;
  const opts = visibleOptions(item.options);

  return (
    <li className="flex gap-4 py-5">
      <div className={cn("relative shrink-0 overflow-hidden rounded-xs bg-ink-soft", size === "lg" ? "size-24 md:size-28" : "size-20")}>
        {image ? (
          <Image src={image.src} alt="" fill sizes="112px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <BurgerLineArt className="w-12 text-rose/60" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-display leading-none uppercase", size === "lg" ? "text-2xl md:text-3xl" : "text-xl")}>{item.name}</h3>
          <p className="shrink-0 font-semibold tabular-nums">{formatPrice(multiplyCents(item.unitPrice, item.quantity))}</p>
        </div>
        {opts.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-[0.82rem] text-cream/60">
            {opts.map((o) => (
              <li key={`${o.groupId}-${o.choiceId}`}>
                {o.groupId === "supplements" || o.groupId === "toppings-sup" ? `+ ${o.label}` : o.label}
                {o.priceDelta > 0 && <span className="text-cream/40"> ({formatPrice(o.priceDelta)})</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
          <QuantitySelector size="sm" value={item.quantity} min={1} onChange={(q) => updateQuantity(item.lineId, q)} label={`Quantité de ${item.name}`} />
          {editable && (
            <button type="button" onClick={() => openProduct(item.productId, item.lineId)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-cream/70 hover:bg-cream/10 hover:text-cream">
              <Pencil className="size-3.5" aria-hidden /> Modifier
            </button>
          )}
          <button type="button" onClick={() => removeItem(item.lineId)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-cream/70 hover:bg-cream/10 hover:text-cream" aria-label={`Supprimer ${item.name}`}>
            <Trash2 className="size-3.5" aria-hidden /> Supprimer
          </button>
        </div>
      </div>
    </li>
  );
}
