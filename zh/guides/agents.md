
Agents 是能够进行规划、调用工具、跨专家协作，并保持足够状态以完成多步骤工作的应用程序。

*   当你需要直接的 API 客户端来进行模型请求时，使用 **OpenAI 客户端库**。
*   当你的应用程序自行管理编排、工具执行、审批和状态时，使用 **Agents SDK** 页面。
*   仅当你明确需要托管的工作流编辑器和 ChatKit 路径时，才使用 **Agent Builder**。

## 获取 Agents SDK

使用 GitHub 仓库进行安装、提交问题、查看示例和语言特定的参考文档。

[TypeScript SDK - 在 GitHub 上打开 TypeScript SDK 仓库。](https://github.com/openai/openai-agents-js)

[Python SDK - 在 GitHub 上打开 Python SDK 仓库。](https://github.com/openai/openai-agents-python)

## 选择你的起点

| 如果你想要 | 从这里开始 | 原因 |
| --- | --- | --- |
| 构建代码优先的 agent 应用 | [快速开始](/guides/agents/quickstart) | 这是实现可运行 SDK 集成的最短路径。 |
| 清晰地定义一个专家 | [Agent 定义](/guides/agents/define-agents) | 当你仍在设计单个 agent 的契约时，从这里开始。 |
| 选择模型、默认值和传输方式 | [模型和提供者](/guides/agents/models) | 当模型选择、提供者设置或传输策略影响工作流时使用。 |
| 理解运行时循环和状态 | [运行 agents](/guides/agents/running-agents) | agent 循环、流式传输和续接策略都在这里。 |
| 在基于容器的环境中运行工作 | [沙箱 agents](/guides/agents/sandboxes) | 当 agent 需要文件、命令、包、快照、挂载或提供者链接时使用。 |
| 设计专家所有权 | [编排和交接](/guides/agents/orchestration) | 当你需要多个 agent 并且必须决定谁拥有回复权时使用。 |
| 添加验证或人工审核 | [护栏和人工审核](/guides/agents/guardrails-approvals) | 当工作流应在高风险工作继续之前阻止或暂停时使用。 |
| 了解运行返回的内容 | [结果和状态](/guides/agents/results) | 此页面解释最终输出、可恢复状态和下一轮界面。 |
| 添加托管工具、函数工具或 MCP | [使用工具](/guides/tools#usage-in-the-agents-sdk) 和 [集成与可观测性](/guides/agents/integrations-observability) | 工具语义在平台工具文档中；SDK 特定的 MCP 和追踪在这里。 |
| 检查和改进运行 | [集成与可观测性](/guides/agents/integrations-observability) 和 [评估 agent 工作流](/guides/agent-evals) | 先使用追踪进行调试，然后进入评估循环。 |
| 构建语音优先的工作流 | [语音 agents](/guides/voice-agents) | 语音仍然是 SDK 优先的路径，因为 Agent Builder 不支持它。 |

## 使用 SDK 构建

当你的服务器自行管理编排、工具执行、状态和审批时，使用 SDK 路径。该路径最适合以下场景：

*   使用 TypeScript 或 Python 编写类型化的应用代码
*   直接控制工具、MCP 服务器和运行时行为
*   自定义存储或服务器管理的对话策略
*   与现有产品逻辑或基础设施紧密集成

典型的 SDK 阅读顺序是：

*   从[快速开始](/guides/agents/quickstart)开始，在屏幕上获得一个可运行的结果。
*   使用 [Agent 定义](/guides/agents/define-agents)和[模型和提供者](/guides/agents/models)来清晰地设计一个专家。
*   随着工作流变得更复杂，继续阅读[运行 agents](/guides/agents/running-agents)、[编排和交接](/guides/agents/orchestration)和[护栏和人工审核](/guides/agents/guardrails-approvals)。
*   当应用逻辑依赖于运行对象或需要更深入的行为可见性时，使用[结果和状态](/guides/agents/results)和[集成与可观测性](/guides/agents/integrations-observability)。

## 使用 Agent Builder 进行托管工作流路径

当你需要 OpenAI 托管的工作流创建、发布和 ChatKit 部署时，使用 Agent Builder。这些页面被归为一组，因为它们描述的是一个产品界面：在可视化编辑器中构建工作流、发布版本、嵌入它们、自定义 UI 以及评估结果。

语音 agents 是一个例外：它们位于 SDK 路径中，因为 Agent Builder 目前不支持语音工作流。当你需要语音到语音或链式语音管道时，使用[语音 agents](/guides/voice-agents)。
