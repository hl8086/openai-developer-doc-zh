# GPT-5.4

[模型](/models)

![gpt-5.4]( https://cdn.openai.com/API/docs/images/api/models/icons/gpt-5.4.png)

GPT-5.4

默认

一款更经济实惠的编程和专业工作模型。

一款更经济实惠的编程和专业工作模型。

对比在 Playground 中试用

推理

最高

速度

中等

价格

$2.5•$15

输入•输出

输入

文本、图像

输出

文本

GPT-5.4 是我们用于复杂专业工作的前沿模型。在我们的[最新模型指南](/guides/latest-model)中了解更多。Reasoning.effort 支持：none（默认）、low、medium、high 和 xhigh。

1,050,000 上下文窗口

128,000 最大输出 token 数

2025 年 8 月 31 日知识截止日期

推理 token 支持

定价

定价基于使用的 token 数量，或根据模型类型的其他指标。对于工具专用模型（如搜索和计算机使用），每次工具调用会收取费用。详情请参阅[定价页面](/pricing)。

文本 token

每 1M token

∙

Batch API 价格

输入

$2.50

缓存输入

$0.25

输出

$15.00

快速对比

输入

缓存输入

输出

GPT-5.4

$2.50

GPT-5.2

$1.75

GPT-5.4 mini

$0.75

对于具有 1.05M 上下文窗口的模型（GPT-5.4 和 GPT-5.4 pro），输入 token 超过 272K 的提示，整个会话的标准、批量和弹性处理价格为输入 2 倍、输出 1.5 倍。

区域处理（数据驻留）端点对 GPT-5.4 和 GPT-5.4 pro 收取 10% 的附加费。

模态

文本

输入和输出

图像

仅输入

音频

不支持

视频

不支持

端点

Chat Completions

v1/chat/completions

Responses

v1/responses

Realtime

v1/realtime

Realtime translation

v1/realtime/translations

Realtime transcription

v1/realtime/transcription\_sessions

Assistants

v1/assistants

Batch

v1/batch

Fine-tuning

v1/fine-tuning

Embeddings

v1/embeddings

Image generation

v1/images/generations

Videos

v1/videos

Image edit

v1/images/edits

Speech generation

v1/audio/speech

Transcription

v1/audio/transcriptions

Translation

v1/audio/translations

Moderation

v1/moderations

Completions (legacy)

v1/completions

功能

流式输出

支持

函数调用

支持

结构化输出

支持

微调

不支持

工具

使用 Responses API 时此模型支持的工具。

Web search

支持

File search

支持

Image generation

支持

Code interpreter

支持

Hosted shell

支持

Apply patch

支持

Skills

支持

Computer use

支持

MCP

支持

Tool search

支持

快照

快照允许您锁定模型的特定版本，以便性能和行为保持一致。以下是 GPT-5.4 所有可用快照和别名的列表。


gpt-5.4

gpt-5.4-2026-03-05

gpt-5.4-2026-03-05

速率限制

速率限制通过对给定时间段内的请求、token、音频时长或其他使用量设置特定上限，确保对 API 的公平和可靠访问。您的使用层级决定了这些限制的高低，并会随着您发送更多请求和在 API 上花费更多而自动提升。

长上下文

| 层级 | RPM | TPM | 批量队列限制 |
| --- | --- | --- | --- |
| 免费 | 不支持 |
| Tier 1 | 500 | 500,000 | 1,500,000 |
| Tier 2 | 5,000 | 1,000,000 | 3,000,000 |
| Tier 3 | 5,000 | 2,000,000 | 100,000,000 |
| Tier 4 | 10,000 | 4,000,000 | 200,000,000 |
| Tier 5 | 15,000 | 40,000,000 | 15,000,000,000 |
