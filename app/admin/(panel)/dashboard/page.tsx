"use client";

import { Zap } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { OrderBoard } from "@/components/admin/OrderBoard";
import { Switch } from "@/components/ui/Switch";
import { useAdminStore } from "@/stores/admin-store";
import { formatPrice } from "@/lib/currency";
import { isToday } from "@/lib/admin";
import { cn } from "@/lib/utils";

/** Tableau de bord simple : chiffres du jour, réglages rapides, commandes à traiter. */
export default function DashboardPage() {
  const orders = useAdminStore((s) => s.orders);
  const settings = useAdminStore((s) => s.settings);
  const setSetting = useAdminStore((s) => s.setSetting);

  const today = orders.filter((o) => isToday(o.createdAt) && o.status !== "CANCELLED");
  const revenue = today.reduce((n, o) => n + o.total, 0);
  const stats: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Commandes du jour", value: String(today.length) },
    { label: "Nouvelles", value: String(orders.filter((o) => o.status === "PENDING").length), highlight: orders.some((o) => o.status === "PENDING") },
    { label: "En préparation", value: String(orders.filter((o) => o.status === "ACCEPTED" || o.status === "PREPARING").length) },
    { label: "Prêtes", value: String(orders.filter((o) => o.status === "READY").length) },
  ];

  return (
    <>
      <PageHeader title="Tableau de bord" text={`Chiffre d’affaires du jour : ${formatPrice(revenue)}`} />

      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-lg p-4 md:p-5", s.highlight ? "bg-cream text-ink" : "border border-edge bg-panel")}>
            <dt className="text-sm opacity-70">{s.label}</dt>
            <dd className="mt-1 text-4xl font-bold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-edge bg-panel p-4 md:p-5">
          <div>
            <p className="font-semibold">Commandes en ligne</p>
            <p className="text-sm text-cream/55">{settings.acceptingOrders ? "Ouvertes aux clients." : "Suspendues : le site affiche un message."}</p>
          </div>
          <Switch checked={settings.acceptingOrders} onChange={(v) => setSetting("acceptingOrders", v)} label="Accepter les commandes" srOnlyLabel tone="success" />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-edge bg-panel p-4 md:p-5">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <Zap className="size-4" aria-hidden /> Forte affluence
            </p>
            <p className="text-sm text-cream/55">Préparation annoncée : {settings.rushMode ? settings.rushPrepMinutes : settings.prepMinutes} min</p>
          </div>
          <Switch checked={settings.rushMode} onChange={(v) => setSetting("rushMode", v)} label="Mode forte affluence" srOnlyLabel />
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-bold">Commandes à traiter</h2>
      <OrderBoard />
    </>
  );
}
