import { getDb } from "@/db/client";
import { requireStaffPage } from "@/lib/auth/guard";
import { stripeConfigured } from "@/lib/env";
import { loadSettings } from "@/features/store/load";
import { OperationalControls } from "@/components/admin/OperationalControls";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Réglages" };

export default async function SettingsPage() {
  await requireStaffPage("owner");
  const s = await loadSettings(getDb());
  return (
    <div className="space-y-8">
      <PageHeader kicker="Restaurant" title="Réglages" />
      <OperationalControls onlineOrderingEnabled={s.onlineOrderingEnabled} busyMode={s.busyMode} busyExtraMinutes={s.busyExtraMinutes} />
      <SettingsForm
        stripeReady={stripeConfigured()}
        initial={{
          name: s.name,
          street: s.street,
          postalCode: s.postalCode,
          city: s.city,
          phone: s.phone,
          email: s.email,
          pickupEnabled: s.pickupEnabled,
          deliveryEnabled: false,
          cardPaymentEnabled: s.cardPaymentEnabled,
          onSitePaymentEnabled: s.onSitePaymentEnabled,
          prepMinutes: s.prepMinutes,
          busyExtraMinutes: s.busyExtraMinutes,
          slotIntervalMinutes: s.slotIntervalMinutes,
          maxOrdersPerSlot: s.maxOrdersPerSlot,
          scheduleDaysAhead: s.scheduleDaysAhead,
          minOrderCents: s.minOrderCents,
          deliveryFeeCents: s.deliveryFeeCents,
          orderNotesEnabled: s.orderNotesEnabled,
          googleReviewsUrl: s.googleReviewsUrl,
          instagramUrl: s.instagramUrl,
          facebookUrl: s.facebookUrl,
        }}
      />
    </div>
  );
}
