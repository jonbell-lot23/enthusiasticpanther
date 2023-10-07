import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('text="Latest shows"');
  await page.waitForSelector('text="Highly rated shows"');

  await page.getByRole('link', { name: 'About' }).first().click();
  await page.getByRole('link', { name: 'Shows' }).first().click();
  await page.getByRole('link', { name: 'Songs' }).first().click();

});