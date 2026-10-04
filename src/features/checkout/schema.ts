import { z } from "zod";
import { MAX_ITEM_NOTE, MAX_QUANTITY } from "@/features/menu/pricing";

/** Numéros français : 06 12 34 56 78, 0612345678, +33 6 12 34 56 78… */
export const FR_PHONE = /^(?:(?:\+|00)33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/;

/** Supprime caractères de contrôle et chevrons (le rendu React échappe déjà le HTML). */
const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/[<>]/g, "").replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max));

export const customerSchema = z.object({
  firstName: clean(60).pipe(z.string().min(1, "Indiquez votre prénom.")),
  lastName: clean(80).pipe(z.string().min(1, "Indiquez votre nom.")),
  phone: z.string().trim().regex(FR_PHONE, "Numéro de téléphone français invalide (ex. 06 12 34 56 78)."),
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide.").max(160)),
});

export const lineSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  modifierIds: z.array(z.uuid()).max(40),
  removedIngredientIds: z.array(z.uuid()).max(20),
  note: z.string().max(MAX_ITEM_NOTE).optional(),
});

export const checkoutInputSchema = z.object({
  /** Généré par le navigateur à l'ouverture du checkout : une double soumission renvoie la même commande. */
  idempotencyKey: z.uuid(),
  lines: z.array(lineSchema).min(1, "Votre panier est vide.").max(40),
  customer: customerSchema,
  fulfillment: z.literal("pickup"),
  pickup: z.discriminatedUnion("mode", [z.object({ mode: z.literal("asap") }), z.object({ mode: z.literal("scheduled"), slotStart: z.iso.datetime() })]),
  paymentMethod: z.enum(["card", "on_site"]),
  notes: clean(300).optional(),
  /** Total affiché au client (contrôle de cohérence uniquement, jamais utilisé comme montant). */
  expectedTotalCents: z.number().int().min(0).max(1_000_000).optional(),
  acceptTerms: z.literal(true, { error: "Veuillez accepter les conditions générales de vente." }),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

/** Erreurs de champ « chemin → message » pour le formulaire. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
