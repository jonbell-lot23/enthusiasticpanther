import { test, expect } from '@playwright/test';

const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction ? 'https://enthusiasticpanther.com' : 'https://enthusiasticpanther.com';

test('test', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('text="Latest shows"');
  await page.waitForSelector('text="Highly rated shows"');

  await page.getByRole('link', { name: 'About' }).first().click();
  await page.getByRole('link', { name: 'Shows' }).first().click();
  await page.getByRole('link', { name: 'Songs' }).first().click();

});