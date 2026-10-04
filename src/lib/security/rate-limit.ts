import { sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { appRateLimits } from "@/db/schema";

/**
 * Limiteur de débit à fenêtre fixe stocké en base (partagé entre instances serverless).
 * Une seule requête atomique : INSERT … ON CONFLICT DO UPDATE.
 */
export async function rateLimit(db: Db, key: string, limit: number, windowSeconds: number): Promise<{ ok: boolean; remaining: number }> {
  const rows = await db
    .insert(appRateLimits)
    .values({ key, count: 1, windowStart: new Date() })
    .onConflictDoUpdate({
      target: appRateLimits.key,
      set: {
        count: sql`CASE WHEN ${appRateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE ${appRateLimits.count} + 1 END`,
        windowStart: sql`CASE WHEN ${appRateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE ${appRateLimits.windowStart} END`,
      },
    })
    .returning({ count: appRateLimits.count });
  const count = rows[0]?.count ?? 1;
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}
