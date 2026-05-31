
| 内容 | 预期影响 |
| --- | --- |
| [使用 Responses API](#use-the-responses-api) | 质量、成本、延迟、可靠性 |
| [设置 `reasoning.effort`](#set-up-reasoningeffort) | 质量、成本、延迟 |
| [设置 `text.verbosity`](#set-up-textverbosity) | 质量、成本、延迟 |
| [设置 assistant `phase` 参数](#set-up-the-assistant-phase-parameter) | 质量、成本 |
| [使用 `tool_search`](#use-tool_search) | 成本、延迟 |
| [利用内置工具](#leverage-built-in-tools) | 质量 |
| [利用压缩](#leverage-compaction) | 成本 |
| [使用 `prompt_cache_key`](#use-prompt_cache_key) | 延迟、成本 |
| [使用 `reasoning.encrypted_content`](#use-reasoningencrypted_content) | 质量、延迟 |
| [使用 `background=True`](#use-backgroundtrue) | 可恢复性 |
| [使用 WebSocket 模式](#use-websocket-mode) | 延迟 |

## Use the Responses API

**始终从** [Responses API](/guides/migrate-to-responses) 开始。它是 OpenAI 的旗舰 API，也是获取最新模型行为、内置工具、有状态工作流和 Agent 功能的最佳入口。

## Set up `reasoning.effort`

使用 `reasoning.effort` 来决定模型在回答之前应该进行多少思考。

对于 `gpt-5.5`，支持的值为 `none`、`low`、`medium`、`high` 和 `xhigh`。默认值为 `medium`。较低的 effort 更快且使用更少的推理 token。较高的 effort 给模型更多时间进行规划、调试、综合和多步骤权衡。正确的值取决于**任务**，而不仅仅是模型。

当任务主要是提取、路由、分类或简单改写时使用 `low`。当模型需要诊断问题、比较选项、编写计划或推理代码时使用 `medium` 或 `high`。将 `xhigh` 保留给评估结果表明额外延迟值得的情况。

**根据任务调整推理 effort**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = [
  "Our CI job started failing after a dependency bump.",
  "",
  "Error:",
  "TypeError: Timeout.__init__() got an unexpected keyword argument 'connect'",
  "",
  "Identify the likeliest root cause and the smallest safe fix.",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  reasoning: { effort: "high" },
  input: prompt,
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Our CI job started failing after a dependency bump.

Error:
TypeError: Timeout.__init__() got an unexpected keyword argument 'connect'

Identify the likeliest root cause and the smallest safe fix.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "high"},
    input=prompt,
)

print(response.output_text)
```

:::


## Set up `text.verbosity`

`text.verbosity` 是平衡简洁性与完整性的主要控制项。当产品需要快速、紧凑的回答时使用较低的 verbosity，当响应需要更丰富的解释、更清晰的结构或完整的上下文时使用较高的 verbosity。较低的 verbosity 意味着更少的输出 token，因此模型生成更少的内容并更快返回输出。

对于编码任务，`medium` 和 `high` 倾向于产生更长、更有组织的输出，结构更清晰。`low` 使回答更紧凑和精简。

**设置较低的 verbosity 以获得紧凑输出**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const incident = [
  "Summarize this incident for the next on-call engineer.",
  "- checkout latency spiked from 220 ms to 4.8 s",
  "- only us-east-1 was affected",
  "- rollback is complete",
  "- likely trigger: cache stampede after deploy",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  text: { verbosity: "low" },
  input: incident,
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    text={"verbosity": "low"},
    input="""
    Summarize this incident for the next on-call engineer.
    - checkout latency spiked from 220 ms to 4.8 s
    - only us-east-1 was affected
    - rollback is complete
    - likely trigger: cache stampede after deploy
    """,
)

print(response.output_text)
```

:::


## Set up the assistant `phase` parameter

`phase` 是对话历史中 assistant 消息上的标签。它向模型指示先前的 assistant 消息是中间工作评论还是最终答案。对进度更新、工具调用前的备注和其他中间消息使用 `phase: "commentary"`。对已完成的响应使用 `phase: "final_answer"`。

assistant 可能会说类似这样的话：

Assistant 评论消息

```
{
  "role": "assistant",
  "phase": "commentary",
  "content": "I'm checking the logs and comparing them to the last successful deploy."
}
```

这不是答案，而是进度备注。之后，assistant 可能会说：

Assistant 最终答案消息

```
{
  "role": "assistant",
  "phase": "final_answer",
  "content": "The deploy failed because the migration referenced a column that does not exist in production."
}
```javascript

这在长时间运行或工具密集型的工作流中很有用，因为 assistant 可能在完成之前产生可见的进度更新。当你将该历史记录发送回模型时，请在 assistant 消息上保留 `phase`，以便模型能够区分哪些消息是进度更新，哪些消息是最终结果。

**在后续请求中保留并重新发送 `phase`**，适用于 `gpt-5.3-codex` 及更新的模型。这有助于解决提前停止的问题，确保 agent 运行直到达到最终答案。

## Use `tool_search`

不要在每个请求中加载完整的工具目录，而是添加 `{"type": "tool_search"}` 并将昂贵的工具定义标记为 `defer_loading: true`。模型随后可以在运行时加载所需的子集。在请求开始时，模型只看到搜索工具的名称和描述。如果模型决定需要延迟加载的工具，它会运行 tool search，只有在那时延迟的工具定义才会被加载到上下文中。只有在那时模型才会调用它们。这节省了 token 并保持了缓存性能。

有两种模式：

*   **托管 tool search** 是更简单的选项。当你已经知道哪些工具可用于该请求时使用它。
*   **客户端执行的 tool search** 适用于你的应用需要决定哪些工具可用的情况，例如基于用户的租户、项目、权限或内部注册表。

**除非你的应用确实需要自行控制发现过程，否则从托管 tool search 开始。**

按用户意图对工具进行分组。尽可能使用命名空间或 MCP 服务器。模型在几个清晰的组之间选择比在一长串扁平的函数列表中选择更容易。我们建议每个命名空间保持在大约 10 个函数以内，以获得最佳的 token 效率和模型性能。

保持命名空间描述简短且具有区分性。将详细说明放在延迟加载的工具定义中。避免为所有内容创建一个巨大的命名空间。

**使用托管 tool search 与延迟加载工具**

```
import OpenAI from "openai";

const openai = new OpenAI();

const billingLookupInvoice = {
  type: "function",
  name: "billing.lookup_invoice",
  description: "Look up invoice state, taxes, credits, and payment attempts.",
  parameters: {
    type: "object",
    properties: {
      invoice_id: { type: "string" },
    },
    required: ["invoice_id"],
    additionalProperties: false,
  },
  strict: true,
  defer_loading: true,
};

const crmGetAccount = {
  type: "function",
  name: "crm.get_account",
  description: "Fetch account owner, plan, health, and payment history.",
  parameters: {
    type: "object",
    properties: {
      account_id: { type: "string" },
    },
    required: ["account_id"],
    additionalProperties: false,
  },
  strict: true,
  defer_loading: true,
};

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Find the right billing tool and explain why invoice INV-1043 still " +
    "shows overdue after a payment yesterday.",
  tools: [
    { type: "tool_search" },
    billingLookupInvoice,
    crmGetAccount,
  ],
});

console.log(response.output_text);
```python

```
from openai import OpenAI

client = OpenAI()

billing_lookup_invoice = {
    "type": "function",
    "name": "billing.lookup_invoice",
    "description": "Look up invoice state, taxes, credits, and payment attempts.",
    "parameters": {
        "type": "object",
        "properties": {
            "invoice_id": {"type": "string"},
        },
        "required": ["invoice_id"],
        "additionalProperties": False,
    },
    "strict": True,
    "defer_loading": True,
}

crm_get_account = {
    "type": "function",
    "name": "crm.get_account",
    "description": "Fetch account owner, plan, health, and payment history.",
    "parameters": {
        "type": "object",
        "properties": {
            "account_id": {"type": "string"},
        },
        "required": ["account_id"],
        "additionalProperties": False,
    },
    "strict": True,
    "defer_loading": True,
}

response = client.responses.create(
    model="gpt-5.5",
    input=(
        "Find the right billing tool and explain why invoice INV-1043 still "
        "shows overdue after a payment yesterday."
    ),
    tools=[
        {"type": "tool_search"},
        billing_lookup_invoice,
        crm_get_account,
    ],
)

print(response.output_text)
```javascript


## Leverage built-in tools

[内置工具](/guides/tools)是 API 的原生能力。你不需要自己构建每个工具，而是可以让模型访问已经在 Responses API 中工作的工具。模型随后可以决定何时使用它们。

OpenAI 持续添加更多原生工具，因此当内置工具适合你的工作流时，优先使用它们。当原生选项无法覆盖任务时再构建自定义工具。当前的内置工具和相关工具选项包括：

*   **Web search**：搜索网络获取最新信息
*   **File search**：搜索上传的文件或向量存储
*   **Code interpreter**：运行 Python 进行分析、数学计算、图表和文件处理
*   **Shell**：在托管容器或你自己的运行时中运行 shell 命令
*   **Computer use**：通过截图、点击、输入和滚动操作 UI
*   **Image generation**：生成或编辑图像
*   **MCP/connectors**：将模型连接到外部服务和工具
*   **Skills**：附加可重用的指令包和工作流文件
*   **Apply patch**：进行结构化代码编辑

优先使用内置工具还有模型质量方面的原因。内置工具在我们的后训练中是分布内的，这意味着模型是围绕这些工具的形状、行为和输出进行训练和评估的。使用内置工具时，OpenAI 模型在工具选择、执行清洁度和故障率方面都优于使用新工具。

## Leverage compaction

[压缩](/guides/compaction)是一种上下文工程工具：它决定模型在多轮对话中携带哪些信息。在长时间运行的 agent 中，问题不仅仅是"我会不会达到上下文限制？"而是旧消息、工具日志、重试和过时的细节会挤占模型所需的状态。

压缩为你提供了一种受控的方式来减少上下文大小，同时保留后续轮次所需的状态。在有意义的里程碑之后，例如完成调试阶段或缩小根本原因，你可以压缩先前的窗口并从压缩输出继续。这使模型保持敏锐，因为下一轮是围绕重要状态构建的，而不是每个中间推理、失败的命令和过时的推理分支。

有两种方式利用压缩：

*   **让服务器处理**：如果你使用 `previous_response_id`，开启带有 `compact_threshold` 的 `context_management`。当对话变得太大时，服务器会自动压缩对话。你只需继续发送最新的用户消息。
*   **自己处理**：如果你自己管理完整的输入数组，调用 `client.responses.compact()`。它会返回一个更小的上下文窗口。将返回的输出直接用于下一次 `responses.create()` 调用。

**不要编辑压缩输出。** 它不是人类摘要，而是帮助模型继续的机器状态。原样传递它，然后添加下一条用户消息。

**从压缩的响应状态继续**

```
import OpenAI from "openai";

const openai = new OpenAI();

// Full window collected from a long debugging session:
// user messages, assistant outputs, tool calls, and tool outputs.
const longWindow = sessionItems;

const compacted = await openai.responses.compact({
  model: "gpt-5.5",
  input: longWindow,
});

const nextResponse = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  input: [
    ...compacted.output, // Use compact output as-is.
    {
      type: "message",
      role: "user",
      content:
        "We found the bad cache invalidation path. Write the fix plan " +
        "and the verification checklist.",
    },
  ],
});

console.log(nextResponse.output_text);
```python

```
from openai import OpenAI

client = OpenAI()

# Full window collected from a long debugging session:
# user messages, assistant outputs, tool calls, and tool outputs.
long_window = session_items

compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_window,
)

next_response = client.responses.create(
    model="gpt-5.5",
    store=False,
    input=[
        *compacted.output,  # Use compact output as-is.
        {
            "type": "message",
            "role": "user",
            "content": (
                "We found the bad cache invalidation path. Write the fix plan "
                "and the verification checklist."
            ),
        },
    ],
)

print(next_response.output_text)
```javascript


## Use `prompt_cache_key`

[Prompt 缓存](/guides/prompt-caching)在请求重用相同的长前缀时自动减少延迟和成本。对于高流量工作流，为共享相同稳定前缀的请求一致地设置 [`prompt_cache_key`]( https://developers.openai.com/api/reference/responses/create#responses-create-prompt_cache_key)。

缓存键与 prompt 前缀哈希组合使用，因此它有助于将相似的请求路由到相同的缓存，而不改变模型输入。对于真正共享的前缀保持键稳定，并选择一个粒度以避免向一个前缀-键对发送过多流量。如果一个前缀和 `prompt_cache_key` 组合超过大约每分钟 15 个请求，请求可能会溢出到其他机器并降低缓存效果。

**将相关请求路由到相同的 prompt 缓存**

```
import OpenAI from "openai";

const openai = new OpenAI();

const instructions = [
  "You are the support agent for Acme.",
  "Follow the Acme support policy and escalation rubric.",
  "Use the same tone, safety rules, and tool plan for each ticket.",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  prompt_cache_key: "tenant-acme-support-agent",
  instructions,
  input: "Summarize the current escalation for the on-call lead.",
});

console.log(response.output_text);
```python

```
from openai import OpenAI

client = OpenAI()

instructions = """
You are the support agent for Acme.
Follow the Acme support policy and escalation rubric.
Use the same tone, safety rules, and tool plan for each ticket.
"""

response = client.responses.create(
    model="gpt-5.5",
    prompt_cache_key="tenant-acme-support-agent",
    instructions=instructions,
    input="Summarize the current escalation for the on-call lead.",
)

print(response.output_text)
```javascript


## Use `reasoning.encrypted_content`

始终回传推理项。这通过允许模型从其先前的推理中工作来帮助模型。如果你的[零数据保留 (ZDR)](/guides/your-data#zero-data-retention) 要求不允许存储响应数据，这就是 `reasoning.encrypted_content` 重要的地方。`reasoning.encrypted_content` 为你提供无状态的交接。

将 `reasoning.encrypted_content` 添加到 `include` 中，响应输出中的推理项将包含加密的推理内容，可以传回下一个请求。你的应用不需要理解该值。它只需保持推理项完全按返回的样子，并在下一轮发送回去，这样模型就可以用它来继续工作流。

**在无状态轮次之间传递加密推理**

```
import OpenAI from "openai";

const openai = new OpenAI();

const first = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  reasoning: { effort: "medium" },
  include: ["reasoning.encrypted_content"],
  input: "Investigate why invoice INV-1043 has mismatched tax totals.",
});

const second = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  reasoning: { effort: "medium" },
  include: ["reasoning.encrypted_content"],
  input: [
    ...first.output,
    {
      role: "user",
      content: "Now write the customer-facing explanation in plain English.",
    },
  ],
});

console.log(second.output_text);
```python

```
from openai import OpenAI

client = OpenAI()

first = client.responses.create(
    model="gpt-5.5",
    store=False,
    reasoning={"effort": "medium"},
    include=["reasoning.encrypted_content"],
    input="Investigate why invoice INV-1043 has mismatched tax totals.",
)

second = client.responses.create(
    model="gpt-5.5",
    store=False,
    reasoning={"effort": "medium"},
    include=["reasoning.encrypted_content"],
    input=[
        *first.output,
        {
            "role": "user",
            "content": "Now write the customer-facing explanation in plain English.",
        },
    ],
)

print(second.output_text)
```javascript


## Use `background=True`

对于可能需要很长时间的请求，使用 [`background=True`](/guides/background)。API 不会保持客户端连接打开，而是启动一个作业并返回一个 ID。你的应用可以轮询该作业直到它完成、失败或被取消。用于大型分析、长时间工具运行或需要状态和重试行为的工作。

`background=True` **需要 `store=True`**。

**运行并轮询后台响应**

```
import OpenAI from "openai";

const openai = new OpenAI();

let job = await openai.responses.create({
  model: "gpt-5.5",
  background: true,
  store: true,
  input: "Analyze this large log bundle and cluster the primary failure modes.",
  tools: [
    {
      type: "code_interpreter",
      container: {
        type: "auto",
        file_ids: [logBundleFileId],
      },
    },
  ],
});

while (["queued", "in_progress"].includes(job.status)) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  job = await openai.responses.retrieve(job.id);
}

console.log(job.output_text);
```python

```
from openai import OpenAI
import time

client = OpenAI()

job = client.responses.create(
    model="gpt-5.5",
    background=True,
    store=True,
    input="Analyze this large log bundle and cluster the primary failure modes.",
    tools=[
        {
            "type": "code_interpreter",
            "container": {
                "type": "auto",
                "file_ids": [log_bundle_file_id],
            },
        }
    ],
)

while job.status in {"queued", "in_progress"}:
    time.sleep(2)
    job = client.responses.retrieve(job.id)

print(job.output_text)
```javascript


你可以将它与 `stream=True` 结合使用以获取进度事件，但第一个事件可能比正常请求花费更长时间。

从 UI 的角度来看，后台模式表示："这正在运行；这是状态；结果准备好后会出现在这里。"

注意：`background=True` 与[零数据保留](/guides/your-data#zero-data-retention)不兼容。

## Use WebSocket mode

[WebSocket 模式](/guides/websocket-mode)专为长时间运行、工具调用密集的工作流而构建，你保持一个持久连接打开，并通过仅发送新的输入项加上 `previous_response_id` 来继续。对于有 20 个或更多工具调用的部署，这种方法端到端大约快 40%。

**工作原理**：第一条消息看起来像一个正常的 Responses 请求：model、instructions、tools 和用户输入。服务器流式返回事件。如果模型请求工具，你的应用运行该工具。然后，不是发送新的 HTTP 请求，而是在同一个 socket 上发送另一个 `response.create` 事件，带有先前的 `previous_response_id` 和新项。这就是延迟优势的来源。在普通 HTTP 中，每次后续请求都是一个全新的请求。在 WebSocket 模式中，连接保持打开，最近的响应状态在该连接的内存中保持热状态。当下一轮从该响应继续时，后端需要做更少的设置工作。

如果你的工作流是一个请求、一个答案，那么**继续使用 HTTP**。如果你的工作流表现得像一个长时间运行的 agent，请尝试 WebSocket 模式。

单个 WebSocket 连接一次处理一个进行中的响应，因此并行工作需要多个连接。连接目前最长为 60 分钟。继续使用与 HTTP 模式相同的 `previous_response_id` 语义，并为最近的响应提供连接本地缓存。

注意：WebSocket 模式与 ZDR 兼容，因为你的数据不会存储到磁盘，只存储在内存中。

默认的 Python 示例使用 `websocket-client`（`pip install websocket-client`）。JavaScript 示例使用 `ws`（`npm install ws`）。

**启动 Responses API WebSocket 会话**

```
import OpenAI from "openai";
import WebSocket from "ws";

const openai = new OpenAI();

const ws = new WebSocket("wss://api.openai.com/v1/responses", {
  headers: {
    Authorization: "Bearer " + openai.apiKey,
  },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "response.create",
      model: "gpt-5.5",
      store: false,
      input: [
        {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Find the flaky test in this run, call the tools you need, " +
                "and keep going until you can explain the root cause.",
            },
          ],
        },
      ],
      tools: [testLogTool, codeSearchTool],
    })
  );
});

ws.on("message", (data) => {
  const firstEvent = JSON.parse(data.toString());
  console.log(firstEvent.type);
});
```python

```
from openai import OpenAI
from websocket import create_connection
import json

client = OpenAI()

ws = create_connection(
    "wss://api.openai.com/v1/responses",
    header=[f"Authorization: Bearer {client.api_key}"],
)

# Same request body you would send to client.responses.create(...).
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "input": [
                {
                    "type": "message",
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Find the flaky test in this run, call the tools "
                                "you need, and keep going until you can explain "
                                "the root cause."
                            ),
                        }
                    ],
                }
            ],
            "tools": [test_log_tool, code_search_tool],
        }
    )
)

first_event = json.loads(ws.recv())
print(first_event["type"])
```


## Final takeaway

Responses API 是构建更智能、更强大的 OpenAI 应用的基础。真正的优势在于它让开发者从一次性的 prompt 转向持久的、使用工具的、上下文感知的工作流，这些工作流可以适应任务的复杂性。遵循本指南以在实际部署中获得更高的性能。
