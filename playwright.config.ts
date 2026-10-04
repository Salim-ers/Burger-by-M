import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout (navigateur réel) sur un serveur déjà démarré :
 *
 *   npm run db:local            # PostgreSQL local (PGlite) — ou une base Neon de test
 *   npm run db:setup            # migrations + carte
 *   npm run admin:create -- --email … --role owner
 *   npm run dev                 # ou npm run build && npm start
 *   E2E_OWNER_EMAIL=… E2E_OWNER_PASSWORD=… npm run test:e2e
 *
 * E2E_BASE_URL : URL du site (défaut http://localhost:3000).
 * PW_CHANNEL=chrome : utiliser le Chrome installé plutôt que les navigateurs Playwright.
 */
const channel = process.env.PW_CHANNEL || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, channel }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"], channel }, testMatch: /mobile\.spec\.ts/ },
  ],
});
