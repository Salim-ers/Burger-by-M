import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * primary : aplat de la couleur du texte (noir sur fond clair, crème sur fond sombre)
 * light / dark : blanc / noir quel que soit le fond
 * outline : contour discret · ghost : texte seul
 */
export type ButtonVariant = "primary" | "light" | "dark" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-fg text-canvas hover:opacity-85",
  light: "bg-white text-ink hover:bg-cream",
  dark: "bg-ink text-white hover:bg-coal",
  outline: "border border-fg/20 bg-transparent text-fg hover:border-fg/60",
  ghost: "text-fg/75 hover:text-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.78rem]",
  md: "h-12 px-6 text-[0.82rem]",
  lg: "h-14 px-7 text-[0.88rem]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/btn inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold tracking-[0.06em] uppercase",
    "transition-[background-color,color,border-color,opacity,transform] duration-200 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-35 aria-disabled:pointer-events-none aria-disabled:opacity-35",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Arrow({ className }: { className?: string }) {
  return <ArrowRight aria-hidden className={cn("size-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5", className)} />;
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
