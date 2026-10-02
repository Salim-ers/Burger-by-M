"use client";

import { useMemo, useState } from "react";
import { Flame, Heart, Leaf, Phone, Info } from "lucide-react";
import type { Product } from "@/types/product";
import { OptionGroupField } from "./OptionGroupField";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Price } from "@/components/ui/Price";
import { ButtonLink } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useMenuCategories } from "@/hooks/use-menu";
import { useStoreStatus } from "@/hooks/use-store-status";
import { defaultSelections, missingGroups, selectionsFromOptions, toSelectedOptions, type Selections } from "@/lib/product-options";
import { lineIdFor, unitPriceFor } from "@/lib/order";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  editLineId?: string;
  onDone?: () => void;
  /** Visuel affiché en tête de la zone défilante (mobile). */
  media?: React.ReactNode;
  /** "sheet" : fiche (modale / bottom sheet) ; "page" : route /menu/[slug]. */
  layout?: "sheet" | "page";
}

/** Infos produit, options, quantité et bouton d'ajout fixe en bas. */
export function ProductConfigurator({ product, editLineId, onDone, media, layout = "sheet" }: Props) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateOptions = useCartStore((s) => s.updateOptions);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const showToast = useUiStore((s) => s.showToast);
  const categories = useMenuCategories();
  const status = useStoreStatus();
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
      addItem({ productId: product.id, slug: product.slug, name: product.name, unitPrice: unit, quantity, options, image: product.image });
      showToast(product.name, quantity);
    }
    onDone?.();
  };

  return (
    <div className={cn("flex min-h-0 flex-col", sheet && "h-full")}>
      <div className={cn(sheet && "relative min-h-0 flex-1 overflow-y-auto overscroll-contain")}>
        {media}
        <div className={cn(sheet ? "px-5 pt-5 pb-8 md:px-8 md:pt-8" : "")}>
          {category && <p className="kicker text-muted">{category.name}</p>}
          <h2 id="product-title" className="mt-1.5 font-display text-[2.4rem] leading-[1] md:text-[2.8rem]">
            {product.name}
          </h2>
          <p className="mt-2 text-xl font-bold">
            <Price cents={product.price} />
          </p>
          {(product.popular || product.spicy || product.vegetarian) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.popular && (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold">
                  <Heart className="size-3.5 fill-rose text-rose" aria-hidden /> Best-seller
                </span>
              )}
              {product.spicy && (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold">
                  <Flame className="size-3.5 text-[#c2410c]" aria-hidden /> Épicé
                </span>
              )}
              {product.vegetarian && (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold">
                  <Leaf className="size-3.5 text-open" aria-hidden /> Végétarien
                </span>
              )}
            </div>
          )}
          {product.description && <p className="mt-4 text-[1rem] leading-relaxed text-muted">{product.description}</p>}
          {product.homemade && product.homemade.length > 0 && <p className="mt-2 text-sm text-muted">Fait maison : {product.homemade.join(", ").toLowerCase()}.</p>}
          {category?.note && <p className="mt-1 text-sm text-muted">{category.note}.</p>}

          {product.options.length > 0 && (
            <div className="mt-6 space-y-6 border-t border-line pt-6">
              {product.options.map((g) => (
                <div key={g.id} id={`opt-${g.id}`} className="scroll-mt-24">
                  <OptionGroupField group={g} value={selections[g.id] ?? []} onChange={(next) => setSelections((s) => ({ ...s, [g.id]: next }))} invalid={showErrors && missing.some((m) => m.id === g.id)} />
                </div>
              ))}
            </div>
          )}

          <p className="mt-8 text-xs leading-relaxed text-muted">Allergènes : information disponible au restaurant ({restaurant.phone.display}). Photos non contractuelles.</p>
        </div>
      </div>

      <div className={cn("border-t border-line bg-white", sheet ? "px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8 md:py-4" : "mt-8 rounded-xl border p-4")}>
        {status.ready && !status.canOrder && orderable && !editing && (
          <p className="mb-3 flex items-start gap-2 text-[0.85rem] text-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {status.blockedMessage} Vous pouvez déjà préparer votre panier.
            </span>
          </p>
        )}
        {orderable ? (
          <div className="flex items-center gap-3">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button
              type="button"
              onClick={submit}
              className="flex h-13 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[0.88rem] font-bold tracking-[0.04em] text-white uppercase transition-[background-color,transform] duration-200 hover:bg-coal active:scale-[0.98]"
            >
              <span className="truncate">
                {editing ? "Mettre à jour" : "Ajouter"}
                <span className="hidden md:inline">{editing ? "" : " au panier"}</span> · <span className="tabular-nums">{formatPrice(total)}</span>
              </span>
            </button>
          </div>
        ) : product.price === null ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Prix à confirmer au restaurant : commande par téléphone.</p>
            <ButtonLink href={restaurant.phone.href} variant="dark">
              <Phone className="size-4" aria-hidden /> Appeler
            </ButtonLink>
          </div>
        ) : (
          <p className="py-3 text-center text-sm font-semibold text-muted">Indisponible pour le moment</p>
        )}
        {showErrors && missing.length > 0 && (
          <p role="alert" className="mt-2 text-sm font-semibold text-danger">
            Choisissez d’abord : {missing.map((m) => m.label.toLowerCase()).join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}
