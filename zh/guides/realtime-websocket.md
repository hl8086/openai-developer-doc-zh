
[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 是一种广泛支持的实时数据传输 API，非常适合在服务器到服务器的应用中连接 OpenAI Realtime API。对于浏览器和移动客户端，我们建议通过 [WebRTC](/guides/realtime-webrtc) 进行连接。

在与 Realtime 的服务器到服务器集成中，您的后端系统将通过 WebSocket 直接连接到 Realtime API。您可以使用[标准 API 密钥](https://platform.openai.com/settings/organization/api-keys)来验证此连接，因为令牌仅在您的安全后端服务器上可用。

![直接连接到 Realtime API](https://openaidevs.retool.com/api/file/464d4334-c467-4862-901b-d0c6847f003a)

## 通过 WebSocket 连接

以下是通过 WebSocket 连接到 Realtime API 的几个示例。除了使用下面的 WebSocket URL 之外，您还需要使用 OpenAI API 密钥传递身份验证头。如果您的应用程序分配了[安全标识符](/guides/safety-best-practices#implement-safety-identifiers)，请在 `OpenAI-Safety-Identifier` 头中传递终端用户的稳定、隐私保护标识符。

可以在浏览器中使用临时 API 令牌配合 WebSocket，如 [WebRTC 连接指南](/guides/realtime-webrtc)中所示，但如果您从浏览器或移动应用等客户端连接，在大多数情况下 WebRTC 将是更稳健的解决方案。

ws module (Node.js)websocket-client (Python)WebSocket (browsers)

ws module (Node.js)

**使用 ws 模块连接 (Node.js)**

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Safety-Identifier": "hashed-user-id",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```

websocket-client (Python)

**使用 websocket-client 连接 (Python)**

```python
# example requires websocket-client library:
# pip install websocket-client

import os
import json
import websocket

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Safety-Identifier: hashed-user-id",
]


def on_open(ws):
    print("Connected to server.")


def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))


ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()
```

WebSocket (browsers)

**使用标准 WebSocket 连接 (浏览器)**

```javascript
/*
Note that in client-side environments like web browsers, we recommend
using WebRTC instead. It is possible, however, to use the standard
WebSocket interface in browser-like environments like Deno and
Cloudflare Workers.
*/

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-realtime-2",
  [
    "realtime",
    // Auth
    "openai-insecure-api-key." + OPENAI_API_KEY,
    // Optional
    "openai-organization." + OPENAI_ORG_ID,
    "openai-project." + OPENAI_PROJECT_ID,
  ]
);

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(message.data);
});
```

## 发送和接收事件

Realtime API 会话通过[客户端发送事件]( https://developers.openai.com/api/reference/realtime_client_events/session)（由您作为开发者发出）和[服务器发送事件]( https://developers.openai.com/api/reference/realtime_server_events/error)（由 Realtime API 创建以指示会话生命周期事件）的组合来管理。

通过 WebSocket，您将以 JSON 序列化的文本字符串形式发送和接收事件，如下面的 Node.js 示例所示（相同的原理适用于其他 WebSocket 库）：

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Safety-Identifier": "hashed-user-id",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");

  // Send client events over the WebSocket once connected
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: "Be extra nice today!",
      },
    })
  );
});

// Listen for and parse server events
ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```

WebSocket 接口可能是与 Realtime 模型交互的最底层接口，您需要负责通过套接字连接发送和处理 Base64 编码的音频块。

要了解如何通过 WebSocket 发送和接收音频，请参阅 [Realtime 对话指南](/guides/realtime-conversations#handling-audio-with-websockets)。
