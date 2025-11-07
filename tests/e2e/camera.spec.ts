import { test, expect } from '@playwright/test';

test.describe('Camera Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/camera');
  });

  test('camera page loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Camera Access');
    await expect(page.locator('button:has-text("Start Camera")')).toBeVisible();
  });

  test('camera controls work with mocked media devices', async ({ page }) => {
    // Mock camera API
    await page.addInitScript(() => {
      const mockStream = {
        getTracks: () => [{
          stop: () => {}
        }]
      };

      const mockVideoTrack = {
        stop: () => {}
      };

      // Mock getUserMedia
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => mockStream,
          enumerateDevices: async () => [
            { deviceId: 'camera1', kind: 'videoinput', label: 'Front Camera' },
            { deviceId: 'camera2', kind: 'videoinput', label: 'Back Camera' }
          ]
        }
      });

      // Mock video element behavior
      HTMLVideoElement.prototype.play = async () => {};
      Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
        value: 640
      });
      Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
        value: 480
      });
    });

    await page.reload();

    // Should show camera select when multiple cameras
    await expect(page.locator('#camera-select')).toBeVisible();
    await expect(page.locator('option')).toHaveCount(2);

    // Click start camera
    await page.click('button:has-text("Start Camera")');
    
    // Should show camera controls
    await expect(page.locator('button:has-text("Stop Camera")')).toBeVisible();
    await expect(page.locator('button:has-text("Take Photo")')).toBeVisible();

    // Mock taking a photo
    await page.addInitScript(() => {
      const mockCanvas = {
        toDataURL: () => 'data:image/png;base64,mockphoto',
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage: () => {}
        })
      };
      
      // Mock canvas methods
      HTMLCanvasElement.prototype.toDataURL = mockCanvas.toDataURL;
      HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
    });

    // Click take photo
    await page.click('button:has-text("Take Photo")');
    
    // Should show photo preview
    await expect(page.locator('img[alt="Captured photo"]')).toBeVisible();
    await expect(page.locator('button:has-text("Download")')).toBeVisible();
    await expect(page.locator('button:has-text("Clear")')).toBeVisible();
  });

  test('camera permission denied handling', async ({ page }) => {
    // Mock permission denied
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => {
            throw new Error('Permission denied');
          },
          enumerateDevices: async () => []
        }
      });
    });

    await page.reload();

    // Click start camera
    await page.click('button:has-text("Start Camera")');
    
    // Should show error message
    await expect(page.locator('text=Failed to start camera: Permission denied')).toBeVisible();
  });

  test('fallback message when camera not supported', async ({ page }) => {
    // Remove camera API support
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined
      });
    });

    await page.reload();
    
    await expect(page.locator('text=Camera Not Available')).toBeVisible();
    await expect(page.locator('text=Your browser doesn\'t support camera access or no camera is detected')).toBeVisible();
  });
});