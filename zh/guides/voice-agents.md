# Voice agents

语音代理将相同的代理概念转化为口语化的低延迟交互。关键的设计选择在于决定模型是否应该直接处理实时音频，还是由你的应用程序显式地串联语音转文本、文本推理和文本转语音。

## 选择合适的架构

| 架构 | 最适合 | 原因 |
| --- | --- | --- |
| 使用实时音频会话的语音到语音 | 自然、低延迟的对话 | 模型直接处理实时音频输入和输出 |
| 链式语音管道 | 可预测的工作流或扩展现有的文本代理 | 你的应用程序对转录、文本推理和语音输出保持显式控制 |

Agent Builder 目前不支持语音工作流，因此语音仍然是 SDK 优先的接口。

## 推荐的起步方式

下面的示例是有意选择不同架构的，而非匹配的语言标签。TypeScript 和 Python 库目前提供不同的语音辅助工具：

*   在 TypeScript 中，构建基于浏览器的语音助手的最快路径是使用 `RealtimeAgent` 和 `RealtimeSession`。
*   在 Python 中，将现有文本代理扩展为语音的最简单路径是链式 `VoicePipeline`。

## 构建语音到语音的语音代理

当交互需要感觉像对话且即时响应时，使用实时音频 API 路径。这是需要打断、低首音频延迟、自然轮换和实时工具使用的语音代理的最佳起点。

通常的浏览器流程是：

1.  你的应用服务器为实时音频会话创建一个临时客户端密钥。
2.  你的前端创建一个 `RealtimeSession`。
3.  会话通过浏览器中的 WebRTC 或服务器上的 WebSocket 连接。
4.  代理在该会话中处理音频轮次、工具、中断和交接。

**启动实时语音会话**

```typescript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
  name: "Assistant",
  instructions: "You are a helpful voice assistant.",
});

const session = new RealtimeSession(agent, {
  model: "gpt-realtime-2",
});

await session.connect({
  apiKey: "ek_...(ephemeral key from your server)",
});
```

从这里开始，将工具、交接和护栏附加到 `RealtimeAgent` 上，方式与附加到文本代理相同。将音频传输相关的问题保留在会话层，将业务逻辑保留在代理定义中。

当你需要更底层的控制时，从传输文档开始：

*   [实时和音频概述](/guides/realtime)
*   [使用 WebRTC 的实时音频 API](/guides/realtime-webrtc)
*   [使用 WebSocket 的实时音频 API](/guides/realtime-websocket)

## 构建链式语音工作流

当你想要对中间文本有更强的控制、复用现有文本代理，或从非语音工作流获得更简单的扩展路径时，使用链式路径。在这种设计中，你的应用程序显式管理：

1.  语音转文本
2.  代理工作流本身
3.  文本转语音

这通常更适合支持流程、需要大量审批的流程，或者你希望在每个阶段之间拥有持久化转录和确定性逻辑的场景。

**运行链式语音管道**

```python
import asyncio
import numpy as np

from agents import Agent, function_tool
from agents.voice import AudioInput, SingleAgentVoiceWorkflow, VoicePipeline


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Assistant",
    instructions="You are a helpful voice assistant.",
    model="gpt-5.5",
    tools=[get_weather],
)


async def main() -> None:
    pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))
    audio_input = AudioInput(buffer=np.zeros(24000 * 3, dtype=np.int16))
    result = await pipeline.run(audio_input)
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            print("Received audio bytes", len(event.data))


if __name__ == "__main__":
    asyncio.run(main())
```

当每个阶段需要可见或可替换时，使用此路径。例如，你可能会存储转录内容，在文本代理响应之前运行策略检查，调用内部系统，然后仅在工作流达到已批准的答案后才生成语音。

## 语音代理仍然使用相同的核心代理构建模块

语音接口改变了传输和音频循环，但核心工作流决策是相同的：

*   当语音代理需要外部能力时，使用[使用工具](/guides/tools#usage-in-the-agents-sdk)。
*   当口语工作流需要流式传输、延续或持久状态时，使用[运行代理](/guides/agents/running-agents)。
*   当口语工作流需要跨专家分支时，使用[编排和交接](/guides/agents/orchestration)。
*   当口语工作流需要安全检查或审批时，使用[护栏和人工审核](/guides/agents/guardrails-approvals)。
*   当你需要基于 MCP 的能力或想要检查语音工作流的行为时，使用[集成和可观测性](/guides/agents/integrations-observability)。

实用规则是：首先选择音频架构，然后以与文本相同的方式设计代理工作流的其余部分。

## 后续步骤

[实时和音频概述 - 为你的用例选择正确的实时或音频指南。](/guides/realtime)

[管理对话 - 使用实时会话生命周期和事件模型。](/guides/realtime-conversations)

[WebRTC 连接 - 将浏览器和移动端音频直接连接到实时会话。](/guides/realtime-webrtc)

[实时提示指南 - 调优推理、前言、工具、实体捕获和语音行为。](/guides/realtime-models-prompting)
