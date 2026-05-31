import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const DOCS_DIR = 'docs';

function cleanMd(content) {
  // Remove inline script blocks
  content = content.replace(/astro-island.*?;\}\)\(\);/gs, '');
  content = content.replace(/if \(!window\.__contentSwitcherInit\)[\s\S]*?(?=\n\n[A-Z\[#])/g, '');
  // Remove remaining JS noise patterns
  content = content.replace(/\((?:self|window)\.[^)]*\)\(\);/g, '');
  // Clean up excessive blank lines
  content = content.replace(/\n{4,}/g, '\n\n\n');
  return content.trim() + '\n';
}

function walk(dir, files = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (f.endsWith('.md')) files.push(p);
  }
  return files;
}

const files = walk(DOCS_DIR);
for (const f of files) {
  const content = readFileSync(f, 'utf-8');
  const cleaned = cleanMd(content);
  if (cleaned !== content) {
    writeFileSync(f, cleaned);
    console.log(`Cleaned: ${f}`);
  }
}
console.log(`Done. Processed ${files.length} files.`);
