import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "@/lib/env";

/**
 * Accès PostgreSQL (Neon en production, via la chaîne de connexion « pooled »).
 * Le pool est créé à la première requête : le build Next.js ne se connecte jamais.
 */
export type Database = NodePgDatabase<typeof schema>;
/** Type commun à node-postgres (app) et PGlite (tests) : les services acceptent l'un ou l'autre, ou une transaction. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = PgDatabase<any, typeof schema>;

const globalForDb = globalThis as unknown as { __bymPool?: Pool; __bymDb?: Database };

export function getDb(): Database {
  if (globalForDb.__bymDb) return globalForDb.__bymDb;
  const e = env();
  const pool = new Pool({
    connectionString: e.DATABASE_URL,
    max: e.DATABASE_POOL_MAX,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  // Une connexion inactive coupée par le serveur ne doit pas faire tomber le processus.
  pool.on("error", (err) => console.error("[db] erreur de connexion inactive", err.message));
  const db = drizzle(pool, { schema });
  globalForDb.__bymPool = pool;
  globalForDb.__bymDb = db;
  return db;
}

/** Ferme le pool (scripts CLI). */
export async function closeDb() {
  await globalForDb.__bymPool?.end();
  globalForDb.__bymPool = undefined;
  globalForDb.__bymDb = undefined;
}

export { schema };
