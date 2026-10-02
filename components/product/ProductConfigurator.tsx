"use client";

import { useMemo, useRef, useState } from "react";
import { Flame, Leaf, Phone } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductVisual } from "./ProductVisual";
import { OptionGroupField } from "./OptionGroupField";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import { useMenuCategories } from "@/hooks/use-menu";
import { defaultSelections, missingGroups, selectionsFromOptions, toSelectedOptions, type Selections } from "@/lib/product-options";
import { lineIdFor, unitPriceFor } from "@/lib/order";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { flyToCart } from "@/lib/fly-to-cart";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  editLineId?: string;
  onDone?: () => void;
  /** "modal" : panneau compact ; "page" : route /menu/[slug]. */
  layout?: "modal" | "page";
}

export function ProductConfigurator({ product, editLineId, onDone, layout = "modal" }: Props) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateOptions = useCartStore((s) => s.updateOptions);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const categories = useMenuCategories();
  const editing = editLineId ? items.find((i) => i.lineId === editLineId) : undefined;

  const [selections, setSelections] = useState<Selections>(() =>
    editing ? selectionsFromOptions(product, editing.options) : defaultSelections(product),
  );
  const [quantity, setQuantity] = useState(editing?.quantity ?? 1);
  const [showErrors, setShowErrors] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => toSelectedOptions(product, selections), [product, selections]);
  const unit = unitPriceFor(product, options);
  const total = multiplyCents(unit, quantity);
  const missing = missingGroups(product, selections);
  const category = categories.find((c) => c.id === product.category);
  const orderable = product.available && product.price !== null;

  const submit = () => {
    if (missing.length) {
      setShowErrors(true);
      document.getElementById(`opt-${missing[0]?.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (editing) {
      updateOptions(editing.lineId, options, unit);
      if (quantity !== editing.quantity) updateQuantity(lineIdFor(product.id, options), quantity);
    } else {
      flyToCart(visualRef.current);
      addItem({ productId: product.id, slug: product.slug, name: product.name, unitPrice: unit, quantity, options, image: product.image });
    }
    onDone?.();
  };

  const isPage = layout === "page";

  return (
    <div
      className={cn(
        isPage
          ? "grid gap-10 lg:grid-cols-2 lg:gap-16"
          : "relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:grid md:grid-cols-[1.05fr_1fr] md:overflow-hidden",
      )}
    >
      <div ref={visualRef} className={cn("relative min-w-0", isPage ? "aspect-[4/5] lg:sticky lg:top-28 lg:self-start" : "h-60 shrink-0 sm:h-72 md:h-auto")}>
        <ProductVisual product={product} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0" priority position="center 60%" />
        {!product.available && (
          <span className="absolute top-4 left-4">
            <Badge tone="danger">Indisponible</Badge>
          </span>
        )}
      </div>

      <div className={cn("flex min-w-0 flex-col", !isPage && "md:min-h-0 md:overflow-hidden")}>
        <div className={cn(!isPage && "px-5 pt-6 pb-6 md:flex-1 md:overflow-y-auto md:overscroll-contain md:px-9 md:pt-12")}>
          <p className="text-xs font-semibold tracking-[0.14em] text-rose uppercase">{category?.name}</p>
          <h2 id="product-title" className="mt-3 font-display text-[clamp(2.3rem,6vw,4.6rem)] [overflow-wrap:anywhere] leading-[0.88] tracking-[-0.03em] uppercase">
            {product.name}
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {product.popular && <Badge tone="rose">Best seller</Badge>}
            {product.spicy && (
              <Badge tone="outline-light">
                <Flame className="size-3" aria-hidden /> Épicé
              </Badge>
            )}
            {product.vegetarian && (
              <Badge tone="outline-light">
                <Leaf className="size-3" aria-hidden /> Végétarien
              </Badge>
            )}
          </div>
          {product.description && <p className="mt-6 max-w-prose text-[1.05rem] leading-relaxed text-cream/80">{product.description}</p>}
          {product.homemade && product.homemade.length > 0 && (
            <p className="mt-3 text-sm text-cream/55">Fait maison : {product.homemade.join(", ").toLowerCase()}.</p>
          )}
          {category?.note && <p className="mt-1 text-sm text-cream/55">{category.note}.</p>}

          <div className="mt-4 space-y-1">
            {product.options.map((g) => (
              <div key={g.id} id={`opt-${g.id}`}>
                <OptionGroupField
                  group={g}
                  value={selections[g.id] ?? []}
                  onChange={(next) => setSelections((s) => ({ ...s, [g.id]: next }))}
                  invalid={showErrors && missing.some((m) => m.id === g.id)}
                />
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-cream/45">
            Allergènes : information disponible auprès du restaurant au {restaurant.phone.display}. Photos non contractuelles.
          </p>
        </div>

        <div className={cn("border-t border-cream/10 bg-ink-warm px-5 py-4 md:px-9", isPage ? "mt-8 rounded-sm border md:py-6" : "sticky bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))] md:static")}>
          {orderable ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <Button variant="rose" size="lg" onClick={submit} className="w-full sm:flex-1" data-cursor="Ajouter">
                {editing ? "Mettre à jour" : "Ajouter au panier"} <span aria-hidden>·</span>{" "}
                <span className="tabular-nums">{formatPrice(total)}</span>
              </Button>
            </div>
          ) : product.price === null ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-cream/70">Prix en cours de mise à jour : commande par téléphone.</p>
              <ButtonLink href={restaurant.phone.href} variant="outline-light">
                <Phone className="size-4" aria-hidden /> {restaurant.phone.display}
              </ButtonLink>
            </div>
          ) : (
            <Button variant="outline-light" size="lg" disabled className="w-full">
              Indisponible pour le moment
            </Button>
          )}
          {showErrors && missing.length > 0 && (
            <p role="alert" className="mt-3 text-sm text-[#ff9b94]">
              Choisis d’abord : {missing.map((m) => m.label.toLowerCase()).join(", ")}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
