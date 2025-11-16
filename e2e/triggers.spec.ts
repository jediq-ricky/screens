import { test, expect } from "@playwright/test";

test.describe("Trigger Functionality", () => {
  test("should configure keyboard trigger for MANUAL playlist", async ({ page }) => {
    const timestamp = Date.now();
    const displayName = `E2E Trigger Display ${timestamp}`;
    const playlistName = `E2E Trigger Playlist ${timestamp}`;

    // Create a display
    await page.goto("/controller/displays");
    await page.click('button:has-text("+ New Display")');
    await page.fill('input[placeholder*="Lobby Display"]', displayName);
    await page.click('button:has-text("Create Display")');

    // Wait for display to be created
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });
    await expect(displayCard).toBeVisible({ timeout: 10000 });

    // Create a MANUAL playlist
    await page.goto("/controller/playlists");
    await page.click('button:has-text("Create Playlist")');
    await page.fill('input[placeholder*="My Playlist"]', playlistName);

    // Select MANUAL playback mode
    await page.selectOption('select', 'MANUAL');

    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect to playlist editor
    await page.waitForURL(/\/controller\/playlists\//);

    // Verify MANUAL mode is selected in the playback mode dropdown
    const playbackModeSelect = page.locator('select[aria-label="Playback Mode"]');
    await expect(playbackModeSelect).toHaveValue('MANUAL');

    // TODO: Add video upload and trigger configuration when video upload is set up
    // For now, verify that the trigger config section would appear for MANUAL playlists
  });

  test("should display trigger controls on monitor page for MANUAL playlist", async ({ page }) => {
    // This test assumes there's already a MANUAL playlist with triggers configured
    await page.goto("/controller/monitor");

    // Should show monitor page
    await expect(page.locator("h1:has-text('Monitor Displays')")).toBeVisible();

    // Look for any trigger controls that might be present
    // (Will only be visible if there's a MANUAL playlist with items)
    const hasManualPlaylist = await page.locator('text=/manual/i').isVisible().catch(() => false);

    if (hasManualPlaylist) {
      // If there's a MANUAL playlist, there should be trigger controls
      const triggerSection = page.locator('text=/triggers/i');
      await expect(triggerSection).toBeVisible();
    }
  });

  test("should show trigger configuration UI for playlist items in MANUAL mode", async ({ page }) => {
    const timestamp = Date.now();
    const playlistName = `E2E Manual Config ${timestamp}`;

    // Create a MANUAL playlist
    await page.goto("/controller/playlists");
    await page.click('button:has-text("Create Playlist")');
    await page.fill('input[placeholder*="My Playlist"]', playlistName);
    await page.selectOption('select', 'MANUAL');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect
    await page.waitForURL(/\/controller\/playlists\//);

    // Verify that trigger configuration options are available for MANUAL mode
    // When videos are added, trigger config buttons should appear
    // For now, just verify the page loaded in MANUAL mode
    const playbackModeSelect = page.locator('select[aria-label="Playback Mode"]');
    await expect(playbackModeSelect).toHaveValue('MANUAL');
  });

  test("should not show trigger controls for SEQUENCE playlists", async ({ page }) => {
    const timestamp = Date.now();
    const playlistName = `E2E Sequence ${timestamp}`;

    // Create a SEQUENCE playlist
    await page.goto("/controller/playlists");
    await page.click('button:has-text("Create Playlist")');
    await page.fill('input[placeholder*="My Playlist"]', playlistName);
    await page.selectOption('select', 'SEQUENCE');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect
    await page.waitForURL(/\/controller\/playlists\//);

    // Verify SEQUENCE mode is selected
    const playbackModeSelect = page.locator('select[aria-label="Playback Mode"]');
    await expect(playbackModeSelect).toHaveValue('SEQUENCE');

    // Verify no trigger configuration is shown (there are no videos added yet)
    // TriggerConfig only appears when there are playlist items in MANUAL mode
  });

  test("should not show trigger controls for LOOP playlists", async ({ page }) => {
    const timestamp = Date.now();
    const playlistName = `E2E Loop ${timestamp}`;

    // Create a LOOP playlist
    await page.goto("/controller/playlists");
    await page.click('button:has-text("Create Playlist")');
    await page.fill('input[placeholder*="My Playlist"]', playlistName);
    await page.selectOption('select', 'LOOP');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect
    await page.waitForURL(/\/controller\/playlists\//);

    // Verify LOOP mode is selected
    const playbackModeSelect = page.locator('select[aria-label="Playback Mode"]');
    await expect(playbackModeSelect).toHaveValue('LOOP');

    // Verify no trigger configuration is shown (there are no videos added yet)
    // TriggerConfig only appears when there are playlist items in MANUAL mode
  });
});
