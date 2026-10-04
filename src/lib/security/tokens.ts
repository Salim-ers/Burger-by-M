import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Jeton d'accès au suivi de commande : aléatoire, seul son hash est stocké. */
export function newAccessToken() {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(token: string | null | undefined, hash: string) {
  if (!token || token.length > 100) return false;
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
