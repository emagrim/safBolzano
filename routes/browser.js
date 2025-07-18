// browser.js
const { chromium } = require('playwright'); // or use puppeteer if needed

let browserInstance;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true });
    console.log('Browser launched once');
  }
  return browserInstance;
}

module.exports = getBrowser;