import { test, expect } from "@playwright/test"

test.describe("smoke", () => {
  test("home page renders default locale", async ({ page }) => {
    const response = await page.goto("/fr")
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator("html")).toHaveAttribute("lang", "fr")
  })

  test("markets page renders", async ({ page }) => {
    const response = await page.goto("/fr/markets")
    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole("heading", { name: "Marchés" })).toBeVisible()
  })

  test("sign-in page renders", async ({ page }) => {
    const response = await page.goto("/fr/sign-in")
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator("html")).toContainText("Zenith")
  })
})
