import { cn } from "@/lib/utils";

/** Bandeau infini 100 % CSS (aucun JS). S'arrête avec prefers-reduced-motion. */
export function Marquee({ items, className, separator }: { items: string[]; className?: string; separator?: React.ReactNode }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span className="px-6 md:px-10">{item}</span>
          {separator ?? <Star />}
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <p className="sr-only">{items.join(", ")}</p>
      <div className="flex w-max animate-marquee motion-reduce:animate-none" aria-hidden>
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="size-[0.45em] shrink-0" aria-hidden>
      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
    </svg>
  );
}
