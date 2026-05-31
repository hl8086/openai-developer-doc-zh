# Managing costs

本文档描述了 Realtime API 的计费方式，并提供了优化成本的策略。语音代理会话在文本、音频和图像模态上累积输入和输出 token。流式翻译和流式转录会话按音频时长计费。价格因模型而异，具体价格列在模型页面上（例如 [`gpt-realtime-2`](/models/gpt-realtime-2)、[`gpt-realtime-translate`](/models/gpt-realtime-translate)、[`gpt-realtime-whisper`](/models/gpt-realtime-whisper) 和 [`gpt-realtime`](/models/gpt-realtime)）。

对话式 Realtime API 会话由一系列 _轮次_ 组成，用户添加输入触发 _Response_ 来生成模型输出。服务器维护一个 _Conversation_，即构成下一轮输入的 _Items_ 列表。当 Response 返回时，输出会自动添加到 Conversation 中。

翻译和转录会话使用不同的流式架构。客户端持续流式传输音频，并在源音频到达时接收翻译后的音频、转录增量或转录事件。这些会话不使用常规的 Response 生命周期，因此应使用基于时长的费率而非按 Response 的 token 用量来估算和监控成本。

## 每次 Response 的成本

Realtime API 的成本在创建 Response 时产生，根据输入和输出 token 数量计费（输入转录成本除外，见下文）。目前网络带宽或连接不收费。Response 可以手动创建，也可以在开启语音活动检测（VAD）时自动创建。VAD 会有效过滤空白输入音频，因此空白音频不会计为输入 token，除非客户端手动将其添加为对话输入。

每次 Response 都会将整个对话发送给模型。一轮的输出将作为 Items 添加到服务器 Conversation 中，成为后续轮次的输入，因此会话中越靠后的轮次成本越高。

文本 token 成本可以使用我们的[分词工具](https://platform.openai.com/tokenizer)来估算。用户消息中的音频 token 为每 100 毫秒音频 1 个 token，而助手消息中的音频 token 为每 50 毫秒音频 1 个 token。请注意，token 计数包括消息内容之外的特殊 token，这会导致计数出现微小差异，例如包含 10 个文本 token 内容的用户消息可能计为 12 个 token。

### 示例

以下是一个简单示例，说明多轮 Realtime API 会话中的 token 成本。

在对话的第一轮中，我们添加了 100 个 token 的指令和一条 20 个音频 token 的用户消息（例如由 VAD 根据用户说话添加），总计 120 个输入 token。创建 Response 会生成一条助手输出消息（20 个音频 token，10 个文本 token）。

然后我们用另一条用户音频消息创建第二轮。第二轮的 token 会是什么样的？此时 Conversation 包括初始指令、第一条用户消息、第一轮的助手输出消息，以及第二条用户消息（25 个音频 token）。这一轮的输入将有 110 个文本 token 和 64 个音频 token，加上另一条助手输出消息的输出 token。

![连续对话轮次的 token](https://cdn.openai.com/API/docs/images/realtime-costs-turns.png)

第一轮的消息很可能会被缓存用于第二轮，从而降低输入成本。有关缓存的更多信息，请参见下文。

Response 使用的 token 可以从 `response.done` 事件中读取，格式如下。

```
{
  "type": "response.done",
  "response": {
    ...
    "usage": {
      "total_tokens": 253,
      "input_tokens": 132,
      "output_tokens": 121,
      "input_token_details": {
        "text_tokens": 119,
        "audio_tokens": 13,
        "image_tokens": 0,
        "cached_tokens": 64,
        "cached_tokens_details": {
          "text_tokens": 64,
          "audio_tokens": 0,
          "image_tokens": 0
        }
      },
      "output_token_details": {
        "text_tokens": 30,
        "audio_tokens": 91
      }
    }
  }
}
```

## 输入转录成本

除了对话式 Response 之外，Realtime API 还会对输入转录（如果启用）进行计费。输入转录使用与 speech2speech 模型不同的模型，例如 [`whisper-1`](/models/whisper-1) 或 [`gpt-4o-transcribe`](/models/gpt-4o-transcribe)，因此按不同的费率计费。当音频写入输入音频缓冲区并提交时（手动或通过 VAD），会执行转录。

输入转录的 token 计数可以从 `conversation.item.input_audio_transcription.completed` 事件中读取，如以下示例所示。

```
{
  "type": "conversation.item.input_audio_transcription.completed",
  ...
  "transcript": "Hi, can you hear me?",
  "usage": {
    "type": "tokens",
    "total_tokens": 26,
    "input_tokens": 17,
    "input_token_details": {
      "text_tokens": 0,
      "audio_tokens": 17
    },
    "output_tokens": 9
  }
}
```

## 缓存

Realtime API 支持[提示缓存](/guides/prompt-caching)，该功能自动应用，可以显著降低多轮会话中输入 token 的成本。当一个 Response 的输入 token 与之前 Response 的 token 匹配时，缓存就会生效，但这是尽力而为的，不保证一定生效。

最大化缓存命中率的最佳策略是保持会话历史不变。删除或更改对话中的内容会"破坏"缓存直到更改点——输入不再像之前那样匹配。请注意，指令和工具定义位于对话的开头，因此在会话中途更改这些内容会降低后续轮次的缓存命中率。

## 截断

当对话中的 token 数量超过模型的输入 token 限制时，对话将被截断，这意味着消息（从最旧的开始）将从 Response 输入中删除。一个 32k 上下文模型，最大输出 token 为 4,096，在截断发生前只能在上下文中包含 28,224 个 token。

客户端可以设置比模型最大值更小的 token 窗口，这是控制 token 使用量和成本的好方法。这通过 `token_limits.post_instructions` 配置来控制（如果您使用如下所示的 `retention_ratio` 类型配置截断）。顾名思义，这控制 Response 的最大输入 token 数，但不包括指令 token。将 `post_instructions` 设置为 1,000 意味着超过 1,000 输入 token 限制的项目不会被发送给模型用于 Response。

截断会破坏对话开头附近的缓存，如果每轮都发生截断，缓存命中率将非常低。为了缓解这个问题，客户端可以配置截断以删除比必要更多的消息，从而延长下次截断前的余量。这可以通过 `session.truncation.retention_ratio` 设置来控制。服务器默认值为 `1.0`，意味着截断只会删除必要的项目。值为 `0.8` 意味着截断将保留最大值的 80%，额外删除 20%。

如果您想降低每个会话的 Realtime API 成本（对于给定模型），我们建议限制 token 数量并将 `retention_ratio` 设置为小于 1，如以下示例所示。请记住，这里可能存在权衡——成本更低但给定轮次的模型记忆也更少。

```
{
  "event": "session.update",
  "session": {
    "truncation": {
      "type": "retention_ratio",
      "retention_ratio": 0.8,
      "token_limits": {
        "post_instructions": 8000
      }
    }
  }
}
```

也可以完全禁用截断，如下所示。禁用后，如果 Conversation 太长无法创建 Response，将返回错误。如果您打算手动管理 Conversation 大小，这可能很有用。

```
{
  "event": "session.update",
  "session": {
    "truncation": "disabled"
  }
}
```

## 其他优化策略

### 使用 mini 模型

Realtime speech2speech 模型有"标准"大小和 mini 大小，mini 大小显著更便宜。这里的权衡通常与指令遵循和函数调用相关的智能有关，mini 模型在这些方面不如标准模型有效。我们建议先使用较大的模型测试应用程序，完善您的应用和提示，然后尝试使用 mini 模型进行优化。

### 编辑 Conversation

虽然截断会在服务器上自动发生，但另一种成本管理策略是手动编辑 Conversation。API 的一个原则是允许客户端完全控制服务器端的 Conversation，允许客户端随意添加和删除项目。

```
{
  "type": "conversation.item.delete",
  "item_id": "item_CCXLecNJVIVR2HUy3ABLj"
}
```

清除旧消息是减少输入 token 大小和成本的好方法。这可能会删除重要内容，但一种常见策略是用摘要替换这些旧消息。可以使用如上所示的 `conversation.item.delete` 消息从 Conversation 中删除项目，也可以使用 `conversation.item.create` 消息添加项目。

## 估算成本

鉴于 Realtime API token 使用的复杂性，提前估算成本可能很困难。一个好的方法是使用 Realtime Playground 配合您预期的提示和函数，并测量示例会话中的 token 使用量。会话的 token 使用量可以在 Realtime Playground 的 Logs 标签页中会话 ID 旁边找到。

![在 playground 中显示 token](https://cdn.openai.com/API/docs/images/realtime-playground-tokens.png)
