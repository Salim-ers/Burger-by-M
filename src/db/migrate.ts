/**
 * Applique les migrations SQL (src/db/migrations) sur DATABASE_URL.
 * Usage : npm run db:migrate
 */
import "../../scripts/load-env";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDb, getDb } from "./client";

async function main() {
  const db = getDb();
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations appliquées.");
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
