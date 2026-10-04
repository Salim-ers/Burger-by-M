import { defineConfig } from "drizzle-kit";

/** Génération des migrations SQL : npm run db:generate (aucune connexion requise). */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  strict: true,
  verbose: true,
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:54329/postgres" },
});
