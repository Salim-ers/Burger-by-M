import { z } from "zod";

const frPhone = /^(?:(?:\+|00)33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/;

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Indique ton prénom.").max(60, "60 caractères maximum."),
  lastName: z.string().trim().min(1, "Indique ton nom.").max(80, "80 caractères maximum."),
  phone: z.string().trim().regex(frPhone, "Numéro de téléphone français invalide (ex. 06 12 34 56 78)."),
  email: z.string().trim().pipe(z.email("Adresse email invalide.")),
  marketingOptIn: z.boolean(),
  notes: z.string().max(300, "300 caractères maximum.").optional(),
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Indique ton nom.").max(80),
  email: z.string().trim().pipe(z.email("Adresse email invalide.")),
  phone: z.string().trim().refine((v) => v === "" || frPhone.test(v), "Numéro invalide.").optional(),
  message: z.string().trim().min(10, "Ton message doit faire au moins 10 caractères.").max(1500),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email("Adresse email invalide.")),
  password: z.string().min(4, "4 caractères minimum (démo)."),
});

export const promotionSchema = z.object({
  code: z.string().trim().min(3, "3 caractères minimum.").max(20).regex(/^[A-Z0-9-]+$/, "Majuscules, chiffres et tirets uniquement."),
  name: z.string().trim().min(2, "Nom requis.").max(60),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive("Valeur positive requise."),
  startsAt: z.string().min(1, "Date de début requise."),
  endsAt: z.string().min(1, "Date de fin requise."),
  minimumOrder: z.number().min(0),
  active: z.boolean(),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Nom requis.").max(60),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, "Minuscules, chiffres et tirets uniquement."),
  description: z.string().trim().max(300),
  price: z.number().int().min(0).nullable(),
  category: z.string().min(1),
  image: z.string().nullable(),
  badge: z.string().max(20),
  available: z.boolean(),
  popular: z.boolean(),
  vegetarian: z.boolean(),
  spicy: z.boolean(),
});

/** Transforme les erreurs Zod en dictionnaire champ → message. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = issue.path.join(".");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
