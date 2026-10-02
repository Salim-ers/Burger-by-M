import { ShoppingBag, Bike } from "lucide-react";

/** À emporter actif ; livraison grisée (non proposée en ligne pour l'instant). */
export function ModeSwitch() {
  return (
    <div role="radiogroup" aria-label="Mode de commande" className="inline-flex border border-fg/20">
      <button type="button" role="radio" aria-checked="true" className="flex h-11 items-center gap-2 bg-fg px-4 font-display text-[1.05rem] text-canvas uppercase">
        <ShoppingBag className="size-4" aria-hidden /> À emporter
      </button>
      <button type="button" role="radio" aria-checked="false" disabled className="flex h-11 items-center gap-2 px-4 font-display text-[1.05rem] text-fg/35 uppercase">
        <Bike className="size-4" aria-hidden /> Livraison <span className="font-sans text-[0.65rem] font-semibold tracking-wide normal-case">bientôt</span>
      </button>
    </div>
  );
}
