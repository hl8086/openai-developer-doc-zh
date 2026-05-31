<!-- Source: https://developers.openai.com/api/docs/guides/streaming-responses -->

默认情况下，当你向 OpenAI API 发送请求时，我们会在生成模型的完整输出后，通过单个 HTTP 响应将其发送回来。当生成较长的输出时，等待响应可能需要一些时间。流式响应允许你在模型继续生成完整响应的同时，开始打印或处理模型输出的开头部分。

本指南重点介绍通过服务器发送事件（SSE）的 HTTP 流式传输（`stream=true`）。如需通过 `previous_response_id` 实现增量输入的持久 WebSocket 传输，请参阅 [Responses API WebSocket 模式](/api/docs/guides/websocket-mode)。

## 启用流式传输

要开始流式传输响应，请在向 Responses 端点发送请求时设置 `stream=True`：

```javascript
import { OpenAI } from "openai";
const client = new OpenAI();

const stream = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream: true,
});

for await (const event of stream) {
    console.log(event);
}
```
```python
from openai import OpenAI
client = OpenAI()

stream = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream=True,
)

for event in stream:
    print(event)
```
```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

var responses = client.CreateResponseStreamingAsync([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Say 'double bubble bath' ten times fast."),
    ]),
]);

await foreach (var response in responses)
{
    if (response is StreamingResponseOutputTextDeltaUpdate delta)
    {
        Console.Write(delta.Delta);
    }
}
```

Responses API 使用语义事件进行流式传输。每个事件都有预定义的类型和模式，因此你可以监听你关心的事件。

有关事件类型的完整列表，请参阅[流式传输 API 参考](/api/docs/api-reference/responses-streaming)。以下是一些示例：

```
type StreamingEvent =
	| ResponseCreatedEvent
	| ResponseInProgressEvent
	| ResponseFailedEvent
	| ResponseCompletedEvent
	| ResponseOutputItemAdded
	| ResponseOutputItemDone
	| ResponseContentPartAdded
	| ResponseContentPartDone
	| ResponseOutputTextDelta
	| ResponseOutputTextAnnotationAdded
	| ResponseTextDone
	| ResponseRefusalDelta
	| ResponseRefusalDone
	| ResponseFunctionCallArgumentsDelta
	| ResponseFunctionCallArgumentsDone
	| ResponseFileSearchCallInProgress
	| ResponseFileSearchCallSearching
	| ResponseFileSearchCallCompleted
	| ResponseCodeInterpreterInProgress
	| ResponseCodeInterpreterCallCodeDelta
	| ResponseCodeInterpreterCallCodeDone
	| ResponseCodeInterpreterCallInterpreting
	| ResponseCodeInterpreterCallCompleted
	| Error
```

流式 Chat Completions 相当简单。但是，我们建议使用 [Responses API 进行流式传输](/api/docs/guides/streaming-responses?api-mode=responses)，因为我们在设计时就考虑了流式传输。Responses API 使用语义事件进行流式传输，并且是类型安全的。

### 流式传输 chat completion

要流式传输补全结果，请在调用 Chat Completions 或旧版 Completions 端点时设置 `stream=True`。这将返回一个对象，以纯数据服务器发送事件的形式流式返回响应。

响应以事件流的形式分块增量发送。你可以使用 `for` 循环遍历事件流，如下所示：

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const stream = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
        {
            role: "user",
            content: "Say 'double bubble bath' ten times fast." ,
        }
    ],
    stream: true,
});

for await (const chunk of stream) {
    console.log(chunk);
    console.log(chunk.choices[0].delta);
    console.log("****************");
}
```
```python
from openai import OpenAI
client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {
            "role": "user",
            "content": "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream=True,
)

for chunk in stream:
    print(chunk)
    print(chunk.choices[0].delta)
    print("****************")
```

## 读取响应

如果你使用我们的 SDK，每个事件都是一个类型化的实例。你也可以使用事件的 `type` 属性来识别各个事件。

一些关键的生命周期事件只会发出一次，而其他事件会在响应生成过程中多次发出。流式传输文本时常见的监听事件有：

```
- `response.created`
- `response.output_text.delta`
- `response.completed`
- `error`
```

有关可监听事件的完整列表，请参阅[流式传输 API 参考](/api/docs/api-reference/responses-streaming)。

当你流式传输 chat completion 时，响应包含 `delta` 字段而不是 `message` 字段。`delta` 字段可以包含角色令牌、内容令牌或为空。

```
{ role: 'assistant', content: '', refusal: null }
****************
{ content: 'Why' }
****************
{ content: " don't" }
****************
{ content: ' scientists' }
****************
{ content: ' trust' }
****************
{ content: ' atoms' }
****************
{ content: '?\n\n' }
****************
{ content: 'Because' }
****************
{ content: ' they' }
****************
{ content: ' make' }
****************
{ content: ' up' }
****************
{ content: ' everything' }
****************
{ content: '!' }
****************
{}
****************
```

如果只想流式传输 chat completion 的文本响应，代码如下：

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const stream = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
        {
            role: "user",
            content: "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream: true,
});

for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```
```python
from openai import OpenAI
client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {
            "role": "user",
            "content": "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

## 高级用例

对于更高级的用例，如流式工具调用，请查看以下专门指南：

*   [流式函数调用](/api/docs/guides/function-calling#streaming)
*   [流式结构化输出](/api/docs/guides/structured-outputs#streaming)

## 内容审核风险

请注意，在生产应用中流式传输模型输出会使内容审核变得更加困难，因为部分补全结果可能更难以评估。这可能会对批准的使用方式产生影响。
