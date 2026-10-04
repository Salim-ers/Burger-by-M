/**
 * Charge .env.local puis .env s'ils existent (scripts en ligne de commande).
 * En production (Vercel, CI), les variables viennent de l'environnement : aucun fichier requis.
 * Les variables déjà définies ne sont jamais écrasées.
 */
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  const values = parseEnv(readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(values)) process.env[key] ??= value;
}
