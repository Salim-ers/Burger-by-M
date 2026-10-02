import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * primary : cheddar → blanc au survol (CTA de conversion)
 * light / dark : aplats bone / noir
 * outline : bordure dans la couleur du schéma (text-fg), s'inverse au survol
 * ghost : texte seul
 */
export type ButtonVariant = "primary" | "light" | "dark" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-cheddar text-ink hover:bg-bone",
  light: "bg-bone text-ink hover:bg-cheddar",
  dark: "bg-ink text-bone hover:bg-cheddar hover:text-ink",
  outline: "border border-fg/35 text-fg hover:border-fg hover:bg-fg hover:text-canvas",
  ghost: "px-0! text-fg/75 hover:text-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.95rem]",
  md: "h-12 px-5 text-[1.05rem]",
  lg: "h-14 px-7 text-[1.15rem]",
  xl: "h-16 px-8 text-[1.3rem] md:h-20 md:px-10 md:text-[1.6rem]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-3 whitespace-nowrap rounded-sm font-display uppercase leading-none tracking-[0.03em]",
    "transition-[background-color,color,border-color,opacity] duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-35 aria-disabled:pointer-events-none aria-disabled:opacity-35",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      strokeWidth={2.25}
      className={cn("size-[1.05em] shrink-0 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1.5", className)}
    />
  );
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean; className?: string; children: React.ReactNode };

export function Button({ variant, size, arrow, className, children, type = "button", ...rest }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} data-cursor="go" className={buttonClasses(variant, size, className)} {...rest}>
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
      <a href={href} data-cursor="go" className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
        {arrow && <Arrow />}
      </a>
    );
  }
  return (
    <Link href={href} data-cursor="go" className={cls} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
