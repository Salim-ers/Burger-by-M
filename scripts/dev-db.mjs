/**
 * Base PostgreSQL locale pour le développement et les tests E2E, sans installation :
 * PGlite (Postgres compilé en WebAssembly) exposé sur le protocole Postgres standard.
 * L'application s'y connecte avec le même pilote qu'en production (node-postgres).
 *
 *   npm run db:local              → données persistées dans .data/pglite
 *   npm run db:local -- --memory  → base éphémère
 *
 * Puis : DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres  DATABASE_POOL_MAX=1
 * (PGlite n'a qu'une session : le pool doit être limité à une connexion.)
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { mkdirSync } from "node:fs";

const memory = process.argv.includes("--memory");
const port = Number(process.env.PGLITE_PORT ?? 54329);
if (!memory) mkdirSync(".data", { recursive: true });

const db = new PGlite(memory ? "memory://" : "./.data/pglite");
await db.waitReady;
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 1 });
await server.start();
console.log(`PostgreSQL local (PGlite) prêt : postgres://postgres:postgres@127.0.0.1:${port}/postgres ${memory ? "(mémoire)" : "(.data/pglite)"}`);

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
