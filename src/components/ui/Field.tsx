import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xs border border-rule bg-panel px-4 text-[1rem] text-fg outline-none transition-colors placeholder:text-sub/70 focus:border-fg focus-visible:outline-none aria-[invalid=true]:border-danger";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, id, className, required, ...rest }: FieldProps) {
  const fid = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fid} className="text-[0.82rem] font-semibold">
        {label}
        {required && <span className="text-sub"> *</span>}
      </label>
      <input id={fid} required={required} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined} className={cn(base, "h-12")} {...rest} />
      {hint && !error && (
        <p id={`${fid}-hint`} className="text-xs text-sub">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fid}-err`} className="text-xs font-semibold text-danger">
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
  const fid = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fid} className="text-[0.82rem] font-semibold">
        {label}
      </label>
      <textarea id={fid} aria-invalid={Boolean(error) || undefined} className={cn(base, "min-h-24 resize-y py-3")} {...rest} />
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled, className }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("flex w-full items-center justify-between gap-4 text-left disabled:opacity-40", className)}
    >
      <span>
        <span className="block font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-sub">{description}</span>}
      </span>
      <span aria-hidden className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-open" : "bg-fg/20")}>
        <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform duration-200", checked && "translate-x-5")} />
      </span>
    </button>
  );
}
