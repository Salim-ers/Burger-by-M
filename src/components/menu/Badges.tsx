import { Flame, Leaf } from "lucide-react";
import type { MenuProduct } from "@/features/menu/types";
import { cn } from "@/lib/utils";

/** Pastilles discrètes : best-seller (cœur rose du logo), épicé, végétarien, épuisé. */
export function ProductBadges({ product, className }: { product: Pick<MenuProduct, "isBestSeller" | "isSpicy" | "isVegetarian" | "isAvailable">; className?: string }) {
  const items: { key: string; label: string; icon?: React.ReactNode; tone?: string }[] = [];
  if (!product.isAvailable) items.push({ key: "off", label: "Épuisé", tone: "bg-ink text-ivory border-ink" });
  if (product.isBestSeller) items.push({ key: "best", label: "Best-seller", icon: <span aria-hidden className="size-1.5 rounded-full bg-rose" /> });
  if (product.isSpicy) items.push({ key: "spicy", label: "Épicé", icon: <Flame className="size-3 text-[#b4482a]" aria-hidden /> });
  if (product.isVegetarian) items.push({ key: "veg", label: "Végétarien", icon: <Leaf className="size-3 text-open" aria-hidden /> });
  if (!items.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((i) => (
        <span key={i.key} className={cn("inline-flex h-6 items-center gap-1.5 rounded-xs border border-ink/15 bg-paper/90 px-2 text-[0.62rem] font-bold tracking-[0.14em] text-ink uppercase", i.tone)}>
          {i.icon}
          {i.label}
        </span>
      ))}
    </div>
  );
}
