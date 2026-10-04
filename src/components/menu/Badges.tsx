import { Flame, Leaf } from "lucide-react";
import type { MenuProduct } from "@/features/menu/types";
import { cn } from "@/lib/utils";

/** Pastilles discrètes : best-seller (cœur rose du logo), épicé, végétarien, épuisé. */
export function ProductBadges({ product, className }: { product: Pick<MenuProduct, "isBestSeller" | "isSpicy" | "isVegetarian" | "isAvailable">; className?: string }) {
  const items: { key: string; label: string; icon?: React.ReactNode; tone?: string }[] = [];
  if (!product.isAvailable) items.push({ key: "off", label: "Épuisé", tone: "bg-ink text-cream border-ink" });
  if (product.isBestSeller) items.push({ key: "best", label: "Best-seller", icon: <span aria-hidden className="size-1.5 rounded-full bg-pink" /> });
  if (product.isSpicy) items.push({ key: "spicy", label: "Épicé", icon: <Flame className="size-3 text-closed" aria-hidden /> });
  if (product.isVegetarian) items.push({ key: "veg", label: "Végétarien", icon: <Leaf className="size-3 text-open" aria-hidden /> });
  if (!items.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((i) => (
        <span key={i.key} className={cn("t-label inline-flex h-6 items-center gap-1.5 border border-ink/15 bg-ivory/90 px-2 text-[0.58rem] tracking-[0.16em] text-ink", i.tone)}>
          {i.icon}
          {i.label}
        </span>
      ))}
    </div>
  );
}
