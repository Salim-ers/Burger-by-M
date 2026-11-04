import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Boutons arrondis, les mêmes que sur l'accueil. Le cheddar signale l'interaction (survol, action principale).
 * ink : noir plein · ivory : crème plein · line : contour · cheddar : action principale · ghost : texte souligné.
 */
export type ButtonVariant = "ink" | "ivory" | "line" | "cheddar" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  ink: "bg-ink text-cream hover:bg-cheddar hover:text-ink",
  ivory: "bg-cream text-ink hover:bg-cheddar",
  line: "border border-current/30 text-current hover:border-current",
  cheddar: "bg-cheddar text-ink hover:bg-cream",
  ghost: "px-0! text-current underline decoration-current/30 underline-offset-[6px] hover:decoration-current",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4",
  md: "h-12 px-6",
  lg: "h-14 px-8",
  xl: "h-16 px-10",
};

export function buttonClasses(variant: ButtonVariant = "ink", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-3 whitespace-nowrap rounded-full t-btn",
    "transition-[background-color,color,border-color,opacity,transform] duration-300 ease-food active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Arrow({ className }: { className?: string }) {
  return <ArrowRight aria-hidden className={cn("size-4 shrink-0 transition-transform duration-300 ease-food group-hover/btn:translate-x-1", className)} strokeWidth={1.75} />;
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
  const cls = buttonClasses(variant, size, className);
  if (/^(https?:|tel:|mailto:)/.test(href)) {
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
