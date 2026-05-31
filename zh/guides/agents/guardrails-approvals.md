
使用护栏进行自动检查，使用人工审核进行审批决策。两者共同定义了运行应何时继续、暂停或停止。

*   **护栏** 自动验证输入、输出或工具行为。
*   **人工审核** 暂停运行，以便人员或策略可以批准或拒绝敏感操作。

## 选择合适的控制方式

| 使用场景 | 建议方案 |
| --- | --- |
| 在主模型运行之前阻止不允许的用户请求 | 输入护栏 |
| 在最终输出离开系统之前验证或脱敏 | 输出护栏 |
| 检查函数工具调用前后的参数或结果 | 工具护栏 |
| 在执行取消、编辑、shell 命令或敏感 MCP 操作等副作用之前暂停 | 人机协作审批 |

## 添加阻断式护栏

当你希望在工作流中昂贵或有副作用的部分开始之前运行快速验证步骤时，使用输入护栏。

**使用输入护栏阻断请求**

::: code-group
```typescript
import {
  Agent,
  InputGuardrailTripwireTriggered,
  run,
} from "@openai/agents";
import { z } from "zod";

const guardrailAgent = new Agent({
  name: "Homework check",
  instructions: "Detect whether the user is asking for math homework help.",
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string(),
  }),
});

const agent = new Agent({
  name: "Customer support",
  instructions: "Help customers with support questions.",
  inputGuardrails: [
    {
      name: "Math homework guardrail",
      runInParallel: false,
      async execute({ input, context }) {
        const result = await run(guardrailAgent, input, { context });
        return {
          outputInfo: result.finalOutput,
          tripwireTriggered: result.finalOutput?.isMathHomework === true,
        };
      },
    },
  ],
});

try {
  await run(agent, "Can you solve 2x + 3 = 11 for me?");
} catch (error) {
  if (error instanceof InputGuardrailTripwireTriggered) {
    console.log("Guardrail blocked the request.");
  }
}
```

```python
import asyncio

from pydantic import BaseModel

from agents import (
    Agent,
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered,
    RunContextWrapper,
    Runner,
    TResponseInputItem,
    input_guardrail,
)


class MathHomeworkOutput(BaseModel):
    is_math_homework: bool
    reasoning: str


guardrail_agent = Agent(
    name="Homework check",
    instructions="Detect whether the user is asking for math homework help.",
    output_type=MathHomeworkOutput,
)


@input_guardrail
async def math_guardrail(
    ctx: RunContextWrapper[None],
    agent: Agent,
    input: str | list[TResponseInputItem],
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_math_homework,
    )


agent = Agent(
    name="Customer support",
    instructions="Help customers with support questions.",
    input_guardrails=[math_guardrail],
)


async def main() -> None:
    try:
        await Runner.run(agent, "Can you solve 2x + 3 = 11 for me?")
    except InputGuardrailTripwireTriggered:
        print("Guardrail blocked the request.")


if __name__ == "__main__":
    asyncio.run(main())
```

:::



当启动主代理的成本或风险过高时，使用阻断式执行。当低延迟比避免推测性工作更重要时，使用并行护栏。

## 暂停等待人工审核

审批是工具调用的人机协作路径。模型仍然可以决定需要执行某个操作，但运行会暂停，直到你批准或拒绝。

**在执行敏感操作前暂停等待审批**

::: code-group
```typescript
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const cancelOrder = tool({
  name: "cancel_order",
  description: "Cancel a customer order.",
  parameters: z.object({ orderId: z.number() }),
  needsApproval: true,
  async execute({ orderId }) {
    return `Cancelled order ${orderId}`;
  },
});

const agent = new Agent({
  name: "Support agent",
  instructions: "Handle support requests and ask for approval when needed.",
  tools: [cancelOrder],
});

let result = await run(agent, "Cancel order 123.");

if (result.interruptions?.length) {
  const state = result.state;
  for (const interruption of result.interruptions) {
    state.approve(interruption);
  }
  result = await run(agent, state);
}

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, function_tool


@function_tool(needs_approval=True)
async def cancel_order(order_id: int) -> str:
    return f"Cancelled order {order_id}"


agent = Agent(
    name="Support agent",
    instructions="Handle support requests and ask for approval when needed.",
    tools=[cancel_order],
)


async def main() -> None:
    result = await Runner.run(agent, "Cancel order 123.")

    if result.interruptions:
        state = result.to_state()
        for interruption in result.interruptions:
            state.approve(interruption)
        result = await Runner.run(agent, state)

    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::




即使需要审批的工具位于工作流更深层（例如在交接之后或嵌套的 `agent.asTool()` 调用内部），同样的中断模式也适用。

## 审批生命周期

当工具调用需要审核时，SDK 每次都遵循相同的模式：

1.  运行记录一个审批中断，而不是执行工具。
2.  结果返回 `interruptions` 以及可恢复的 `state`。
3.  你的应用程序批准或拒绝待处理的项目。
4.  你从 `state` 恢复同一次运行，而不是开始新的用户轮次。

如果审核可能需要时间，序列化 `state`，存储它，稍后再恢复。这仍然是同一次运行。

## 工作流边界很重要

代理级护栏不会在所有地方运行：

*   输入护栏仅对链中的第一个代理运行。
*   输出护栏仅对产生最终输出的代理运行。
*   工具护栏在其所附加的函数工具上运行。

如果你需要在管理器风格的工作流中检查每个自定义工具调用，不要仅依赖代理级的输入或输出护栏。将验证放在产生副作用的工具旁边。

## 流式传输和延迟审核使用相同的状态模型

流式传输不会创建单独的审批系统。如果流式运行暂停，等待其稳定，检查 `interruptions`，解决审批，然后从相同的 `state` 恢复。如果审核稍后发生，存储序列化的状态，并在决策到达时继续同一次运行。

## 后续步骤

一旦控制边界明确，继续阅读涵盖其周围运行时或工具层面的指南。

[运行代理 - 了解中断和恢复如何融入运行时循环。](/guides/agents/running-agents)

[结果和状态 - 了解暂停的运行向你的应用程序返回哪些结果。](/guides/agents/results)

[使用工具 - 决定哪些工具层面在副作用发生之前需要验证或审批。](/guides/tools#usage-in-the-agents-sdk)
