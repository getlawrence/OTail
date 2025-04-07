import { test, expect } from '@playwright/test';

test('user flow test', async ({ page }) => {
  try {
    // Step 1: Visit the homepage
    await page.goto('/', { timeout: 30000 });
    await expect(page).toHaveTitle(/OTail/);
    
    // Step 2: Create a new pipeline
    const newPipelineButton = page.locator('#new-pipeline-button');
    await expect(newPipelineButton).toBeVisible();
    await newPipelineButton.click();
    
    // Fill in the pipeline form
    await page.fill('input[name="name"]', 'Test Pipeline');
    await page.fill('textarea[name="description"]', 'Test pipeline for e2e testing');
    await page.click('button[type="submit"]');
    
    // Step 3: Add a sampling policy
    const addPolicyButton = page.locator('#add-policy-button');
    await expect(addPolicyButton).toBeVisible();
    await addPolicyButton.click();
    
    // Select the "always" sampling policy type
    await page.click('text=Always Sample');
    
    // Step 4: Switch to test mode
    const testModeButton = page.locator('#test-mode-button');
    await expect(testModeButton).toBeVisible();
    await testModeButton.click();
    await page.click('text=Test Mode');
    
    // Step 5: Run the simulation
    // Note: The simulation viewer should be visible in test mode
    const simulationViewer = page.locator('.simulation-viewer');
    await expect(simulationViewer).toBeVisible();
    
    // Verify we're in test mode
    const modeToggle = page.locator('.mode-toggle');
    await expect(modeToggle).toBeVisible();
    
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
}); 