import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Boutons rectangulaires, capitales espacées.
 * ink : noir plein · ivory : ivoire plein · line : contour · brass : laiton · ghost : texte souligné.
 */
export type ButtonVariant = "ink" | "ivory" | "line" | "brass" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  ink: "bg-ink text-ivory hover:bg-ink-soft",
  ivory: "bg-ivory text-ink hover:bg-paper",
  line: "border border-current/30 text-current hover:border-current",
  brass: "bg-brass text-ink hover:bg-[#d4b67e]",
  ghost: "px-0! text-current underline decoration-current/30 underline-offset-[6px] hover:decoration-current",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.68rem]",
  md: "h-12 px-6 text-[0.72rem]",
  lg: "h-14 px-8 text-[0.75rem]",
  xl: "h-16 px-10 text-[0.8rem]",
};

export function buttonClasses(variant: ButtonVariant = "ink", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-3 whitespace-nowrap rounded-xs font-sans font-bold uppercase tracking-[0.2em]",
    "transition-[background-color,color,border-color,opacity,transform] duration-300 ease-out-expo active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Arrow({ className }: { className?: string }) {
  return <ArrowRight aria-hidden className={cn("size-4 shrink-0 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1", className)} strokeWidth={1.75} />;
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
