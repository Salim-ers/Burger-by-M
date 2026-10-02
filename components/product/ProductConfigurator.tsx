"use client";

import { useMemo, useState } from "react";
import { Flame, Leaf, Phone } from "lucide-react";
import type { Product } from "@/types/product";
import { OptionGroupField } from "./OptionGroupField";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Arrow, Button, ButtonLink } from "@/components/ui/Button";
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
  /** "sheet" : colonne droite de la fiche plein écran ; "page" : route /menu/[slug]. */
  layout?: "sheet" | "page";
  /** Élément photo, source de l'animation vers le panier. */
  sourceRef?: React.RefObject<HTMLElement | null>;
}

/** Infos, options, quantité et CTA d'ajout. Le visuel est géré par le parent. */
export function ProductConfigurator({ product, editLineId, onDone, layout = "sheet", sourceRef }: Props) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateOptions = useCartStore((s) => s.updateOptions);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const categories = useMenuCategories();
  const editing = editLineId ? items.find((i) => i.lineId === editLineId) : undefined;

  const [selections, setSelections] = useState<Selections>(() => (editing ? selectionsFromOptions(product, editing.options) : defaultSelections(product)));
  const [quantity, setQuantity] = useState(editing?.quantity ?? 1);
  const [showErrors, setShowErrors] = useState(false);

  const options = useMemo(() => toSelectedOptions(product, selections), [product, selections]);
  const unit = unitPriceFor(product, options);
  const total = multiplyCents(unit, quantity);
  const missing = missingGroups(product, selections);
  const category = categories.find((c) => c.id === product.category);
  const orderable = product.available && product.price !== null;
  const sheet = layout === "sheet";

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
      flyToCart(sourceRef?.current ?? null);
      addItem({ productId: product.id, slug: product.slug, name: product.name, unitPrice: unit, quantity, options, image: product.image });
    }
    onDone?.();
  };

  return (
    <div className={cn("flex min-h-0 flex-col", sheet && "h-full")}>
      <div className={cn(sheet && "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-8 pb-10 md:px-10 md:pt-24 lg:px-14")}>
        <p className="kicker text-cheddar">
          {category?.name}
          {category?.note && <span className="text-fg/45"> — {category.note}</span>}
        </p>
        <h2 id="product-title" className="mt-4 font-display text-d3 [overflow-wrap:anywhere]">
          {product.name}
        </h2>
        <p className="mt-4 font-display text-4xl text-fg md:text-5xl">
          <Price cents={product.price} />
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {product.popular && <Badge tone="cheddar">Best-seller</Badge>}
          {product.spicy && (
            <Badge tone="line">
              <Flame className="size-3" aria-hidden /> Épicé
            </Badge>
          )}
          {product.vegetarian && (
            <Badge tone="line">
              <Leaf className="size-3" aria-hidden /> Végétarien
            </Badge>
          )}
          {!product.available && <Badge tone="danger">Indisponible</Badge>}
        </div>
        {product.description && <p className="mt-6 max-w-prose text-[1.05rem] leading-relaxed text-fg/80">{product.description}</p>}
        {product.homemade && product.homemade.length > 0 && <p className="mt-3 text-sm text-fg/55">Fait maison : {product.homemade.join(", ").toLowerCase()}.</p>}

        {product.options.length > 0 && (
          <div className="mt-8 space-y-6">
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
        )}

        <p className="mt-10 text-xs leading-relaxed text-fg/40">
          Allergènes : information disponible auprès du restaurant au {restaurant.phone.display}. Photos non contractuelles.
        </p>
      </div>

      <div className={cn("border-t border-fg/12 bg-canvas", sheet ? "px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-10 md:py-6 lg:px-14" : "mt-10 border-y py-5")}>
        {orderable ? (
          <div className="flex items-stretch gap-3">
            <QuantitySelector value={quantity} onChange={setQuantity} size="lg" />
            <button
              type="button"
              onClick={submit}
              data-cursor="add"
              className="group/btn flex h-14 min-w-0 flex-1 items-center justify-between gap-3 rounded-sm bg-cheddar px-5 font-display text-[1.25rem] leading-none text-ink uppercase transition-colors hover:bg-bone md:text-[1.5rem]"
            >
              <span className="truncate">
                {editing ? "Mettre à jour" : "Ajouter"} — <span className="tabular-nums">{formatPrice(total)}</span>
              </span>
              <Arrow />
            </button>
          </div>
        ) : product.price === null ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-fg/70">Prix en cours de mise à jour : commande par téléphone.</p>
            <ButtonLink href={restaurant.phone.href} variant="outline">
              <Phone className="size-4" aria-hidden /> {restaurant.phone.display}
            </ButtonLink>
          </div>
        ) : (
          <Button variant="outline" size="lg" disabled className="w-full">
            Indisponible pour le moment
          </Button>
        )}
        {showErrors && missing.length > 0 && (
          <p role="alert" className="mt-3 text-sm font-semibold text-danger">
            Choisis d’abord : {missing.map((m) => m.label.toLowerCase()).join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}
