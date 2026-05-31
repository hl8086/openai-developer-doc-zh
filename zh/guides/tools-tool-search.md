
Tool search 允许模型根据需要动态搜索并将工具加载到模型的上下文中。这使你可以避免预先将所有工具定义加载到模型的上下文中，并且**可能有助于降低整体 token 使用量和成本**。为了实现最优的成本和延迟，tool search 的设计旨在**保留模型的缓存**。当模型发现新工具时，它们会被注入到上下文窗口的末尾。

只有 `gpt-5.4` 及更高版本的模型支持 `tool_search`。

要激活 tool search，你必须做两件事：

1.  在你的 `tools` 数组中添加 `tool_search` 作为工具。
2.  如果你使用的是 [functions](/guides/function-calling#defining-functions)，将你想要延迟加载的函数标记为 `defer_loading: true`。如果你使用的是 [MCP servers](/guides/tools-connectors-mcp)，在 MCP server 工具定义上设置 `defer_loading: true`。

### 尽可能使用命名空间

你可以将 tool search 与延迟加载的 [functions](/guides/function-calling#defining-functions)、[namespaces](/guides/function-calling#defining-namespaces) 或 [MCP servers](/guides/tools-connectors-mcp) 一起使用，但我们建议尽可能使用命名空间或 MCP servers。我们的模型主要是针对这些表面进行训练的，而且在这些场景下 token 节省通常更为显著。

对于命名空间，`defer_loading` 适用于命名空间内的函数，而不是命名空间对象本身。

在请求开始时，模型仍然可以看到可搜索内容的名称和描述。对于命名空间或 MCP server，这意味着模型在开始时只能看到命名空间或 server 的名称和描述，而不会显示其中包含的各个函数的详细信息，直到 tool search 工具加载它们。对于单个延迟加载的函数，模型仍然可以看到函数名称和描述，因此实际上 tool search 主要是延迟加载参数 schema。

为了最大化 token 节省，我们建议将延迟加载的函数分组到命名空间或 MCP servers 中，并提供清晰的高层描述，让模型对其中包含的内容有一个全面的了解，以便它能够有效地搜索并仅加载相关函数。作为最佳实践，建议每个命名空间包含少于 10 个函数，以获得更好的 token 效率和模型性能。

```
{
  "tools": [
    {
      "type": "namespace",
      "name": "crm",
      "description": "CRM tools for customer lookup and order management.",
      "tools": [
        {
          "type": "function",
          "name": "list_open_orders",
          "description": "List open orders for a customer ID.",
          "defer_loading": true,
          "parameters": {
            "type": "object",
            "properties": {
              "customer_id": { "type": "string" }
            },
            "required": ["customer_id"],
            "additionalProperties": false
          }
        }
      ]
    },
    {
      "type": "tool_search"
    }
  ]
}
```

命名空间可以混合包含延迟加载和非延迟加载的工具。没有 `defer_loading: true` 的工具可以立即调用，而同一命名空间中的延迟加载工具则通过 tool search 加载。

### Tool search 类型

有两种使用 tool search 的方式：

*   **托管 tool search：** OpenAI 在你请求中声明的延迟加载工具中进行搜索，并在同一响应中返回加载的子集。
*   **客户端执行的 tool search：** 模型发出一个 `tool_search_call`，你的应用程序执行查找，然后返回匹配的 `tool_search_output`。

如果候选工具在创建请求时已经已知，请从托管 tool search 开始。当工具发现依赖于项目状态、租户状态或你的应用程序控制的其他系统时，请使用客户端执行的 tool search。

## 托管 tool search

当你已经知道要让模型搜索的 [functions](/guides/function-calling#defining-functions)、[namespaces](/guides/function-calling#defining-namespaces) 或 [MCP servers](/guides/tools-connectors-mcp) 的完整清单时，托管 tool search 是最简单的路径。你预先声明它们，添加 `{"type": "tool_search"}`，然后让 API 决定加载什么。

**配置托管 tool search**

::: code-group
```python
from openai import OpenAI

client = OpenAI()

crm_namespace = {
    "type": "namespace",
    "name": "crm",
    "description": "CRM tools for customer lookup and order management.",
    "tools": [
        {
            "type": "function",
            "name": "get_customer_profile",
            "description": "Fetch a customer profile by customer ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                },
                "required": ["customer_id"],
                "additionalProperties": False,
            },
        },
        {
            "type": "function",
            "name": "list_open_orders",
            "description": "List open orders for a customer ID.",
            # highlight-start:subtle
            "defer_loading": True,
            # highlight-end
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                },
                "required": ["customer_id"],
                "additionalProperties": False,
            },
        },
    ],
}

response = client.responses.create(
    model="gpt-5.5",
    input="List open orders for customer CUST-12345.",
    tools=[
        crm_namespace,
        # highlight-start:subtle
        {"type": "tool_search"},
        # highlight-end
    ],
    parallel_tool_calls=False,
)

print(response.output)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const crmNamespace = {
  type: "namespace",
  name: "crm",
  description: "CRM tools for customer lookup and order management.",
  tools: [
    {
      type: "function",
      name: "get_customer_profile",
      description: "Fetch a customer profile by customer ID.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
        },
        required: ["customer_id"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "list_open_orders",
      description: "List open orders for a customer ID.",
      // highlight-start:subtle
      defer_loading: true,
      // highlight-end
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
        },
        required: ["customer_id"],
        additionalProperties: false,
      },
    },
  ],
};

const response = await client.responses.create({
  model: "gpt-5.5",
  input: "List open orders for customer CUST-12345.",
  // highlight-start:subtle
  tools: [crmNamespace, { type: "tool_search" }],
  // highlight-end
  parallel_tool_calls: false,
});

console.log(response.output);
```

:::


如果模型决定需要一个延迟加载的工具，响应会在最终的函数调用之前包含两个额外的输出项：

*   `tool_search_call`，记录托管搜索步骤。
*   `tool_search_output`，包含加载的子集，这些工具变为可调用状态。

托管 tool search 响应

```
[
  {
    "type": "tool_search_call",
    "execution": "server",
    "call_id": null,
    "status": "completed",
    "arguments": {
      "paths": ["crm"]
    }
  },
  {
    "type": "tool_search_output",
    "execution": "server",
    "call_id": null,
    "status": "completed",
    "tools": [
      {
        "type": "namespace",
        "name": "crm",
        "description": "CRM tools for customer lookup and order management.",
        "tools": [
          {
            "type": "function",
            "name": "list_open_orders",
            "description": "List open orders for a customer ID.",
            "defer_loading": true,
            "parameters": {
              "type": "object",
              "properties": {
                "customer_id": { "type": "string" }
              },
              "required": ["customer_id"],
              "additionalProperties": false
            }
          }
        ]
      }
    ]
  },
  {
    "type": "function_call",
    "name": "list_open_orders",
    "namespace": "crm",
    "call_id": "call_abc123",
    "arguments": "{\"customer_id\":\"CUST-12345\"}"
  }
]
```

在托管模式下，`execution` 设置为 `server`，`call_id` 设置为 `null`。

对于更复杂的任务，模型还可以在同一个 `tool_search_call` 中加载多个命名空间或 MCP servers。例如，如果它需要来自不同命名空间的函数来完成一个任务，它可能会选择在进行后续函数调用之前一起搜索并加载这些表面。

## 客户端执行的 tool search

客户端执行的 tool search 让你的应用程序完全控制工具发现的工作方式。当可用工具依赖于在初始 `tools` 列表中声明不切实际的信息时，这非常有用。

使用 `execution: "client"` 配置 `tool_search` 工具，并为你的应用程序期望的搜索参数提供一个 schema：

**配置客户端执行的 tool search**

::: code-group
```python
from openai import OpenAI

client = OpenAI()

first_response = client.responses.create(
    model="gpt-5.5",
    input="Find the shipping ETA tool first, then use it for order_42.",
    tools=[
        {
            "type": "tool_search",
            # highlight-start:subtle
            "execution": "client",
            # highlight-end
            "description": "Find the project-specific tools needed to continue the task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "goal": {"type": "string"},
                },
                "required": ["goal"],
                "additionalProperties": False,
            },
        }
    ],
    parallel_tool_calls=False,
)

search_call = next(
    item for item in first_response.output if item.type == "tool_search_call"
)

loaded_tools = [
    {
        "type": "function",
        "name": "get_shipping_eta",
        "description": "Look up shipping ETA details for an order.",
        "defer_loading": True,
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
            },
            "required": ["order_id"],
            "additionalProperties": False,
        },
    }
]

second_response = client.responses.create(
    model="gpt-5.5",
    input=[
        *first_response.output,
        {
            # highlight-start:subtle
            "type": "tool_search_output",
            # highlight-end
            "execution": "client",
            "call_id": search_call.call_id,
            "status": "completed",
            # highlight-start:subtle
            "tools": loaded_tools,
            # highlight-end
        },
    ],
)

print(second_response.output)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const firstResponse = await client.responses.create({
  model: "gpt-5.5",
  input: "Find the shipping ETA tool first, then use it for order_42.",
  tools: [
    {
      type: "tool_search",
      // highlight-start:subtle
      execution: "client",
      // highlight-end
      description: "Find the project-specific tools needed to continue the task.",
      parameters: {
        type: "object",
        properties: {
          goal: { type: "string" },
        },
        required: ["goal"],
        additionalProperties: false,
      },
    },
  ],
  parallel_tool_calls: false,
});

const searchCall = firstResponse.output.find(
  (item) => item.type === "tool_search_call",
);

const loadedTools = [
  {
    type: "function",
    name: "get_shipping_eta",
    description: "Look up shipping ETA details for an order.",
    defer_loading: true,
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "string" },
      },
      required: ["order_id"],
      additionalProperties: false,
    },
  },
];

const secondResponse = await client.responses.create({
  model: "gpt-5.5",
  input: [
    ...firstResponse.output,
    {
      // highlight-start:subtle
      type: "tool_search_output",
      // highlight-end
      execution: "client",
      call_id: searchCall.call_id,
      status: "completed",
      // highlight-start:subtle
      tools: loadedTools,
      // highlight-end
    },
  ],
});

console.log(secondResponse.output);
```

:::


在第一轮中，模型发出一个 `tool_search_call` 并在此停止：

客户端 tool search 调用

```
[
  {
    "type": "tool_search_call",
    "execution": "client",
    "call_id": "call_abc123",
    "status": "completed",
    "arguments": {
      "goal": "Find the shipping ETA tool for order_42."
    }
  }
]
```

然后你的应用程序执行搜索并返回一个 `tool_search_output`，其中包含它想要加载的工具：

返回 tool\_search\_output

```
[
  {
    "type": "tool_search_output",
    "execution": "client",
    "call_id": "call_abc123",
    "status": "completed",
    "tools": [
      {
        "type": "function",
        "name": "get_shipping_eta",
        "description": "Look up shipping ETA details for an order.",
        "defer_loading": true,
        "parameters": {
          "type": "object",
          "properties": {
            "order_id": { "type": "string" }
          },
          "required": ["order_id"],
          "additionalProperties": false
        }
      }
    ]
  }
]
```

在下一轮中，加载的工具可以像普通函数一样被调用：

加载的函数调用

```
[
  {
    "type": "function_call",
    "name": "get_shipping_eta",
    "namespace": "get_shipping_eta",
    "call_id": "call_xyz456",
    "arguments": "{\"order_id\":\"order_42\"}"
  }
]
```

在客户端模式下，`execution` 设置为 `client`，`call_id` 已定义。在你的 `tool_search_output` 中回显来自 `tool_search_call` 的相同 `call_id`。

## 高级用法

### 保持命名空间描述清晰

使命名空间描述清晰且能描述用例，因为模型依赖此描述来决定何时加载该命名空间中的函数子集。避免过长的描述。相反，将更丰富的细节放在延迟加载的函数描述中，这些描述仅在需要时才会被加载。

### 了解加载了什么

`tool_search_output.tools` 包含模型动态加载的工具列表。模型将能够在后续轮次中调用这些工具中的任何一个，因此在客户端模式下，你不需要跨轮次重复加载同一个工具。未列在此数组中的工具将不可供模型使用。如果你想禁用已加载的工具，可以从定义已加载工具集的 `tool_search_output` 项中将其移除，但请注意，更改已加载的工具集将从该点开始破坏模型的缓存。

### 高级注入模式

大多数集成在请求的 `tools` 参数中声明工具。客户端执行的 tool search 还支持更高级的模式，你的应用程序可以返回原始请求中不存在的工具。将此视为高级工作流：仔细验证返回的 schema，并且只暴露受信任的工具定义。

### Tool search 和缓存

所有工具都在模型上下文窗口的末尾加载。这对托管 tool search 和客户端执行的 tool search 都适用。这允许模型的缓存从一个请求保留到另一个请求，从而降低整体成本并提高速度。

## 相关指南

*   使用 [function calling](/guides/function-calling) 定义可调用的函数和自定义工具。
*   使用 [Using tools](/guides/tools) 了解 Responses 中更广泛的工具生态。
