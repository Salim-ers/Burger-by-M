export function PageHeader({ title, text, actions }: { title: string; text?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.9] uppercase">{title}</h1>
        {text && <p className="mt-2 max-w-xl text-sm text-cream/60">{text}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
