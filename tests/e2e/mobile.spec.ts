import { expect, test } from "@playwright/test";
import { openProduct } from "./helpers";

test("mobile : fiche en bottom sheet, barre « Panier · 2 » avec le total", async ({ page }) => {
  await page.goto("/menu");
  // Pas de défilement horizontal parasite.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const sheet = await openProduct(page, "Le Hot");
  const add = sheet.getByRole("button", { name: /^Ajouter · / });
  await expect(add).toContainText("9,90");
  await sheet.getByRole("button", { name: "Ajouter un" }).click();
  await expect(add).toContainText("19,80");
  await add.click();

  const bar = page.getByRole("button", { name: /^Voir le panier \(2 articles\)/ });
  await expect(bar).toBeVisible();
  await expect(bar).toContainText("19,80");
  await bar.click();
  await expect(page.getByRole("dialog").getByText("Votre panier")).toBeVisible();

  // Panier conservé après rechargement (localStorage), prix recalculé depuis la carte.
  await page.reload();
  await expect(page.getByRole("button", { name: /^Voir le panier \(2 articles\)/ })).toBeVisible();
});
