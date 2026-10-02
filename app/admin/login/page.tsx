"use client";

/*
 * ============================================================
 *  DEMO AUTH ONLY — DO NOT USE IN PRODUCTION
 *  Aucune vérification d'identité : n'importe quel email/mot de passe
 *  (4 caractères min.) ouvre le back-office de démonstration.
 *  Production : authentification serveur (Supabase Auth, NextAuth…),
 *  mots de passe hachés, cookies httpOnly, middleware de protection,
 *  rate limiting et journalisation.
 * ============================================================
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/admin-store";
import { loginSchema, fieldErrors } from "@/lib/validation";

export default function AdminLogin() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const [email, setEmail] = useState("demo@burgerbym.fr");
  const [password, setPassword] = useState("demo");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    login(parsed.data.email);
    router.push("/admin/dashboard");
  };

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Logo size={72} priority />
        <h1 className="mt-8 font-display text-5xl uppercase">Back-office</h1>
        <Badge tone="cheddar" className="mt-4">
          Mode démonstration
        </Badge>
        <p className="mt-4 text-sm leading-relaxed text-cream/60">
          Connexion fictive pour la démonstration : les identifiants pré-remplis suffisent. Aucune donnée n’est envoyée.
        </p>
        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <Field label="Email" id="email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <Field label="Mot de passe" id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <Button type="submit" variant="rose" size="lg" arrow className="w-full">
            Entrer
          </Button>
        </form>
      </div>
    </main>
  );
}
