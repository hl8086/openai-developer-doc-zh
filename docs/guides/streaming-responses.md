<!-- Source: https://developers.openai.com/api/docs/guides/streaming-responses -->

By default, when you make a request to the OpenAI API, we generate the model’s entire output before sending it back in a single HTTP response. When generating long outputs, waiting for a response can take time. Streaming responses lets you start printing or processing the beginning of the model’s output while it continues generating the full response.

This guide focuses on HTTP streaming (`stream=true`) over server-sent events (SSE). For persistent WebSocket transport with incremental inputs via `previous_response_id`, see [the Responses API WebSocket mode](/api/docs/guides/websocket-mode).

## Enable streaming

To start streaming responses, set `stream=True` in your request to the Responses endpoint:

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

The Responses API uses semantic events for streaming. Each event is typed with a predefined schema, so you can listen for events you care about.

For a full list of event types, see the [API reference for streaming](/api/docs/api-reference/responses-streaming). Here are a few examples:

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

Streaming Chat Completions is fairly straightforward. However, we recommend using the [Responses API for streaming](/api/docs/guides/streaming-responses?api-mode=responses), as we designed it with streaming in mind. The Responses API uses semantic events for streaming and is type-safe.

### Stream a chat completion

To stream completions, set `stream=True` when calling the Chat Completions or legacy Completions endpoints. This returns an object that streams back the response as data-only server-sent events.

The response is sent back incrementally in chunks with an event stream. You can iterate over the event stream with a `for` loop, like this:

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

## Read the responses

If you’re using our SDK, every event is a typed instance. You can also identity individual events using the `type` property of the event.

Some key lifecycle events are emitted only once, while others are emitted multiple times as the response is generated. Common events to listen for when streaming text are:

```
- `response.created`
- `response.output_text.delta`
- `response.completed`
- `error`
```

For a full list of events you can listen for, see the [API reference for streaming](/api/docs/api-reference/responses-streaming).

When you stream a chat completion, the responses has a `delta` field rather than a `message` field. The `delta` field can hold a role token, content token, or nothing.

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

To stream only the text response of your chat completion, your code would like this:

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

## Advanced use cases

For more advanced use cases, like streaming tool calls, check out the following dedicated guides:

*   [Streaming function calls](/api/docs/guides/function-calling#streaming)
*   [Streaming structured output](/api/docs/guides/structured-outputs#streaming)

## Moderation risk

Note that streaming the model’s output in a production application makes it more difficult to moderate the content of the completions, as partial completions may be more difficult to evaluate. This may have implications for approved usage.