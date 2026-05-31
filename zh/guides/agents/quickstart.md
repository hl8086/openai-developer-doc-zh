
当你想要以最短路径构建一个基于 SDK 的 agent 时，请参考本页面。以下示例在 TypeScript 和 Python 中使用相同的高层概念：定义一个 agent，运行它，然后随着工作流的增长添加工具和专业 agent。

## 安装 SDK

创建项目，安装 SDK，并设置你的 API 密钥。

[

创建 API 密钥

](https://platform.openai.com/api-keys)

```
# TypeScript
npm install @openai/agents zod

# Python
pip install openai-agents

export OPENAI_API_KEY=sk-...
```

## 创建并运行你的第一个 agent

从一个专注的 agent 和一轮对话开始。SDK 处理模型调用并返回一个包含最终输出和运行历史的结果对象。

**创建并运行一个 agent**

```
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "History tutor",
  instructions:
    "You answer history questions clearly and concisely.",
  model: "gpt-5.5",
});

const result = await run(agent, "When did the Roman Empire fall?");
console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner

agent = Agent(
    name="History tutor",
    instructions="You answer history questions clearly and concisely.",
    model="gpt-5.5",
)


async def main() -> None:
    result = await Runner.run(agent, "When did the Roman Empire fall?")
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


你应该会在终端中看到一个简洁的回答。一旦这个循环正常工作，保持相同的结构并逐步添加功能，而不是一开始就设计一个大型多 agent 系统。

## 将状态传递到下一轮

第一次运行的结果也是你决定第二轮应该使用什么状态的依据。

| 如果你想要 | 从这里开始 |
| --- | --- |
| 在应用程序中保留完整历史 | `result.history` |
| 让 SDK 为你加载和保存历史 | 一个 session |
| 让 OpenAI 管理延续状态 | 一个服务器管理的 continuation ID |
| 恢复因审批或中断而暂停的运行 | `result.state`，配合 `interruptions` |

在 handoff 之后，当该专业 agent 应继续保持控制时，在下一轮中复用 `lastAgent`。

## 给 agent 添加工具

你添加的第一个能力通常是一个函数工具或 OpenAI 托管工具，如 web search 或 file search。

**添加函数工具**

::: code-group
```typescript
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const historyFunFact = tool({
  name: "history_fun_fact",
  description: "Return a short history fact.",
  parameters: z.object({}),
  async execute() {
    return "Sharks are older than trees.";
  },
});

const agent = new Agent({
  name: "History tutor",
  instructions:
    "Answer history questions clearly. Use history_fun_fact when it helps.",
  tools: [historyFunFact],
});

const result = await run(
  agent,
  "Tell me something surprising about ancient life on Earth.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, function_tool


@function_tool
def history_fun_fact() -> str:
    """Return a short history fact."""
    return "Sharks are older than trees."


agent = Agent(
    name="History tutor",
    instructions="Answer history questions clearly. Use history_fun_fact when it helps.",
    tools=[history_fun_fact],
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "Tell me something surprising about ancient life on Earth.",
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::



当你需要托管工具、tool search 或 agents-as-tools 时，请使用共享的[使用工具](/guides/tools#usage-in-the-agents-sdk)指南。

## 添加专业 agent

常见的下一步是将工作流拆分为多个专业 agent，并让路由器通过 handoff 将任务委派给它们。

**路由到专业 agent**

::: code-group
```typescript
import { Agent, run } from "@openai/agents";

const historyTutor = new Agent({
  name: "History tutor",
  instructions: "Answer history questions clearly and concisely.",
});

const mathTutor = new Agent({
  name: "Math tutor",
  instructions: "Explain math step by step and include worked examples.",
});

const triageAgent = Agent.create({
  name: "Homework triage",
  instructions: "Route each homework question to the right specialist.",
  handoffs: [historyTutor, mathTutor],
});

const result = await run(
  triageAgent,
  "Who was the first president of the United States?",
);

console.log(result.finalOutput);
console.log(result.lastAgent?.name);
```

```python
import asyncio

from agents import Agent, Runner

history_tutor = Agent(
    name="History tutor",
    handoff_description="Specialist for history questions.",
    instructions="Answer history questions clearly and concisely.",
)

math_tutor = Agent(
    name="Math tutor",
    handoff_description="Specialist for math questions.",
    instructions="Explain math step by step and include worked examples.",
)

triage_agent = Agent(
    name="Homework triage",
    instructions="Route each homework question to the right specialist.",
    handoffs=[history_tutor, math_tutor],
)


async def main() -> None:
    result = await Runner.run(
        triage_agent,
        "Who was the first president of the United States?",
    )
    print(result.final_output)
    print(result.last_agent.name)


if __name__ == "__main__":
    asyncio.run(main())
```

:::




## 尽早检查 traces

标准的服务器端 SDK 路径包含 tracing。一旦第一次运行成功，打开 [Traces 仪表板](https://platform.openai.com/traces) 来检查模型调用、工具调用、handoff 和 guardrails，然后再开始调优提示词。

## 下一步

一旦第一次运行成功，继续阅读与你想要添加的下一个功能匹配的指南。

[Agent 定义 - 在扩展工作流之前先把一个专业 agent 设计好。](/guides/agents/define-agents)

[使用工具 - 添加托管工具、函数工具和 agents-as-tools。](/guides/tools#usage-in-the-agents-sdk)

[运行 agent - 了解 agent 循环、流式传输和延续策略。](/guides/agents/running-agents)

[编排和 handoff - 决定何时让专业 agent 接管对话。](/guides/agents/orchestration)
