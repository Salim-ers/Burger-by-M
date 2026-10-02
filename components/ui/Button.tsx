import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "cream" | "rose" | "ink" | "outline-light" | "outline-dark" | "ghost-light" | "ghost-dark";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  cream: "bg-cream text-ink hover:bg-ivory",
  rose: "bg-rose text-ink hover:bg-[#f6d0cc]",
  ink: "bg-ink text-cream hover:bg-ink-soft",
  "outline-light": "border border-cream/35 text-cream hover:border-cream hover:bg-cream/5",
  "outline-dark": "border border-ink/25 text-ink hover:border-ink hover:bg-ink/5",
  "ghost-light": "text-cream/80 hover:text-cream",
  "ghost-dark": "text-ink/70 hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-11 px-5 text-[0.72rem]",
  md: "h-12 px-6 text-[0.76rem]",
  lg: "h-14 px-8 text-[0.8rem]",
  xl: "h-16 px-9 text-[0.85rem] md:h-20 md:px-12 md:text-[0.95rem]",
};

export function buttonClasses(variant: ButtonVariant = "cream", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-3 whitespace-nowrap rounded-full font-sans font-bold uppercase tracking-[0.12em]",
    "transition-[background-color,color,border-color,opacity] duration-300 ease-out-expo",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      className={cn("size-4 shrink-0 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1", className)}
    />
  );
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean; className?: string; children: React.ReactNode };

export function Button({ variant, size, arrow, className, children, type = "button", ...rest }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({ variant, size, arrow, className, children, href, ...rest }: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  const cls = buttonClasses(variant, size, className);
  if (external) {
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
        {arrow && <Arrow />}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
