import type { Metadata } from "next";
import { getDb } from "@/db/client";
import { getOrderByNumber, ORDER_NUMBER_RE } from "@/features/orders/service";
import { toPublicOrder } from "@/features/orders/public";
import { tokenMatches } from "@/lib/security/tokens";
import { OrderTracking } from "@/components/checkout/OrderTracking";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Suivi de commande",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ t?: string | string[] }> };

/** Suivi d'une commande : accessible uniquement avec le jeton personnel transmis à la création. */
export default async function OrderPage({ params, searchParams }: Props) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.t === "string" ? query.t : null;
  const found = ORDER_NUMBER_RE.test(orderNumber) && token ? await getOrderByNumber(getDb(), orderNumber) : null;

  if (!found || !tokenMatches(token, found.accessTokenHash)) {
    return (
      <section data-theme="dark" className="on-dark flex min-h-[80svh] items-end bg-ink pt-36 pb-20 md:pb-28">
        <div className="container-bm">
          <p className="t-label text-cheddar">Suivi de commande</p>
          <h1 className="mt-6">
            <span className="t-xl block">Lien de suivi</span>
            <span className="s-xl block">invalide.</span>
          </h1>
          <p className="mt-6 max-w-md text-cream/75">Utilisez le lien obtenu après votre commande, ou appelez le restaurant avec votre numéro de commande.</p>
          <ButtonLink href="/menu" variant="ivory" size="lg" arrow className="mt-10">
            Voir la carte
          </ButtonLink>
        </div>
      </section>
    );
  }

  return <OrderTracking orderNumber={orderNumber} token={token!} initial={toPublicOrder(found.view, found.payment)} />;
}
