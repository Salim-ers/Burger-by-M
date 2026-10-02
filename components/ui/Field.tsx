import { cn } from "@/lib/utils";

/** Champs de formulaire : bordure basse, sans arrondi, couleurs du schéma courant. */
const inputBase =
  "w-full rounded-none border-0 border-b-2 border-fg/20 bg-transparent px-0 text-[1.05rem] text-fg outline-none transition-colors placeholder:text-fg/35 focus:border-cheddar focus-visible:outline-none";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, id, className, ...rest }: FieldProps) {
  const fieldId = id ?? rest.name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="kicker text-fg/60">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(inputBase, "h-12", error && "border-danger")}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-fg/50">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

interface AreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, className, ...rest }: AreaProps) {
  const fieldId = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="kicker text-fg/60">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(inputBase, "min-h-28 resize-y border-2 px-3 py-3", error && "border-danger")}
        {...rest}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ label, className, ...rest }: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 text-sm", className)}>
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 rounded-none accent-cheddar" {...rest} />
      <span className="leading-snug text-fg/75">{label}</span>
    </label>
  );
}
