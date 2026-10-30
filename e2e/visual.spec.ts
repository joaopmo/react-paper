import { expect, test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent font rendering and crisp subpixels
    await page.emulateMedia({ colorScheme: 'light' });
  });

  const fixtures = [
    { id: 'resume', name: 'Multi-Page Resume (v4)' },
    { id: 'timeline', name: 'Project Timeline (v4)' },
    { id: 'double-column', name: 'Double Column Layout (v3 API)' },
    { id: 'single-column', name: 'Single Column Layout (v3 API)' },
    { id: 'header', name: 'With Header (v3 API)' },
    { id: 'memoization', name: 'Memoization & React State' },
  ];

  for (const fixture of fixtures) {
    test(`renders ${fixture.name} without visual regression`, async ({ page }) => {
      await page.goto(`/?fixture=${fixture.id}`);

      // Wait for at least one rendered page
      await page.waitForSelector('.rp-page', { state: 'visible' });

      // Ensure all web fonts are loaded
      await page.evaluate(() => document.fonts.ready);

      // Brief stability pause for layout and images
      await page.waitForTimeout(200);

      // Take full page screenshot and assert against baseline
      await expect(page).toHaveScreenshot(`${fixture.id}.png`, {
        fullPage: true,
      });
    });
  }

  test('interactive state updates in memoization fixture', async ({ page }) => {
    await page.goto('/?fixture=memoization');
    await page.waitForSelector('.rp-page', { state: 'visible' });

    const increaseBtn = page.getByRole('button', { name: /increase/i });
    await expect(increaseBtn).toBeVisible();

    await increaseBtn.click();
    await expect(page.getByText('Click Count: 1')).toBeVisible();

    await increaseBtn.click();
    await expect(page.getByText('Click Count: 2')).toBeVisible();

    // Verify screenshot after user interactions
    await expect(page).toHaveScreenshot('memoization-clicked.png', {
      fullPage: true,
    });
  });
});
