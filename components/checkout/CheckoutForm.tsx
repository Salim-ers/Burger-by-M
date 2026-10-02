"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Loader2, MapPin } from "lucide-react";
import { Field, TextArea, Checkbox } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { PickupSelector } from "@/components/ordering/PickupSelector";
import { OrderingNotice } from "@/components/ordering/OrderingNotice";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useMenuProducts, useOrdering } from "@/hooks/use-menu";
import { useStoreStatus } from "@/hooks/use-store-status";
import { orderRepository } from "@/lib/repositories";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { cartSubtotal, visibleOptions } from "@/lib/order";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { formatDayTime } from "@/lib/hours";
import { sanitizeText, cn } from "@/lib/utils";
import { DEMO_MODE } from "@/config/demo";
import { restaurant } from "@/data/restaurant";
import type { PaymentMethod } from "@/types/order";

const initial = { firstName: "", lastName: "", phone: "", email: "", marketingOptIn: false, notes: "" };

/** Retrait + informations client + paiement sur place, récapitulatif à droite. */
export function CheckoutForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const pickup = useCartStore((s) => s.pickup);
  const clearCart = useCartStore((s) => s.clearCart);
  const setLastOrder = useCheckoutStore((s) => s.setLastOrder);
  const products = useMenuProducts();
  const { prepMinutes } = useOrdering();
  const status = useStoreStatus();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentMethod>("cash_on_pickup");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (items.length === 0 && !submitting) {
    return <EmptyState className="min-h-[50vh] justify-center" title="Votre panier est vide" text="Ajoutez des produits avant de passer commande." action={{ href: "/menu", label: "Voir la carte" }} />;
  }

  const total = cartSubtotal(items);
  const set = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0] ?? "")?.focus();
      return;
    }
    setErrors({});
    if (!status.canOrder) return setFormError(status.blockedMessage ?? "Les commandes en ligne sont fermées pour le moment.");
    const unavailable = items.filter((i) => {
      const p = products.find((x) => x.id === i.productId);
      return !p || !p.available || p.price === null;
    });
    if (unavailable.length) return setFormError(`Indisponible pour le moment : ${unavailable.map((i) => i.name).join(", ")}. Retirez-le du panier pour continuer.`);

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // latence réseau simulée (démo)
      const time = pickup.mode === "asap" ? new Date(Date.now() + prepMinutes * 60_000).toISOString() : pickup.time;
      const order = await orderRepository.create({
        customer: {
          firstName: sanitizeText(parsed.data.firstName, 60),
          lastName: sanitizeText(parsed.data.lastName, 80),
          phone: sanitizeText(parsed.data.phone, 20),
          email: sanitizeText(parsed.data.email, 120),
          marketingOptIn: parsed.data.marketingOptIn,
        },
        items: items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, options: i.options })),
        pickup: { mode: pickup.mode, time },
        paymentMethod: payment,
        notes: parsed.data.notes ? sanitizeText(parsed.data.notes, 300) : undefined,
      });
      setLastOrder(order.id);
      router.push("/confirmation");
      clearCart();
    } catch {
      setSubmitting(false);
      setFormError("Impossible d’envoyer la commande. Réessayez ou appelez le restaurant.");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="shell grid gap-6 pb-16 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-6">
        <Step n={1} title="Retrait">
          <div className="mb-5 flex items-start gap-3 rounded-lg bg-cream p-4">
            <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="leading-snug">
              <strong className="font-bold">{restaurant.name}</strong>
              <br />
              {restaurant.address.street}
              <br />
              {restaurant.address.postalCode} {restaurant.address.city}
            </p>
          </div>
          <PickupSelector />
        </Step>

        <Step n={2} title="Vos informations">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" name="firstName" id="firstName" autoComplete="given-name" value={values.firstName} onChange={set("firstName")} error={errors.firstName} required />
            <Field label="Nom" name="lastName" id="lastName" autoComplete="family-name" value={values.lastName} onChange={set("lastName")} error={errors.lastName} required />
            <Field label="Téléphone" name="phone" id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={values.phone} onChange={set("phone")} error={errors.phone} hint="Pour vous prévenir si besoin." required />
            <Field label="Email" name="email" id="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} required />
            <TextArea label="Notes pour la commande (facultatif)" name="notes" id="notes" maxLength={300} placeholder="Ex. : sans sauce dans les frites." value={values.notes} onChange={set("notes")} error={errors.notes} className="sm:col-span-2" />
          </div>
          <Checkbox className="mt-3" name="marketingOptIn" checked={values.marketingOptIn} onChange={set("marketingOptIn")} label="Je souhaite recevoir les nouveautés et offres de Burger By M (désinscription possible à tout moment)." />
        </Step>

        <Step n={3} title="Paiement">
          <div role="radiogroup" aria-label="Moyen de paiement" className="grid gap-2 sm:grid-cols-2">
            <PayOption active={payment === "cash_on_pickup"} onSelect={() => setPayment("cash_on_pickup")} icon={<Banknote className="size-5" aria-hidden />} title="Paiement sur place" text="Vous payez au retrait de la commande." />
            <PayOption active={false} disabled onSelect={() => undefined} icon={<CreditCard className="size-5" aria-hidden />} title="Paiement en ligne" text="Bientôt disponible" />
          </div>
        </Step>
      </div>

      <aside aria-labelledby="recap-title" className="lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-4 rounded-xl border border-line bg-white p-5 md:p-6">
          <h2 id="recap-title" className="text-lg font-bold">
            Votre commande
          </h2>
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.lineId} className="flex justify-between gap-4 py-3 text-[0.95rem]">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {i.quantity} × {i.name}
                  </p>
                  {visibleOptions(i.options).length > 0 && <p className="mt-0.5 text-sm text-muted">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</p>}
                </div>
                <span className="shrink-0 tabular-nums">{formatPrice(multiplyCents(i.unitPrice, i.quantity))}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-line pt-4 text-sm text-muted">
            <p>Retrait : {pickup.mode === "asap" ? `dès que possible (${status.prepRange})` : formatDayTime(pickup.time)}</p>
            <p>Paiement : sur place</p>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
          </div>
          <OrderingNotice />
          {formError && (
            <p role="alert" className="rounded-lg bg-danger/8 p-3 text-sm font-semibold text-danger">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || (status.ready && !status.canOrder)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-[0.9rem] font-bold tracking-[0.04em] text-white uppercase transition-colors hover:bg-coal disabled:pointer-events-none disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden /> Envoi en cours…
              </>
            ) : (
              <>
                Valider la commande · <span className="tabular-nums">{formatPrice(total)}</span>
              </>
            )}
          </button>
          <p className="text-center text-xs leading-relaxed text-muted">
            En validant, vous acceptez que vos coordonnées soient utilisées pour traiter votre commande.
            {DEMO_MODE && <span className="block pt-1">Démonstration : la commande reste dans ce navigateur, aucun paiement n’est effectué.</span>}
          </p>
        </div>
      </aside>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-xl border border-line bg-white p-5 md:p-6">
      <h2 id={`step-${n}`} className="mb-5 flex items-center gap-3 text-lg font-bold">
        <span className="grid size-7 place-items-center rounded-full bg-ink text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function PayOption({ active, disabled, onSelect, icon, title, text }: { active: boolean; disabled?: boolean; onSelect: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onSelect}
      className={cn("flex min-h-16 items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45", active ? "border-ink" : "border-line")}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", active ? "bg-ink text-white" : "bg-cream")}>{icon}</span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{text}</span>
      </span>
    </button>
  );
}
