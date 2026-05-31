import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, '../../screenshots');

/**
 * 指定パスのフルページスクリーンショットを screenshots/ に保存する。
 * @param {import('@playwright/test').Page} page
 * @param {string} routePath
 * @param {string} fileName
 */
async function capturePageScreenshot(page, routePath, fileName) {
  await page.goto(routePath);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(screenshotsDir, fileName),
    fullPage: true,
  });
}

test('logic page screenshot', async ({ page }) => {
  await capturePageScreenshot(page, '/logic', 'logic.png');
});

test('thinking page screenshot', async ({ page }) => {
  await capturePageScreenshot(page, '/thinking', 'thinking.png');
});
