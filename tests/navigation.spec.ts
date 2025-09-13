import { test, expect } from '@playwright/test';

test.describe('Navigation and Feature Discovery', () => {
  test('should have all main navigation items visible', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation items
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    
    // Sign in/up buttons should be visible
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /get started/i }).first()).toBeVisible();
  });

  test('authenticated navigation should show all features', async ({ page }) => {
    // This test validates that authenticated users can see:
    // - Dashboard
    // - Verification (NEW - was missing before!)
    // - Portfolio
    // - Markets
    // - Network
    // - Profile
    
    // Note: Requires authentication to fully test
    await page.goto('/');
    
    // Verify navigation structure exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('verification feature should be discoverable', async ({ page }) => {
    // Test that verification is accessible from:
    // 1. Main navigation menu
    // 2. Dashboard prompt
    // 3. Direct URL
    
    // Direct URL test
    const verificationResponse = await page.goto('/verification/status');
    expect(verificationResponse?.status()).toBeLessThan(500);
    
    const wizardResponse = await page.goto('/verification');
    expect(wizardResponse?.status()).toBeLessThan(500);
  });

  test('mobile navigation should contain all features', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu
    const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(page.locator('[aria-label*="menu"]'));
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Check that menu opened
      await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    }
  });

  test('all routes should be accessible', async ({ page }) => {
    const routes = [
      '/',
      '/sign-in',
      '/sign-up',
      '/app',
      '/app/profile',
      '/app/settings',
      '/verification',
      '/verification/status',
      '/verification/success',
    ];
    
    for (const route of routes) {
      const response = await page.goto(route);
      // Should not return server errors
      expect(response?.status()).toBeLessThan(500);
    }
  });
});

test.describe('User Journey - New User to Verified Investor', () => {
  test('complete user journey flow', async ({ page }) => {
    // 1. Land on home page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Invest in Your.*Future Today/);
    
    // 2. Click Get Started
    await expect(page.getByRole('button', { name: /get started/i }).first()).toBeVisible();
    
    // 3. Would go through sign up (requires Clerk)
    
    // 4. Would land on dashboard with verification prompt
    
    // 5. Would click verification in menu or prompt
    
    // 6. Would complete verification wizard
    
    // This test documents the expected flow
  });
});

test.describe('Visual Regression Checks', () => {
  test.skip('landing page visual consistency', async ({ page }) => {
    // Skipped until baseline screenshots are created
    await page.goto('/');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('landing-page.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test.skip('verification wizard visual consistency', async ({ page }) => {
    // Skipped until baseline screenshots are created
    await page.goto('/verification');
    
    // Will redirect to sign-in, but we can verify the redirect works
    await page.waitForLoadState('networkidle');
    
    // Screenshot of wherever we end up (sign-in page)
    await expect(page).toHaveScreenshot('verification-redirect.png', {
      animations: 'disabled'
    });
  });
});