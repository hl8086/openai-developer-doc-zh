# Orchestration

> Coordinate multiple agents with handoffs and routing.

多智能体工作流在需要由专家负责不同部分工作时非常有用。第一个设计决策是确定在工作流的每个分支中，谁拥有最终面向用户的回答的所有权。

## 选择编排模式

| 模式 | 适用场景 | 行为 |
| --- | --- | --- |
| Handoffs | 专家应接管该工作分支的对话 | 控制权转移给专家智能体 |
| Agents as tools | 管理者应保持控制权，将专家作为有限能力进行调用 | 管理者保留回复的所有权 |

## 使用 handoffs 进行委托所有权转移

当专家应拥有下一个回复的所有权，而不仅仅是在幕后提供帮助时，handoffs 是最合适的选择。

**使用 handoffs 进行委托**

::: code-group
```typescript
import { Agent, handoff } from "@openai/agents";

const billingAgent = new Agent({ name: "Billing agent" });
const refundAgent = new Agent({ name: "Refund agent" });

const triageAgent = Agent.create({
  name: "Triage agent",
  handoffs: [billingAgent, handoff(refundAgent)],
});
```

```python
from agents import Agent, handoff

billing_agent = Agent(name="Billing agent")
refund_agent = Agent(name="Refund agent")

triage_agent = Agent(
    name="Triage agent",
    handoffs=[billing_agent, handoff(refund_agent)],
)
```

:::




保持路由表面清晰易读：

*   给每个专家分配一个狭窄的职责。
*   保持 `handoffDescription` 简短且具体。
*   仅在下一个分支确实需要不同的指令、工具或策略时才进行拆分。

在高级用法中，handoffs 还可以携带结构化元数据或过滤后的历史记录。这些具体的 API 保留在 SDK 文档中，因为不同语言的实现方式有所不同。

## 使用 agents as tools 实现管理者风格的工作流

当主智能体应负责最终回答，并将专家作为辅助工具调用时，使用 `agent.asTool()`。

**将专家作为工具调用**

::: code-group
```typescript
import { Agent } from "@openai/agents";

const summarizer = new Agent({
  name: "Summarizer",
  instructions: "Generate a concise summary of the supplied text.",
});

const mainAgent = new Agent({
  name: "Research assistant",
  tools: [
    summarizer.asTool({
      toolName: "summarize_text",
      toolDescription: "Generate a concise summary of the supplied text.",
    }),
  ],
});
```

```python
from agents import Agent

summarizer = Agent(
    name="Summarizer",
    instructions="Generate a concise summary of the supplied text.",
)

main_agent = Agent(
    name="Research assistant",
    tools=[
        summarizer.as_tool(
            tool_name="summarize_text",
            tool_description="Generate a concise summary of the supplied text.",
        )
    ],
)
```

:::





以下情况通常更适合使用此模式：

*   管理者应综合生成最终回答
*   专家执行的是有限任务，如摘要或分类
*   你希望有一个稳定的外部工作流，通过嵌套的专家调用来完成，而不是进行所有权转移

## 仅在契约发生变化时才添加专家

尽可能从单个智能体开始。仅在专家能实质性地改善能力隔离、策略隔离、提示词清晰度或追踪可读性时才添加专家。

过早拆分会产生更多提示词、更多追踪记录和更多审批环节，但不一定能让工作流变得更好。

## 后续步骤

一旦所有权模式明确，继续阅读涵盖相关运行时或状态问题的指南。

[智能体定义 - 完善每个专家的指令、工具和输出契约。](/guides/agents/define-agents)

[运行智能体 - 了解 handoffs 和工具在运行中的行为。](/guides/agents/running-agents)

[结果与状态 - 了解 lastAgent 和可恢复状态如何影响下一轮对话。](/guides/agents/results)
