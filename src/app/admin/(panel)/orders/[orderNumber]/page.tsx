import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as t from "@/db/schema";
import { getStaffSession } from "@/lib/auth/guard";
import { getOrderByNumber, ORDER_NUMBER_RE } from "@/features/orders/service";
import { OrderActions } from "@/components/admin/OrderActions";
import { ORDER_STATUS_LABEL, OrderStatusBadge, PageHeader, Panel, PaymentBadge } from "@/components/admin/primitives";
import type { OrderStatus } from "@/db/schema";
import { formatPrice } from "@/lib/money";
import { formatParisDateTime } from "@/lib/schedule";

export const metadata = { title: "Commande" };

const ACTION_LABEL: Record<string, string> = {
  "order.created": "Commande créée",
  "payment.authorized": "Paiement autorisé (montant réservé)",
  "payment.paid": "Paiement encaissé",
  "payment.failed": "Paiement échoué",
  "payment.canceled": "Paiement annulé",
  "payment.expired": "Paiement expiré",
  "payment.refunded": "Remboursement confirmé",
  "payment.partially_refunded": "Remboursement partiel confirmé",
  "payment.amount_mismatch": "Montant reçu différent du total",
  "order.accepted": "Acceptée en cuisine",
  "order.refused": "Refusée",
  "order.capture_failed": "Encaissement impossible",
  "order.status": "Statut modifié",
  "order.cancelled": "Commande annulée",
  "order.refund": "Remboursement",
  "order.revived_after_payment": "Relancée après paiement tardif",
};

const CAPTURE_LABEL = { manual: "Réservé, encaissé à l’acceptation", automatic: "Encaissé au paiement" } as const;

const statusLabel = (v: unknown) => ORDER_STATUS_LABEL[v as OrderStatus] ?? String(v ?? "?");

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  if (!ORDER_NUMBER_RE.test(orderNumber)) notFound();
  const db = getDb();
  const [found, user] = await Promise.all([getOrderByNumber(db, orderNumber), getStaffSession()]);
  if (!found || !user) notFound();
  const { view: o, payment } = found;
  const logs = await db
    .select()
    .from(t.auditLogs)
    .where(and(eq(t.auditLogs.entityType, "order"), eq(t.auditLogs.entityId, o.id)))
    .orderBy(desc(t.auditLogs.createdAt))
    .limit(50);
  const refundable = payment ? payment.amountCents - payment.amountRefundedCents : 0;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-xs font-semibold text-sub hover:text-fg">
        ← Commandes
      </Link>
      <PageHeader kicker={`Passée le ${formatParisDateTime(o.createdAt)}`} title={o.orderNumber}>
        <OrderStatusBadge status={o.orderStatus} className="h-8 px-3" />
        <PaymentBadge status={o.paymentStatus} className="h-8 px-3" />
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Articles">
            <ul className="divide-y divide-rule">
              {o.items.map((it) => {
                const options = it.modifiers.filter((m) => m.name !== "Seul");
                return (
                  <li key={it.id} className="flex justify-between gap-6 py-3">
                    <div>
                      <p className="font-semibold">
                        {it.quantity} × {it.productName} <span className="font-normal text-sub">({formatPrice(it.unitPriceCents)})</span>
                      </p>
                      {options.length > 0 && <p className="mt-0.5 text-sm text-fg/75">{options.map((m) => `${m.groupName} : ${m.name}${m.priceDeltaCents ? ` (+${formatPrice(m.priceDeltaCents)})` : ""}`).join(" · ")}</p>}
                      {it.removedIngredients.length > 0 && <p className="mt-0.5 text-sm font-semibold text-[#f08a7e]">Sans : {it.removedIngredients.join(", ")}</p>}
                      {it.note && <p className="mt-0.5 text-sm text-cheddar">« {it.note} »</p>}
                    </div>
                    <p className="shrink-0 tabular-nums">{formatPrice(it.lineTotalCents)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t border-rule pt-3">
              <span className="t-label text-sub">Total TTC</span>
              <span className="t-m tabular-nums">{formatPrice(o.totalCents)}</span>
            </div>
            {o.notes && <p className="mt-4 border-l-2 border-cheddar pl-3 text-sm text-cheddar">Note du client : {o.notes}</p>}
          </Panel>

          <Panel title="Historique">
            {logs.length === 0 ? (
              <p className="text-sm text-sub">Aucun événement enregistré.</p>
            ) : (
              <ol className="space-y-2.5 text-sm">
                {logs.map((l) => {
                  const data = (l.data ?? {}) as Record<string, unknown>;
                  const detail =
                    l.action === "order.status"
                      ? `${statusLabel(data.from)} → ${statusLabel(data.to)}`
                      : l.action === "order.refund"
                        ? formatPrice(Number(data.amountCents ?? 0))
                        : l.action === "order.cancelled" || l.action === "order.refused"
                          ? String(data.reason ?? "")
                          : "";
                  return (
                    <li key={l.id} className="flex flex-wrap gap-x-3">
                      <span className="w-44 shrink-0 text-sub tabular-nums">{formatParisDateTime(l.createdAt)}</span>
                      <span className="font-semibold">{ACTION_LABEL[l.action] ?? l.action}</span>
                      {detail && <span className="text-fg/75">{detail}</span>}
                      <span className="text-sub">{l.actorEmail ?? (l.action === "order.created" ? "client (site)" : l.action.startsWith("payment.") ? "Mollie" : "système")}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Client et retrait">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-sub">Client</dt>
                <dd className="font-semibold">
                  {o.customerFirstName} {o.customerLastName}
                </dd>
              </div>
              <div>
                <dt className="text-sub">Téléphone</dt>
                <dd>
                  <a href={`tel:${o.customerPhone.replace(/[^\d+]/g, "")}`} className="font-semibold underline underline-offset-4">
                    {o.customerPhone}
                  </a>
                </dd>
              </div>
              {o.customerEmail && (
                <div>
                  <dt className="text-sub">Email</dt>
                  <dd className="break-all">{o.customerEmail}</dd>
                </div>
              )}
              <div>
                <dt className="text-sub">Retrait</dt>
                <dd className="font-semibold">
                  {formatParisDateTime(o.requestedTime)} {o.isAsap && <span className="font-normal text-sub">(dès que possible)</span>}
                </dd>
              </div>
              {o.refusedAt && (
                <div>
                  <dt className="text-sub">Refusée le</dt>
                  <dd>{formatParisDateTime(o.refusedAt)}</dd>
                </div>
              )}
              {o.cancelReason && (
                <div>
                  <dt className="text-sub">{o.refusedAt ? "Motif du refus" : "Motif d’annulation"}</dt>
                  <dd>{o.cancelReason}</dd>
                </div>
              )}
            </dl>
          </Panel>

          <Panel title="Paiement">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-sub">Moyen</dt>
                <dd>{o.paymentMethod === "card" ? `En ligne (Mollie${payment?.method ? ` · ${payment.method === "creditcard" ? "carte" : payment.method}` : ""})` : "Au retrait"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-sub">Statut</dt>
                <dd>
                  <PaymentBadge status={o.paymentStatus} />
                </dd>
              </div>
              {payment && payment.provider !== "on_site" && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-sub">Montant</dt>
                    <dd className="tabular-nums">{formatPrice(payment.amountCents)}</dd>
                  </div>
                  {payment.captureMode && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-sub">Encaissement</dt>
                      <dd className="text-right">{payment.captureMode === "manual" ? CAPTURE_LABEL.manual : CAPTURE_LABEL.automatic}</dd>
                    </div>
                  )}
                  {payment.capturedAt && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-sub">Encaissé le</dt>
                      <dd>{formatParisDateTime(payment.capturedAt)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-sub">Remboursé</dt>
                    <dd className="tabular-nums">{formatPrice(payment.amountRefundedCents)}</dd>
                  </div>
                  {payment.providerPaymentId && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-sub">Référence</dt>
                      <dd className="font-mono text-xs break-all">{payment.providerPaymentId}</dd>
                    </div>
                  )}
                  {payment.lastError && (
                    <div>
                      <dt className="text-sub">Dernière erreur</dt>
                      <dd className="text-[#f08a7e]">{payment.lastError}</dd>
                    </div>
                  )}
                </>
              )}
              {o.paidAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-sub">Payée le</dt>
                  <dd>{formatParisDateTime(o.paidAt)}</dd>
                </div>
              )}
            </dl>
          </Panel>

          <Panel title="Actions">
            <OrderActions orderId={o.id} status={o.orderStatus} paymentStatus={o.paymentStatus} paymentMethod={o.paymentMethod} refundableCents={refundable} role={user.role} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
