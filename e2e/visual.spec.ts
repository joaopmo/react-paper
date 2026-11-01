import { expect, test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent font rendering and crisp subpixels
    await page.emulateMedia({ colorScheme: 'light' });
  });

  const fixtures = [
    { id: 'resume', name: 'Multi-Page Resume' },
    { id: 'portfolio', name: 'Creative Designer & Developer Portfolio' },
    { id: 'executive-report', name: 'Executive & Financial Corporate Report' },
    { id: 'academic', name: 'Academic Conference Research Paper' },
    { id: 'timeline', name: 'Project Timeline' },
  ];

  for (const fixture of fixtures) {
    test(`renders ${fixture.name} without visual regression`, async ({ page }) => {
      await page.goto(`/?fixture=${fixture.id}`);

      // Wait for at least one rendered page
      await page.waitForSelector('.rp-page', { state: 'visible' });

      // Ensure network is idle and all web fonts are loaded
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);

      // Brief stability pause for layout and images
      await page.waitForTimeout(200);

      // Take full page screenshot and assert against baseline
      await expect(page).toHaveScreenshot(`${fixture.id}.png`, {
        fullPage: true,
      });
    });
  }
});
