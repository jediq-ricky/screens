import { test, expect } from "@playwright/test";

test.describe("Standalone Playlist Creation", () => {
  test("should create a playlist without a display", async ({ page }) => {
    // Navigate to playlists page
    await page.goto("/controller/playlists");

    // Click create playlist button
    await page.click('button:has-text("Create Playlist")');

    // Verify modal is open
    await expect(page.locator("text=Create New Playlist")).toBeVisible();

    // Fill in playlist details
    const timestamp = Date.now();
    const playlistName = `E2E Test Playlist ${timestamp}`;
    await page.fill('input[id="name"]', playlistName);
    await page.fill('textarea[id="description"]', "E2E test playlist description");
    await page.selectOption('select[id="playbackMode"]', "LOOP");

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Should redirect to playlist editor
    await expect(page).toHaveURL(/\/controller\/playlists\/[a-z0-9]+/);

    // Verify playlist name is displayed
    await expect(page.getByText(`Manage playlist: ${playlistName}`)).toBeVisible();
  });

  test("should create a playlist with SEQUENCE mode by default", async ({ page }) => {
    await page.goto("/controller/playlists");

    await page.click('button:has-text("Create Playlist")');

    const timestamp = Date.now();
    const playlistName = `E2E Test Playlist ${timestamp}`;
    await page.fill('input[id="name"]', playlistName);

    // Don't change playback mode - should default to SEQUENCE
    await page.click('button[type="submit"]:has-text("Create")');

    await expect(page).toHaveURL(/\/controller\/playlists\/[a-z0-9]+/);
    await expect(page.getByText(`Manage playlist: ${playlistName}`)).toBeVisible();
  });

  test("should show error when name is missing", async ({ page }) => {
    await page.goto("/controller/playlists");

    await page.click('button:has-text("Create Playlist")');

    // Try to submit without name
    await page.click('button[type="submit"]:has-text("Create")');

    // Modal should still be visible (form validation prevents submission)
    await expect(page.locator("text=Create New Playlist")).toBeVisible();
  });

  test("should close modal when cancel is clicked", async ({ page }) => {
    await page.goto("/controller/playlists");

    await page.click('button:has-text("Create Playlist")');
    await expect(page.locator("text=Create New Playlist")).toBeVisible();

    await page.click('button:has-text("Cancel")');

    // Modal should close
    await expect(page.locator("text=Create New Playlist")).not.toBeVisible();
  });

  test("should create playlist and appear in playlists list", async ({ page }) => {
    const timestamp = Date.now();
    const playlistName = `E2E Test Playlist ${timestamp}`;

    // Create playlist
    await page.goto("/controller/playlists");
    await page.click('button:has-text("Create Playlist")');
    await page.fill('input[id="name"]', playlistName);
    await page.selectOption('select[id="playbackMode"]', "MANUAL");
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect
    await expect(page).toHaveURL(/\/controller\/playlists\/[a-z0-9]+/);

    // Go back to playlists list
    await page.goto("/controller/playlists");

    // Verify new playlist appears in list - find the card containing the playlist name
    const playlistCard = page.locator('.bg-white.rounded-lg.shadow', { hasText: playlistName });
    await expect(playlistCard).toBeVisible();
    await expect(playlistCard.getByText("Playback Mode:").locator("..")).toContainText("manual");
  });

  test("should create playlist without description", async ({ page }) => {
    const timestamp = Date.now();
    const playlistName = `E2E Test Playlist ${timestamp}`;

    await page.goto("/controller/playlists");
    await page.click('button:has-text("Create Playlist")');

    await page.fill('input[id="name"]', playlistName);
    // Leave description empty
    await page.click('button[type="submit"]:has-text("Create")');

    await expect(page).toHaveURL(/\/controller\/playlists\/[a-z0-9]+/);
    await expect(page.getByText(`Manage playlist: ${playlistName}`)).toBeVisible();
  });
});
