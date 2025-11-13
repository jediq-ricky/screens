import { test, expect } from "@playwright/test";

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
    await page.goto(displayPath!.trim(), { waitUntil: 'domcontentloaded' });

    // Should show the display client with our unique display name
    await expect(page.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });

    // Should show no playlist message
    await expect(page.locator("text=No playlist configured")).toBeVisible();

    // Should show connection status
    await expect(page.getByTestId("connection-status")).toBeVisible();
  });

  test("should display playlists dropdown in display card", async ({ page }) => {
    const displayName = `E2E Dropdown ${Date.now()}`;

    // Create display
    await page.goto("/controller/displays");
    await page.click('button:has-text("+ New Display")');
    await page.fill('input[placeholder*="Lobby Display"]', displayName);
    await page.click('button:has-text("Create Display")');

    // Wait for the specific display card we just created to appear
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCard).toBeVisible({ timeout: 10000 });

    // Should have playlist dropdown
    const playlistSelect = displayCard.locator('select[id^="playlist-"]');
    await expect(playlistSelect).toBeVisible();

    // Should have "No Playlist" as selected value
    await expect(playlistSelect).toHaveValue("");
  });
});
