import { test, expect } from "@playwright/test";

test("homepage loads correctly", async ({ page }) => {
  await page.goto("/");

  // Check for main heading
  await expect(page.getByRole("heading", { name: "SCREENS" })).toBeVisible();

  // Check for description
  await expect(
    page.getByText("Video Display & Control System")
  ).toBeVisible();
});
