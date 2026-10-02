import { BurgerLineArt } from "./LineArt";
import { ButtonLink } from "./Button";
import { cn } from "@/lib/utils";

interface Props {
  lines: string[];
  text?: string;
  action?: { href: string; label: string };
  art?: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}

export function EmptyState({ lines, text, action, art, tone = "dark", className }: Props) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-20 text-center", className)}>
      <div className={cn("mb-8 w-36", tone === "dark" ? "text-rose" : "text-brown")}>{art ?? <BurgerLineArt />}</div>
      <h2 className="font-display text-huge uppercase">
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </h2>
      {text && <p className="mt-6 max-w-md text-base opacity-70">{text}</p>}
      {action && (
        <ButtonLink href={action.href} variant={tone === "dark" ? "cream" : "ink"} size="lg" arrow className="mt-10">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
