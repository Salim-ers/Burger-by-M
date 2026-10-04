import { z } from "zod";

/**
 * Variables d'environnement serveur, validées à la première lecture (jamais au build).
 * Aucune valeur secrète ne doit être préfixée NEXT_PUBLIC_.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL manquante"),
  /** Taille du pool Postgres. 1 en local avec PGlite (connexion unique). */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET : 32 caractères minimum"),
  BETTER_AUTH_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  /** Clé API Mollie (test_… ou live_…), côté serveur uniquement. */
  MOLLIE_API_KEY: z
    .string()
    .regex(/^(test|live)_[A-Za-z0-9]{20,}$/, "MOLLIE_API_KEY : clé test_… ou live_… attendue")
    .optional()
    .or(z.literal("")),
  /** Carte : « manual » (autorisation puis capture à l'acceptation, défaut) ou « automatic » (encaissement immédiat). */
  MOLLIE_CARD_CAPTURE: z.enum(["manual", "automatic"]).default("manual"),
  VAPID_PUBLIC_KEY: z.string().optional().or(z.literal("")),
  VAPID_PRIVATE_KEY: z.string().optional().or(z.literal("")),
  VAPID_SUBJECT: z.string().optional().or(z.literal("")),
  RESEND_API_KEY: z.string().optional().or(z.literal("")),
  EMAIL_FROM: z.string().optional().or(z.literal("")),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => {
        const key = i.path.join(".");
        return `  - ${key} : ${process.env[key] === undefined ? "manquante" : i.message}`;
      })
      .join("\n");
    throw new Error(`Configuration invalide (voir .env.example) :\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => process.env.NODE_ENV === "production";

/** Paiement en ligne utilisable (clé Mollie présente). */
export function paymentsConfigured() {
  return Boolean(env().MOLLIE_API_KEY);
}

export function pushConfigured() {
  const e = env();
  return Boolean(e.VAPID_PUBLIC_KEY && e.VAPID_PRIVATE_KEY);
}
