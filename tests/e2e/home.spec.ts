import { expect, test } from "@playwright/test";

test.describe("accueil", () => {
  test("une photographie, un titre, deux actions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Le goût qui marque/ })).toBeVisible();
    const hero = page.locator(".cine-hero");
    // Deux actions, plus le lien discret vers les avis Google.
    await expect(hero.locator(".cta")).toHaveCount(2);
    await expect(hero.getByRole("link", { name: /Note Google/ })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Découvrir la carte" })).toHaveAttribute("href", "/menu");
  });

  test("les anciennes sections et les bandeaux défilants ont disparu", async ({ page }) => {
    await page.goto("/");
    for (const old of ["Nos signatures", "Les incontournables", "Smashed.", "signed"]) {
      await expect(page.getByText(old, { exact: false })).toHaveCount(0);
    }
    const moving = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main *")).filter((el) => {
        const name = getComputedStyle(el).animationName;
        const count = getComputedStyle(el).animationIterationCount;
        return name !== "none" && count === "infinite";
      }).length,
    );
    expect(moving).toBe(0);
    // Quatre séquences, pas une de plus.
    await expect(page.locator("main > section")).toHaveCount(4);
  });

  test("l'action finale mène à la carte et aucune largeur ne déborde", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".final-cta")).toHaveAttribute("href", "/menu");
    for (const width of [320, 360, 390, 768, 1024, 1440, 2560]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `débordement à ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("la navigation flottante mène aux pages et conserve le panier", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("button", { name: /^Panier, \d+ article/ })).toBeVisible();
    await nav.getByRole("link", { name: "La carte" }).click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Notre");
  });

  test("mouvement réduit : tout est affiché sans animation", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(new URL("/", process.env.E2E_BASE_URL ?? "http://localhost:3000").href);
    await expect(page.getByRole("link", { name: "Découvrir la carte" }).first()).toBeVisible();
    await expect(page.locator(".cine-logo")).toBeHidden();
    await context.close();
  });
});
