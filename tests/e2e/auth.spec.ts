import { test, expect } from '@playwright/test';

test.describe('Authentication and Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/CTO App/);
    await expect(page.locator('h1')).toContainText('Welcome to CTO App');
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that all navigation links are present
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/speech"]')).toBeVisible();
    await expect(page.locator('nav a[href="/camera"]')).toBeVisible();
    await expect(page.locator('nav a[href="/settings"]')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    // Test navigation to speech page
    await page.click('nav a[href="/speech"]');
    await expect(page).toHaveURL('/speech');
    await expect(page.locator('h1')).toContainText('Speech Features');

    // Test navigation to camera page
    await page.click('nav a[href="/camera"]');
    await expect(page).toHaveURL('/camera');
    await expect(page.locator('h1')).toContainText('Camera Access');

    // Test navigation to settings page
    await page.click('nav a[href="/settings"]');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Settings');

    // Test navigation back to home
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Welcome to CTO App');
  });

  test('keyboard shortcuts work', async ({ page }) => {
    // Test Alt+H for home
    await page.goto('/speech');
    await page.keyboard.press('Alt+h');
    await expect(page).toHaveURL('/');

    // Test Alt+S for speech
    await page.keyboard.press('Alt+s');
    await expect(page).toHaveURL('/speech');

    // Test Alt+C for camera
    await page.keyboard.press('Alt+c');
    await expect(page).toHaveURL('/camera');

    // Test Alt+, for settings
    await page.keyboard.press('Alt+,');
    await expect(page).toHaveURL('/settings');
  });

  test('mobile menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be visible, desktop navigation hidden
    await expect(page.locator('button[aria-expanded="false"]')).toBeVisible();
    await expect(page.locator('nav a[href="/speech"]')).not.toBeVisible();

    // Open mobile menu
    await page.click('button[aria-label="Toggle mobile menu"]');
    await expect(page.locator('button[aria-expanded="true"]')).toBeVisible();
    await expect(page.locator('nav a[href="/speech"]')).toBeVisible();

    // Navigate via mobile menu
    await page.click('nav a[href="/speech"]');
    await expect(page).toHaveURL('/speech');
    await expect(page.locator('button[aria-expanded="false"]')).toBeVisible();
  });

  test('error handling works', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/non-existent-page');
    await expect(page).toHaveURL('/');
  });

  test('online/offline indicator', async ({ page }) => {
    // Test that online indicator is present by default
    await expect(page.locator('text=You are currently offline')).not.toBeVisible();

    // Simulate offline mode
    await page.context().setOffline(true);
    await page.reload();
    await expect(page.locator('text=You are currently offline')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.locator('text=You are currently offline')).not.toBeVisible();
  });
});