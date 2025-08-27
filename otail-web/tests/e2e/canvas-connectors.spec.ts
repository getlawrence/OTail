import { test, expect } from '@playwright/test';

test('canvas connectors across pipeline types', async ({ page }) => {
  try {
    // Step 1: Visit the canvas page
    await page.goto('/canvas', { timeout: 30000 });
    await page.waitForSelector('body', { timeout: 5000 });
    await expect(page).toHaveTitle(/OTail/);
    
    // Debug: Wait for the sidebar to be visible
    await page.waitForSelector('.group\\/sidebar-wrapper', { timeout: 5000 });
    
    // Step 2: Set up a simple traces pipeline first (like the working example)
    // Click the receivers icon in the sidebar
    const receiversIcon = page.locator('button:has(.lucide-arrow-down)').first();
    await expect(receiversIcon).toBeVisible();
    await receiversIcon.click();
    
    // Wait for the sidebar to expand
    await page.waitForSelector('div.opacity-100:not(.w-0)', { timeout: 5000 });
    await page.waitForSelector('[data-id^="receivers-"]', { timeout: 5000 });
    
    // Get the traces section position
    const tracesSection = page.locator('[data-id="section-traces"]');
    await expect(tracesSection).toBeVisible();
    const tracesBox = await tracesSection.boundingBox();
    
    // Drag OTLP receiver to traces section
    const otlpReceiverInSidebar = page.locator('[data-id="receivers-otlp"]');
    await expect(otlpReceiverInSidebar).toBeVisible();
    await otlpReceiverInSidebar.hover();
    await page.mouse.down();
    await page.mouse.move(tracesBox!.x + 100, tracesBox!.y + 100);
    await page.mouse.up();
    
    // Add processor to traces section
    const processorsIcon = page.locator('button:has(.lucide-bolt)').first();
    await expect(processorsIcon).toBeVisible();
    await processorsIcon.click();
    await page.waitForTimeout(500);
    
    const tailSamplingProcessorInSidebar = page.locator('[data-id="processors-tail_sampling"]');
    await expect(tailSamplingProcessorInSidebar).toBeVisible();
    await tailSamplingProcessorInSidebar.hover();
    await page.mouse.down();
    await page.mouse.move(tracesBox!.x + 175, tracesBox!.y + 100);
    await page.mouse.up();
    
    // Step 3: Test basic connector functionality first
    // Add spanmetrics connector to traces section
    const connectorsIcon = page.locator('button:has(.lucide-arrow-left-right)').first();
    await expect(connectorsIcon).toBeVisible();
    await connectorsIcon.click();
    await page.waitForTimeout(500);
    
    const spanmetricsConnectorInSidebar = page.locator('[data-id="connectors-spanmetrics"]');
    await expect(spanmetricsConnectorInSidebar).toBeVisible();
    await spanmetricsConnectorInSidebar.hover();
    await page.mouse.down();
    // Position connector on the right side of traces section
    await page.mouse.move(tracesBox!.x + 250, tracesBox!.y + 100);
    await page.mouse.up();
    
    // Wait for all nodes to be properly created
    await page.waitForTimeout(1000);
    
    // Step 4: Connect the basic traces pipeline first (like the working example)
    const tracesReceiverHandle = page.locator('[data-handleid="right"][data-nodeid^="receivers-otlp-"]');
    const tracesProcessorHandleIn = page.locator('[data-handleid="left"][data-nodeid^="processors-tail_sampling-"]');
    const tracesProcessorHandleOut = page.locator('[data-handleid="right"][data-nodeid^="processors-tail_sampling-"]');
    
    // Wait for all handles to be visible
    await expect(tracesReceiverHandle).toBeVisible();
    await expect(tracesProcessorHandleIn).toBeVisible();
    await expect(tracesProcessorHandleOut).toBeVisible();
    
    // Connect receiver to processor in traces (this should work like the working example)
    await tracesReceiverHandle.hover();
    await page.mouse.down();
    await tracesProcessorHandleIn.hover();
    await tracesProcessorHandleIn.hover(); // Second hover to ensure dragover event
    await page.mouse.up();
    
    // Wait for the connection to be established
    await page.waitForTimeout(500);
    
    // Step 5: Test connector connection
    // Now try to connect processor to connector
    const tracesConnectorHandle = page.locator('[data-handleid="target-handle"][data-nodeid^="connectors-spanmetrics-"]').first();
    await expect(tracesConnectorHandle).toBeVisible();
    
    // Connect processor to connector in traces
    await tracesProcessorHandleOut.hover();
    await page.mouse.down();
    await tracesConnectorHandle.hover();
    await tracesConnectorHandle.hover(); // Second hover to ensure dragover event
    await page.mouse.up();
    
    // Wait for the connection to be established
    await page.waitForTimeout(500);
    
    // Step 6: Verify basic functionality works
    // Check that we have the expected number of connections for the basic pipeline
    const connections = page.locator('.react-flow__edge');
    await expect(connections).toHaveCount(2); // receiver->processor + processor->connector
    
    // Verify nodes in traces pipeline
    const tracesNodes = page.locator('[data-id="section-traces"] .react-flow__node:not([data-id^="section-"])');
    await expect(tracesNodes).toHaveCount(3); // receiver + processor + connector
    
    // Verify connector node exists and is visible
    const connectorNodes = page.locator('[data-id^="connectors-spanmetrics-"]');
    await expect(connectorNodes).toHaveCount(1); // One connector in traces
    
    const tracesConnector = connectorNodes.first();
    await expect(tracesConnector).toBeVisible();
    
    // Step 7: Debug output
    console.log('Basic connector test completed successfully');
    console.log('Connector node created and connected properly');
    
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
});
