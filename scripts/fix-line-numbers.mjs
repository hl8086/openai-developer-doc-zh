import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

import { readdirSync, statSync } from 'fs';

function walk(dir) {
  let files = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) files = files.concat(walk(p));
    else if (p.endsWith('.md')) files.push(p);
  }
  return files;
}

// Match code blocks that start with sequential line numbers
const codeBlockRe = /```(\w*)\n([\s\S]*?)```/g;

function stripLineNumbers(code) {
  const lines = code.split('\n');
  // Detect if the block starts with sequential numbers
  let numCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === String(i + 1)) numCount++;
    else break;
  }
  if (numCount >= 2) {
    return lines.slice(numCount).join('\n');
  }
  return code;
}

let fixed = 0;
for (const dir of ['docs', 'zh']) {
  const dirPath = join(ROOT, dir);
  let files;
  try { files = walk(dirPath); } catch { continue; }
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const newContent = content.replace(codeBlockRe, (match, lang, code) => {
      const stripped = stripLineNumbers(code);
      if (stripped !== code) {
        fixed++;
        return `\`\`\`${lang}\n${stripped}\`\`\``;
      }
      return match;
    });
    if (newContent !== content) {
      writeFileSync(file, newContent);
    }
  }
}
console.log(`Fixed ${fixed} code blocks.`);
