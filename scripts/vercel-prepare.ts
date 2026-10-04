/**
 * Étape préalable au build Vercel (script « vercel-build » du package.json).
 *
 * En production (VERCEL_ENV=production) :
 *  1. vérifie la configuration (variables obligatoires, formats) — si elle est incomplète, le build
 *     échoue : Vercel garde alors le déploiement précédent en ligne au lieu de publier un site en erreur ;
 *  2. applique les migrations SQL (connexion directe Neon si disponible) ;
 *  3. insère la carte initiale si la base est vide (sans effet ensuite : l'admin reste maître de la carte).
 *
 * Aperçus (preview) et builds locaux : rien n'est vérifié ni migré, seul `next build` s'exécute.
 */
import "./load-env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { seedDatabase } from "../src/db/seed/seed";
import { env } from "../src/lib/env";

async function main() {
  if (process.env.VERCEL_ENV !== "production") {
    console.log(`[vercel-prepare] environnement « ${process.env.VERCEL_ENV ?? "local"} » : ni vérification ni migration.`);
    return;
  }

  // 1. Configuration (lève une erreur lisible listant les variables manquantes ou invalides).
  const e = env();
  for (const key of ["BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL"] as const) {
    if (!e[key].startsWith("https://")) throw new Error(`${key} doit être l’URL publique en https:// (reçu : ${e[key]}).`);
  }
  if (!e.STRIPE_SECRET_KEY) console.warn("[vercel-prepare] Stripe non configuré : seul le paiement au retrait sera proposé.");
  if (!e.VAPID_PUBLIC_KEY) console.warn("[vercel-prepare] VAPID non configuré : pas de notifications push (rafraîchissement automatique de l’écran cuisine).");

  // 2. Migrations : connexion directe (non « pooled ») recommandée par Neon pour le DDL.
  const url = process.env.DATABASE_URL_UNPOOLED || e.DATABASE_URL;
  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 15_000 });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("[vercel-prepare] migrations appliquées.");

    // 3. Carte initiale (uniquement sur une base vide).
    const r = await seedDatabase(db, { log: (m) => console.log(`[vercel-prepare] ${m}`) });
    if (r.seeded) console.log("[vercel-prepare] carte initiale insérée. Créez le compte gérant : npm run admin:create -- --email … --role owner");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`\n[vercel-prepare] BUILD INTERROMPU — ${err instanceof Error ? err.message : String(err)}\n`);
  console.error("Le déploiement en ligne n’est pas remplacé. Voir README § 4 (variables Vercel, base Neon).\n");
  process.exit(1);
});
