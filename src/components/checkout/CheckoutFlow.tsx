"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, CreditCard, Store } from "lucide-react";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { checkCart } from "@/features/cart/lines";
import { useSite } from "@/features/site-context";
import { useOrderingNotice } from "@/features/store/use-status";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSlots } from "@/features/checkout/use-slots";
import { customerSchema } from "@/features/checkout/schema";
import { rememberPendingOrder } from "@/features/checkout/pending";
import { Field, TextArea } from "@/components/ui/Field";
import { ButtonLink } from "@/components/ui/Button";
import { OrderSummary } from "./OrderSummary";
import { SlotPicker, type PickupChoice } from "./SlotPicker";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

const StripePayment = dynamic(() => import("./StripePayment").then((m) => m.StripePayment), { ssr: false, loading: () => <div className="h-56 animate-pulse bg-fg/5" aria-hidden /> });

type Customer = { firstName: string; lastName: string; phone: string; email: string };
type Method = "card" | "on_site";
type Created = { orderNumber: string; accessToken: string; totalCents: number; clientSecret: string };
type CheckoutResponse = { orderNumber: string; accessToken: string; totalCents: number; paymentMethod: Method; status: string; clientSecret: string | null };
type ErrorResponse = { error?: string; code?: string; fields?: Record<string, string>; lines?: { lineIndex: number; message: string }[] };

const EMPTY: Customer = { firstName: "", lastName: "", phone: "", email: "" };

/**
 * Commande invitée (aucun compte) : mode → créneau → coordonnées → paiement.
 * Le navigateur n'envoie que des identifiants ; le serveur recalcule tout depuis Neon.
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
  const [created, setCreated] = useState<Created | null>(null);
  const [abandoning, setAbandoning] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const idem = useRef<{ key: string; for: string } | null>(null);

  const methods: Method[] = slots?.paymentMethods ?? store.paymentMethods;

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

  if (!hydrated) return <div className="shell min-h-[60vh] pt-32" aria-busy />;

  if (redirecting) {
    return (
      <div className="shell flex min-h-[70vh] items-center pt-32" aria-live="polite">
        <p className="display-3">
          C’est <span className="italic">parti…</span>
        </p>
      </div>
    );
  }

  if (lines.length === 0 && !created) {
    return (
      <div className="shell flex min-h-[70vh] flex-col items-start justify-center pt-32 pb-20">
        <p className="kicker text-brass-deep">Commande</p>
        <h1 className="display-2 mt-5">
          Votre panier <span className="italic">est vide.</span>
        </h1>
        <p className="mt-5 text-sub">La carte, elle, est bien remplie.</p>
        <ButtonLink href="/menu" variant="ink" size="lg" arrow className="mt-10">
          Voir la carte
        </ButtonLink>
      </div>
    );
  }

  const count = cartCount(lines);
  const belowMin = store.minOrderCents > 0 && checked.subtotalCents < store.minOrderCents;
  const blocked = Boolean(notice) || checked.hasErrors || belowMin || !pickup || !method;
  const clearError = (key: string) => setErrors((all) => (key in all ? Object.fromEntries(Object.entries(all).filter(([k]) => k !== key)) : all));
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer((c) => ({ ...c, [k]: e.target.value }));
    clearError(`customer.${k}`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || created) return;
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
        setRedirecting(true);
        useCart.getState().clear();
        router.push(`/commande/${body.orderNumber}?t=${encodeURIComponent(body.accessToken)}`);
        return;
      }
      if (body.status === "payment_pending" && body.clientSecret) {
        setCreated({ orderNumber: body.orderNumber, accessToken: body.accessToken, totalCents: body.totalCents, clientSecret: body.clientSecret });
        rememberPendingOrder(body.orderNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
      document.getElementById("etape-retrait")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (body.code === "cart_invalid" || body.code === "price_changed") router.refresh();
    if (body.code === "payment_method_unavailable" || body.code === "ordering_closed") void refreshSlots();
    setFormError(body.error ?? "Une erreur est survenue. Réessayez ou appelez le restaurant.");
  };

  const backToForm = async () => {
    if (!created) return;
    setAbandoning(true);
    try {
      const res = await fetch(`/api/orders/${created.orderNumber}/abandon`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ t: created.accessToken }) });
      const body = (await res.json().catch(() => ({}))) as { result?: string };
      if (body.result === "paid") {
        setRedirecting(true);
        useCart.getState().clear();
        router.push(`/commande/${created.orderNumber}?t=${encodeURIComponent(created.accessToken)}`);
        return;
      }
    } catch {
      /* la commande impayée expirera d'elle-même */
    } finally {
      setAbandoning(false);
    }
    idem.current = null;
    setCreated(null);
    void refreshSlots();
  };

  const summary = <OrderSummary lines={checked.lines} subtotalCents={created?.totalCents ?? checked.subtotalCents} onEdit={created ? undefined : () => setCartOpen(true)} />;
  const totalLabel = formatPrice(checked.subtotalCents);

  return (
    <div className="shell pt-24 pb-32 md:pt-32">
      <Link href="/menu" className="kicker text-sub hover:text-fg">
        ← Retour à la carte
      </Link>
      <h1 className="display-2 mt-6">
        {created ? (
          <>
            Dernière <span className="italic">étape.</span>
          </>
        ) : (
          <>
            Votre <span className="italic">commande.</span>
          </>
        )}
      </h1>

      {/* Récapitulatif repliable (mobile) */}
      <div className="mt-8 lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((v) => !v)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between border border-rule bg-panel px-5 py-4 text-left">
          <span className="text-sm font-semibold">
            {count} article{count > 1 ? "s" : ""} · <span className="tabular-nums">{formatPrice(created?.totalCents ?? checked.subtotalCents)}</span>
          </span>
          <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
        </button>
        {summaryOpen && <div className="mt-2">{summary}</div>}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {notice && (
            <div role="alert" className="on-dark mb-10 bg-ink px-5 py-4 text-fg">
              <p className="font-semibold">{notice}</p>
              <a href={store.phoneHref} className="mt-1 inline-block text-sm text-brass">
                Commander par téléphone : {store.phone}
              </a>
            </div>
          )}

          {created ? (
            <section aria-labelledby="etape-paiement-titre">
              <StepTitle n="04" id="etape-paiement-titre">
                Paiement
              </StepTitle>
              <p className="mt-3 text-sm text-sub">
                Commande <span className="font-semibold text-fg">{created.orderNumber}</span> réservée. Elle part en cuisine dès la confirmation du paiement.
              </p>
              <div className="mt-6">
                <StripePayment clientSecret={created.clientSecret} orderNumber={created.orderNumber} accessToken={created.accessToken} totalCents={created.totalCents} onBack={backToForm} backPending={abandoning} />
              </div>
            </section>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-14">
              <section aria-labelledby="etape-mode-titre">
                <StepTitle n="01" id="etape-mode-titre">
                  Mode
                </StepTitle>
                <div className="mt-5 flex items-center gap-4 border border-ink bg-ink px-5 py-4 text-ivory">
                  <Store className="size-5 shrink-0" aria-hidden strokeWidth={1.5} />
                  <span>
                    <span className="block font-semibold">À emporter</span>
                    <span className="block text-sm text-ivory/70">
                      Retrait au comptoir, {store.street}, {store.city}
                    </span>
                  </span>
                </div>
              </section>

              <section id="etape-retrait" aria-labelledby="etape-retrait-titre" className="scroll-mt-28">
                <StepTitle n="02" id="etape-retrait-titre">
                  Retrait
                </StepTitle>
                <div className="mt-5">
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
                    <div className="h-28 animate-pulse bg-fg/5" aria-hidden />
                  )}
                </div>
              </section>

              <section aria-labelledby="etape-coord-titre">
                <StepTitle n="03" id="etape-coord-titre">
                  Coordonnées
                </StepTitle>
                <p className="mt-2 text-sm text-sub">Pas de compte à créer. Nous vous appelons seulement en cas de souci avec la commande.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Prénom" name="firstName" autoComplete="given-name" required value={customer.firstName} onChange={set("firstName")} error={errors["customer.firstName"]} maxLength={60} />
                  <Field label="Nom" name="lastName" autoComplete="family-name" required value={customer.lastName} onChange={set("lastName")} error={errors["customer.lastName"]} maxLength={80} />
                  <Field label="Téléphone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={customer.phone} onChange={set("phone")} error={errors["customer.phone"]} placeholder="06 12 34 56 78" />
                  <Field label="Email" name="email" type="email" inputMode="email" autoComplete="email" required value={customer.email} onChange={set("email")} error={errors["customer.email"]} hint="Pour la confirmation de commande." maxLength={160} />
                </div>
                {store.orderNotesEnabled && <TextArea label="Une précision pour l’équipe ? (facultatif)" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} className="mt-4" placeholder="Ex. : je serai un peu en retard" />}
              </section>

              <section aria-labelledby="etape-paiement-titre">
                <StepTitle n="04" id="etape-paiement-titre">
                  Paiement
                </StepTitle>
                <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Moyen de paiement">
                  {methods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={method === m}
                      onClick={() => setMethod(m)}
                      className={cn("flex items-center gap-4 border px-5 py-4 text-left transition-colors", method === m ? "border-ink bg-panel ring-1 ring-ink" : "border-rule bg-panel hover:border-fg")}
                    >
                      {m === "card" ? <CreditCard className="size-5 shrink-0" aria-hidden strokeWidth={1.5} /> : <Store className="size-5 shrink-0" aria-hidden strokeWidth={1.5} />}
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{m === "card" ? "Payer en ligne" : "Payer au retrait"}</span>
                        <span className="block text-sm text-sub">{m === "card" ? "Carte bancaire, Apple Pay ou Google Pay — paiement sécurisé par Stripe" : "Espèces ou carte, au comptoir"}</span>
                      </span>
                      <span aria-hidden className={cn("grid size-5 shrink-0 place-items-center rounded-full border", method === m ? "border-ink" : "border-fg/30")}>
                        {method === m && <span className="size-2.5 rounded-full bg-ink" />}
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
                    className="mt-0.5 size-5 shrink-0 accent-ink"
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

              <div className="sticky bottom-0 z-20 -mx-4 border-t border-rule bg-bg/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
                <button
                  type="submit"
                  disabled={submitting || blocked}
                  className="flex h-16 w-full items-center justify-center gap-3 rounded-xs bg-ink px-6 text-[0.78rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-ink-soft disabled:opacity-40"
                >
                  {submitting ? "Validation…" : method === "card" ? `Continuer vers le paiement — ${totalLabel}` : `Valider ma commande — ${totalLabel}`}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">{summary}</div>
        </aside>
      </div>
    </div>
  );
}

function StepTitle({ n, id, children }: { n: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-rule pb-3">
      <span className="kicker text-brass-deep tabular-nums">{n}</span>
      <h2 id={id} className="display-4">
        {children}
      </h2>
    </div>
  );
}
