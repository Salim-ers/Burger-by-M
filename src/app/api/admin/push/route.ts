import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { pushSubscriptions } from "@/db/schema";
import { AuthError, requireStaff } from "@/lib/auth/guard";
import { env, pushConfigured } from "@/lib/env";
import { json, readJson, sameOrigin } from "@/lib/security/http";
import { notifyStaff } from "@/lib/notifications/push";

export const dynamic = "force-dynamic";

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({ p256dh: z.string().min(10).max(300), auth: z.string().min(5).max(100) }),
});

async function staff() {
  try {
    return await requireStaff();
  } catch (err) {
    throw json({ error: (err as Error).message }, err instanceof AuthError ? err.status : 401);
  }
}

/** Clé publique VAPID pour l'abonnement du navigateur. */
export async function GET() {
  try {
    await staff();
  } catch (res) {
    return res as Response;
  }
  return json({ enabled: pushConfigured(), publicKey: pushConfigured() ? env().VAPID_PUBLIC_KEY : null });
}

/** Enregistre l'abonnement push de cet appareil. `?test=1` envoie une notification d'essai. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  let user;
  try {
    user = await staff();
  } catch (res) {
    return res as Response;
  }
  const db = getDb();
  if (new URL(req.url).searchParams.get("test") === "1") {
    const r = await notifyStaff(db, { title: "Burger By M", body: "Notifications actives sur cet appareil.", url: "/admin/cuisine", tag: "test" });
    return json(r);
  }
  const parsed = subscriptionSchema.safeParse(await readJson(req, 4_000).catch(() => null));
  if (!parsed.success) return json({ error: "Abonnement invalide." }, 422);
  const { endpoint, keys } = parsed.data;
  await db
    .insert(pushSubscriptions)
    .values({ userId: user.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? null })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId: user.userId, p256dh: keys.p256dh, auth: keys.auth, failureCount: 0 } });
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  try {
    await staff();
  } catch (res) {
    return res as Response;
  }
  const body = (await readJson(req, 2_000).catch(() => null)) as { endpoint?: string } | null;
  if (body?.endpoint) await getDb().delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, body.endpoint));
  return json({ ok: true });
}
