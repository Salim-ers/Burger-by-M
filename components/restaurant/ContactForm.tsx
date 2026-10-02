"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Field, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { restaurant } from "@/data/restaurant";

/**
 * Formulaire de contact — FRONT UNIQUEMENT.
 * TODO_BACKEND : brancher un endpoint (route handler + service email) avec anti-spam et rate limiting.
 */
export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (values.website) return; // pot de miel anti-robots
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document.getElementById(`c-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setSent(true);
  };

  if (sent) {
    return (
      <div role="status" className="border-2 border-ink p-6 md:p-8">
        <CheckCircle2 className="size-8 text-cheddar-deep" aria-hidden />
        <p className="mt-4 font-display text-d4">Merci {values.name.split(" ")[0]}.</p>
        <p className="mt-3 text-ink/70">
          Ton message est prêt. En mode démonstration, il n’est pas encore transmis : pour une réponse rapide, appelle-nous au{" "}
          <a href={restaurant.phone.href} className="font-semibold underline">
            {restaurant.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
      <Field label="Nom" id="c-name" name="name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
      <Field label="Email" id="c-email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
      <Field label="Téléphone (facultatif)" id="c-phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} error={errors.phone} className="sm:col-span-2" />
      <TextArea label="Message" id="c-message" name="message" rows={6} value={values.message} onChange={set("message")} error={errors.message} className="sm:col-span-2" />
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="c-website">Ne pas remplir</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="dark" size="lg" arrow>
          Envoyer
        </Button>
      </div>
    </form>
  );
}
