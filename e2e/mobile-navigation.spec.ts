import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation", () => {
  test("should show hamburger menu on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/controller");

    // Desktop nav links should be hidden
    const desktopNav = page.locator(".hidden.sm\\:ml-6.sm\\:flex");
    await expect(desktopNav).not.toBeVisible();

    // Hamburger button should be visible
    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).toBeVisible();
  });

  test("should toggle mobile menu when hamburger is clicked", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/controller");

    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');

    // Click hamburger to open menu
    await hamburger.click();

    // Wait for menu to appear
    await page.waitForTimeout(100);

    // Mobile menu should now be visible - look for links in the mobile menu container
    const mobileMenuContainer = page.locator('div.absolute.left-0.right-0');
    await expect(mobileMenuContainer).toBeVisible();

    // Check all navigation links are present in mobile menu
    await expect(mobileMenuContainer.locator('text=Monitor')).toBeVisible();
    await expect(mobileMenuContainer.locator('text=Videos')).toBeVisible();
    await expect(mobileMenuContainer.locator('text=Displays')).toBeVisible();
    await expect(mobileMenuContainer.locator('text=Playlists')).toBeVisible();

    // Click hamburger again to close menu
    await hamburger.click();

    // Wait for menu to disappear
    await page.waitForTimeout(100);

    // Menu should be hidden again
    await expect(mobileMenuContainer).not.toBeVisible();
  });

  test("should navigate to correct page when mobile menu link is clicked", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/controller");

    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');

    // Open mobile menu
    await hamburger.click();

    // Wait for menu to appear
    await page.waitForTimeout(100);

    // Click on Videos link in mobile menu container
    const mobileMenuContainer = page.locator('div.absolute.left-0.right-0');
    await mobileMenuContainer.locator('a:has-text("Videos")').click();

    // Should navigate to videos page
    await expect(page).toHaveURL("/controller/videos");

    // Menu should auto-close after navigation
    await expect(mobileMenuContainer).not.toBeVisible();
  });

  test("should highlight active page in mobile menu", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/controller/displays");

    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');

    // Open mobile menu
    await hamburger.click();

    // Wait for menu to appear
    await page.waitForTimeout(100);

    // Displays link should be highlighted (has bg-blue-50 class) in mobile menu
    const mobileMenuContainer = page.locator('div.absolute.left-0.right-0');
    const displaysLink = mobileMenuContainer.locator('a:has-text("Displays")');
    await expect(displaysLink).toHaveClass(/bg-blue-50/);
  });

  test("should not show hamburger menu on desktop viewport", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/controller");

    // Hamburger button should not be visible on desktop
    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).not.toBeVisible();

    // Desktop nav links should be visible
    const desktopNav = page.locator(".hidden.sm\\:ml-6.sm\\:flex");
    await expect(desktopNav).toBeVisible();
  });
});
