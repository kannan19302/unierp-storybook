const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:6006/iframe.html?id=layout-stat-card-row--default&viewMode=story');
  
  // Wait for a bit just in case it takes time to render
  await page.waitForTimeout(5000);
  
  const content = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY HTML: ", content);
  
  await browser.close();
})();
