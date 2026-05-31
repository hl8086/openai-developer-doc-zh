<!-- Source: https://developers.openai.com/api/docs/guides/compaction -->

## 概述

为了支持长时间运行的交互，你可以使用压缩（compaction）来减少上下文大小，同时保留后续轮次所需的状态。

压缩帮助你在对话增长时平衡质量、成本和延迟。

## 服务端压缩

你可以在 Responses 创建请求（`POST /responses` 或 `client.responses.create`）中通过设置 `context_management` 和 `compact_threshold` 来启用服务端压缩。

*   当渲染的 token 数量超过配置的阈值时，服务器会运行服务端压缩。
*   在此模式下不需要单独调用 `/responses/compact`。
*   响应流中会包含加密的压缩项。
*   ZDR 说明：当你在 Responses 创建请求中设置 `store=false` 时，服务端压缩是 ZDR 友好的。

返回的压缩项使用更少的 token 将关键的先前状态和推理传递到下一次运行中。它是不透明的，不适合人类阅读。

对于无状态的 input-array 链式调用，像往常一样追加输出项。如果你使用 `previous_response_id`，每轮只传递新的用户消息。在这两种情况下，压缩项都会携带下一个窗口所需的上下文。

延迟提示：在将输出项追加到之前的输入项之后，你可以丢弃最近一个压缩项之前的项，以保持请求更小并减少长尾延迟。最新的压缩项携带了继续对话所需的上下文。如果你使用 `previous_response_id` 链式调用，请不要手动裁剪。

## 用户流程

1.  像往常一样调用 `/responses`，但包含带有 `compact_threshold` 的 `context_management` 以启用服务端压缩。
2.  在响应流式传输时，如果上下文大小超过阈值，服务器会触发压缩过程，在同一个流中发出一个压缩输出项，并在继续推理之前裁剪上下文。
3.  使用以下模式之一继续你的循环：无状态 input-array 链式调用（将输出（包括压缩项）追加到下一个输入数组中）或 `previous_response_id` 链式调用（每轮只传递新的用户消息并传递该 ID）。

## 示例用户流程

```
conversation = [
    {
        "type": "message",
        "role": "user",
        "content": "Let's begin a long coding task.",
    }
]

while keep_going:
    response = client.responses.create(
        model="gpt-5.3-codex",
        input=conversation,
        store=False,
        context_management=[{"type": "compaction", "compact_threshold": 200000}],
    )

    conversation.extend(response.output)

    conversation.append(
        {
            "type": "message",
            "role": "user",
            "content": get_next_user_input(),
        }
    )
```

## 独立压缩端点

如需显式控制，可使用[独立压缩端点](/api/docs/api-reference/responses/compact)在长时间运行的工作流中进行无状态压缩。

此端点完全无状态且 ZDR 友好。

你发送一个完整的上下文窗口（消息、工具和其他项），端点返回一个新的压缩后上下文窗口，你可以将其传递给下一次 `/responses` 调用。

返回的压缩窗口包含一个加密的压缩项，它使用更少的 token 携带关键的先前状态和推理。它是不透明的，不适合人类阅读。

注意：压缩后的窗口通常不仅仅包含压缩项。它还可以包含从先前窗口中保留的项。

输出处理：不要裁剪 `/responses/compact` 的输出。返回的窗口是规范的下一个上下文窗口，因此请将其原样传递到下一次 `/responses` 调用中。

### 独立压缩的用户流程

1.  正常使用 `/responses`，发送包含用户消息、助手输出和工具交互的输入项。
2.  当你的上下文窗口变大时，调用 `/responses/compact` 生成新的压缩后上下文窗口。你发送给 `/responses/compact` 的窗口仍然必须在模型的上下文窗口范围内。
3.  对于后续的 `/responses` 调用，将返回的压缩窗口（包括压缩项）作为输入传递，而不是完整的对话记录。

### 示例用户流程

```
# 从先前轮次收集的完整窗口
long_input_items_array = [...]

# 1) 压缩当前窗口
compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_input_items_array,
)

# 2) 通过追加新的用户消息开始下一轮
next_input = [
    *compacted.output,  # 原样使用压缩输出
    {
        "type": "message",
        "role": "user",
        "content": user_input_message(),
    },
]

next_response = client.responses.create(
    model="gpt-5.5",
    input=next_input,
    store=False,  # 保持流程 ZDR 友好
)
```
