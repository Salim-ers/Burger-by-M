"use client";

import Image from "next/image";
import type { CheckedLine } from "@/features/cart/lines";
import { PhotoPlaceholder } from "@/components/menu/ProductImage";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Récapitulatif façon ticket : lignes, retrait gratuit, total (estimation affichée, recalculée par le serveur). */
export function OrderSummary({ lines, subtotalCents, onEdit, className }: { lines: CheckedLine[]; subtotalCents: number; onEdit?: () => void; className?: string }) {
  return (
    <div className={cn("bg-cream", className)}>
      <div className="flex items-baseline justify-between border-b-2 border-ink px-5 py-4">
        <h2 className="t-label">Votre commande</h2>
        {onEdit && (
          <button type="button" onClick={onEdit} className="t-label text-[0.62rem] text-sub underline underline-offset-4 hover:text-fg">
            Modifier
          </button>
        )}
      </div>
      <ul className="divide-y divide-dashed divide-ink/20 px-5">
        {lines.map(({ line, details, lineTotalCents, error }) => (
          <li key={line.key} className="flex gap-4 py-4">
            <div className="relative size-14 shrink-0 overflow-hidden bg-sand">
              {line.image ? <Image src={line.image.src} alt="" fill sizes="56px" className="object-cover" /> : <PhotoPlaceholder name={line.name} className="size-full" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.95rem] leading-snug font-semibold">
                  <span className="tabular-nums">{line.quantity} ×</span> {line.name}
                </p>
                <p className="shrink-0 text-[0.95rem] font-semibold tabular-nums">{formatPrice(lineTotalCents)}</p>
              </div>
              {details.length > 0 && <p className="mt-1 text-[0.8rem] leading-snug text-sub">{details.join(" · ")}</p>}
              {error && <p className="mt-1 text-[0.8rem] font-semibold text-danger">{error}</p>}
            </div>
          </li>
        ))}
      </ul>
      <div className="perforated" aria-hidden />
      <dl className="space-y-1.5 px-5 pt-3 pb-5 text-sm">
        <div className="flex justify-between text-sub">
          <dt>Sous-total</dt>
          <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between text-sub">
          <dt>Retrait au restaurant</dt>
          <dd>Gratuit</dd>
        </div>
        <div className="flex items-baseline justify-between pt-3">
          <dt className="t-label">Total TTC</dt>
          <dd className="t-l tabular-nums">{formatPrice(subtotalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
