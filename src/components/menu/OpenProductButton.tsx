"use client";

import { useUi } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useOrderingNotice } from "@/features/store/use-status";
import { isOrderable } from "@/features/menu/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/money";

/** Bouton de la page produit : ouvre la fiche de personnalisation (même parcours que la carte). */
export function OpenProductButton({ productId }: { productId: string }) {
  const open = useUi((s) => s.openProduct);
  const { products, store } = useSite();
  const notice = useOrderingNotice();
  const product = products.get(productId);
  if (!product) return null;
  if (!isOrderable(product)) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-sub">{product.isAvailable ? "Prix à confirmer : à commander au comptoir ou par téléphone." : "Épuisé pour le moment."}</p>
        <ButtonLink href={store.phoneHref} variant="line" size="lg">
          {store.phone}
        </ButtonLink>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Button variant="ink" size="xl" data-cursor="add" onClick={() => open(product.id)} className="w-full sm:w-auto">
        Ajouter · {formatPrice(product.priceCents ?? 0)}
      </Button>
      {notice && <p className="text-sm font-semibold text-sub">{notice}</p>}
    </div>
  );
}
