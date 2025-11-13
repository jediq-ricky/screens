import { test, expect } from "@playwright/test";

test.describe("Controller Navigation", () => {
  test("should display Monitor link in navigation", async ({ page }) => {
    await page.goto("http://localhost:3000/controller/monitor");

    const monitorLink = page.getByRole("link", { name: /Monitor/i });
    await expect(monitorLink).toBeVisible();
    await expect(monitorLink).toHaveAttribute("href", "/controller/monitor");
  });

  test("should navigate to Monitor page when clicking Monitor link", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/controller/displays");

    await page.getByRole("link", { name: /Monitor/i }).click();

    await expect(page).toHaveURL("http://localhost:3000/controller/monitor");
    await expect(
      page.getByRole("heading", { name: /Monitor Displays/i })
    ).toBeVisible();
  });

  test("should display all navigation links in correct order", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/controller/monitor");

    const navLinks = await page
      .locator("nav a")
      .filter({ hasText: /Monitor|Videos|Displays|Playlists/ })
      .all();

    const linkTexts = await Promise.all(
      navLinks.map((link) => link.textContent())
    );

    expect(linkTexts[0]).toContain("Monitor");
    expect(linkTexts[1]).toContain("Videos");
    expect(linkTexts[2]).toContain("Displays");
    expect(linkTexts[3]).toContain("Playlists");
  });
});
