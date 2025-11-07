import { test, expect } from '@playwright/test';

test.describe('Speech Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/speech');
  });

  test('speech page loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Speech Features');
    await expect(page.locator('text=Speech Recognition')).toBeVisible();
    await expect(page.locator('text=Speech Synthesis')).toBeVisible();
  });

  test('speech recognition controls work', async ({ page }) => {
    // Mock speech recognition API
    await page.addInitScript(() => {
      const mockSpeechRecognition = class {
        continuous = true;
        interimResults = true;
        lang = 'en-US';
        onstart: (() => void) | null = null;
        onresult: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onend: (() => void) | null = null;

        start() {
          setTimeout(() => {
            if (this.onstart) this.onstart();
            
            // Mock speech recognition results
            setTimeout(() => {
              if (this.onresult) {
                this.onresult({
                  resultIndex: 0,
                  results: [{
                    isFinal: true,
                    0: { transcript: 'Hello world', confidence: 0.9 }
                  }]
                });
              }
            }, 1000);

            setTimeout(() => {
              if (this.onend) this.onend();
            }, 2000);
          }, 100);
        }

        stop() {
          if (this.onend) this.onend();
        }
      };

      (window as any).SpeechRecognition = mockSpeechRecognition;
      (window as any).webkitSpeechRecognition = mockSpeechRecognition;
    });

    await page.reload();
    
    // Click start listening button
    await page.click('button:has-text("Start Listening")');
    
    // Should show listening state
    await expect(page.locator('button:has-text("Stop Listening")')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toBeVisible();

    // Wait for recognition to complete
    await page.waitForTimeout(3000);
    
    // Should have transcript
    await expect(page.locator('text=Hello world')).toBeVisible();
  });

  test('speech synthesis works', async ({ page }) => {
    // Mock speech synthesis API
    await page.addInitScript(() => {
      const mockUtterance = {
        text: '',
        onstart: null as (() => void) | null,
        onend: null as (() => void) | null,
        onerror: null as ((event: any) => void) | null,
      };

      const mockSpeechSynthesis = {
        speak: (utterance: any) => {
          setTimeout(() => {
            if (utterance.onstart) utterance.onstart();
          }, 100);
          
          setTimeout(() => {
            if (utterance.onend) utterance.onend();
          }, 1000);
        },
        cancel: () => {},
      };

      (window as any).SpeechSynthesisUtterance = function(text: string) {
        mockUtterance.text = text;
        return mockUtterance;
      };
      
      (window as any).speechSynthesis = mockSpeechSynthesis;
    });

    await page.reload();

    // Enter text to speak
    await page.fill('#synthesis-text', 'Test speech synthesis');
    
    // Click speak button
    await page.click('button:has-text("Speak Text")');
    
    // Should show speaking state
    await expect(page.locator('button:has-text("Speaking...")')).toBeVisible();
    
    // Wait for synthesis to complete
    await page.waitForTimeout(2000);
    
    // Should return to normal state
    await expect(page.locator('button:has-text("Speak Text")')).toBeVisible();
  });

  test('fallback message when speech not supported', async ({ page }) => {
    // Remove speech API support
    await page.addInitScript(() => {
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
      delete (window as any).speechSynthesis;
    });

    await page.reload();
    
    await expect(page.locator('text=Speech Features Not Available')).toBeVisible();
    await expect(page.locator('text=Your browser doesn\'t support speech recognition or speech synthesis')).toBeVisible();
  });
});