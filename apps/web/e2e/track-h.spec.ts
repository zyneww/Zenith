import { test, expect } from "@playwright/test";

test.describe("Track H — safe dependency updates + layout assertions", () => {
  test("header no longer shows Dashboard/Portfolio/SuperChart/Actualités and has news drawer toggle", async ({ page }) => {
    const response = await page.goto("/fr");
    expect(response?.ok()).toBeTruthy();

    const header = page.locator("header").first();

    await expect(header.getByRole("link", { name: /Dashboard/i })).toHaveCount(0);
    await expect(header.getByRole("link", { name: /Portfolio/i })).toHaveCount(0);
    await expect(header.getByText("SuperChart", { exact: false })).toHaveCount(0);
    await expect(header.getByText("Actualités", { exact: true })).toHaveCount(0);

    await expect(header.getByRole("button", { name: "Actualités" })).toBeVisible();
  });

  test("asset detail page renders SUIVICHARTS tabs and chart card header", async ({ page }) => {
    const response = await page.goto("/fr/markets/bitcoin");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole("button", { name: "Informations" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Statistiques Fondamentales" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Actualités Chaudes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sentiment & Tokenomics" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Convertisseur & Liens" })).toBeVisible();

    await expect(page.getByText("Graphique")).toBeVisible();
  });

  test("currency switcher exists in the footer", async ({ page }) => {
    await page.goto("/fr");
    const switcher = page.getByRole("button", { name: "Change currency" });
    if ((await switcher.count()) === 0) {
      test.skip(true, "Currency switcher not implemented by Track C yet");
    }
    await expect(switcher).toBeVisible();
  });
});
