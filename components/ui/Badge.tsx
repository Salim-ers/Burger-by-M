import { cn } from "@/lib/utils";

type Tone = "accent" | "line" | "muted" | "danger" | "success" | "ink";

const tones: Record<Tone, string> = {
  accent: "bg-fg text-canvas",
  line: "border border-current/30",
  muted: "bg-fg/8 text-fg/75",
  danger: "bg-danger/12 text-danger",
  success: "bg-success/12 text-success",
  ink: "bg-ink text-white",
};

export function Badge({ tone = "muted", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[0.7rem] font-semibold whitespace-nowrap", tones[tone], className)}>{children}</span>
  );
}
