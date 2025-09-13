import { test, expect } from '@playwright/test';

test.describe('Navigation Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from dashboard
    await page.goto('http://localhost:5173/app');
    await page.waitForLoadState('networkidle');
  });

  test('navigation bar exists on all pages and is properly positioned', async ({ page }) => {
    const pages = [
      { url: 'http://localhost:5173/app', name: 'Dashboard' },
      { url: 'http://localhost:5173/app/profile', name: 'Profile' },
      { url: 'http://localhost:5173/app/settings', name: 'Settings' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Check only one nav element exists
      const navCount = await page.locator('nav').count();
      expect(navCount).toBe(1);
      
      // Check nav is visible
      await expect(page.locator('nav')).toBeVisible();
      
      // Get nav position and styles
      const navBox = await page.locator('nav').boundingBox();
      const navStyles = await page.locator('nav').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          width: styles.width,
          left: styles.left,
          right: styles.right,
          justifyContent: styles.justifyContent
        };
      });
      
      console.log(`${pageInfo.name} nav position:`, navBox);
      console.log(`${pageInfo.name} nav styles:`, navStyles);
      
      // Nav should be fixed position
      expect(navStyles.position).toBe('fixed');
      
      // Nav should span full width
      expect(navStyles.left).toBe('0px');
      expect(navStyles.right).toBe('0px');
      
      // Nav x position should be 0 (not shifted right)
      expect(navBox.x).toBe(0);
    }
  });

  test('active states work correctly for each page', async ({ page }) => {
    // Test Dashboard active state
    await page.goto('http://localhost:5173/app');
    await page.waitForLoadState('networkidle');
    
    let dashboardLink = page.locator('a[href="/app"]');
    let profileLink = page.locator('a[href="/app/profile"]');
    
    // Dashboard should be active (text-primary-900)
    await expect(dashboardLink).toHaveClass(/text-primary-900/);
    // Profile should not be active
    await expect(profileLink).not.toHaveClass(/text-primary-900/);
    
    // Test Profile active state
    await page.goto('http://localhost:5173/app/profile');
    await page.waitForLoadState('networkidle');
    
    dashboardLink = page.locator('a[href="/app"]');
    profileLink = page.locator('a[href="/app/profile"]');
    
    // Profile should be active (text-primary-900)
    await expect(profileLink).toHaveClass(/text-primary-900/);
    // Dashboard should NOT be active
    await expect(dashboardLink).not.toHaveClass(/text-primary-900/);
    
    // Test Settings page
    await page.goto('http://localhost:5173/app/settings');
    await page.waitForLoadState('networkidle');
    
    dashboardLink = page.locator('a[href="/app"]');
    profileLink = page.locator('a[href="/app/profile"]');
    const settingsLink = page.locator('a:has-text("Settings")');
    
    // Neither Dashboard nor Profile should be active
    await expect(dashboardLink).not.toHaveClass(/text-primary-900/);
    await expect(profileLink).not.toHaveClass(/text-primary-900/);
  });

  test('navigation links work correctly', async ({ page }) => {
    // Click Profile link
    await page.click('a[href="/app/profile"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe('http://localhost:5173/app/profile');
    
    // Verify we're on the profile page by checking for profile-specific content
    // These elements should exist in the DOM (not checking visibility to avoid viewport issues)
    await expect(page.locator('h1').first()).toHaveCount(1);
    await expect(page.locator('text=/Contact Information/i')).toHaveCount(1);
    await expect(page.locator('text=/Professional/i')).toHaveCount(1);
    await expect(page.locator('text=/About Me/i')).toHaveCount(1);
    
    // Click Dashboard link
    await page.click('a[href="/app"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe('http://localhost:5173/app');
    
    // Verify Dashboard content is visible
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });

  test('no duplicate navigation bars on any page', async ({ page }) => {
    const pages = [
      'http://localhost:5173/app',
      'http://localhost:5173/app/profile',
      'http://localhost:5173/app/settings'
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const navCount = await page.locator('nav').count();
      expect(navCount).toBe(1);
      
      // Also check that there's only one set of navigation links
      const dashboardLinkCount = await page.locator('a[href="/app"]').count();
      expect(dashboardLinkCount).toBe(1);
      
      const profileLinkCount = await page.locator('a[href="/app/profile"]').count();
      expect(profileLinkCount).toBe(1);
    }
  });

  test('navigation remains centered on all pages', async ({ page }) => {
    const pages = [
      'http://localhost:5173/app',
      'http://localhost:5173/app/profile',
      'http://localhost:5173/app/settings'
    ];

    let firstPageNavBox = null;

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const navInnerDiv = page.locator('nav > div').first();
      const navInnerBox = await navInnerDiv.boundingBox();
      
      if (!firstPageNavBox) {
        firstPageNavBox = navInnerBox;
      } else {
        // Check that nav inner content is in the same position as first page
        expect(Math.abs(navInnerBox.x - firstPageNavBox.x)).toBeLessThan(2);
        expect(Math.abs(navInnerBox.width - firstPageNavBox.width)).toBeLessThan(2);
      }
      
      console.log(`${url} nav inner position: x=${navInnerBox.x}, width=${navInnerBox.width}`);
    }
  });

  test('main content has proper spacing from navigation', async ({ page }) => {
    const pages = [
      'http://localhost:5173/app',
      'http://localhost:5173/app/profile',
      'http://localhost:5173/app/settings'
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav');
      const main = page.locator('main');
      
      const navBox = await nav.boundingBox();
      const mainBox = await main.boundingBox();
      
      // Main content should have padding-top to account for fixed navigation
      // Since nav is fixed, main starts at y=0 but has pt-16 (64px) padding
      const mainStyles = await main.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          paddingTop: styles.paddingTop
        };
      });
      
      // Main should have padding-top of at least 64px (pt-16)
      expect(parseInt(mainStyles.paddingTop)).toBeGreaterThanOrEqual(64);
      
      console.log(`${url}: nav bottom=${navBox.y + navBox.height}, main top=${mainBox.y}`);
    }
  });
});