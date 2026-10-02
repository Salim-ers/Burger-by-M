export function PageHeader({ title, text, actions }: { title: string; text?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-edge pb-5">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {text && <p className="mt-2 max-w-xl text-sm text-cream/60">{text}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
