/**
 * Crée (ou réinitialise) un compte de l'équipe. Aucun compte n'est codé en dur dans l'application.
 *
 *   npm run admin:create -- --email gerant@burgerbym.fr --name "Gérant" --role owner
 *   (le mot de passe est demandé de façon masquée, ou fourni via ADMIN_PASSWORD)
 */
import "./load-env";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { closeDb, getDb } from "../src/db/client";
import { account, user } from "../src/db/schema";

const { values } = parseArgs({
  options: { email: { type: "string" }, name: { type: "string" }, role: { type: "string", default: "staff" } },
});

async function askHidden(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
  let muted = false;
  out._writeToOutput = (s: string) => (muted ? out.output.write("*") : out.output.write(s));
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = values.email?.trim().toLowerCase();
  const role = values.role === "owner" ? "owner" : "staff";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("--email requis");
  const password = process.env.ADMIN_PASSWORD ?? (await askHidden("Mot de passe (12 caractères minimum) : "));
  if (password.length < 12) throw new Error("Mot de passe trop court (12 caractères minimum).");

  const db = getDb();
  const hash = await hashPassword(password);
  const [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (existing) {
    await db.update(user).set({ role, name: values.name ?? existing.name, updatedAt: new Date() }).where(eq(user.id, existing.id));
    const [acc] = await db.select().from(account).where(and(eq(account.userId, existing.id), eq(account.providerId, "credential"))).limit(1);
    if (acc) await db.update(account).set({ password: hash, updatedAt: new Date() }).where(eq(account.id, acc.id));
    else await db.insert(account).values({ id: randomUUID(), accountId: existing.id, providerId: "credential", userId: existing.id, password: hash });
    console.log(`Compte mis à jour : ${email} (${role})`);
  } else {
    const id = randomUUID();
    await db.insert(user).values({ id, email, name: values.name ?? email.split("@")[0]!, emailVerified: true, role });
    await db.insert(account).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash });
    console.log(`Compte créé : ${email} (${role})`);
  }
  await closeDb();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
