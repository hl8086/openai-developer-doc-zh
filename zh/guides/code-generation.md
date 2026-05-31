<!-- Source: https://developers.openai.com/api/docs/guides/code-generation -->

编写、审查、编辑代码以及回答代码相关问题是当今 OpenAI 模型的主要用例之一。本指南将介绍使用 GPT-5.4 和 Codex 进行代码生成的各种选项。

## 快速开始

[使用 Codex 获取开箱即用的编码代理将你的代码库连接到 Codex，使用软件工程代理加速你的项目。](#use-codex)

[集成编码模型在你的应用中使用 OpenAI 模型。例如，将它们添加到模型选择器中。](#integrate-with-coding-models)

## 使用 Codex

[**Codex**](/codex/overview) 是 OpenAI 的软件开发编码代理。它帮助你编写、审查和调试代码。你可以通过多种界面与 Codex 交互：在 IDE 中、通过 CLI、在网页和移动端，或在 CI/CD 流水线中使用 SDK。Codex 是在你的项目中获得智能体软件工程能力的最佳方式。

Codex 与 GPT-5 系列的最新模型配合效果最佳，例如 [`gpt-5.5`](/api/docs/models/gpt-5.5)。我们提供了一系列专门为 Codex 等编码代理设计的模型，例如 [`gpt-5.3-codex`](/api/docs/models/gpt-5.3-codex)，但我们建议在大多数代码生成任务中使用最新的通用模型。

请参阅 [Codex 文档](https://developers.openai.com/codex) 获取设置指南、参考资料、定价和更多信息。

## 集成编码模型

对于大多数基于 API 的代码生成，建议从 **`gpt-5.5`** 开始。它同时处理通用任务和编码任务，这使其成为一个强大的默认选择——当你的应用需要在同一个地方编写代码、推理需求、检查文档和处理更广泛的工作流时。

以下示例展示了如何使用 [Responses API](/api/docs/api-reference/responses) 进行代码生成：

**大多数编码任务的默认模型**

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const result = await openai.responses.create({
  model: "gpt-5.5",
  input: "Find the null pointer exception: ...your code here...",
  reasoning: { effort: "high" },
});

console.log(result.output_text);
```
```python
from openai import OpenAI
client = OpenAI()

result = client.responses.create(
    model="gpt-5.5",
    input="Find the null pointer exception: ...your code here...",
    reasoning={ "effort": "high" },
)

print(result.output_text)
```
```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Find the null pointer exception: ...your code here...",
    "reasoning": { "effort": "high" }
  }'
```

## 前端开发

我们的 GPT-5 系列模型在前端开发方面表现尤为出色，特别是与 Codex 等编码代理框架结合使用时。

以下演示应用是一次性生成的，即通过单个提示词生成，无需手写代码。使用它们来评估前端生成质量，以及 UI 密集型代码生成工作流的提示词模式。

探索

[![](https://cdn.openai.com/devhub/gpt5prompts/ocean-wave-simulation-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=ocean-wave-simulation-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/brutalist-dev-landing-page-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=brutalist-dev-landing-page-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/solar-system-explorer-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=solar-system-explorer-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/customer-journey-flow-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=customer-journey-flow-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/asteroid-game-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=asteroid-game-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/employee-skills-matrix-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=employee-skills-matrix-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/virtual-drum-kit-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=virtual-drum-kit-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/camping-gear-checklist-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=camping-gear-checklist-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/weather-theatre-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=weather-theatre-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/typing-rain-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=typing-rain-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/holiday-card-for-kids-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=holiday-card-for-kids-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/cloud-painter.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=cloud-painter)[![](https://cdn.openai.com/devhub/gpt5prompts/audio-step-sequencer.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=audio-step-sequencer)[![](https://cdn.openai.com/devhub/gpt5prompts/farewell-message-board.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=farewell-message-board)[![](https://cdn.openai.com/devhub/gpt5prompts/csv-to-charts.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=csv-to-charts)[![](https://cdn.openai.com/devhub/gpt5prompts/espresso.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=espresso)[](/api/docs/guides/code-generation?gallery=open&galleryItem=openai-fm-inspired)[](/api/docs/guides/code-generation?gallery=open&galleryItem=case-study-landing-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=event-count-down)[](/api/docs/guides/code-generation?gallery=open&galleryItem=healthy-meal-tracker)[](/api/docs/guides/code-generation?gallery=open&galleryItem=music-theory-trainer)[](/api/docs/guides/code-generation?gallery=open&galleryItem=online-whiteboard)[](/api/docs/guides/code-generation?gallery=open&galleryItem=festival-lights-show)[](/api/docs/guides/code-generation?gallery=open&galleryItem=company-acronym-list)[](/api/docs/guides/code-generation?gallery=open&galleryItem=event-feedback)[](/api/docs/guides/code-generation?gallery=open&galleryItem=tiny-kanban)[](/api/docs/guides/code-generation?gallery=open&galleryItem=qr-code-generator)[](/api/docs/guides/code-generation?gallery=open&galleryItem=equation-solver-tool)[](/api/docs/guides/code-generation?gallery=open&galleryItem=micro-habit-tracker)[](/api/docs/guides/code-generation?gallery=open&galleryItem=markdown-to-slides)[](/api/docs/guides/code-generation?gallery=open&galleryItem=artisan-csa)[](/api/docs/guides/code-generation?gallery=open&galleryItem=pomodoro)[](/api/docs/guides/code-generation?gallery=open&galleryItem=online-course-landing-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=interactive-world-clock)[](/api/docs/guides/code-generation?gallery=open&galleryItem=online-poll-board)[](/api/docs/guides/code-generation?gallery=open&galleryItem=product-launch-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=falling-object-catcher)[](/api/docs/guides/code-generation?gallery=open&galleryItem=kinetic-typography-studio)[](/api/docs/guides/code-generation?gallery=open&galleryItem=esports-tournament-landing-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=math-practice-drills)[](/api/docs/guides/code-generation?gallery=open&galleryItem=language-learning-flashcards)[](/api/docs/guides/code-generation?gallery=open&galleryItem=webcam-filter-playground)[](/api/docs/guides/code-generation?gallery=open&galleryItem=nonprofit-impact-report)[](/api/docs/guides/code-generation?gallery=open&galleryItem=color-match-challenge)[](/api/docs/guides/code-generation?gallery=open&galleryItem=podcast-homepage)[](/api/docs/guides/code-generation?gallery=open&galleryItem=regex-lab)[](/api/docs/guides/code-generation?gallery=open&galleryItem=target-clicker)[](/api/docs/guides/code-generation?gallery=open&galleryItem=trivia-quiz-game)[](/api/docs/guides/code-generation?gallery=open&galleryItem=weather-theatre)

## 后续步骤

*   访问 [Codex 文档](https://developers.openai.com/codex) 了解 Codex 的功能、在你选择的界面中设置 Codex，或获取更多详细信息。
*   阅读 [使用 GPT-5.5](/api/docs/guides/latest-model) 了解模型选择、功能和迁移指南。
*   参阅 [GPT-5.5 提示词指南](/api/docs/guides/prompt-guidance) 了解在编码和智能体任务中效果良好的提示词模式。
*   在模型页面比较 [`gpt-5.5`](/api/docs/models/gpt-5.5) 和 [`gpt-5.3-codex`](/api/docs/models/gpt-5.3-codex)。
