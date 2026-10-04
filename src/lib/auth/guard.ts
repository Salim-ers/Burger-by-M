import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./server";
import type { StaffRole } from "@/db/schema";

export interface StaffSession {
  userId: string;
  email: string;
  name: string;
  role: StaffRole;
}

/**
 * Session de l'équipe, vérifiée côté serveur (la vérification du proxy n'est qu'optimiste).
 * Mémorisée le temps d'une requête (layout + page ne relisent pas la base deux fois).
 */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const h = await headers(); // d'abord : marque la page comme dynamique (aucun rendu au build)
  const session = await getAuth().api.getSession({ headers: h });
  if (!session) return null;
  const role = (session.user as { role?: string }).role === "owner" ? "owner" : "staff";
  return { userId: session.user.id, email: session.user.email, name: session.user.name, role };
});

/** Pages du back-office : redirige vers la connexion si nécessaire. */
export async function requireStaffPage(role?: StaffRole): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) redirect("/admin/login");
  if (role === "owner" && s.role !== "owner") redirect("/admin?forbidden=1");
  return s;
}

export class AuthError extends Error {
  constructor(public status: 401 | 403) {
    super(status === 401 ? "Connexion requise." : "Action réservée au gérant.");
  }
}

/** Server Actions et routes API : lève une erreur (jamais de redirection silencieuse). */
export async function requireStaff(role?: StaffRole): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) throw new AuthError(401);
  if (role === "owner" && s.role !== "owner") throw new AuthError(403);
  return s;
}

/** Adresse IP du client (premier élément de x-forwarded-for, posé par l'hébergeur). */
export async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}
