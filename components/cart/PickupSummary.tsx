"use client";

import { Clock } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useOrdering } from "@/hooks/use-menu";
import { formatDayTime } from "@/lib/hours";

export function PickupSummary({ className }: { className?: string }) {
  const pickup = useCartStore((s) => s.pickup);
  const { prepMinutes } = useOrdering();
  return (
    <p className={className}>
      <Clock className="mr-2 inline size-4 align-[-3px]" aria-hidden />
      Retrait {pickup.mode === "asap" ? `dès que possible (≈ ${prepMinutes} min)` : formatDayTime(pickup.time)}
    </p>
  );
}
