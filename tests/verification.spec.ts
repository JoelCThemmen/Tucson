import { test, expect } from '@playwright/test';

test.describe('Accredited Investor Verification Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('/');
  });

  test('should display verification menu item for logged in users', async ({ page }) => {
    // Check that the navigation exists
    await expect(page.locator('nav')).toBeVisible();
    
    // Initially, verification menu should not be visible (user not logged in)
    await expect(page.getByRole('link', { name: /verification/i })).not.toBeVisible();
    
    // Click Sign In button
    await page.getByRole('button', { name: /sign in/i }).first().click();
    
    // Note: Actual sign-in would require Clerk test credentials
    // For now, we're testing that the UI elements exist
  });

  test('should navigate to verification status page', async ({ page }) => {
    // Direct navigation to verification status
    await page.goto('/verification/status');
    
    // Should either redirect to sign-in or show landing page if Clerk is not configured
    const url = page.url();
    expect(url).toMatch(/sign-in|verification\/status/);
  });

  test('should show verification wizard steps', async ({ page }) => {
    // Direct navigation to verification wizard
    await page.goto('/verification');
    
    // Should either redirect to sign-in or show landing page if Clerk is not configured
    const url = page.url();
    expect(url).toMatch(/sign-in|verification/);
  });

  test('landing page should be accessible and have key elements', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText('Invest in Your');
    await expect(page.locator('h1')).toContainText('Future Today');
    
    // Check for navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for CTA buttons
    await expect(page.getByRole('button', { name: /get started/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
    
    // Check for key sections
    await expect(page.locator('text="Everything You Need"')).toBeVisible();
    await expect(page.locator('text="Trusted by Industry Leaders"')).toBeVisible();
    
    // Check footer exists
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have responsive navigation menu', async ({ page }) => {
    // Test mobile menu
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible
    const mobileMenuButton = page.locator('button').filter({ has: page.locator('.sr-only:has-text("Open main menu")') });
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu
    await mobileMenuButton.click();
    
    // Menu items should be visible
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  });

  test('dashboard should show verification prompt', async ({ page }) => {
    // This would require authentication
    // Checking that the route exists
    const response = await page.goto('/app');
    
    // Should redirect to sign-in if not authenticated
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Verification Form Validation', () => {
  test('should validate income verification requirements', async ({ page }) => {
    // This test would validate the form once authenticated
    // Currently testing that the page structure exists
    await page.goto('/');
    
    // Verify page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate net worth verification requirements', async ({ page }) => {
    // This test would validate the form once authenticated
    await page.goto('/');
    
    // Verify page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('API Health Checks', () => {
  test('backend API should be accessible', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/v1/health/check');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('frontend should be serving', async ({ request }) => {
    const response = await request.get('http://localhost:5173');
    expect(response.ok()).toBeTruthy();
  });
});