import { test, expect } from '@playwright/test';

test('canvas pipeline flow', async ({ page }) => {
  try {
    // Step 1: Visit the canvas page
    await page.goto('/canvas', { timeout: 30000 });
    await page.waitForSelector('body', { timeout: 5000 });
    await expect(page).toHaveTitle(/OTail/);
    
    // Debug: Wait for the sidebar to be visible
    await page.waitForSelector('.group\\/sidebar-wrapper', { timeout: 5000 });
    
    // Step 2: Click the receivers icon in the sidebar
    const receiversIcon = page.locator('button:has(.lucide-arrow-down)').first();
    await expect(receiversIcon).toBeVisible();
    await receiversIcon.click();
    
    // Wait for the sidebar to expand
    await page.waitForSelector('div.opacity-100:not(.w-0)', { timeout: 5000 });
    
    // Debug: Wait for the expanded sidebar content and components
    await page.waitForSelector('[data-id^="receivers-"]', { timeout: 5000 });
    
    // Find and drag the OTLP receiver
    const otlpReceiverInSidebar = page.locator('[data-id="receivers-otlp"]');
    await expect(otlpReceiverInSidebar).toBeVisible();
    
    // Get the traces section position
    const tracesSection = page.locator('[data-id="section-traces"]');
    await expect(tracesSection).toBeVisible();
    
    // Manual drag operation for OTLP receiver
    await otlpReceiverInSidebar.hover();
    await page.mouse.down();
    // Position the receiver on the left side of the traces section
    const tracesBox = await tracesSection.boundingBox();
    await page.mouse.move(tracesBox!.x + 100, tracesBox!.y + 100);
    await page.mouse.up();
    
    // Step 4: Click the processors icon in the sidebar
    const processorsIcon = page.locator('button:has(.lucide-bolt)').first();
    await expect(processorsIcon).toBeVisible();
    await processorsIcon.click();
    
    // Wait for the sidebar content to update
    await page.waitForTimeout(500);
    
    // Step 5: Drag tail sampling processor to the traces section
    const tailSamplingProcessorInSidebar = page.locator('[data-id="processors-tail_sampling"]');
    await expect(tailSamplingProcessorInSidebar).toBeVisible();
    
    // Manual drag operation for tail sampling processor
    await tailSamplingProcessorInSidebar.hover();
    await page.mouse.down();
    // Position the processor in the middle of the traces section
    await page.mouse.move(tracesBox!.x + 175, tracesBox!.y + 100);
    await page.mouse.up();
    
    // Step 6: Click the exporters icon in the sidebar
    const exportersIcon = page.locator('button:has(.lucide-arrow-up)').first();
    await expect(exportersIcon).toBeVisible();
    await exportersIcon.click();
    
    // Wait for the sidebar content to update
    await page.waitForTimeout(500);
    
    // Step 7: Drag OTLP exporter to the traces section
    const otlpExporterInSidebar = page.locator('[data-id="exporters-otlp"]');
    await expect(otlpExporterInSidebar).toBeVisible();
    
    // Manual drag operation for OTLP exporter
    await otlpExporterInSidebar.hover();
    await page.mouse.down();
    // Position the exporter on the right side of the traces section
    await page.mouse.move(tracesBox!.x + 250, tracesBox!.y + 100);
    await page.mouse.up();
    
    // Step 8: Connect the nodes
    const receiverHandle = page.locator('[data-handleid="right"][data-nodeid^="receivers-otlp-"]');
    const processorHandleIn = page.locator('[data-handleid="left"][data-nodeid^="processors-tail_sampling-"]');
    const processorHandleOut = page.locator('[data-handleid="right"][data-nodeid^="processors-tail_sampling-"]');
    const exporterHandle = page.locator('[data-handleid="left"][data-nodeid^="exporters-otlp-"]');
    
    // Manual connection for receiver to processor
    await receiverHandle.hover();
    await page.mouse.down();
    await processorHandleIn.hover();
    await processorHandleIn.hover(); // Second hover to ensure dragover event
    await page.mouse.up();
    
    // Manual connection for processor to exporter
    await processorHandleOut.hover();
    await page.mouse.down();
    await exporterHandle.hover();
    await exporterHandle.hover(); // Second hover to ensure dragover event
    await page.mouse.up();
    
    // Verify the connections are visible
    const connections = page.locator('.react-flow__edge');
    await expect(connections).toHaveCount(2);
    
    // Verify the nodes are in the correct order
    const nodes = page.locator('.react-flow__node:not([data-id^="section-"])');
    await expect(nodes).toHaveCount(3);
    
    
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
}); 