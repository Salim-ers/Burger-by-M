import { ButtonLink } from "./Button";
import { cn } from "@/lib/utils";

interface Props {
  lines: string[];
  text?: string;
  action?: { href: string; label: string };
  className?: string;
}

/** État vide typographique : le titre fait l'image. */
export function EmptyState({ lines, text, action, className }: Props) {
  return (
    <div className={cn("shell flex flex-col items-start py-20", className)}>
      <h2 className="font-display text-d2 text-fg">
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </h2>
      {text && <p className="mt-6 max-w-md text-base text-fg/65">{text}</p>}
      {action && (
        <ButtonLink href={action.href} variant="primary" size="lg" arrow className="mt-10">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
