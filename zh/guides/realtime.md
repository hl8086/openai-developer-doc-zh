# Overview

从你想要构建的结果开始。实时会话最适合需要低延迟的实时音频。基于请求的音频 API 最适合文件、有界请求或不需要实时会话的生成语音。

## 常见用例

[语音代理构建能够听取、推理、说话和调用工具的语音到语音代理。](/guides/voice-agents)

[实时翻译通过专用的实时翻译会话翻译实时语音。](/guides/realtime-translation)

[转录流式传输实时转录增量或将音频文件处理为文本。](/guides/realtime-transcription)

[语音生成将文本转换为自然流畅的语音音频。](/guides/text-to-speech)

## 了解不同的架构

| 目标 | 模型或 API | 从这里开始 |
| --- | --- | --- |
| 构建低延迟语音代理 | [`gpt-realtime-2`](/models/gpt-realtime-2) | [语音代理](/guides/voice-agents) |
| 将实时语音翻译为另一种语言 | [`gpt-realtime-translate`](/models/gpt-realtime-translate) | [实时翻译](/guides/realtime-translation) |
| 将实时音频转录为流式文本 | [`gpt-realtime-whisper`](/models/gpt-realtime-whisper) | [实时转录](/guides/realtime-transcription) |
| 转录文件或有界音频请求 | 音频转录模型 | [语音转文本](/guides/speech-to-text) |
| 从文本生成语音 | 语音生成模型 | [文本转语音](/guides/text-to-speech) |
| 为现有 Chat Completions 应用添加音频 | 支持音频的聊天模型 | [音频和语音](/guides/audio#add-audio-to-your-existing-application) |

## 选择实时会话

实时会话在应用程序发送音频、接收事件和更新会话状态时保持连接打开。

| 会话类型 | 使用场景 | 端点或模式 |
| --- | --- | --- |
| 语音代理会话 | 模型需要响应用户、调用工具并管理对话状态。 | `/v1/realtime` 上的对话会话 |
| 翻译会话 | 应用需要在语音到达时持续翻译。 | `/v1/realtime/translations` 上的持续翻译会话 |
| 转录会话 | 应用需要流式转录增量，无需模型生成的语音响应。 | 发出转录增量的转录会话 |

当你的应用程序需要一个响应用户的助手时，使用语音代理会话。当你的应用程序需要一个翻译说话者的口译员时，使用翻译会话。当你的应用程序需要从音频获取文本而无需模型生成响应时，使用转录会话。

### 语音代理会话

语音代理会话使用标准的 Realtime API 对话生命周期。客户端连接到 `/v1/realtime`，发送音频或文本，并监听模型响应、工具调用和会话事件。

对于大多数浏览器语音代理，从[语音代理](/guides/voice-agents)指南开始。它使用 Agents SDK 配合 WebRTC 处理浏览器音频，并可以连接到服务器端工具。

Realtime 2 为语音到语音工作流添加了推理能力。对于大多数生产语音代理，将 `reasoning.effort` 设置为 `low` 开始，然后根据延迟容忍度和任务复杂度进行调整。使用[实时提示指南](/guides/realtime-models-prompting)来调优推理、前导语、工具使用、不清晰音频和精确实体捕获。

### 翻译会话

实时翻译使用专用的翻译端点，而不是标准的语音代理端点。翻译会话是持续的：客户端将音频流式传输到会话中，服务将翻译后的音频和转录增量流式传输出来。

翻译会话不使用正常的助手轮次生命周期。不要调用 `response.create`，也不要等待客户端提交用户轮次后才开始翻译。对于浏览器媒体，使用 WebRTC。对于服务器媒体管道（如电话呼叫或广播接入），使用 WebSocket。

参见[实时翻译](/guides/realtime-translation)了解专用端点、会话配置和架构模式。

### 转录会话

你可以通过多种方式转录音频。当你的应用程序需要从流式音频获取实时转录增量时，使用实时转录会话。对于文件上传、基于请求的转录或以说话人分离为重点的工作流，使用[语音转文本](/guides/speech-to-text)指南。

对于实时转录，[`gpt-realtime-whisper`](/models/gpt-realtime-whisper) 提供可控的延迟。较低的延迟设置会产生更早的部分文本，而较高的延迟设置可以提高转录质量。在选择生产默认值之前，使用你的实际音频条件、目标语言、口音和领域词汇进行测试。

参见[实时转录](/guides/realtime-transcription)了解会话配置和事件处理。

## 选择连接方式

根据应用程序捕获和播放音频的位置选择传输方式：

[WebRTC - 用于直接捕获或播放音频的浏览器和移动客户端。](/guides/realtime-webrtc)

[WebSocket - 当你的服务器已经从媒体管道、呼叫系统或工作进程接收原始音频时使用。](/guides/realtime-websocket)

[SIP - 用于电话语音代理。在使用 SIP 进行翻译或转录之前，请确认模型支持。](/guides/realtime-sip)

## 安全标识符

如果你的应用程序识别单个最终用户，请在 Realtime API 请求中包含[安全标识符](/guides/safety-best-practices#implement-safety-identifiers)。安全标识符是推荐的但不是必需的。它们帮助 OpenAI 监控和检测滥用，同时允许执行针对单个用户而不是你的整个组织。使用稳定的、保护隐私的值，例如哈希后的内部用户 ID。

对于 Realtime API 请求，在 `OpenAI-Safety-Identifier` 头中发送标识符。使用临时令牌时，在创建客户端密钥的服务器端请求上设置该头，以便标识符绑定到该会话。从受信任的服务器使用 WebSocket 或统一的 WebRTC 接口连接时，在连接请求上设置该头。

安全标识符不会从 Responses API 请求或其他会话中继承。如果你在应用程序的其他地方使用 Responses API 的 `safety_identifier` 参数，在创建或连接每个实时会话时单独传递相同的稳定值。

## Beta 到 GA 迁移

如果你仍有 beta 版 Realtime 集成，请在进行新工作之前将其迁移到 GA 接口。最重要的变更是：

*   调用 GA 接口时移除 `OpenAI-Beta: realtime=v1` 头。
*   使用 [`POST /v1/realtime/client_secrets`]( https://developers.openai.com/api/reference/realtime-sessions/create-realtime-client-secret) 为浏览器或移动客户端创建临时凭证。
*   建立 WebRTC 会话时使用 `/v1/realtime/calls`。
*   更新 GA 接口的会话和事件结构。特别是，设置 `session.type`，将输出音频配置移到 `session.audio.output` 下，并使用较新的响应事件名称，如 `response.output_text.delta`、`response.output_audio.delta` 和 `response.output_audio_transcript.delta`。
*   如果你正在推进语音到语音应用，从[语音代理](/guides/voice-agents)指南开始。如果你正在推进转录工作流，使用[实时转录](/guides/realtime-transcription)。

参见 [Realtime 客户端事件参考]( https://developers.openai.com/api/reference/realtime_client_events)、[Realtime 会话参考]( https://developers.openai.com/api/reference/realtime-sessions)和[语音代理](/guides/voice-agents)指南了解当前的 GA 流程。

## 相关指南

*   [实时提示指南](/guides/realtime-models-prompting)：提示和调优 Realtime 语音模型。
*   [管理对话](/guides/realtime-conversations)：使用 Realtime 会话生命周期。
*   [实时翻译](/guides/realtime-translation)：通过专用翻译会话翻译实时语音。
*   [实时转录](/guides/realtime-transcription)：从音频流式传输实时转录增量。
*   [实时工具使用](/guides/realtime-mcp)：将函数工具、MCP 服务器和连接器连接到 Realtime 会话。
*   [Webhooks 和服务器端控制](/guides/realtime-server-controls)：从服务器控制 Realtime 会话。
*   [管理成本](/guides/realtime-costs)：跟踪和优化 Realtime API 使用。

使用[音频和语音](/guides/audio)了解音频输入、音频输出、流式传输、延迟、转录和语音生成背后的核心概念。当你准备好选择实现路径时，使用本概述。
