import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://developers.openai.com/docs/overview', { waitUntil: 'networkidle2', timeout: 30000 });

// Check what links exist on the page
const info = await page.evaluate(() => {
  const allLinks = [...document.querySelectorAll('a[href*="/docs/"]')];
  const navs = document.querySelectorAll('nav');
  const sample = allLinks.slice(0, 10).map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 50) }));
  return { totalLinks: allLinks.length, navCount: navs.length, sample };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
