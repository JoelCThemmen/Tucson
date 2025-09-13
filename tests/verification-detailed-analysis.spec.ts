import { test, expect } from '@playwright/test';

test.describe('Detailed Verification Page Analysis', () => {
  test('comprehensive verification status page examination', async ({ page }) => {
    console.log('=== VERIFICATION STATUS PAGE ANALYSIS ===\n');
    
    // Navigate to verification status page
    await page.goto('/verification/status');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'verification-status-full.png', 
      fullPage: true 
    });
    
    // 1. Check page structure
    console.log('1. PAGE STRUCTURE');
    console.log('------------------');
    const hasNav = await page.locator('nav').isVisible();
    console.log(`Navigation bar present: ${hasNav}`);
    
    const hasMainContent = await page.locator('main, [role="main"], .main-content').count();
    console.log(`Main content areas: ${hasMainContent}`);
    
    const hasFooter = await page.locator('footer').isVisible().catch(() => false);
    console.log(`Footer present: ${hasFooter}`);
    
    // 2. Check headings and content
    console.log('\n2. HEADINGS AND CONTENT');
    console.log('------------------------');
    const headings = await page.locator('h1, h2, h3').allTextContents();
    headings.forEach((heading, i) => {
      console.log(`Heading ${i + 1}: "${heading}"`);
    });
    
    // 3. Check verification-specific elements
    console.log('\n3. VERIFICATION ELEMENTS');
    console.log('-------------------------');
    
    // Look for status indicators
    const statusCards = await page.locator('[class*="status"], [class*="card"], .bg-white.rounded').count();
    console.log(`Status cards/sections: ${statusCards}`);
    
    // Check for icons
    const icons = await page.locator('svg').count();
    console.log(`Icons found: ${icons}`);
    
    // Check for buttons
    const buttons = await page.locator('button, a[role="button"]').all();
    console.log(`Buttons found: ${buttons.length}`);
    for (const button of buttons.slice(0, 5)) {
      const text = await button.textContent();
      console.log(`  - Button: "${text?.trim()}"`);
    }
    
    // 4. Check for data display
    console.log('\n4. DATA DISPLAY');
    console.log('----------------');
    
    // Check for "Not Verified" status
    const notVerifiedText = await page.locator('text=/not verified|pending|unverified/i').count();
    console.log(`"Not Verified" indicators: ${notVerifiedText}`);
    
    // Check for "Start Verification" CTA
    const startVerification = await page.locator('text=/start|begin|initiate/i').count();
    console.log(`"Start Verification" CTAs: ${startVerification}`);
    
    // Check for info messages
    const infoMessages = await page.locator('p, .text-gray').all();
    console.log(`Info paragraphs: ${infoMessages.length}`);
    if (infoMessages.length > 0) {
      const firstInfo = await infoMessages[0].textContent();
      console.log(`First info text: "${firstInfo?.substring(0, 100)}..."`);
    }
    
    // 5. Check layout quality
    console.log('\n5. LAYOUT QUALITY');
    console.log('------------------');
    
    // Check for empty sections
    const emptyDivs = await page.evaluate(() => {
      const divs = document.querySelectorAll('div');
      let empty = 0;
      divs.forEach(div => {
        if (div.children.length === 0 && !div.textContent?.trim()) {
          empty++;
        }
      });
      return empty;
    });
    console.log(`Empty div elements: ${emptyDivs}`);
    
    // Check viewport usage
    const viewportUsage = await page.evaluate(() => {
      const body = document.body;
      const height = body.scrollHeight;
      const width = body.scrollWidth;
      return { height, width };
    });
    console.log(`Page dimensions: ${viewportUsage.width}x${viewportUsage.height}px`);
    
    // 6. Check responsive design
    console.log('\n6. RESPONSIVE DESIGN');
    console.log('---------------------');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileMenuButton = await page.locator('[aria-label*="menu"], button:has(.sr-only)').isVisible();
    console.log(`Mobile menu button visible: ${mobileMenuButton}`);
    
    await page.screenshot({ 
      path: 'verification-status-mobile.png', 
      fullPage: true 
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 7. Content Quality Assessment
    console.log('\n7. CONTENT QUALITY');
    console.log('-------------------');
    
    const pageText = await page.locator('body').innerText();
    const wordCount = pageText.split(/\s+/).length;
    console.log(`Total word count: ${wordCount}`);
    
    const hasVerificationContent = pageText.toLowerCase().includes('verif');
    console.log(`Contains verification content: ${hasVerificationContent}`);
    
    const hasPlaceholderText = pageText.includes('Lorem') || pageText.includes('placeholder');
    console.log(`Contains placeholder text: ${hasPlaceholderText}`);
    
    // 8. Final Assessment
    console.log('\n8. FINAL ASSESSMENT');
    console.log('--------------------');
    
    const assessment = {
      hasNavigation: hasNav,
      hasContent: wordCount > 50,
      hasVerificationElements: notVerifiedText > 0 || startVerification > 0,
      hasInteractivity: buttons.length > 0,
      isResponsive: mobileMenuButton !== undefined,
      layoutQuality: emptyDivs < 10 ? 'Good' : 'Poor',
      overallScore: 0
    };
    
    // Calculate score
    if (assessment.hasNavigation) assessment.overallScore += 20;
    if (assessment.hasContent) assessment.overallScore += 20;
    if (assessment.hasVerificationElements) assessment.overallScore += 30;
    if (assessment.hasInteractivity) assessment.overallScore += 20;
    if (assessment.isResponsive) assessment.overallScore += 10;
    
    console.log(`Overall Score: ${assessment.overallScore}/100`);
    console.log(`Grade: ${assessment.overallScore >= 80 ? 'GOOD' : assessment.overallScore >= 60 ? 'FAIR' : 'POOR'}`);
    
    // Output full assessment
    console.log('\nDetailed Assessment:');
    console.log(JSON.stringify(assessment, null, 2));
    
    // Assertions
    expect(assessment.hasNavigation).toBeTruthy();
    expect(assessment.hasContent).toBeTruthy();
    expect(assessment.overallScore).toBeGreaterThanOrEqual(60);
  });
  
  test('verification wizard examination', async ({ page }) => {
    console.log('\n=== VERIFICATION WIZARD ANALYSIS ===\n');
    
    await page.goto('/verification');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'verification-wizard-full.png', 
      fullPage: true 
    });
    
    // Check wizard structure
    const hasWizard = await page.locator('[class*="wizard"], [class*="step"]').count();
    console.log(`Wizard elements: ${hasWizard}`);
    
    // Check for forms
    const formInputs = await page.locator('input, select, textarea, [type="radio"], [type="checkbox"]').count();
    console.log(`Form inputs: ${formInputs}`);
    
    // Check for progress indicators
    const progressElements = await page.locator('[class*="progress"], [class*="step"]').count();
    console.log(`Progress indicators: ${progressElements}`);
    
    // Get page content
    const content = await page.locator('body').innerText();
    console.log(`Content preview: ${content.substring(0, 200)}...`);
  });
});