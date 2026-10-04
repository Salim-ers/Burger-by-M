import Link from "next/link";
import { getDb } from "@/db/client";
import { getStaffSession } from "@/lib/auth/guard";
import { env, paymentsConfigured, pushConfigured } from "@/lib/env";
import { kitchenOrders, todayStats } from "@/features/orders/service";
import { loadSettings, effectivePrepMinutes } from "@/features/store/load";
import { OperationalControls } from "@/components/admin/OperationalControls";
import { OrderStatusBadge, PageHeader, Panel, PaymentBadge, adminButton } from "@/components/admin/primitives";
import { formatPrice } from "@/lib/money";
import { formatParisTime } from "@/lib/schedule";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ forbidden?: string }> }) {
  const db = getDb();
  const [{ forbidden }, user, stats, settings, active] = await Promise.all([searchParams, getStaffSession(), todayStats(db), loadSettings(db), kitchenOrders(db)]);
  const upcoming = active.filter((o) => o.orderStatus !== "completed").slice(0, 8);
  const prep = effectivePrepMinutes(settings);
  const appUrl = env().NEXT_PUBLIC_APP_URL ?? "";
  const webhookReachable = /^https:\/\//.test(appUrl) && !/localhost|127\.0\.0\.1/.test(appUrl);
  const warnings = [
    settings.prepMinutes === null && "Temps de préparation non configuré : la commande en ligne reste fermée tant qu’il n’est pas réglé.",
    !paymentsConfigured() && "Paiement en ligne indisponible : MOLLIE_API_KEY non configurée (paiement au retrait uniquement).",
    paymentsConfigured() && !webhookReachable && "Webhook Mollie inactif (adresse du site non publique) : les paiements sont relus au retour du client et par la page de suivi.",
    !settings.cardPaymentEnabled && !settings.onSitePaymentEnabled && "Aucun moyen de paiement activé : les clients ne peuvent pas commander.",
    !pushConfigured() && "Notifications push désactivées : clés VAPID non configurées (l’écran cuisine se met à jour automatiquement).",
    !env().RESEND_API_KEY && "Email de confirmation désactivé : RESEND_API_KEY non configurée.",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <PageHeader kicker={`Bonjour ${user?.name ?? ""}`} title="Tableau de bord">
        <Link href="/admin/cuisine" className={adminButton("cheddar", "lg")}>
          Écran cuisine
        </Link>
      </PageHeader>

      {forbidden && <p className="border border-[#f08a7e]/50 px-4 py-3 text-sm text-[#f08a7e]">Cette page est réservée au gérant.</p>}

      <OperationalControls onlineOrderingEnabled={settings.onlineOrderingEnabled} busyMode={settings.busyMode} prepMinutes={settings.prepMinutes} rushPrepMinutes={settings.rushPrepMinutes} canConfigure={user?.role === "owner"} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Commandes du jour", String(stats.orders)],
          ["Chiffre du jour", formatPrice(stats.revenueCents)],
          ["En cours", String(stats.new + stats.preparing + stats.ready)],
          ["Préparation annoncée", prep === null ? "Non réglée" : `${prep} min${settings.busyMode ? " · coup de feu" : ""}`],
        ].map(([label, value]) => (
          <div key={label} className="border border-rule bg-panel p-5">
            <p className="t-label text-sub">{label}</p>
            <p className="mt-3 font-display text-[clamp(1.8rem,2.4vw,2.5rem)] leading-none whitespace-nowrap tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Prochaines commandes"
          className="xl:col-span-2"
          actions={
            <Link href="/admin/orders" className="text-xs font-semibold text-sub hover:text-fg">
              Toutes les commandes →
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sub">Aucune commande en cours.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {upcoming.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.orderNumber}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 hover:bg-fg/[0.03]">
                    <span className="t-s w-16 tabular-nums">{formatParisTime(o.requestedTime)}</span>
                    <span className="font-semibold">{o.orderNumber}</span>
                    <span className="text-sub">{o.customerFirstName} {o.customerLastName.charAt(0)}.</span>
                    <span className="ml-auto flex items-center gap-2">
                      <PaymentBadge status={o.paymentStatus} />
                      <OrderStatusBadge status={o.orderStatus} />
                      <span className="w-20 text-right tabular-nums">{formatPrice(o.totalCents)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="État du service">
          {warnings.length === 0 ? (
            <p className="text-sm text-[#7fd1a5]">Tout est configuré : paiement en ligne, notifications et emails actifs.</p>
          ) : (
            <ul className="space-y-3 text-sm text-fg/80">
              {warnings.map((w) => (
                <li key={w} className="border-l-2 border-cheddar pl-3">
                  {w}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
