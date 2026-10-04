import type { Metadata } from "next";
import { getDb } from "@/db/client";
import { getOrderByNumber } from "@/features/orders/service";
import { toPublicOrder } from "@/features/orders/public";
import { tokenMatches } from "@/lib/security/tokens";
import { OrderTracking } from "@/components/checkout/OrderTracking";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Suivi de commande",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ t?: string | string[]; redirect_status?: string | string[] }> };

/** Suivi d'une commande : accessible uniquement avec le jeton personnel transmis à la création. */
export default async function OrderPage({ params, searchParams }: Props) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.t === "string" ? query.t : null;
  const found = /^M-\d{3,9}$/.test(orderNumber) && token ? await getOrderByNumber(getDb(), orderNumber) : null;

  if (!found || !tokenMatches(token, found.accessTokenHash)) {
    return (
      <section className="on-light bg-ivory pt-36 pb-28 md:pt-48">
        <div className="shell">
          <p className="kicker text-brass-deep">Suivi de commande</p>
          <h1 className="display-2 mt-6">
            Lien de suivi <span className="italic">invalide.</span>
          </h1>
          <p className="mt-6 max-w-md text-sub">Utilisez le lien reçu après votre commande, ou appelez le restaurant avec votre numéro de commande.</p>
          <ButtonLink href="/menu" variant="ink" size="lg" arrow className="mt-10">
            Voir la carte
          </ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <div className="on-light min-h-[80vh] bg-ivory">
      <OrderTracking orderNumber={orderNumber} token={token!} initial={toPublicOrder(found.view)} paymentFailed={query.redirect_status === "failed"} />
    </div>
  );
}
