
当工作流的形态明确后，接下来的问题是哪些外部接口应该存在于代理循环中，以及你将如何检查运行时实际发生了什么。

## 选择哪些内容放在 SDK 中

| 需求 | 起步方案 | 原因 |
| --- | --- | --- |
| 让代理访问公开的、远程托管的 MCP 工具 | SDK 中的托管 MCP 工具 | 模型可以通过托管接口调用远程 MCP 服务器 |
| 从你的运行时连接本地或私有 MCP 服务器 | 通过 stdio 或 streamable HTTP 的 SDK 管理的 MCP 服务器 | 你的运行时拥有连接、审批和网络边界的控制权 |
| 调试提示词、工具、交接或审批 | 内置追踪 | 追踪在你正式建立评估之前展示端到端的记录 |

工具能力的语义仍然在[使用工具](/guides/tools)中定义。本页重点介绍 SDK 特定的 MCP 接线和可观测性循环。

## MCP

当远程服务器应通过模型接口运行时，使用托管 MCP 工具。

**附加托管 MCP 服务器**

::: code-group
```typescript
import { Agent, hostedMcpTool } from "@openai/agents";

const agent = new Agent({
  name: "MCP assistant",
  instructions: "Use the MCP tools to answer questions.",
  tools: [
    hostedMcpTool({
      serverLabel: "gitmcp",
      serverUrl: "https://gitmcp.io/openai/codex",
    }),
  ],
});
```

```python
from agents import Agent, HostedMCPTool

agent = Agent(
    name="MCP assistant",
    instructions="Use the MCP tools to answer questions.",
    tools=[
        HostedMCPTool(
            tool_config={
                "type": "mcp",
                "server_label": "gitmcp",
                "server_url": "https://gitmcp.io/openai/codex",
                "require_approval": "never",
            }
        )
    ],
)
```

:::



当你的应用程序需要直接连接到 MCP 服务器时，使用本地传输。

**连接本地 MCP 服务器**

::: code-group
```typescript
import { Agent, MCPServerStdio, run } from "@openai/agents";

const server = new MCPServerStdio({
  name: "Filesystem MCP Server",
  fullCommand: "npx -y @modelcontextprotocol/server-filesystem ./sample_files",
});

await server.connect();

try {
  const agent = new Agent({
    name: "Filesystem assistant",
    instructions: "Read files with the MCP tools before answering.",
    mcpServers: [server],
  });

  const result = await run(agent, "Read the files and list them.");
  console.log(result.finalOutput);
} finally {
  await server.close();
}
```

```python
import asyncio

from agents import Agent, Runner
from agents.mcp import MCPServerStdio


async def main() -> None:
    async with MCPServerStdio(
        name="Filesystem MCP Server",
        params={
            "command": "npx",
            "args": [
                "-y",
                "@modelcontextprotocol/server-filesystem",
                "./sample_files",
            ],
        },
    ) as server:
        agent = Agent(
            name="Filesystem assistant",
            instructions="Read files with the MCP tools before answering.",
            mcp_servers=[server],
        )
        result = await Runner.run(agent, "Read the files and list them.")
        print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::



实际的划分方式是：

*   当公共远程服务器符合平台信任模型时，使用**托管 MCP**。
*   当你的运行时需要拥有连接、过滤或审批的控制权时，使用**本地或私有 MCP**。

关于平台级概念、信任模型和产品支持方案，请以 [MCP 和连接器](/guides/tools-connectors-mcp)作为权威参考。

## 追踪

追踪功能内置于 Agents SDK 中，在正常的服务端 SDK 路径中默认启用。每次运行都可以发出模型调用、工具调用、交接、护栏和自定义 span 的结构化记录，你可以在[追踪仪表板](https://platform.openai.com/traces)中查看。

默认追踪通常会提供：

*   整体运行或工作流
*   每次模型调用
*   工具调用及其输出
*   交接和护栏
*   你在工作流中包裹的任何自定义 span

如果你需要减少追踪，请使用 SDK 级别或按运行的追踪控制，而不是从工作流中移除所有可观测性。

**将多次运行包裹在一个追踪中**

::: code-group
```typescript
import { Agent, run, withTrace } from "@openai/agents";

const agent = new Agent({
  name: "Joke generator",
  instructions: "Tell funny jokes.",
});

await withTrace("Joke workflow", async () => {
  const first = await run(agent, "Tell me a joke");
  const second = await run(agent, `Rate this joke: ${first.finalOutput}`);
  console.log(first.finalOutput);
  console.log(second.finalOutput);
});
```

```python
import asyncio

from agents import Agent, Runner, trace

agent = Agent(
    name="Joke generator",
    instructions="Tell funny jokes.",
)


async def main() -> None:
    with trace("Joke workflow"):
        first = await Runner.run(agent, "Tell me a joke")
        second = await Runner.run(
            agent,
            f"Rate this joke: {first.final_output}",
        )
        print(first.final_output)
        print(second.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::




追踪用于两个目的：

*   调试单次工作流运行，了解发生了什么。
*   当你准备系统性地评分行为时，将更高信号的示例输入到[代理工作流评估](/guides/agent-evals)中。

## 后续步骤

一旦外部接口接入完成，继续阅读涵盖能力设计、审查边界或评估的指南。

[使用工具 - 了解托管工具、函数工具和代理即工具如何与 MCP 配合使用。](/guides/tools#usage-in-the-agents-sdk)

[护栏和人工审查 - 围绕敏感能力添加审批或验证边界。](/guides/agents/guardrails-approvals)

[代理工作流评估 - 当行为稳定后，从一次性追踪转向可重复的评分。](/guides/agent-evals)
