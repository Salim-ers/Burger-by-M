import { ShoppingBag, Bike } from "lucide-react";

/** À emporter actif ; livraison grisée (non proposée en ligne pour l'instant). */
export function ModeSwitch() {
  return (
    <div role="radiogroup" aria-label="Mode de commande" className="inline-flex rounded-full border border-cream/15 p-1">
      <button type="button" role="radio" aria-checked="true" className="flex h-11 items-center gap-2 rounded-full bg-cream px-4 sm:px-5 text-[0.75rem] font-bold tracking-[0.12em] text-ink uppercase">
        <ShoppingBag className="size-4" aria-hidden /> À emporter
      </button>
      <button type="button" role="radio" aria-checked="false" disabled className="flex h-11 items-center gap-2 rounded-full px-4 text-[0.75rem] font-bold tracking-[0.12em] text-cream/40 sm:px-5 uppercase">
        <Bike className="size-4" aria-hidden /> Livraison <span className="hidden font-medium tracking-normal normal-case sm:inline">· bientôt</span>
      </button>
    </div>
  );
}
