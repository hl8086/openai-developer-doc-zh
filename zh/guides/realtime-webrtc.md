# WebRTC

> 通过 WebRTC 连接到 Realtime API 构建实时应用。

[WebRTC](https://webrtc.org/) 是一组用于构建实时应用的强大标准接口。OpenAI Realtime API 支持通过 WebRTC 对等连接来连接实时模型。

对于基于浏览器的语音到语音应用，我们建议从 [Voice agents](/guides/voice-agents) 开始，该文档涵盖了 Agents SDK 用于管理 Realtime 会话的高级辅助工具和 API。WebRTC 接口功能强大且灵活，但比 Agents SDK 更底层。

从客户端（如 Web 浏览器或移动设备）连接到 Realtime 模型时，我们建议使用 WebRTC 而非 WebSocket，以获得更一致的性能。

有关在 WebRTC 之上构建用户界面的更多指导，请[参阅 MDN 上的文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)。

## 概述

Realtime API 支持两种从浏览器连接到 Realtime API 的机制：使用临时 API 密钥（[通过 OpenAI REST API 生成]( https://developers.openai.com/api/reference/realtime-sessions)），或通过新的统一接口。通常，使用统一接口更简单，但会将你的应用服务器置于会话初始化的关键路径中。

### 使用统一接口连接

使用统一接口初始化 WebRTC 连接的流程如下（假设客户端为 Web 浏览器）：

1.  浏览器使用其 WebRTC 对等连接的 SDP 数据向开发者控制的服务器发起请求。
2.  服务器将该 SDP 与其会话配置组合成多部分表单，发送到 OpenAI Realtime API，并使用其[标准 API 密钥](https://platform.openai.com/settings/organization/api-keys)进行身份验证。

#### 通过统一接口创建会话

要通过统一接口创建 Realtime API 会话，你需要构建一个小型服务端应用（或集成到现有应用中），向 `/v1/realtime/calls` 发起请求。你将在后端服务器上使用[标准 API 密钥](https://platform.openai.com/settings/organization/api-keys)来验证此请求。

以下是一个简单的 Node.js [express](https://expressjs.com/) 服务器示例，用于创建 Realtime API 会话：

```javascript
import express from "express";

const app = express();

// Parse raw SDP payloads posted from the browser
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2",
  audio: { output: { voice: "marin" } },
});

// An endpoint which creates a Realtime API session.
app.post("/session", async (req, res) => {
  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: fd,
    });
    // Send back the SDP we received from the OpenAI REST API
    const sdp = await r.text();
    res.send(sdp);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000);
```

如果你的应用为每个终端用户分配了[安全标识符](/guides/safety-best-practices#implement-safety-identifiers)，请在此服务端请求中将其作为 `OpenAI-Safety-Identifier` 头部包含。使用稳定的、保护隐私的值，例如经过哈希处理的内部用户 ID。该头部应由你的可信后端设置，而非由浏览器设置。

#### 连接到服务器

在浏览器中，你可以使用标准 WebRTC API 通过你的应用服务器连接到 Realtime API。客户端直接将其 SDP 数据 POST 到你的服务器。

```javascript
// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
audioElement.current = document.createElement("audio");
audioElement.current.autoplay = true;
pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);

// Set up data channel for sending and receiving events
const dc = pc.createDataChannel("oai-events");

// Start the session using the Session Description Protocol (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch("/session", {
  method: "POST",
  body: offer.sdp,
  headers: {
    "Content-Type": "application/sdp",
  },
});

const answer = {
  type: "answer",
  sdp: await sdpResponse.text(),
};
await pc.setRemoteDescription(answer);
```

### 使用临时令牌连接

使用临时 API 密钥初始化 WebRTC 连接的流程如下（假设客户端为 Web 浏览器）：

1.  浏览器向开发者控制的服务器发起请求以生成临时 API 密钥。
2.  开发者的服务器使用[标准 API 密钥](https://platform.openai.com/settings/organization/api-keys)从 [OpenAI REST API]( https://developers.openai.com/api/reference/realtime-sessions) 请求临时密钥，并将新密钥返回给浏览器。
3.  浏览器使用临时密钥作为 [WebRTC 对等连接](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)直接与 OpenAI Realtime API 进行身份验证会话。

![通过 WebRTC 连接到 Realtime](https://openaidevs.retool.com/api/file/55b47800-9aaf-48b9-90d5-793ab227ddd3)

#### 创建临时令牌

要创建在客户端使用的临时令牌，你需要构建一个小型服务端应用（或集成到现有应用中），向 [OpenAI REST API]( https://developers.openai.com/api/reference/realtime-sessions) 发起请求以获取临时密钥。你将在后端服务器上使用[标准 API 密钥](https://platform.openai.com/settings/organization/api-keys)来验证此请求。

以下是一个简单的 Node.js [express](https://expressjs.com/) 服务器示例，使用 REST API 生成临时 API 密钥：

```javascript
import express from "express";

const app = express();

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: "marin",
      },
    },
  },
});

// An endpoint which would work with the client code above - it returns
// the contents of a REST API request to this protected endpoint
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: sessionConfig,
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000);
```

你可以在任何能够发送和接收 HTTP 请求的平台上创建类似的服务器端点。只需确保**你只在服务器上使用标准 OpenAI API 密钥，而不是在浏览器中使用。**

使用临时令牌时，请在创建客户端密钥的服务端请求中设置 `OpenAI-Safety-Identifier`。Realtime API 会将该标识符绑定到生成的临时令牌上，因此浏览器在之后使用该令牌连接时无需再发送安全标识符。

#### 连接到服务器

在浏览器中，你可以使用标准 WebRTC API 通过临时令牌连接到 Realtime API。客户端首先从你的服务器端点获取令牌，然后将其 SDP 数据（附带临时令牌）POST 到 Realtime API。

```javascript
// Get a session token for OpenAI Realtime API
const tokenResponse = await fetch("/token");
const data = await tokenResponse.json();
const EPHEMERAL_KEY = data.value;

// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
audioElement.current = document.createElement("audio");
audioElement.current.autoplay = true;
pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);

// Set up data channel for sending and receiving events
const dc = pc.createDataChannel("oai-events");

// Start the session using the Session Description Protocol (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
  method: "POST",
  body: offer.sdp,
  headers: {
    Authorization: `Bearer ${EPHEMERAL_KEY}`,
    "Content-Type": "application/sdp",
  },
});

const answer = {
  type: "answer",
  sdp: await sdpResponse.text(),
};
await pc.setRemoteDescription(answer);
```

## 发送和接收事件

Realtime API 会话通过[客户端发送的事件]( https://developers.openai.com/api/reference/realtime_client_events/session)（由你作为开发者发出）和[服务端发送的事件]( https://developers.openai.com/api/reference/realtime_server_events/error)（由 Realtime API 创建以指示会话生命周期事件）的组合来管理。

通过 WebRTC 连接到 Realtime 模型时，你不需要像使用 [WebSocket](/guides/realtime-websocket) 那样以细粒度的方式处理来自模型的音频事件。如果按照上述方式配置，WebRTC 对等连接对象会为你完成所有这些工作。

要发送和接收其他客户端和服务端事件，你可以使用 WebRTC 对等连接的[数据通道](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels)。

```javascript
// This is the data channel set up in the browser code above...
const dc = pc.createDataChannel("oai-events");

// Listen for server events
dc.addEventListener("message", (e) => {
  const event = JSON.parse(e.data);
  console.log(event);
});

// Send client events
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "hello there!",
      },
    ],
  },
};
dc.send(JSON.stringify(event));
```

要了解更多关于管理 Realtime 对话的信息，请参阅 [Realtime 对话指南](/guides/realtime-conversations)。

[Realtime Console - 在这个轻量级示例应用中体验 WebRTC Realtime API。](https://github.com/openai/openai-realtime-console/)
