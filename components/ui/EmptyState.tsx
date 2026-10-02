import { ButtonLink } from "./Button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  text?: string;
  action?: { href: string; label: string };
  className?: string;
}

export function EmptyState({ title, text, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
      {text && <p className="mt-3 max-w-sm text-fg/65">{text}</p>}
      {action && (
        <ButtonLink href={action.href} variant="primary" size="lg" className="mt-8">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
