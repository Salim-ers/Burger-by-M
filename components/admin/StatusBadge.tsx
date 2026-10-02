import type { OrderStatus } from "@/types/order";
import { STATUS_LABELS } from "@/lib/order";
import { cn } from "@/lib/utils";

const tones: Record<OrderStatus, string> = {
  PENDING: "bg-rose text-ink",
  ACCEPTED: "bg-cream/15 text-cream",
  PREPARING: "bg-cheddar/20 text-cheddar",
  READY: "bg-success/20 text-success",
  COMPLETED: "bg-cream/8 text-cream/55",
  CANCELLED: "bg-danger/15 text-[#ff9b94]",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-xs px-2 text-[0.68rem] font-bold tracking-[0.08em] uppercase", tones[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
