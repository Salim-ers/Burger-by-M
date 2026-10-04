import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/guard";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo, Wordmark } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Connexion" };

/** N'accepte qu'un chemin interne à l'administration (pas de redirection ouverte). */
function safeNext(next: string | string[] | undefined) {
  const v = typeof next === "string" ? next : "";
  return /^\/admin(\/[\w\-/?=&%.]*)?$/.test(v) && !v.startsWith("/admin/login") ? v : "/admin";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const [{ next }, session] = await Promise.all([searchParams, getStaffSession()]);
  const target = safeNext(next);
  if (session) redirect(target);
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4">
          <Logo size={56} priority />
          <div>
            <Wordmark className="text-xl" />
            <p className="t-label mt-1 text-sub">Administration</p>
          </div>
        </div>
        <h1 className="t-m mt-12">Connexion</h1>
        <p className="mt-2 text-sm text-sub">Accès réservé à l’équipe du restaurant.</p>
        <LoginForm next={target} />
      </div>
    </main>
  );
}
