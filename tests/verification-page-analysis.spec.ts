import { test, expect } from '@playwright/test';

test.describe('Verification Page Analysis', () => {
  test('analyze verification status page quality', async ({ page }) => {
    // Navigate to verification status page
    await page.goto('/verification/status');
    
    // Take a screenshot to see what's actually displayed
    await page.screenshot({ path: 'verification-status-page.png', fullPage: true });
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check what's actually visible on the page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check if navigation is visible
    const navVisible = await page.locator('nav').isVisible();
    console.log('Navigation visible:', navVisible);
    
    // Check for main heading
    const headings = await page.locator('h1, h2').allTextContents();
    console.log('Headings found:', headings);
    
    // Check for any error messages
    const errors = await page.locator('text=/error|failed|problem/i').count();
    console.log('Error messages found:', errors);
    
    // Check for loading states
    const loading = await page.locator('text=/loading/i').count();
    console.log('Loading indicators:', loading);
    
    // Check for verification-related content
    const verificationContent = await page.locator('text=/verification|accredited|investor/i').count();
    console.log('Verification-related content found:', verificationContent);
    
    // Check for buttons and CTAs
    const buttons = await page.locator('button').count();
    console.log('Buttons found:', buttons);
    
    // Get all visible text content
    const bodyText = await page.locator('body').innerText();
    console.log('Page content preview:', bodyText.substring(0, 500));
    
    // Check for proper layout structure
    const mainContent = await page.locator('main, [role="main"]').count();
    console.log('Main content areas:', mainContent);
    
    // Test responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'verification-status-mobile.png', fullPage: true });
    
    // Check if content adapts to mobile
    const mobileNavVisible = await page.locator('nav').isVisible();
    console.log('Mobile nav visible:', mobileNavVisible);
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Navigate to verification wizard
    await page.goto('/verification');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-wizard.png', fullPage: true });
    
    const wizardContent = await page.locator('body').innerText();
    console.log('Wizard content preview:', wizardContent.substring(0, 500));
    
    // Check for form elements in wizard
    const formInputs = await page.locator('input, select, textarea').count();
    console.log('Form inputs in wizard:', formInputs);
    
    // Final assessment
    const assessment = {
      hasNavigation: navVisible,
      hasHeadings: headings.length > 0,
      hasVerificationContent: verificationContent > 0,
      hasInteractiveElements: buttons > 0,
      hasFormElements: formInputs > 0,
      hasErrors: errors > 0,
      isResponsive: mobileNavVisible
    };
    
    console.log('Page Quality Assessment:', assessment);
    
    // Assert basic quality requirements
    expect(navVisible).toBeTruthy();
    expect(headings.length).toBeGreaterThan(0);
    expect(verificationContent).toBeGreaterThan(0);
  });
});