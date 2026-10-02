"use client";

import { useStoreStatus } from "@/hooks/use-store-status";
import { cn } from "@/lib/utils";

/** « ● Ouvert · aujourd'hui 11h – 14h · 18h – 22h » / « ● Fermé · ... ». */
export function OpeningStatus({ className, withHours = true }: { className?: string; withHours?: boolean }) {
  const status = useStoreStatus();
  if (!status.ready) return <span className={cn("inline-block h-5 w-40", className)} aria-hidden />;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem]", className)}>
      <StatusDot open={status.open} />
      <span className={cn("font-bold tracking-wide uppercase", status.open ? "text-open" : "text-closed")}>{status.open ? "Ouvert" : "Fermé"}</span>
      {withHours && <span className="text-current/70">· Aujourd’hui : {status.today}</span>}
    </span>
  );
}

export function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="relative flex size-2.5 shrink-0">
      {open && <span className="absolute inset-0 animate-ping rounded-full bg-open opacity-50" />}
      <span className={cn("relative size-2.5 rounded-full", open ? "bg-open" : "bg-closed")} />
    </span>
  );
}
