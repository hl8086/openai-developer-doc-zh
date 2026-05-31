# Realtime with tools

> 你可以将工具附加到 Realtime 会话中，以便模型在实时对话期间查找数据、执行操作或调用服务。

你可以将工具附加到 Realtime 会话中，以便模型在实时对话期间查找数据、执行操作或调用服务。无论你的客户端使用的是 [WebRTC 数据通道](/guides/realtime-webrtc) 还是 [WebSocket](/guides/realtime-websocket)，工具配置都使用相同的事件接口。

当你的应用程序需要执行工具并返回结果时，使用 function 工具。当你希望 Realtime API 代替你连接到远程工具服务器时，使用 MCP 工具或内置连接器。

## 选择工具类型

| 工具类型 | 适用场景 | 执行者 |
| --- | --- | --- |
| `function` | 你的应用程序拥有业务逻辑、审批检查或私有系统访问权限。 | 你的客户端或服务器接收函数调用并返回 `function_call_output`。 |
| `mcp` 配合 `server_url` | 你希望模型调用远程 MCP 服务器暴露的工具。 | Realtime API 调用远程 MCP 服务器。 |
| `mcp` 配合 `connector_id` | 你希望使用内置连接器，如 Google Calendar。 | Realtime API 使用你提供的授权调用连接器。 |

在**以下两个位置之一**添加工具：

*   在**会话级别**，通过 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 中的 `session.tools`，如果你希望工具在整个会话期间可用。
*   在**响应级别**，通过 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 中的 `response.tools`，如果你只需要工具用于一个回合。

## 配置 function 工具

当工具应在你的应用程序中运行时，function 工具是正确的默认选择。模型发出函数调用参数，你的代码执行操作，然后你的代码通过 `function_call_output` 项将结果发送回去。

**使用 session.update 配置 function 工具**

::: code-group
```javascript
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    tools: [
      {
        type: "function",
        name: "lookup_order",
        description: "Look up an order by its order number.",
        parameters: {
          type: "object",
          properties: {
            order_number: {
              type: "string",
              description: "The customer-facing order number.",
            },
          },
          required: ["order_number"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "tools": [
            {
                "type": "function",
                "name": "lookup_order",
                "description": "Look up an order by its order number.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_number": {
                            "type": "string",
                            "description": "The customer-facing order number.",
                        }
                    },
                    "required": ["order_number"],
                },
            }
        ],
        "tool_choice": "auto",
    },
}

ws.send(json.dumps(event))
```

:::




当模型调用函数时，监听函数调用项，运行你的应用逻辑，然后将输出发送回去：

**发送函数调用输出**

::: code-group
```javascript
const event = {
  type: "conversation.item.create",
  item: {
    type: "function_call_output",
    call_id: functionCall.call_id,
    output: JSON.stringify({
      status: "shipped",
      delivery_date: "2026-05-09",
    }),
  },
};

ws.send(JSON.stringify(event));
ws.send(JSON.stringify({ type: "response.create" }));
```

```python
event = {
    "type": "conversation.item.create",
    "item": {
        "type": "function_call_output",
        "call_id": function_call["call_id"],
        "output": json.dumps(
            {
                "status": "shipped",
                "delivery_date": "2026-05-09",
            }
        ),
    },
}

ws.send(json.dumps(event))
ws.send(json.dumps({"type": "response.create"}))
```

:::




有关函数调用的完整逐事件演练，请参阅[管理对话](/guides/realtime-conversations#function-calling)。

## 配置 MCP 工具

当工具已经存在于远程 MCP 服务器后面，或者你想使用 OpenAI 托管的连接器时，MCP 工具非常有用。与 function 工具不同，MCP 工具由 Realtime API 本身执行。

在 Realtime 中，MCP 工具的结构为：

*   `type: "mcp"`
*   `server_label`
*   `server_url` 或 `connector_id` 二选一
*   可选的 `authorization` 和 `headers`
*   可选的 `allowed_tools`
*   可选的 `require_approval`
*   可选的 `server_description`

此示例使文档 MCP 服务器在整个会话期间可用：

**使用 session.update 配置 MCP 工具**

::: code-group
```javascript
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    output_modalities: ["text"],
    tools: [
      {
        type: "mcp",
        server_label: "openai_docs",
        server_url: "https://developers.openai.com/mcp",
        allowed_tools: ["search_openai_docs", "fetch_openai_doc"],
        require_approval: "never",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "output_modalities": ["text"],
        "tools": [
            {
                "type": "mcp",
                "server_label": "openai_docs",
                "server_url": "https://developers.openai.com/mcp",
                "allowed_tools": ["search_openai_docs", "fetch_openai_doc"],
                "require_approval": "never",
            }
        ],
    },
}

ws.send(json.dumps(event))
```

:::




内置连接器使用相同的 MCP 工具结构，但传递 `connector_id` 而不是 `server_url`。例如，Google Calendar 使用 `connector_googlecalendar`。在 Realtime 中，使用这些内置连接器进行读取操作，如搜索或读取事件或邮件。在 `authorization` 中传递用户的 OAuth 访问令牌，并尽可能使用 `allowed_tools` 缩小工具范围：

**配置 Google Calendar 连接器**

::: code-group
```javascript
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    output_modalities: ["text"],
    tools: [
      {
        type: "mcp",
        server_label: "google_calendar",
        connector_id: "connector_googlecalendar",
        authorization: "&lt;google-oauth-access-token>",
        allowed_tools: ["search_events", "read_event"],
        require_approval: "never",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "output_modalities": ["text"],
        "tools": [
            {
                "type": "mcp",
                "server_label": "google_calendar",
                "connector_id": "connector_googlecalendar",
                "authorization": "&lt;google-oauth-access-token>",
                "allowed_tools": ["search_events", "read_event"],
                "require_approval": "never",
            }
        ],
    },
}

ws.send(json.dumps(event))
```

:::




远程 MCP 服务器**不会自动接收完整的对话上下文**，但**它们可以看到模型在工具调用中发送的任何数据**。**使用 `allowed_tools` 保持工具范围尽可能小**，并对任何你不会自动运行的操作要求审批。

## Realtime MCP 流程

与 Realtime `function` 工具不同，远程 MCP 工具**由 Realtime API 本身执行**。**你的客户端不会运行远程工具**并返回 `function_call_output`。相反，你的客户端配置访问权限，监听 MCP 生命周期事件，并在服务器请求时可选地发送审批响应。

典型流程如下：

1.  你发送 `session.update` 或 `response.create`，其中包含 `type` 为 `mcp` 的 `tools` 条目。
2.  服务器开始导入工具并发出 `mcp_list_tools.in_progress`。
3.  在列表仍在进行中时，模型无法调用尚未加载的工具。如果你想在开始依赖这些工具的回合之前等待，请监听 [`mcp_list_tools.completed`]( https://developers.openai.com/api/reference/realtime-server-events/mcp_list_tools/completed)。`item.type` 为 `mcp_list_tools` 的 [`conversation.item.done`]( https://developers.openai.com/api/reference/realtime-server-events/conversation/item/done) 事件显示实际导入了哪些工具名称。如果导入失败，你将收到 [`mcp_list_tools.failed`]( https://developers.openai.com/api/reference/realtime-server-events/mcp_list_tools/failed)。
4.  用户说话或发送文本，并创建响应，由你的客户端或会话配置自动创建。
5.  如果模型选择了 MCP 工具，你将看到 `response.mcp_call_arguments.delta` 和 `response.mcp_call_arguments.done`。
6.  **如果需要审批**，服务器会添加一个 `item.type` 为 `mcp_approval_request` 的对话项。你的客户端必须用 `mcp_approval_response` 项来回应。
7.  工具运行后，你将看到 `response.mcp_call.in_progress`。成功时，你稍后会收到 `item.type` 为 `mcp_call` 的 [`response.output_item.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_item/done) 事件；失败时，你将收到 [`response.mcp_call.failed`]( https://developers.openai.com/api/reference/realtime-server-events/response/mcp_call/failed)。助手消息项和 `response.done` 完成该回合。

此事件处理程序涵盖了主要检查点：

**在 Realtime 会话期间监听 MCP 事件**

::: code-group
```javascript
function parseRealtimeEvent(rawMessage) {
  if (typeof rawMessage === "string") {
    return JSON.parse(rawMessage);
  }

  if (typeof rawMessage?.data === "string") {
    return JSON.parse(rawMessage.data);
  }

  return JSON.parse(rawMessage.toString());
}

function getOutputText(item) {
  if (item.type !== "message") return "";

  return (item.content ?? [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text)
    .join("");
}

ws.on("message", (rawMessage) => {
  const event = parseRealtimeEvent(rawMessage);

  switch (event.type) {
    case "mcp_list_tools.in_progress":
      console.log("Listing MCP tools for item:", event.item_id);
      break;

    case "mcp_list_tools.completed":
      console.log("MCP tool listing complete for item:", event.item_id);
      break;

    case "mcp_list_tools.failed":
      console.error("MCP tool listing failed for item:", event.item_id);
      break;

    case "conversation.item.done":
      if (event.item.type === "mcp_list_tools") {
        const names = event.item.tools.map((tool) => tool.name).join(", ");
        console.log(`MCP tools ready on ${event.item.server_label}: ${names}`);
      }

      if (event.item.type === "mcp_approval_request") {
        console.log("Approval required for:", event.item.name, event.item.arguments);
      }
      break;

    case "response.mcp_call_arguments.done":
      console.log("Final MCP call arguments:", event.arguments);
      break;

    case "response.mcp_call.in_progress":
      console.log("Running MCP tool for item:", event.item_id);
      break;

    case "response.mcp_call.failed":
      console.error("MCP tool call failed for item:", event.item_id);
      break;

    case "response.output_item.done":
      if (event.item.type === "mcp_call") {
        console.log(
          `MCP output from ${event.item.server_label}.${event.item.name}:`,
          event.item.output
        );
      }

      if (event.item.type === "message") {
        console.log("Assistant:", getOutputText(event.item));
      }
      break;

    case "response.done":
      console.log("Realtime turn complete.");
      break;
  }
});
```

```python
def on_message(ws, message):
    event = json.loads(message)
    event_type = event["type"]

    if event_type == "mcp_list_tools.in_progress":
        print("Listing MCP tools for item:", event["item_id"])
        return

    if event_type == "mcp_list_tools.completed":
        print("MCP tool listing complete for item:", event["item_id"])
        return

    if event_type == "mcp_list_tools.failed":
        print("MCP tool listing failed for item:", event["item_id"])
        return

    if event_type == "conversation.item.done":
        item = event["item"]

        if item["type"] == "mcp_list_tools":
            names = ", ".join(tool["name"] for tool in item["tools"])
            print(f"MCP tools ready on {item['server_label']}: {names}")
            return

        if item["type"] == "mcp_approval_request":
            print("Approval required for:", item["name"], item["arguments"])
            return

    if event_type == "response.mcp_call_arguments.done":
        print("Final MCP call arguments:", event["arguments"])
        return

    if event_type == "response.mcp_call.in_progress":
        print("Running MCP tool for item:", event["item_id"])
        return

    if event_type == "response.mcp_call.failed":
        print("MCP tool call failed for item:", event["item_id"])
        return

    if event_type == "response.output_item.done":
        item = event["item"]

        if item["type"] == "mcp_call":
            print(
                f"MCP output from {item['server_label']}.{item['name']}:",
                item.get("output"),
            )
            return

        if item["type"] == "message":
            text_parts = [
                part["text"]
                for part in item.get("content", [])
                if part["type"] == "output_text"
            ]
            print("Assistant:", "".join(text_parts))
            return

    if event_type == "response.done":
        print("Realtime turn complete.")
```

:::





## 常见故障

*   [`mcp_list_tools.failed`]( https://developers.openai.com/api/reference/realtime-server-events/mcp_list_tools/failed)：Realtime API 无法从远程服务器或连接器导入工具。检查 `server_url` 或 `connector_id`、身份验证、服务器连接性以及你指定的任何 `allowed_tools` 名称。
*   [`response.mcp_call.failed`]( https://developers.openai.com/api/reference/realtime-server-events/response/mcp_call/failed)：模型选择了一个工具，但工具调用未完成。检查事件负载和后续的 `mcp_call` 项以查找 MCP 协议、执行或传输错误。
*   `mcp_approval_request` 没有匹配的 `mcp_approval_response`：工具调用无法继续，直到你的客户端明确批准或拒绝它。
*   在 `mcp_list_tools.in_progress` 仍然活跃时开始一个回合：只有已完成加载的工具才有资格用于该回合。
*   响应使用 `tool_choice: "required"` 但当前没有可用工具：模型没有可调用的合格工具。等待 `mcp_list_tools.completed`，确认至少导入了一个工具，或者对不需要工具的回合使用不同的 `tool_choice`。
*   MCP 工具定义验证在导入开始前失败：常见原因包括同一 `tools` 数组中重复的 `server_label`、同时设置了 `server_url` 和 `connector_id`、在初始会话创建请求中两者都未设置、使用无效的 `connector_id`，或同时发送了 `authorization` 和 `headers.Authorization`。对于连接器，完全不要发送 `headers.Authorization`。

## 批准或拒绝 MCP 工具调用

如果工具需要审批，Realtime API 会在对话中插入一个 `mcp_approval_request` 项。**要继续**，发送一个新的 [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create) 事件，其 `item.type` 为 `mcp_approval_response`。

**批准 MCP 请求**

::: code-group
```javascript
function approveMcpRequest(approvalRequestId) {
  const event = {
    type: "conversation.item.create",
    item: {
      id: `mcp_approval_${approvalRequestId}`,
      type: "mcp_approval_response",
      approval_request_id: approvalRequestId,
      approve: true,
    },
  };

  ws.send(JSON.stringify(event));
}
```

```python
def approve_mcp_request(ws, approval_request_id):
    event = {
        "type": "conversation.item.create",
        "item": {
            "id": f"mcp_approval_{approval_request_id}",
            "type": "mcp_approval_response",
            "approval_request_id": approval_request_id,
            "approve": True,
        },
    }

    ws.send(json.dumps(event))
```

:::




如果你拒绝请求，将 `approve` 设置为 `false`，并可选地包含一个 `reason`。

## 仅对单个响应使用 MCP

如果 MCP **只应在单个回合中可用**，将相同的 MCP 工具对象附加到 `response.tools` 而不是 `session.tools`：

**在单个响应上添加 MCP 工具**

::: code-group
```javascript
const event = {
  type: "response.create",
  response: {
    output_modalities: ["text"],
    input: [
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Which transport should I use for browser clients in the Realtime API?",
          },
        ],
      },
    ],
    tools: [
      {
        type: "mcp",
        server_label: "openai_docs",
        server_url: "https://developers.openai.com/mcp",
        allowed_tools: ["search_openai_docs", "fetch_openai_doc"],
        require_approval: "never",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "output_modalities": ["text"],
        "input": [
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Which transport should I use for browser clients in the Realtime API?",
                    }
                ],
            }
        ],
        "tools": [
            {
                "type": "mcp",
                "server_label": "openai_docs",
                "server_url": "https://developers.openai.com/mcp",
                "allowed_tools": ["search_openai_docs", "fetch_openai_doc"],
                "require_approval": "never",
            }
        ],
    },
}

ws.send(json.dumps(event))
```

:::




当只有一个响应需要外部上下文，或者不同回合应使用不同的 MCP 服务器时，这很有用。

## 重用先前定义的 server label

`server_label` 是当前 Realtime 会话中工具定义的稳定句柄。在你使用 `server_label` 加上 `server_url` 或 `connector_id` 定义一次服务器或连接器之后，后续的 `session.update` 或 `response.create` 事件可以只引用相同的 `server_label`，Realtime API 将重用之前的定义，而不需要你再次发送完整的工具对象。

**重用先前定义的连接器**

::: code-group
```javascript
const event = {
  type: "response.create",
  response: {
    output_modalities: ["text"],
    input: [
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Check my schedule for this afternoon.",
          },
        ],
      },
    ],
    // Reuses the google_calendar connector defined earlier in this session.
    tools: [
      {
        type: "mcp",
        server_label: "google_calendar",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "output_modalities": ["text"],
        "input": [
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Check my schedule for this afternoon.",
                    }
                ],
            }
        ],
        # Reuses the google_calendar connector defined earlier in this session.
        "tools": [
            {
                "type": "mcp",
                "server_label": "google_calendar",
            }
        ],
    },
}

ws.send(json.dumps(event))
```

:::





此重用是会话范围的。如果你启动新的 Realtime 会话，需要再次发送完整的 MCP 定义，以便服务器可以导入其工具列表。
