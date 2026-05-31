
在 Responses API 实现功能对等后，我们已弃用 Assistants API。该 API 将于 2026 年 8 月 26 日关闭。请按照[迁移指南](/platform/assistants/migration)更新您的集成。[了解更多](https://platform.openai.com/docs/guides/migrate-to-responses)。

## 概述

使用 Assistants API 创建的助手可以配备工具，使其能够执行更复杂的任务或与您的应用程序交互。我们为助手提供了内置工具，但您也可以使用 Function Calling 定义自己的工具来扩展其功能。

Assistants API 目前支持以下工具：

[File Search - 内置 RAG 工具，用于处理和搜索文件](/assistants/tools/file-search)

[Code Interpreter - 编写和运行 Python 代码，处理文件和各种数据](/assistants/tools/code-interpreter)

[Function Calling - 使用您自己的自定义函数与应用程序交互](/assistants/tools/function-calling)

## 后续步骤

*   查看 API 参考以[提交工具输出]( https://developers.openai.com/api/reference/runs/submitToolOutputs)
*   使用我们的[快速入门应用](https://github.com/openai/openai-assistants-quickstart)构建一个使用工具的助手
