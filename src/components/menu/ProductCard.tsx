"use client";

import { Plus } from "lucide-react";
import { useUi } from "@/features/cart/store";
import { compositionText, isOrderable, type MenuProduct } from "@/features/menu/types";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "./ProductImage";
import { ProductBadges } from "./Badges";
import { cn } from "@/lib/utils";

/** Carte produit avec photo : un toucher ouvre la fiche (personnalisation + ajout). */
export function ProductCard({ product, priority }: { product: MenuProduct; priority?: boolean }) {
  const open = useUi((s) => s.openProduct);
  const orderable = isOrderable(product);
  return (
    <article className={cn("group relative flex flex-col", !product.isAvailable && "opacity-60")}>
      <div className="relative">
        <ProductImage image={product.image} name={product.name} sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" priority={priority} zoom className="aspect-[3/2] w-full" />
        <ProductBadges product={product} className="absolute top-3 left-3" />
        {product.image && product.needsFinalProductPhoto && <span className="absolute right-3 bottom-3 bg-paper/85 px-2 py-1 text-[0.6rem] font-semibold tracking-[0.12em] text-ink/70 uppercase backdrop-blur">Photo d’illustration</span>}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-[1.65rem] leading-[1.05] md:text-[1.9rem]">{product.name}</h3>
          <p className="shrink-0 font-serif text-xl md:text-2xl">
            <Price cents={product.priceCents} />
          </p>
        </div>
        <p className="mt-2.5 line-clamp-3 text-[0.92rem] leading-relaxed text-sub">{compositionText(product)}</p>
        {product.allergens && <p className="mt-2 text-xs text-sub">Allergènes : {product.allergens}</p>}
        <div className="mt-auto pt-5">
          <span aria-hidden className={cn("inline-flex h-11 items-center gap-2 border px-4 text-[0.68rem] font-bold tracking-[0.2em] uppercase transition-colors duration-300", orderable ? "border-ink bg-ink text-ivory group-hover:bg-ink-soft" : "border-rule text-sub")}>
            {orderable ? (
              <>
                <Plus className="size-4" strokeWidth={2} /> Ajouter
              </>
            ) : product.isAvailable ? (
              "Voir le produit"
            ) : (
              "Épuisé"
            )}
          </span>
        </div>
      </div>
      <button type="button" onClick={() => open(product.id)} className="absolute inset-0 z-10" aria-label={`${product.name}${orderable ? " — personnaliser et ajouter" : ""}`} />
    </article>
  );
}

/** Ligne compacte (produits sans photo : boissons, extras…). */
export function ProductRow({ product }: { product: MenuProduct }) {
  const open = useUi((s) => s.openProduct);
  const orderable = isOrderable(product);
  const text = compositionText(product);
  return (
    <li className={cn("group relative flex items-center gap-5 border-b border-rule py-5", !product.isAvailable && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="font-serif text-[1.35rem] leading-tight md:text-[1.5rem]">{product.name}</h3>
          <ProductBadges product={product} />
        </div>
        {text && <p className="mt-1.5 line-clamp-2 text-[0.9rem] leading-relaxed text-sub">{text}</p>}
        {product.allergens && <p className="mt-1 text-xs text-sub">Allergènes : {product.allergens}</p>}
      </div>
      <p className="shrink-0 font-serif text-xl">
        <Price cents={product.priceCents} />
      </p>
      <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-300", orderable ? "border-ink bg-ink text-ivory group-hover:bg-ink-soft" : "border-rule text-sub")}>
        <Plus className="size-4" strokeWidth={2} />
      </span>
      <button type="button" onClick={() => open(product.id)} className="absolute inset-0 z-10" aria-label={`${product.name}${orderable ? " — personnaliser et ajouter" : ""}`} />
    </li>
  );
}
