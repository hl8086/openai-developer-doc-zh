# OpenAI 开发者文档中文翻译

本项目是 [OpenAI Developer Documentation](https://developers.openai.com/api/docs) 的中文翻译，仅用于学习使用。所有内容版权归 OpenAI 所有。

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

## 文档目录

> 按官方导航分类。每条包含官方英文链接和本仓库中文翻译链接。

### Get started

- Overview · [EN](https://developers.openai.com/api/docs) · [中文](zh/quickstart.md)
- Quickstart · [EN](https://developers.openai.com/api/docs/quickstart) · [中文](zh/quickstart.md)
- Models · [EN](https://developers.openai.com/api/docs/models) · [中文](zh/models.md)
- Pricing · [EN](https://developers.openai.com/api/docs/pricing) · [中文](zh/pricing.md)

### SDKs and CLI

- OpenAI SDK · [EN](https://developers.openai.com/api/docs/libraries) · [中文](zh/libraries.md)
- Agents SDK · [EN](https://developers.openai.com/api/docs/guides/agents) · [中文](zh/guides/agents.md)
- OpenAI CLI · [EN](https://developers.openai.com/api/docs/libraries/openai-cli) · [中文](zh/libraries/openai-cli.md)

### Core concepts

- Latest: GPT-5.5 · [EN](https://developers.openai.com/api/docs/guides/latest-model) · [中文](zh/guides/latest-model.md)
- Prompt guidance · [EN](https://developers.openai.com/api/docs/guides/prompt-guidance) · [中文](zh/guides/prompt-guidance.md)
- Text generation · [EN](https://developers.openai.com/api/docs/guides/text) · [中文](zh/guides/text.md)
- Code generation · [EN](https://developers.openai.com/api/docs/guides/code-generation) · [中文](zh/guides/code-generation.md)
- Images and vision · [EN](https://developers.openai.com/api/docs/guides/images-vision) · [中文](zh/guides/images-vision.md)
- Audio and speech · [EN](https://developers.openai.com/api/docs/guides/audio) · [中文](zh/guides/audio.md)
- Structured output · [EN](https://developers.openai.com/api/docs/guides/structured-outputs) · [中文](zh/guides/structured-outputs.md)
- Function calling · [EN](https://developers.openai.com/api/docs/guides/function-calling) · [中文](zh/guides/function-calling.md)
- Responses API · [EN](https://developers.openai.com/api/docs/guides/migrate-to-responses) · [中文](zh/guides/migrate-to-responses.md)
- Using tools · [EN](https://developers.openai.com/api/docs/guides/tools) · [中文](zh/guides/tools.md)

### Agents SDK

- Overview · [EN](https://developers.openai.com/api/docs/guides/agents) · [中文](zh/guides/agents.md)
- Quickstart · [EN](https://developers.openai.com/api/docs/guides/agents/quickstart) · [中文](zh/guides/agents/quickstart.md)
- Agent definitions · [EN](https://developers.openai.com/api/docs/guides/agents/define-agents) · [中文](zh/guides/agents/define-agents.md)
- Models and providers · [EN](https://developers.openai.com/api/docs/guides/agents/models) · [中文](zh/guides/agents/models.md)
- Running agents · [EN](https://developers.openai.com/api/docs/guides/agents/running-agents) · [中文](zh/guides/agents/running-agents.md)
- Sandbox agents · [EN](https://developers.openai.com/api/docs/guides/agents/sandboxes) · [中文](zh/guides/agents/sandboxes.md)
- Orchestration · [EN](https://developers.openai.com/api/docs/guides/agents/orchestration) · [中文](zh/guides/agents/orchestration.md)
- Guardrails · [EN](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) · [中文](zh/guides/agents/guardrails-approvals.md)
- Results and state · [EN](https://developers.openai.com/api/docs/guides/agents/results) · [中文](zh/guides/agents/results.md)
- Integrations and observability · [EN](https://developers.openai.com/api/docs/guides/agents/integrations-observability) · [中文](zh/guides/agents/integrations-observability.md)
- Voice agents · [EN](https://developers.openai.com/api/docs/guides/voice-agents) · [中文](zh/guides/voice-agents.md)

### Agent Builder

- Overview · [EN](https://developers.openai.com/api/docs/guides/agent-builder) · [中文](zh/guides/agent-builder.md)
- Node reference · [EN](https://developers.openai.com/api/docs/guides/node-reference) · [中文](zh/guides/node-reference.md)

### ChatKit

- Overview · [EN](https://developers.openai.com/api/docs/guides/chatkit) · [中文](zh/guides/chatkit.md)
- Customize · [EN](https://developers.openai.com/api/docs/guides/chatkit-themes) · [中文](zh/guides/chatkit-themes.md)
- Widgets · [EN](https://developers.openai.com/api/docs/guides/chatkit-widgets) · [中文](zh/guides/chatkit-widgets.md)
- Actions · [EN](https://developers.openai.com/api/docs/guides/chatkit-actions) · [中文](zh/guides/chatkit-actions.md)
- Advanced integrations · [EN](https://developers.openai.com/api/docs/guides/custom-chatkit) · [中文](zh/guides/custom-chatkit.md)

### Tools

- Web search · [EN](https://developers.openai.com/api/docs/guides/tools-web-search) · [中文](zh/guides/tools-web-search.md)
- MCP and Connectors · [EN](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) · [中文](zh/guides/tools-connectors-mcp.md)
- Secure MCP Tunnel · [EN](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) · [中文](zh/guides/secure-mcp-tunnels.md)
- Skills · [EN](https://developers.openai.com/api/docs/guides/tools-skills) · [中文](zh/guides/tools-skills.md)
- Shell · [EN](https://developers.openai.com/api/docs/guides/tools-shell) · [中文](zh/guides/tools-shell.md)
- Computer use · [EN](https://developers.openai.com/api/docs/guides/tools-computer-use) · [中文](zh/guides/tools-computer-use.md)
- File search · [EN](https://developers.openai.com/api/docs/guides/tools-file-search) · [中文](zh/guides/tools-file-search.md)
- Retrieval · [EN](https://developers.openai.com/api/docs/guides/retrieval) · [中文](zh/guides/retrieval.md)
- Tool search · [EN](https://developers.openai.com/api/docs/guides/tools-tool-search) · [中文](zh/guides/tools-tool-search.md)
- Apply Patch · [EN](https://developers.openai.com/api/docs/guides/tools-apply-patch) · [中文](zh/guides/tools-apply-patch.md)
- Local shell · [EN](https://developers.openai.com/api/docs/guides/tools-local-shell) · [中文](zh/guides/tools-local-shell.md)
- Image generation · [EN](https://developers.openai.com/api/docs/guides/tools-image-generation) · [中文](zh/guides/tools-image-generation.md)
- Code interpreter · [EN](https://developers.openai.com/api/docs/guides/tools-code-interpreter) · [中文](zh/guides/tools-code-interpreter.md)

### Run and scale

- Conversation state · [EN](https://developers.openai.com/api/docs/guides/conversation-state) · [中文](zh/guides/conversation-state.md)
- Background mode · [EN](https://developers.openai.com/api/docs/guides/background) · [中文](zh/guides/background.md)
- Streaming · [EN](https://developers.openai.com/api/docs/guides/streaming-responses) · [中文](zh/guides/streaming-responses.md)
- WebSocket mode · [EN](https://developers.openai.com/api/docs/guides/websocket-mode) · [中文](zh/guides/websocket-mode.md)
- Webhooks · [EN](https://developers.openai.com/api/docs/guides/webhooks) · [中文](zh/guides/webhooks.md)
- File inputs · [EN](https://developers.openai.com/api/docs/guides/file-inputs) · [中文](zh/guides/file-inputs.md)

### Context management

- Compaction · [EN](https://developers.openai.com/api/docs/guides/compaction) · [中文](zh/guides/compaction.md)
- Counting tokens · [EN](https://developers.openai.com/api/docs/guides/token-counting) · [中文](zh/guides/token-counting.md)
- Prompt caching · [EN](https://developers.openai.com/api/docs/guides/prompt-caching) · [中文](zh/guides/prompt-caching.md)

### Prompting

- Overview · [EN](https://developers.openai.com/api/docs/guides/prompting) · [中文](zh/guides/prompting.md)
- Prompt engineering · [EN](https://developers.openai.com/api/docs/guides/prompt-engineering) · [中文](zh/guides/prompt-engineering.md)
- Citation formatting · [EN](https://developers.openai.com/api/docs/guides/citation-formatting) · [中文](zh/guides/citation-formatting.md)
- Migration guide · [EN](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) · [中文](zh/guides/prompting/migrate-from-prompt-object.md)

### Reasoning

- Reasoning models · [EN](https://developers.openai.com/api/docs/guides/reasoning) · [中文](zh/guides/reasoning.md)
- Reasoning best practices · [EN](https://developers.openai.com/api/docs/guides/reasoning-best-practices) · [中文](zh/guides/reasoning-best-practices.md)

### Evaluation

- Getting started · [EN](https://developers.openai.com/api/docs/guides/evaluation-getting-started) · [中文](zh/guides/evaluation-getting-started.md)
- Working with evals · [EN](https://developers.openai.com/api/docs/guides/evals) · [中文](zh/guides/evals.md)
- Prompt optimizer · [EN](https://developers.openai.com/api/docs/guides/prompt-optimizer) · [中文](zh/guides/prompt-optimizer.md)
- External models · [EN](https://developers.openai.com/api/docs/guides/external-models) · [中文](zh/guides/external-models.md)
- Best practices · [EN](https://developers.openai.com/api/docs/guides/evaluation-best-practices) · [中文](zh/guides/evaluation-best-practices.md)

### Realtime and audio

- Overview · [EN](https://developers.openai.com/api/docs/guides/realtime) · [中文](zh/guides/realtime.md)
- Voice agents · [EN](https://developers.openai.com/api/docs/guides/voice-agents) · [中文](zh/guides/voice-agents.md)
- Live translation · [EN](https://developers.openai.com/api/docs/guides/realtime-translation) · [中文](zh/guides/realtime-translation.md)
- Realtime transcription · [EN](https://developers.openai.com/api/docs/guides/realtime-transcription) · [中文](zh/guides/realtime-transcription.md)
- Speech to text · [EN](https://developers.openai.com/api/docs/guides/speech-to-text) · [中文](zh/guides/speech-to-text.md)
- Speech generation · [EN](https://developers.openai.com/api/docs/guides/text-to-speech) · [中文](zh/guides/text-to-speech.md)
- Realtime prompting guide · [EN](https://developers.openai.com/api/docs/guides/realtime-models-prompting) · [中文](zh/guides/realtime-models-prompting.md)
- WebRTC · [EN](https://developers.openai.com/api/docs/guides/realtime-webrtc) · [中文](zh/guides/realtime-webrtc.md)
- WebSocket · [EN](https://developers.openai.com/api/docs/guides/realtime-websocket) · [中文](zh/guides/realtime-websocket.md)
- SIP · [EN](https://developers.openai.com/api/docs/guides/realtime-sip) · [中文](zh/guides/realtime-sip.md)
- Managing conversations · [EN](https://developers.openai.com/api/docs/guides/realtime-conversations) · [中文](zh/guides/realtime-conversations.md)
- Voice activity detection · [EN](https://developers.openai.com/api/docs/guides/realtime-vad) · [中文](zh/guides/realtime-vad.md)
- Realtime with tools · [EN](https://developers.openai.com/api/docs/guides/realtime-mcp) · [中文](zh/guides/realtime-mcp.md)
- Webhooks and server-side controls · [EN](https://developers.openai.com/api/docs/guides/realtime-server-controls) · [中文](zh/guides/realtime-server-controls.md)
- Managing costs · [EN](https://developers.openai.com/api/docs/guides/realtime-costs) · [中文](zh/guides/realtime-costs.md)

### Model optimization

- Optimization cycle · [EN](https://developers.openai.com/api/docs/guides/model-optimization) · [中文](zh/guides/model-optimization.md)
- Supervised fine-tuning · [EN](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) · [中文](zh/guides/supervised-fine-tuning.md)
- Vision fine-tuning · [EN](https://developers.openai.com/api/docs/guides/vision-fine-tuning) · [中文](zh/guides/vision-fine-tuning.md)
- Direct preference optimization · [EN](https://developers.openai.com/api/docs/guides/direct-preference-optimization) · [中文](zh/guides/direct-preference-optimization.md)
- Reinforcement fine-tuning · [EN](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning) · [中文](zh/guides/reinforcement-fine-tuning.md)
- RFT use cases · [EN](https://developers.openai.com/api/docs/guides/rft-use-cases) · [中文](zh/guides/rft-use-cases.md)
- Best practices · [EN](https://developers.openai.com/api/docs/guides/fine-tuning-best-practices) · [中文](zh/guides/fine-tuning-best-practices.md)
- Graders · [EN](https://developers.openai.com/api/docs/guides/graders) · [中文](zh/guides/graders.md)

### Specialized models

- Image generation · [EN](https://developers.openai.com/api/docs/guides/image-generation) · [中文](zh/guides/image-generation.md)
- Video generation · [EN](https://developers.openai.com/api/docs/guides/video-generation) · [中文](zh/guides/video-generation.md)
- Deep research · [EN](https://developers.openai.com/api/docs/guides/deep-research) · [中文](zh/guides/deep-research.md)
- Embeddings · [EN](https://developers.openai.com/api/docs/guides/embeddings) · [中文](zh/guides/embeddings.md)
- Moderation · [EN](https://developers.openai.com/api/docs/guides/moderation) · [中文](zh/guides/moderation.md)

### Going live

- Production best practices · [EN](https://developers.openai.com/api/docs/guides/production-best-practices) · [中文](zh/guides/production-best-practices.md)
- Workload identity federation · [EN](https://developers.openai.com/api/docs/guides/workload-identity-federation) · [中文](zh/guides/workload-identity-federation.md)
- Deployment checklist · [EN](https://developers.openai.com/api/docs/guides/deployment-checklist) · [中文](zh/guides/deployment-checklist.md)
- Latency optimization · [EN](https://developers.openai.com/api/docs/guides/latency-optimization) · [中文](zh/guides/latency-optimization.md)
- Predicted Outputs · [EN](https://developers.openai.com/api/docs/guides/predicted-outputs) · [中文](zh/guides/predicted-outputs.md)
- Priority processing · [EN](https://developers.openai.com/api/docs/guides/priority-processing) · [中文](zh/guides/priority-processing.md)
- Batch · [EN](https://developers.openai.com/api/docs/guides/batch) · [中文](zh/guides/batch.md)
- Flex processing · [EN](https://developers.openai.com/api/docs/guides/flex-processing) · [中文](zh/guides/flex-processing.md)
- Accuracy optimization · [EN](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy) · [中文](zh/guides/optimizing-llm-accuracy.md)
- Safety best practices · [EN](https://developers.openai.com/api/docs/guides/safety-best-practices) · [中文](zh/guides/safety-best-practices.md)
- Safety checks · [EN](https://developers.openai.com/api/docs/guides/safety-checks) · [中文](zh/guides/safety-checks.md)

### Legacy APIs

- Assistants API - Migration guide · [EN](https://developers.openai.com/api/docs/assistants/migration) · [中文](zh/assistants/migration.md)
- Assistants API - Deep dive · [EN](https://developers.openai.com/api/docs/assistants/deep-dive) · [中文](zh/assistants/deep-dive.md)

### Resources

- Changelog · [EN](https://developers.openai.com/api/docs/changelog) · [中文](zh/changelog.md)
- Your data · [EN](https://developers.openai.com/api/docs/guides/your-data) · [中文](zh/guides/your-data.md)
- Permissions · [EN](https://developers.openai.com/api/docs/guides/rbac) · [中文](zh/guides/rbac.md)
- Rate limits · [EN](https://developers.openai.com/api/docs/guides/rate-limits) · [中文](zh/guides/rate-limits.md)
- Admin APIs · [EN](https://developers.openai.com/api/docs/guides/admin-apis) · [中文](zh/guides/admin-apis.md)
- Deprecations · [EN](https://developers.openai.com/api/docs/deprecations) · [中文](zh/deprecations.md)
- MCP for deep research · [EN](https://developers.openai.com/api/docs/mcp) · [中文](zh/mcp.md)
- Developer mode · [EN](https://developers.openai.com/api/docs/guides/developer-mode) · [中文](zh/guides/developer-mode.md)

### ChatGPT Actions

- Introduction · [EN](https://developers.openai.com/api/docs/actions/introduction) · [中文](zh/actions/introduction.md)
- Getting started · [EN](https://developers.openai.com/api/docs/actions/getting-started) · [中文](zh/actions/getting-started.md)
- Actions library · [EN](https://developers.openai.com/api/docs/actions/actions-library) · [中文](zh/actions/actions-library.md)
- Authentication · [EN](https://developers.openai.com/api/docs/actions/authentication) · [中文](zh/actions/authentication.md)
- Production · [EN](https://developers.openai.com/api/docs/actions/production) · [中文](zh/actions/production.md)
- Data retrieval · [EN](https://developers.openai.com/api/docs/actions/data-retrieval) · [中文](zh/actions/data-retrieval.md)
- Sending files · [EN](https://developers.openai.com/api/docs/actions/sending-files) · [中文](zh/actions/sending-files.md)

---

> 本项目不隶属于 OpenAI，也未获得 OpenAI 官方授权。如有侵权请联系删除。