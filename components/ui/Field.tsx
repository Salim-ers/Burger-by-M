import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-md border border-fg/15 bg-raised px-4 text-base text-fg outline-none transition-colors placeholder:text-fg/40 focus:border-fg focus-visible:outline-none";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, id, className, required, ...rest }: FieldProps) {
  const fieldId = id ?? rest.name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
        {required && <span className="text-muted"> *</span>}
      </label>
      <input id={fieldId} required={required} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} className={cn(inputBase, "h-12", error && "border-danger")} {...rest} />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-fg/55">
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
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
      </label>
      <textarea id={fieldId} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${fieldId}-error` : undefined} className={cn(inputBase, "min-h-24 resize-y py-3", error && "border-danger")} {...rest} />
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
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-ink" {...rest} />
      <span className="leading-snug text-fg/75">{label}</span>
    </label>
  );
}
