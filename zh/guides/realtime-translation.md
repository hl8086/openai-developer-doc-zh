
实时翻译允许你将源音频流式传输到专用翻译会话中，并在说话者仍在讲话时接收翻译后的音频和转录增量。适用于实时口译、多语言通话、广播、会议、课程和视频房间。

当你的应用需要翻译人类所说的话时，使用 [`gpt-realtime-translate`](/models/gpt-realtime-translate)。如果你需要一个能回答问题、调用工具和管理对话的助手，请改用 [`gpt-realtime-2`](/models/gpt-realtime-2) 配合标准实时会话。

## 翻译会话的不同之处

实时翻译会话使用与语音代理会话不同的架构：

| 语音代理会话 | 翻译会话 |
| --- | --- |
| 连接到 `/v1/realtime`。 | 连接到 `/v1/realtime/translations`。 |
| 模型充当助手。 | 模型充当口译员。 |
| 使用对话和响应生命周期。 | 从传入音频持续流式处理。 |
| 可以调用工具并产生助手回合。 | 产生翻译后的音频和转录增量。 |
| 你可以调用 `response.create`。 | 你不需要调用 `response.create`。 |

翻译从音频流本身开始。持续追加音频（包括短语之间的静音），并在输出事件到达时处理它们。

## 选择传输方式

当浏览器捕获或播放音频时使用 WebRTC。WebRTC 将源音频作为媒体轨道发送，并将翻译后的语音作为远程音频轨道接收，因此你无需手动重采样或播放 PCM 数据块。

当你的服务器已经接收原始音频时使用 WebSocket，例如 Twilio Media Streams、SIP 媒体、广播摄入或媒体工作器。使用 WebSocket 时，发送 base64 编码的 24 kHz PCM16 音频，并自行播放返回的音频增量。

## 创建浏览器 WebRTC 会话

对于浏览器应用，在服务器上创建短期客户端密钥。不要在浏览器中暴露你的标准 API 密钥。

创建翻译客户端密钥

```javascript
app.post("/session", async (req, res) => {
  const language = req.body.targetLanguage ?? "es";

  const response = await fetch(
    "https://api.openai.com/v1/realtime/translations/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: JSON.stringify({
        session: {
          model: "gpt-realtime-translate",
          audio: {
            output: { language },
          },
        },
      }),
    }
  );

  res.status(response.status).json(await response.json());
});
```

在浏览器中，捕获音频，创建对等连接，并将 SDP offer 发送到翻译通话端点：

连接浏览器翻译通话

```javascript
const { value: clientSecret } = await fetch("/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ targetLanguage: "es" }),
}).then((response) => response.json());

const sourceStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

const pc = new RTCPeerConnection();
pc.addTrack(sourceStream.getAudioTracks()[0], sourceStream);

const translatedAudio = new Audio();
translatedAudio.autoplay = true;
pc.ontrack = ({ streams }) => {
  translatedAudio.srcObject = streams[0];
};

const events = pc.createDataChannel("oai-events");
events.onmessage = ({ data }) => {
  const event = JSON.parse(data);
  if (event.type === "session.output_transcript.delta") {
    subtitles.textContent += event.delta;
  }
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch(
  "https://api.openai.com/v1/realtime/translations/calls",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  }
);

if (!sdpResponse.ok) {
  throw new Error(await sdpResponse.text());
}

await pc.setRemoteDescription({
  type: "answer",
  sdp: await sdpResponse.text(),
});
```

## 创建 WebSocket 会话

连接到专用翻译端点，并在 URL 中选择模型：

运行此示例前，请先为 Node.js 安装 `ws` 包，或为 Python 安装 `websocket-client` 包。

**连接到翻译会话**

::: code-group
```javascript
import WebSocket from "ws";

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
  }
);
```

```python
import os
import websocket

ws = websocket.WebSocket()
ws.connect(
    "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
    header=[
        f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
        "OpenAI-Safety-Identifier: hashed-user-id",
    ],
)
```

:::



在 socket 打开后配置目标语言：

**配置目标语言**

::: code-group
```javascript
ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        audio: {
          output: {
            language: "es",
          },
        },
      },
    })
  );
});
```

```python
import json

ws.send(
    json.dumps(
        {
            "type": "session.update",
            "session": {
                "audio": {
                    "output": {
                        "language": "es",
                    },
                },
            },
        }
    )
)
```

:::




然后持续追加音频：

**追加源音频**

::: code-group
```javascript
ws.send(
  JSON.stringify({
    type: "session.input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```

```python
ws.send(
    json.dumps(
        {
            "type": "session.input_audio_buffer.append",
            "audio": base64_pcm16,
        }
    )
)
```

:::



监听翻译后的音频和转录：

**监听翻译后的音频和转录**

::: code-group
```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "session.output_audio.delta") {
    playPcm16(event.delta);
  }

  if (event.type === "session.output_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "session.input_transcript.delta") {
    updateSourceTranscript(event.delta);
  }
});
```

```python
while True:
    event = json.loads(ws.recv())

    if event["type"] == "session.output_audio.delta":
        play_pcm16(event["delta"])

    if event["type"] == "session.output_transcript.delta":
        print(event["delta"], end="", flush=True)

    if event["type"] == "session.input_transcript.delta":
        update_source_transcript(event["delta"])
```

:::



## 关闭 WebSocket 会话

当你的源流结束时，在关闭 WebSocket 之前发送 [`session.close`]( https://developers.openai.com/api/reference/resources/realtime/translation-client-events#session-close) 事件。该事件告诉服务刷新待处理的输入音频，发出所有剩余的翻译音频和转录输出，然后发送 `session.closed` 事件。`session.close` 事件仅支持翻译会话。

发送 `session.close` 后，停止追加音频，并在正常的接收循环中继续读取事件，直到收到 `session.closed`。立即关闭 socket 可能会丢失仍在从会话中排出的翻译输出。

**关闭翻译会话**

::: code-group
```javascript
let translationSessionClosing = false;

function closeTranslationSession() {
  if (translationSessionClosing) {
    return;
  }

  translationSessionClosing = true;
  ws.send(
    JSON.stringify({
      type: "session.close",
    })
  );
}

ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "session.output_audio.delta") {
    playPcm16(event.delta);
  }

  if (event.type === "session.output_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "session.input_transcript.delta") {
    updateSourceTranscript(event.delta);
  }

  if (event.type === "session.closed") {
    ws.close();
  }
});

// Call this when the source stream ends.
closeTranslationSession();
```

```python
translation_session_closing = False


def close_translation_session():
    global translation_session_closing
    if translation_session_closing:
        return

    translation_session_closing = True
    ws.send(json.dumps({"type": "session.close"}))


# Call this when the source stream ends.
close_translation_session()

while True:
    event = json.loads(ws.recv())

    if event["type"] == "session.output_audio.delta":
        play_pcm16(event["delta"])

    if event["type"] == "session.output_transcript.delta":
        print(event["delta"], end="", flush=True)

    if event["type"] == "session.input_transcript.delta":
        update_source_transcript(event["delta"])

    if event["type"] == "session.closed":
        ws.close()
        break
```

:::




## 构建旁听翻译

当一个源说话者或流需要为听众提供翻译音频时，使用旁听翻译。示例包括直播、会议演讲、网络研讨会、财报电话会议、讲座和视频。

典型架构为：

```
source audio -> translation session -> translated audio + subtitles
```

为每种目标语言创建一个翻译会话。如果同一英语源需要西班牙语和法语输出，则创建一个英语到西班牙语的会话和一个英语到法语的会话。

对于浏览器旁听应用，使用 `getDisplayMedia()` 捕获标签页音频，通过 WebRTC 发送，并播放远程翻译音频轨道。对于生产广播，在服务器媒体工作器中运行翻译，并将翻译后的音频轨道或字幕发布给听众。

## 构建对话翻译

当两个或更多参与者跨语言交谈时，使用对话翻译。示例包括客服电话、销售电话、辅导和视频房间。

保持参与者音频轨道分离。将说话者混合到一个流中会使说话者身份识别、说话者字幕和重叠语音更难处理。

对于两人通话，为每个方向创建一个翻译会话：

```
Caller A audio -> translate into Caller B language -> play to Caller B
Caller B audio -> translate into Caller A language -> play to Caller A
```

对于群组房间，会话数量取决于活跃说话者和目标语言：

```
translation sessions ~= active source speaker tracks x distinct target languages
```

对于小型房间，每个听众可以为他们想要翻译的远程说话者创建浏览器端翻译附属会话。对于较大的房间，使用服务器端参与者或媒体工作器，订阅每个源说话者一次，为每种目标语言创建一个翻译会话，并重新发布翻译后的轨道。

## 测试质量和延迟

使用真实音频和双语审核测试翻译。自动化指标可以提供帮助，但它们无法捕获用户注意到的每个错误。

测试：

*   语言对质量；
*   姓名、数字、日期、货币和电话号码；
*   领域特定术语；
*   语码转换和混合语言对话；
*   口音、快速语音和重叠语音；
*   首次翻译音频延迟；
*   语句结束延迟；
*   字幕时序；
*   语音一致性；
*   重连行为。

如果你的用例依赖于精确的名称或领域术语，请在上线前构建一个黄金测试集，并手动审查失败案例。

## 生产清单

*   浏览器媒体选择 WebRTC，服务器媒体选择 WebSocket。
*   使用专用的 `/v1/realtime/translations` 端点。
*   持续流式传输音频，包括短语之间的静音。
*   在关闭 WebSocket 会话之前使用 `session.close` 并等待 `session.closed`。
*   对话翻译时保持说话者轨道分离。
*   每种输出语言使用一个会话。
*   在有用时同时渲染源语言和目标语言转录。
*   提供原始音频、翻译音频、字幕、静音和音量的控制。
*   显示重连中、延迟和不可用状态。
*   将延迟与翻译质量分开跟踪。

## 相关指南

[实时和音频概述 - 比较语音代理、翻译和转录会话。](/guides/realtime)

[WebRTC 连接 - 将浏览器媒体连接到实时会话。](/guides/realtime-webrtc)

[WebSocket 连接 - 通过服务器端媒体管道流式传输原始音频。](/guides/realtime-websocket)

[实时转录 - 从实时音频流式传输转录增量。](/guides/realtime-transcription)
