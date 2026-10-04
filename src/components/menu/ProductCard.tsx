"use client";

import { useUi } from "@/features/cart/store";
import { compositionText, isOrderable, type MenuProduct } from "@/features/menu/types";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "./ProductImage";
import { ProductBadges } from "./Badges";
import { cn } from "@/lib/utils";

/**
 * Produit avec photo : grande photo 16:9, nom, composition, prix toujours visible, bouton +.
 * Survol : la photo avance (1,03), le fond se réchauffe, les ingrédients se révèlent, le + s'affirme.
 */
export function ProductCard({ product, priority }: { product: MenuProduct; priority?: boolean }) {
  const open = useUi((s) => s.openProduct);
  const orderable = isOrderable(product);
  return (
    <article className={cn("group relative flex flex-col transition-colors duration-500 ease-[var(--ease-food)] hover:bg-panel", !product.isAvailable && "opacity-60")}>
      <div className="relative">
        <ProductImage image={product.image} name={product.name} sizes="(min-width: 1024px) 46vw, 100vw" priority={priority} zoom className="aspect-[16/9] w-full" />
        <ProductBadges product={product} className="absolute top-3 left-3" />
        {product.image && product.needsFinalProductPhoto && <span className="t-label absolute right-3 bottom-3 bg-ivory/90 px-2 py-1 text-[0.58rem] text-ink/70">Photo d’illustration</span>}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-5 pb-6 md:px-5">
        <div className="flex items-start justify-between gap-6">
          <h3 className="t-m transition-transform duration-500 ease-[var(--ease-food)] group-hover:translate-x-1">{product.name}</h3>
          <p className="t-s shrink-0 pt-1 text-cheddar-deep">
            <Price cents={product.priceCents} />
          </p>
        </div>
        <p className="mt-3 line-clamp-2 max-w-xl text-[0.95rem] leading-relaxed text-sub transition-[color] duration-500 group-hover:line-clamp-none group-hover:text-fg/80">{compositionText(product)}</p>
        {product.allergens && <p className="mt-2 text-xs text-sub">Allergènes : {product.allergens}</p>}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="t-label text-sub">{!product.isAvailable ? "Épuisé pour le moment" : product.priceCents === null ? "Prix au restaurant" : "Personnalisable"}</span>
          <span
            aria-hidden
            className={cn(
              "grid size-12 place-items-center text-2xl leading-none transition-[background-color,color,transform] duration-500 ease-[var(--ease-food)]",
              orderable ? "bg-ink text-cream group-hover:bg-cheddar group-hover:text-ink" : "border border-rule text-sub",
            )}
          >
            +
          </span>
        </div>
      </div>
      <button type="button" data-cursor={orderable ? "add" : "view"} onClick={() => open(product.id)} className="absolute inset-0 z-10" aria-label={`${product.name}${orderable ? " — personnaliser et ajouter" : ""}`} />
    </article>
  );
}

/** Produit sans photo (boissons, extras…) : ligne typographique, jamais une fausse photo. */
export function ProductRow({ product }: { product: MenuProduct }) {
  const open = useUi((s) => s.openProduct);
  const orderable = isOrderable(product);
  const text = compositionText(product);
  return (
    <li className={cn("group relative flex items-center gap-5 border-b border-rule py-5 transition-colors duration-500 hover:bg-panel md:px-4", !product.isAvailable && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="t-s">{product.name}</h3>
          <ProductBadges product={product} />
        </div>
        {text && <p className="mt-1.5 line-clamp-2 text-[0.9rem] leading-relaxed text-sub">{text}</p>}
        {product.allergens && <p className="mt-1 text-xs text-sub">Allergènes : {product.allergens}</p>}
      </div>
      <p className="t-s shrink-0 text-cheddar-deep">
        <Price cents={product.priceCents} />
      </p>
      <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center text-xl transition-colors duration-500", orderable ? "bg-ink text-cream group-hover:bg-cheddar group-hover:text-ink" : "border border-rule text-sub")}>
        +
      </span>
      <button type="button" data-cursor={orderable ? "add" : "view"} onClick={() => open(product.id)} className="absolute inset-0 z-10" aria-label={`${product.name}${orderable ? " — personnaliser et ajouter" : ""}`} />
    </li>
  );
}
