import Image from "next/image";
import type { MenuImage } from "@/features/menu/types";
import { cn } from "@/lib/utils";

/**
 * Photo produit (vraie photo ou visuel de la carte). Sans photo : visuel neutre (photoPlaceholder),
 * jamais la photo d'un autre plat présentée comme ce produit.
 */
export function ProductImage({ image, name, sizes, className, priority, zoom }: { image: MenuImage | null; name: string; sizes: string; className?: string; priority?: boolean; zoom?: boolean }) {
  if (!image) return <PhotoPlaceholder name={name} className={className} />;
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        preload={priority}
        quality={80}
        className={cn("object-cover transition-transform duration-[1.2s] ease-out-expo", zoom && "group-hover:scale-[1.045]")}
        style={image.position ? { objectPosition: image.position } : undefined}
      />
    </div>
  );
}

export function PhotoPlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn("@container relative overflow-hidden bg-sand", className)} aria-hidden>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqw] p-[6cqw] text-center">
        <span className="h-px w-[18cqw] bg-brass" />
        <span className="font-serif text-[clamp(0.9rem,9cqw,2.6rem)] leading-[1.05] text-ink/80 italic">{name}</span>
        <span className="kicker text-[max(0.5rem,2.6cqw)] text-ink/40">Burger By M</span>
      </div>
    </div>
  );
}
