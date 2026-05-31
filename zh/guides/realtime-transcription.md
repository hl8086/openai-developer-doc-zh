# Realtime transcription

当您的应用程序需要实时语音转文字但不需要语音助手响应时，请使用实时转录。实时转录会话在音频到达时流式传输转录增量，因此用户可以在完整话语完成之前看到文本。

要获得最低延迟的流式转录路径，请使用 [`gpt-realtime-whisper`](/models/gpt-realtime-whisper)。对于离线文件或不需要流式增量的工作流，请使用 Audio API 中的标准语音转文字模型。

## 选择转录模型

| 模型 | 最适合 | 备注 |
| --- | --- | --- |
| [gpt-realtime-whisper](/models/gpt-realtime-whisper) | 实时音频、转录增量、可调延迟。 | 原生流式传输，专为实时会话设计。 |
| [gpt-4o-transcribe](/models/gpt-4o-transcribe) | 不需要流式传输的高精度语音转文字。 | 用于文件和请求-响应转录工作流。 |
| [gpt-4o-mini-transcribe](/models/gpt-4o-mini-transcribe) | 低成本转录。 | 当成本比最高精度更重要时使用。 |
| [whisper-1](/models/whisper-1) | 现有 Whisper 集成。 | 不像 `gpt-realtime-whisper` 那样原生流式传输。 |

`gpt-realtime-whisper` 是实时转录的替代方案，而非所有转录模型的全面替代品。在切换生产流量之前，请针对您的音频、语言、词汇和延迟要求进行测试。

## 创建转录会话

实时转录使用 `type: "transcription"` 的会话。您可以使用 [WebSocket](/guides/realtime-websocket) 连接服务器端音频管道，或使用 [WebRTC](/guides/realtime-webrtc) 连接浏览器音频。

```
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {
          "type": "audio/pcm",
          "rate": 24000
        },
        "transcription": {
          "model": "gpt-realtime-whisper",
          "language": "en"
        }
      }
    }
  }
}
```

### 会话字段

*   `type`：设置为 `transcription` 表示仅转录会话。
*   `audio.input.format`：附加到缓冲区的音频输入编码。发送 `audio/pcm` 时使用 24 kHz 单声道 PCM。
*   `audio.input.transcription.model`：使用 `gpt-realtime-whisper` 进行流式转录。
*   `audio.input.transcription.language`：可选的语言提示，如 `en`。
*   `audio.input.transcription.delay`：`gpt-realtime-whisper` 的可选延迟/精度权衡。支持的值为 `minimal`、`low`、`medium`、`high` 和 `xhigh`。
*   `audio.input.turn_detection`：支持该功能的模型的可选语音活动检测。对于 `gpt-realtime-whisper`，省略此字段或将其设置为 `null`，然后手动提交音频。

## 流式传输音频

使用 `input_audio_buffer.append` 发送音频块：

```
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```

如果禁用了轮次检测，在需要开始转录时提交缓冲区：

```
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.commit",
  })
);
```

对于支持服务器端 VAD 的模型，会话会在检测到轮次边界时自动提交音频。

## 处理转录事件

监听增量转录增量和完成事件：

```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "conversation.item.input_audio_transcription.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "conversation.item.input_audio_transcription.completed") {
    console.log("\nFinal transcript:", event.transcript);
  }
});
```

增量事件包含新可用的转录文本：

```
{
  "type": "conversation.item.input_audio_transcription.delta",
  "item_id": "item_003",
  "content_index": 0,
  "delta": "Hello,"
}
```

完成事件包含已提交项目的最终转录：

```
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Hello, how are you?"
}
```

不同语音轮次的完成事件之间的顺序不保证。使用 `item_id` 将转录事件与已提交的输入项目进行匹配。

## 调整延迟和精度

流式转录在延迟和转录质量之间进行权衡。较低的延迟设置可以更早产生部分文本。较高的延迟设置在发出文本之前为模型提供更多音频上下文，可以改善词错误率。

首先设置 `audio.input.transcription.delay` 并针对您的真实音频进行测试。有用的起始点包括：

*   `minimal` 用于对延迟最敏感的交互；
*   `low` 用于低延迟实时字幕；
*   `medium` 用于平衡的延迟/精度权衡；
*   `high` 当精度比即时显示更重要时；
*   `xhigh` 当您的工作流可以容忍最大延迟以获取额外上下文时。

确切的延迟毫秒数可能因模型配置而异，因此请使用代表性音频进行基准测试，而不是假设每个级别有固定的时间。

不要仅根据合成音频选择设置。请使用代表性麦克风、电话音频、口音、背景噪音、语码转换、领域词汇和长时间会话进行测试。

## 引导词汇和领域术语

如果您的应用程序依赖于精确的领域词汇，请包含语言提示，并仅在所选模型支持时使用提示或关键词引导。对于 GA 实时会话中的 `gpt-realtime-whisper`，不支持 `prompt`。

在提示引导可用的情况下，使用简短的关键词列表而非长指令。模型已被指示进行转录，因此将提示集中在领域词汇、拼写或风格上，而不是重复说明转录任务。

关键词风格示例：

```
Keywords: metoprolol, atorvastatin, A1C, systolic, diastolic
```

在生产环境中，将关键词引导视为辅助而非保证。继续手动评估姓名、数字、日期、药物名称、产品名称、艺术家名称和其他高价值实体。

## 处理置信度、时间戳和说话人分离

仅请求所选模型和端点支持的可选字段。如果您的应用程序需要置信度评分、时间戳或说话人分离，请在上线前验证支持情况，并为不可用的字段添加回退方案。

当对数概率可用时，使用 `include` 请求它们：

```
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "transcription": {
          "model": "gpt-realtime-whisper"
        }
      }
    },
    "include": ["item.input_audio_transcription.logprobs"]
  }
}
```

## 生产检查清单

*   在调优之前确定目标延迟和精度阈值。
*   针对真实生产音频进行测试，而不仅仅是干净的样本。
*   测试每种目标语言。
*   在评估集中包含数字、日期、货币、电子邮件地址、产品名称和领域术语。
*   除词错误率外，还要跟踪空的、截断的和延迟的转录。
*   决定当后续增量修正早期文本时，您的 UI 应如何修订部分文本。
*   使用 `item_id` 对最终转录进行排序和对账。
*   为不支持的时间戳、说话人分离或置信度字段保留回退路径。

## 相关指南

[实时和音频概述 - 比较语音代理、翻译和转录会话。](/guides/realtime)

[实时翻译 - 使用专用翻译会话翻译实时语音。](/guides/realtime-translation)

[WebSocket 连接 - 通过服务器端媒体管道流式传输原始音频。](/guides/realtime-websocket)

[语音活动检测 - 为实时音频流配置轮次检测。](/guides/realtime-vad)
