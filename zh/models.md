
# 模型

## 选择模型

如果你不确定从哪里开始，请使用 gpt-5.5，这是我们用于复杂推理和编程的旗舰模型。如果你想优化延迟和成本，可以选择较小的变体，如 gpt-5.4-mini 或 gpt-5.4-nano。

所有最新的 OpenAI 模型都支持文本和图像输入、文本输出、多语言能力和视觉功能。模型可通过 [Responses API](https://developers.openai.com/api/reference/responses) 和我们的[客户端 SDK](/libraries) 使用。

## 前沿模型

使用 gpt-5.5 进行复杂推理和编程，或选择 gpt-5.4-mini 和 gpt-5.4-nano 以获得更低延迟、更低成本的工作负载。

| 模型 | Model ID | 描述 | 输入价格 | 输出价格 | 延迟 | 最大输出 | 上下文窗口 | 知识截止 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **GPT-5.5** | gpt-5.5 | 面向编程和专业工作的新一代智能 | $5 / MTok | $30 / MTok | 快速 | 128K tokens | 1M | 2025-12-01 |
| **GPT-5.4** | gpt-5.4 | 面向编程和专业工作的更实惠模型 | $2.50 / MTok | $15 / MTok | 快速 | 128K tokens | 1M | 2025-08-31 |
| **GPT-5.4 mini** | gpt-5.4-mini | 最强大的 mini 模型，适用于编程、计算机使用和子代理 | $0.75 / MTok | $4.50 / MTok | 更快 | 128K tokens | 400K | 2025-08-31 |

所有前沿模型支持 [Reasoning](https://developers.openai.com/api/docs/guides/reasoning#get-started-with-reasoning)（none / low / medium / high / xhigh）和[工具](/guides/tools)（Functions, Web search, File search, Computer use）。

## 专用模型

为特定任务专门构建。

### 图像

用于图像生成和编辑的模型

| 模型 | 描述 |
| --- | --- |
| [GPT Image 2](/models/gpt-image-2) | 最先进的图像生成模型 |

### 实时

用于实时语音和翻译的模型

| 模型 | 描述 |
| --- | --- |
| [gpt-realtime-2](/models/gpt-realtime-2) | 用于实时语音交互的推理模型 |
| [gpt-realtime-translate](/models/gpt-realtime-translate) | 流式语音到语音翻译模型 |
| [gpt-realtime-1.5](/models/gpt-realtime-1.5) | 音频输入、音频输出的最佳语音模型 |
| [gpt-realtime-mini](/models/gpt-realtime-mini) | GPT Realtime 的高性价比版本 |

### 语音生成

用于从文本生成自然语音的模型

| 模型 | 描述 |
| --- | --- |
| [GPT-4o mini TTS](/models/gpt-4o-mini-tts) | 由 GPT-4o mini 驱动的文本转语音模型 |

### 转录

用于将语音转录为文本的模型

| 模型 | 描述 |
| --- | --- |
| [gpt-realtime-whisper](/models/gpt-realtime-whisper) | 用于实时转录的流式语音转文本模型 |
| [GPT-4o Transcribe](/models/gpt-4o-transcribe) | 由 GPT-4o 驱动的语音转文本模型 |
| [GPT-4o mini Transcribe](/models/gpt-4o-mini-transcribe) | 由 GPT-4o mini 驱动的语音转文本模型 |

## 浏览我们完整的模型目录

适用于各种任务的多样化模型。

[我们如何使用你的数据](/guides/your-data) · [已弃用的模型](/deprecations)
