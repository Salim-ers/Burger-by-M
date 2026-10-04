/** Usage : npm run db:seed */
import "../../../scripts/load-env";
import { closeDb, getDb } from "../client";
import { seedDatabase } from "./seed";

async function main() {
  const db = getDb();
  await seedDatabase(db);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
