import { Marquee } from "@/components/motion/Marquee";
import { cn } from "@/lib/utils";

/** 06 — Grandes bandes typographiques (vitesse liée au scroll). */
export function MarqueeBand({ items, tone, tilt = 0, direction = 1, className }: { items: string[]; tone: "light" | "dark"; tilt?: number; direction?: 1 | -1; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden py-[3vw]", className)}>
      <div
        className={cn("border-y-2 py-[0.9vw]", tone === "light" ? "border-ink bg-bone text-ink" : "border-bone/20 bg-ink text-bone")}
        style={{ transform: tilt ? `rotate(${tilt}deg) scale(1.04)` : undefined }}
      >
        <Marquee items={items} direction={direction} speed={2.6} className="font-display text-[clamp(3.4rem,11vw,11rem)] leading-[0.95] uppercase" />
      </div>
    </div>
  );
}
