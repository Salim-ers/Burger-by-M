import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-sm border bg-transparent px-4 text-base outline-none transition-colors placeholder:opacity-45 focus-visible:outline-2";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  tone?: "light" | "dark";
}

export function Field({ label, error, hint, tone = "dark", id, className, ...rest }: FieldProps) {
  const fieldId = id ?? rest.name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fieldId} className="text-[0.78rem] font-semibold tracking-wide opacity-80">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          inputBase,
          "h-13",
          tone === "dark" ? "border-cream/20 focus:border-rose" : "border-ink/20 focus:border-ink",
          error && "border-danger",
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs opacity-60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className={cn("text-xs font-medium", tone === "dark" ? "text-[#ff9b94]" : "text-[#b3261e]")}>
          {error}
        </p>
      )}
    </div>
  );
}

interface AreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  tone?: "light" | "dark";
}

export function TextArea({ label, error, tone = "dark", id, className, ...rest }: AreaProps) {
  const fieldId = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fieldId} className="text-[0.78rem] font-semibold tracking-wide opacity-80">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          inputBase,
          "min-h-28 py-3",
          tone === "dark" ? "border-cream/20 focus:border-rose" : "border-ink/20 focus:border-ink",
          error && "border-danger",
        )}
        {...rest}
      />
      {error && (
        <p id={`${fieldId}-error`} className={cn("text-xs font-medium", tone === "dark" ? "text-[#ff9b94]" : "text-[#b3261e]")}>
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ label, className, ...rest }: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 text-sm", className)}>
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-rose" {...rest} />
      <span className="leading-snug opacity-85">{label}</span>
    </label>
  );
}
