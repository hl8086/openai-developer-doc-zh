# Deprecations

> 已弃用的模型和功能列表。

## 概述

随着我们推出更安全、更强大的模型，我们会定期淘汰旧模型。依赖 OpenAI 模型的软件可能需要偶尔更新以保持正常运行。受影响的客户将始终通过电子邮件和我们的文档收到通知，重大变更还会通过[博客文章](https://openai.com/blog)发布。

本页列出了所有 API 弃用信息及推荐的替代方案。

## 弃用与旧版

我们使用"弃用"一词来指代淘汰模型或端点的过程。当我们宣布某个模型或端点即将被弃用时，它会立即进入弃用状态。所有被弃用的模型和端点都会有一个关闭日期。在关闭日期到来时，该模型或端点将不再可访问。

我们交替使用"日落"和"关闭"这两个术语来表示模型或端点不再可访问。

我们使用"旧版"一词来指代不再接收更新的模型和端点。我们将端点和模型标记为旧版，是为了向开发者表明我们作为平台的发展方向，以及他们应该迁移到更新的模型或端点。您可以预期旧版模型或端点在未来某个时间点会被弃用。

## 即将弃用

即将弃用的内容列在下方，最新的公告排在最前面。

### 2026-05-08: gpt-5.2-chat-latest 和 gpt-5.3-chat-latest 模型快照

2026 年 5 月 8 日，我们通知了使用 `gpt-5.2-chat-latest` 和 `gpt-5.3-chat-latest` 模型快照的开发者，这些模型将被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| Aug 10, 2026 | `gpt-5.2-chat-latest` | `gpt-5.5` |
| Aug 10, 2026 | `gpt-5.3-chat-latest` | `gpt-5.5` |

### OpenAI 自助微调服务更新

2026 年 5 月 7 日，我们通知了使用 OpenAI 自助微调平台的开发者有关可用性的更新。

微调模型的推理服务将继续可用，直到基础模型被弃用。

| 日期 | 更新内容 |
| --- | --- |
| May 7, 2026 | 未曾运行过微调的组织将无法创建微调任务或进行训练。 |
| July 2, 2026 | 过去 60 天内未对微调模型运行推理的组织将无法再创建微调任务。 |
| Jan 6, 2027 | 现有活跃客户在此日期后将无法再创建新的微调任务。微调模型的推理服务仅在底层基础模型被弃用时才会被禁用。 |

### 2026-04-22: 旧版 GPT 模型快照

为了提高可靠性并使开发者更容易选择合适的模型，我们正在弃用一组较旧的 OpenAI 模型。这些模型的访问权限将在以下日期关闭。

| 关闭日期 | 模型快照 | 替代模型 |
| --- | --- | --- |
| 2026-07-23 | `computer-use-preview-2025-03-11` | `computer-use-preview` | `gpt-5.4-mini` |
| 2026-07-23 | `gpt-4o-mini-search-preview-2025-03-11` | `gpt-5.4-mini` |
| 2026-07-23 | `gpt-4o-mini-tts-2025-03-20` | `gpt-4o-mini-tts-2025-12-15` |
| 2026-07-23 | `gpt-4o-search-preview-2025-03-11` | `gpt-5.4-mini` |
| 2026-07-23 | `gpt-5-chat-latest` | `gpt-5.5` |
| 2026-07-23 | `gpt-5-codex` | `gpt-5.5` |
| 2026-07-23 | `gpt-5.1-chat-latest` | `gpt-5.5` |
| 2026-07-23 | `gpt-5.1-codex` | `gpt-5.5` |
| 2026-07-23 | `gpt-5.1-codex-max` | `gpt-5.5` |
| 2026-07-23 | `gpt-5.1-codex-mini` | `gpt-5.4-mini` |
| 2026-07-23 | `gpt-audio-mini-2025-10-06` | `gpt-audio-1.5` |
| 2026-07-23 | `gpt-realtime-mini-2025-10-06` | `gpt-realtime-mini` |
| 2026-07-23 | `o3-deep-research-2025-06-26` | `o3-deep-research` | `gpt-5.5-pro` |
| 2026-07-23 | `o4-mini-deep-research-2025-06-26` | `o4-mini-deep-research` | `gpt-5.5-pro` |
| 2026-07-23 | `gpt-5.2-codex` | `gpt-5.5` |
| 2026-10-23 | `gpt-3.5-turbo-0125` | `gpt-3.5-turbo`, `gpt-3.5-turbo-completions` | `gpt-5.4-mini` |
| 2026-10-23 | `gpt-4-0613` | `gpt-4`, `gpt-4-0613-completions`, `gpt-4-completions` | `gpt-5.5` |
| 2026-10-23 | `gpt-4-1106-preview` | `gpt-5.5` |
| 2026-10-23 | `gpt-4-turbo` | `gpt-4-turbo-2024-04-09`, `gpt-4-turbo-completions` | `gpt-5.5` |
| 2026-10-23 | `gpt-4.1-nano` | `gpt-4.1-nano-2025-04-14` | `gpt-5.4-nano` |
| 2026-10-23 | `gpt-4o-2024-05-13` | `gpt-5.5` |
| 2026-10-23 | `gpt-image-1` | `gpt-image-2` |
| 2026-10-23 | `o1-2024-12-17` | `o1` | `gpt-5.5` |
| 2026-10-23 | `o1-pro-2025-03-19` | `o1-pro` | `gpt-5.5-pro` |
| 2026-10-23 | `o3-mini-2025-01-31` | `o3-mini` | `gpt-5.5` |
| 2026-10-23 | `ft-o4-mini-2025-04-16` | `gpt-5.4-mini` |
| 2026-10-23 | `o4-mini-2025-04-16` | `o4-mini` | `gpt-5.4-mini` |

我们还将移除以下微调版本：

| 关闭日期 | 模型快照 | 推荐替代基础模型 |
| --- | --- | --- |
| 2026-10-23 | `ft-gpt-3.5-turbo` | `gpt-5.4-mini` |
| 2026-10-23 | `ft-gpt-4` | `gpt-5.5` |
| 2026-10-23 | `ft-gpt-4.1-nano-2025-04-14` | `gpt-5.4-nano` |
| 2026-10-23 | `ft-babbage-002` | `gpt-5.4-mini` |
| 2026-10-23 | `ft-davinci-002` | `gpt-5.4-mini` |

### 2026-03-24: Sora 2 视频生成模型和 Videos API

2026 年 3 月 24 日，我们通知了使用 Videos API 和 Sora 2 视频生成模型别名及快照的开发者，这些将于 2026 年 9 月 24 日被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026-09-24 | Videos API | \--- |
| 2026-09-24 | `sora-2` | \--- |
| 2026-09-24 | `sora-2-pro` | \--- |
| 2026-09-24 | `sora-2-2025-10-06` | \--- |
| 2026-09-24 | `sora-2-2025-12-08` | \--- |
| 2026-09-24 | `sora-2-pro-2025-10-06` | \--- |

### 2025-11-14: DALL·E 模型快照

2025 年 11 月 14 日，我们通知了使用 DALL·E 模型快照的开发者，这些模型将于 2026 年 5 月 12 日被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026-05-12 | `dall-e-2` | `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini` |
| 2026-05-12 | `dall-e-3` | `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini` |

### 2025-09-26: 旧版 GPT 模型快照

为了提高可靠性并使开发者更容易选择合适的模型，我们正在未来六到十二个月内弃用一组使用量下降的较旧 OpenAI 模型。这些模型的访问权限将在以下日期关闭。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026‑03‑26 | `gpt-4-0314` | `gpt-5` or `gpt-4.1*` |
| 2026‑03‑26 | `gpt-4-1106-preview` | `gpt-5` or `gpt-4.1*` |
| 2026‑03‑26 | `gpt-4-0125-preview`（包括指向此快照的 `gpt-4-turbo-preview` 和 `gpt-4-turbo-preview-completions`） | `gpt-5` or `gpt-4.1*` |
| 2026-09-28 | `gpt-3.5-turbo-instruct` | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28 | `babbage-002` | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28 | `davinci-002` | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28 | `gpt-3.5-turbo-1106` | `gpt-5.4-mini` or `gpt-5-mini` |

\*适用于对延迟特别敏感且不需要推理能力的任务

### 2025-09-15: Realtime API Beta

Realtime API Beta 已于 2026 年 5 月 12 日被弃用并从 API 中移除。

Realtime beta API 和已发布的 GA API 之间的接口存在一些关键差异。请参阅[迁移指南](/guides/realtime#beta-to-ga-migration)了解当前 GA 接口和相关 Realtime 文档。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026‑05‑12 | OpenAI-Beta: realtime=v1 | Realtime API |

### 2025-08-20: Assistants API

2025 年 8 月 26 日，我们通知了使用 Assistants API 的开发者，该 API 将在一年后（即 2026 年 8 月 26 日）被弃用并从 API 中移除。

当我们在 [2025 年 3 月](/changelog)发布 [Responses API]( https://developers.openai.com/api/reference/responses/create) 时，我们宣布计划将所有 Assistants API 功能迁移到更易用的 Responses API，并设定了 2026 年的日落日期。

请参阅 Assistants 到 Conversations 的[迁移指南](/assistants/migration)，了解如何将当前集成迁移到 Responses API 和 Conversations API。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026‑08‑26 | Assistants API | Responses API and Conversations API |

### 2025-09-15: gpt-4o-realtime-preview 模型

2025 年 9 月，我们通知了使用 gpt-4o-realtime-preview 模型的开发者，这些模型将在六个月内被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026-05-07 | gpt-4o-realtime-preview | gpt-realtime-1.5 |
| 2026-05-07 | gpt-4o-realtime-preview-2025-06-03 | gpt-realtime-1.5 |
| 2026-05-07 | gpt-4o-realtime-preview-2024-12-17 | gpt-realtime-1.5 |
| 2026-05-07 | gpt-4o-mini-realtime-preview | gpt-realtime-mini |
| 2026-05-07 | gpt-4o-audio-preview | gpt-audio-1.5 |
| 2026-05-07 | gpt-4o-mini-audio-preview | gpt-audio-mini |

## 历史弃用

历史弃用内容列在下方，最新的公告排在最前面。

### 2025-11-18: chatgpt-4o-latest 快照

2025 年 11 月 18 日，我们通知了使用 `chatgpt-4o-latest` 模型快照的开发者，该模型将于 2026 年 2 月 17 日被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026-02-17 | `chatgpt-4o-latest` | `gpt-5.1-chat-latest` |

### 2025-11-17: codex-mini-latest 模型快照

2025 年 11 月 17 日，我们通知了使用 `codex-mini-latest` 模型的开发者，该模型将于 2026 年 2 月 12 日被弃用并从 API 中移除。作为此次弃用的一部分，我们将不再支持旧版本地 shell 工具（该工具仅可与 `codex-mini-latest` 配合使用）。对于新的使用场景，请使用我们最新的 shell 工具。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2026-02-12 | `codex-mini-latest` | `gpt-5-codex-mini` |

### 2025-06-10: gpt-4o-realtime-preview-2024-10-01

2025 年 6 月 10 日，我们通知了使用 gpt-4o-realtime-preview-2024-10-01 的开发者，该模型将在三个月内被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2025-10-10 | gpt-4o-realtime-preview-2024-10-01 | gpt-realtime-1.5 |

### 2025-06-10: gpt-4o-audio-preview-2024-10-01

2025 年 6 月 10 日，我们通知了使用 `gpt-4o-audio-preview-2024-10-01` 的开发者，该模型将在三个月内被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2025-10-10 | `gpt-4o-audio-preview-2024-10-01` | `gpt-audio-1.5` |

### 2025-04-28: text-moderation

2025 年 4 月 28 日，我们通知了使用 `text-moderation` 的开发者，该模型将在六个月内被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2025-10-27 | `text-moderation-007` | `omni-moderation` |
| 2025-10-27 | `text-moderation-stable` | `omni-moderation` |
| 2025-10-27 | `text-moderation-latest` | `omni-moderation` |

### 2025-04-28: o1-preview 和 o1-mini

2025 年 4 月 28 日，我们通知了使用 `o1-preview` 和 `o1-mini` 的开发者，这些模型将分别在三个月和六个月内被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2025-07-28 | `o1-preview` | `o3` |
| 2025-10-27 | `o1-mini` | `o4-mini` |

### 2025-04-14: GPT-4.5-preview

2025 年 4 月 14 日，我们通知开发者 `gpt-4.5-preview` 模型已被弃用，将在未来几个月内从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2025-07-14 | `gpt-4.5-preview` | `gpt-4.1` |

### 2024-10-02: Assistants API beta v1

在 [2024 年 4 月](/assistants/whats-new)我们发布 Assistants API v2 beta 版本时，我们宣布将在 2024 年底前关闭 v1 beta 的访问权限。v1 beta 的访问将于 2024 年 12 月 18 日终止。

请参阅 Assistants API v2 beta [迁移指南](/assistants/migration)，了解如何将工具使用迁移到最新版本的 Assistants API。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2024-12-18 | OpenAI-Beta: assistants=v1 | OpenAI-Beta: assistants=v2 |

### 2024-08-29: babbage-002 和 davinci-002 模型的微调训练

2024 年 8 月 29 日，我们通知了对 `babbage-002` 和 `davinci-002` 进行微调的开发者，从 2024 年 10 月 28 日起将不再支持对这些模型进行新的微调训练。

基于这些基础模型创建的微调模型不受此次弃用影响，但您将无法再使用这些模型创建新的微调版本。

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2024-10-28 | 对 `babbage-002` 进行新的微调训练 | `gpt-4o-mini` |
| 2024-10-28 | 对 `davinci-002` 进行新的微调训练 | `gpt-4o-mini` |

### 2024-06-06: GPT-4-32K 和 Vision Preview 模型

2024 年 6 月 6 日，我们通知了使用 `gpt-4-32k` 和 `gpt-4-vision-preview` 的开发者，这些模型将分别在一年和六个月内被弃用。自 2024 年 6 月 17 日起，只有这些模型的现有用户才能继续使用。

| 关闭日期 | 弃用模型 | 弃用模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| 2025-06-06 | `gpt-4-32k` | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o` |
| 2025-06-06 | `gpt-4-32k-0613` | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o` |
| 2025-06-06 | `gpt-4-32k-0314` | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o` |
| 2024-12-06 | `gpt-4-vision-preview` | $10.00 / 1M input tokens + $30 / 1M output tokens | `gpt-4o` |
| 2024-12-06 | `gpt-4-1106-vision-preview` | $10.00 / 1M input tokens + $30 / 1M output tokens | `gpt-4o` |

### 2023-11-06: 聊天模型更新

2023 年 11 月 6 日，我们[宣布](https://openai.com/blog/new-models-and-developer-products-announced-at-devday)发布了更新的 GPT-3.5-Turbo 模型（现在默认提供 16k 上下文），同时弃用了 `gpt-3.5-turbo-0613` 和 `gpt-3.5-turbo-16k-0613`。自 2024 年 6 月 17 日起，只有这些模型的现有用户才能继续使用。

| 关闭日期 | 弃用模型 | 弃用模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| 2024-09-13 | `gpt-3.5-turbo-0613` | $1.50 / 1M input tokens + $2.00 / 1M output tokens | `gpt-3.5-turbo` |
| 2024-09-13 | `gpt-3.5-turbo-16k-0613` | $3.00 / 1M input tokens + $4.00 / 1M output tokens | `gpt-3.5-turbo` |

基于这些基础模型创建的微调模型不受此次弃用影响，但您将无法再使用这些模型创建新的微调版本。

### 2023-08-22: Fine-tunes 端点

2023 年 8 月 22 日，我们[宣布](https://openai.com/blog/gpt-3-5-turbo-fine-tuning-and-api-updates)了新的微调 API（`/v1/fine_tuning/jobs`），并表示原始的 `/v1/fine-tunes` API 以及旧版模型（包括使用 `/v1/fine-tunes` API 微调的模型）将于 2024 年 1 月 4 日关闭。这意味着使用 `/v1/fine-tunes` API 微调的模型将不再可访问，您需要使用更新的端点和相关基础模型重新微调模型。

#### Fine-tunes 端点

| 关闭日期 | 系统 | 推荐替代 |
| --- | --- | --- |
| 2024-01-04 | `/v1/fine-tunes` | `/v1/fine_tuning/jobs` |

### 2023-07-06: GPT 和 embeddings

2023 年 7 月 6 日，我们[宣布](https://openai.com/blog/gpt-4-api-general-availability)了通过 completions 端点提供的旧版 GPT-3 和 GPT-3.5 模型即将退役。我们还宣布了第一代文本嵌入模型即将退役。它们将于 2024 年 1 月 4 日关闭。

#### InstructGPT 模型

| 关闭日期 | 弃用模型 | 弃用模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| 2024-01-04 | `text-ada-001` | $0.40 / 1M tokens | `gpt-3.5-turbo-instruct` |
| 2024-01-04 | `text-babbage-001` | $0.50 / 1M tokens | `gpt-3.5-turbo-instruct` |
| 2024-01-04 | `text-curie-001` | $2.00 / 1M tokens | `gpt-3.5-turbo-instruct` |
| 2024-01-04 | `text-davinci-001` | $20.00 / 1M tokens | `gpt-3.5-turbo-instruct` |
| 2024-01-04 | `text-davinci-002` | $20.00 / 1M tokens | `gpt-3.5-turbo-instruct` |
| 2024-01-04 | `text-davinci-003` | $20.00 / 1M tokens | `gpt-3.5-turbo-instruct` |

替代模型 `gpt-3.5-turbo-instruct` 的定价可在[定价页面](https://openai.com/api/pricing)查看。

#### 基础 GPT 模型

| 关闭日期 | 弃用模型 | 弃用模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| 2024-01-04 | `ada` | $0.40 / 1M tokens | `babbage-002` |
| 2024-01-04 | `babbage` | $0.50 / 1M tokens | `babbage-002` |
| 2024-01-04 | `curie` | $2.00 / 1M tokens | `davinci-002` |
| 2024-01-04 | `davinci` | $20.00 / 1M tokens | `davinci-002` |
| 2024-01-04 | `code-davinci-002` | \--- | `gpt-3.5-turbo-instruct` |

替代模型 `babbage-002` 和 `davinci-002` 的定价可在[定价页面](https://openai.com/api/pricing)查看。

#### 编辑模型和端点

| 关闭日期 | 模型 / 系统 | 推荐替代 |
| --- | --- | --- |
| 2024-01-04 | `text-davinci-edit-001` | `gpt-4o` |
| 2024-01-04 | `code-davinci-edit-001` | `gpt-4o` |
| 2024-01-04 | `/v1/edits` | `/v1/chat/completions` |

#### 微调 GPT 模型

| 关闭日期 | 弃用模型 | 训练价格 | 使用价格 | 推荐替代 |
| --- | --- | --- | --- | --- |
| 2024-01-04 | `ada` | $0.40 / 1M tokens | $1.60 / 1M tokens | `babbage-002` |
| 2024-01-04 | `babbage` | $0.60 / 1M tokens | $2.40 / 1M tokens | `babbage-002` |
| 2024-01-04 | `curie` | $3.00 / 1M tokens | $12.00 / 1M tokens | `davinci-002` |
| 2024-01-04 | `davinci` | $30.00 / 1M tokens | $120.00 / 1K tokens | `davinci-002`, `gpt-3.5-turbo`, `gpt-4o` |

#### 第一代文本嵌入模型

| 关闭日期 | 弃用模型 | 弃用模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| 2024-01-04 | `text-similarity-ada-001` | $4.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-ada-doc-001` | $4.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-ada-query-001` | $4.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `code-search-ada-code-001` | $4.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `code-search-ada-text-001` | $4.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-similarity-babbage-001` | $5.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-babbage-doc-001` | $5.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-babbage-query-001` | $5.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `code-search-babbage-code-001` | $5.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `code-search-babbage-text-001` | $5.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-similarity-curie-001` | $20.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-curie-doc-001` | $20.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-curie-query-001` | $20.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-similarity-davinci-001` | $200.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-davinci-doc-001` | $200.00 / 1M tokens | `text-embedding-3-small` |
| 2024-01-04 | `text-search-davinci-query-001` | $200.00 / 1M tokens | `text-embedding-3-small` |

### 2023-06-13: 更新的聊天模型

2023 年 6 月 13 日，我们在[函数调用和其他 API 更新](https://openai.com/blog/function-calling-and-other-api-updates)博客文章中宣布了新的聊天模型版本。三个原始版本将最早于 2024 年 6 月退役。自 2024 年 1 月 10 日起，只有这些模型的现有用户才能继续使用。

| 关闭日期 | 旧版模型 | 旧版模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| at earliest 2024-06-13 | `gpt-4-0314` | $30.00 / 1M input tokens + $60.00 / 1M output tokens | `gpt-4o` |

| 关闭日期 | 弃用模型 | 弃用模型价格 | 推荐替代 |
| --- | --- | --- | --- |
| 2024-09-13 | `gpt-3.5-turbo-0301` | $15.00 / 1M input tokens + $20.00 / 1M output tokens | `gpt-3.5-turbo` |
| 2025-06-06 | `gpt-4-32k-0314` | $60.00 / 1M input tokens + $120.00 / 1M output tokens | `gpt-4o` |

### 2023-03-20: Codex 模型

| 关闭日期 | 弃用模型 | 推荐替代 |
| --- | --- | --- |
| 2023-03-23 | `code-davinci-002` | `gpt-4o` |
| 2023-03-23 | `code-davinci-001` | `gpt-4o` |
| 2023-03-23 | `code-cushman-002` | `gpt-4o` |
| 2023-03-23 | `code-cushman-001` | `gpt-4o` |

### 2022-06-03: 旧版端点

| 关闭日期 | 系统 | 推荐替代 |
| --- | --- | --- |
| 2022-12-03 | `/v1/engines` | [/v1/models](https://platform.openai.com/docs/api-reference/models/list) |
| 2022-12-03 | `/v1/search` | [查看迁移指南](https://help.openai.com/en/articles/6272952-search-transition-guide) |
| 2022-12-03 | `/v1/classifications` | [查看迁移指南](https://help.openai.com/en/articles/6272941-classifications-transition-guide) |
| 2022-12-03 | `/v1/answers` | [查看迁移指南](https://help.openai.com/en/articles/6233728-answers-transition-guide) |
