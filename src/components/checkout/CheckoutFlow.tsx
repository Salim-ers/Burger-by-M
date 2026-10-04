"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { checkCart } from "@/features/cart/lines";
import { useSite } from "@/features/site-context";
import { useOrderingNotice } from "@/features/store/use-status";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSlots } from "@/features/checkout/use-slots";
import { customerSchema } from "@/features/checkout/schema";
import { forgetPendingOrder, readPendingOrder, rememberPendingOrder, type PendingOrder } from "@/features/checkout/pending";
import type { PublicOrder } from "@/features/orders/public";
import { Field, TextArea } from "@/components/ui/Field";
import { OrderSummary } from "./OrderSummary";
import { SlotPicker, type PickupChoice } from "./SlotPicker";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

type Customer = { firstName: string; lastName: string; phone: string; email: string };
type Method = "card" | "on_site";
type CheckoutResponse = { orderNumber: string; accessToken: string; totalCents: number; paymentMethod: Method; status: string; checkoutUrl: string | null };
type ErrorResponse = { error?: string; code?: string; fields?: Record<string, string> };

const EMPTY: Customer = { firstName: "", lastName: "", phone: "", email: "" };

/**
 * Click & collect, sans compte : 01 votre commande → 02 votre créneau → 03 vos informations → 04 paiement.
 * Le navigateur n'envoie que des identifiants ; le serveur recalcule tout depuis Neon.
 * Carte : page de paiement sécurisée Mollie, retour sur le suivi de commande.
 */
export function CheckoutFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { products, store } = useSite();
  const notice = useOrderingNotice();
  const { data: slots, error: slotsError, refresh: refreshSlots } = useSlots();
  const checked = useMemo(() => checkCart(lines, products), [lines, products]);

  const [pickup, setPickup] = useState<PickupChoice | null>(null);
  const [customer, setCustomer] = useState<Customer>(EMPTY);
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<Method | null>(null);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [pending, setPending] = useState<(PendingOrder & { resumeUrl: string | null; totalCents: number }) | null>(null);
  const idem = useRef<{ key: string; for: string } | null>(null);

  const methods: Method[] = slots?.paymentMethods ?? store.paymentMethods;

  // Retour depuis la page de paiement sans avoir payé : proposer de reprendre ou de modifier.
  useEffect(() => {
    const p = readPendingOrder();
    if (!p) return;
    void fetch(`/api/orders/${encodeURIComponent(p.orderNumber)}?t=${encodeURIComponent(p.token)}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<PublicOrder>) : null))
      .then((o) => {
        if (o?.orderStatus === "payment_pending") setPending({ ...p, resumeUrl: o.resumePaymentUrl, totalCents: o.totalCents });
        else if (o && o.orderStatus !== "cancelled") router.replace(`/commande/${p.orderNumber}?t=${encodeURIComponent(p.token)}`);
        else forgetPendingOrder();
      })
      .catch(() => undefined);
  }, [router]);

  // Créneau par défaut, et correction si le créneau choisi vient d'être complété.
  useEffect(() => {
    if (!slots) return;
    const stillValid = pickup?.mode === "asap" ? Boolean(slots.asap) : pickup?.mode === "scheduled" ? slots.slots.some((s) => s.start === pickup.slotStart && s.available) : false;
    if (stillValid) return;
    if (pickup) setSlotError("Le créneau choisi n’est plus disponible : nous en avons sélectionné un autre.");
    const first = slots.slots.find((s) => s.available);
    setPickup(slots.asap ? { mode: "asap" } : first ? { mode: "scheduled", slotStart: first.start } : null);
  }, [slots, pickup]);

  useEffect(() => {
    setMethod((m) => (m && methods.includes(m) ? m : (methods[0] ?? null)));
  }, [methods]);

  if (!hydrated) return <div className="container-bm min-h-[60vh] pt-32" aria-busy />;

  if (redirecting) {
    return (
      <div className="container-bm flex min-h-[70vh] flex-col justify-center pt-32" aria-live="polite">
        <p className="t-xl">{redirecting}</p>
        <p className="mt-4 text-sub">Ne fermez pas cette page.</p>
      </div>
    );
  }

  if (lines.length === 0 && !pending) {
    return (
      <div className="container-bm flex min-h-[70vh] flex-col items-start justify-center pt-32 pb-20">
        <p className="t-label text-cheddar-deep">Votre commande</p>
        <h1 className="mt-5">
          <span className="t-xl block">Panier</span>
          <span className="s-xl block">encore vide.</span>
        </h1>
        <Link href="/menu" className="t-label mt-10 inline-flex h-14 items-center bg-ink px-8 text-cream transition-colors hover:bg-cheddar hover:text-ink">
          Voir la carte
        </Link>
      </div>
    );
  }

  const count = cartCount(lines);
  const belowMin = store.minOrderCents > 0 && checked.subtotalCents < store.minOrderCents;
  const blocked = Boolean(notice) || checked.hasErrors || belowMin || !pickup || !method || Boolean(pending);
  const clearError = (key: string) => setErrors((all) => (key in all ? Object.fromEntries(Object.entries(all).filter(([k]) => k !== key)) : all));
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer((c) => ({ ...c, [k]: e.target.value }));
    clearError(`customer.${k}`);
  };

  const abandonPending = async () => {
    if (!pending) return;
    await fetch(`/api/orders/${encodeURIComponent(pending.orderNumber)}/abandon`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ t: pending.token }) }).catch(() => undefined);
    forgetPendingOrder();
    setPending(null);
    void refreshSlots();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    setSlotError(null);

    const nextErrors: Record<string, string> = {};
    const parsed = customerSchema.safeParse(customer);
    if (!parsed.success) for (const i of parsed.error.issues) nextErrors[`customer.${i.path.join(".")}`] ??= i.message;
    if (!terms) nextErrors.acceptTerms = "Veuillez accepter les conditions générales de vente.";
    if (!pickup) nextErrors.pickup = "Choisissez une heure de retrait.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    if (blocked || !pickup || !method) return;

    const payload = {
      lines: checked.lines.map(({ line }) => ({ productId: line.productId, quantity: line.quantity, modifierIds: line.modifierIds, removedIngredientIds: line.removedIngredientIds, ...(line.note ? { note: line.note } : {}) })),
      customer,
      fulfillment: "pickup" as const,
      pickup,
      paymentMethod: method,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      expectedTotalCents: checked.subtotalCents,
      acceptTerms: true as const,
    };
    // Même contenu → même clé (double clic, réseau coupé) ; contenu modifié → nouvelle commande.
    const fingerprint = JSON.stringify(payload);
    if (!idem.current || idem.current.for !== fingerprint) idem.current = { key: crypto.randomUUID(), for: fingerprint };

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, idempotencyKey: idem.current.key }) });
      const body = (await res.json().catch(() => ({}))) as CheckoutResponse & ErrorResponse;
      if (!res.ok) {
        idem.current = null;
        handleError(res.status, body);
        return;
      }
      if (body.status === "new") {
        setRedirecting("C’est parti.");
        useCart.getState().clear();
        router.push(`/commande/${body.orderNumber}?t=${encodeURIComponent(body.accessToken)}`);
        return;
      }
      if (body.status === "payment_pending" && body.checkoutUrl) {
        rememberPendingOrder({ orderNumber: body.orderNumber, token: body.accessToken });
        setRedirecting("Paiement sécurisé…");
        window.location.assign(body.checkoutUrl);
        return;
      }
      idem.current = null;
      setFormError("Cette tentative a expiré. Vérifiez votre commande et validez à nouveau.");
    } catch {
      // Réponse perdue : la clé est conservée, une nouvelle tentative renverra la même commande.
      setFormError("Connexion interrompue. Vérifiez votre réseau et réessayez : votre commande ne sera pas créée deux fois.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleError = (status: number, body: ErrorResponse) => {
    if (status === 422 && body.fields) {
      setErrors(body.fields);
      setFormError(body.error ?? "Certaines informations sont invalides.");
      return;
    }
    if (body.code === "slot_unavailable" || body.code === "store_closed") {
      setSlotError(body.error ?? "Ce créneau n’est plus disponible.");
      void refreshSlots();
      document.getElementById("etape-creneau")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (body.code === "cart_invalid" || body.code === "price_changed") router.refresh();
    if (body.code === "payment_method_unavailable" || body.code === "ordering_closed") void refreshSlots();
    setFormError(body.error ?? "Une erreur est survenue. Réessayez ou appelez le restaurant.");
  };

  const total = formatPrice(checked.subtotalCents);
  const manual = store.cardCapture === "manual";

  return (
    <div className="container-bm pt-28 pb-32 md:pt-36">
      <Link href="/menu" className="t-label text-sub hover:text-fg">
        ← Retour à la carte
      </Link>
      <h1 className="mt-6 flex flex-wrap items-baseline gap-x-4">
        <span className="t-xl">Votre</span>
        <span className="s-xl">commande.</span>
      </h1>

      {pending && (
        <div role="status" className="on-dark mt-10 flex flex-col gap-4 bg-ink p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="t-label text-cheddar">Commande {pending.orderNumber} · paiement non finalisé</p>
            <p className="mt-2 text-cream/80">Votre commande attend son paiement ({formatPrice(pending.totalCents)}). Rien n’a été encaissé.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pending.resumeUrl && (
              <a href={pending.resumeUrl} className="t-label inline-flex h-12 items-center bg-cheddar px-6 text-ink">
                Reprendre le paiement
              </a>
            )}
            <button type="button" onClick={abandonPending} className="t-label inline-flex h-12 items-center border border-cream/30 px-6 text-cream hover:border-cream">
              Modifier ma commande
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-16">
        <form onSubmit={submit} noValidate className="space-y-16 lg:col-span-7">
          {notice && (
            <div role="alert" className="on-dark bg-ink px-5 py-4">
              <p className="font-semibold">{notice}</p>
              <a href={store.phoneHref} className="mt-1 inline-block text-sm text-cheddar">
                Appeler : {store.phone}
              </a>
            </div>
          )}

          <section aria-labelledby="etape-1">
            <StepTitle n="01" id="etape-1">
              Votre commande
            </StepTitle>
            <div className="mt-6 lg:hidden">
              <OrderSummary lines={checked.lines} subtotalCents={checked.subtotalCents} onEdit={() => setCartOpen(true)} />
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 border border-ink px-5 py-4">
              <span>
                <span className="t-s block">À emporter</span>
                <span className="block text-sm text-sub">
                  Retrait sur place, {store.street}, {store.city}
                </span>
              </span>
              <span className="t-label text-sub">
                {count} article{count > 1 ? "s" : ""}
              </span>
            </div>
          </section>

          <section id="etape-creneau" aria-labelledby="etape-2" className="scroll-mt-28">
            <StepTitle n="02" id="etape-2">
              Votre créneau
            </StepTitle>
            <div className="mt-6">
              {slots ? (
                <SlotPicker
                  data={slots}
                  value={pickup}
                  onChange={(v) => {
                    setPickup(v);
                    setSlotError(null);
                  }}
                  error={slotError ?? errors.pickup}
                />
              ) : slotsError ? (
                <p className="text-sm font-semibold text-danger">{slotsError}</p>
              ) : (
                <div className="h-28 animate-pulse bg-ink/5" aria-hidden />
              )}
            </div>
          </section>

          <section aria-labelledby="etape-3">
            <StepTitle n="03" id="etape-3">
              Vos informations
            </StepTitle>
            <p className="mt-3 text-sm text-sub">Pas de compte à créer. Nous vous appelons seulement en cas de souci avec la commande.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" name="firstName" autoComplete="given-name" required value={customer.firstName} onChange={set("firstName")} error={errors["customer.firstName"]} maxLength={60} />
              <Field label="Nom" name="lastName" autoComplete="family-name" required value={customer.lastName} onChange={set("lastName")} error={errors["customer.lastName"]} maxLength={80} />
              <Field label="Téléphone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={customer.phone} onChange={set("phone")} error={errors["customer.phone"]} placeholder="06 12 34 56 78" />
              <Field label="Email" name="email" type="email" inputMode="email" autoComplete="email" required value={customer.email} onChange={set("email")} error={errors["customer.email"]} hint="Pour la confirmation de commande." maxLength={160} />
            </div>
            {store.orderNotesEnabled && <TextArea label="Une précision pour l’équipe ? (facultatif)" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} className="mt-4" placeholder="Ex. : je serai un peu en retard" />}
          </section>

          <section aria-labelledby="etape-4">
            <StepTitle n="04" id="etape-4">
              Paiement
            </StepTitle>
            <div className="mt-6 grid gap-2" role="radiogroup" aria-label="Moyen de paiement">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={method === m}
                  onClick={() => setMethod(m)}
                  className={cn("flex items-start gap-4 border px-5 py-4 text-left transition-colors", method === m ? "border-ink bg-panel" : "border-rule hover:border-ink")}
                >
                  <span aria-hidden className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", method === m ? "border-cheddar bg-cheddar" : "border-ink/30")}>
                    {method === m && <span className="size-2 rounded-full bg-ink" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="t-s block">{m === "card" ? "Carte bancaire" : "Au retrait"}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-sub">
                      {m === "card"
                        ? manual
                          ? "Paiement sécurisé Mollie. Le montant est réservé, puis encaissé seulement quand la cuisine accepte votre commande — sinon la réservation est annulée."
                          : "Paiement sécurisé Mollie. Si la cuisine ne peut pas accepter votre commande, vous êtes remboursé."
                        : "Espèces ou carte, au comptoir."}
                    </span>
                  </span>
                </button>
              ))}
              {methods.length === 0 && <p className="text-sm font-semibold text-danger">Aucun moyen de paiement disponible pour le moment.</p>}
            </div>

            <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  if (e.target.checked) clearError("acceptTerms");
                }}
                aria-invalid={Boolean(errors.acceptTerms) || undefined}
                className="mt-0.5 size-5 shrink-0 accent-[#e79a24]"
              />
              <span>
                J’accepte les{" "}
                <Link href="/legal/cgv" target="_blank" className="underline underline-offset-4">
                  conditions générales de vente
                </Link>
                . Mes coordonnées servent uniquement à traiter ma commande (
                <Link href="/legal/confidentialite" target="_blank" className="underline underline-offset-4">
                  confidentialité
                </Link>
                ).
              </span>
            </label>
            {errors.acceptTerms && <p className="mt-2 text-sm font-semibold text-danger">{errors.acceptTerms}</p>}
          </section>

          {(formError || checked.hasErrors || belowMin) && (
            <div role="alert" className="border border-danger/40 bg-danger/5 px-5 py-4 text-sm font-semibold text-danger">
              {formError ?? (checked.hasErrors ? "Certains produits de votre panier ne sont plus disponibles : modifiez votre panier." : `Minimum de commande : ${formatPrice(store.minOrderCents)}.`)}
            </div>
          )}

          <div className="sticky bottom-0 z-20 -mx-[var(--gutter)] border-t border-rule bg-bg/95 px-[var(--gutter)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
            <button type="submit" disabled={submitting || blocked} className="t-label flex h-16 w-full items-center justify-center bg-ink px-6 text-[0.8rem] text-cream transition-colors hover:bg-cheddar hover:text-ink disabled:opacity-40">
              {submitting ? "Validation…" : method === "card" ? `Payer · ${total}` : `Valider ma commande · ${total}`}
            </button>
          </div>
        </form>

        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <OrderSummary lines={checked.lines} subtotalCents={checked.subtotalCents} onEdit={() => setCartOpen(true)} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepTitle({ n, id, children }: { n: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 border-b-2 border-ink pb-3">
      <span className="t-label text-cheddar-deep tabular-nums">Étape {n}</span>
      <h2 id={id} className="t-m">
        {children}
      </h2>
    </div>
  );
}
