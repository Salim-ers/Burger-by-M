import { expect, test } from "@playwright/test";
import { openProduct } from "./helpers";

test.describe("démonstration", () => {
  test("le client commande, la cuisine reçoit et traite, sans aucun appel au vrai parcours", async ({ context, page }) => {
    const forbidden: string[] = [];
    context.on("request", (r) => {
      const { pathname } = new URL(r.url());
      if (r.method() === "POST" && (pathname.startsWith("/api/checkout") || pathname.startsWith("/admin"))) forbidden.push(pathname);
      if (pathname.startsWith("/api/admin") || pathname === "/api/slots") forbidden.push(pathname);
    });

    const kitchen = await context.newPage();
    await kitchen.goto("/demo/cuisine");
    await kitchen.getByRole("button", { name: "Démarrer", exact: true }).click();
    await expect(kitchen.getByText("Service actif")).toBeVisible();

    await page.goto("/menu?demo=1");
    await expect(page.getByText("Mode démo")).toBeVisible();
    const sheet = await openProduct(page, "Smash Double");
    await sheet.getByRole("button", { name: /^Ajouter · / }).click();
    await page.getByRole("button", { name: /^Panier, 1 article/ }).click();
    await page.getByRole("dialog").getByRole("link", { name: /^Commander · / }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("radiogroup", { name: "Heure de retrait" })).toBeVisible();
    await page.getByRole("radio", { name: /Au retrait/ }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Valider ma commande/ }).click();
    await expect(page).toHaveURL(/\/demo\/suivi\//);
    await expect(page.getByText("Bien reçue.")).toBeVisible();

    await expect(kitchen.getByText("Smash Double")).toBeVisible();
    await kitchen.getByRole("button", { name: "Accepter", exact: true }).click();
    await expect(page.getByText("C’est parti.")).toBeVisible();
    await kitchen.getByRole("button", { name: "Prête", exact: true }).click();
    await expect(page.getByText("Elle vous attend.")).toBeVisible();

    expect(forbidden).toEqual([]);
  });

  test("le paiement simulé mène au suivi, et la cuisine seule peut simuler une commande", async ({ context, page }) => {
    await page.goto("/demo/cuisine");
    await page.getByRole("button", { name: "Démarrer", exact: true }).click();
    await page.getByRole("button", { name: "Simuler une commande" }).click();
    await expect(page.getByRole("button", { name: "Accepter", exact: true })).toBeVisible();

    const client = await context.newPage();
    await client.goto("/menu?demo=1");
    const sheet = await openProduct(client, "Le Hot");
    await sheet.getByRole("button", { name: /^Ajouter · / }).click();
    await client.goto("/checkout");
    await client.getByRole("radio", { name: /Carte bancaire/ }).click();
    await client.getByRole("checkbox").check();
    await client.getByRole("button", { name: /^Payer · / }).click();
    await expect(client).toHaveURL(/\/demo\/paiement\//);
    await client.getByRole("button", { name: "Payer (carte autorisée)" }).click();
    await expect(client).toHaveURL(/\/demo\/suivi\//);
    await expect(client.getByText("Bien reçue.")).toBeVisible();
  });

  test("hors démo, le site reste en mode réel", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText("Mode démo")).toHaveCount(0);
  });
});
