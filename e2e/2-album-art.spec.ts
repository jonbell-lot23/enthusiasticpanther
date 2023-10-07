import { test, expect } from '@playwright/test';




test('album test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('text="Latest shows"');
  await page.waitForSelector('text="Highly rated shows"');

  
  const firstAlbumArt = await page.$('section:has-text("Latest shows") div.grid > div img');
  const src = await firstAlbumArt.getAttribute('src');
  if (src.endsWith('.png')) {
    console.log('The first item in "Latest shows" uses a PNG for album art');
  } else {
    console.log('The first item in "Latest shows" does not use a PNG for album art');
  }

});


