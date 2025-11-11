import { test, expect } from "@playwright/test";

test.describe("Controller Interface", () => {
  test("should navigate to controller dashboard", async ({ page }) => {
    await page.goto("/controller");

    // Check for dashboard heading
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();

    // Check for navigation links in the nav bar
    const nav = page.locator("nav");
    await expect(nav.getByRole("link", { name: "Videos" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Displays" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Playlists" })).toBeVisible();
  });

  test("should navigate to video library", async ({ page }) => {
    await page.goto("/controller");

    // Click on Videos link
    await page.getByRole("link", { name: "Videos" }).click();

    // Should be on videos page
    await expect(page).toHaveURL("/controller/videos");
    await expect(
      page.getByRole("heading", { name: "Video Library" })
    ).toBeVisible();
  });

  test("should show video search input", async ({ page }) => {
    await page.goto("/controller/videos");

    // Check for search input
    await expect(
      page.getByPlaceholder("Search videos...")
    ).toBeVisible();
  });

  test("should show empty state or videos", async ({ page }) => {
    await page.goto("/controller/videos");

    // Should show either empty state or video grid (depending on manual testing activity)
    const emptyState = page.getByText("No videos found");
    const videoGrid = page.locator('.grid');

    // At least one should be visible
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasVideoGrid = await videoGrid.isVisible().catch(() => false);

    expect(hasEmptyState || hasVideoGrid).toBe(true);
  });
});
