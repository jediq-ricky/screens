import { test, expect } from "@playwright/test";

test.describe("Playlist Configuration", () => {
  test("should display playlists page", async ({ page }) => {
    await page.goto("/controller/playlists");

    // Should show playlists heading
    await expect(page.locator("h1:has-text('Playlists')")).toBeVisible();
  });

  test("should configure videoGap for a playlist", async ({ page }) => {
    const displayName = `E2E Gap Test ${Date.now()}`;

    // Create a display
    await page.goto("/controller/displays");
    await page.click('button:has-text("+ New Display")');
    await page.fill('input[placeholder*="Lobby Display"]', displayName);
    await page.click('button:has-text("Create Display")');

    // Wait for the display card to appear
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCard).toBeVisible({ timeout: 10000 });

    // Go to playlists page
    await page.goto("/controller/playlists");

    // Find the newest playlist (the one we just created)
    const playlistCard = page.locator('.bg-white.rounded-lg.shadow').first();
    await expect(playlistCard).toBeVisible({ timeout: 10000 });

    // Click "Edit Playlist" button
    await playlistCard.locator('a:has-text("Edit Playlist")').click();

    // Wait for the playlist editor page to load
    await expect(page.locator('h2.text-2xl')).toBeVisible({ timeout: 10000 });

    // Find the video gap input
    const gapInput = page.locator('input[id="video-gap"]');
    await expect(gapInput).toBeVisible();

    // Verify the input has min and max attributes
    await expect(gapInput).toHaveAttribute("min", "0");
    await expect(gapInput).toHaveAttribute("max", "60");

    // Change the gap to 10 seconds
    await gapInput.fill("10");

    // Wait for UI to update
    await page.waitForTimeout(1000);

    // Reload the page to verify persistence
    await page.reload();
    await expect(page.locator('h2.text-2xl')).toBeVisible({ timeout: 10000 });

    // Verify the value persisted
    const gapInputReloaded = page.locator('input[id="video-gap"]');
    await expect(gapInputReloaded).toHaveValue("10");
  });
});
