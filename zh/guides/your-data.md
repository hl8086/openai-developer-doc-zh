<!-- Source: https://developers.openai.com/api/docs/guides/your-data -->

了解 OpenAI 如何使用您的数据，以及您如何控制它。

您的数据属于您。自 2023 年 3 月 1 日起，发送到 OpenAI API 的数据不会用于训练或改进 OpenAI 模型（除非您明确选择与我们共享数据）。

## OpenAI API 存储的数据类型

使用 OpenAI API 时，数据可能以以下形式存储：

*   **滥用监控日志：** 由您使用平台时生成的日志，OpenAI 需要这些日志来执行我们的[使用政策](https://openai.com/policies/usage-policies)并减少 AI 的有害使用。
*   **应用状态：** 某些 API 功能为完成任务或请求而持久化的数据。

## 滥用监控的数据保留控制

滥用监控日志可能包含某些客户内容，例如提示词和响应，以及从该客户内容派生的元数据，例如分类器输出。默认情况下，所有 API 功能使用都会生成滥用监控日志，并保留最多 30 天，除非法律要求更长的保留期，或为保护我们的服务或任何第三方免受伤害而合理必要。

符合条件的客户可以通过获得 [Zero Data Retention](#zero-data-retention) 或 [Modified Abuse Monitoring](#modified-abuse-monitoring) 控制的批准，将其客户内容从这些滥用监控日志中排除（受以下限制约束）。目前，这些控制需要 OpenAI 事先批准并接受额外要求。获批客户可以为其 API 组织或项目选择 Modified Abuse Monitoring 或 Zero Data Retention。

启用 Modified Abuse Monitoring 或 Zero Data Retention 的客户有责任确保其用户遵守 OpenAI 关于安全和负责任使用 AI 的政策，并遵守适用法律下的任何审核和报告要求。

请联系我们的[销售团队](https://openai.com/contact-sales)了解更多关于这些产品的信息并咨询资格。

### Modified Abuse Monitoring

Modified Abuse Monitoring 将客户内容（在极少数情况下的图像和文件输入除外，如[下文](https://developers.openai.com/api/docs/guides/your-data#image-and-file-inputs)所述）从所有 API 端点的滥用监控日志中排除，同时仍允许客户利用 OpenAI 平台的全部功能。

### Zero Data Retention

Zero Data Retention 以与 Modified Abuse Monitoring 相同的方式将客户内容从滥用监控日志中排除。

此外，Zero Data Retention 会改变某些端点行为：`/v1/responses` 和 `v1/chat/completions` 的 `store` 参数将始终被视为 `false`，即使请求尝试将值设置为 `true`。

除了这些特定的行为变更外，下表中标记为 Zero Data Retention 不适用的端点和功能在启用 Zero Data Retention 时仍可能存储应用状态。

### Safety Retention

如果合理必要以调查严重风险活动，我们保留使 `gpt-5.5`、`gpt-5.5-pro` 和未来模型对特定客户不适用 Zero Data Retention 或 Modified Abuse Monitoring 的权利，并将提前以书面形式通知受影响的客户。在这种情况下，当使用这些模型时，我们可能会保留被我们的分类器检测为可能违反[使用政策](https://openai.com/policies/usage-policies/)的客户内容。否则保留不受影响。

### 配置数据保留控制

一旦您的组织获得数据保留控制的批准，您将在 [Settings → Organization → Data controls](https://platform.openai.com/settings/organization/data-controls/data-retention) 中看到 **Data Retention** 标签页。从该标签页，您可以在组织级别和项目级别配置数据保留控制。

*   **组织级别控制：** 为整个组织选择 Zero Data Retention 或 Modified Abuse Monitoring。
*   **项目级别控制：** 对于每个项目，选择 `default` 以继承组织级别设置，明确选择 Zero Data Retention 或 Modified Abuse Monitoring，或选择 **None** 以禁用该项目的这些控制。

### 每个端点的存储要求和保留控制

下表指示每个端点何时存储应用状态。Zero Data Retention 适用的端点不会为应用状态保留任何客户内容（受以下限制约束）。Zero Data Retention 不适用的端点或功能在使用时可能会保留应用状态，即使您已启用 Zero Data Retention。

| 端点 | 数据用于训练 | 滥用监控保留 | 应用状态保留 | Zero Data Retention 适用 |
| --- | --- | --- | --- | --- |
| `/v1/chat/completions` | 否 | 30 天 | 无，见下方例外 | 是，见下方限制 |
| `/v1/responses` | 否 | 30 天 | 无，见下方例外 | 是，见下方限制 |
| `/v1/conversations` | 否 | 删除前保留 | 删除前保留 | 否 |
| `/v1/conversations/items` | 否 | 删除前保留 | 删除前保留 | 否 |
| `/v1/chatkit/threads` | 否 | 删除前保留 | 删除前保留 | 否 |
| `/v1/assistants` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/threads` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/threads/messages` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/threads/runs` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/threads/runs/steps` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/vector_stores` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/images/generations` | 否 | 30 天 | 无 | 是，见下方限制 |
| `/v1/images/edits` | 否 | 30 天 | 无 | 是，见下方限制 |
| `/v1/images/variations` | 否 | 30 天 | 无 | 是，见下方限制 |
| `/v1/embeddings` | 否 | 30 天 | 无 | 是 |
| `/v1/audio/transcriptions` | 否 | 无 | 无 | 是 |
| `/v1/audio/translations` | 否 | 无 | 无 | 是 |
| `/v1/audio/speech` | 否 | 30 天 | 无 | 是 |
| `/v1/files` | 否 | 30 天 | 删除前保留\* | 否 |
| `/v1/fine_tuning/jobs` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/evals` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/batches` | 否 | 30 天 | 删除前保留 | 否 |
| `/v1/moderations` | 否 | 无 | 无 | 是 |
| `/v1/completions` | 否 | 30 天 | 无 | 是 |
| `/v1/realtime` | 否 | 30 天 | 无 | 是 |
| `/v1/videos` | 否 | 30 天 | 无 | 否 |

#### `/v1/chat/completions`

*   音频输出的应用状态存储 1 小时，以支持[多轮对话](/api/docs/guides/audio)。
*   当组织启用 Zero Data Retention 时，`store` 参数将始终被视为 `false`，即使请求尝试将值设置为 `true`。
*   参见[图像和文件输入](#image-and-file-inputs)。
*   扩展提示缓存需要将加密的键/值张量存储到 GPU 本地存储作为应用状态。此数据存储在本地 GPU 机器上，在 24 小时数据过期后不会保留。对 gpt-5.5、gpt-5.5-pro 和所有未来模型的请求需要扩展提示缓存，将 prompt\_cache\_retention 值设置为 in\_memory 将导致请求错误。要了解更多信息，请参阅[提示缓存指南](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention)。

#### `/v1/responses`

*   Responses API 默认有 30 天的应用状态保留期，或当 `store` 参数设置为 `true` 时。响应数据将至少存储 30 天。
*   当组织启用 Zero Data Retention 时，`store` 参数将始终被视为 `false`，即使请求尝试将值设置为 `true`。
*   后台模式将响应数据写入磁盘约 10 分钟以支持轮询。
*   音频输出的应用状态存储 1 小时，以支持[多轮对话](/api/docs/guides/audio)。
*   参见[图像和文件输入](#image-and-file-inputs)。
*   MCP 服务器（与[远程 MCP 服务器工具](/api/docs/guides/tools-remote-mcp)一起使用）是第三方服务，发送到 MCP 服务器的数据受其数据保留政策约束。
*   [Hosted Shell](/api/docs/guides/tools-shell#hosted-shell-quickstart) 和 [Code Interpreter](/api/docs/guides/tools-code-interpreter) 使用的托管容器可能会在容器活跃期间将临时应用状态写入容器文件系统（由临时块存储支持）。容器数据在容器过期或被明确删除时删除。
*   扩展提示缓存需要将加密的键/值张量存储到 GPU 本地存储作为应用状态。此数据存储在本地 GPU 机器上，在 24 小时数据过期后不会保留。对 gpt-5.5、gpt-5.5-pro 和所有未来模型的请求需要扩展提示缓存，将 prompt\_cache\_retention 值设置为 in\_memory 将导致请求错误。要了解更多信息，请参阅[提示缓存指南](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention)。
*   对于服务器端压缩，当 `store="false"` 时不保留任何数据。
*   我们支持两种形式的 [Skills](/api/docs/guides/tools-skills)：本地执行和托管容器执行。托管 Skills 遵循与 Hosted Shell 相同的容器生命周期：挂载的 Skills 和容器文件在容器活跃期间可用，在容器过期或被删除时丢弃。
*   通过网络连接传输到第三方服务的数据受其数据保留政策约束。

#### `/v1/assistants`、`/v1/threads` 和 `/v1/vector_stores`

*   与 Assistants API 相关的对象在您通过 API 或仪表板删除后 30 天从我们的服务器中删除。未通过 API 或仪表板删除的对象将无限期保留。

#### `/v1/images`

*   使用 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini` 时，图像生成兼容 Zero Data Retention，使用 `dall-e-3` 或 `dall-e-2` 时不兼容。

#### `/v1/files`

*   文件可以通过 API 或仪表板手动删除，也可以通过设置 `expires_after` 参数自动删除。更多信息请参见[此处](/api/docs/api-reference/files/create#files_create-expires_after)。

#### `/v1/videos`

*   `v1/videos` API 包含一个工作流，在处理过程中将数据保存到磁盘并保留 48 小时以允许调用者下载生成的视频，然后保留 30 天用于滥用监控。`v1/videos` 目前对 MAM 或 ZDR 请求被阻止。如果您的组织启用了数据保留控制，请按照[配置数据保留控制](#configuring-data-retention-controls)中的说明配置一个保留设置为 **None** 的项目，以便在该项目中使用 `/v1/videos`。

#### 图像和文件输入

图像和文件可以作为输入上传到 `/v1/responses`（包括使用 Computer Use 工具时）、`/v1/chat/completions` 和 `/v1/images`。图像和文件输入在提交时会被扫描 CSAM 内容。如果分类器检测到潜在的 CSAM 内容，即使启用了 Zero Data Retention 或 Modified Abuse Monitoring，该图像也将被保留以供人工审核。

#### Web Search

具有实时互联网访问的 Web Search 不符合 HIPAA 资格，不在 BAA 覆盖范围内。离线/仅缓存模式（`external_web_access: false`）的 Web Search 在与 ZDR 组织中启用 ZDR 的项目的 API 密钥一起使用时，有资格被 BAA 覆盖。此 HIPAA/BAA 指南仅适用于 Responses API `web_search` 工具。注意：预览变体（`web_search_preview`）忽略此参数，行为如同 `external_web_access` 为 `true`。我们建议使用 `web_search`。

## 数据驻留控制

数据驻留控制是一个项目配置选项，允许您配置 OpenAI 用于提供服务的基础设施位置。

请联系我们的[销售团队](https://openai.com/contact-sales)了解您是否有资格使用数据驻留控制。对于 2026 年 3 月 5 日及之后发布的符合数据驻留条件的模型，数据驻留端点收取 [10% 的附加费](/api/docs/pricing)。

### 数据驻留如何工作？

当您的账户启用数据驻留时，您可以从下方列出的可用区域中为您在账户中创建的新项目设置区域。如果您使用下方列出的受支持端点、模型和快照，该项目的客户内容（如您的服务协议中所定义）将在端点需要数据持久化才能运行的范围内（例如 /v1/batches）静态存储在所选区域。

如果您选择支持区域处理的区域（如下方特别标识），服务也将在所选区域内对您的客户内容执行推理。

数据驻留不适用于系统数据，系统数据可能在所选区域之外处理和存储。系统数据是指不包含客户内容的账户数据、元数据和使用数据，由服务收集并用于管理和运营服务，例如直接访问服务的最终用户（如您的人员）的账户信息或配置文件、分析、使用统计、计费信息、支持请求和结构化输出模式。

### 限制

数据驻留不适用于：(a) 由最终用户或客户的基础设施在访问服务时的位置导致的客户内容在所选区域之外的任何传输或存储；(b) 通过服务由 OpenAI 以外的各方提供的产品、服务或内容；或 (c) 客户内容以外的任何数据，例如系统数据。

如果您选择的区域不支持区域处理（如下方标识），OpenAI 也可能在区域之外处理和临时存储客户内容以提供服务。

### 非美国区域的额外要求

要将数据驻留用于美国以外的任何区域，您必须获得滥用监控控制的批准，并签署 Zero Data Retention 修正案。

选择阿联酋区域需要额外批准。请联系[销售](https://openai.com/contact-sales)获取帮助。

### 如何使用数据驻留

数据驻留在您的 API 组织中按项目配置。

要为区域存储配置数据驻留，请在创建新项目时从下拉菜单中选择适当的区域。

对于配置了数据驻留的项目的请求，请将下表中定义的域名前缀添加到每个请求中。

### 哪些模型和功能符合数据驻留条件？

以下模型和 API 服务目前符合下方指定区域的数据驻留条件。

**表 1：区域数据驻留能力**

| 区域 | 区域存储 | 区域处理 | 需要 Modified Abuse Monitoring 或 ZDR | 默认输入模式 | 域名前缀 |
| --- | --- | --- | --- | --- | --- |
| 美国 | ✅ | ✅ | ❌ | Text, Audio, Voice, Image | us.api.openai.com |
| 欧洲（EEA + 瑞士） | ✅ | ✅ | ✅ | Text, Audio, Voice, Image\* | eu.api.openai.com |
| 澳大利亚 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | au.api.openai.com |
| 加拿大 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | ca.api.openai.com |
| 日本 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | jp.api.openai.com |
| 印度 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | in.api.openai.com |
| 新加坡 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | sg.api.openai.com |
| 韩国 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | kr.api.openai.com |
| 英国 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | gb.api.openai.com |
| 阿联酋 | ✅ | ❌ | ✅ | Text, Audio, Voice, Image\* | ae.api.openai.com |

\* 这些区域的图像支持需要获得增强型 Zero Data Retention 或增强型 Modified Abuse Monitoring 的批准。

**表 2：API 端点和工具支持**

| 支持的服务 | 支持的模型快照 | 支持的区域 |
| --- | --- | --- |
| /v1/audio/transcriptions /v1/audio/translations /v1/audio/speech | tts-1  
whisper-1  
gpt-4o-tts  
gpt-4o-transcribe  
gpt-4o-mini-transcribe | 全部 |
| /v1/batches | gpt-5.5-pro-2026-04-23  
gpt-5.4-pro-2026-03-05  
gpt-5.2-pro-2025-12-11  
gpt-5-pro-2025-10-06  
gpt-5.5-2026-04-23  
gpt-5.4-2026-03-05  
gpt-5-2025-08-07  
gpt-5.4-mini-2026-03-17  
gpt-5.4-nano-2026-03-17  
gpt-5.2-2025-12-11  
gpt-5.1-2025-11-13  
gpt-5-mini-2025-08-07  
gpt-5-nano-2025-08-07  
gpt-4.1-2025-04-14  
gpt-4.1-mini-2025-04-14  
gpt-4.1-nano-2025-04-14  
o3-2025-04-16  
o4-mini-2025-04-16  
o1-pro  
o1-pro-2025-03-19  
o3-mini-2025-01-31  
o1-2024-12-17  
o1-mini-2024-09-12  
o1-preview  
gpt-4o-2024-11-20  
gpt-4o-2024-08-06  
gpt-4o-mini-2024-07-18  
gpt-4-turbo-2024-04-09  
gpt-4-0613  
gpt-3.5-turbo-0125 | 全部 |
| /v1/chat/completions | gpt-5.5-2026-04-23  
gpt-5.4-2026-03-05  
gpt-5.4-mini-2026-03-17  
gpt-5.4-nano-2026-03-17  
gpt-5.2-2025-12-11  
gpt-5.1-2025-11-13  
gpt-5-2025-08-07  
gpt-5-mini-2025-08-07  
gpt-5-nano-2025-08-07  
gpt-5-chat-latest-2025-08-07  
gpt-4.1-2025-04-14  
gpt-4.1-mini-2025-04-14  
gpt-4.1-nano-2025-04-14  
o3-mini-2025-01-31  
o3-2025-04-16  
o4-mini-2025-04-16  
o1-2024-12-17  
o1-mini-2024-09-12  
o1-preview  
gpt-4o-2024-11-20  
gpt-4o-2024-08-06  
gpt-4o-mini-2024-07-18  
gpt-4-turbo-2024-04-09  
gpt-4-0613  
gpt-3.5-turbo-0125 | 全部 |
| /v1/embeddings | text-embedding-3-small  
text-embedding-3-large  
text-embedding-ada-002 | 全部 |
| /v1/evals |  | 仅美国和欧盟 |
| /v1/files |  | 全部 |
| /v1/fine\_tuning/jobs | gpt-4o-2024-08-06  
gpt-4o-mini-2024-07-18  
gpt-4.1-2025-04-14  
gpt-4.1-mini-2025-04-14 | 全部 |
| /v1/images/edits | gpt-image-1  
gpt-image-1.5  
gpt-image-1-mini | 全部 |
| /v1/images/generations | dall-e-3  
gpt-image-1  
gpt-image-1.5  
gpt-image-1-mini | 全部 |
| /v1/moderations | text-moderation-latest\*  
omni-moderation-latest | 全部 |
| /v1/realtime | gpt-4o-realtime-preview-2025-06-03  
gpt-realtime  
gpt-realtime-1.5  
gpt-realtime-mini  
gpt-realtime-2 | 仅美国和欧盟 |
| /v1/realtime/transcription\_sessions | gpt-realtime-whisper | 仅美国和欧盟 |
| /v1/realtime/translations | gpt-realtime-translate | 仅美国和欧盟 |
| /v1/realtime | gpt-4o-realtime-preview-2024-12-17  
gpt-4o-realtime-preview-2024-10-01  
gpt-4o-mini-realtime-preview-2024-12-17 | 仅美国 |
| /v1/responses | gpt-5.5-pro-2026-04-23  
gpt-5.4-pro-2026-03-05  
gpt-5.2-pro-2025-12-11  
gpt-5-pro-2025-10-06  
gpt-5.5-2026-04-23  
gpt-5.4-2026-03-05  
gpt-5-2025-08-07  
gpt-5.4-mini-2026-03-17  
gpt-5.4-nano-2026-03-17  
gpt-5.2-2025-12-11  
gpt-5.1-2025-11-13  
gpt-5-mini-2025-08-07  
gpt-5-nano-2025-08-07  
gpt-5-chat-latest-2025-08-07  
gpt-4.1-2025-04-14  
gpt-4.1-mini-2025-04-14  
gpt-4.1-nano-2025-04-14  
o3-2025-04-16  
o4-mini-2025-04-16  
o1-pro  
o1-pro-2025-03-19  
computer-use-preview\*  
o3-mini-2025-01-31  
o1-2024-12-17  
o1-mini-2024-09-12  
o1-preview  
gpt-4o-2024-11-20  
gpt-4o-2024-08-06  
gpt-4o-mini-2024-07-18  
gpt-4-turbo-2024-04-09  
gpt-4-0613  
gpt-3.5-turbo-0125 | 全部 |
| /v1/responses File Search |  | 全部 |
| /v1/responses Web Search |  | 全部 |
| /v1/vector\_stores |  | 全部 |
| Code Interpreter tool |  | 全部 |
| File Search |  | 全部 |
| File Uploads |  | 全部，使用 base64 文件上传时 |
| Remote MCP server tool |  | 全部，但 MCP 服务器是第三方服务，发送到 MCP 服务器的数据受其数据驻留政策约束。 |
| Scale Tier |  | 全部 |
| Structured Outputs（不包括 schema） |  | 全部 |
| 支持的输入模态 |  | Text Image Audio/Voice |

### 端点限制

#### /v1/chat/completions

*   在非美国区域不能设置 store=true。
*   在不支持区域处理的区域中使用[扩展提示缓存](/api/docs/guides/prompt-caching#prompt-cache-retention)可能需要 OpenAI 在区域之外处理和临时存储客户内容以提供服务。

#### /v1/responses

*   computer-use-preview 快照仅支持美国/欧盟。
*   在欧盟区域不能设置 background=True。
*   在不支持区域处理的区域中使用[扩展提示缓存](/api/docs/guides/prompt-caching#prompt-cache-retention)可能需要 OpenAI 在区域之外处理和临时存储客户内容以提供服务。

#### /v1/realtime

追踪目前不符合 `/v1/realtime` 的欧盟数据驻留合规要求。

#### /v1/moderations

text-moderation-latest 仅支持美国/欧盟。

## 企业密钥管理 (EKM)

企业密钥管理 (EKM) 允许您使用由您自己的外部密钥管理系统 (KMS) 管理的密钥在 OpenAI 加密您的客户内容。

配置后，EKM 适用于您使用平台期间创建的任何[应用状态](#types-of-data-stored-with-openai-api)。有关 EKM 工作原理以及如何与您的 KMS 提供商集成的更多信息，请参阅 [EKM 帮助中心文章](https://help.openai.com/en/articles/20000943-openai-enterprise-key-management-ekm-overview)。

### EKM 限制

OpenAI 支持使用 AWS KMS、Google Cloud (GCP) 和 Azure Key Vault 中的外部账户进行自带密钥 (BYOK) 加密。如果您的组织使用不同的密钥管理服务，这些密钥需要同步到受支持的云 KMS 之一才能与 OpenAI 一起使用。

EKM 不支持以下产品。在启用 EKM 的项目中尝试使用这些端点将返回错误。

*   Assistants (/v1/assistants)
*   Vision fine tuning
