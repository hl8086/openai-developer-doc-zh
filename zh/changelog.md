
# 更新日志

即将弃用的内容可以在[弃用页面](/deprecations)找到。

### 2026 年 5 月

5 月 28 日

更新

chat-latest

发布了 `chat-latest` 快照，指向当前 ChatGPT 中使用的最新 Instant 模型。我们建议在生产 API 使用中利用 [GPT-5.5](/models/gpt-5.5)，但欢迎使用此模型来测试聊天用例的最新改进。底层模型快照将定期更新。阅读更多[详情](/models/chat-latest)。

5 月 26 日

功能

发布了[工作负载身份联合](/guides/workload-identity-federation)。受信任的工作负载可以将外部签发的身份令牌交换为短期 OpenAI 访问令牌，无需存储长期 API 密钥。

5 月 26 日

更新

新增了 [Admin API](/guides/admin-apis) 功能，用于管理支出警报、模型允许列表、数据保留设置和托管工具权限，以及查询细粒度的账单明细项。

5 月 19 日

功能

为企业客户发布了 [Secure MCP Tunnel](/guides/secure-mcp-tunnels)。Secure MCP Tunnel 允许支持的 OpenAI 产品（包括 ChatGPT 网页版、Codex、Responses API 和 AgentKit）通过客户托管的 `tunnel-client` 连接到私有或本地 MCP 服务器，无需将这些服务器暴露到公共互联网。

5 月 19 日

更新

您现在可以管理多个 IP 允许列表，并将每个列表应用于项目级别或整个组织范围。要进行配置，请前往 [Settings > Security > IP allowlist](https://platform.openai.com/settings/organization/security/ip-allowlist)。

5 月 12 日

更新

dall-e-2

dall-e-3

v1/realtime

弃用了 DALL·E 模型快照和 Realtime API Beta。

DALL·E 模型快照 `dall-e-2` 和 `dall-e-3` 已于 2026 年 5 月 12 日弃用并从 API 中移除。我们建议改用 `gpt-image-2`、`gpt-image-1` 或 `gpt-image-1-mini`。

Realtime API Beta 已于 2026 年 5 月 12 日弃用并从 API 中移除。如果您仍在使用 beta 接口，请迁移到正式发布的 Realtime API。参见[迁移指南](/guides/realtime#beta-to-ga-migration)和完整的[弃用页面](/deprecations)。

5 月 11 日

功能

v1/responses

为 Responses API [网络搜索工具](/guides/tools-web-search#run-longer-web-research)添加了 `return_token_budget`。使用它可以选择启用更长的 GPT-5+ 推理网络搜索运行，适用于高强度研究和评估工作负载。

5 月 7 日

功能

gpt-realtime-2

gpt-realtime-translate

gpt-realtime-whisper

v1/realtime

v1/realtime/translations

v1/realtime/transcription\_sessions

发布了 [Realtime 2](/models/gpt-realtime-2)，一个新的实时语音模型，支持可配置推理的语音到语音代理，同时发布了 [Realtime Translate](/models/gpt-realtime-translate) 用于流式语音翻译，以及 [Realtime Whisper](/models/gpt-realtime-whisper) 用于流式语音转文字。

更新了[实时和音频指南](/guides/realtime)，添加了专门的[实时翻译指南](/guides/realtime-translation)，刷新了[实时转录](/guides/realtime-transcription)以支持流式转录，并将实时提示指导移至[使用实时模型](/guides/realtime-models-prompting)。

5 月 7 日

功能

发布了 [OpenAI Developers plugin for Codex](https://developers.openai.com/learn/developers-codex-plugin)。这帮助您在 Codex 中通过 OpenAI Platform 访问和 OpenAI API 设置指导来构建 AI 应用和代理。

5 月 6 日

更新

更新后的 Agents SDK 现已在 TypeScript 中可用，内置支持沙箱代理和开源测试框架。了解更多[详情](https://developers.openai.com/api/docs/guides/agents)。

5 月 5 日

更新

chat-latest

发布了 `chat-latest` 快照，指向当前 ChatGPT 中使用的最新 Instant 模型。我们建议在生产 API 使用中利用 [GPT-5.5](https://developers.openai.com/api/docs/guides/latest-model)，但欢迎使用此模型来测试我们聊天用例的最新改进。底层模型快照将定期更新。阅读更多[详情](/models/chat-latest)。

5 月 4 日

更新

Admin API 现已在 Node、Python、Go、Ruby 和 Java 的 OpenAI SDK 中得到支持。参见 [Admin APIs 指南](/guides/admin-apis)获取设置说明和示例。


### 2026 年 4 月

4 月 24 日

功能

gpt-5.5

gpt-5.5-pro

v1/responses

v1/chat/completions

v1/batch

向 Chat Completions 和 Responses API 发布了 [GPT-5.5](/models/gpt-5.5)，一个用于复杂专业工作的新前沿模型，并向 Responses API 发布了 [GPT-5.5 pro](/models/gpt-5.5-pro)，适用于需要更多计算资源的困难问题。

GPT-5.5 支持 1M token 上下文窗口、图像输入、结构化输出、函数调用、提示缓存、Batch、工具搜索、内置计算机使用、托管 shell、apply patch、Skills、MCP 和网络搜索。主要更新包括：

*   推理努力程度现在默认为 `medium`。
*   当 `image_detail` 未设置或设置为 `auto` 时，模型现在使用[原始行为](https://developers.openai.com/api/docs/guides/latest-model#behavioral-changes)。
*   GPT-5.5 的缓存仅适用于扩展提示缓存。不支持内存提示缓存。了解更多[详情](https://developers.openai.com/api/docs/guides/latest-model#behavioral-changes)。

4 月 21 日

功能

gpt-image-2

v1/images/generations

v1/images/edits

v1/batch

发布了 [GPT Image 2](/models/gpt-image-2)，一个用于图像生成和编辑的最先进图像生成模型。GPT Image 2 支持灵活的图像尺寸、高保真图像输入、基于 token 的图像定价，以及享有 50% 折扣的 Batch API 支持。

4 月 15 日

更新

更新了 [Agents SDK](/guides/agents)，新增功能包括：

*   在受控沙箱中运行代理；
*   检查和自定义开源测试框架；以及
*   控制何时创建记忆以及存储位置。


### 2026 年 3 月

3 月 17 日

功能

gpt-5.4-mini

gpt-5.4-nano

v1/responses

v1/chat/completions

向 Chat Completions 和 Responses API 发布了 [GPT-5.4 mini](/models/gpt-5.4-mini) 和 [GPT-5.4 nano](/models/gpt-5.4-nano)。GPT-5.4 mini 将 GPT-5.4 级别的能力带入更快、更高效的模型，适用于高流量工作负载，而 GPT-5.4 nano 则针对速度和成本最重要的简单高流量任务进行了优化。

GPT-5.4 mini 支持[工具搜索](/guides/tools-tool-search)、内置[计算机使用](/guides/tools-computer-use)和[压缩](/guides/compaction)。GPT-5.4 nano 支持压缩，但不支持工具搜索或计算机使用。

3 月 16 日

更新

gpt-5.3-chat-latest

更新了 [gpt-5.3-chat-latest](https://developers.openai.com/api/docs/models/gpt-5.3-chat-latest) 标识符，指向当前 ChatGPT 中使用的最新模型。

3 月 13 日

修复

gpt-5.4

v1/responses

v1/chat/completions

更新了我们的图像编码器，修复了 GPT-5.4 中 `input_image` 输入的一个小 bug。某些图像理解用例现在可能会看到质量提升。无需采取任何操作。

3 月 12 日

功能

sora-2

sora-2-pro

v1/videos

v1/videos/characters

v1/videos/extensions

v1/batch

扩展了 Sora API，新增可复用角色引用、最长 `20` 秒的更长生成、`sora-2-pro` 的 `1080p` 输出、视频扩展，以及 `POST /v1/videos` 的 Batch API 支持。`sora-2-pro` 上的 `1080p` 生成按每秒 `$0.70` 计费。了解更多[详情](/guides/video-generation)。

3 月 12 日

更新

sora-2

sora-2-pro

v1/videos/edits

v1/videos/{video\_id}/remix

添加了 `POST /v1/videos/edits` 用于编辑现有视频。这将替代 `POST /v1/videos/{video_id}/remix`，后者将在 `6` 个月后弃用。了解更多[详情](/guides/video-generation#edit-existing-videos)。

3 月 5 日

功能

gpt-5.4

gpt-5.4-pro

v1/responses

v1/chat/completions

向 Chat Completions 和 Responses API 发布了 [GPT-5.4](/models/gpt-5.4)，我们最新的专业工作前沿模型，并向 Responses API 发布了 [GPT-5.4 pro](/models/gpt-5.4-pro)，适用于需要更多计算资源的困难问题。

同时发布了：

*   Responses API 中的[工具搜索](/guides/tools-tool-search)，允许模型将大型工具表面推迟到运行时，以减少 token 使用、保持缓存性能并改善延迟。
*   GPT-5.4 通过 Responses API `computer` 工具内置的[计算机使用](/guides/tools-computer-use)支持，用于基于截图的 UI 交互。
*   1M token 上下文窗口和原生[压缩](/guides/compaction)支持，适用于长时间运行的代理工作流。

3 月 3 日

功能

gpt-5.3-chat-latest

v1/chat/completions

v1/responses

向 Chat Completions 和 Responses API 发布了 `gpt-5.3-chat-latest`。此模型指向当前 ChatGPT 中使用的 GPT-5.3 Instant 快照。阅读更多[详情](https://developers.openai.com/api/docs/models/gpt-5.3-chat-latest)。


### 2026 年 2 月

2 月 24 日

功能

v1/responses

v1/chat/completions

扩展了 `input_file` 支持，可接受更多文档、演示文稿、电子表格、代码和文本文件类型。了解更多[详情](/guides/file-inputs)。

2 月 24 日

功能

v1/responses

向 Responses API 发布了 `phase`。它将助手消息标记为中间评论（`commentary`）或最终答案（`final_answer`）。阅读更多[详情](https://developers.openai.com/api/reference/resources/responses/methods/create#\(resource\)%20responses%20%3E%20\(model\)%20easy_input_message%20%3E%20\(schema\)%20%3E%20\(property\)%20phase)。

2 月 24 日

功能

gpt-5.3-codex

v1/responses

向 Responses API 发布了 `gpt-5.3-codex`。阅读更多[详情](https://developers.openai.com/api/docs/models/gpt-5.3-codex)。

2 月 23 日

功能

v1/responses

为 Responses API 推出了 WebSocket 模式。了解更多[详情](/guides/websocket-mode/)。

2 月 23 日

功能

gpt-realtime-1.5

gpt-audio-1.5

v1/realtime

v1/chat/completions

向 Realtime API 发布了 `gpt-realtime-1.5`。阅读更多[详情](/models/gpt-realtime-1.5)。

向 Chat Completions API 发布了 `gpt-audio-1.5`。阅读更多[详情](/models/gpt-audio-1.5)。

2 月 10 日

功能

gpt-image-1.5

gpt-image-1

gpt-image-1-mini

chatgpt-image-latest

v1/batch

[Batch API](/guides/batch) 现已支持 GPT Image 模型：`gpt-image-1.5`、`chatgpt-image-latest`、`gpt-image-1` 和 `gpt-image-1-mini`。

2 月 10 日

更新

gpt-5.2-chat-latest

更新了 [gpt-5.2-chat-latest](/models/gpt-5.2-chat-latest) 标识符，指向当前 ChatGPT 中使用的最新模型。

2 月 10 日

功能

v1/responses

在 Responses API 中推出了[服务端压缩](/guides/context-management#server-side-compaction)。

2 月 10 日

功能

v1/responses

在 Responses API 中推出了 [Skills](/guides/tools-skills) 支持。我们支持本地执行和基于托管容器执行的 Skills。

2 月 10 日

功能

v1/responses

推出了新的[托管 Shell](/guides/tools-shell#hosted-shell-quickstart) 工具，以及容器中的网络支持。

2 月 9 日

功能

gpt-image-1.5

gpt-image-1

gpt-image-1-mini

chatgpt-image-latest

v1/images/edits

为 GPT image 模型在 `/v1/images/edits` 上添加了 `application/json` 请求支持。JSON 请求使用带有 `image_url` 或 `file_id` 引用的 `images`（和可选的 `mask`）代替 multipart 上传。

2 月 3 日

更新

gpt-5.2

gpt-5.2-codex

我们已为 API 客户优化了推理堆栈，[GPT-5.2](https://platform.openai.com/docs/models/gpt-5.2) 和 [GPT-5.2-Codex](https://platform.openai.com/docs/models/gpt-5.2-codex) 现在运行速度提升约 40%。模型和模型权重未变。


### 2026 年 1 月

1 月 15 日

公告

宣布了 [Open Responses](https://www.openresponses.org/)：一个开源规范，用于在原始 OpenAI Responses API 之上构建多提供商、可互操作的 LLM 接口。

1 月 14 日

功能

gpt-5.2-codex

v1/responses

向 Responses API 发布了 `gpt-5.2-codex`。GPT-5.2-Codex 是 GPT-5.2 的一个版本，针对 Codex 或类似环境中的代理编码任务进行了优化。阅读更多[详情](https://platform.openai.com/docs/models/gpt-5.2-codex)。

1 月 13 日

功能

v1/realtime

为 Realtime API 添加了专用 SIP IP 范围。`sip.api.openai.com` 进行 GeoIP 路由，将 SIP 流量引导到最近的区域。[了解更多](/guides/realtime-sip#dedicated-sip-ip-ranges)。

1 月 13 日

更新

gpt-realtime-mini

gpt-audio-mini

更新了 [gpt-realtime-mini](https://platform.openai.com/docs/models/gpt-realtime) 和 [gpt-audio-mini](https://platform.openai.com/docs/models/gpt-audio-mini) 标识符，指向 2025-12-15 快照。如果您需要之前的模型快照，请使用 `gpt-realtime-mini-2025-10-06` 和 `gpt-audio-mini-2025-10-06`。

1 月 13 日

更新

sora-2

更新了 [sora-2](https://platform.openai.com/docs/models/sora-2) 标识符，指向 `sora-2-2025-12-08`。如果您需要之前的模型快照，请使用 `sora-2-2025-10-06`。

1 月 13 日

更新

gpt-4o-mini-tts

gpt-4o-mini-transcribe

更新了 `gpt-4o-mini-tts` 和 `gpt-4o-mini-transcribe` 标识符，指向 `2025-12-15` 快照。如果您需要之前的模型快照，请使用 `gpt-4o-mini-tts-2025-03-20` 和 `gpt-4o-mini-transcribe-2025-03-20`。我们目前建议使用 `gpt-4o-mini-transcribe` 而非 `gpt-4o-transcribe` 以获得最佳效果。

1 月 9 日

修复

gpt-image-1.5

chatgpt-image-latest

修复了一个问题：`gpt-image-1.5` 和 `chatgpt-image-latest` 在通过 `/v1/images/edits` 进行图像编辑时错误地使用了高保真度，即使 `fidelity` 被明确设置为 `low`（默认值）。

### 2025 年 12 月

12 月 19 日

更新

gpt-image-1.5

chatgpt-image-latest

将 `gpt-image-1.5` 和 `chatgpt-image-latest` 添加到 Responses API 图像生成工具。

12 月 16 日

功能

gpt-image-1.5

chatgpt-image-latest

发布了 [gpt-image-1.5](https://platform.openai.com/docs/models/gpt-image-1.5) 和 [chatgpt-image-latest](https://platform.openai.com/docs/models/chatgpt-image-latest)，我们最新、最先进的图像生成模型。阅读更多[详情](https://platform.openai.com/docs/guides/image-generation)。

12 月 15 日

功能

gpt-realtime-mini

gpt-audio-mini

gpt-4o-mini-transcribe

gpt-4o-mini-tts

发布了四个新的带日期音频快照。这些更新为实时、语音驱动的应用提供了可靠性、质量和语音保真度改进。阅读更多[详情](/blog/updates-audio-models)。

*   gpt-realtime-mini-2025-12-15
*   gpt-audio-mini-2025-12-15
*   gpt-4o-mini-transcribe-2025-12-15
*   gpt-4o-mini-tts-2025-12-15

此次发布还包括对符合条件客户的[自定义语音](https://platform.openai.com/docs/guides/text-to-speech#custom-voices)支持。

12 月 11 日

功能

gpt-5.2

gpt-5.2-chat-latest

v1/responses

v1/chat/completions

发布了 [GPT-5.2](https://platform.openai.com/docs/models/gpt-5.2)，GPT-5 模型系列中最新的旗舰模型。GPT-5.2 相比之前的 GPT-5.1 在以下方面有所改进：

*   通用智能
*   指令遵循
*   准确性和 token 效率
*   多模态——尤其是视觉
*   代码生成——尤其是前端 UI 创建
*   API 中的工具调用和上下文管理
*   电子表格理解和创建。

5.2 的新特性包括新的 xhigh 推理努力级别、简洁的推理摘要，以及使用压缩的新上下文管理。

12 月 11 日

功能

v1/responses/compact

发布了[客户端压缩](https://platform.openai.com/docs/guides/conversation-state#compaction-advanced)。对于使用 Responses API 的长时间对话，您可以使用 `/responses/compact` 端点来缩减每轮发送的上下文。

12 月 4 日

功能

gpt-5.1-codex-max

v1/responses

向 Responses API 发布了 `gpt-5.1-codex-max`。GPT-5.1-Codex 是我们最智能的编码模型，针对长期、代理编码任务进行了优化。阅读更多[详情](https://platform.openai.com/docs/models/gpt-5.1-codex-max)。


### 2025 年 11 月

11 月 20 日

功能

v1/realtime

在 Realtime API 中添加了 DTMF 按键支持。您现在可以在使用 Realtime 旁路连接时接收 DTMF 事件。参见[文档](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/dtmf_event_received)了解更多信息。

11 月 13 日

功能

gpt-5.1

gpt-5.1-codex

gpt-5.1-chat-latest

gpt-5.1-codex-mini

v1/responses

v1/chat/completions

发布了 [GPT-5.1](/models/gpt-5.1)，GPT-5 模型系列中最新的旗舰模型。GPT-5.1 经过训练，在以下方面特别擅长：

*   可控性和在需要较少思考时的更快响应
*   代码生成和编码用例
*   代理工作流

请注意，GPT-5.1 默认使用新的 `none` 推理设置，在需要较少思考时提供更快的响应——这与 GPT-5 中之前的 `medium` 默认设置不同。

11 月 13 日

功能

发布了[增强的基于角色的访问控制 (RBAC)](https://platform.openai.com/docs/guides/rbac#page-top)。基于角色的访问控制 (RBAC) 让您决定谁可以在组织和项目中执行什么操作——通过 API 和仪表板均可。

11 月 13 日

功能

gpt-5.1-codex

gpt-5.1-codex-mini

v1/responses

向 Responses API 发布了 `gpt-5.1-codex` 和 `gpt-5.1-codex-mini`。GPT-5.1-Codex 是 GPT-5.1 的一个版本，针对 Codex 或类似环境中的代理编码任务进行了优化。阅读更多[详情](https://platform.openai.com/docs/models/gpt-5.1-codex)。

11 月 13 日

功能

发布了[扩展提示缓存保留](https://platform.openai.com/docs/guides/prompt-caching#extended-prompt-cache-retention)。扩展提示缓存保留使缓存的前缀保持活跃更长时间，最长可达 24 小时。扩展提示缓存通过在内存满时将键/值张量卸载到 GPU 本地存储来工作，显著增加了可用于缓存的存储容量。

### 2025 年 10 月

10 月 29 日

功能

gpt-oss-safeguard-120b

gpt-oss-safeguard-20b

gpt-oss-safeguard-120b 和 gpt-oss-safeguard-20b 是基于 gpt-oss 构建的安全推理模型。阅读更多[详情](https://huggingface.co/collections/openai/gpt-oss-safeguard)。

10 月 24 日

功能

发布了[企业密钥管理 (EKM)](https://platform.openai.com/docs/guides/your-data#enterprise-key-management-ekm)。企业密钥管理 (EKM) 允许您使用由自己的外部密钥管理系统 (KMS) 管理的密钥来加密您在 OpenAI 的客户内容。

10 月 24 日

功能

发布了[英国数据驻留](https://platform.openai.com/docs/guides/your-data#data-residency-controls)。

10 月 6 日

功能

gpt-5-pro

gpt-realtime-mini

gpt-audio-mini

gpt-image-1-mini

sora-2

sora-2-pro

v1/responses

v1/batch

v1/chat/completions

v1/videos

v1/realtime

v1/images/generations

在 [OpenAI DevDay](https://openai.com/devday/) 上发布了多项新功能：

发布了 [gpt-5-pro](/models/gpt-5-pro)，[GPT-5](/models/gpt-5) 的一个版本，使用更多计算资源来更深入思考并提供更一致的更好答案。

发布了 [gpt-realtime-mini](/models/gpt-realtime-mini) 和 [gpt-audio-mini](/models/gpt-audio-mini)，提供更具成本效益的语音到语音性能。

发布了 [gpt-image-1-mini](/models/gpt-image-1-mini)，提供更具成本效益的图像生成和编辑。

推出了 [v1/videos](/guides/video-generation)，使用我们最新的 [Sora 2](/models/sora-2) 和 [Sora 2 Pro](/models/sora-2-pro) 模型进行丰富、详细和动态的视频生成和混剪。

推出了 [Agent Builder](/guides/agent-builder)，用于可视化创建自定义多代理工作流。

推出了 [ChatKit](/guides/chatkit)，一个用于部署代理的可嵌入聊天界面。

发布了 [Trace Evals、Datasets 和 Prompt Optimization 工具](/guides/agent-evals)。

[Evals](/guides/evals)：发布了第三方模型支持。

推出了[服务健康仪表板](https://platform.openai.com/settings/organization/service-health)。

10 月 1 日

功能

发布了 [IP 允许列表](https://platform.openai.com/settings/organization/security/ip-allowlist)。IP 允许列表将 API 访问限制为仅您指定的 IP 地址或范围。


### 2025 年 9 月

9 月 26 日

功能

v1/responses

在 Responses API 中添加了图像和文件作为[工具调用输出](docs/guides/function-calling#how-it-works)的支持。

9 月 23 日

功能

gpt-5-codex

v1/responses

推出了专用模型 [gpt-5-codex](/models/gpt-5-codex)，专为与 [Codex CLI](https://github.com/openai/codex) 配合使用而构建和优化。

### 2025 年 8 月

8 月 28 日

功能

v1/realtime

OpenAI Realtime API 现已正式发布。了解更多[详情请参阅我们的 Realtime API 指南](/guides/realtime)。

8 月 21 日

功能

v1/responses

在 Responses API 中添加了[连接器](/guides/tools-connectors-mcp)支持。连接器是 OpenAI 维护的 MCP 封装，用于 Google 应用、Dropbox 等热门服务，可用于让模型读取存储在这些服务中的数据。

8 月 20 日

功能

v1/conversations

v1/responses

v1/assistants

发布了 Conversations API，允许您使用 Responses API 创建和管理长时间运行的对话。参见[迁移指南](/assistants/migration)查看并排比较，了解如何从 Assistants API 集成迁移到 Responses 和 Conversations。

8 月 7 日

功能

v1/chat/completions

v1/responses

在 API 中发布了 GPT-5 系列模型，包括 [`gpt-5`](/models/gpt-5)、[`gpt-5-mini`](/models/gpt-5-mini) 和 [`gpt-5-nano`](/models/gpt-5-nano)。

引入了 `minimal` [推理努力](/guides/reasoning)值，用于优化 GPT-5 模型（支持推理）中的快速响应。

引入了 `custom` [工具调用](/guides/function-calling#custom-tools)类型，允许在工具调用时对模型进行自由格式的输入和输出。


### 2025 年 6 月

6 月 27 日

功能

推出了[优先处理](https://platform.openai.com/docs/guides/priority-processing)支持。优先处理相比标准处理提供显著更低且更一致的延迟，同时保持按需付费的灵活性。

6 月 24 日

功能

o3-deep-research

o3-deep-research-2025-06-26

o4-mini-deep-research

o4-mini-deep-research-2025-06-26

v1/responses

发布了 [o3-deep-research](/models/o3-deep-research) 和 [o4-mini-deep-research](/models/o4-mini-deep-research)，我们 o 系列推理模型的深度研究变体，针对深度分析和研究任务进行了优化。了解更多请参阅[深度研究指南](/guides/deep-research)。

添加了使用 [webhooks](/guides/webhooks) 的异步事件处理支持。[降低并简化了](/pricing)网络搜索工具的定价。添加了[网络搜索工具](/guides/tools-web-search)支持。

6 月 13 日

功能

v1/responses

新的[可复用提示](/chat/edit)现已在仪表板和 [Responses API]( https://developers.openai.com/api/reference/responses/create) 中可用。通过 API，您现在可以通过 `prompt` 参数（带有提示 `id`、可选的 `version`）引用在仪表板中创建的模板，并提供可包含字符串、图像或文件输入的动态 `variables`。可复用提示在 Chat Completions 中不可用。[了解更多](/guides/text?api-mode=responses#reusable-prompts)。

6 月 10 日

功能

o3-pro

v1/responses

v1/batch

发布了 [o3-pro](/models/o3-pro)，[o3](/models/o3) 推理模型的一个版本，使用更多计算资源来以更好的推理和一致性回答困难问题。[o3 模型的价格也已降低](/pricing)，适用于所有 API 请求，包括 batch 和 flex 处理。

6 月 4 日

功能

v1/fine\_tuning

为模型 `gpt-4.1-2025-04-14`、`gpt-4.1-mini-2025-04-14` 和 `gpt-4.1-nano-2025-04-14` 添加了[直接偏好优化](/guides/direct-preference-optimization)微调支持。

6 月 3 日

功能

v1/chat/completions

v1/realtime

[gpt-4o-audio-preview](/models/gpt-4o-audio-preview) 和 [gpt-4o-realtime-preview](/models/gpt-4o-realtime-preview) 的新模型快照已可用。发布了 [Agents SDK for TypeScript](https://openai.github.io/openai-agents-js)。


### 2025 年 5 月

5 月 20 日

功能

v1/responses

在 Responses API 中添加了新的内置工具支持，包括[远程 MCP 服务器](/guides/tools-remote-mcp)和[代码解释器](/guides/tools-code-interpreter)。[了解更多关于工具的信息](/guides/tools)。

5 月 20 日

功能

v1/responses

v1/chat/completions

添加了在非微调模型使用并行工具调用时对工具 schema 使用 `strict` 模式的支持。添加了新的 [schema 功能](/guides/structured-outputs?api-mode=responses#supported-schemas)，包括 `email` 和其他模式的字符串验证，以及为数字和数组指定范围。

5 月 15 日

功能

codex-mini-latest

v1/responses

v1/chat/completions

在 API 中推出了 [codex-mini-latest](/models/codex-mini-latest)，针对与 [Codex CLI](https://github.com/openai/codex) 配合使用进行了优化。

5 月 7 日

功能

v1/fine-tuning

v1/responses

v1/chat/completions

推出了[强化微调](/guides/reinforcement-fine-tuning)支持。了解可用的[微调方法](/guides/fine-tuning)。[gpt-4.1-nano](/models/gpt-4.1-nano) 现已可用于微调。

### 2025 年 4 月

4 月 30 日

功能

推出了[增强的 API 预算警报和自动充值限制](https://platform.openai.com/settings/organization/limits)支持。

4 月 23 日

功能

v1/images/generations

v1/images/edits

添加了新的图像生成模型 `gpt-image-1`。该模型为图像生成设定了新标准，具有改进的质量和指令遵循能力。

更新了图像生成和编辑端点，以支持 `gpt-image-1` 模型特有的新参数。

4 月 16 日

功能

v1/chat/completions

v1/responses

添加了两个新的 o 系列推理模型 `o3` 和 `o4-mini`。它们在数学、科学和编码、视觉推理任务以及技术写作方面设定了新标准。

推出了 Codex，我们的代码生成 CLI 工具。

4 月 14 日

功能

gpt-4.1

gpt-4.1-mini

gpt-4.1-nano

v1/responses

v1/chat/completions

v1/fine\_tuning

向 API 添加了 [`gpt-4.1`](/models/gpt-4.1)、[`gpt-4.1-mini`](/models/gpt-4.1-mini) 和 [`gpt-4.1-nano`](/models/gpt-4.1-nano) 模型。这些新模型具有改进的指令遵循、编码能力和更大的上下文窗口（最高 1M tokens）。`gpt-4.1` 和 `gpt-4.1-mini` 可用于监督微调。宣布弃用 [`gpt-4.5-preview`](/deprecations)。


### 2025 年 3 月

3 月 20 日

更新

v1/audio

向 Audio API 添加了 `gpt-4o-mini-tts`、`gpt-4o-transcribe`、`gpt-4o-mini-transcribe` 和 `whisper-1` 模型。

3 月 19 日

功能

o1-pro

v1/responses

v1/batch

发布了 [o1-pro](/models/o1-pro)，[o1](/models/o1) 推理模型的一个版本，使用更多计算资源来以更好的推理和一致性回答困难问题。

3 月 11 日

功能

gpt-4o-search-preview

gpt-4o-mini-search-preview

computer-use-preview

v1/chat/completions

v1/assistants

v1/responses

发布了多个新模型和工具以及用于代理工作流的新 API：

*   发布了 [Responses API](/guides/responses-vs-chat-completions)，一个用于创建和使用代理和工具的新 API。
*   为 Responses API 发布了一组内置工具：[网络搜索](/guides/tools-web-search)、[文件搜索](/guides/tools-file-search)和[计算机使用](/guides/tools-computer-use)。
*   发布了 [Agents SDK](/guides/agents)，一个用于设计、构建和部署代理的编排框架。
*   宣布了新模型：`gpt-4o-search-preview`、`gpt-4o-mini-search-preview`、`computer-use-preview`。
*   宣布计划将所有 [Assistants API](/assistants) 功能引入更易用的 [Responses API](/guides/responses-vs-chat-completions)，预计在 2026 年（实现完全功能对等后）停用 Assistants。

3 月 3 日

功能

v1/fine\_tuning/jobs

为微调作业添加了 `metadata` 字段支持。

### 2025 年 2 月

2 月 27 日

功能

GPT-4.5

v1/chat/completions

v1/assistants

v1/batch

发布了 [GPT-4.5](/models/gpt-4-5) 的研究预览——我们迄今为止最大、最强大的聊天模型。GPT-4.5 的高"情商"和对用户意图的理解使其在创意任务和代理规划方面表现更好。

2 月 25 日

功能

推出了 [API 使用量仪表板更新](https://help.openai.com/en/articles/10478918-api-usage-dashboard)。此更新满足了对额外数据筛选器的需求，如项目选择、日期选择器和细粒度时间间隔。还更好地支持了跨不同产品和服务层级查看使用量。

2 月 5 日

功能

推出欧洲数据驻留。阅读更多[详情](https://platform.openai.com/docs/guides/your-data)。

### 2025 年 1 月

1 月 31 日

功能

o3-mini

o3-mini-2025-01-31

v1/chat/completions

推出了 [o3-mini](/models/o3-mini)，一个新的小型推理模型，针对科学、数学和编码任务进行了优化。

1 月 21 日

功能

o1

扩展了 [o1 模型](https://platform.openai.com/docs/models/o1)的访问权限。o1 系列模型通过强化学习训练以执行复杂推理。


### 2024 年 12 月

12 月 18 日

功能

推出了 [Admin API 密钥轮换]( https://developers.openai.com/api/reference/admin-api-keys)，使客户能够以编程方式轮换其管理员 API 密钥。

更新了 [Admin API 邀请]( https://developers.openai.com/api/reference/invite)，使客户能够在邀请用户加入组织的同时以编程方式邀请用户加入项目。

12 月 17 日

功能

o1

gpt-4o

gpt-4o-mini

v1/fine\_tuning

v1/chat/completions

v1/realtime

为 [o1](/models/o1)、[gpt-4o-realtime](/models/gpt-4o-realtime-preview)、[gpt-4o-audio](/models/gpt-4o-audio-preview) 和[更多](/models)添加了新模型。

为 [Realtime API](/guides/realtime) 添加了 WebRTC 连接方式。

为 o1 模型添加了 [`reasoning_effort` 参数]( https://developers.openai.com/api/reference/chat/create#chat-create-reasoning_effort)。

为 o1 模型添加了 [`developer` 消息角色]( https://developers.openai.com/api/reference/chat/create#chat-create-messages)。请注意 o1-preview 和 o1-mini 不支持 system 或 developer 消息。

使用[直接偏好优化 (DPO)](/guides/fine-tuning#preference) 推出了偏好微调。

推出了 Go 和 Java 的 beta SDK。[了解更多](/libraries)。

在 [Python SDK](https://github.com/openai/openai-python) 中添加了 [Realtime API](/guides/realtime) 支持。

12 月 4 日

功能

推出了 [Usage API]( https://developers.openai.com/api/reference/usage)，使客户能够以编程方式查询跨 OpenAI API 的活动和支出。

### 2024 年 11 月

11 月 20 日

更新

v1/chat/completions

发布了 [gpt-4o-2024-11-20](/models/gpt-4o)，我们 gpt-4o 系列中的最新模型。

11 月 4 日

功能

v1/chat/completions

发布了[预测输出](/guides/predicted-outputs)，当大部分响应内容已知时，可大幅降低模型响应的延迟。这在仅有少量更改的情况下重新生成文档和代码文件内容时最为常见。

### 2024 年 10 月

10 月 30 日

功能

gpt-4o-realtime-preview

gpt-4o-audio-preview

v1/chat/completions

在 [Realtime API](/guides/realtime) 和 [Chat Completions API](/guides/audio) 中添加了五种新的语音类型。

10 月 17 日

功能

gpt-4o-audio-preview

v1/chat/completions

为 chat completions 发布了[新的 `gpt-4o-audio-preview` 模型](/guides/audio)，支持音频输入和输出。使用与 [Realtime API](/guides/realtime) 相同的底层模型。

10 月 1 日

功能

v1/realtime

v1/chat/completions

v1/fine\_tuning

在[旧金山 OpenAI DevDay](https://openai.com/devday/) 上发布了多项新功能：

[Realtime API](/guides/realtime)：使用 WebSockets 接口在您的应用中构建快速的语音到语音体验。

[模型蒸馏](/guides/distillation)：使用大型前沿模型的输出来微调高性价比模型的平台。

[图像微调](/guides/fine-tuning#vision)：使用图像和文本微调 GPT-4o 以提升视觉能力。

[Evals](/guides/evals)：创建和运行自定义评估以衡量模型在特定任务上的表现。

[提示缓存](/guides/prompt-caching)：对最近见过的输入 token 提供折扣和更快的处理时间。

[在 playground 中生成](/chat/edit)：使用生成按钮在 playground 中轻松生成提示、函数定义和结构化输出 schema。


### 2024 年 9 月

9 月 26 日

功能

omni-moderation-latest

v1/moderations

发布了[新的 `omni-moderation-latest` 审核模型](/guides/moderation)，支持图像和文本（部分类别），支持两个新的纯文本有害类别，并具有更准确的评分。

9 月 12 日

功能

o1-preview

o1-mini

v1/chat/completions

发布了 [o1-preview 和 o1-mini](/guides/reasoning)，通过强化学习训练以执行复杂推理任务的新大语言模型。

### 2024 年 8 月

8 月 29 日

功能

v1/assistants

Assistants API 现在支持[包含文件搜索工具使用的文件搜索结果，以及自定义排名行为](/assistants/tools/file-search#improve-file-search-result-relevance-with-chunk-ranking)。

8 月 20 日

功能

gpt-4o

v1/fine\_tuning

[`gpt-4o-2024-08-06` 微调](/guides/fine-tuning)正式发布——所有 API 用户现在都可以微调最新的 GPT-4o 模型。

8 月 15 日

更新

gpt-4o

v1/chat/completions

发布了 [`chatgpt-4o-latest` 动态模型](/models/chatgpt-4o-latest)——此模型将指向 ChatGPT 使用的最新 GPT-4o 模型。

8 月 6 日

更新

推出了[结构化输出](/guides/structured-outputs)——模型输出现在可靠地遵循开发者提供的 JSON Schema。

发布了 [gpt-4o-2024-08-06](/models/gpt-4o)，我们 gpt-4o 系列中的最新模型。

8 月 1 日

更新

推出了 [Admin 和 Audit Log API]( https://developers.openai.com/api/reference/administration)，允许客户以编程方式管理其组织并使用审计日志监控变更。审计日志必须在[设置](settings/organization/general)中启用。

### 2024 年 7 月

7 月 24 日

更新

推出了[自助 SSO 配置](https://help.openai.com/en/articles/9641482-api-platform-single-sign-on-sso-integration-for-existing-enterprise-customers)，允许使用自定义和无限计费的企业客户针对其所需的 IDP 设置身份验证。

7 月 23 日

更新

推出了 [GPT-4o mini 微调](/guides/fine-tuning)，为特定用例实现更高性能。

7 月 18 日

更新

发布了 [GPT-4o mini](/models/gpt-4o-mini)，我们经济实惠且智能的小型模型，适用于快速、轻量级任务。

7 月 17 日

更新

发布了 [Uploads]( https://developers.openai.com/api/reference/uploads)，支持分多部分上传大文件。

### 2024 年 6 月

6 月 6 日

更新

在 Chat Completions 和 Assistants API 中可以通过传递 `parallel_tool_calls=false` 来禁用[并行函数调用](/guides/function-calling#configure-parallel-function-calling)。

[.NET SDK](/libraries#dotnet-library) 以 Beta 版推出。

6 月 3 日

更新

添加了[文件搜索自定义](/assistants/tools/file-search#customizing-file-search-settings)支持。


### 2024 年 5 月

5 月 15 日

更新

添加了[归档项目](/projects)支持。只有组织所有者可以访问此功能。

添加了对按需付费客户按项目[设置成本限制](/settings/organization/general)的支持。

5 月 13 日

更新

在 API 中发布了 [GPT-4o](/models/gpt-4o)。GPT-4o 是我们最快、最经济的旗舰模型。

5 月 9 日

更新

为 Assistants API 添加了[图像输入支持](/assistants/overview)。

5 月 7 日

更新

为 [Batch API 添加了微调模型支持](/guides/batch#model-availability)。

5 月 6 日

更新

向 Chat Completions 和 Completions API 添加了 [`stream_options: {"include_usage": true}`]( https://developers.openai.com/api/reference/chat/create#chat-create-stream_options) 参数。设置此参数可让开发者在使用流式传输时访问使用量统计。

5 月 2 日

更新

在 Assistants API 中添加了[新端点]( https://developers.openai.com/api/reference/messages/deleteMessage)用于从线程中删除消息。

### 2024 年 4 月

4 月 29 日

更新

向 Chat Completions 和 Assistants API 添加了新的[函数调用选项 `tool_choice: "required"`](/guides/function-calling#function-calling-behavior)。

添加了 [Batch API 指南](/guides/batch)和 Batch API 对[嵌入模型的支持](/guides/batch#model-availability)。

4 月 17 日

更新

推出了 [Assistants API 的一系列更新](/assistants/whats-new)，包括支持每个助手最多 10,000 个文件的新文件搜索工具、新的 token 控制和工具选择支持。

4 月 16 日

更新

推出了[基于项目的层级结构](../settings/organization/general)，用于按项目组织工作，包括按项目创建 [API 密钥]( https://developers.openai.com/api/reference/authentication)和管理速率及成本限制的能力（成本限制仅适用于企业客户）。

4 月 15 日

更新

发布了 [Batch API](/guides/batch)

4 月 9 日

更新

在 API 中正式发布了 [GPT-4 Turbo with Vision](/models/gpt-4-turbo)

4 月 4 日

更新

在微调 API 中添加了 [seed]( https://developers.openai.com/api/reference/fine-tuning/create) 支持

在微调 API 中添加了[检查点]( https://developers.openai.com/api/reference/fine-tuning/list-checkpoints)支持

在 Assistants API 中添加了[创建 Run 时添加消息]( https://developers.openai.com/api/reference/runs/createRun#runs-createrun-additional_messages)的支持

4 月 1 日

更新

在 Assistants API 中添加了[按 run\_id 筛选消息]( https://developers.openai.com/api/reference/messages/listMessages#messages-listmessages-run_id)的支持

### 2024 年 3 月

3 月 29 日

更新

在 Assistants API 中添加了[温度]( https://developers.openai.com/api/reference/runs/createRun#runs-createrun-temperature)和[助手消息创建]( https://developers.openai.com/api/reference/messages/createMessage#messages-createmessage-role)支持

3 月 14 日

更新

在 Assistants API 中添加了[流式传输](/assistants/overview)支持

### 2024 年 2 月

2 月 9 日

更新

向 Audio API 添加了 [`timestamp_granularities` 参数](/guides/speech-to-text#timestamps)

2 月 1 日

更新

发布了 [gpt-3.5-turbo-0125，更新的 GPT-3.5 Turbo 模型](/models/gpt-3-5-turbo)


### 2024 年 1 月

1 月 25 日

更新

发布了 embedding V3 模型和更新的 GPT-4 Turbo 预览版

向 Embeddings API 添加了 [`dimensions` 参数]( https://developers.openai.com/api/reference/embeddings/create#embeddings-create-dimensions)

### 2023 年 12 月

12 月 20 日

更新

在 Assistants API 的 run 创建中添加了 [`additional_instructions` 参数]( https://developers.openai.com/api/reference/runs/createRun#runs-createrun-additional_instructions)

12 月 15 日

更新

向 Chat Completions API 添加了 [`logprobs` 和 `top_logprobs` 参数]( https://developers.openai.com/api/reference/chat/create#chat-create-logprobs)

12 月 14 日

更新

将工具调用上的[函数参数]( https://developers.openai.com/api/reference/chat/create#chat-create-tools)改为可选

### 2023 年 11 月

11 月 30 日

更新

发布了 [OpenAI Deno SDK](https://deno.land/x/openai)

11 月 6 日

更新

发布了 [GPT-4 Turbo 预览版](/models/gpt-4-turbo)、[更新的 GPT-3.5 Turbo](/models/gpt-3-5-turbo)、[GPT-4 Turbo with Vision](/guides/vision)、[Assistants API](/assistants/overview)、[API 中的 DALL·E 3](/models/dall-e-3) 和[文本转语音 API](/guides/text-to-speech)

弃用了 Chat Completions 的 `functions` 参数，[改用 `tools`]( https://developers.openai.com/api/reference/chat/create#chat-create-tools)

发布了 [OpenAI Python SDK V1.0](/libraries#python-library)

### 2023 年 10 月

10 月 16 日

更新

向 Embeddings API 添加了 [`encoding_format` 参数]( https://developers.openai.com/api/reference/embeddings/create#embeddings-create-encoding_format)

向 [Moderation 模型](/models/text-moderation-latest)添加了 `max_tokens`

10 月 6 日

更新

向微调 API 添加了[函数调用支持](/guides/fine-tuning#fine-tuning-examples)
