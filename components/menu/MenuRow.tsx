"use client";

import { useRef } from "react";
import { Flame, Leaf } from "lucide-react";
import type { Product } from "@/types/product";
import { AddButton } from "@/components/product/AddButton";
import { Price } from "@/components/ui/Price";
import { rectOf, useUiStore, type OriginRect } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  index: number;
  /** editorial : grande ligne de carte ; compact : liste de commande. */
  variant?: "editorial" | "compact";
  active?: boolean;
  onHover?: (product: Product) => void;
  /** Origine de l'animation d'ouverture (ex. panneau photo). Par défaut : la ligne. */
  getOrigin?: (product: Product) => OriginRect | null;
}

/** Ligne de carte imprimée : NOM ……… PRIX, description, « + » discret. Jamais une card. */
export function MenuRow({ product, index, variant = "editorial", active, onHover, getOrigin }: Props) {
  const openProduct = useUiStore((s) => s.openProduct);
  const ref = useRef<HTMLElement>(null);
  const unavailable = !product.available;
  const editorial = variant === "editorial";

  const open = () => openProduct(product.id, undefined, getOrigin?.(product) ?? rectOf(ref.current));

  return (
    <article
      ref={ref}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(product)}
      onFocus={() => onHover?.(product)}
      className="group relative border-b border-fg/15"
      data-active={active || undefined}
    >
      {/* Zone cliquable de toute la ligne (sous le contenu, qui laisse passer les clics sauf sur « + »). */}
      <button
        type="button"
        onClick={open}
        className="absolute inset-0 cursor-pointer focus-visible:outline-offset-[-2px]"
        aria-label={`Voir le détail : ${product.name}`}
        data-cursor="add"
      />
      <div
        className={cn(
          "pointer-events-none relative grid grid-cols-[1fr_auto] items-start gap-x-4 transition-transform duration-300 ease-out-expo md:grid-cols-[2.5rem_1fr_auto_auto] md:gap-x-6",
          "group-hover:translate-x-2 group-data-[active]:md:translate-x-2",
          editorial ? "py-5 md:py-6" : "py-4",
        )}
      >
        <span className="kicker hidden pt-[0.45em] text-fg/35 tabular-nums md:block">{String(index + 1).padStart(2, "0")}</span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className={cn("relative isolate font-display", editorial ? "text-d5" : "text-[1.45rem] leading-none md:text-[1.6rem]", unavailable && "text-fg/40 line-through decoration-2")}>
              <span
                aria-hidden
                className="absolute inset-x-[-0.12em] top-[0.18em] bottom-[0.02em] -z-10 origin-left scale-x-0 bg-cheddar transition-transform duration-300 ease-out-expo group-hover:scale-x-100 group-data-[active]:md:scale-x-100"
              />
              {product.name}
            </h3>
            {product.popular && <span className="kicker bg-ink px-1.5 py-0.5 text-[0.58rem] text-bone">Best-seller</span>}
            {product.spicy && <Flame className="size-4 text-cheddar-deep" aria-label="Épicé" />}
            {product.vegetarian && <Leaf className="size-4 text-success" aria-label="Végétarien" />}
            {unavailable && <span className="kicker text-danger">Indisponible</span>}
          </div>
          {product.description && <p className={cn("mt-1.5 max-w-xl leading-relaxed text-fg/60", editorial ? "text-[0.92rem]" : "text-[0.85rem]")}>{product.description}</p>}
        </div>

        <div className="row-span-2 flex flex-col items-end gap-2 md:contents">
          <span className={cn("font-display tabular-nums md:pt-[0.1em]", editorial ? "text-d5" : "text-[1.45rem] leading-none md:text-[1.6rem]", unavailable && "opacity-40")}>
            <Price cents={product.price} />
          </span>
          <AddButton product={product} sourceRef={ref} className="pointer-events-auto" />
        </div>
      </div>
    </article>
  );
}
