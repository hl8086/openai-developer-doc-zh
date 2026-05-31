
语音活动检测（VAD）是 Realtime API 中的一项功能，允许自动检测用户何时开始或停止说话。它在[语音到语音](/guides/realtime-conversations) Realtime 会话中默认启用，但它是可选的，可以关闭。在[转录](/guides/realtime-transcription) Realtime 会话中，轮次检测支持取决于转录模型。支持 VAD 的模型默认使用 `server_vad`，而 `gpt-realtime-whisper` 要求省略轮次检测或将其设置为 `null`。

## 概述

当 VAD 启用时，音频会自动分块，Realtime API 会发送事件来指示用户何时开始或停止说话：

*   `input_audio_buffer.speech_started`：语音轮次的开始
*   `input_audio_buffer.speech_stopped`：语音轮次的结束

你可以使用这些事件在应用程序中处理语音轮次。例如，你可以使用它们来管理对话状态或分块处理转录文本。

你可以通过 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 客户端事件设置 `session.audio.input.turn_detection` 来配置 VAD。

VAD 有两种模式：

*   `server_vad`：根据静音时段自动分块音频。
*   `semantic_vad`：当模型根据用户所说的话判断用户已完成其话语时分块音频。

对于支持 VAD 的会话和模型，默认值为 `server_vad`。

请阅读下文了解更多关于不同模式的信息。

## Server VAD

Server VAD 是语音到语音会话的默认模式，也是支持轮次检测的模型在转录会话中的默认模式。它使用静音时段自动分块音频。

你可以调整以下属性来微调 VAD 设置：

*   `threshold`：激活阈值（0 到 1）。较高的阈值将要求更大的音量才能激活模型，因此在嘈杂环境中可能表现更好。
*   `prefix_padding_ms`：在 VAD 检测到语音之前要包含的音频量（以毫秒为单位）。
*   `silence_duration_ms`：检测语音停止的静音持续时间（以毫秒为单位）。较短的值将更快地检测到轮次。

以下是一个 VAD 配置示例：

```
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "audio": {
      "input": {
        "turn_detection": {
          "type": "server_vad",
          "threshold": 0.5,
          "prefix_padding_ms": 300,
          "silence_duration_ms": 500,
          "create_response": true, // only in conversation mode
          "interrupt_response": true // only in conversation mode
        }
      }
    }
  }
}
```

在转录会话中使用相同的 `session.audio.input.turn_detection` 字段。对于 `gpt-realtime-whisper`，请省略轮次检测或将其设置为 `null`。

`create_response` 和 `interrupt_response` 字段仅在语音到语音对话中使用。在转录会话中，VAD 仅控制音频的分块方式。

## Semantic VAD

Semantic VAD 是一种新模式，它使用语义分类器根据用户所说的话来检测用户是否已经说完。该分类器根据用户说完话的概率对输入音频进行评分。当概率较低时，模型会等待超时，而当概率较高时，则无需等待。例如，用户音频以"嗯……"拖尾会导致比明确陈述更长的超时时间。

使用此模式，模型在语音到语音对话中不太可能打断用户，或在用户说完之前对转录进行分块。

可以通过将 `session.audio.input.turn_detection.type` 设置为 `semantic_vad` 来激活 Semantic VAD。

可以这样配置：

```
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "audio": {
      "input": {
        "turn_detection": {
          "type": "semantic_vad",
          "eagerness": "low" | "medium" | "high" | "auto", // optional
          "create_response": true, // only in conversation mode
          "interrupt_response": true, // only in conversation mode
        }
      }
    }
  }
}
```

相同的 `session.audio.input.turn_detection` 字段适用于转录会话。`create_response` 和 `interrupt_response` 字段仅用于对话模式。

可选的 `eagerness` 属性是一种控制模型打断用户的积极程度的方式，用于调整最大等待超时时间。在转录模式中，即使模型不回复，它也会影响音频的分块方式。

*   `auto` 是默认值，等同于 `medium`。
*   `low` 会让用户从容地说话。
*   `high` 会尽快分块音频。

如果你希望模型在对话模式中更频繁地响应，或在转录模式中更快地返回转录事件，可以将 `eagerness` 设置为 `high`。

另一方面，如果你希望在对话模式中让用户不被打断地说话，或者在转录模式中获得更大的转录块，可以将 `eagerness` 设置为 `low`。
