import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/client";
import * as t from "@/db/schema";
import { env, isProduction } from "@/lib/env";

/**
 * Authentification de l'équipe (Better Auth + PostgreSQL Neon).
 * - email + mot de passe (scrypt), inscription publique désactivée : les comptes sont créés par script ;
 * - sessions en base, cookies httpOnly / secure (production) / sameSite=lax ;
 * - limitation des tentatives de connexion stockée en base (partagée entre instances).
 * Créé à la demande : le build Next.js n'a besoin d'aucune variable d'environnement.
 */
function createAuth() {
  const e = env();
  return betterAuth({
    appName: "Burger By M",
    secret: e.BETTER_AUTH_SECRET,
    baseURL: e.BETTER_AUTH_URL,
    trustedOrigins: [e.NEXT_PUBLIC_APP_URL],
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user: t.user, session: t.session, account: t.account, verification: t.verification, rateLimit: t.rateLimit },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        role: { type: "string", required: false, defaultValue: "staff", input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 14, // 14 jours (tablette cuisine)
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "rateLimit",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 15 * 60, max: 8 },
      },
    },
    advanced: {
      useSecureCookies: isProduction(),
      cookiePrefix: "bym",
      ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
    },
    telemetry: { enabled: false },
  });
}

type Auth = ReturnType<typeof createAuth>;
const g = globalThis as unknown as { __bymAuth?: Auth };

export function getAuth(): Auth {
  g.__bymAuth ??= createAuth();
  return g.__bymAuth;
}
