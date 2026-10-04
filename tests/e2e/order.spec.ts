import { expect, test } from "@playwright/test";
import { canOrderNow, loginAsOwner, openProduct, owner } from "./helpers";

test.describe.configure({ mode: "serial" });

let orderNumber = "";

test("commande invitée : composer, payer au retrait, suivre la commande", async ({ page, request }) => {
  test.skip(!(await canOrderNow(request)), "Aucun créneau de retrait disponible à cette heure (ou paiement au retrait désactivé).");

  await page.goto("/menu");
  const sheet = await openProduct(page, "Smash Double");

  // Formule menu (+2,00 €) → la boisson devient obligatoire ; supplément cheddar (+0,80 €).
  await sheet.getByText("En menu (frites + canette)").click();
  await expect(sheet.getByText("Boisson du menu")).toBeVisible();
  await sheet.getByText("Coca-Cola", { exact: true }).click();
  await sheet.getByText("Cheddar", { exact: true }).click();
  await sheet.getByText("Sans cornichons").or(sheet.getByText("Sans salade")).first().click();

  const add = sheet.getByRole("button", { name: /^Ajouter — / });
  await expect(add).toContainText("13,70");
  await add.click();
  await expect(page.getByRole("status").filter({ hasText: "Smash Double ajouté au panier" })).toBeVisible();

  // Panier → validation
  await page.getByRole("button", { name: /^Panier, 1 article/ }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("Votre panier")).toBeVisible();
  await expect(drawer.getByText("+ Cheddar")).toBeVisible();
  await drawer.getByRole("link", { name: "Valider ma commande" }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("radiogroup", { name: "Heure de retrait" })).toBeVisible();
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel(/^Nom/).fill("Test");
  await page.getByLabel("Téléphone").fill("06 12 34 56 78");
  await page.getByLabel("Email").fill("camille.test@example.com");
  await page.getByRole("radio", { name: /Payer au retrait/ }).click();

  // CGV obligatoires : refus sans case cochée
  const submit = page.getByRole("button", { name: /Valider ma commande — 13,70/ });
  await submit.click();
  await expect(page.getByText("Veuillez accepter les conditions générales de vente.")).toBeVisible();
  await page.getByRole("checkbox").check();
  await submit.click();

  await expect(page).toHaveURL(/\/commande\/M-\d+\?t=/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("C’est parti.");
  orderNumber = page.url().match(/M-\d+/)![0];
  await expect(page.getByText(orderNumber).first()).toBeVisible();
  await expect(page.getByText("13,70").first()).toBeVisible();
  await expect(page.getByText("À régler au retrait (espèces ou carte).")).toBeVisible();

  // Le panier est vidé, le lien sans jeton ne donne rien.
  await expect(page.getByRole("button", { name: /^Panier, 0 article/ })).toBeVisible();
  await page.goto(`/commande/${orderNumber}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lien de suivi invalide");
});

test("cuisine : la commande arrive dans « Nouvelles » et avance d'un geste", async ({ page }) => {
  test.skip(!orderNumber, "Pas de commande créée par le test précédent.");
  test.skip(!owner.email || !owner.password, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD non définis.");

  await loginAsOwner(page);
  await page.goto("/admin/kitchen");
  const nouvelles = page.getByRole("region", { name: "Nouvelles" });
  const ticket = nouvelles.locator("article").filter({ hasText: orderNumber });
  await expect(ticket).toBeVisible();
  await expect(ticket.getByText("SANS", { exact: false })).toBeVisible();
  await ticket.getByRole("button", { name: "Lancer" }).click();

  const preparing = page.getByRole("region", { name: "En préparation" }).locator("article").filter({ hasText: orderNumber });
  await expect(preparing).toBeVisible();
  await preparing.getByRole("button", { name: "Prête" }).click();
  await expect(page.getByRole("region", { name: "Prêtes" }).locator("article").filter({ hasText: orderNumber })).toBeVisible();

  // Le statut est bien enregistré côté serveur (rechargement).
  await page.reload();
  await expect(page.getByRole("region", { name: "Prêtes" }).locator("article").filter({ hasText: orderNumber })).toBeVisible();

  // Détail de la commande dans le back-office
  await page.goto(`/admin/orders/${orderNumber}`);
  await expect(page.getByRole("heading", { name: orderNumber })).toBeVisible();
  await expect(page.getByText("Statut modifié").first()).toBeVisible();
});

test("produit épuisé : bloqué immédiatement sur la carte, puis remis en vente", async ({ page }) => {
  test.skip(!owner.email || !owner.password, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD non définis.");

  await loginAsOwner(page);
  await page.goto("/admin/menu");
  const toggle = page.getByRole("switch", { name: "Smash Tower disponible" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await page.goto("/menu");
  const sheet = await openProduct(page, "Smash Tower");
  await expect(sheet.getByText("Épuisé pour le moment")).toBeVisible();
  await expect(sheet.getByRole("button", { name: /^Ajouter — / })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.goto("/admin/menu");
  await page.getByRole("switch", { name: "Smash Tower disponible" }).click();
  await expect(page.getByRole("switch", { name: "Smash Tower disponible" })).toHaveAttribute("aria-checked", "true");
});

test("administration : jamais indexée, accès refusé sans session", async ({ page, request }) => {
  const res = await request.get("/admin/orders", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/admin/login");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");

  const api = await request.get("/api/admin/kitchen");
  expect(api.status()).toBe(401);

  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
});
