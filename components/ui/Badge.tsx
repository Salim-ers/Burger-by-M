import { cn } from "@/lib/utils";

type Tone = "rose" | "cheddar" | "outline-light" | "outline-dark" | "muted" | "danger" | "success";

const tones: Record<Tone, string> = {
  rose: "bg-rose text-ink",
  cheddar: "bg-cheddar text-ink",
  "outline-light": "border border-cream/30 text-cream/85",
  "outline-dark": "border border-ink/25 text-ink/80",
  muted: "bg-cream/10 text-cream/80",
  danger: "bg-danger/15 text-[#ff9b94]",
  success: "bg-success/15 text-success",
};

export function Badge({ tone = "rose", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-xs px-2 text-[0.66rem] font-bold tracking-[0.08em] uppercase", tones[tone], className)}>
      {children}
    </span>
  );
}
