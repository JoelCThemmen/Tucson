import { test, expect } from '@playwright/test';

test.describe('Dashboard Authentication Tests', () => {
  test('Dashboard loads without authentication errors', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });
    
    // Collect network errors
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.log('Network error:', response.status(), response.url());
      }
    });
    
    // Navigate to dashboard
    await page.goto('http://localhost:5173/app');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Extra wait for any async operations
    
    // Take a screenshot
    await page.screenshot({ path: 'dashboard-auth-test.png', fullPage: true });
    
    // Check that dashboard content is visible
    const dashboardContent = await page.locator('main').textContent();
    console.log('Dashboard content preview:', dashboardContent?.substring(0, 200));
    
    // Check for specific dashboard elements
    const hasWelcomeMessage = await page.locator('text=/Welcome|Dashboard/i').count();
    expect(hasWelcomeMessage).toBeGreaterThan(0);
    
    // Check verification status was loaded (should show some verification-related content)
    const hasVerificationContent = await page.locator('text=/verification|accredited/i').count();
    console.log('Verification content elements found:', hasVerificationContent);
    
    // Assert no console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    expect(consoleErrors).toHaveLength(0);
    
    // Assert no network errors
    if (networkErrors.length > 0) {
      console.log('Network errors found:', networkErrors);
    }
    expect(networkErrors).toHaveLength(0);
  });
  
  test('Verification status API returns data', async ({ page }) => {
    // Set up request interception
    let verificationResponse: any = null;
    
    page.on('response', async response => {
      if (response.url().includes('/verification/status')) {
        console.log('Verification API response:', response.status());
        if (response.status() === 200) {
          verificationResponse = await response.json();
          console.log('Verification data:', verificationResponse);
        }
      }
    });
    
    // Navigate to dashboard
    await page.goto('http://localhost:5173/app');
    
    // Wait for the verification API call
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify the API was called and returned data
    expect(verificationResponse).toBeTruthy();
    expect(verificationResponse?.success).toBe(true);
    expect(verificationResponse?.data).toBeDefined();
  });
});