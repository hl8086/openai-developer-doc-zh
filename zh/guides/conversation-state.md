
OpenAI 提供了几种管理对话状态的方式，这对于在对话中的多条消息或多轮交互之间保留信息非常重要。

当排查 GPT-5.4 将中间更新视为最终答案的情况时，请验证您的集成是否正确保留了助手消息的 `phase` 字段。详情请参阅 [Phase 参数](/guides/reasoning#phase-parameter)。

## 手动管理对话状态

虽然每个文本生成请求都是独立且无状态的，但您仍然可以通过在文本生成请求中提供额外的消息作为参数来实现**多轮对话**。以一个敲门笑话为例：

**手动构建过去的对话**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "user",
            content: "knock knock.",
        },
        {
            role: "assistant",
            content: "Who's there?",
        },
        {
            role: "user",
            content: "Orange.",
        },
    ],
});

console.log(response.choices[0].message.content);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "knock knock."},
        {"role": "assistant", "content": "Who's there?"},
        {"role": "user", "content": "Orange."},
    ],
)

print(response.choices[0].message.content)
```

:::

**手动构建过去的对话**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
        { role: "user", content: "knock knock." },
        { role: "assistant", content: "Who's there?" },
        { role: "user", content: "Orange." },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini",
    input=[
        {"role": "user", "content": "knock knock."},
        {"role": "assistant", "content": "Who's there?"},
        {"role": "user", "content": "Orange."},
    ],
)

print(response.output_text)
```

:::

通过使用交替的 `user` 和 `assistant` 消息，您可以在一次请求中捕获对话的先前状态。

要手动在生成的响应之间共享上下文，请将模型先前的响应输出作为输入包含进来，并将该输入附加到您的下一个请求中。

在以下示例中，我们要求模型讲一个笑话，然后再要求讲另一个笑话。以这种方式将先前的响应附加到新请求中，有助于确保对话感觉自然并保留先前交互的上下文。

**使用 Chat Completions API 手动管理对话状态。**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

let history = [
    {
        role: "user",
        content: "tell me a joke",
    },
];

const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: history,
});

console.log(completion.choices[0].message.content);

history.push(completion.choices[0].message);
history.push({
    role: "user",
    content: "tell me another",
});

const secondCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: history,
});

console.log(secondCompletion.choices[0].message.content);
```

```python
from openai import OpenAI

client = OpenAI()

history = [
    {
        "role": "user",
        "content": "tell me a joke"
    }
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=history,
)

print(response.choices[0].message.content)

history.append(response.choices[0].message)
history.append({ "role": "user", "content": "tell me another" })

second_response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=history,
)

print(second_response.choices[0].message.content)
```

:::

**使用 Responses API 手动管理对话状态。**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

let history = [
    {
        role: "user",
        content: "tell me a joke",
    },
];

const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: history,
    store: true,
});

console.log(response.output_text);

// Add the response to the history
history = [
    ...history,
    ...response.output.map((el) => {
        // TODO: Remove this step
        delete el.id;
        return el;
    }),
];

history.push({
    role: "user",
    content: "tell me another",
});

const secondResponse = await openai.responses.create({
    model: "gpt-4o-mini",
    input: history,
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

history = [
    {
        "role": "user",
        "content": "tell me a joke"
    }
]

response = client.responses.create(
    model="gpt-4o-mini",
    input=history,
    store=False
)

print(response.output_text)

# Add the response to the conversation
history += [{"role": el.role, "content": el.content} for el in response.output]

history.append({ "role": "user", "content": "tell me another" })

second_response = client.responses.create(
    model="gpt-4o-mini",
    input=history,
    store=False
)

print(second_response.output_text)
```

:::

## 用于对话状态的 OpenAI API

我们的 API 使自动管理对话状态变得更加容易，因此您不必在每轮对话中手动传递输入。

我们建议使用 [Responses API](/guides/conversation-state?api-mode=responses)。因为它是有状态的，跨对话管理上下文只需一个简单的参数。

如果您使用的是 Chat Completions 端点，则需要如上文所述手动管理状态。

### 使用 Conversations API

[Conversations API]( https://developers.openai.com/api/reference/conversations/create) 与 [Responses API]( https://developers.openai.com/api/reference/responses/create) 配合使用，将对话状态持久化为一个具有自己持久标识符的长期运行对象。创建对话对象后，您可以跨会话、设备或任务继续使用它。

对话存储项目，这些项目可以是消息、工具调用、工具输出和其他数据。

**创建对话**

```python
conversation = openai.conversations.create()
```

在多轮交互中，您可以将 `conversation` 传递给后续响应以持久化状态并在后续响应之间共享上下文，而不必将多个响应项目链接在一起。

**使用 Conversations 和 Responses API 管理对话状态**

```python
response = openai.responses.create(
  model="gpt-4.1",
  input=[{"role": "user", "content": "What are the 5 Ds of dodgeball?"}],
  conversation="conv_689667905b048191b4740501625afd940c7533ace33a2dab"
)
```

### 从上一个响应传递上下文

管理对话状态的另一种方式是使用 `previous_response_id` 参数在生成的响应之间共享上下文。此参数允许您链接响应并创建线程化对话。

**通过传递上一个响应 ID 来链接跨轮次的响应**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: "tell me a joke",
    store: true,
});

console.log(response.output_text);

const secondResponse = await openai.responses.create({
    model: "gpt-4o-mini",
    previous_response_id: response.id,
    input: [{"role": "user", "content": "explain why this is funny."}],
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini",
    input="tell me a joke",
)
print(response.output_text)

second_response = client.responses.create(
    model="gpt-4o-mini",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "explain why this is funny."}],
)
print(second_response.output_text)
```

:::

在以下示例中，我们要求模型讲一个笑话。然后单独要求模型解释为什么这个笑话好笑，模型拥有所有必要的上下文来提供一个好的回答。

**使用 Responses API 手动管理对话状态**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: "tell me a joke",
    store: true,
});

console.log(response.output_text);

const secondResponse = await openai.responses.create({
    model: "gpt-4o-mini",
    previous_response_id: response.id,
    input: [{"role": "user", "content": "explain why this is funny."}],
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini",
    input="tell me a joke",
)
print(response.output_text)

second_response = client.responses.create(
    model="gpt-4o-mini",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "explain why this is funny."}],
)
print(second_response.output_text)
```

:::

#### WebSocket 模式下的 `previous_response_id`

如果您使用的是 [Responses API WebSocket 模式](/guides/websocket-mode)，延续使用与 HTTP 模式相同的 `previous_response_id` 语义，但通过持久套接字和重复的 `response.create` 事件进行。

连接本地缓存目前将最近的上一个响应保存在内存中以实现低延迟延续。如果无法解析未缓存的 ID，请发送一个新轮次，将 `previous_response_id` 设置为 `null` 并传递完整的输入上下文。

模型响应的数据保留

响应对象默认保存 30 天。可以在仪表板 [日志](https://platform.openai.com/logs?api=responses) 页面查看或通过 API [检索]( https://developers.openai.com/api/reference/responses/get)。您可以在创建 Response 时将 `store` 设置为 `false` 来禁用此行为。

对话对象及其中的项目不受 30 天 TTL 的限制。附加到对话的任何响应都将持久化其项目，没有 30 天 TTL 限制。

OpenAI 不会在未经您明确同意的情况下使用通过 API 发送的数据来训练我们的模型——[了解更多](/guides/your-data)。

即使使用 `previous_response_id`，链中所有先前的输入 token 在 API 中仍按输入 token 计费。

## 管理上下文窗口

理解上下文窗口将帮助您成功创建线程化对话并管理跨模型交互的状态。

**上下文窗口**是单个请求中可以使用的最大 token 数。此最大 token 数包括输入、输出和推理 token。要了解您的模型的上下文窗口，请参阅[模型详情](/models)。

### 管理文本生成的上下文

随着您的输入变得更加复杂，或者您在对话中包含更多轮次，您需要考虑**输出 token** 和**上下文窗口**限制。模型输入和输出以 [**token**](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) 为单位计量，token 从输入中解析以分析其内容和意图，并组装以呈现逻辑输出。模型在文本生成请求的生命周期内对 token 使用有限制。

*   **输出 token** 是模型响应提示时生成的 token。每个模型对输出 token 有不同的[限制](/models)。例如，`gpt-4o-2024-08-06` 最多可以生成 16,384 个输出 token。
*   **上下文窗口**描述了可用于输入和输出 token（对于某些模型，还包括[推理 token](/guides/reasoning)）的总 token 数。比较我们模型的[上下文窗口限制](/models)。例如，`gpt-4o-2024-08-06` 的总上下文窗口为 128k token。

如果您创建了一个非常大的提示——通常是通过为模型包含额外的上下文、数据或示例——您可能会超出模型分配的上下文窗口，这可能导致输出被截断。

使用 [tokenizer 工具](https://platform.openai.com/tokenizer)（基于 [tiktoken 库](https://github.com/openai/tiktoken) 构建）来查看特定文本字符串中有多少 token。

例如，当使用 [o1 模型](/guides/reasoning) 向 [Chat Completions]( https://developers.openai.com/api/reference/chat) 发出 API 请求时，以下 token 计数将计入上下文窗口总量：

*   输入 token（您在 [Chat Completions]( https://developers.openai.com/api/reference/chat) 的 `messages` 数组中包含的输入）
*   输出 token（响应您的提示而生成的 token）
*   推理 token（模型用于规划响应的 token）

例如，当使用启用推理的模型（如 [o1 模型](/guides/reasoning)）向 [Responses API]( https://developers.openai.com/api/reference/responses) 发出 API 请求时，以下 token 计数将计入上下文窗口总量：

*   输入 token（您在 [Responses API]( https://developers.openai.com/api/reference/responses) 的 `input` 数组中包含的输入）
*   输出 token（响应您的提示而生成的 token）
*   推理 token（模型用于规划响应的 token）

超出上下文窗口限制生成的 token 可能会在 API 响应中被截断。

![上下文窗口可视化](https://cdn.openai.com/API/docs/images/context-window.png)

您可以使用 [tokenizer 工具](https://platform.openai.com/tokenizer) 来估算您的消息将使用多少 token。

### 压缩

详细的压缩指南现在位于[压缩](/guides/compaction)。

*   关于 `/responses` 中的 `context_management` 和 `compact_threshold`，请参阅[服务端压缩](/guides/compaction#server-side-compaction)。
*   关于显式压缩控制，请参阅[独立压缩端点](/guides/compaction#standalone-compact-endpoint) 和 [`/responses/compact` API 参考]( https://developers.openai.com/api/reference/responses/compact)。

## 后续步骤

有关更多具体示例和用例，请访问 [OpenAI Cookbook](/cookbook)，或了解更多关于使用 API 扩展模型能力的信息：

*   [使用 Structured Outputs 接收 JSON 响应](/guides/structured-outputs)
*   [使用函数调用扩展模型](/guides/function-calling)
*   [启用流式传输以获取实时响应](/guides/streaming-responses)
*   [构建计算机使用代理](/guides/tools-computer-use)
