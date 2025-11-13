import { test, expect } from "@playwright/test";
import { deleteDisplayByName } from "./helpers";

test.describe("Display Client", () => {
  test("should show 404 for invalid display token", async ({ page }) => {
    await page.goto("/display/invalid-token-that-does-not-exist", {
      waitUntil: "domcontentloaded",
    });

    // Should show 404 page
    await expect(page.locator("text=404")).toBeVisible({ timeout: 10000 });
  });

  test("should load display client with valid token", async ({ page }) => {
    // Create a unique display name
    const displayName = `E2E Test ${Date.now()}`;

    try {
      // First, create a display via the controller
      await page.goto("/controller/displays");
      await page.click('button:has-text("+ New Display")');
      await page.fill('input[placeholder*="Lobby Display"]', displayName);
      await page.click('button:has-text("Create Display")');

      // Wait for the specific display card we just created to appear
      const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
      await expect(displayCard).toBeVisible({ timeout: 10000 });

      // Extract the display URL from THIS specific card
      const displayPath = await displayCard.locator('p.font-mono').textContent();
      expect(displayPath).toBeTruthy();

      // Navigate to the display URL (path is relative like /display/token)
      await page.goto(displayPath!.trim(), { waitUntil: 'networkidle' });

      // Should show the display client with our unique display name
      await expect(page.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });

      // Should show no playlist message
      await expect(page.locator("text=No playlist configured")).toBeVisible();

      // Should show connection status
      await expect(page.getByTestId("connection-status")).toBeVisible();
    } finally {
      // Clean up: delete the test display
      await deleteDisplayByName(page, displayName);
    }
  });

  test("should show playlist on display client when configured", async ({ page }) => {
    // Create a unique display name
    const displayName = `E2E Playlist ${Date.now()}`;

    try {
      // Create display
      await page.goto("/controller/displays");
      await page.click('button:has-text("+ New Display")');
      await page.fill('input[placeholder*="Lobby Display"]', displayName);
      await page.click('button:has-text("Create Display")');

      // Wait for the specific display card we just created to appear
      const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
      await expect(displayCard).toBeVisible({ timeout: 10000 });

      // Configure playlist - click the Create Playlist link within THIS card
      await displayCard.locator('a:has-text("Create Playlist")').click();

      // Should show playback mode selector
      await expect(page.locator('select[aria-label="Playback Mode"]')).toBeVisible();

      // Get display URL from displays page
      await page.goto("/controller/displays");

      // Find our specific display card again
      const displayCardAgain = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
      await expect(displayCardAgain).toBeVisible();

      // Extract the display URL from THIS specific card
      const displayPath = await displayCardAgain.locator('p.font-mono').textContent();
      expect(displayPath).toBeTruthy();

      // Navigate to display (path is relative like /display/token)
      await page.goto(displayPath!.trim(), { waitUntil: 'networkidle' });

      // Should show our unique display name
      await expect(page.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });

      // Should show no videos message (since playlist is empty)
      await expect(page.locator("text=No videos in playlist")).toBeVisible();

      // Should show playback mode
      await expect(page.locator("text=sequence")).toBeVisible();
    } finally {
      // Clean up: delete the test display
      await deleteDisplayByName(page, displayName);
    }
  });
});
