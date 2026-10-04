"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Field } from "@/components/ui/Field";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email: email.trim(), password, rememberMe: true });
    if (err) {
      setPending(false);
      setPassword("");
      setError(err.status === 429 ? "Trop de tentatives. Réessayez dans quelques minutes." : "Email ou mot de passe incorrect.");
      return;
    }
    router.replace(next);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#f08a7e]">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="flex h-14 w-full items-center justify-center bg-ivory text-[0.75rem] font-bold tracking-[0.2em] text-ink uppercase transition-colors hover:bg-paper disabled:opacity-50">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="pt-2 text-xs leading-relaxed text-sub">Les comptes sont créés par le gérant (commande « npm run admin:create »). Mot de passe oublié : contactez le gérant.</p>
    </form>
  );
}
