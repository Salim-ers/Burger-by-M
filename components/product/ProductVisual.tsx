import Image from "next/image";
import { getImage, imageStyle } from "@/data/images";
import { restaurant } from "@/data/restaurant";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

/**
 * Vraie photo du produit, ou visuel neutre (photoPlaceholder) si aucune vraie photo n'existe :
 * on n'affiche jamais la photo d'un autre plat comme si c'était celui-ci.
 */
export function ProductVisual({ product, sizes, className, priority, hoverZoom }: { product: Product; sizes: string; className?: string; priority?: boolean; hoverZoom?: boolean }) {
  const image = getImage(product.image);
  if (!image) return <PhotoPlaceholder className={className} />;
  return (
    <div className={cn("relative overflow-hidden bg-stone/40", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={80}
        className={cn("object-cover transition-transform duration-500 ease-out-expo", hoverZoom && "group-hover:scale-[1.04]", !product.available && "opacity-60 grayscale")}
        style={imageStyle(image)}
      />
    </div>
  );
}

/** Visuel neutre aux couleurs de la marque : le logo sur fond crème. */
export function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-[#ece6da]", className)} aria-hidden>
      <Image src={restaurant.logo.src} alt="" width={64} height={64} sizes="64px" className="size-[clamp(2rem,28%,4rem)] rounded-full opacity-90" />
    </div>
  );
}
