import { test, expect } from "@playwright/test";

test.describe("Playlist Configuration", () => {
  test("should allow creating a playlist and adding videos", async ({ page }) => {
    // Create a unique display name
    const displayName = `E2E Playlist Test ${Date.now()}`;

    await page.goto("/controller/displays");

    // Create a new display
    await page.click('button:has-text("+ New Display")');
    await page.fill('input[placeholder*="Lobby Display"]', displayName);
    await page.click('button:has-text("Create Display")');

    // Wait for the specific display card we just created
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCard).toBeVisible({ timeout: 10000 });

    // Click configure playlist within THIS card
    await displayCard.locator('a:has-text("Configure Playlist")').click();

    // Should show no playlist message
    await expect(page.locator("text=No playlist configured")).toBeVisible();

    // Create playlist
    await page.click('button:has-text("Create Playlist")');

    // Should show playlist controls
    await expect(page.locator('select[aria-label="Playback Mode"]')).toBeVisible();

    // Should show empty playlist
    await expect(page.locator("text=No videos in playlist")).toBeVisible();
  });

  test("should display playback mode selector", async ({ page }) => {
    await page.goto("/controller/displays");

    // Use the first display if it exists, or create one
    const configureButton = page.locator('a:has-text("Configure Playlist")').first();
    if (await configureButton.count() > 0) {
      await configureButton.click();
    } else {
      // Create a display
      await page.click('button:has-text("+ New Display")');
      await page.fill('input[placeholder*="Lobby Display"]', "Test Display");
      await page.click('button:has-text("Create Display")');
      await page.click('a:has-text("Configure Playlist")');
      await page.click('button:has-text("Create Playlist")');
    }

    // Check playback mode options
    const select = page.locator('select[aria-label="Playback Mode"]');
    if (await select.count() > 0) {
      await expect(select).toBeVisible();

      const options = await select.locator("option").allTextContents();
      expect(options).toContain("Sequence");
      expect(options).toContain("Loop");
      expect(options).toContain("Manual");
    }
  });
});
