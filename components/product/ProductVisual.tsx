import Image from "next/image";
import { getImage, imageStyle } from "@/data/images";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

/**
 * Photo réelle du produit, ou affiche typographique si aucune vraie photo ne correspond
 * (on n'utilise jamais la photo d'un autre plat).
 */
export function ProductVisual({ product, sizes, className, priority, quality = 85 }: { product: Product; sizes: string; className?: string; priority?: boolean; quality?: number }) {
  const image = getImage(product.image);
  const unavailable = !product.available;
  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-graphite", className)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={cn("object-cover", unavailable && "opacity-60 grayscale")}
          style={imageStyle(image)}
        />
      </div>
    );
  }
  return <ProductPoster name={product.name} className={cn(unavailable && "opacity-60", className)} />;
}

/** Affiche typographique : le nom du produit devient l'image. */
export function ProductPoster({ name, className, label = "Burger By M" }: { name: string; className?: string; label?: string }) {
  return (
    <div className={cn("@container relative overflow-hidden bg-graphite text-bone", className)} aria-hidden>
      <div className="absolute inset-0 flex flex-col justify-end p-[7cqw]">
        <span className="absolute top-[7cqw] left-[7cqw] font-sans text-[max(0.5rem,3.2cqw)] font-semibold tracking-[0.2em] text-bone/45 uppercase @max-[12rem]:hidden">{label}</span>
        <span className="mb-[5cqw] block h-[1.6cqw] min-h-0.5 w-1/4 bg-cheddar" />
        <span className="font-display text-[clamp(0.75rem,21cqw,11rem)] leading-[0.84] uppercase [overflow-wrap:anywhere]">{name}</span>
      </div>
    </div>
  );
}
