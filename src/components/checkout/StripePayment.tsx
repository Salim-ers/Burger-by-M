"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import { rememberPendingOrder } from "@/features/checkout/pending";
import { formatPrice } from "@/lib/money";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  stripePromise ??= loadStripe(key, { locale: "fr" });
  return stripePromise;
}

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#0d0d0d",
    colorBackground: "#faf8f4",
    colorText: "#0d0d0d",
    colorTextSecondary: "#6e655a",
    colorDanger: "#b3261e",
    borderRadius: "2px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #e2d8c7", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #0d0d0d", boxShadow: "none" },
    ".Tab": { border: "1px solid #e2d8c7", boxShadow: "none" },
    ".Tab--selected": { border: "1px solid #0d0d0d" },
  },
};

interface Props {
  clientSecret: string;
  orderNumber: string;
  accessToken: string;
  totalCents: number;
  onBack: () => void;
  backPending?: boolean;
}

/**
 * Paiement Stripe (Payment Element) : la carte n'est jamais vue par nos serveurs.
 * La validation définitive vient du webhook signé, pas de cette page.
 */
export function StripePayment(props: Props) {
  const stripe = useMemo(() => getStripe(), []);
  if (!stripe) return <p className="text-sm font-semibold text-danger">Paiement en ligne indisponible : choisissez le paiement au retrait.</p>;
  return (
    <Elements stripe={stripe} options={{ clientSecret: props.clientSecret, appearance, locale: "fr" }}>
      <PayForm {...props} />
    </Elements>
  );
}

function PayForm({ orderNumber, accessToken, totalCents, onBack, backPending }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setError(null);
    rememberPendingOrder(orderNumber);
    const returnUrl = `${window.location.origin}/commande/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(accessToken)}`;
    const { error: err } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
    // On n'arrive ici qu'en cas d'erreur (sinon Stripe redirige vers la page de suivi).
    setError(err.type === "card_error" || err.type === "validation_error" ? (err.message ?? "Paiement refusé.") : "Le paiement n’a pas pu aboutir. Réessayez ou choisissez un autre moyen de paiement.");
    setBusy(false);
  };

  return (
    <form onSubmit={pay} className="space-y-5">
      <PaymentElement onReady={() => setReady(true)} options={{ layout: { type: "tabs" } }} />
      {!ready && <div className="h-40 animate-pulse bg-fg/5" aria-hidden />}
      {error && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !ready || busy}
        className="flex h-16 w-full items-center justify-center gap-3 rounded-xs bg-ink text-[0.8rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        <Lock className="size-4" aria-hidden />
        {busy ? "Paiement en cours…" : `Payer ${formatPrice(totalCents)}`}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-sub">
        <p>Paiement sécurisé par Stripe. Commande {orderNumber}.</p>
        <button type="button" onClick={onBack} disabled={busy || backPending} className="font-semibold underline underline-offset-4 hover:text-fg disabled:opacity-50">
          {backPending ? "Un instant…" : "Modifier ma commande"}
        </button>
      </div>
    </form>
  );
}
