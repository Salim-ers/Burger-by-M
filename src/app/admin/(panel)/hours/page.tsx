import { asc, gte } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as t from "@/db/schema";
import { requireStaffPage } from "@/lib/auth/guard";
import { parisParts } from "@/lib/schedule";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { PageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Horaires" };

export default async function HoursPage() {
  await requireStaffPage("owner");
  const db = getDb();
  const today = parisParts(new Date()).ymd;
  const [weekly, specials] = await Promise.all([
    db.select().from(t.openingHours).orderBy(asc(t.openingHours.dayOfWeek), asc(t.openingHours.opensAt)),
    db.select().from(t.specialOpeningHours).where(gte(t.specialOpeningHours.date, today)).orderBy(asc(t.specialOpeningHours.date), asc(t.specialOpeningHours.opensAt)),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader kicker="Restaurant" title="Horaires" />
      <HoursEditor
        weekly={weekly.map((w) => ({ dayOfWeek: w.dayOfWeek, opensAt: w.opensAt, closesAt: w.closesAt }))}
        specials={specials.map((s) => ({ id: s.id, date: s.date, isClosed: s.isClosed, opensAt: s.opensAt, closesAt: s.closesAt, note: s.note }))}
        today={today}
      />
    </div>
  );
}
