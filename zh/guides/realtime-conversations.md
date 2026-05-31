
通过 [WebRTC](/guides/realtime-webrtc) 或 [WebSocket](/guides/realtime-websocket) 连接到 Realtime API 后，你可以调用 Realtime 模型（如 [`gpt-realtime-2`](/models/gpt-realtime-2)）进行语音对语音的对话。这需要你**发送客户端事件**来发起操作，并**监听服务器事件**来响应 Realtime API 执行的操作。

本指南将介绍使用模型功能（如音频和文本生成、图像输入和函数调用）所需的事件流程，以及如何理解 Realtime 会话的状态。

如果你不需要与模型进行对话（即不期望任何响应），可以在[转录模式](/guides/realtime-transcription)下使用 Realtime API。

## Realtime 语音对语音会话

Realtime 会话是模型与已连接客户端之间的有状态交互。会话的关键组件包括：

*   **Session** 对象，控制交互的参数，如使用的模型、生成输出的语音以及其他配置。
*   **Conversation**（对话），表示当前会话期间生成的用户输入项和模型输出项。
*   **Responses**（响应），是模型生成的音频或文本项，会被添加到对话中。

**输入音频缓冲区与 WebSocket**

如果你使用 WebRTC，发送和接收模型音频所需的大部分媒体处理都由 WebRTC API 辅助完成。

  

如果你使用 WebSocket 处理音频，则需要手动与**输入音频缓冲区**交互，通过发送包含 base64 编码音频的 JSON 事件将音频发送到服务器。

所有这些组件共同构成一个 Realtime 会话。你将使用客户端事件来更新会话状态，并监听服务器事件来响应会话中的状态变化。

![diagram realtime state](https://openaidevs.retool.com/api/file/11fe71d2-611e-4a26-a587-881719a90e56)

## 会话生命周期事件

通过 [WebRTC](/guides/realtime-webrtc) 或 [WebSocket](/guides/realtime-websockets) 发起会话后，服务器将发送 [`session.created`]( https://developers.openai.com/api/reference/realtime-server-events/session/created) 事件，表示会话已就绪。在客户端，你可以使用 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 事件更新当前会话配置。大多数会话属性可以随时更新，但在模型在会话中首次以音频响应后，模型用于音频输出的 `voice` 将无法修改。Realtime 会话的最大持续时间为 **60 分钟**。

以下示例展示了使用 `session.update` 客户端事件更新会话。有关通过这些通道发送客户端事件的更多信息，请参阅 [WebRTC](/guides/realtime-webrtc#sending-and-receiving-events) 或 [WebSocket](/guides/realtime-websocket#sending-and-receiving-events) 指南。

**更新本会话中模型使用的系统指令**

::: code-group
```javascript
const event = {
  type: "session.update",
  session: {
      type: "realtime",
      model: "gpt-realtime-2",
      // Lock the output to audio (set to ["text"] if you want text without audio)
      output_modalities: ["audio"],
      audio: {
        input: {
          format: {
            type: "audio/pcm",
            rate: 24000,
          },
          turn_detection: {
            type: "semantic_vad"
          }
        },
        output: {
          format: {
            type: "audio/pcm",
          },
          voice: "marin",
        }
      },
      // Use a server-stored prompt by ID. Optionally pin a version and pass variables.
      prompt: {
        id: "pmpt_123",          // your stored prompt ID
        version: "89",           // optional: pin a specific version
        variables: {
          city: "Paris"          // example variable used by your prompt
        }
      },
      // You can still set direct session fields; these override prompt fields if they overlap:
      instructions: "Speak clearly and briefly. Confirm understanding before taking actions."
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    session: {
      type: "realtime",
      model: "gpt-realtime-2",
      # Lock the output to audio (add "text" if you also want text)
      output_modalities: ["audio"],
      audio: {
        input: {
          format: {
            type: "audio/pcm",
            rate: 24000,
          },
          turn_detection: {
            type: "semantic_vad"
          }
        },
        output: {
          format: {
            type: "audio/pcmu",
          },
          voice: "marin",
        }
      },
      # Use a server-stored prompt by ID. Optionally pin a version and pass variables.
      prompt: {
        id: "pmpt_123",          // your stored prompt ID
        version: "89",           // optional: pin a specific version
        variables: {
          city: "Paris"          // example variable used by your prompt
        }
      },
      # You can still set direct session fields; these override prompt fields if they overlap:
      instructions: "Speak clearly and briefly. Confirm understanding before taking actions."
    }
}
ws.send(json.dumps(event))
```

:::



当会话更新完成后，服务器将发出 [`session.updated`]( https://developers.openai.com/api/reference/realtime-server-events/session/updated) 事件，包含会话的新状态。

| 相关客户端事件 | 相关服务器事件 |
| --- | --- |
| [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) | [`session.created`]( https://developers.openai.com/api/reference/realtime-server-events/session/created)[`session.updated`]( https://developers.openai.com/api/reference/realtime-server-events/session/updated) |

## 文本输入和输出

要使用 Realtime 模型生成文本，你可以将文本输入添加到当前对话中，请求模型生成响应，并监听服务器发送的事件以了解模型响应的进度。为了生成文本，[会话必须配置]( https://developers.openai.com/api/reference/realtime-client-events/session/update)为包含 `text` 模态（默认情况下已启用）。

使用 [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create) 客户端事件创建新的文本对话项。这类似于在 REST API 中通过 [Chat Completions 发送用户消息（提示）](/guides/text-generation)。

**创建包含用户输入的对话项**

::: code-group
```javascript
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "What Prince album sold the most copies?",
      }
    ]
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": "What Prince album sold the most copies?",
            }
        ]
    }
}
ws.send(json.dumps(event))
```

:::



将用户消息添加到对话后，发送 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 事件以发起模型响应。如果当前会话同时启用了音频和文本，模型将同时以音频和文本内容进行响应。如果你只想生成文本，可以在发送 `response.create` 客户端事件时指定，如下所示。

**生成纯文本响应**

::: code-group
```javascript
const event = {
  type: "response.create",
  response: {
    output_modalities: [ "text" ]
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "output_modalities": [ "text" ]
    }
}
ws.send(json.dumps(event))
```

:::




当响应完全完成时，服务器将发出 [`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done) 事件。此事件将包含模型生成的完整文本，如下所示。

**监听 response.done 以查看最终结果**

::: code-group
```javascript
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (serverEvent.type === "response.done") {
    console.log(serverEvent.response.output[0]);
  }
}

// Listen for server messages (WebRTC)
dataChannel.addEventListener("message", handleEvent);

// Listen for server messages (WebSocket)
// ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event.type == "response.done":
        print(server_event.response.output[0])
```

:::



在模型响应生成过程中，服务器会发出多个生命周期事件。你可以监听这些事件，例如 [`response.output_text.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_text/delta)，以便在响应生成时向用户提供实时反馈。服务器发出的完整事件列表见下方**相关服务器事件**。它们按大致发出顺序排列，同时列出了与文本生成相关的客户端事件。

| 相关客户端事件 | 相关服务器事件 |
| --- | --- |
| [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create)[`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) | [`conversation.item.added`]( https://developers.openai.com/api/reference/realtime-server-events/conversation/item/added)[`conversation.item.done`]( https://developers.openai.com/api/reference/realtime-server-events/conversation/item/done)[`response.created`]( https://developers.openai.com/api/reference/realtime-server-events/response/created)[`response.output_item.added`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_item/added)[`response.content_part.added`]( https://developers.openai.com/api/reference/realtime-server-events/response/content_part/added)[`response.output_text.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_text/delta)[`response.output_text.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_text/done)[`response.content_part.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/content_part/done)[`response.output_item.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_item/done)[`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done)[`rate_limits.updated`]( https://developers.openai.com/api/reference/realtime-server-events/response/rate_limits/updated) |

## 音频输入和输出

Realtime API 最强大的功能之一是与模型进行语音对语音的交互，无需中间的文本转语音或语音转文本步骤。这为语音界面提供了更低的延迟，并为模型提供了更多关于语音输入的语调和语气数据。

### 语音选项

Realtime 会话可以配置为在生成音频输出时使用多种内置语音之一。你可以在创建会话时（或在 `response.create` 中）设置 `voice` 来控制模型的声音。当前可用的语音选项有 `alloy`、`ash`、`ballad`、`coral`、`echo`、`sage`、`shimmer`、`verse`、`marin` 和 `cedar`。一旦模型在会话中发出过音频，该会话的 `voice` 就无法再修改。为获得最佳质量，我们推荐使用 `marin` 或 `cedar`。

### 使用 WebRTC 处理音频

如果你使用 WebRTC 连接到 Realtime API，Realtime API 将作为客户端的 [peer connection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)。模型的音频输出作为[远程媒体流](hhttps://developer.mozilla.org/en-US/docs/Web/API/MediaStream)传递到你的客户端。模型的音频输入通过音频设备（[`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)）采集，媒体流作为轨道添加到 peer connection 中。

[WebRTC 连接指南](/guides/realtime-webrtc)中的示例代码展示了使用浏览器 API 配置本地和远程音频的基本示例：

```javascript
// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
const audioEl = document.createElement("audio");
audioEl.autoplay = true;
pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);
```

上面的代码片段实现了与 Realtime API 的简单交互，但还有更多可以做的事情。有关不同类型用户界面的更多示例，请查看 [WebRTC samples](https://github.com/webrtc/samples) 仓库。这些示例的在线演示也可以[在这里找到](https://webrtc.github.io/samples/)。

在浏览器中使用[媒体捕获和流](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API)可以让你实现麦克风静音和取消静音、选择输入设备等功能。

### WebRTC 中音频的客户端和服务器事件

默认情况下，WebRTC 客户端在发送音频输入之前不需要发送任何客户端事件。一旦将本地音频轨道添加到 peer connection，你的用户就可以直接开始说话了！

但是，当音频通过 peer connection 在客户端和服务器之间传输时，WebRTC 客户端仍会收到多个服务器发送的生命周期事件。例如：

*   当通过本地媒体轨道发送输入时，你将从服务器收到 [`input_audio_buffer.speech_started`]( https://developers.openai.com/api/reference/realtime-server-events/input_audio_buffer/speech_started) 事件。
*   当本地音频输入停止时，你将收到 [`input_audio_buffer.speech_stopped`]( https://developers.openai.com/api/reference/realtime-server-events/input_audio_buffer/speech_started) 事件。
*   你将收到[进行中的音频转录的 delta 事件]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio_transcript/delta)。
*   当模型完成转录并发送响应后，你将收到 [`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done) 事件。

操作 WebRTC API 的媒体流可能已经为你提供了所需的全部控制。但是，偶尔可能需要使用更底层的音频输入和输出接口。有关更多信息和粒度音频输入处理所需的事件列表，请参阅下面的 WebSocket 部分。

### 使用 WebSocket 处理音频

通过 WebSocket 发送和接收音频时，你需要做更多工作来从客户端发送媒体以及从服务器接收媒体。下面的表格描述了 WebSocket 会话期间通过 WebSocket 发送和接收音频所需的事件流程。

以下事件按生命周期顺序给出，但某些事件（如 `delta` 事件）可能会并发发生。

| 生命周期阶段 | 客户端事件 | 服务器事件 |
| --- | --- | --- |
| 会话初始化 | [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) | [`session.created`]( https://developers.openai.com/api/reference/realtime-server-events/session/created)[`session.updated`]( https://developers.openai.com/api/reference/realtime-server-events/session/updated) |
| 用户音频输入 | [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create)  
  （发送完整音频消息）[`input_audio_buffer.append`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/append)  
  （分块流式传输音频）[`input_audio_buffer.commit`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/commit)  
  （VAD 禁用时使用）[`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create)  
  （VAD 禁用时使用） | [`input_audio_buffer.speech_started`]( https://developers.openai.com/api/reference/realtime-server-events/input_audio_buffer/speech_started)[`input_audio_buffer.speech_stopped`]( https://developers.openai.com/api/reference/realtime-server-events/input_audio_buffer/speech_stopped)[`input_audio_buffer.committed`]( https://developers.openai.com/api/reference/realtime-server-events/input_audio_buffer/committed) |
| 服务器音频输出 | [`input_audio_buffer.clear`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/clear)  
  （VAD 禁用时使用） | [`conversation.item.added`]( https://developers.openai.com/api/reference/realtime-server-events/conversation/item/added)[`conversation.item.done`]( https://developers.openai.com/api/reference/realtime-server-events/conversation/item/done)[`response.created`]( https://developers.openai.com/api/reference/realtime-server-events/response/created)[`response.output_item.created`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_item/created)[`response.content_part.added`]( https://developers.openai.com/api/reference/realtime-server-events/response/content_part/added)[`response.output_audio.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio/delta)[`response.output_audio.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio/done)[`response.output_audio_transcript.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio_transcript/delta)[`response.output_audio_transcript.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio_transcript/done)[`response.output_text.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_text/delta)[`response.output_text.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_text/done)[`response.content_part.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/content_part/done)[`response.output_item.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_item/done)[`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done)[`rate_limits.updated`]( https://developers.openai.com/api/reference/realtime-server-events/rate_limits/updated) |

### 向服务器流式传输音频输入

要向服务器流式传输音频输入，你可以使用 [`input_audio_buffer.append`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/append) 客户端事件。此事件要求你通过 socket 向 Realtime API 发送 **Base64 编码的音频字节**块。每个块的大小不能超过 15 MB。

输入块的格式可以为整个会话或每个响应单独配置。

*   会话级别：[`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 中的 `session.input_audio_format`
*   响应级别：[`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 中的 `response.input_audio_format`

**将音频输入字节追加到对话中**

::: code-group
```javascript
import fs from 'fs';
import decodeAudio from 'audio-decode';

// Converts Float32Array of audio data to PCM16 ArrayBuffer
function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

// Converts a Float32Array to base64-encoded PCM16 data
base64EncodeAudio(float32Array) {
  const arrayBuffer = floatTo16BitPCM(float32Array);
  let binary = '';
  let bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000; // 32KB chunk size
  for (let i = 0; i < bytes.length; i += chunkSize) {
    let chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

// Fills the audio buffer with the contents of three files,
// then asks the model to generate a response.
const files = [
  './path/to/sample1.wav',
  './path/to/sample2.wav',
  './path/to/sample3.wav'
];

for (const filename of files) {
  const audioFile = fs.readFileSync(filename);
  const audioBuffer = await decodeAudio(audioFile);
  const channelData = audioBuffer.getChannelData(0);
  const base64Chunk = base64EncodeAudio(channelData);
  ws.send(JSON.stringify({
    type: 'input_audio_buffer.append',
    audio: base64Chunk
  }));
});

ws.send(JSON.stringify({type: 'input_audio_buffer.commit'}));
ws.send(JSON.stringify({type: 'response.create'}));
```

```python
import base64
import json
import struct
import soundfile as sf
from websocket import create_connection

# ... create websocket-client named ws ...

def float_to_16bit_pcm(float32_array):
    clipped = [max(-1.0, min(1.0, x)) for x in float32_array]
    pcm16 = b''.join(struct.pack('&lt;h', int(x * 32767)) for x in clipped)
    return pcm16

def base64_encode_audio(float32_array):
    pcm_bytes = float_to_16bit_pcm(float32_array)
    encoded = base64.b64encode(pcm_bytes).decode('ascii')
    return encoded

files = [
    './path/to/sample1.wav',
    './path/to/sample2.wav',
    './path/to/sample3.wav'
]

for filename in files:
    data, samplerate = sf.read(filename, dtype='float32')
    channel_data = data[:, 0] if data.ndim > 1 else data
    base64_chunk = base64_encode_audio(channel_data)

    # Send the client event
    event = {
        "type": "input_audio_buffer.append",
        "audio": base64_chunk
    }
    ws.send(json.dumps(event))
```

:::



### 发送完整音频消息

也可以创建包含完整音频录音的对话消息。使用 [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create) 客户端事件创建包含 `input_audio` 内容的消息。

**创建完整音频输入对话项**

::: code-group
```javascript
const fullAudio = "<a base64-encoded string of audio bytes>";

const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_audio",
        audio: fullAudio,
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
fullAudio = "<a base64-encoded string of audio bytes>"

event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_audio",
                "audio": fullAudio,
            }
        ],
    },
}

ws.send(json.dumps(event))
```

:::




### 处理 WebSocket 的音频输出

**要在客户端设备（如 Web 浏览器）上播放输出音频，我们建议使用 WebRTC 而非 WebSocket**。在不确定的网络条件下，WebRTC 向客户端设备发送媒体会更加稳健。

但要在使用 WebSocket 的服务器到服务器应用中处理音频输出，你需要监听 [`response.output_audio.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio/delta) 事件，其中包含来自模型的 Base64 编码音频数据块。你需要缓冲这些块并将它们写入文件，或者立即将它们流式传输到其他来源，如[使用 Twilio 的电话通话](https://www.twilio.com/en-us/blog/twilio-openai-realtime-api-launch-integration)。

请注意，[`response.output_audio.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio/done) 和 [`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done) 事件实际上不包含音频数据——只包含音频内容的转录文本。要获取实际的字节数据，你需要监听 [`response.output_audio.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/output_audio/delta) 事件。

输出块的格式可以为整个会话或每个响应单独配置。

*   会话级别：[`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 中的 `session.audio.output.format`
*   响应级别：[`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 中的 `response.audio.output.format`

**监听 response.output\_audio.delta 事件**

::: code-group
```javascript
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (serverEvent.type === "response.audio.delta") {
    // Access Base64-encoded audio chunks
    // console.log(serverEvent.delta);
  }
}

// Listen for server messages (WebSocket)
ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event.type == "response.audio.delta":
        # Access Base64-encoded audio chunks:
        # print(server_event.delta)
```

:::



## 图像输入

`gpt-realtime-2` 和 `gpt-realtime` 也支持图像输入。你可以在用户消息中附加图像作为内容部分，模型在响应时可以结合图像中的内容。

**向对话中添加图像**

```javascript
const base64Image = "<a base64-encoded string of image bytes>";

const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_image",
        image_url: `data:image/{format};base64,${base64Image}`,
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

## 语音活动检测

默认情况下，Realtime 会话启用了**语音活动检测（VAD）**，这意味着 API 将自动判断用户何时开始或停止说话并自动响应。

有关如何配置 VAD 的更多信息，请阅读我们的[语音活动检测](/guides/realtime-vad)指南。

### 禁用 VAD

可以通过在 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 客户端事件中将 `turn_detection` 设置为 `null` 来禁用 VAD。这对于需要对音频输入进行精细控制的界面很有用，例如[按键通话](https://en.wikipedia.org/wiki/Push-to-talk)界面。

当 VAD 被禁用时，客户端需要手动发出一些额外的客户端事件来触发音频响应：

*   手动发送 [`input_audio_buffer.commit`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/commit)，这将为对话创建一个新的用户输入项。
*   手动发送 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 以触发模型的音频响应。
*   在开始新的用户输入之前发送 [`input_audio_buffer.clear`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/clear)。

### 保留 VAD 但禁用自动响应

如果你想保留 VAD 模式但希望保留手动决定何时生成响应的能力，可以在 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 客户端事件中将 `turn_detection.interrupt_response` 和 `turn_detection.create_response` 设置为 `false`。这将保留 VAD 的所有行为但不会自动创建新的响应。客户端可以通过 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 事件手动触发响应。

这对于审核、输入验证或 RAG 模式很有用，在这些场景中你愿意用稍多的交互延迟来换取对输入的控制。

## 在默认对话之外创建响应

默认情况下，会话期间生成的所有响应都会添加到会话的对话状态（"默认对话"）中。但是，你可能希望在会话默认对话的上下文之外生成模型响应，或者同时生成多个响应。你可能还希望对模型生成响应时考虑哪些对话项有更精细的控制（例如只考虑最后 N 轮对话）。

通过在使用 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 客户端事件创建响应时将 `response.conversation` 字段设置为字符串 `none`，可以生成不添加到默认对话状态的"带外"响应。

创建带外响应时，你可能还需要某种方式来识别哪些服务器发送的事件与此响应相关。你可以为模型响应提供 `metadata`，帮助你识别正在为此客户端发送的事件生成哪个响应。

**创建带外模型响应**

::: code-group
```javascript
const prompt = `
Analyze the conversation so far. If it is related to support, output
"support". If it is related to sales, output "sales".
`;

const event = {
  type: "response.create",
  response: {
    // Setting to "none" indicates the response is out of band
    // and will not be added to the default conversation
    conversation: "none",

    // Set metadata to help identify responses sent back from the model
    metadata: { topic: "classification" },

    // Set any other available response fields
    output_modalities: [ "text" ],
    instructions: prompt,
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
prompt = """
Analyze the conversation so far. If it is related to support, output
"support". If it is related to sales, output "sales".
"""

event = {
    "type": "response.create",
    "response": {
        # Setting to "none" indicates the response is out of band,
        # and will not be added to the default conversation
        "conversation": "none",

        # Set metadata to help identify responses sent back from the model
        "metadata": { "topic": "classification" },

        # Set any other available response fields
        "output_modalities": [ "text" ],
        "instructions": prompt,
    },
}

ws.send(json.dumps(event))
```

:::




现在，当你监听 [`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done) 服务器事件时，可以识别带外响应的结果。

**识别带外模型响应**

::: code-group
```javascript
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (
    serverEvent.type === "response.done" &&
    serverEvent.response.metadata?.topic === "classification"
  ) {
    // this server event pertained to our OOB model response
    console.log(serverEvent.response.output[0]);
  }
}

// Listen for server messages (WebRTC)
dataChannel.addEventListener("message", handleEvent);

// Listen for server messages (WebSocket)
// ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    topic = ""

    # See if metadata is present
    try:
        topic = server_event.response.metadata.topic
    except AttributeError:
        print("topic not set")

    if server_event.type == "response.done" and topic == "classification":
        # this server event pertained to our OOB model response
        print(server_event.response.output[0])
```

:::



### 为响应创建自定义上下文

你还可以构建模型用于生成响应的自定义上下文，独立于默认/当前对话。这可以通过 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 客户端事件中的 `input` 数组来实现。你可以使用新的输入，或通过 ID 引用对话中已有的输入项。

**监听带有自定义上下文的带外模型响应**

::: code-group
```javascript
const event = {
  type: "response.create",
  response: {
    conversation: "none",
    metadata: { topic: "pizza" },
    output_modalities: [ "text" ],

    // Create a custom input array for this request with whatever context
    // is appropriate
    input: [
      // potentially include existing conversation items:
      {
        type: "item_reference",
        id: "some_conversation_item_id"
      },
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Is it okay to put pineapple on pizza?",
          },
        ],
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "conversation": "none",
        "metadata": { "topic": "pizza" },
        "output_modalities": [ "text" ],

        # Create a custom input array for this request with whatever
        # context is appropriate
        "input": [
            # potentially include existing conversation items:
            {
                "type": "item_reference",
                "id": "some_conversation_item_id"
            },

            # include new content as well
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Is it okay to put pineapple on pizza?",
                    }
                ],
            }
        ],
    },
}

ws.send(json.dumps(event))
```

:::



### 创建无上下文的响应

你还可以将响应插入默认对话中，忽略所有其他指令和上下文。通过将 `input` 设置为空数组来实现。

**将无上下文的模型响应插入默认对话**

::: code-group
```javascript
const prompt = `
Say exactly the following:
I'm a little teapot, short and stout!
This is my handle, this is my spout!
`;

const event = {
  type: "response.create",
  response: {
    // An empty input array removes existing context
    input: [],
    instructions: prompt,
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
prompt = """
Say exactly the following:
I'm a little teapot, short and stout!
This is my handle, this is my spout!
"""

event = {
    "type": "response.create",
    "response": {
        # An empty input array removes all prior context
        "input": [],
        "instructions": prompt,
    },
}

ws.send(json.dumps(event))
```

:::




## 函数调用

Realtime 模型还支持**函数调用**，使你能够执行自定义代码来扩展模型的能力。以下是其高层工作原理：

1.  在[更新会话]( https://developers.openai.com/api/reference/realtime-client-events/session/update)或[创建响应]( https://developers.openai.com/api/reference/realtime-client-events/response/create)时，你可以指定模型可调用的函数列表。
2.  如果在处理输入时，模型确定应该进行函数调用，它将向对话中添加表示函数调用参数的项。
3.  当客户端检测到包含函数调用参数的对话项时，它将使用这些参数执行自定义代码。
4.  当自定义代码执行完毕后，客户端将创建包含函数调用输出的新对话项，并请求模型进行响应。

让我们通过添加一个可调用函数来看看这在实践中是如何工作的，该函数将为模型的用户提供今日星座运势。我们将展示需要发送的客户端事件对象的结构，以及服务器将相应发出的内容。

### 配置可调用函数

首先，我们必须为模型提供一组可以根据用户输入调用的函数。可用函数可以在会话级别或单个响应级别进行配置。

*   会话级别：[`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 中的 `session.tools` 属性
*   响应级别：[`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 中的 `response.tools` 属性

以下是 `session.update` 的客户端事件负载示例，配置了一个星座运势生成函数，该函数接受一个参数（要生成运势的星座）：

[`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update)

```
{
  "type": "session.update",
  "session": {
    "tools": [
      {
        "type": "function",
        "name": "generate_horoscope",
        "description": "Give today's horoscope for an astrological sign.",
        "parameters": {
          "type": "object",
          "properties": {
            "sign": {
              "type": "string",
              "description": "The sign for the horoscope.",
              "enum": [
                "Aries",
                "Taurus",
                "Gemini",
                "Cancer",
                "Leo",
                "Virgo",
                "Libra",
                "Scorpio",
                "Sagittarius",
                "Capricorn",
                "Aquarius",
                "Pisces"
              ]
            }
          },
          "required": ["sign"]
        }
      }
    ],
    "tool_choice": "auto"
  }
}
```

函数和参数的 `description` 字段帮助模型决定是否调用该函数，以及在每个参数中包含什么数据。如果模型收到的输入表明用户想要查看星座运势，它将使用 `sign` 参数调用此函数。

### 检测模型何时想要调用函数

根据模型的输入，模型可能决定调用一个函数以生成最佳响应。假设我们的应用程序使用 [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create) 事件添加了以下对话项，然后创建了一个响应：

```
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      {
        "type": "input_text",
        "text": "What is my horoscope? I am an aquarius."
      }
    ]
  }
}
```

接着是一个 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 客户端事件来生成响应：

```
{
  "type": "response.create"
}
```

模型不会立即返回文本或音频响应，而是会生成一个包含应传递给开发者应用程序中函数的参数的响应。你可以使用 [`response.function_call_arguments.delta`]( https://developers.openai.com/api/reference/realtime-server-events/response/function_call_arguments/delta) 服务器事件监听函数调用参数的实时更新，但 `response.done` 也会包含我们调用函数所需的完整数据。

[`response.done`]( https://developers.openai.com/api/reference/realtime-server-events/response/done)

```
{
    "type": "response.done",
    "event_id": "event_AeqLA8iR6FK20L4XZs2P6",
    "response": {
        "object": "realtime.response",
        "id": "resp_AeqL8XwMUOri9OhcQJIu9",
        "status": "completed",
        "status_details": null,
        "output": [
            {
                "object": "realtime.item",
                "id": "item_AeqL8gmRWDn9bIsUM2T35",
                "type": "function_call",
                "status": "completed",
                "name": "generate_horoscope",
                "call_id": "call_sHlR7iaFwQ2YQOqm",
                "arguments": "{\"sign\":\"Aquarius\"}"
            }
        ],
        ...
    }
}
```

在服务器发出的 JSON 中，我们可以检测到模型想要调用自定义函数：

| 属性 | 函数调用用途 |
| --- | --- |
| `response.output[0].type` | 当设置为 `function_call` 时，表示此响应包含命名函数调用的参数。 |
| `response.output[0].name` | 要调用的已配置函数的名称，在本例中为 `generate_horoscope` |
| `response.output[0].arguments` | 包含函数参数的 JSON 字符串。在我们的例子中为 `"{\"sign\":\"Aquarius\"}"`。 |
| `response.output[0].call_id` | 此函数调用的系统生成 ID——**你需要此 ID 将函数调用结果传回模型**。 |

有了这些信息，我们可以在应用程序中执行代码来生成星座运势，然后将该信息提供给模型以便它生成响应。

### 将函数调用的结果提供给模型

收到模型返回的包含函数调用参数的响应后，你的应用程序可以执行满足函数调用的代码。这可以是任何你想要的操作，如调用外部 API 或访问数据库。

准备好将自定义代码的结果提供给模型后，你可以通过 [`conversation.item.create`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/create) 客户端事件创建包含结果的新对话项。

```
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_sHlR7iaFwQ2YQOqm",
    "output": "{\"horoscope\": \"You will soon meet a new friend.\"}"
  }
}
```

*   对话项类型为 `function_call_output`
*   `item.call_id` 与我们在上面 `response.done` 事件中获得的 ID 相同
*   `item.output` 是包含函数调用结果的 JSON 字符串

添加包含函数调用结果的对话项后，我们再次从客户端发出 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 事件。这将触发模型使用函数调用的数据生成响应。

```
{
  "type": "response.create"
}
```

## 错误处理

每当会话期间服务器遇到错误条件时，服务器会发出 [`error`]( https://developers.openai.com/api/reference/realtime-server-events/error) 事件。有时，这些错误可以追溯到你的应用程序发出的客户端事件。

与 HTTP 请求和响应不同（响应隐式地与客户端的请求关联），我们需要在客户端事件上使用 `event_id` 属性来了解其中一个事件何时在服务器上触发了错误条件。下面的代码展示了这种技术，其中客户端尝试发出不支持的事件类型。

```
const event = {
  event_id: "my_awesome_event",
  type: "scooby.dooby.doo",
};

dataChannel.send(JSON.stringify(event));
```

客户端发送的这个不成功的事件将发出如下错误事件：

```
{
  "type": "invalid_request_error",
  "code": "invalid_value",
  "message": "Invalid value: 'scooby.dooby.doo' ...",
  "param": "type",
  "event_id": "my_awesome_event"
}
```

## 中断和截断

在许多语音应用中，用户可以在模型说话时打断它。当 VAD 启用时，Realtime API 会处理中断——它检测到用户语音后，取消正在进行的响应，并开始新的响应。但在这种情况下，你希望模型知道它在哪里被打断，以便它能自然地继续对话（例如，如果用户说"最后那个是什么？"）。我们称之为**截断**模型的最后一个响应，即从对话中移除模型最后一个响应中未播放的部分。

在 WebRTC 和 SIP 连接中，服务器管理输出音频的缓冲区，因此知道在给定时刻已播放了多少音频。当用户中断时，服务器将自动截断未播放的音频。

在 WebSocket 连接中，客户端管理音频播放，因此必须停止播放并处理截断。以下是此过程的工作方式：

1.  客户端监控来自服务器的新 `input_audio_buffer.speech_started` 事件，这表示用户已开始说话。服务器将自动取消任何正在进行的模型响应，并发出 `response.cancelled` 事件。
2.  当客户端检测到此事件时，应立即停止播放当前正在播放的模型音频。它应记录在中断之前最后一个音频响应播放了多少。
3.  客户端应发送 [`conversation.item.truncate`]( https://developers.openai.com/api/reference/realtime-client-events/conversation/item/truncate) 事件，从对话中移除模型最后一个响应中未播放的部分。

以下是一个示例：

```
{
    "type": "conversation.item.truncate",
    "item_id": "item_1234", # this is the item ID of the model's last response
    "content_index": 0,
    "audio_end_ms": 1500 # truncate audio after 1.5 seconds
}
```

那么转录文本的截断呢？Realtime 模型没有足够的信息来精确对齐转录文本和音频，因此 `conversation.item.truncate` 会在给定位置切断音频并移除未播放部分的文本转录。这解决了移除未播放音频的问题，但不提供截断后的转录文本。

## 按键通话

Realtime API 默认使用语音活动检测（VAD），这意味着模型响应将由音频输入触发。你也可以通过禁用 VAD 并使用应用级别的门控来控制何时将音频输入发送给模型，从而实现按键通话交互，例如按住空格键捕获音频，然后在释放时触发响应。对于某些应用来说，这种方式效果出奇地好——它让用户控制交互，避免 VAD 失败，而且感觉很灵敏，因为我们不需要等待 VAD 超时。

在 WebSocket 和 WebRTC 上实现按键通话略有不同。在 Realtime API WebSocket 连接中，所有事件在同一通道中以相同顺序发送，而 WebRTC 连接对音频和控制事件有单独的通道。

### WebSocket

要在 WebSocket 连接中实现按键通话，你需要让客户端停止音频播放、处理中断并启动新的响应。以下是更详细的过程：

1.  通过在 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 事件中设置 `"turn_detection": null` 来关闭 VAD。
2.  按下时，开始在客户端录制音频。
    1.  如果模型有正在进行的响应，通过发送 [`response.cancel`]( https://developers.openai.com/api/reference/realtime-client-events/response/cancel) 事件取消它。
    2.  如果模型有正在进行的输出播放，立即停止播放并发送 `conversation.item.truncate` 事件，从对话中移除任何未播放的音频。
3.  释放时，发送 [`input_audio_buffer.append`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/append) 消息，将音频放入输入缓冲区。
4.  发送 [`input_audio_buffer.commit`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/commit) 事件，这将提交写入输入缓冲区的音频并启动输入转录（如果已启用）。
5.  然后通过 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 事件触发响应。

### WebRTC 和 SIP

使用 WebRTC 实现按键通话类似，但必须显式清除输入音频缓冲区。以下是过程：

1.  通过在 [`session.update`]( https://developers.openai.com/api/reference/realtime-client-events/session/update) 事件中设置 `"turn_detection": null` 来关闭 VAD。
2.  按下时，发送 [`input_audio_buffer.clear`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/clear) 事件以清除之前的任何音频输入。
    1.  如果模型有正在进行的响应，通过发送 [`response.cancel`]( https://developers.openai.com/api/reference/realtime-client-events/response/cancel) 事件取消它。
    2.  如果模型有正在进行的输出播放，发送 [`output_audio_buffer.clear`]( https://developers.openai.com/api/reference/realtime-client-events/output_audio_buffer/clear) 事件清除未播放的音频，这也会截断对话。
3.  释放时，发送 [`input_audio_buffer.commit`]( https://developers.openai.com/api/reference/realtime-client-events/input_audio_buffer/commit) 事件，这将提交写入输入缓冲区的音频并启动输入转录（如果已启用）。
4.  然后通过 [`response.create`]( https://developers.openai.com/api/reference/realtime-client-events/response/create) 事件触发响应。
