"use server";

import { z } from "zod";
import { getDb } from "@/db/client";
import { stripeConfigured } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments/stripe";
import { clientIp, requireStaff } from "@/lib/auth/guard";
import { cancelOrder, refundOrder, updateOrderStatus } from "@/features/orders/service";
import type { OrderStatus } from "@/db/schema";
import { run, type ActionResult } from "./result";

const statuses = ["payment_pending", "new", "preparing", "ready", "completed", "cancelled"] as const satisfies readonly OrderStatus[];

export async function setOrderStatusAction(orderId: string, from: OrderStatus, to: OrderStatus): Promise<ActionResult> {
  return run(async () => {
    const input = z.object({ orderId: z.uuid(), from: z.enum(statuses), to: z.enum(statuses) }).parse({ orderId, from, to });
    const s = await requireStaff();
    await updateOrderStatus(getDb(), input.orderId, input.from, input.to, { userId: s.userId, email: s.email, ip: await clientIp() });
  });
}

export async function cancelOrderAction(orderId: string, reason: string): Promise<ActionResult> {
  return run(async () => {
    const input = z.object({ orderId: z.uuid(), reason: z.string().trim().min(2).max(200) }).parse({ orderId, reason });
    const s = await requireStaff();
    await cancelOrder(getDb(), stripeConfigured() ? getPaymentProvider() : null, input.orderId, input.reason, { userId: s.userId, email: s.email, role: s.role, ip: await clientIp() });
  });
}

export async function refundOrderAction(orderId: string, amountCents: number | null): Promise<ActionResult<{ refundedCents: number }>> {
  return run(async () => {
    const input = z.object({ orderId: z.uuid(), amountCents: z.number().int().positive().max(100_000).nullable() }).parse({ orderId, amountCents });
    const s = await requireStaff("owner");
    const r = await refundOrder(getDb(), stripeConfigured() ? getPaymentProvider() : null, input.orderId, input.amountCents, { userId: s.userId, email: s.email, role: s.role, ip: await clientIp() });
    return { refundedCents: r.refundedCents };
  });
}
