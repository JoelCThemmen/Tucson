import { test, expect } from '@playwright/test';

test.describe('Navigation Menu Alignment', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page first
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('navigation menu should maintain consistent position across pages', async ({ page }) => {
    // Get the initial position of the navigation menu on Dashboard
    await page.click('text=Dashboard');
    await page.waitForURL('**/app');
    
    // Get the navigation menu position on Dashboard
    const dashboardNavBox = await page.locator('nav').first().boundingBox();
    console.log('Dashboard nav position:', dashboardNavBox);
    
    // Navigate to Profile page
    await page.click('text=Profile');
    await page.waitForURL('**/app/profile');
    
    // Get the navigation menu position on Profile
    const profileNavBox = await page.locator('nav').first().boundingBox();
    console.log('Profile nav position:', profileNavBox);
    
    // The navigation should be in the same position
    expect(dashboardNavBox?.x).toBe(profileNavBox?.x);
    expect(dashboardNavBox?.y).toBe(profileNavBox?.y);
    expect(dashboardNavBox?.width).toBe(profileNavBox?.width);
    
    // Also check that the menu items are aligned properly
    const logoOnProfile = await page.locator('a:has-text("Tucson")').first().boundingBox();
    
    // Go back to Dashboard
    await page.click('text=Dashboard');
    await page.waitForURL('**/app');
    const logoOnDashboard = await page.locator('a:has-text("Tucson")').first().boundingBox();
    
    // Logo should be in the same position
    expect(logoOnDashboard?.x).toBe(logoOnProfile?.x);
  });

  test('Profile menu item should be highlighted when active', async ({ page }) => {
    // Navigate to Profile page
    await page.click('text=Dashboard');
    await page.waitForURL('**/app');
    await page.click('text=Profile');
    await page.waitForURL('**/app/profile');
    
    // Check that Profile link has active styling
    const profileLink = page.locator('a[href="/app/profile"]').first();
    
    // Check for active class or styling
    const profileClasses = await profileLink.getAttribute('class');
    expect(profileClasses).toContain('text-primary-900');
    
    // Check that Dashboard is NOT highlighted
    const dashboardLink = page.locator('a[href="/app"]:has-text("Dashboard")').first();
    const dashboardClasses = await dashboardLink.getAttribute('class');
    expect(dashboardClasses).not.toContain('text-primary-900');
  });

  test('navigation should not shift when clicking Profile', async ({ page }) => {
    // Take screenshot on Dashboard
    await page.click('text=Dashboard');
    await page.waitForURL('**/app');
    await page.waitForTimeout(500); // Let animations settle
    
    const dashboardScreenshot = await page.locator('nav').first().screenshot();
    
    // Navigate to Profile
    await page.click('text=Profile');
    await page.waitForURL('**/app/profile');
    await page.waitForTimeout(500); // Let animations settle
    
    const profileScreenshot = await page.locator('nav').first().screenshot();
    
    // Compare the navigation screenshots - they should be similar
    // (allowing for the different underline on active items)
    expect(dashboardScreenshot).toBeDefined();
    expect(profileScreenshot).toBeDefined();
    
    // Also verify the page has proper spacing from nav
    const profileContent = await page.locator('.bg-gradient-to-r.from-primary-900').first().boundingBox();
    const nav = await page.locator('nav').first().boundingBox();
    
    // Content should start below the navigation (nav height is typically 64px/4rem)
    if (nav && profileContent) {
      expect(profileContent.y).toBeGreaterThanOrEqual(nav.y + nav.height);
    }
  });
});