"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { useAdminStore } from "@/stores/admin-store";
import { formatPrice } from "@/lib/currency";
import { formatTime } from "@/lib/hours";
import { isToday } from "@/lib/admin";

const DemoCharts = dynamic(() => import("@/components/admin/DemoCharts"), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-sm bg-bone/5" />,
});

export default function DashboardPage() {
  const orders = useAdminStore((s) => s.orders);
  const settings = useAdminStore((s) => s.settings);
  const setSetting = useAdminStore((s) => s.setSetting);

  const today = orders.filter((o) => isToday(o.createdAt) && o.status !== "CANCELLED");
  const revenue = today.reduce((n, o) => n + o.total, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const inProgress = orders.filter((o) => o.status === "ACCEPTED" || o.status === "PREPARING").length;
  const stats: { label: string; value: React.ReactNode; highlight?: boolean }[] = [
    { label: "Commandes du jour", value: String(today.length) },
    { label: "Chiffre d’affaires du jour", value: <Price cents={revenue} /> },
    { label: "Panier moyen", value: today.length ? <Price cents={Math.round(revenue / today.length)} /> : "—" },
    { label: "En attente", value: String(pending), highlight: pending > 0 },
  ];

  return (
    <>
      <PageHeader title="Tableau de bord" text="Vue d’ensemble du service en cours." />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-sm border border-edge bg-panel p-5">
          <div>
            <p className="font-semibold">Prise de commandes en ligne</p>
            <p className="text-sm text-bone/55">{settings.acceptingOrders ? "Les clients peuvent commander." : "Le checkout est bloqué côté client."}</p>
          </div>
          <Switch checked={settings.acceptingOrders} onChange={(v) => setSetting("acceptingOrders", v)} label="Accepter les commandes" srOnlyLabel tone="success" />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-sm border border-edge bg-panel p-5">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <Zap className="size-4 text-cheddar" aria-hidden /> Mode coup de feu
            </p>
            <p className="text-sm text-bone/55">
              Préparation annoncée : {settings.rushMode ? settings.rushPrepMinutes : settings.prepMinutes} min
            </p>
          </div>
          <Switch checked={settings.rushMode} onChange={(v) => setSetting("rushMode", v)} label="Mode coup de feu" srOnlyLabel tone="cheddar" />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={s.highlight ? "rounded-sm bg-cheddar p-5 text-ink" : "rounded-sm border border-edge bg-panel p-5"}>
            <dt className="text-xs font-semibold opacity-70">{s.label}</dt>
            <dd className="mt-2 font-display text-4xl tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent-title" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-title" className="text-xs font-bold tracking-[0.16em] text-bone/60 uppercase">
            Commandes récentes · {inProgress} en cours
          </h2>
          <Link href="/admin/commandes" className="text-sm text-bone/70 hover:text-bone">
            Tout voir
          </Link>
        </div>
        <div className="relative overflow-x-auto rounded-sm border border-edge">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/[0.02] text-left text-xs text-bone/55">
              <tr>
                <th className="px-4 py-3 font-semibold">N°</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Retrait</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-t border-edge/60 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${o.id}`} className="font-semibold tabular-nums hover:text-cheddar">
                      #{o.number.replace("BYM-", "")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer.firstName}</td>
                  <td className="px-4 py-3 tabular-nums">{formatTime(o.pickup.time)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="analytics-title" className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="analytics-title" className="text-xs font-bold tracking-[0.16em] text-bone/60 uppercase">
            Statistiques
          </h2>
          <Badge tone="cheddar">Données de démonstration</Badge>
        </div>
        <DemoCharts />
      </section>
    </>
  );
}
