# Models and providers

> Choose models, defaults, and transport strategy for SDK-based agent runs.

每个 SDK 运行最终都会解析出一个模型和一个传输方式。大多数应用应保持该设置简洁明了：显式选择模型，默认使用标准 OpenAI 路径，仅在工作流确实需要时才使用 provider 或 transport 覆盖。

## 从显式模型选择开始

在生产环境中，优先选择显式指定模型，而非依赖 SDK 版本碰巧附带的运行时默认值。

*   当某个专家代理始终需要不同的质量、延迟或成本配置时，在该代理上设置 `model`。
*   当一个工作流需要同时覆盖多个代理时，设置运行级别的默认值。
*   当你希望为省略了 `model` 的代理提供进程级别的回退时，设置 `OPENAI_DEFAULT_MODEL`。

**为每个代理和每次运行设置模型**

::: code-group
```typescript
import { Agent, Runner } from "@openai/agents";

const fastAgent = new Agent({
  name: "Fast support agent",
  instructions: "Handle routine support questions.",
  model: "gpt-5.4-mini",
});

const generalAgent = new Agent({
  name: "General support agent",
  instructions: "Handle support questions carefully.",
});

const runner = new Runner({
  model: "gpt-5.5",
});

await runner.run(fastAgent, "Summarize ticket 123.");
const result = await runner.run(
  generalAgent,
  "Investigate the billing issue on account 456.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, RunConfig, Runner

fast_agent = Agent(
    name="Fast support agent",
    instructions="Handle routine support questions.",
    model="gpt-5.4-mini",
)

general_agent = Agent(
    name="General support agent",
    instructions="Handle support questions carefully.",
)


async def main() -> None:
    await Runner.run(fast_agent, "Summarize ticket 123.")

    result = await Runner.run(
        general_agent,
        "Investigate the billing issue on account 456.",
        run_config=RunConfig(model="gpt-5.5"),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::





对于大多数新的 SDK 工作流，建议从 [`gpt-5.5`](/models/gpt-5.5) 开始，仅在延迟或成本足够重要时才切换到更小的变体。请参阅平台级的 [使用 GPT-5.5](/guides/latest-model) 指南获取当前的模型选择建议。

## 选择最简单的默认策略

| 如果你需要 | 建议从此开始 | 原因 |
| --- | --- | --- |
| 为每个专家指定一个显式模型 | 在每个代理上设置 `model` | 工作流在代码和追踪中保持可读性 |
| 整个进程使用一个回退模型 | `OPENAI_DEFAULT_MODEL` | 省略了 `model` 的代理仍能可预测地解析 |
| 一个工作流级别的覆盖 | 运行级别的默认值 | 你可以为脚本、worker 或环境切换模型，而无需编辑每个代理 |
| 同一工作流中使用不同大小的模型 | 混合使用每个代理的模型 | 快速分流代理和较慢的深度专家代理可以干净地共存 |

如果你的团队关心确切的默认值，不要依赖 SDK 的回退机制。自己设置它。

## Provider 和 transport

| 需求 | 建议从此开始 |
| --- | --- |
| 在 OpenAI 上进行标准 SDK 运行 | 默认的 OpenAI provider 路径 |
| 通过 socket 进行多次重复的 Responses 模型往返 | SDK 中的 Responses WebSocket transport |
| 非 OpenAI 模型或混合 provider 栈 | 语言特定 SDK 文档中的 provider 或 adapter 接口 |

有两个重要区别：

*   Responses WebSocket transport 仍然使用正常的文本和工具代理循环。它与语音会话路径是分开的。
*   通过 WebRTC 或 WebSocket 的实时音频会话用于低延迟的语音或图像交互。请使用 [语音代理](/guides/voice-agents) 和 [实时音频 API 指南](/guides/realtime) 了解该路径。

确切的 provider 配置、provider 生命周期管理和 transport 辅助 API 仍然是语言特定的内容。请将这些细节保留在 SDK 文档中，而不是在此处重复。

## 模型设置、提示词和功能支持

模型选择只是运行时契约的一部分。

*   使用 `modelSettings` 进行调优，例如推理力度、详细程度和工具行为。
*   当你希望使用存储的提示词配置来控制运行，而不是在代码中嵌入完整的系统提示词时，使用 `prompt`。
*   某些 SDK 功能依赖于 OpenAI Responses 路径而非旧的兼容性接口，因此在需要高级工具加载或 transport 功能时请查阅 SDK 文档。

当模型契约是某个专家代理固有的属性时，将其保持在代理定义附近。仅当一组代理应共享相同的运行时选择时，才将其移至工作流级别的默认值。

## 后续步骤

一旦运行时契约明确，请继续阅读与工作流设计其余部分匹配的指南。

[代理定义 - 使模型选择与每个专家的职责保持一致。](/guides/agents/define-agents)

[运行代理 - 了解 transport 和模型选择如何影响运行时循环。](/guides/agents/running-agents)

[外部模型 - 当混合模型栈很重要时，比较更广泛的 provider 选项。](/guides/external-models)
