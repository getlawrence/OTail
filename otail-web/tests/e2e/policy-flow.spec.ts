import { test, expect } from '@playwright/test';

test('user flow test', async ({ page }) => {
  try {
    // Step 1: Visit the homepage
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('body', { timeout: 5000 });
    await expect(page).toHaveTitle(/OTail/);
    
    // Step 2: Create a new pipeline
    const newPipelineButton = page.locator('#new-pipeline-button');
    await expect(newPipelineButton).toBeVisible();
    await newPipelineButton.click();
    
    // Fill in the pipeline form
    await page.fill('#name', 'Test Pipeline');
    await page.fill('#description', 'Test pipeline for e2e testing');
    await page.fill('#tags', 'test, e2e');
    
    // Submit the form
    const submitButton = page.locator('button:has-text("Create")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    // Step 3: Add a sampling policy
    const addPolicyButton = page.locator('#add-policy-button');
    await expect(addPolicyButton).toBeVisible();
    await addPolicyButton.click();
    
    // Select the "always" sampling policy type
    await page.click('text=Always Sample');
    
    // Step 4: Switch to test mode
    // Click the mode toggle button to switch to test mode
    const testModeButton = page.locator('#test-mode-button');
    await expect(testModeButton).toBeVisible();
    await testModeButton.click();
    
    // Wait for the simulation viewer to be visible
    const simulationCard = page.locator('.shadow-custom');
    await expect(simulationCard).toBeVisible();
    
    // Wait for the heading to change to indicate we're in test mode
    const testModeHeading = page.locator('text=Validate Sampling Rules with OTEL Data');
    await expect(testModeHeading).toBeVisible();
    
    // Wait for the editor to be visible and have content
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible();
    
    // Find and click the run button in the card header
    const runButton = page.locator('.shadow-custom >> button:has-text("Run")');
    await expect(runButton).toBeVisible();
    await runButton.click();
    
    // Verify the decision badge is present and shows a decision
    const decisionBadge = page.locator('.shadow-custom >> div[class*="border-green-500"], div[class*="border-destructive"]');
    await expect(decisionBadge).toBeVisible();
    await expect(decisionBadge).toHaveText(/Sampled|NotSampled/);
    
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
}); 