"use client";

import { useState } from "react";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { cancelOrderAction, refundOrderAction, setOrderStatusAction } from "@/features/admin/actions/orders";
import { adminButton, adminInput, ORDER_STATUS_LABEL } from "./primitives";
import { useAction } from "./ui";
import { formatPrice, parsePriceInput } from "@/lib/money";

/** Transitions proposées depuis le back-office (le serveur applique KITCHEN_TRANSITIONS). */
const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  new: ["preparing"],
  preparing: ["ready", "new"],
  ready: ["completed", "preparing"],
  completed: ["ready"],
};

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
  const canCancel = status !== "cancelled" && status !== "completed" && status !== "payment_pending" && (!paidOnline || role === "owner");
  const canRefund = role === "owner" && paidOnline && refundableCents > 0;
  const transitions = TRANSITIONS[status] ?? [];

  return (
    <div className="space-y-6">
      {transitions.length > 0 && (
        <div>
          <p className="kicker text-sub">Changer le statut</p>
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
          <label htmlFor="cancel-reason" className="kicker text-sub">
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
      {status !== "cancelled" && paidOnline && role !== "owner" && <p className="text-xs text-sub">Commande payée en ligne : annulation et remboursement réservés au gérant.</p>}

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
          <label htmlFor="refund-amount" className="kicker text-sub">
            Rembourser (Stripe)
          </label>
          <p className="mt-1 text-xs text-sub">Laisser vide pour rembourser le solde : {formatPrice(refundableCents)}.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input id="refund-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant partiel, ex. 4,50" className={adminInput} />
            <button type="submit" disabled={pending} className={adminButton("brass")}>
              Rembourser
            </button>
          </div>
        </form>
      )}
      {transitions.length === 0 && !canCancel && !canRefund && <p className="text-sm text-sub">Aucune action disponible pour cette commande.</p>}
    </div>
  );
}
