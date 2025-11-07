import { test, expect } from '@playwright/test';

test.describe('Settings and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('settings page loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Settings');
    await expect(page.locator('text=General Settings')).toBeVisible();
    await expect(page.locator('text=Text Mode')).toBeVisible();
    await expect(page.locator('text=Data Management')).toBeVisible();
  });

  test('settings controls work', async ({ page }) => {
    // Test toggle switches
    await page.click('button[role="switch"][aria-checked="true"]'); // Analytics toggle
    await expect(page.locator('button[role="switch"][aria-checked="false"]')).toBeVisible();

    // Test theme selection
    await page.selectOption('#theme', 'dark');
    await expect(page.locator('#theme')).toHaveValue('dark');

    // Test language selection
    await page.selectOption('#language', 'es');
    await expect(page.locator('#language')).toHaveValue('es');

    // Test text input
    await page.fill('#text-input', 'Test text input');
    await expect(page.locator('#text-input')).toHaveValue('Test text input');

    // Test process text button
    await page.click('button:has-text("Process Text")');
    // Should show toast notification (we can't easily test this in Playwright)
  });

  test('data management functions', async ({ page }) => {
    // Mock localStorage
    await page.addInitScript(() => {
      const mockStorage: { [key: string]: string } = {};
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => mockStorage[key] || null,
          setItem: (key: string, value: string) => {
            mockStorage[key] = value;
          },
          removeItem: (key: string) => {
            delete mockStorage[key];
          },
          clear: () => {
            Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
          }
        }
      });
    });

    await page.reload();

    // Test save settings
    await page.click('button:has-text("Save Settings")');
    
    // Test load settings
    await page.click('button:has-text("Load Settings")');

    // Test export data
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/cto-app-data-\d+\.json/);
  });

  test('accessibility features', async ({ page }) => {
    // Test ARIA labels
    await expect(page.locator('button[role="switch"]')).toHaveAttribute('aria-checked');
    await expect(page.locator('label[for="analytics"]')).toBeVisible();
    await expect(page.locator('label[for="theme"]')).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test focus management
    await page.focus('#analytics');
    await expect(page.locator('#analytics')).toBeFocused();

    // Test semantic HTML
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1, h2, h3')).toHaveCount({ min: 3 });
  });

  test('system information display', async ({ page }) => {
    await expect(page.locator('text=System Information')).toBeVisible();
    await expect(page.locator('text=Browser:')).toBeVisible();
    await expect(page.locator('text=Platform:')).toBeVisible();
    await expect(page.locator('text=Online Status:')).toBeVisible();
    await expect(page.locator('text=Local Storage:')).toBeVisible();
  });
});