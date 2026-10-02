import { cn } from "@/lib/utils";

type Tone = "cheddar" | "line" | "muted" | "danger" | "success" | "ink";

const tones: Record<Tone, string> = {
  cheddar: "bg-cheddar text-ink",
  line: "border border-current/40",
  muted: "bg-fg/10 text-fg/75",
  danger: "bg-danger/15 text-danger",
  success: "bg-success/15 text-success",
  ink: "bg-ink text-bone",
};

/** Étiquette rectangulaire (jamais de pastille ronde). */
export function Badge({ tone = "cheddar", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-5.5 items-center gap-1.5 rounded-xs px-1.5 text-[0.62rem] font-bold tracking-[0.14em] uppercase", tones[tone], className)}>
      {children}
    </span>
  );
}
