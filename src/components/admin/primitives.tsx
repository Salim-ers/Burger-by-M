import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * Primitives du back-office sans état ni interaction : utilisables dans les pages serveur
 * comme dans les composants client (les hooks et contrôles interactifs sont dans ./ui).
 */

/* ---------------- Libellés ---------------- */

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  payment_pending: "Paiement en attente",
  new: "Nouvelle",
  preparing: "En préparation",
  ready: "Prête",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échouée",
  refunded: "Remboursée",
  partially_refunded: "Remb. partiel",
  on_site: "À régler au retrait",
};

const ORDER_TONE: Record<OrderStatus, string> = {
  payment_pending: "border-fg/20 text-sub",
  new: "border-rose bg-rose text-ink",
  preparing: "border-brass bg-brass text-ink",
  ready: "border-[#5fb98a] bg-[#5fb98a] text-ink",
  completed: "border-fg/25 text-fg/70",
  cancelled: "border-[#f08a7e]/60 text-[#f08a7e]",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  pending: "border-fg/20 text-sub",
  paid: "border-[#5fb98a]/70 text-[#7fd1a5]",
  failed: "border-[#f08a7e]/60 text-[#f08a7e]",
  refunded: "border-fg/30 text-fg/70",
  partially_refunded: "border-brass/60 text-brass",
  on_site: "border-brass/60 text-brass",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return <span className={cn("inline-flex h-6 items-center border px-2 text-[0.62rem] font-bold tracking-[0.14em] whitespace-nowrap uppercase", ORDER_TONE[status], className)}>{ORDER_STATUS_LABEL[status]}</span>;
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return <span className={cn("inline-flex h-6 items-center border px-2 text-[0.62rem] font-bold tracking-[0.14em] whitespace-nowrap uppercase", PAYMENT_TONE[status], className)}>{PAYMENT_STATUS_LABEL[status]}</span>;
}

/* ---------------- Mise en page ---------------- */

export function PageHeader({ kicker, title, children }: { kicker?: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
      <div>
        {kicker && <p className="kicker text-brass">{kicker}</p>}
        <h1 className="mt-2 font-serif text-[2.2rem] leading-none md:text-[2.8rem]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Panel({ title, children, className, actions }: { title?: React.ReactNode; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("border border-rule bg-panel", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3.5">
          {title && <h2 className="kicker text-fg">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export const adminButton = (variant: "primary" | "ghost" | "danger" | "brass" = "primary", size: "sm" | "md" | "lg" = "md") =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-[0.16em] transition-colors disabled:pointer-events-none disabled:opacity-40",
    size === "sm" && "h-9 px-3 text-[0.62rem]",
    size === "md" && "h-11 px-4 text-[0.68rem]",
    size === "lg" && "h-14 px-6 text-[0.74rem]",
    variant === "primary" && "bg-ivory text-ink hover:bg-paper",
    variant === "brass" && "bg-brass text-ink hover:bg-[#d4b67e]",
    variant === "ghost" && "border border-rule text-fg hover:border-fg/60",
    variant === "danger" && "border border-[#f08a7e]/50 text-[#f08a7e] hover:bg-[#f08a7e]/10",
  );

export const adminInput = "h-11 w-full border border-rule bg-ink px-3 text-[0.95rem] text-fg outline-none transition-colors placeholder:text-sub/60 focus:border-fg/70";
