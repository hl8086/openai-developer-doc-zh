<!-- Source: https://developers.openai.com/api/docs/guides/websocket-mode -->

Responses API 支持 WebSocket 模式，适用于长时间运行、工具调用密集的工作流。在此模式下，你保持一个到 `/v1/responses` 的持久连接，并通过仅发送新的输入项加上 `previous_response_id` 来继续每一轮对话。

WebSocket 模式兼容零数据保留（ZDR）和 `store=false`。

## 为什么使用 WebSocket 模式

WebSocket 模式在工作流涉及多次模型-工具往返时最为有用（例如，智能体编码或包含重复工具调用的编排循环）。

由于连接保持打开状态，且每轮仅发送增量输入，WebSocket 模式减少了每轮的继续开销，并改善了长链路中的端到端延迟。对于包含 20 次以上工具调用的执行流程，我们观察到端到端执行速度提升约 40%。

## 连接并创建响应

在 WebSocket 模式下，通过从客户端发送 `response.create` 事件来开始每一轮。负载与正常的 [Responses create body](https://developers.openai.com/api/reference/resources/responses/methods/create) 相同，但不使用传输相关的字段如 `stream` 和 `background`。

```
from websocket import create_connection
import json
import os

ws = create_connection(
    "wss://api.openai.com/v1/responses",
    header=[
        f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
    ],
)

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
                    "content": [{"type": "input_text", "text": "Find fizz_buzz()"}],
                }
            ],
            "tools": [],
        }
    )
)
```

客户端可以选择通过发送带有 `generate: false` 的 `response.create` 来预热请求状态。当你已经知道即将发送的工具、指令和/或自定义消息时，这很有用。`generate: false` 不会返回模型输出，但会准备请求状态，使下一个生成轮次能更快启动。预热请求返回一个响应 ID，你可以通过 `previous_response_id` 从该 ID 继续链接，包括在响应链的后续轮次中。下一节将解释如何使用 `previous_response_id` 和增量输入来继续会话。

## 使用增量输入继续

要继续一次运行，发送另一个 `response.create`，包含：

*   `previous_response_id` 设置为前一个响应 ID。
*   `input` 仅包含新项目（例如，工具输出和下一条用户消息）。

```
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "previous_response_id": "resp_123",
            "input": [
                {
                    "type": "function_call_output",
                    "call_id": "call_123",
                    "output": "tool result",
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": "Now optimize it."}],
                },
            ],
            "tools": [],
        }
    )
)
```

## 继续机制的工作原理

WebSocket 模式使用与 HTTP 模式相同的 `previous_response_id` 链接语义，但在活跃的 socket 上增加了一条更低延迟的继续路径。

在活跃的 WebSocket 连接上，服务在连接本地的内存缓存中保留一个前一响应状态（最近的响应）。从该最近响应继续是快速的，因为服务可以重用连接本地的状态。由于前一响应状态仅保留在内存中而不写入磁盘，你可以在兼容 `store=false` 和零数据保留（ZDR）的方式下使用 WebSocket 模式。

如果 `previous_response_id` 不在内存缓存中，行为取决于你是否存储响应：

*   使用 `store=true` 时，服务可能会在可用时从持久化状态中恢复较旧的响应 ID。继续仍然可以工作，但通常会失去内存延迟优势。
*   使用 `store=false`（包括 ZDR）时，没有持久化回退。如果 ID 未被缓存，请求将返回 `previous_response_not_found`。

如果某一轮失败（`4xx` 或 `5xx`），服务会从连接本地缓存中驱逐引用的 `previous_response_id`。这可以防止为该失败的继续重用过时的缓存状态。

## 压缩和创建新响应

如果你使用压缩，有两种不同的继续模式：

### 服务端压缩（`context_management`）

当你启用服务端压缩（带有 `compact_threshold` 的 `context_management`）时，压缩在正常的 `/responses` 生成过程中发生。在 WebSocket 模式下，你以正常方式继续：发送下一个 `response.create`，带上最新的 `previous_response_id` 和仅新的输入项。

### 独立的 `/responses/compact`

独立的 [`/responses/compact` 端点](/api/docs/api-reference/responses/compact) 返回一个新的压缩输入窗口，而不是响应 ID。压缩后，在你的 WebSocket 连接上使用压缩窗口作为 `input`（加上下一个用户/工具项）创建新响应。

通过省略 `previous_response_id` 或将其设置为 `null` 来开始新链。按原样传递压缩输出；不要修剪返回的窗口。

```
# Compact your current window (HTTP call)
compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_input_items_array,
)

# Start a new response on the WebSocket using the compacted window
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "input": [
                *compacted.output,
                {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": "Continue from here."}],
                },
            ],
            "tools": [],
        }
    )
)
```

## 连接行为和限制

*   服务器事件和顺序与现有的 Responses 流式事件模型一致。
*   单个 WebSocket 连接可以接收多个 `response.create` 消息，但它们按顺序执行（一次只有一个进行中的响应）。
*   目前不支持多路复用。如果需要并行运行，请使用多个连接。
*   连接持续时间限制为 60 分钟。达到限制时请重新连接。

## 重新连接和恢复

当连接关闭（或达到 60 分钟限制）时，打开一个新的 WebSocket 连接，并使用以下模式之一继续：

1.  如果你之前的响应已持久化（`store=true`）且你有有效的响应 ID，使用 `previous_response_id` 和新输入项继续。
2.  如果你无法继续链（例如，`store=false`/ZDR 或 `previous_response_not_found`），通过将 `previous_response_id` 设置为 `null`（或省略它）来开始新响应，并发送下一轮的完整输入上下文。
3.  如果你使用 `/responses/compact` 压缩了上下文，将返回的压缩窗口作为新响应的基础 `input`，然后追加最新的用户/工具项。

## 需要处理的错误

`previous_response_not_found`

```
{
  "type": "error",
  "status": 400,
  "error": {
    "code": "previous_response_not_found",
    "message": "Previous response with id 'resp_abc' not found.",
    "param": "previous_response_id"
  }
}
```

`websocket_connection_limit_reached`

```
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "code": "websocket_connection_limit_reached",
    "message": "Responses websocket connection limit reached (60 minutes). Create a new websocket connection to continue."
  },
  "status": 400
}
```

## 相关指南

*   [会话状态](/api/docs/guides/conversation-state)
*   [流式 API 响应](/api/docs/guides/streaming-responses)
*   [Responses 流式事件参考](/api/docs/api-reference/responses-streaming)
