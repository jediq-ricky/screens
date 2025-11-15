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

  test("should toggle display controls on and off", async ({ page }) => {
    const displayName = `E2E Controls ${Date.now()}`;

    // Create display
    await page.goto("/controller/displays");
    await page.click('button:has-text("+ New Display")');
    await page.fill('input[placeholder*="Lobby Display"]', displayName);

    // Verify "Show Controls on Display" checkbox is present and checked by default
    const showControlsLabel = page.locator('label:has-text("Show Controls on Display")');
    await expect(showControlsLabel).toBeVisible();
    const showControlsCheckbox = showControlsLabel.locator('input[type="checkbox"]');
    await expect(showControlsCheckbox).toBeChecked();

    await page.click('button:has-text("Create Display")');

    // Wait for the specific display card we just created to appear
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCard).toBeVisible({ timeout: 10000 });

    // Extract the display URL
    const displayPath = await displayCard.locator('p.font-mono').textContent();
    expect(displayPath).toBeTruthy();

    // Navigate to display - should see controls
    await page.goto(displayPath!.trim(), { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("connection-status")).toBeVisible();

    // Go back to controller and toggle controls off
    await page.goto("/controller/displays");
    const displayCardAgain = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCardAgain).toBeVisible();

    // Find and uncheck the "Show Controls" checkbox for this display
    const controlsToggle = displayCardAgain.locator('input[type="checkbox"]');
    await expect(controlsToggle).toBeChecked();

    // Click the checkbox to toggle it off
    await controlsToggle.click();

    // Wait for the PATCH request to complete
    await page.waitForResponse(response =>
      response.url().includes('/api/displays/') && response.request().method() === 'PATCH'
    );

    // Navigate to display again - should NOT see controls
    await page.goto(displayPath!.trim(), { waitUntil: 'domcontentloaded' });

    // Display name should NOT be visible (part of controls)
    await expect(page.locator(`text=${displayName}`)).not.toBeVisible({ timeout: 5000 });

    // Connection status should NOT be visible
    await expect(page.getByTestId("connection-status")).not.toBeVisible();

    // Go back and toggle controls back on
    await page.goto("/controller/displays");
    const displayCardFinal = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCardFinal).toBeVisible();

    const controlsToggleFinal = displayCardFinal.locator('input[type="checkbox"]');
    await expect(controlsToggleFinal).not.toBeChecked();
    await controlsToggleFinal.check();

    await page.waitForTimeout(1000);

    // Navigate to display one more time - controls should be back
    await page.goto(displayPath!.trim(), { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("connection-status")).toBeVisible();
  });

  test("should toggle controls in real-time via SSE and show white border", async ({ page, context }) => {
    const displayName = `E2E SSE Controls ${Date.now()}`;

    // Create display
    await page.goto("/controller/displays");
    await page.click('button:has-text("+ New Display")');
    await page.fill('input[placeholder*="Lobby Display"]', displayName);
    await page.click('button:has-text("Create Display")');

    // Wait for the display card to appear
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCard).toBeVisible({ timeout: 10000 });

    // Extract the display URL
    const displayPath = await displayCard.locator('p.font-mono').textContent();
    expect(displayPath).toBeTruthy();

    // Open display in a new page (simulating second screen)
    const displayPage = await context.newPage();
    await displayPage.goto(displayPath!.trim(), { waitUntil: 'domcontentloaded' });

    // Wait for SSE connection to establish and page to fully load
    await expect(displayPage.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });
    await expect(displayPage.getByTestId("connection-status")).toBeVisible();

    // Give SSE connection extra time to be fully ready
    await displayPage.waitForTimeout(2000);

    // Check that white border is visible when controls are on
    const containerWithControls = displayPage.locator('div.min-h-screen.border-8.border-white');
    await expect(containerWithControls).toBeVisible();

    // Toggle controls OFF from controller page
    const controlsToggle = displayCard.locator('input[type="checkbox"]');
    await expect(controlsToggle).toBeChecked();

    // Wait for both the click and the PATCH response
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/displays/') && response.request().method() === 'PATCH'
      ),
      controlsToggle.click()
    ]);

    // Display page should update in real-time without refresh
    // Use a more generous timeout since SSE can be slow in CI
    await expect(displayPage.locator(`text=${displayName}`)).not.toBeVisible({ timeout: 15000 });
    await expect(displayPage.getByTestId("connection-status")).not.toBeVisible();

    // White border should NOT be visible
    const containerWithoutControls = displayPage.locator('div.min-h-screen.border-8.border-white');
    await expect(containerWithoutControls).not.toBeVisible();

    // Toggle controls back ON
    await expect(controlsToggle).not.toBeChecked();

    // Wait for both the click and the PATCH response
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/displays/') && response.request().method() === 'PATCH'
      ),
      controlsToggle.click()
    ]);

    // Display page should show controls again in real-time
    await expect(displayPage.locator(`text=${displayName}`)).toBeVisible({ timeout: 15000 });
    await expect(displayPage.getByTestId("connection-status")).toBeVisible();

    // White border should be visible again
    await expect(containerWithControls).toBeVisible();

    await displayPage.close();
  });
});
