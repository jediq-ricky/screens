import { test, expect } from "@playwright/test";
import path from "path";
import { deleteVideoByTitle } from "./helpers";

test.describe("Video Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/controller");
    await expect(page.locator("h1")).toHaveText("Dashboard");

    // Navigate to video library
    await page.click('a[href="/controller/videos"]');
    await expect(page.locator("h1")).toHaveText("Video Library");
  });

  test("should show upload form when button clicked", async ({ page }) => {
    // Click upload button
    await page.click('button:has-text("Upload Video")');

    // Check form is visible
    await expect(page.locator('text="Upload New Video"')).toBeVisible();
    await expect(page.locator('label:has-text("Video File")')).toBeVisible();
    await expect(page.locator('label:has-text("Title")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();

    // Upload button should be disabled without file
    const uploadButton = page.locator('button[type="submit"]:has-text("Upload")');
    await expect(uploadButton).toBeDisabled();
  });

  test("should hide upload form when cancel clicked", async ({ page }) => {
    // Click upload button
    await page.click('button:has-text("Upload Video")');
    await expect(page.locator('text="Upload New Video"')).toBeVisible();

    // Click cancel
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text="Upload New Video"')).not.toBeVisible();
  });

  test("should upload video and show it in library", async ({ page }) => {
    const title = `E2E Test Video ${Date.now()}`;

    try {
      // Click upload button
      await page.click('button:has-text("Upload Video")');

      // Create a test video file path
      const testVideoPath = path.join(__dirname, "..", "tests", "fixtures", "test-video.mp4");

      // Fill form
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testVideoPath);

      await page.fill('input#video-title', title);
      await page.fill('textarea#video-description', 'Test video description');

      // Upload button should now be enabled
      const uploadButton = page.locator('button[type="submit"]:has-text("Upload")');
      await expect(uploadButton).toBeEnabled();

      // Submit upload
      await uploadButton.click();

      // Form should be hidden after successful upload
      await expect(page.locator('text="Upload New Video"')).not.toBeVisible({ timeout: 10000 });

      // Video should appear in library
      await expect(page.locator(`text="${title}"`)).toBeVisible({ timeout: 5000 });
    } finally {
      // Clean up: delete the test video
      await deleteVideoByTitle(page, title);
    }
  });
});
