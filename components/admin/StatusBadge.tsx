import type { OrderStatus } from "@/types/order";
import { STATUS_LABELS } from "@/lib/order";
import { cn } from "@/lib/utils";

const tones: Record<OrderStatus, string> = {
  PENDING: "bg-cheddar text-ink",
  ACCEPTED: "border border-bone/25 text-bone",
  PREPARING: "border border-cheddar/50 text-cheddar",
  READY: "bg-success text-ink",
  COMPLETED: "bg-white/5 text-bone/50",
  CANCELLED: "bg-danger/15 text-danger",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex h-5.5 items-center rounded-xs px-1.5 text-[0.62rem] font-bold tracking-[0.12em] uppercase", tones[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
