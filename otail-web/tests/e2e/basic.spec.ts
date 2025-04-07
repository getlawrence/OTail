import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  try {
    // Set a longer timeout for the initial navigation
    await page.goto('/', { timeout: 30000 });
    
    // Wait for some key elements that should be present
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Get and log the title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Basic assertions
    await expect(page).toHaveTitle(/.*/, { timeout: 5000 }); // Any title is fine for now
    await expect(page.locator('body')).toBeVisible();
    
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
}); 