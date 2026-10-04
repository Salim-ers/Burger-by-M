import "server-only";
import webpush from "web-push";
import { eq, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { pushSubscriptions } from "@/db/schema";
import { env, pushConfigured } from "@/lib/env";

/**
 * Notifications Web Push vers les tablettes / téléphones de l'équipe (PWA installée).
 * Sans clés VAPID, l'envoi est ignoré : l'écran cuisine reste alimenté par le rafraîchissement automatique.
 */
let configured = false;
function setup() {
  if (configured) return true;
  if (!pushConfigured()) return false;
  const e = env();
  webpush.setVapidDetails(e.VAPID_SUBJECT || `mailto:contact@${new URL(e.NEXT_PUBLIC_APP_URL).hostname}`, e.VAPID_PUBLIC_KEY!, e.VAPID_PRIVATE_KEY!);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

export async function notifyStaff(db: Db, payload: PushPayload) {
  if (!setup()) return { sent: 0 };
  const subs = await db.select().from(pushSubscriptions);
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 600, urgency: "high" });
        sent++;
        await db.update(pushSubscriptions).set({ lastSuccessAt: new Date(), failureCount: 0 }).where(eq(pushSubscriptions.id, s.id));
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // 404/410 : l'appareil s'est désabonné → suppression ; sinon on compte les échecs.
        if (status === 404 || status === 410) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
        else await db.update(pushSubscriptions).set({ failureCount: sql`${pushSubscriptions.failureCount} + 1` }).where(eq(pushSubscriptions.id, s.id));
      }
    }),
  );
  return { sent };
}
