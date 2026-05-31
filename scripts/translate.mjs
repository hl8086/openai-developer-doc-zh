import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs');
const ZH_DIR = join(ROOT, 'zh');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

function getAllMdFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) getAllMdFiles(full, files);
    else if (entry.endsWith('.md')) files.push(full);
  }
  return files;
}

async function translate(text) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是一个技术文档翻译专家。将以下英文 Markdown 文档翻译为中文。保留所有 Markdown 格式、代码块、链接。仅翻译自然语言文本，不翻译代码、URL、专有名词（如 API 名称、模型名称）。' },
        { role: 'user', content: text }
      ],
      temperature: 0.1
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function main() {
  const files = getAllMdFiles(DOCS_DIR);
  console.log(`Found ${files.length} files to translate`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rel = relative(DOCS_DIR, file);
    const outPath = join(ZH_DIR, rel);

    // Skip if already translated
    try { statSync(outPath); console.log(`[${i + 1}/${files.length}] Skip ${rel}`); continue; } catch {}

    console.log(`[${i + 1}/${files.length}] Translating ${rel}`);
    const content = readFileSync(file, 'utf-8');
    const translated = await translate(content);

    if (translated) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, translated);
    }

    // Rate limit: ~1 req/sec
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Done!');
}

main();
