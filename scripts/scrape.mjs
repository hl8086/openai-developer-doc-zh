import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs');

const BASE = 'https://developers.openai.com';
const START = `${BASE}/docs/overview`;

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.use(gfm);
turndown.addRule('removeScript', {
  filter: ['script', 'style', 'svg'],
  replacement: () => ''
});
turndown.addRule('cardLink', {
  filter: (node) => node.tagName === 'A' && node.querySelector('div'),
  replacement: (_, node) => {
    const href = node.getAttribute('href') || '';
    const title = node.querySelector('[class*="title"], h3, h4, strong')?.textContent?.trim();
    const desc = node.textContent.replace(/\s+/g, ' ').trim();
    const text = title ? `${title} - ${desc.replace(title, '').trim()}` : desc;
    return text ? `\n\n[${text}](${href})\n\n` : '';
  }
});
turndown.addRule('pre', {
  filter: 'pre',
  replacement: (_, node) => {
    const lang = node.querySelector('code')?.className?.match(/language-(\w+)/)?.[1] || '';
    // Remove line number elements and collapse buttons before extracting text
    node.querySelectorAll('[class*="line-number"], [class*="lineNumber"], [class*="gutter"], [class*="collapse"], [class*="expand"], button').forEach(el => el.remove());
    const code = node.querySelector('code') || node;
    let text = code.textContent;
    // Strip leading line numbers (e.g. "1\n2\n3\n...code")
    text = text.replace(/^(\d+\n)+/, '');
    return `\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n`;
  }
});

function urlToFilePath(url) {
  const path = new URL(url).pathname.replace(/^\/api\/docs\/?/, '').replace(/\/$/, '') || 'index';
  return join(DOCS_DIR, `${path}.md`);
}

async function discoverUrls(page) {
  await page.goto(START, { waitUntil: 'networkidle2', timeout: 30000 });
  const urls = await page.evaluate((base) => {
    const links = document.querySelectorAll('a[href*="/docs/"]');
    const set = new Set();
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href && !href.includes('#')) {
        const full = href.startsWith('http') ? href : `${base}${href}`;
        if (full.includes('/api/docs/')) set.add(full.split('?')[0]);
      }
    });
    return [...set].sort();
  }, BASE);
  return urls;
}

async function scrapePage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('article, main, [role="main"]', { timeout: 8000 }).catch(() => {});

    const html = await page.evaluate(() => {
      // Convert code-sample astro-islands into proper HTML code blocks
      document.querySelectorAll('astro-island').forEach(island => {
        try {
          const props = JSON.parse(island.getAttribute('props') || '{}');
          if (!props.code) return;
          // Astro serialization: [type, value] where type 0 = primitive/object
          const code = props.code[1];
          if (typeof code !== 'object') return;
          const title = props.title?.[1] || '';
          let html = '';
          if (title) html += `<p><strong>${title}</strong></p>`;
          for (const [lang, entry] of Object.entries(code)) {
            const src = Array.isArray(entry) ? entry[1] : entry;
            html += `<pre><code class="language-${lang}">${src.replace(/</g, '&lt;')}</code></pre>`;
          }
          island.outerHTML = html;
        } catch {}
      });

      // Remove script, style, line numbers
      document.querySelectorAll('script, style, [class*="line-number"], [class*="lineNumber"]').forEach(el => el.remove());
      // Flatten block elements inside table cells (prevent newlines in table rows)
      document.querySelectorAll('td p, td div, th p, th div').forEach(el => el.replaceWith(...el.childNodes));
      // Remove hidden panes (show all content-switcher panes)
      document.querySelectorAll('[data-content-switcher-pane][hidden]').forEach(el => el.removeAttribute('hidden'));
      for (const sel of ['article', 'main', '[role="main"]']) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 100) return el.innerHTML;
      }
      return document.body.innerHTML;
    });
    return turndown.turndown(html);
  } catch (err) {
    console.error(`  ✗ ${url}: ${err.message}`);
    return null;
  }
}

const FORCE = process.argv.includes('--force');
const SYNC = process.argv.includes('--sync');

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Discovering URLs from navigation...');
  const urls = await discoverUrls(page);
  console.log(`Found ${urls.length} pages\n`);

  writeFileSync(join(ROOT, 'urls.txt'), urls.join('\n') + '\n');

  const updated = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filePath = urlToFilePath(url);

    if (!FORCE && !SYNC && existsSync(filePath)) {
      console.log(`[${i + 1}/${urls.length}] Skip ${url}`);
      continue;
    }

    console.log(`[${i + 1}/${urls.length}] ${url}`);
    const md = await scrapePage(page, url);
    if (md) {
      const content = `<!-- Source: ${url} -->\n\n${md}`;
      const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
      if (content !== existing) {
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content);
        if (SYNC && existing) updated.push(filePath);
      } else if (SYNC) {
        process.stdout.write(`  (unchanged)\n`);
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();
  if (SYNC && updated.length) {
    console.log(`\n${updated.length} file(s) updated:`);
    updated.forEach(f => console.log(`  ${f}`));
    // Delete corresponding zh/ translations so they get re-translated
    const { unlinkSync } = await import('fs');
    for (const f of updated) {
      const zhPath = f.replace(/\/docs\//, '/zh/');
      try { unlinkSync(zhPath); console.log(`  ✗ removed ${zhPath}`); } catch {}
    }
  } else if (SYNC) {
    console.log('\nAll docs are up to date.');
  }
  console.log('\nDone!');
}

main();
