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
  applyPaymentEvent,
  cancelOrder,
  CheckoutError,
  createOrder,
  expireStalePendingOrders,
  kitchenOrders,
  OrderActionError,
  refundOrder,
  updateOrderStatus,
  type OrderDeps,
} from "@/features/orders/service";
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
  deps = { db, payments, tokenSecret: "x".repeat(40), now: () => NOW };
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
  it("recalcule les prix depuis la base (options, quantités) et numérote M-1001", async () => {
    const special = bySlug("le-special");
    const res = await createOrder(deps, input({
      lines: [{ productId: special.id, quantity: 2, modifierIds: [mod(special, "En menu (frites + canette)"), mod(special, "Coca-Cola"), mod(special, "Bacon")], removedIngredientIds: [special.ingredients.find((i) => i.name === "Salade")!.id] }],
    }));
    expect(res.orderNumber).toBe("M-1001");
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

describe("paiement en ligne", () => {
  it("commande en attente de paiement, puis payée par le webhook — une seule fois", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    expect(res).toMatchObject({ status: "payment_pending", paymentMethod: "card" });
    expect(res.clientSecret).toMatch(/secret/);
    expect(await kitchenOrders(db, NOW)).toHaveLength(0); // invisible en cuisine tant que non payée

    const pi = [...payments.intents.values()][0]!;
    const event = { id: "evt_1", type: "payment.succeeded" as const, providerPaymentId: pi.id, orderId: res.orderId, amountCents: res.totalCents };
    const first = await applyPaymentEvent(db, event);
    expect(first).toEqual({ duplicate: false, newKitchenOrderId: res.orderId });
    const again = await applyPaymentEvent(db, event);
    expect(again.duplicate).toBe(true);
    const other = await applyPaymentEvent(db, { ...event, id: "evt_2" });
    expect(other).toEqual({ duplicate: false, newKitchenOrderId: null }); // déjà payée : aucun effet

    const [order] = await db.select().from(t.orders).where(eq(t.orders.id, res.orderId));
    expect(order).toMatchObject({ orderStatus: "new", paymentStatus: "paid" });
    expect(await kitchenOrders(db, NOW)).toHaveLength(1);
  });

  it("un échec laisse la commande en attente, une annulation libère le créneau", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    const pi = [...payments.intents.values()][0]!;
    await applyPaymentEvent(db, { id: "evt_f", type: "payment.failed", providerPaymentId: pi.id, orderId: res.orderId, error: "carte refusée" });
    let [order] = await db.select().from(t.orders).where(eq(t.orders.id, res.orderId));
    expect(order?.orderStatus).toBe("payment_pending");

    await applyPaymentEvent(db, { id: "evt_c", type: "payment.canceled", providerPaymentId: pi.id, orderId: res.orderId });
    [order] = await db.select().from(t.orders).where(eq(t.orders.id, res.orderId));
    expect(order).toMatchObject({ orderStatus: "cancelled", paymentStatus: "failed" });
    const [slot] = await db.select().from(t.orderSlots).where(eq(t.orderSlots.slotStart, order!.slotStart));
    expect(slot?.bookedCount).toBe(0);
  });

  it("expire les paiements abandonnés, et rattrape un paiement arrivé entre-temps", async () => {
    const a = await createOrder(deps, input({ paymentMethod: "card" }));
    const b = await createOrder(deps, input({ paymentMethod: "card" }));
    const [piA, piB] = [...payments.intents.values()];
    payments.succeed(piB!.id); // B a été payé mais le webhook n'est pas encore arrivé
    const later = new Date(NOW.getTime() + 31 * 60_000);
    expect(await expireStalePendingOrders(db, payments, later)).toBe(1);
    const [oa] = await db.select().from(t.orders).where(eq(t.orders.id, a.orderId));
    const [ob] = await db.select().from(t.orders).where(eq(t.orders.id, b.orderId));
    expect(oa).toMatchObject({ orderStatus: "cancelled", cancelReason: "payment_timeout" });
    expect(payments.intents.get(piA!.id)?.status).toBe("canceled");
    expect(ob).toMatchObject({ orderStatus: "new", paymentStatus: "paid" });
  });

  it("un paiement reçu après expiration relance la commande en cuisine", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    const pi = [...payments.intents.values()][0]!;
    await db.update(t.orders).set({ orderStatus: "cancelled", paymentStatus: "failed", slotReleasedAt: new Date() }).where(eq(t.orders.id, res.orderId));
    const effect = await applyPaymentEvent(db, { id: "evt_late", type: "payment.succeeded", providerPaymentId: pi.id, orderId: res.orderId, amountCents: res.totalCents });
    expect(effect.newKitchenOrderId).toBe(res.orderId);
    const logs = await db.select().from(t.auditLogs).where(eq(t.auditLogs.action, "order.revived_after_payment"));
    expect(logs).toHaveLength(1);
  });

  it("le client abandonne avant de payer : paiement annulé, créneau libéré — sauf si le paiement a abouti", async () => {
    const a = await createOrder(deps, input({ paymentMethod: "card" }));
    const b = await createOrder(deps, input({ paymentMethod: "card" }));
    const [piA, piB] = [...payments.intents.values()];
    expect(await abandonPendingOrder(db, payments, a.orderId)).toMatchObject({ result: "cancelled" });
    expect(payments.intents.get(piA!.id)?.status).toBe("canceled");
    const [oa] = await db.select().from(t.orders).where(eq(t.orders.id, a.orderId));
    expect(oa).toMatchObject({ orderStatus: "cancelled" });
    const [slot] = await db.select().from(t.orderSlots).where(eq(t.orderSlots.slotStart, oa!.slotStart));
    expect(slot?.bookedCount).toBe(1); // reste la commande B

    payments.succeed(piB!.id);
    expect(await abandonPendingOrder(db, payments, b.orderId)).toMatchObject({ result: "paid", newKitchenOrderId: b.orderId });
    const [ob] = await db.select().from(t.orders).where(eq(t.orders.id, b.orderId));
    expect(ob).toMatchObject({ orderStatus: "new", paymentStatus: "paid" });
    expect(await abandonPendingOrder(db, payments, a.orderId)).toMatchObject({ result: "not_pending" });
  });

  it("un échec d'initialisation du paiement annule la commande et libère le créneau", async () => {
    payments.failCreate = true;
    await expect(createOrder(deps, input({ paymentMethod: "card" }))).rejects.toMatchObject({ code: "payment_init_failed" });
    const rows = await db.select().from(t.orders);
    expect(rows[0]).toMatchObject({ orderStatus: "cancelled" });
  });
});

describe("cuisine et gestion", () => {
  it("fait avancer une commande et détecte les conflits entre écrans", async () => {
    const res = await createOrder(deps, input());
    await updateOrderStatus(db, res.orderId, "new", "preparing", owner);
    await expect(updateOrderStatus(db, res.orderId, "new", "preparing", owner)).rejects.toMatchObject({ code: "conflict" });
    await expect(updateOrderStatus(db, res.orderId, "preparing", "completed", owner)).rejects.toMatchObject({ code: "invalid" });
    await updateOrderStatus(db, res.orderId, "preparing", "ready", staff);
    await updateOrderStatus(db, res.orderId, "ready", "completed", staff);
    const [order] = await db.select().from(t.orders).where(eq(t.orders.id, res.orderId));
    expect(order?.orderStatus).toBe("completed");
    expect(order?.acceptedAt && order.readyAt && order.completedAt).toBeTruthy();
    expect((await db.select().from(t.auditLogs).where(eq(t.auditLogs.action, "order.status"))).length).toBe(3);
  });

  it("annulation d'une commande payée : refusée à l'équipe, remboursée intégralement par le gérant", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    const pi = [...payments.intents.values()][0]!;
    await applyPaymentEvent(db, { id: "evt_ok", type: "payment.succeeded", providerPaymentId: pi.id, orderId: res.orderId, amountCents: res.totalCents });
    await expect(cancelOrder(db, payments, res.orderId, "rupture", staff)).rejects.toBeInstanceOf(OrderActionError);
    await cancelOrder(db, payments, res.orderId, "rupture", owner);
    expect(payments.refunds).toEqual([{ id: pi.id, amountCents: res.totalCents, key: expect.any(String) }]);
    const [order] = await db.select().from(t.orders).where(eq(t.orders.id, res.orderId));
    expect(order).toMatchObject({ orderStatus: "cancelled", paymentStatus: "refunded" });
  });

  it("remboursement partiel puis solde, sans dépasser le montant payé", async () => {
    const res = await createOrder(deps, input({ paymentMethod: "card" }));
    const pi = [...payments.intents.values()][0]!;
    await applyPaymentEvent(db, { id: "evt_ok2", type: "payment.succeeded", providerPaymentId: pi.id, orderId: res.orderId, amountCents: res.totalCents });
    await refundOrder(db, payments, res.orderId, 190, owner);
    await expect(refundOrder(db, payments, res.orderId, res.totalCents, owner)).rejects.toMatchObject({ code: "invalid" });
    const r = await refundOrder(db, payments, res.orderId, null, owner);
    expect(r).toEqual({ refundedCents: res.totalCents, status: "refunded" });
  });
});

describe("limiteur de débit", () => {
  it("bloque au-delà de la limite dans la fenêtre", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push((await rateLimit(db, "test:ip", 3, 60)).ok);
    expect(results).toEqual([true, true, true, false]);
  });
});
