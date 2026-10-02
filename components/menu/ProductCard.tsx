"use client";

import { Flame, Heart, Leaf } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductVisual } from "@/components/product/ProductVisual";
import { AddButton } from "@/components/product/AddButton";
import { Price } from "@/components/ui/Price";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * Produit de la carte : photo + nom + composition + prix + « + ».
 * row (carte) : vignette 4/3 à gauche, infos compactes — lisible même sans photo.
 * tile (accueil) : grande photo 4/3 au-dessus, pour les produits photographiés.
 */
export function ProductCard({ product, priority, variant = "row" }: { product: Product; priority?: boolean; variant?: "row" | "tile" }) {
  const openProduct = useUiStore((s) => s.openProduct);
  const unavailable = !product.available;
  const tile = variant === "tile";

  return (
    <article className="group relative h-full rounded-xl border border-line bg-white transition-[border-color,box-shadow] duration-200 hover:border-stone hover:shadow-soft">
      {/* Toute la card ouvre la fiche ; le contenu laisse passer les clics, sauf le « + ». */}
      <button type="button" onClick={() => openProduct(product.id)} className="absolute inset-0 rounded-xl" aria-label={`Voir ${product.name}`} />
      <div className={cn("pointer-events-none relative flex h-full", tile ? "flex-col" : "gap-3.5 p-3")}>
        <div className={cn("relative shrink-0 overflow-hidden", tile ? "rounded-t-xl" : "w-28 self-start rounded-lg sm:w-36")}>
          <ProductVisual
            product={product}
            sizes={tile ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" : "144px"}
            priority={priority}
            hoverZoom
            className={tile ? "aspect-[4/3]" : "aspect-square sm:aspect-[4/3]"}
          />
          {tile && <Tags product={product} className="absolute top-2 left-2 flex" />}
        </div>

        <div className={cn("flex min-w-0 flex-1 flex-col", tile && "p-4")}>
          <h3 className={cn("leading-snug font-bold", tile ? "text-[1.08rem]" : "text-[1.02rem]", unavailable && "text-ink/45")}>{product.name}</h3>
          {!tile && <Tags product={product} className="mt-1 flex" />}
          {product.description && <p className="mt-1 line-clamp-3 text-[0.88rem] leading-snug text-muted">{product.description}</p>}
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <Price cents={product.price} className="text-[1.02rem] font-bold" />
            <AddButton product={product} className="pointer-events-auto" />
          </div>
        </div>
      </div>
    </article>
  );
}

function Tags({ product, className }: { product: Product; className?: string }) {
  const tags = [
    !product.available && { key: "off", label: "Indisponible", icon: null, cls: "border-ink bg-ink text-white" },
    product.popular && { key: "pop", label: "Best-seller", icon: <Heart className="size-3 fill-rose text-rose" aria-hidden />, cls: "bg-white" },
    product.spicy && { key: "spicy", label: "Épicé", icon: <Flame className="size-3 text-[#c2410c]" aria-hidden />, cls: "bg-white" },
    product.vegetarian && { key: "veg", label: "Végétarien", icon: <Leaf className="size-3 text-open" aria-hidden />, cls: "bg-white" },
  ].filter(Boolean) as { key: string; label: string; icon: React.ReactNode; cls: string }[];
  if (tags.length === 0) return null;
  return (
    <div className={cn("flex-wrap gap-1", className)}>
      {tags.map((t) => (
        <span key={t.key} className={cn("inline-flex h-6 items-center gap-1 rounded-full border border-line px-2 text-[0.7rem] font-semibold", t.cls)}>
          {t.icon}
          {t.label}
        </span>
      ))}
    </div>
  );
}
