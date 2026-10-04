import "server-only";
import { AuthError } from "@/lib/auth/guard";
import { OrderActionError } from "@/features/orders/service";

/** Résultat d'une Server Action : jamais d'exception brute côté client. */
export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof AuthError || err instanceof OrderActionError || err instanceof UserFacingError) return { ok: false, error: err.message };
    console.error("[admin]", err);
    return { ok: false, error: "Une erreur est survenue. Réessayez." };
  }
}

/** Erreur dont le message peut être affiché tel quel. */
export class UserFacingError extends Error {}
