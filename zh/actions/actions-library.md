# Actions library

> 浏览可用的 Actions 示例库。

## 目的

虽然 GPT Actions 对于 API 开发者来说，相比从零开始使用这些 API 构建整个应用程序所需的工作量要少得多，但要让 GPT Actions 运行起来仍然需要一些设置工作。GPT Actions 库旨在为在常见应用程序上构建 GPT Actions 提供指导。

## 入门

如果你之前从未构建过 action，请先阅读[入门指南](/actions/getting-started)，以更好地了解 actions 的工作原理。

通常，本指南面向熟悉并能够熟练调用 API 的人员。如需调试帮助，请尝试向 ChatGPT 描述你的问题——并附上截图。

## 如何访问

[OpenAI Cookbook](/cookbook) 有一个第三方应用程序和中间件应用程序的[目录]( https://cdn.openai.com/API/docs/cookbook/topic/chatgpt)。

### 第三方 Actions cookbook

GPT Actions 可以直接与 HTTP 服务集成。利用 SaaS API 的 GPT Actions 将直接从 SaaS 提供商进行身份验证和请求资源，例如 [Google Drive]( https://cdn.openai.com/API/docs/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_google_drive) 或 [Snowflake]( https://cdn.openai.com/API/docs/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_snowflake_direct)。

### 中间件 Actions cookbook

GPT Actions 可以从使用中间件中受益。中间件允许进行预处理、数据格式化、数据过滤，甚至连接未通过 HTTP 暴露的端点（例如：数据库）。有多个中间件 cookbook 描述了示例实现路径，例如 [Azure]( https://cdn.openai.com/API/docs/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_azure_function)、[GCP]( https://cdn.openai.com/API/docs/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_google_cloud_function) 和 [AWS]( https://cdn.openai.com/API/docs/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_aws_function)。

## 向我们反馈

有哪些集成是你希望我们优先处理的？我们的集成中是否存在错误？请在 cookbook 页面的 github 上提交 PR 或 issue，我们会进行查看。

## 为我们的库做贡献

如果你有兴趣为我们的库做贡献，请遵循以下指南，然后在 github 上提交 PR 供我们审核。通常，请参照类似[此示例 GPT Action]( https://cdn.openai.com/API/docs/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_bigquery) 的模板。

指南 - 包含以下部分：

*   应用程序信息 - 描述第三方应用程序，并包含应用网站和 API 文档的链接
*   自定义 GPT 指令 - 包含要在自定义 GPT 中使用的确切指令
*   OpenAPI Schema - 包含要在 GPT Action 中使用的确切 OpenAPI schema
*   身份验证说明 - 对于 OAuth，包含确切的项目（authorization URL、token URL、scope 等）；还包括如何在应用程序中填写回调 URL 的说明（以及任何其他步骤）
*   常见问题与故障排除 - 用户可能遇到的常见陷阱有哪些？在此处写明问题及解决方法

## 免责声明

此 action 库旨在作为与 OpenAI 无法控制的第三方交互的指南。这些第三方可能会更改其 API 设置或配置，OpenAI 无法保证这些 Actions 能永久有效。请将它们视为起点。

本指南面向开发者和能够熟练编写 API 调用的人员。非技术用户可能会觉得这些步骤具有挑战性。
