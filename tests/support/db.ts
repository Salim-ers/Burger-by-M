/**
 * Base PostgreSQL de test en mémoire (PGlite) : mêmes migrations SQL et même seed qu'en production.
 */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/db/schema";
import type { Db } from "@/db/client";
import { seedDatabase } from "@/db/seed/seed";

export async function createTestDb({ seed = true } = {}) {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Db;
  await migrate(drizzle(client, { schema }), { migrationsFolder: "./src/db/migrations" });
  if (seed) await seedDatabase(db, { log: () => {} });
  return { db, close: () => client.close() };
}
