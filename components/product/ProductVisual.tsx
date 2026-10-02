import Image from "next/image";
import { getImage } from "@/data/images";
import type { Product } from "@/types/product";
import { BurgerLineArt } from "@/components/ui/LineArt";
import { cn } from "@/lib/utils";

/**
 * Photo réelle du produit, ou composition typographique si aucune vraie photo ne correspond
 * (on n'utilise jamais la photo d'un autre plat).
 */
export function ProductVisual({ product, sizes, className, priority, position }: { product: Product; sizes: string; className?: string; priority?: boolean; position?: string }) {
  const image = getImage(product.image);
  const unavailable = !product.available;
  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-ink-soft", className)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover transition-[transform,filter] duration-700 ease-out-expo", unavailable && "grayscale-[0.85] opacity-70")}
          style={position ? { objectPosition: position } : undefined}
        />
      </div>
    );
  }
  return (
    <div className={cn("relative flex flex-col items-center justify-center overflow-hidden bg-ink-soft p-4 text-center", unavailable && "opacity-60", className)} aria-hidden>
      <BurgerLineArt className="w-[38%] max-w-24 text-rose/70" />
      <span className="mt-3 font-display text-[clamp(0.85rem,2.2vw,1.35rem)] leading-none text-cream/80 italic">{product.name}</span>
    </div>
  );
}
