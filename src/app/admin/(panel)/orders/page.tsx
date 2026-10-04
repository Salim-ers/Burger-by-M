import Link from "next/link";
import { getDb } from "@/db/client";
import { listOrders, type OrderFilter } from "@/features/orders/service";
import { OrderStatusBadge, PageHeader, PaymentBadge, adminInput, adminButton } from "@/components/admin/primitives";
import { formatPrice } from "@/lib/money";
import { formatParisDateTime, formatParisTime } from "@/lib/schedule";
import { cn } from "@/lib/utils";

export const metadata = { title: "Commandes" };

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "today", label: "Aujourd’hui" },
  { key: "active", label: "En cours" },
  { key: "completed", label: "Terminées" },
  { key: "cancelled", label: "Annulées" },
  { key: "all", label: "Toutes" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  const params = await searchParams;
  const filter = (FILTERS.find((f) => f.key === params.filter)?.key ?? "today") as OrderFilter;
  const q = typeof params.q === "string" ? params.q.slice(0, 60) : "";
  const orders = await listOrders(getDb(), filter, q || null);
  const total = orders.filter((o) => o.orderStatus !== "cancelled").reduce((n, o) => n + o.totalCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader kicker="Suivi" title="Commandes" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtres" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={{ pathname: "/admin/orders", query: { filter: f.key, ...(q ? { q } : {}) } }}
              aria-current={filter === f.key ? "page" : undefined}
              className={cn("inline-flex h-10 items-center border px-3.5 text-[0.66rem] font-bold tracking-[0.14em] uppercase", filter === f.key ? "border-fg bg-fg text-ink" : "border-rule text-sub hover:text-fg")}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          <input type="hidden" name="filter" value={filter} />
          <input name="q" defaultValue={q} placeholder="N°, nom ou téléphone" aria-label="Rechercher une commande" className={cn(adminInput, "w-64")} />
          <button type="submit" className={adminButton("ghost")}>
            Rechercher
          </button>
        </form>
      </div>

      <p className="text-sm text-sub">
        {orders.length} commande{orders.length > 1 ? "s" : ""}
        {orders.length > 0 && (
          <>
            {" "}
            · <span className="tabular-nums text-fg">{formatPrice(total)}</span> hors annulations
          </>
        )}
      </p>

      <div className="overflow-x-auto border border-rule">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-panel text-left">
            <tr className="text-[0.62rem] tracking-[0.14em] text-sub uppercase">
              <th className="px-4 py-3 font-bold">Commande</th>
              <th className="px-4 py-3 font-bold">Client</th>
              <th className="px-4 py-3 font-bold">Retrait</th>
              <th className="px-4 py-3 font-bold">Statut</th>
              <th className="px-4 py-3 font-bold">Paiement</th>
              <th className="px-4 py-3 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-fg/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.orderNumber}`} className="font-semibold underline-offset-4 hover:underline">
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-sub">{formatParisDateTime(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  {o.customerFirstName} {o.customerLastName}
                  <p className="text-xs text-sub">{o.customerPhone}</p>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatParisTime(o.requestedTime)}
                  {o.isAsap && <span className="ml-1 text-xs text-sub">(ASAP)</span>}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.orderStatus} />
                </td>
                <td className="px-4 py-3">
                  <PaymentBadge status={o.paymentStatus} />
                  <p className="mt-1 text-xs text-sub">{o.paymentMethod === "card" ? "En ligne" : "Au retrait"}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.totalCents)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sub">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
