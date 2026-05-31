
音频模型可以理解语音输入、生成语音输出，或在同一次交互中同时完成两者。本指南解释了 OpenAI 音频文档中使用的术语。当你准备好选择实现路径时，请从[实时音频概览](/guides/realtime)开始。

## 音频模态

一个音频应用程序会组合以下一种或多种模态：

| 模态 | 含义 | 常见用例 |
| --- | --- | --- |
| 音频输入 | 模型接收来自用户或应用的声音。 | 语音代理、转录、翻译。 |
| 音频输出 | 模型或 API 返回语音音频。 | 语音代理、文本转语音、语音回复。 |
| 文本转录 | 语音转换为文本。 | 字幕、通话分析、搜索、记录。 |
| 文本提示 | 文本控制模型说什么或做什么。 | 语音生成、脚本化语音流程、提示词。 |

## 常见语音任务

**语音转文本**将语音转换为文本。用于字幕、笔记、转录、分析、搜索和无障碍访问。转录可以是基于请求的文件处理，也可以是实时音频的流式处理。

**文本转语音**将文本转换为语音音频。用于旁白、助手、无障碍访问和生成的语音回复。语音生成可以在模型产出时流式返回音频。

**语音到语音**让模型在一个低延迟会话中监听、推理和说话。用于对话式语音代理，当助手需要响应、调用工具或维护会话状态时使用。

**语音翻译**监听一种语言的语音，并返回另一种语言的翻译语音或转录输出。当翻译需要在音频到达时持续开始时，使用专用的实时翻译会话。

## 流式传输与延迟

流式传输意味着客户端和服务在交互仍在进行时交换部分输入或输出。当用户期望即时反馈时，流式传输非常有用，例如实时字幕、通话、语音代理和翻译。

更低的延迟需要实时连接、更精细的音频处理，以及能够发出部分事件的会话模型。基于请求的 API 对于文件上传和非交互式工作更简单，但它们不支持相同的实时交互模式。

## 基于请求的 API 与实时会话

OpenAI 支持两种主要的音频架构：

| 架构 | 适用场景 | 示例 |
| --- | --- | --- |
| 基于请求的音频 API | 你有一个文件、一个文本输入或一个有界请求。 | [语音转文本](/guides/speech-to-text)、[文本转语音](/guides/text-to-speech)。 |
| 实时会话 | 音频是实时的，应用需要低延迟事件。 | [语音代理](/guides/voice-agents)、[翻译](/guides/realtime-translation)、[转录](/guides/realtime-transcription)。 |
| 多模态聊天补全 | 你正在为现有的聊天流程添加音频功能。 | [音频输入或输出](#add-audio-to-your-existing-application)。 |

有关构建路径的指导，请参阅[实时音频概览](/guides/realtime)。

## 为现有应用添加音频功能

[`gpt-realtime-2`](/models/gpt-realtime-2) 和 [`gpt-audio-1.5`](/models/gpt-audio-1.5) 等模型是原生多模态的，这意味着它们可以理解和生成音频与文本作为输入和输出。

对于浏览器中的实时语音到语音交互，请使用 JavaScript SDK 中的实时会话开始：

**启动实时语音会话**

```javascript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
  name: "Assistant",
  instructions: "You are a helpful voice assistant.",
});

const session = new RealtimeSession(agent, {
  model: "gpt-realtime-2",
});

await session.connect({
  apiKey: "ek_...(ephemeral key from your server)",
});
```

此示例使用 JavaScript，因为浏览器语音代理通过 WebRTC 从客户端连接。对于 Python 语音工作流，请使用[语音代理指南](/guides/voice-agents)，其中涵盖了链式语音管道。

如果你已经有一个使用 [Chat Completions 端点]( https://developers.openai.com/api/reference/chat/)的基于文本的 LLM 应用，你可能想要添加音频功能。例如，如果你的聊天应用支持文本输入，你可以添加音频输入和输出：在 `modalities` 数组中包含 `audio`，并使用音频模型，如 [`gpt-audio-1.5`](/models/gpt-audio-1.5)。

[Responses API]( https://developers.openai.com/api/reference/responses) 文档目前描述的是文本和图像输入与文本输出。对于这种音频聊天模式，请使用 Chat Completions 配合支持音频的模型。



模型的音频输出

**创建类似人类的音频回复**

::: code-group
```javascript
import { writeFileSync } from "node:fs";
import OpenAI from "openai";

const openai = new OpenAI();

// Generate an audio response to the given prompt
const response = await openai.chat.completions.create({
  model: "gpt-audio-1.5",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [
    {
      role: "user",
      content: "Is a golden retriever a good family dog?"
    }
  ],
  store: true,
});

// Inspect returned data
console.log(response.choices[0]);

// Write audio data to a file
writeFileSync(
  "dog.wav",
  Buffer.from(response.choices[0].message.audio.data, 'base64'),
  { encoding: "utf-8" }
);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-audio-1.5",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": "Is a golden retriever a good family dog?"
        }
    ]
)

print(completion.choices[0])

wav_bytes = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav_bytes)
```

```curl
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "model": "gpt-audio-1.5",
      "modalities": ["text", "audio"],
      "audio": { "voice": "alloy", "format": "wav" },
      "messages": [
        {
          "role": "user",
          "content": "Is a golden retriever a good family dog?"
        }
      ]
    }'
```

:::





模型的音频输入

**使用音频输入来提示模型**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

// Fetch an audio file and convert it to a base64 string
const url = "https://cdn.openai.com/API/docs/audio/alloy.wav";
const audioResponse = await fetch(url);
const buffer = await audioResponse.arrayBuffer();
const base64str = Buffer.from(buffer).toString("base64");

const response = await openai.chat.completions.create({
  model: "gpt-audio-1.5",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What is in this recording?" },
        { type: "input_audio", input_audio: { data: base64str, format: "wav" }}
      ]
    }
  ],
  store: true,
});

console.log(response.choices[0]);
```

```python
import base64
import requests
from openai import OpenAI

client = OpenAI()

# Fetch the audio file and convert it to a base64 encoded string
url = "https://cdn.openai.com/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')

completion = client.chat.completions.create(
    model="gpt-audio-1.5",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "input_audio",
                    "input_audio": {
                        "data": encoded_string,
                        "format": "wav"
                    }
                }
            ]
        },
    ]
)

print(completion.choices[0].message)
```

```curl
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "model": "gpt-audio-1.5",
      "modalities": ["text", "audio"],
      "audio": { "voice": "alloy", "format": "wav" },
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "What is in this recording?" },
            { 
              "type": "input_audio", 
              "input_audio": { 
                "data": "&lt;base64 bytes here>", 
                "format": "wav" 
              }
            }
          ]
        }
      ]
    }'
```

:::





