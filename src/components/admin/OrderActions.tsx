"use client";

import { useState } from "react";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { acceptOrderAction, cancelOrderAction, refundOrderAction, refuseOrderAction, setOrderStatusAction } from "@/features/admin/actions/orders";
import { adminButton, adminInput, ORDER_STATUS_LABEL } from "./primitives";
import { useAction } from "./ui";
import { formatPrice, parsePriceInput } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Transitions après acceptation (le serveur applique KITCHEN_TRANSITIONS). */
const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  preparing: ["ready"],
  ready: ["completed", "preparing"],
  completed: ["ready"],
};

export const REFUSAL_REASONS = ["Rupture de stock", "Cuisine saturée", "Fermeture imminente", "Client injoignable"] as const;

interface Props {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "card" | "on_site";
  refundableCents: number;
  role: "owner" | "staff";
}

export function OrderActions({ orderId, status, paymentStatus, paymentMethod, refundableCents, role }: Props) {
  const { exec, pending } = useAction();
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const paidOnline = paymentMethod === "card" && (paymentStatus === "paid" || paymentStatus === "partially_refunded");
  const isNew = status === "new";
  const canCancel = (status === "preparing" || status === "ready") && (!paidOnline || role === "owner");
  const canRefund = role === "owner" && paidOnline && refundableCents > 0;
  const transitions = TRANSITIONS[status] ?? [];

  const refuse = () => {
    if (reason.trim().length < 2) return;
    const money = paymentStatus === "authorized" ? " La réservation sur la carte du client sera levée." : paidOnline ? ` ${formatPrice(refundableCents)} seront remboursés.` : "";
    if (!window.confirm(`Refuser cette commande ?${money}`)) return;
    void exec(() => refuseOrderAction(orderId, reason), { success: "Commande refusée : le client est prévenu sur sa page de suivi." });
  };

  return (
    <div className="space-y-6">
      {isNew && (
        <div className="space-y-4">
          <button type="button" disabled={pending} onClick={() => exec(() => acceptOrderAction(orderId), { success: paymentStatus === "authorized" ? "Acceptée : paiement encaissé." : "Commande acceptée." })} className={cn(adminButton("cheddar", "lg"), "w-full")}>
            Accepter
          </button>
          {paymentStatus === "authorized" && <p className="text-xs text-sub">Le montant autorisé est encaissé au moment où vous acceptez.</p>}
          <div className="border-t border-rule pt-4">
            <label htmlFor="refuse-reason" className="t-label text-sub">
              Refuser
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {REFUSAL_REASONS.map((r) => (
                <button key={r} type="button" onClick={() => setReason(r)} className={cn("h-9 border px-3 text-xs font-semibold transition-colors", reason === r ? "border-cream bg-cream text-ink" : "border-rule text-fg/80 hover:border-fg/60")}>
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="refuse-reason" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif" className={adminInput} />
              <button type="button" disabled={pending || reason.trim().length < 2} onClick={refuse} className={adminButton("danger")}>
                Refuser
              </button>
            </div>
          </div>
        </div>
      )}

      {transitions.length > 0 && (
        <div>
          <p className="t-label text-sub">Changer le statut</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {transitions.map((to, i) => (
              <button key={to} type="button" disabled={pending} onClick={() => exec(() => setOrderStatusAction(orderId, status, to), { success: `Statut : ${ORDER_STATUS_LABEL[to]}.` })} className={adminButton(i === 0 ? "primary" : "ghost")}>
                {ORDER_STATUS_LABEL[to]}
              </button>
            ))}
          </div>
        </div>
      )}

      {canCancel && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const warn = paidOnline ? `Annuler et rembourser intégralement ${formatPrice(refundableCents)} ?` : "Annuler cette commande ?";
            if (!window.confirm(warn)) return;
            void exec(() => cancelOrderAction(orderId, reason), { success: paidOnline ? "Commande annulée et remboursée." : "Commande annulée." });
          }}
          className="border-t border-rule pt-5"
        >
          <label htmlFor="cancel-reason" className="t-label text-sub">
            Annuler la commande
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input id="cancel-reason" required minLength={2} maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif (rupture, client injoignable…)" className={adminInput} />
            <button type="submit" disabled={pending || reason.trim().length < 2} className={adminButton("danger")}>
              {paidOnline ? "Annuler et rembourser" : "Annuler"}
            </button>
          </div>
        </form>
      )}
      {(status === "preparing" || status === "ready") && paidOnline && role !== "owner" && <p className="text-xs text-sub">Commande payée en ligne : annulation et remboursement réservés au gérant.</p>}

      {canRefund && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const cents = amount.trim() ? parsePriceInput(amount) : null;
            if (amount.trim() && (cents === null || cents <= 0 || cents > refundableCents)) {
              window.alert(`Montant invalide (maximum ${formatPrice(refundableCents)}).`);
              return;
            }
            if (!window.confirm(`Rembourser ${formatPrice(cents ?? refundableCents)} au client ?`)) return;
            void exec(() => refundOrderAction(orderId, cents), { success: "Remboursement effectué." }).then((r) => r.ok && setAmount(""));
          }}
          className="border-t border-rule pt-5"
        >
          <label htmlFor="refund-amount" className="t-label text-sub">
            Rembourser (Mollie)
          </label>
          <p className="mt-1 text-xs text-sub">Laisser vide pour rembourser le solde : {formatPrice(refundableCents)}.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input id="refund-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant partiel, ex. 4,50" className={adminInput} />
            <button type="submit" disabled={pending} className={adminButton("cheddar")}>
              Rembourser
            </button>
          </div>
        </form>
      )}
      {!isNew && transitions.length === 0 && !canCancel && !canRefund && <p className="text-sm text-sub">Aucune action disponible pour cette commande.</p>}
    </div>
  );
}
