"use client";

import { Price } from "@/components/ui/Price";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { Field, TextArea, Checkbox } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { PickupSelector } from "@/components/ordering/PickupSelector";
import { OrderingNotice } from "@/components/ordering/OrderingNotice";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useMenuProducts, useOrdering } from "@/hooks/use-menu";
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

/** Étapes 3 (infos) et 4 (retrait) : fond blanc cassé, récapitulatif noir collant. */
export function CheckoutForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const pickup = useCartStore((s) => s.pickup);
  const clearCart = useCartStore((s) => s.clearCart);
  const setLastOrder = useCheckoutStore((s) => s.setLastOrder);
  const products = useMenuProducts();
  const { accepting, prepMinutes } = useOrdering();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentMethod>("cash_on_pickup");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!hydrated) return <div className="min-h-[70vh] bg-bone" aria-busy="true" />;

  if (items.length === 0 && !submitting) {
    return (
      <div className="scheme-light bg-bone">
        <EmptyState className="min-h-[60vh] justify-center" lines={["Ton panier", "a faim."]} text="Ajoute quelques produits avant de passer commande." action={{ href: "/commander", label: "Voir la carte" }} />
      </div>
    );
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
    if (!accepting) return setFormError("Les commandes en ligne sont suspendues pour le moment.");
    const unavailable = items.filter((i) => {
      const p = products.find((x) => x.id === i.productId);
      return !p || !p.available || p.price === null;
    });
    if (unavailable.length) return setFormError(`Indisponible pour le moment : ${unavailable.map((i) => i.name).join(", ")}. Retire-le du panier pour continuer.`);

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 650)); // latence réseau simulée (démo)
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
      router.push("/commande/confirmation");
      clearCart();
    } catch {
      setSubmitting(false);
      setFormError("Impossible d’envoyer la commande. Réessaie ou appelle le restaurant.");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="scheme-light bg-bone pt-10 pb-24 text-ink md:pt-14">
      <div className="shell grid-12 gap-y-12">
        <div className="col-span-12 space-y-14 lg:col-span-7">
          <Step n="03" id="infos" title="Infos">
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <Field label="Prénom" name="firstName" id="firstName" autoComplete="given-name" value={values.firstName} onChange={set("firstName")} error={errors.firstName} required />
              <Field label="Nom" name="lastName" id="lastName" autoComplete="family-name" value={values.lastName} onChange={set("lastName")} error={errors.lastName} required />
              <Field label="Téléphone" name="phone" id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={values.phone} onChange={set("phone")} error={errors.phone} hint="Pour te prévenir si besoin." required />
              <Field label="Email" name="email" id="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} required />
            </div>
            <Checkbox className="mt-5" name="marketingOptIn" checked={values.marketingOptIn} onChange={set("marketingOptIn")} label="Je souhaite recevoir les nouveautés et offres de Burger By M (désinscription possible à tout moment)." />
          </Step>

          <Step n="04" id="retrait" title="Retrait">
            <p className="mb-4 text-sm text-ink/65">
              Au restaurant : {restaurant.address.street}, {restaurant.address.postalCode} {restaurant.address.city}.
            </p>
            <PickupSelector />
          </Step>

          <Step n="—" id="paiement" title="Paiement">
            <div role="radiogroup" aria-label="Moyen de paiement" className="grid gap-2 sm:grid-cols-2">
              <PayOption active={payment === "cash_on_pickup"} onSelect={() => setPayment("cash_on_pickup")} icon={<Banknote className="size-5" aria-hidden />} title="Au restaurant" text="Tu paies au moment du retrait." />
              <PayOption active={false} disabled onSelect={() => undefined} icon={<CreditCard className="size-5" aria-hidden />} title="Carte en ligne" text="Bientôt disponible" />
            </div>
          </Step>

          <Step n="—" id="note" title="Une précision ?">
            <TextArea label="Instructions pour la cuisine (facultatif)" name="notes" id="notes" maxLength={300} placeholder="Ex. : sauce à part, svp." value={values.notes} onChange={set("notes")} error={errors.notes} />
          </Step>
        </div>

        <aside aria-labelledby="recap-title" className="col-span-12 lg:col-span-5">
          <div className="scheme-dark space-y-5 bg-ink p-5 text-bone md:p-7 lg:sticky lg:top-24">
            <h2 id="recap-title" className="kicker text-bone/55">
              Ta commande
            </h2>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.lineId} className="flex justify-between gap-4 text-[0.95rem]">
                  <div className="min-w-0">
                    <p className="font-display text-xl leading-none">
                      {i.quantity} × {i.name}
                    </p>
                    {visibleOptions(i.options).length > 0 && <p className="mt-1 text-xs text-bone/55">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</p>}
                  </div>
                  <span className="shrink-0 tabular-nums">{formatPrice(multiplyCents(i.unitPrice, i.quantity))}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-graphite pt-4 text-sm text-bone/70">
              <p>Retrait : {pickup.mode === "asap" ? `dès que possible (≈ ${prepMinutes} min)` : formatDayTime(pickup.time)}</p>
              <p>Paiement : au restaurant</p>
            </div>
            <div className="flex items-baseline justify-between border-t border-graphite pt-4">
              <span className="kicker">Total</span>
              <span className="font-display text-5xl tabular-nums">
                <Price cents={total} />
              </span>
            </div>
            <OrderingNotice />
            {formError && (
              <p role="alert" className="border-l-4 border-danger bg-danger/10 p-3 text-sm">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !accepting}
              data-cursor="go"
              className="flex h-16 w-full items-center justify-between gap-3 rounded-sm bg-cheddar px-5 font-display text-2xl text-ink uppercase transition-colors hover:bg-bone disabled:pointer-events-none disabled:opacity-40"
            >
              {submitting ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin" aria-hidden /> Envoi en cours…
                </span>
              ) : (
                <>
                  <span>Confirmer</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </>
              )}
            </button>
            <p className="text-center text-xs leading-relaxed text-bone/50">
              En confirmant, tu acceptes que tes coordonnées soient utilisées pour traiter ta commande.{" "}
              {DEMO_MODE && <span className="block pt-1">Démonstration : la commande reste dans ce navigateur, aucun paiement n’est effectué.</span>}
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Step({ n, id, title, children }: { n: string; id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`step-${id}`} className="scroll-mt-28">
      <h2 id={`step-${id}`} className="mb-6 flex items-baseline gap-4 border-b-2 border-ink pb-3 font-display text-d4">
        <span className="font-sans text-xs font-semibold text-ink/45 tabular-nums">{n}</span>
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
      className={cn("flex min-h-16 items-center gap-4 border-2 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40", active ? "border-ink bg-ink text-bone" : "border-ink/15")}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center", active ? "bg-cheddar text-ink" : "bg-ink/10")}>{icon}</span>
      <span>
        <span className="block font-display text-xl leading-none uppercase">{title}</span>
        <span className={cn("mt-1 block text-sm", active ? "text-bone/65" : "text-ink/60")}>{text}</span>
      </span>
    </button>
  );
}
