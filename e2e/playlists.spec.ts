import { test, expect } from "@playwright/test";

test.describe("Playlist Configuration", () => {
  test("should display playlists page", async ({ page }) => {
    await page.goto("/controller/playlists");

    // Should show playlists heading
    await expect(page.locator("h1:has-text('Playlists')")).toBeVisible();
  });
});
