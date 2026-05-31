
定义一个 agent 只是设置步骤。运行时的问题是：单次运行做什么、下一轮如何继续、以及工作流在暂停等待审批或工具工作时如何表现。

## Agent 循环

一次 SDK 运行就是一个应用层面的轮次。运行器会持续循环直到达到真正的停止点：

1.  使用准备好的输入调用当前 agent 的模型。
2.  检查模型输出。
3.  如果模型产生了工具调用，执行它们并继续。
4.  如果模型将任务移交给另一个专家，切换 agent 并继续。
5.  如果模型产生了最终答案且没有更多工具工作，返回结果。

这个循环是 SDK 背后的核心概念。工具、移交、审批和流式传输都是在其之上构建的，而不是替代它。

## 选择一种对话策略

有四种常见的方式将状态带入下一轮：

| 策略 | 状态存储位置 | 最适合 | 下一轮传递什么 |
| --- | --- | --- | --- |
| `result.history` | 你的应用 | 小型聊天循环和最大控制力 | 可重放的历史记录 |
| `session` | 你的存储加上 SDK | 持久化聊天状态、可恢复的运行和你控制的存储 | 同一个 session |
| `conversationId` | OpenAI Conversations API | 跨 worker 或服务的共享服务器管理状态 | 同一个 conversation ID 和仅新的轮次 |
| `previousResponseId` | OpenAI Responses API | 从一个响应到下一个响应的最轻量级服务器管理延续 | 上一个 response ID 和仅新的轮次 |

在大多数应用中，每个对话选择一种策略。将本地重放与服务器管理状态混合使用可能会重复上下文，除非你有意协调两个层。

**使用 session 持久化多轮状态**

::: code-group
```typescript
import { Agent, MemorySession, run } from "@openai/agents";

const agent = new Agent({
  name: "Tour guide",
  instructions: "Answer with compact travel facts.",
});

const session = new MemorySession();

const firstTurn = await run(
  agent,
  "What city is the Golden Gate Bridge in?",
  { session },
);
console.log(firstTurn.finalOutput);

const secondTurn = await run(agent, "What state is it in?", { session });
console.log(secondTurn.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, SQLiteSession

agent = Agent(
    name="Tour guide",
    instructions="Answer with compact travel facts.",
)

session = SQLiteSession("conversation_123")


async def main() -> None:
    first_turn = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session,
    )
    print(first_turn.final_output)

    second_turn = await Runner.run(
        agent,
        "What state is it in?",
        session=session,
    )
    print(second_turn.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


当你需要持久化记忆、可恢复的审批流程或由你的应用控制的存储时，session 是最佳默认选择。

**使用服务器管理状态继续**

```typescript
import { Agent, run } from "@openai/agents";
import OpenAI from "openai";

const agent = new Agent({
  name: "Assistant",
  instructions: "Reply very concisely.",
});

const client = new OpenAI();
const { id: conversationId } = await client.conversations.create({});

const first = await run(agent, "What city is the Golden Gate Bridge in?", {
  conversationId,
});
console.log(first.finalOutput);

const second = await run(agent, "What state is it in?", {
  conversationId,
});
console.log(second.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)


async def main() -> None:
    first = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
    )
    print(first.final_output)

    second = await Runner.run(
        agent,
        "What state is it in?",
        previous_response_id=first.last_response_id,
    )
    print(second.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


当多个系统需要共享一个命名对话时使用 `conversationId`。当你想要最低成本的响应到响应延续选项时使用 `previousResponseId`。

## 增量流式运行

流式传输使用相同的 agent 循环和相同的状态策略。唯一的区别是你在运行仍在进行时消费事件。

**在文本到达时流式运行**

```typescript
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Planet guide",
  instructions: "Answer with short facts.",
});

const stream = await run(agent, "Give me three short facts about Saturn.", {
  stream: true,
});

for await (const event of stream) {
  if (
    event.type === "raw_model_stream_event" &&
    event.data.type === "response.output_text.delta"
  ) {
    process.stdout.write(event.data.delta);
  }
}

await stream.completed;
console.log("\nFinal:", stream.finalOutput);
```

```python
import asyncio

from openai.types.responses import ResponseTextDeltaEvent

from agents import Agent, Runner

agent = Agent(
    name="Planet guide",
    instructions="Answer with short facts.",
)


async def main() -> None:
    stream = Runner.run_streamed(
        agent,
        "Give me three short facts about Saturn.",
    )

    async for event in stream.stream_events():
        if (
            event.type == "raw_response_event"
            and isinstance(event.data, ResponseTextDeltaEvent)
        ):
            print(event.data.delta, end="", flush=True)

    print(f"\nFinal: {stream.final_output}")


if __name__ == "__main__":
    asyncio.run(main())
```

:::


三条实用规则很重要：

*   在将运行视为已完成之前，等待流结束。
*   如果运行因审批而暂停，解决 `interruptions` 并从 `state` 恢复，而不是开始新的用户轮次。
*   如果你在轮次中途取消了流，如果你希望同一轮次稍后继续，请从 `state` 恢复未完成的轮次。

## 有意识地处理暂停和失败

两大类非正常路径的结果很重要：

*   **运行时或验证失败**，例如最大轮次限制、guardrail 异常或工具错误。
*   **预期的暂停**，例如人工审批请求，运行被有意中断，稍后应从相同状态恢复。

将审批视为暂停的运行，而不是新的轮次。这种区分使轮次计数、历史记录和服务器管理的延续 ID 保持一致。

## 后续步骤

一旦运行时循环清晰了，请转到与你需要设计的下一个工作流边界匹配的指南。

[结果和状态 - 了解你的应用应该将哪些结果表面带入下一轮。](/guides/agents/results)

[编排和移交 - 决定多个专家在同一运行时循环内如何协作。](/guides/agents/orchestration)

[Guardrails 和人工审核 - 添加验证和审批暂停而不破坏轮次连续性。](/guides/agents/guardrails-approvals)
