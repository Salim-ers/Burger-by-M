import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const owner = { email: process.env.E2E_OWNER_EMAIL ?? "", password: process.env.E2E_OWNER_PASSWORD ?? "" };

/** Commande en ligne possible maintenant (créneau libre, commandes ouvertes, moyen de paiement) ? */
export async function canOrderNow(request: APIRequestContext) {
  const res = await request.get("/api/slots");
  if (!res.ok()) return false;
  const body = (await res.json()) as { canOrder: boolean; paymentMethods: string[] };
  return body.canOrder && body.paymentMethods.includes("on_site");
}

/** Ouvre la fiche d'un produit depuis la carte. */
export async function openProduct(page: Page, name: string) {
  await page.getByRole("button", { name: new RegExp(`^${name}( —|$)`) }).first().click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name })).toBeVisible();
  return sheet;
}

export async function loginAsOwner(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(owner.email);
  await page.getByLabel("Mot de passe").fill(owner.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
}
