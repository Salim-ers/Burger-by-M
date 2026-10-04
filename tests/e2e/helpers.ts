import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const owner = { email: process.env.E2E_OWNER_EMAIL ?? "", password: process.env.E2E_OWNER_PASSWORD ?? "" };

/** Commande en ligne possible maintenant (créneau libre, commandes ouvertes, moyen de paiement) ? */
export async function canOrderNow(request: APIRequestContext) {
  const res = await request.get("/api/slots");
  if (!res.ok()) return false;
  const body = (await res.json()) as { canOrder: boolean; paymentMethods: string[] };
  return body.canOrder && body.paymentMethods.includes("on_site");
}

/** Ouvre la fiche d'un produit depuis la carte (nouvel essai tant que la page n'est pas hydratée). */
export async function openProduct(page: Page, name: string) {
  const sheet = page.getByRole("dialog");
  await expect(async () => {
    if (!(await sheet.getByRole("heading", { name }).isVisible())) await page.getByRole("button", { name: new RegExp(`^${name}( —|$)`) }).first().click();
    await expect(sheet.getByRole("heading", { name })).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  return sheet;
}

/** Session du gérant réutilisée d'un test à l'autre : la connexion est limitée à 8 tentatives / 15 min. */
let ownerCookies: Awaited<ReturnType<ReturnType<Page["context"]>["cookies"]>> | null = null;

export async function loginAsOwner(page: Page) {
  if (ownerCookies) {
    await page.context().addCookies(ownerCookies);
    await page.goto("/admin");
    if (await page.getByRole("heading", { name: "Tableau de bord" }).isVisible()) return;
  }
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(owner.email);
  await page.getByLabel("Mot de passe").fill(owner.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
  ownerCookies = await page.context().cookies();
}

/** Écran cuisine : DÉMARRER (ou REPRENDRE) LE SERVICE — notifications autorisées pour le navigateur de test. */
export async function startService(page: Page, label: "Démarrer" | "Reprendre" = "Démarrer") {
  await page.context().grantPermissions(["notifications"]);
  await page.getByRole("button", { name: label, exact: true }).click();
  await expect(page.getByText("Service actif")).toBeVisible();
}
