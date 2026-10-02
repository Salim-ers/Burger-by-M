import type { OrderStatus } from "@/types/order";
import { STATUS_LABELS } from "@/lib/order";
import { cn } from "@/lib/utils";

const tones: Record<OrderStatus, string> = {
  PENDING: "bg-cream text-ink",
  ACCEPTED: "border border-cream/25 text-cream",
  PREPARING: "bg-[#f2c45b]/15 text-[#f2c45b]",
  READY: "bg-success text-ink",
  COMPLETED: "bg-white/5 text-cream/50",
  CANCELLED: "bg-danger/15 text-danger",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[0.68rem] font-bold tracking-[0.06em] uppercase", tones[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
