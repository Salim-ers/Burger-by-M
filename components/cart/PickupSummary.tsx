"use client";

import { Clock } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useStoreStatus } from "@/hooks/use-store-status";
import { formatDayTime } from "@/lib/hours";

export function PickupSummary({ className }: { className?: string }) {
  const pickup = useCartStore((s) => s.pickup);
  const { prepRange } = useStoreStatus();
  return (
    <p className={className}>
      <Clock className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
      Retrait {pickup.mode === "asap" ? `dès que possible (${prepRange})` : formatDayTime(pickup.time)}
    </p>
  );
}
