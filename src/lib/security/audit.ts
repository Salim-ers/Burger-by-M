import type { Db } from "@/db/client";
import { auditLogs } from "@/db/schema";

export interface AuditActor {
  userId: string | null;
  email: string | null;
  ip?: string | null;
}

/** Trace une action sensible (statut, remboursement, carte, réglages…). Ne doit jamais faire échouer l'action. */
export async function audit(db: Db, actor: AuditActor | null, action: string, entityType: string, entityId: string | null, data?: Record<string, unknown>) {
  try {
    await db.insert(auditLogs).values({
      actorUserId: actor?.userId ?? null,
      actorEmail: actor?.email ?? null,
      ipAddress: actor?.ip ?? null,
      action,
      entityType,
      entityId,
      data: data ?? null,
    });
  } catch (err) {
    console.error("[audit] écriture impossible", action, err);
  }
}
