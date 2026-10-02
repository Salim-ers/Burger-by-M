import { cn } from "@/lib/utils";

/** Tampon circulaire tournant — reprend la forme ronde du logo. Décoratif. */
export function RotatingStamp({ className, text = "Burger By M · Rantigny · 60290 · Smash · " }: { className?: string; text?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none aspect-square", className)}>
      <svg viewBox="0 0 200 200" className="spin-slow size-full">
        <defs>
          <path id="stamp-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="98" fill="var(--color-ink)" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-cream)" strokeWidth="0.8" />
        <text fill="var(--color-cream)" fontSize="15" letterSpacing="4.2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, textTransform: "uppercase" }}>
          <textPath href="#stamp-circle">{text}</textPath>
        </text>
        <text x="100" y="112" textAnchor="middle" fill="var(--color-rose)" fontSize="34" style={{ fontFamily: "var(--font-display)" }}>
          By M
        </text>
      </svg>
    </div>
  );
}
