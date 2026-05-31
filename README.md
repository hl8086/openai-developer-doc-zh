# OpenAI 开发者文档中文翻译

本项目是 [OpenAI Developer Documentation](https://developers.openai.com/api/docs) 的中文翻译，仅用于学习使用。所有内容版权归 OpenAI 所有。

## 在线阅读

👉 **https://hl8086.github.io/openai-developer-doc-zh/**

## 项目结构

```
.
├── docs/                    # 抓取的原始英文文档 (Markdown)
├── zh/                     # 中文翻译文档
├── scripts/
│   ├── scrape.mjs          # 抓取文档内容
│   ├── translate.mjs       # 翻译工作流
│   └── fix-line-numbers.mjs # 修复代码块行号（辅助脚本）
├── urls.txt                # 文档页面 URL 列表
└── README.md
```

## 使用方法

### 1. 安装依赖

```bash
npm install
```

### 2. 抓取文档

```bash
# 首次抓取（只抓取不存在的页面）
node scripts/scrape.mjs

# 同步更新（检测内容变化，只更新有改动的页面，自动清理对应翻译）
node scripts/scrape.mjs --sync

# 全量重新抓取
node scripts/scrape.mjs --force
```

### 3. 翻译文档

需要设置环境变量 `OPENAI_API_KEY`：

```bash
export OPENAI_API_KEY=your-key-here
node scripts/translate.mjs
```

翻译脚本会跳过 `zh/` 中已存在的文件，只翻译新增或被 `--sync` 清理过的文件。

### 4. 日常同步更新

```bash
node scripts/scrape.mjs --sync
node scripts/translate.mjs
```

## 说明

- 抓取脚本使用 Puppeteer 渲染 SPA 页面后提取内容
- 支持表格、多语言代码块（javascript/python/curl）、内容切换面板的正确提取
- 自动过滤页面中的 JS 脚本和行号等 UI 元素
- 翻译脚本调用 OpenAI API (gpt-4o-mini) 进行中英翻译
- 翻译结果保存在 `zh/` 目录，保持与 `docs/` 相同的目录结构

---

> 本项目不隶属于 OpenAI，也未获得 OpenAI 官方授权。如有侵权请联系删除。
