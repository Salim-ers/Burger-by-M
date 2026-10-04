"use client";

import { useMemo, useState } from "react";
import { Check, Phone } from "lucide-react";
import type { MenuModifierGroup, MenuProduct } from "@/features/menu/types";
import { compositionText } from "@/features/menu/types";
import { defaultModifierIds, isGroupVisible, MAX_ITEM_NOTE, missingRequiredGroups, priceLine, pruneHiddenSelections } from "@/features/menu/pricing";
import { lineDetails } from "@/features/cart/lines";
import { useCart, type CartLine } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useOrderingNotice } from "@/features/store/use-status";
import { Quantity } from "@/components/ui/Quantity";
import { Price } from "@/components/ui/Price";
import { ProductBadges } from "./Badges";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

interface Props {
  product: MenuProduct;
  editing?: CartLine;
  /** added = true quand un produit vient d'être ajouté (la fiche anime la photo vers le panier). */
  onDone: (added: boolean) => void;
  /** Visuel placé en tête de la zone défilante (bottom sheet mobile). */
  media?: React.ReactNode;
}

/** Fiche produit : composition, personnalisation pilotée par la base, quantité, prix recalculé en direct. */
export function ProductConfigurator({ product, editing, onDone, media }: Props) {
  const add = useCart((s) => s.add);
  const replace = useCart((s) => s.replace);
  const { store } = useSite();
  const notice = useOrderingNotice();
  const [modifierIds, setModifierIds] = useState<string[]>(() => editing?.modifierIds ?? defaultModifierIds(product));
  const [removed, setRemoved] = useState<string[]>(() => editing?.removedIngredientIds ?? []);
  const [note, setNote] = useState(editing?.note ?? "");
  const [quantity, setQuantity] = useState(editing?.quantity ?? 1);
  const [showErrors, setShowErrors] = useState(false);

  const selected = useMemo(() => new Set(modifierIds), [modifierIds]);
  const priced = priceLine(product, { productId: product.id, quantity, modifierIds, removedIngredientIds: removed, note });
  const missing = missingRequiredGroups(product, modifierIds);
  const orderable = product.isAvailable && product.priceCents !== null;
  const removable = product.ingredients.filter((i) => i.isRemovable);
  const total = priced.ok ? priced.line.lineTotalCents : (product.priceCents ?? 0) * quantity;

  const toggle = (g: MenuModifierGroup, id: string) => {
    let next: string[];
    if (g.selectionType === "single") next = [...modifierIds.filter((m) => !g.modifiers.some((x) => x.id === m)), id];
    else if (selected.has(id)) next = modifierIds.filter((m) => m !== id);
    else {
      const count = g.modifiers.filter((m) => selected.has(m.id)).length;
      if (g.maxSelect !== null && count >= g.maxSelect) return;
      next = [...modifierIds, id];
    }
    setModifierIds(pruneHiddenSelections(product, next));
  };

  const submit = () => {
    if (!priced.ok) {
      setShowErrors(true);
      const first = missing[0];
      if (first) document.getElementById(`grp-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const line = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image ? { src: product.image.src, alt: product.image.alt, ...(product.image.position ? { position: product.image.position } : {}) } : null,
      quantity,
      modifierIds,
      removedIngredientIds: removed,
      ...(priced.line.note ? { note: priced.line.note } : {}),
      unitPriceCents: priced.line.unitPriceCents,
      details: lineDetails(priced.line),
    };
    if (editing) replace(editing.key, line);
    else add(line);
    onDone(!editing);
  };

  const visibleGroups = product.modifierGroups.filter((g) => isGroupVisible(g, selected));
  const before = visibleGroups.filter((g) => g.key !== "supplements");
  const supplements = visibleGroups.filter((g) => g.key === "supplements");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {media}
        <div className="px-5 pt-7 pb-10 md:px-12 md:pt-16">
          <ProductBadges product={product} />
          <h2 id="product-title" className="t-l mt-4">
            {product.name}
          </h2>
          <p className="t-m mt-3 text-cheddar-deep">
            <Price cents={product.priceCents} />
          </p>
          <p className="mt-5 max-w-prose text-[1rem] leading-relaxed text-sub">{compositionText(product)}</p>
          {product.image && product.needsFinalProductPhoto && <p className="mt-2 text-xs text-sub">Photo d’illustration : la présentation peut varier.</p>}
          {product.allergens && <p className="mt-3 text-sm text-sub">Allergènes : {product.allergens}</p>}

          <div className="mt-10 space-y-9">
            {before.map((g) => (
              <OptionGroup key={g.id} group={g} selected={selected} onToggle={(id) => toggle(g, id)} invalid={showErrors && missing.some((m) => m.id === g.id)} />
            ))}

            {removable.length > 0 && (
              <fieldset>
                <legend className="flex w-full items-baseline justify-between gap-4 border-b border-rule pb-3">
                  <span className="t-label text-fg">Retirer</span>
                  <span className="text-xs text-sub">Facultatif</span>
                </legend>
                <div className="divide-y divide-rule">
                  {removable.map((ing) => (
                    <Choice
                      key={ing.id}
                      type="checkbox"
                      name="retirer"
                      label={`Sans ${ing.name.charAt(0).toLowerCase()}${ing.name.slice(1)}`}
                      checked={removed.includes(ing.id)}
                      onChange={() => setRemoved((r) => (r.includes(ing.id) ? r.filter((x) => x !== ing.id) : [...r, ing.id]))}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {supplements.map((g) => (
              <OptionGroup key={g.id} group={g} selected={selected} onToggle={(id) => toggle(g, id)} invalid={false} />
            ))}

            {product.allowNotes && store.orderNotesEnabled && (
              <div>
                <label htmlFor="item-note" className="t-label block border-b border-rule pb-3">
                  Une précision ?
                </label>
                <textarea
                  id="item-note"
                  maxLength={MAX_ITEM_NOTE}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex. : sauce à part"
                  className="mt-3 min-h-20 w-full resize-none border border-rule bg-panel px-4 py-3 text-[0.95rem] outline-none placeholder:text-sub/70 focus:border-fg"
                />
              </div>
            )}
          </div>
          <p className="mt-10 text-xs leading-relaxed text-sub">Photos non contractuelles. Allergènes : renseignez-vous auprès du restaurant ({store.phone}).</p>
        </div>
      </div>

      <div className="border-t border-rule bg-bg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-10 md:py-5">
        {orderable && notice ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">{notice}</p>
            <a href={store.phoneHref} className="t-label inline-flex h-12 items-center justify-center gap-2 border border-rule px-5 hover:border-fg">
              <Phone className="size-4" aria-hidden /> {store.phone}
            </a>
          </div>
        ) : orderable ? (
          <div className="flex items-center gap-3">
            <Quantity value={quantity} onChange={setQuantity} />
            <button
              type="button"
              onClick={submit}
              data-cursor="add"
              className="t-label flex h-14 min-w-0 flex-1 items-center justify-center gap-2 bg-ink px-5 text-[0.76rem] text-cream transition-colors duration-300 hover:bg-cheddar hover:text-ink active:scale-[0.99]"
            >
              <span className="truncate">
                {editing ? "Mettre à jour" : "Ajouter"} · <span className="tabular-nums">{formatPrice(total)}</span>
              </span>
            </button>
          </div>
        ) : product.priceCents === null ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-sub">Prix à confirmer : à commander au comptoir ou par téléphone.</p>
            <a href={store.phoneHref} className="t-label inline-flex h-12 items-center justify-center gap-2 border border-rule px-5 hover:border-fg">
              <Phone className="size-4" aria-hidden /> {store.phone}
            </a>
          </div>
        ) : (
          <p className="py-3 text-center text-sm font-semibold text-sub">Épuisé pour le moment</p>
        )}
        {showErrors && missing.length > 0 && (
          <p role="alert" className="mt-2 text-sm font-semibold text-danger">
            Choisissez d’abord : {missing.map((m) => m.name.toLowerCase()).join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}

function OptionGroup({ group, selected, onToggle, invalid }: { group: MenuModifierGroup; selected: Set<string>; onToggle: (id: string) => void; invalid: boolean }) {
  const single = group.selectionType === "single";
  const label = group.key === "supplements" ? "Suppléments" : group.name;
  return (
    <fieldset id={`grp-${group.id}`} className="scroll-mt-24">
      <legend className="flex w-full items-baseline justify-between gap-4 border-b border-rule pb-3">
        <span className="t-label text-fg">{label}</span>
        <span className={cn("text-xs", invalid ? "font-bold text-danger" : "text-sub")}>{group.minSelect > 0 ? "Obligatoire" : "Facultatif"}</span>
      </legend>
      {group.helper && <p className="pt-2 text-xs text-sub">{group.helper}</p>}
      <div className="divide-y divide-rule">
        {group.modifiers.map((m) => (
          <Choice key={m.id} type={single ? "radio" : "checkbox"} name={group.id} label={m.name} checked={selected.has(m.id)} onChange={() => onToggle(m.id)} extra={m.priceDeltaCents > 0 ? `+${formatPrice(m.priceDeltaCents)}` : undefined} />
        ))}
      </div>
    </fieldset>
  );
}

function Choice({ type, name, label, checked, onChange, extra }: { type: "radio" | "checkbox"; name: string; label: string; checked: boolean; onChange: () => void; extra?: string }) {
  return (
    <label className="relative flex min-h-13 cursor-pointer items-center justify-between gap-4 py-2">
      <span className="flex items-center gap-3.5">
        <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
        <span
          aria-hidden
          className={cn(
            "grid size-5 shrink-0 place-items-center border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cheddar",
            type === "radio" ? "rounded-full" : "rounded-[2px]",
            checked ? "border-cheddar bg-cheddar text-ink" : "border-fg/35",
          )}
        >
          {checked && (type === "radio" ? <span className="size-2 rounded-full bg-ink" /> : <Check className="size-3.5" strokeWidth={3} />)}
        </span>
        <span className="text-[0.95rem]">{label}</span>
      </span>
      {extra && <span className={cn("shrink-0 text-sm tabular-nums", checked ? "font-semibold text-cheddar-deep" : "text-sub")}>{extra}</span>}
    </label>
  );
}
