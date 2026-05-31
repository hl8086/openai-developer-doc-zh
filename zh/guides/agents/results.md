# Results and state

> Handle agent results, continuations, and paused runs.

当你运行一个 agent 时，结果不仅仅是最终答案。它还是交接边界、下一轮对话的延续接口，以及运行暂停等待审核时的可恢复快照。

## 选择你需要的结果接口

大多数应用只需要少量结果属性：

| 如果你需要 | 使用 |
| --- | --- |
| 展示给用户的最终答案 | TypeScript 中的 `finalOutput` 或 Python 中的 `final_output` |
| 本地可重放的历史记录 | TypeScript 中的 `history` 或 Python 中的 `to_input_list()` |
| 通常应拥有下一轮对话的专业 agent | TypeScript 中的 `lastAgent` 或 Python 中的 `last_agent` |
| OpenAI 托管的响应链 | TypeScript 中的 `lastResponseId` 或 Python 中的 `last_response_id` |
| 待审批项和可恢复快照 | TypeScript 中的 `interruptions` 加 `state` 或 Python 中的 `to_state()` |

这些是需要首先学习的指南级接口。更丰富的运行项、原始模型响应和详细诊断信息仍属于 SDK 文档和参考资料的范畴。

## 传递到下一轮对话的内容

根据你的延续策略使用结果：

*   如果你的应用拥有完整的本地历史记录，复用 TypeScript 中的 `history` 或 Python 中的 `to_input_list()`。
*   如果你使用 session，继续传递相同的 session，让 SDK 为你加载和持久化历史记录。
*   如果你使用服务端托管的延续方式，只传递新的用户输入并复用存储的 ID，而不是重放完整的对话记录。
*   在交接之后，当该专业 agent 应继续控制下一轮对话时，复用 TypeScript 中的 `lastAgent` 或 Python 中的 `last_agent`。

## 中断的运行返回状态，而非最终答案

审批流程是结果有意不完整的主要场景。

*   TypeScript 中的 `finalOutput` 或 Python 中的 `final_output` 可能为空，因为运行实际上还没有完成。
*   `interruptions` 告诉你哪些待处理的工具调用需要决策。
*   TypeScript 中的 `state` 或 Python 中的 `to_state()` 是保存的快照，你在批准或拒绝这些项目后将其传回运行时。

当审核可能在稍后而非同一请求中发生时，你序列化的也是同一个状态接口。

## 更丰富的项目和诊断接口

SDK 还为需要超越上述高级接口的应用暴露了更丰富的运行项和诊断信息。这包括项目级别的工具和交接记录、原始模型响应、护栏结果和使用详情。

这些对于审计、自定义界面和深度调试很有用，但它们不需要成为大多数开发者在本站首先学习的内容。

## 后续步骤

一旦你知道哪些结果接口重要，继续阅读解释这些接口如何产生或检查的指南。

[运行 agents - 将结果处理连接回运行时循环和延续策略。](/guides/agents/running-agents)

[护栏和人工审核 - 了解暂停的运行如何返回中断和可恢复状态。](/guides/agents/guardrails-approvals)

[集成和可观测性 - 当你需要检查更丰富的工作流记录时使用追踪。](/guides/agents/integrations-observability)
