import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Menu", href: "/commander" },
  { n: 2, label: "Panier", href: "/panier" },
  { n: 3, label: "Infos", href: "/checkout" },
  { n: 4, label: "Retrait", href: "/checkout#retrait" },
] as const;

/** En-tête noir du tunnel de commande : titre + étapes visibles. */
export function OrderHeader({ title, active, children }: { title: string; active: number[]; children?: React.ReactNode }) {
  const first = Math.min(...active);
  return (
    <header className="scheme-dark bg-ink pt-28 pb-8 md:pt-36 md:pb-10">
      <div className="shell">
        <ol aria-label="Étapes de la commande" className="grid grid-cols-4 gap-1.5">
          {STEPS.map((s) => {
            const current = active.includes(s.n);
            const done = s.n < first;
            return (
              <li key={s.n}>
                <span className={cn("block h-1", current ? "bg-cheddar" : done ? "bg-bone/60" : "bg-bone/15")} />
                {done ? (
                  <Link href={s.href} className="mt-2 flex items-center gap-1.5 font-display text-sm text-bone/70 uppercase hover:text-bone md:text-lg">
                    <Check className="size-3.5" aria-hidden />
                    {s.n}. {s.label}
                  </Link>
                ) : (
                  <span aria-current={current ? "step" : undefined} className={cn("mt-2 block font-display text-sm uppercase md:text-lg", current ? "text-bone" : "text-bone/35")}>
                    {s.n}. {s.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <h1 className="mt-8 font-display text-d2 md:mt-10">{title}</h1>
        {children}
      </div>
    </header>
  );
}
