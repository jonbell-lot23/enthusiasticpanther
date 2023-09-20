const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://enthusiasticpanther.com");

  // Wait for the specific text to appear
  const isLoaded = await page.waitForSelector('h1:text("Example Domain")', {
    timeout: 5000,
  });

  if (isLoaded) {
    console.log("The page has loaded successfully.");
  } else {
    console.log("The page did not load successfully.");
  }

  await browser.close();
})();
