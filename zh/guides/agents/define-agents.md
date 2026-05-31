# Agent definitions

Agent 是基于 SDK 工作流的核心单元。它封装了模型、指令以及可选的运行时行为，如工具、护栏、MCP 服务器、交接和结构化输出。

## Agent 上应包含什么

使用 agent 配置来定义该专家固有的决策：

| 属性 | 用途 | 延伸阅读 |
| --- | --- | --- |
| `name` | 在追踪和工具/交接界面中的人类可读标识 | 本页 |
| `instructions` | 该 agent 的任务、约束和风格 | 本页 |
| `prompt` | 用于基于 Responses 运行的存储提示配置 | [模型和提供者](/guides/agents/models) |
| `model` 和模型设置 | 选择模型和调整行为 | [模型和提供者](/guides/agents/models) |
| `tools` | agent 可以直接调用的能力 | [使用工具](/guides/tools#usage-in-the-agents-sdk) |
| `handoffDescription` | 提示其他 agent 何时应委派到此处 | [编排和交接](/guides/agents/orchestration) |
| `handoffs` | 委派给另一个 agent | [编排和交接](/guides/agents/orchestration) |
| `outputType` | 返回结构化输出而非纯文本 | 本页 |
| 护栏和审批 | 验证、阻止和审核流程 | [护栏和人工审核](/guides/agents/guardrails-approvals) |
| MCP 服务器和托管 MCP 工具 | 附加基于 MCP 的能力 | [集成和可观测性](/guides/agents/integrations-observability#mcp) |

## 从一个专注的 agent 开始

定义能够承担明确任务的最小 agent。只有当你需要独立的职责、不同的指令、不同的工具集或不同的审批策略时，才添加更多 agent。

**定义单个 agent**

::: code-group
```typescript
import { Agent, tool } from "@openai/agents";
import { z } from "zod";

const getWeather = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});

const agent = new Agent({
  name: "Weather bot",
  instructions: "You are a helpful weather bot.",
  model: "gpt-5.5",
  tools: [getWeather],
});
```

```python
from agents import Agent, function_tool


@function_tool
def get_weather(city: str) -> str:
    """Return the weather for a given city."""
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Weather bot",
    instructions="You are a helpful weather bot.",
    model="gpt-5.5",
    tools=[get_weather],
)
```

:::




## 精心设计指令、交接和输出

三个配置选择需要特别注意：

*   从静态 `instructions` 开始。当指导内容依赖于当前用户、租户或运行时上下文时，切换为动态指令回调，而不是在调用处拼接字符串。
*   保持 `handoffDescription` 简短且具体，以便路由 agent 知道何时选择该专家。
*   当下游代码需要类型化数据而非自由格式文本时，使用 `outputType`。

**返回结构化输出**

::: code-group
```typescript
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const calendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const agent = new Agent({
  name: "Calendar extractor",
  instructions: "Extract calendar events from text.",
  outputType: calendarEvent,
});

const result = await run(
  agent,
  "Dinner with Priya and Sam on Friday.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from pydantic import BaseModel

from agents import Agent, Runner


class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]


agent = Agent(
    name="Calendar extractor",
    instructions="Extract calendar events from text.",
    output_type=CalendarEvent,
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "Dinner with Priya and Sam on Friday.",
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::




当你想引用 Responses API 中存储的提示配置而不是在代码中嵌入整个系统提示时，使用 `prompt`。

## 将本地上下文与模型上下文分开

SDK 允许你将应用状态和依赖项传入运行中，而不将它们发送给模型。用于已认证的用户信息、数据库客户端、日志记录器和辅助函数等数据。

**将本地上下文传递给工具**

::: code-group
```typescript
import { Agent, RunContext, run, tool } from "@openai/agents";
import { z } from "zod";

interface UserInfo {
  name: string;
  uid: number;
}

const fetchUserAge = tool({
  name: "fetch_user_age",
  description: "Return the age of the current user.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext&lt;UserInfo>) {
    return `User ${runContext?.context.name} is 47 years old`;
  },
});

const agent = new Agent&lt;UserInfo>({
  name: "Assistant",
  tools: [fetchUserAge],
});

const result = await run(agent, "What is the age of the user?", {
  context: { name: "John", uid: 123 },
});

console.log(result.finalOutput);
```

```python
import asyncio
from dataclasses import dataclass

from agents import Agent, RunContextWrapper, Runner, function_tool


@dataclass
class UserInfo:
    name: str
    uid: int


@function_tool
async def fetch_user_age(wrapper: RunContextWrapper[UserInfo]) -> str:
    """Fetch the age of the current user."""
    return f"The user {wrapper.context.name} is 47 years old."


agent = Agent[UserInfo](
    name="Assistant",
    tools=[fetch_user_age],
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "What is the age of the user?",
        context=UserInfo(name="John", uid=123),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::





重要的边界是：

*   对话历史是模型看到的内容。
*   运行上下文是你的代码看到的内容。

如果模型需要某个事实，将其放在指令、输入、检索或工具中。如果只有你的运行时需要它，将其保留在本地上下文中。

## 何时将一个 agent 拆分为多个

当一个专家不应拥有完整回复的所有权，或者不同能力之间存在实质性差异时，拆分 agent。常见原因包括：

*   某个专家需要不同的工具或 MCP 接口。
*   某个专家需要不同的审批策略或护栏。
*   工作流的某个分支需要不同的模型或输出风格。
*   你希望在追踪中看到显式路由，而不是单个大型提示。

## 后续步骤

一旦一个专家被清晰定义，请转到与下一个设计问题匹配的指南。

[模型和提供者 - 为此 agent 选择模型、默认值和传输策略。](/guides/agents/models)

[使用工具 - 添加 agent 可以直接调用的能力。](/guides/tools#usage-in-the-agents-sdk)

[编排和交接 - 当一个 agent 不再足够时，选择专家之间如何协作。](/guides/agents/orchestration)

[运行 agent - 了解运行时循环、状态和流式行为。](/guides/agents/running-agents)
