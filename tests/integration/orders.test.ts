import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import * as t from "@/db/schema";
import type { Db } from "@/db/client";
import { createTestDb } from "../support/db";
import { fakePayments } from "../support/fake-payments";
import { loadMenu, flattenMenu } from "@/features/menu/load";
import { defaultModifierIds } from "@/features/menu/pricing";
import type { MenuProduct } from "@/features/menu/types";
import {
  abandonPendingOrder,
  acceptOrder,
  cancelOrder,
  CheckoutError,
  createOrder,
  expireStalePendingOrders,
  kitchenOrders,
  orderingContext,
  OrderActionError,
  refundOrder,
  refuseOrder,
  syncPayment,
  updateOrderStatus,
  webhookUrlFor,
  type OrderDeps,
} from "@/features/orders/service";
import { effectivePrepMinutes, loadSettings } from "@/features/store/load";
import type { CheckoutInput } from "@/features/checkout/schema";
import { parisWallTimeToDate } from "@/lib/schedule";
import { rateLimit } from "@/lib/security/rate-limit";
import { tokenMatches } from "@/lib/security/tokens";

// Samedi 3 octobre 2026, 19:00 à Paris : ouvert (18:00–22:30).
const NOW = parisWallTimeToDate("2026-10-03", 19 * 60);
const owner = { userId: null, email: "gerant@test.fr", role: "owner" as const };
const staff = { userId: null, email: "equipe@test.fr", role: "staff" as const };

let db: Db;
let close: () => Promise<void>;
let menu: Map<string, MenuProduct>;
let payments: ReturnType<typeof fakePayments>;
let deps: OrderDeps;

const bySlug = (slug: string) => [...menu.values()].find((p) => p.slug === slug)!;
const mod = (p: MenuProduct, name: string) => p.modifierGroups.flatMap((g) => g.modifiers).find((m) => m.name === name)!.id;

function input(over: Partial<CheckoutInput> = {}): CheckoutInput {
  const special = bySlug("le-special");
  return {
    idempotencyKey: randomUUID(),
    lines: [{ productId: special.id, quantity: 1, modifierIds: defaultModifierIds(special), removedIngredientIds: [] }],
    customer: { firstName: "Salim", lastName: "Test", phone: "06 12 34 56 78", email: "salim@example.com" },
    fulfillment: "pickup",
    pickup: { mode: "asap" },
    paymentMethod: "on_site",
    acceptTerms: true,
    ...over,
  };
}

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  menu = flattenMenu(await loadMenu(db));
  payments = fakePayments();
  deps = { db, payments, tokenSecret: "x".repeat(40), appUrl: "https://burger-by-m.test", now: () => NOW };
  // Le seed laisse la commande en ligne fermée (aucun temps de préparation inventé) : le restaurant configure.
  await db.update(t.restaurantSettings).set({ prepMinutes: 20, onlineOrderingEnabled: true });
});
afterEach(async () => close());

describe("seed", () => {
  it("charge la carte complète avec ses options pilotées par la base", async () => {
    const cats = await loadMenu(db);
    expect(cats.map((c) => c.slug)).toEqual(["smash", "classic", "frenchys", "frites", "extras", "kids", "boissons", "desserts"]);
    const special = bySlug("le-special");
    expect(special.priceCents).toBe(1190);
    expect(special.image?.src).toBe("/images/products/le-special.webp");
    expect(special.modifierGroups.map((g) => g.key)).toEqual(["formule", "boisson-menu", "supplements"]);
    expect(special.ingredients.filter((i) => i.isRemovable).map((i) => i.name)).toEqual(["Extra cheddar", "Oignons crispy", "Cornichons", "Salade", "Sauce smash"]);
    expect(bySlug("frites-classiques").priceCents).toBeNull();
  });
});

describe("création de commande", () => {
  it("recalcule les prix depuis la base (options, quantités) et numérote M1001", async () => {
    const special = bySlug("le-special");
    const res = await createOrder(deps, input({
      lines: [{ productId: special.id, quantity: 2, modifierIds: [mod(special, "En menu (frites + canette)"), mod(special, "Coca-Cola"), mod(special, "Bacon")], removedIngredientIds: [special.ingredients.find((i) => i.name === "Salade")!.id] }],
    }));
    expect(res.orderNumber).toBe("M1001");
    expect(res.totalCents).toBe((1190 + 200 + 150) * 2);
    expect(res.status).toBe("new");
    const [order] = await db.select().from(t.orders).where(eq(t.orders.id, res.orderId));
    expect(order).toMatchObject({ subtotalCents: 3080, totalCents: 3080, paymentStatus: "on_site", orderStatus: "new" });
    expect(tokenMatches(res.accessToken, order!.accessTokenHash)).toBe(true);
    const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, res.orderId));
    expect(items[0]).toMatchObject({ productName: "Le Spécial", unitPriceCents: 1540, quantity: 2, lineTotalCents: 3080, removedIngredients: ["Salade"] });
    const mods = await db.select().from(t.orderItemModifiers).where(eq(t.orderItemModifiers.orderItemId, items[0]!.id));
    expect(mods.map((m) => m.modifierName).sort()).toEqual(["Bacon", "Coca-Cola", "En menu (frites + canette)"]);
  });

  it("refuse un produit indisponible, un prix non confirmé et une option falsifiée", async () => {
    const special = bySlug("le-special");
    await db.update(t.products).set({ isAvailable: false }).where(eq(t.products.id, special.id));
    await expect(createOrder(deps, input())).rejects.toMatchObject({ code: "cart_invalid" });

    const frites = bySlug("frites-classiques");
    await expect(createOrder(deps, input({ lines: [{ productId: frites.id, quantity: 1, modifierIds: [], removedIngredientIds: [] }] }))).rejects.toMatchObject({ code: "cart_invalid" });

    const hot = bySlug("le-hot");
    const foreign = mod(bySlug("milkshake-a-composer"), "Oreo");
    await expect(createOrder(deps, input({ lines: [{ productId: hot.id, quantity: 1, modifierIds: [...defaultModifierIds(hot), foreign], removedIngredientIds: [] }] }))).rejects.toBeInstanceOf(CheckoutError);
  });

  it("refuse si le total affiché au client ne correspond plus au calcul serveur", async () => {
    const special = bySlug("le-special");
    await expect(createOrder(deps, input({ expectedTotalCents: special.priceCents! - 100 }))).rejects.toMatchObject({ code: "price_changed" });
    const ok = await createOrder(deps, input({ expectedTotalCents: special.priceCents! }));
    expect(ok.totalCents).toBe(special.priceCents);
    expect(await db.select().from(t.orders)).toHaveLength(1);
  });

  it("une double soumission renvoie la même commande (idempotence)", async () => {
    const i = input();
    const a = await createOrder(deps, i);
    const b = await createOrder(deps, i);
    expect(b).toMatchObject({ orderId: a.orderId, orderNumber: a.orderNumber, accessToken: a.accessToken, replayed: true });
    const [{ n }] = (await db.select({ n: sql<number>`count(*)::int` }).from(t.orders)) as [{ n: number }];
    expect(n).toBe(1);
  });

  it("respecte la capacité maximale par créneau", async () => {
    await db.update(t.restaurantSettings).set({ maxOrdersPerSlot: 1 });
    const a = await createOrder(deps, input());
    const b = await createOrder(deps, input());
    expect(a.requestedTime).not.toBe(b.requestedTime); // le second « dès que possible » glisse au créneau suivant
    const slot = a.requestedTime;
    await expect(createOrder(deps, input({ pickup: { mode: "scheduled", slotStart: slot } }))).rejects.toMatchObject({ code: "slot_unavailable" });
    const [row] = await db.select().from(t.orderSlots).where(eq(t.orderSlots.slotStart, new Date(slot)));
    expect(row?.bookedCount).toBe(1);
  });

  it("refuse quand les commandes en ligne sont coupées ou le moyen de paiement désactivé", async () => {
    await db.update(t.restaurantSettings).set({ onSitePaymentEnabled: false });
    await expect(createOrder(deps, input())).rejects.toMatchObject({ code: "payment_method_unavailable" });
    await db.update(t.restaurantSettings).set({ onlineOrderingEnabled: false });
    await expect(createOrder(deps, input({ paymentMethod: "card" }))).rejects.toMatchObject({ code: "ordering_closed" });
  });

  it("« dès que possible » impossible quand le restaurant est fermé, créneau planifié accepté", async () => {
    await db.update(t.restaurantSettings).set({ scheduleDaysAhead: 3 });
    const closedDeps = { ...deps, now: () => parisWallTimeToDate("2026-10-03", 15 * 60) }; // samedi 15:00 (fermé)
    await expect(createOrder(closedDeps, input())).rejects.toMatchObject({ code: "store_closed" });
    const slot = parisWallTimeToDate("2026-10-03", 19 * 60).toISOString();
    await expect(createOrder(closedDeps, input({ pickup: { mode: "scheduled", slotStart: slot } }))).resolves.toMatchObject({ status: "new" });
  });
});

const slotCount = async (iso: string) => (await db.select().from(t.orderSlots).where(eq(t.orderSlots.slotStart, new Date(iso))))[0]?.bookedCount ?? 0;
const orderRow = async (id: string) => (await db.select().from(t.orders).where(eq(t.orders.id, id)))[0]!;
const paymentRow = async (orderId: string) => (await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)))[0]!;

/** Commande carte validée chez le prestataire (autorisation) et synchronisée. */
async function authorizedOrder(over: Partial<CheckoutInput> = {}) {
  const res = await createOrder(deps, input({ paymentMethod: "card", ...over }));
  const p = [...payments.store.values()].find((x) => x.orderId === res.orderId)!;
  payments.authorize(p.id);
  await syncPayment(db, payments, p.id);
  return { res, pid: p.id };
}

describe("paiement en ligne (Mollie)", () => {
  it("carte : en attente de paiement, puis autorisée → en cuisine, une seule fois même si le webhook est rejoué", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    expect(res).toMatchObject({ status: "payment_pending", paymentMethod: "card" });
    expect(res.checkoutUrl).toMatch(/^https:\/\/pay\.test\//);
    const p = payments.only();
    expect(p.captureMode).toBe("manual");
    expect(await kitchenOrders(db, NOW)).toHaveLength(0); // invisible en cuisine tant que non autorisée

    payments.authorize(p.id);
    const first = await syncPayment(db, payments, p.id);
    const again = await syncPayment(db, payments, p.id); // webhook rejoué
    expect(first.newKitchenOrderId).toBe(res.orderId);
    expect(again.newKitchenOrderId).toBeNull();
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "new", paymentStatus: "authorized" });
    expect(await kitchenOrders(db, NOW)).toHaveLength(1);
    expect(await db.select().from(t.orders)).toHaveLength(1);
  });

  it("ACCEPTER encaisse le paiement autorisé, une seule fois (deux écrans)", async () => {
    const { res, pid } = await authorizedOrder();
    await acceptOrder(db, payments, res.orderId, staff);
    await expect(acceptOrder(db, payments, res.orderId, staff)).rejects.toMatchObject({ code: "conflict" });
    expect(payments.calls.captures).toEqual([pid]);
    const o = await orderRow(res.orderId);
    expect(o).toMatchObject({ orderStatus: "preparing", paymentStatus: "paid" });
    expect(o.acceptedAt).toBeTruthy();
  });

  it("REFUSER libère l'autorisation et le créneau ; le client voit le refus", async () => {
    const { res, pid } = await authorizedOrder();
    expect(await slotCount(res.requestedTime)).toBe(1);
    const r = await refuseOrder(db, payments, res.orderId, "Rupture de stock", staff);
    expect(r.payment).toBe("released");
    expect(payments.calls.cancels).toEqual([pid]);
    expect(payments.calls.captures).toEqual([]);
    const o = await orderRow(res.orderId);
    expect(o).toMatchObject({ orderStatus: "cancelled", paymentStatus: "canceled", cancelReason: "Rupture de stock" });
    expect(o.refusedAt).toBeTruthy();
    expect(await slotCount(res.requestedTime)).toBe(0);
  });

  it("si le prestataire a encaissé directement (capture automatique), le refus rembourse", async () => {
    payments.forceAutomatic = true;
    const { res, pid } = await authorizedOrder();
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "new", paymentStatus: "paid" });
    const r = await refuseOrder(db, payments, res.orderId, "Fermeture exceptionnelle", staff);
    expect(r.payment).toBe("refunded");
    expect(payments.calls.refunds).toEqual([{ id: pid, amountCents: res.totalCents, key: expect.any(String) }]);
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "cancelled", paymentStatus: "refunded" });
  });

  it("capture impossible : la commande reste dans « Nouvelles », rien n'est encaissé", async () => {
    const { res } = await authorizedOrder();
    payments.failCapture = true;
    await expect(acceptOrder(db, payments, res.orderId, staff)).rejects.toMatchObject({ code: "capture_failed" });
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "new", paymentStatus: "authorized", acceptedAt: null });
  });

  it("paiement refusé par la banque ou expiré : commande annulée, créneau libéré", async () => {
    const a = await createOrder(deps, input({ paymentMethod: "card" }));
    const b = await createOrder(deps, input({ paymentMethod: "card" }));
    const [pa, pb] = [...payments.store.values()];
    payments.fail(pa!.id);
    payments.expire(pb!.id);
    await syncPayment(db, payments, pa!.id);
    await syncPayment(db, payments, pb!.id);
    expect(await orderRow(a.orderId)).toMatchObject({ orderStatus: "cancelled", paymentStatus: "failed" });
    expect(await orderRow(b.orderId)).toMatchObject({ orderStatus: "cancelled", paymentStatus: "expired" });
    expect(await slotCount(a.requestedTime)).toBe(0);
    expect(await kitchenOrders(db, NOW)).toHaveLength(0);
  });

  it("expire les paiements abandonnés, et rattrape une autorisation arrivée entre-temps", async () => {
    const a = await createOrder(deps, input({ paymentMethod: "card" }));
    const b = await createOrder(deps, input({ paymentMethod: "card" }));
    const [pa, pb] = [...payments.store.values()];
    payments.authorize(pb!.id); // B a payé mais le webhook n'est pas encore arrivé
    const later = new Date(NOW.getTime() + 31 * 60_000);
    expect(await expireStalePendingOrders(db, payments, later)).toBe(1);
    expect(await orderRow(a.orderId)).toMatchObject({ orderStatus: "cancelled", cancelReason: "payment_timeout", paymentStatus: "expired" });
    expect(payments.calls.cancels).toEqual([pa!.id]);
    expect(await orderRow(b.orderId)).toMatchObject({ orderStatus: "new", paymentStatus: "authorized" });
  });

  it("un paiement autorisé après expiration relance la commande en cuisine (créneau repris)", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    const p = payments.only();
    payments.lockOpen(p.id); // la page de paiement est encore ouverte chez le client
    await expireStalePendingOrders(db, payments, new Date(NOW.getTime() + 31 * 60_000));
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "cancelled", cancelReason: "payment_timeout" });
    expect(await slotCount(res.requestedTime)).toBe(0);

    payments.authorize(p.id);
    const r = await syncPayment(db, payments, p.id);
    expect(r.newKitchenOrderId).toBe(res.orderId);
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "new", paymentStatus: "authorized", cancelReason: null });
    expect(await slotCount(res.requestedTime)).toBe(1);
    expect(await db.select().from(t.auditLogs).where(eq(t.auditLogs.action, "order.revived_after_payment"))).toHaveLength(1);
  });

  it("une commande refusée n'est jamais relancée, même si un webhook tardif arrive", async () => {
    const { res, pid } = await authorizedOrder();
    await refuseOrder(db, payments, res.orderId, "Rupture", staff);
    payments.store.get(pid)!.status = "authorized"; // incohérence simulée côté prestataire
    const r = await syncPayment(db, payments, pid);
    expect(r.newKitchenOrderId).toBeNull();
    expect((await orderRow(res.orderId)).orderStatus).toBe("cancelled");
  });

  it("le client abandonne avant de payer : paiement annulé, créneau libéré — sauf si le paiement a abouti", async () => {
    const a = await createOrder(deps, input({ paymentMethod: "card" }));
    const b = await createOrder(deps, input({ paymentMethod: "card" }));
    const [pa, pb] = [...payments.store.values()];
    expect(await abandonPendingOrder(db, payments, a.orderId)).toMatchObject({ result: "cancelled" });
    expect(payments.calls.cancels).toEqual([pa!.id]);
    expect(await orderRow(a.orderId)).toMatchObject({ orderStatus: "cancelled", paymentStatus: "canceled" });

    payments.authorize(pb!.id);
    expect(await abandonPendingOrder(db, payments, b.orderId)).toMatchObject({ result: "paid", newKitchenOrderId: b.orderId });
    expect(await abandonPendingOrder(db, payments, a.orderId)).toMatchObject({ result: "not_pending" });
  });

  it("un échec d'initialisation du paiement annule la commande et libère le créneau", async () => {
    payments.failCreate = true;
    await expect(createOrder(deps, input({ paymentMethod: "card" }))).rejects.toMatchObject({ code: "payment_init_failed" });
    const rows = await db.select().from(t.orders);
    expect(rows[0]).toMatchObject({ orderStatus: "cancelled" });
  });

  it("webhook : seul l'identifiant est lu ; URL de webhook uniquement en https public", async () => {
    expect(payments.webhookPaymentId("id=tr_Ab12Cd34")).toBe("tr_Ab12Cd34");
    expect(payments.webhookPaymentId("id=<script>&status=paid")).toBeNull();
    expect(payments.webhookPaymentId("status=paid")).toBeNull();
    expect(webhookUrlFor("https://burger-by-m.vercel.app")).toBe("https://burger-by-m.vercel.app/api/webhooks/mollie");
    expect(webhookUrlFor("http://localhost:3000")).toBeNull();
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    expect((await paymentRow(res.orderId)).checkoutUrl).toBe(res.checkoutUrl);
  });
});

describe("cuisine et gestion", () => {
  it("accepter, préparer, prête, terminée — conflits entre écrans détectés", async () => {
    const res = await createOrder(deps, input());
    await expect(updateOrderStatus(db, res.orderId, "new", "preparing", owner)).rejects.toMatchObject({ code: "invalid" }); // passe par ACCEPTER
    await acceptOrder(db, payments, res.orderId, staff);
    await expect(updateOrderStatus(db, res.orderId, "preparing", "completed", owner)).rejects.toMatchObject({ code: "invalid" });
    await updateOrderStatus(db, res.orderId, "preparing", "ready", staff);
    await expect(updateOrderStatus(db, res.orderId, "preparing", "ready", staff)).rejects.toMatchObject({ code: "conflict" });
    await updateOrderStatus(db, res.orderId, "ready", "completed", staff);
    const o = await orderRow(res.orderId);
    expect(o.orderStatus).toBe("completed");
    expect(o.acceptedAt && o.readyAt && o.completedAt).toBeTruthy();
    expect(payments.calls.captures).toEqual([]); // paiement au retrait : aucun mouvement d'argent
  });

  it("refus d'une commande à régler au retrait : aucun mouvement d'argent", async () => {
    const res = await createOrder(deps, input());
    const r = await refuseOrder(db, payments, res.orderId, "Trop d'attente", staff);
    expect(r.payment).toBe("none");
    expect(payments.calls).toEqual({ captures: [], cancels: [], refunds: [] });
  });

  it("annulation après acceptation d'une commande encaissée : refusée à l'équipe, remboursée par le gérant", async () => {
    const { res, pid } = await authorizedOrder();
    await acceptOrder(db, payments, res.orderId, staff);
    await expect(cancelOrder(db, payments, res.orderId, "rupture", staff)).rejects.toBeInstanceOf(OrderActionError);
    await cancelOrder(db, payments, res.orderId, "rupture", owner);
    expect(payments.calls.refunds).toEqual([{ id: pid, amountCents: res.totalCents, key: expect.any(String) }]);
    expect(await orderRow(res.orderId)).toMatchObject({ orderStatus: "cancelled", paymentStatus: "refunded" });
  });

  it("remboursement partiel puis solde, sans dépasser le montant payé", async () => {
    const { res } = await authorizedOrder();
    await acceptOrder(db, payments, res.orderId, staff);
    await refundOrder(db, payments, res.orderId, 190, owner);
    await expect(refundOrder(db, payments, res.orderId, res.totalCents, owner)).rejects.toMatchObject({ code: "invalid" });
    const r = await refundOrder(db, payments, res.orderId, null, owner);
    expect(r).toEqual({ refundedCents: res.totalCents, status: "refunded" });
  });

  it("temps de préparation non configuré : commande en ligne fermée, aucune estimation", async () => {
    await db.update(t.restaurantSettings).set({ prepMinutes: null });
    const ctx = await orderingContext(db, NOW, true);
    expect(ctx).toMatchObject({ open: false, canOrder: false, prepMinutes: null, asap: null, slots: [] });
    await expect(createOrder(deps, input())).rejects.toMatchObject({ code: "ordering_closed" });
  });

  it("coup de feu : le temps annoncé passe au temps configuré", async () => {
    await db.update(t.restaurantSettings).set({ prepMinutes: 20, rushPrepMinutes: 35, busyMode: true });
    expect(effectivePrepMinutes(await loadSettings(db))).toBe(35);
    const rush = await orderingContext(db, NOW, true);
    await db.update(t.restaurantSettings).set({ busyMode: false });
    const calm = await orderingContext(db, NOW, true);
    expect(new Date(rush.asap!.start).getTime()).toBeGreaterThan(new Date(calm.asap!.start).getTime());
  });
});

describe("limiteur de débit", () => {
  it("bloque au-delà de la limite dans la fenêtre", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push((await rateLimit(db, "test:ip", 3, 60)).ok);
    expect(results).toEqual([true, true, true, false]);
  });
});
