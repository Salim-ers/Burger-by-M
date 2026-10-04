import { expect, test, type Page } from "@playwright/test";
import { canOrderNow, loginAsOwner, openProduct, owner, startService } from "./helpers";

test.describe.configure({ mode: "serial" });

let orderNumber = "";
let trackingUrl = "";

/** Numéro de mobile différent à chaque commande : la commande est limitée à 6 par numéro et par 10 min. */
const phone = () => `06 ${Array.from({ length: 4 }, () => String(Math.floor(Math.random() * 100)).padStart(2, "0")).join(" ")}`;

/** Panier (en-tête) → checkout → coordonnées → paiement au retrait → suivi. Renvoie l'URL de suivi. */
async function checkoutOnSite(page: Page, total: string) {
  await page.getByRole("button", { name: /^Panier, \d+ article/ }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("Votre panier")).toBeVisible();
  await drawer.getByRole("link", { name: /^Commander · / }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("radiogroup", { name: "Heure de retrait" })).toBeVisible();
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel(/^Nom/).fill("Test");
  await page.getByLabel("Téléphone").fill(phone());
  await page.getByLabel("Email").fill("camille.test@example.com");
  await page.getByRole("radio", { name: /Au retrait/ }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: new RegExp(`Valider ma commande · ${total}`) }).click();
  await expect(page).toHaveURL(/\/commande\/M\d+\?t=/);
  return page.url();
}

test("commande invitée : composer, payer au retrait, suivre la commande", async ({ page, request }) => {
  test.skip(!(await canOrderNow(request)), "Commande en ligne fermée ou aucun créneau de retrait disponible à cette heure.");

  await page.goto("/menu");
  const sheet = await openProduct(page, "Smash Double");

  // Formule menu (+2,00 €) → la boisson devient obligatoire ; supplément cheddar (+0,80 €).
  await sheet.getByText("En menu (frites + canette)").click();
  await expect(sheet.getByText("Boisson du menu")).toBeVisible();
  await sheet.getByText("Coca-Cola", { exact: true }).click();
  await sheet.getByText("Cheddar", { exact: true }).click();
  await sheet.getByText("Sans cornichons").or(sheet.getByText("Sans salade")).first().click();

  const add = sheet.getByRole("button", { name: /^Ajouter · / });
  await expect(add).toContainText("13,70");
  await add.click();
  await expect(page.getByRole("status").filter({ hasText: "Smash Double ajouté au panier" })).toBeVisible();

  // Panier → validation : CGV obligatoires.
  await page.getByRole("button", { name: /^Panier, 1 article/ }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("+ Cheddar")).toBeVisible();
  await drawer.getByRole("link", { name: /^Commander · 13,70/ }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel(/^Nom/).fill("Test");
  await page.getByLabel("Téléphone").fill(phone());
  await page.getByLabel("Email").fill("camille.test@example.com");
  await page.getByRole("radio", { name: /Au retrait/ }).click();
  const submit = page.getByRole("button", { name: /Valider ma commande · 13,70/ });
  await submit.click();
  await expect(page.getByText("Veuillez accepter les conditions générales de vente.")).toBeVisible();
  await page.getByRole("checkbox").check();
  await submit.click();

  await expect(page).toHaveURL(/\/commande\/M\d+\?t=/);
  trackingUrl = page.url();
  orderNumber = page.url().match(/M\d+/)![0];
  await expect(page.getByRole("heading", { level: 1 })).toContainText(orderNumber);
  await expect(page.getByText("Bien reçue.")).toBeVisible();
  await expect(page.getByText("13,70").first()).toBeVisible();
  await expect(page.getByText("À régler au retrait (espèces ou carte).")).toBeVisible();
  await expect(page.getByText("Présentez votre numéro au comptoir.")).toBeVisible();

  // Le panier est vidé, le lien sans jeton ne donne rien.
  await expect(page.getByRole("button", { name: /^Panier, 0 article/ })).toBeVisible();
  await page.goto(`/commande/${orderNumber}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lien de suivi");
});

test("cuisine : DÉMARRER LE SERVICE, ACCEPTER, PRÊTE, TERMINER — le client suit en direct", async ({ page }) => {
  test.skip(!orderNumber, "Pas de commande créée par le test précédent.");
  test.skip(!owner.email || !owner.password, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD non définis.");

  await loginAsOwner(page);
  await page.goto("/admin/cuisine");
  await startService(page);

  const nouvelles = page.getByRole("region", { name: "Nouvelles" });
  const ticket = nouvelles.locator("article").filter({ hasText: orderNumber });
  await expect(ticket).toBeVisible();
  await expect(ticket.getByText(/sans /i).first()).toBeVisible();
  await expect(ticket.getByText("À encaisser au comptoir")).toBeVisible();
  await ticket.getByRole("button", { name: "Accepter" }).click();

  const preparing = page.getByRole("region", { name: "En préparation" }).locator("article").filter({ hasText: orderNumber });
  await expect(preparing).toBeVisible();
  await preparing.getByRole("button", { name: "Prête" }).click();
  const ready = page.getByRole("region", { name: "Prêtes" }).locator("article").filter({ hasText: orderNumber });
  await expect(ready).toBeVisible();

  // Enregistré côté serveur : après rechargement, le service se reprend et la commande est toujours prête.
  await page.reload();
  await startService(page, "Reprendre");
  await expect(ready).toBeVisible();

  // Le client voit « Prête » sur sa page de suivi.
  const client = await page.context().newPage();
  await client.goto(trackingUrl);
  await expect(client.getByText("Elle vous attend.")).toBeVisible();
  await client.close();

  await ready.getByRole("button", { name: "Terminer" }).click();
  await expect(ready).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Commandes récupérées : [1-9]/ })).toBeVisible();

  // Détail et historique dans le back-office.
  await page.goto(`/admin/orders/${orderNumber}`);
  await expect(page.getByRole("heading", { name: orderNumber })).toBeVisible();
  await expect(page.getByText("Acceptée en cuisine").first()).toBeVisible();
});

test("cuisine : REFUSER — le client voit que sa commande n'a pas pu être acceptée", async ({ page, request }) => {
  test.skip(!(await canOrderNow(request)), "Commande en ligne fermée ou aucun créneau de retrait disponible à cette heure.");
  test.skip(!owner.email || !owner.password, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD non définis.");

  await page.goto("/menu");
  const sheet = await openProduct(page, "Le Hot");
  await sheet.getByRole("button", { name: /^Ajouter · / }).click();
  const url = await checkoutOnSite(page, "9,90");
  const number = url.match(/M\d+/)![0];

  await loginAsOwner(page);
  await page.goto("/admin/cuisine");
  await startService(page);
  const ticket = page.getByRole("region", { name: "Nouvelles" }).locator("article").filter({ hasText: number });
  await expect(ticket).toBeVisible();
  await ticket.getByRole("button", { name: "Refuser" }).click();
  const dialog = page.getByRole("dialog", { name: `#${number}` });
  await dialog.getByRole("button", { name: "Rupture de stock" }).click();
  await dialog.getByRole("button", { name: "Refuser" }).click();
  await expect(ticket).toHaveCount(0);

  await page.goto(url);
  await expect(page.getByText("Votre commande n’a pas pu être acceptée.")).toBeVisible();
  await expect(page.getByText("Rien à régler", { exact: false }).first()).toBeVisible();
});

test("produit épuisé : bloqué immédiatement sur la carte, puis remis en vente", async ({ page }) => {
  test.skip(!owner.email || !owner.password, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD non définis.");

  await loginAsOwner(page);
  await page.goto("/admin/menu");
  const toggle = page.getByRole("switch", { name: "Smash Tower disponible" });
  // Un essai précédent interrompu a pu laisser le produit épuisé.
  if ((await toggle.getAttribute("aria-checked")) !== "true") {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  }
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await page.goto("/menu");
  const sheet = await openProduct(page, "Smash Tower");
  await expect(sheet.getByText("Épuisé pour le moment")).toBeVisible();
  await expect(sheet.getByRole("button", { name: /^Ajouter · / })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.goto("/admin/menu");
  await page.getByRole("switch", { name: "Smash Tower disponible" }).click();
  await expect(page.getByRole("switch", { name: "Smash Tower disponible" })).toHaveAttribute("aria-checked", "true");
});

test("temps de préparation non configuré : commande en ligne fermée, aucune estimation inventée", async ({ page, request }) => {
  test.skip(!owner.email || !owner.password, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD non définis.");

  await loginAsOwner(page);
  await page.goto("/admin/settings");
  const prep = page.getByLabel("Temps de préparation", { exact: true });
  const previous = await prep.inputValue();
  const wasOpen = (await page.getByRole("switch", { name: "Commandes online" }).getAttribute("aria-checked")) === "true";
  try {
    await prep.fill("");
    await page.getByRole("button", { name: "Enregistrer les réglages" }).click();
    await expect(page.getByText("Réglages enregistrés.")).toBeVisible();

    const slots = (await (await request.get("/api/slots")).json()) as { open: boolean; prepMinutes: number | null; slots: unknown[] };
    expect(slots.open).toBe(false);
    expect(slots.prepMinutes).toBeNull();
    expect(slots.slots).toHaveLength(0);

    await page.goto("/menu");
    await expect(page.getByRole("main").getByText("Commandes temporairement fermées").first()).toBeVisible();
    await expect(page.getByRole("main").getByText(/≈ \d+ min/)).toHaveCount(0);

    // L'interrupteur refuse d'ouvrir sans temps de préparation.
    await page.goto("/admin");
    await expect(page.getByRole("switch", { name: "Commandes online" })).toBeDisabled();
  } finally {
    await page.goto("/admin/settings");
    await page.getByLabel("Temps de préparation", { exact: true }).fill(previous || "20");
    await page.getByRole("button", { name: "Enregistrer les réglages" }).click();
    await expect(page.getByText("Réglages enregistrés.")).toBeVisible();
    if (wasOpen) {
      const sw = page.getByRole("switch", { name: "Commandes online" }).first();
      await expect(sw).toBeEnabled();
      if ((await sw.getAttribute("aria-checked")) !== "true") await sw.click();
      await expect(sw).toHaveAttribute("aria-checked", "true");
    }
  }
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
