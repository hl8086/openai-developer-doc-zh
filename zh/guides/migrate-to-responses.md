
[Responses API]( https://developers.openai.com/api/reference/responses) 是我们新的 API 基础原语，是 [Chat Completions]( https://developers.openai.com/api/reference/chat) 的演进版本，为你的集成带来了更简洁的体验和强大的智能体原语。

**虽然 Chat Completions 仍然受支持，但我们建议所有新项目使用 Responses。**

## 关于 Responses API

Responses API 是一个统一的接口，用于构建强大的类智能体应用程序。它包含：

*   内置工具，如 [web search](/guides/tools-web-search)、[file search](/guides/tools-file-search)、[computer use](/guides/tools-computer-use)、[code interpreter](/guides/tools-code-interpreter) 和 [remote MCPs](/guides/tools-remote-mcp)。
*   无缝的多轮交互，允许你传递之前的响应以获得更高准确度的推理结果。
*   原生多模态支持，包括文本和图像。

## Responses 的优势

Responses API 相比 Chat Completions 有以下优势：

*   **更好的性能**：使用推理模型（如 GPT-5）配合 Responses 将比 Chat Completions 获得更好的模型智能。我们的内部评估显示在 SWE-bench 上使用相同提示和设置时有 3% 的提升。
*   **默认支持智能体**：Responses API 是一个智能体循环，允许模型在一次 API 请求中调用多个工具，如 `web_search`、`image_generation`、`file_search`、`code_interpreter`、远程 MCP 服务器以及你自己的自定义函数。
*   **更低的成本**：由于改进的缓存利用率（在内部测试中与 Chat Completions 相比提升了 40% 到 80%），成本更低。
*   **有状态上下文**：使用 `store: true` 来维护轮次间的状态，保留轮次间的推理和工具上下文。
*   **灵活的输入**：传递字符串作为输入或消息列表；使用 instructions 进行系统级指导。
*   **加密推理**：在不使用有状态功能的情况下仍然受益于高级推理。
*   **面向未来**：为即将推出的模型做好了准备。

| 功能 | Chat Completions API | Responses API |
| --- | --- | --- |
| 文本生成 |  |  |
| 音频 |  | 即将推出 |
| 视觉 |  |  |
| 结构化输出 |  |  |
| 函数调用 |  |  |
| 网络搜索 |  |  |
| 文件搜索 |  |  |
| 计算机使用 |  |  |
| 代码解释器 |  |  |
| MCP |  |  |
| 图像生成 |  |  |
| 推理摘要 |  |  |

### 示例

查看 Responses API 在特定场景中与 Chat Completions API 的对比。

#### Messages 与 Items

两个 API 都能轻松地从我们的模型生成输出。Chat Completions 的输入和结果是一个 _Messages_ 数组，而 Responses API 使用 _Items_。Item 是多种类型的联合体，代表模型操作的各种可能性。`message` 是 Item 的一种类型，`function_call` 或 `function_call_output` 也是。与 Chat Completions 的 Message 将多个关注点粘合在一个对象中不同，Items 彼此独立，更好地代表了模型上下文的基本单元。

此外，Chat Completions 可以使用 `n` 参数返回多个并行生成结果作为 `choices`。在 Responses 中，我们移除了这个参数，只保留一个生成结果。

Chat Completions API

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
model="gpt-5",
messages=[
{
"role": "user",
"content": "Write a one-sentence bedtime story about a unicorn."
}
]
)

print(completion.choices[0].message.content)
```

Responses API

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
model="gpt-5",
input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
```

当你从 Responses API 获得响应时，字段略有不同。你收到的不是 `message`，而是一个带有自己 `id` 的类型化 `response` 对象。Responses 默认会被存储。Chat completions 对新账户默认存储。要在使用任一 API 时禁用存储，请设置 `store: false`。

从这些 API 返回的对象略有不同。在 Chat Completions 中，你收到一个 `choices` 数组，每个包含一个 `message`。在 Responses 中，你收到一个标记为 `output` 的 Items 数组。

Chat Completions API

```
{
  "id": "chatcmpl-C9EDpkjH60VPPIB86j2zIhiR8kWiC",
  "object": "chat.completion",
  "created": 1756315657,
  "model": "gpt-5-2025-08-07",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Under a blanket of starlight, a sleepy unicorn tiptoed through moonlit meadows, gathering dreams like dew to tuck beneath its silver mane until morning.",
        "refusal": null,
        "annotations": []
      },
      "finish_reason": "stop"
    }
  ],
  ...
}
```

Responses API

```
{
  "id": "resp_68af4030592c81938ec0a5fbab4a3e9f05438e46b5f69a3b",
  "object": "response",
  "created_at": 1756315696,
  "model": "gpt-5-2025-08-07",
  "output": [
    {
      "id": "rs_68af4030baa48193b0b43b4c2a176a1a05438e46b5f69a3b",
      "type": "reasoning",
      "content": [],
      "summary": []
    },
    {
      "id": "msg_68af40337e58819392e935fb404414d005438e46b5f69a3b",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "type": "output_text",
          "annotations": [],
          "logprobs": [],
          "text": "Under a quilt of moonlight, a drowsy unicorn wandered through quiet meadows, brushing blossoms with her glowing horn so they sighed soft lullabies that carried every dreamer gently to sleep."
        }
      ],
      "role": "assistant"
    }
  ],
  ...
}
```

### 其他差异

*   Responses 默认会被存储。Chat completions 对新账户默认存储。要在任一 API 中禁用存储，请设置 `store: false`。
*   [推理](/guides/reasoning)模型在 Responses API 中有更丰富的体验，具有[改进的工具使用](/guides/reasoning#keeping-reasoning-items-in-context)。从 GPT-5.4 开始，Chat Completions 中使用 `reasoning: none` 时不支持工具调用。
*   结构化输出的 API 形状不同。在 Responses 中使用 `text.format` 代替 `response_format`。在[结构化输出](/guides/structured-outputs)指南中了解更多。
*   函数调用的 API 形状不同，包括请求中的函数配置和响应中返回的函数调用。在[函数调用指南](/guides/function-calling)中查看完整差异。
*   Responses SDK 有一个 `output_text` 辅助方法，而 Chat Completions SDK 没有。
*   在 Chat Completions 中，对话状态必须手动管理。Responses API 兼容 [Conversations API](/guides/conversation-state?api-mode=responses#using-the-conversations-api) 用于持久化对话，或者可以传递 `previous_response_id` 来轻松地将 Responses 链接在一起。

## 从 Chat Completions 迁移

### 1\. 更新生成端点

首先将你的生成端点从 `post /v1/chat/completions` 更新为 `post /v1/responses`。

如果你没有使用函数或多模态输入，那就完成了！简单的消息输入在两个 API 之间是兼容的：

**Web search 工具**

::: code-group
```bash
INPUT='[
  { "role": "system", "content": "You are a helpful assistant." },
  { "role": "user", "content": "Hello!" }
]'

curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-5\",
    \"messages\": $INPUT
  }"

curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-5\",
    \"input\": $INPUT
  }"
```

```javascript
const context = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
];

const completion = await client.chat.completions.create({
  model: 'gpt-5',
  messages: messages
});

const response = await client.responses.create({
  model: "gpt-5",
  input: context
});
```

```python
context = [
  { "role": "system", "content": "You are a helpful assistant." },
  { "role": "user", "content": "Hello!" }
]

completion = client.chat.completions.create(
  model="gpt-5",
  messages=messages
)

response = client.responses.create(
  model="gpt-5",
  input=context
)
```

:::







Chat Completions

使用 Chat Completions，你需要创建一个消息数组，为每个角色指定不同的角色和内容。

**从模型生成文本**

::: code-group
```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await client.chat.completions.create({
  model: 'gpt-5',
  messages: [
    { 'role': 'system', 'content': 'You are a helpful assistant.' },
    { 'role': 'user', 'content': 'Hello!' }
  ]
});
console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(completion.choices[0].message.content)
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
      "model": "gpt-5",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
      ]
  }'
```

:::





Responses

使用 Responses，你可以在顶层分离 instructions 和 input。API 形状与 Chat Completions 类似，但语义更清晰。

**从模型生成文本**

::: code-group
```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: 'gpt-5',
  instructions: 'You are a helpful assistant.',
  input: 'Hello!'
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    instructions="You are a helpful assistant.",
    input="Hello!"
)
print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
      "model": "gpt-5",
      "instructions": "You are a helpful assistant.",
      "input": "Hello!"
  }'
```

:::





### 2\. 更新 item 定义



Chat Completions

使用 Chat Completions，你需要创建一个消息数组，为每个角色指定不同的角色和内容。

**从模型生成文本**

::: code-group
```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await client.chat.completions.create({
  model: 'gpt-5',
  messages: [
    { 'role': 'system', 'content': 'You are a helpful assistant.' },
    { 'role': 'user', 'content': 'Hello!' }
  ]
});
console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(completion.choices[0].message.content)
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
      "model": "gpt-5",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
      ]
  }'
```

:::





Responses

使用 Responses，你可以在顶层分离 instructions 和 input。API 形状与 Chat Completions 类似，但语义更清晰。

**从模型生成文本**

::: code-group
```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: 'gpt-5',
  instructions: 'You are a helpful assistant.',
  input: 'Hello!'
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    instructions="You are a helpful assistant.",
    input="Hello!"
)
print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
      "model": "gpt-5",
      "instructions": "You are a helpful assistant.",
      "input": "Hello!"
  }'
```

:::





### 3\. 更新多轮对话

如果你的应用程序中有多轮对话，请更新你的上下文逻辑。



Chat Completions

在 Chat Completions 中，你必须自己存储和管理上下文。

**多轮对话**

::: code-group
```javascript
let messages = [
    { 'role': 'system', 'content': 'You are a helpful assistant.' },
    { 'role': 'user', 'content': 'What is the capital of France?' }
  ];
const res1 = await client.chat.completions.create({
  model: 'gpt-5',
  messages
});

messages = messages.concat([res1.choices[0].message]);
messages.push({ 'role': 'user', 'content': 'And its population?' });

const res2 = await client.chat.completions.create({
  model: 'gpt-5',
  messages
});
```

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of France?"}
]
res1 = client.chat.completions.create(model="gpt-5", messages=messages)

messages += [res1.choices[0].message]
messages += [{"role": "user", "content": "And its population?"}]

res2 = client.chat.completions.create(model="gpt-5", messages=messages)
```

:::





Responses

使用 Responses，模式类似，你可以将一个响应的输出传递给另一个响应的输入。

**多轮对话**

::: code-group
```python
context = [
    { "role": "role", "content": "What is the capital of France?" }
]
res1 = client.responses.create(
    model="gpt-5",
    input=context,
)

// Append the first response's output to context
context += res1.output

// Add the next user message
context += [
    { "role": "role", "content": "And it's population?" }
]

res2 = client.responses.create(
    model="gpt-5",
    input=context,
)
```

```javascript
let context = [
  { role: "role", content: "What is the capital of France?" }
];

const res1 = await client.responses.create({
  model: "gpt-5",
  input: context,
});

// Append the first response's output to context
context = context.concat(res1.output);

// Add the next user message
context.push({ role: "role", content: "And its population?" });

const res2 = await client.responses.create({
  model: "gpt-5",
  input: context,
});
```

:::




作为简化，我们还构建了一种方式，通过传递 id 来简单引用之前响应的输入和输出。你可以使用 `previous_response_id` 来形成相互构建的响应链或在历史记录中创建分支。

**多轮对话**

::: code-group
```javascript
const res1 = await client.responses.create({
  model: 'gpt-5',
  input: 'What is the capital of France?',
  store: true
});

const res2 = await client.responses.create({
  model: 'gpt-5',
  input: 'And its population?',
  previous_response_id: res1.id,
  store: true
});
```

```python
res1 = client.responses.create(
    model="gpt-5",
    input="What is the capital of France?",
    store=True
)

res2 = client.responses.create(
    model="gpt-5",
    input="And its population?",
    previous_response_id=res1.id,
    store=True
)
```

:::





### 4\. 决定何时使用有状态功能

一些组织——例如有零数据保留（ZDR）要求的组织——由于合规性或数据保留政策，无法以有状态方式使用 Responses API。为了支持这些情况，OpenAI 提供了加密推理项，允许你保持工作流无状态的同时仍然受益于推理项。

要禁用有状态功能，但仍然利用推理：

*   在 [store 字段]( https://developers.openai.com/api/reference/responses/create#responses_create-store)中设置 `store: false`
*   在 [include 字段]( https://developers.openai.com/api/reference/responses/create#responses_create-include)中添加 `["reasoning.encrypted_content"]`

API 将返回推理 token 的加密版本，你可以像普通推理项一样在未来的请求中传回。对于 ZDR 组织，OpenAI 会自动强制 store=false。当请求包含 encrypted\_content 时，它会在内存中解密（永远不会写入磁盘），用于生成下一个响应，然后安全丢弃。任何新的推理 token 会立即加密并返回给你，确保不会持久化任何中间状态。

### 5\. 更新函数定义

Chat Completions 和 Responses 之间函数定义有两个细微但值得注意的差异。

1.  在 Chat Completions 中，函数使用外部标记多态性定义，而在 Responses 中，它们是内部标记的。
2.  在 Chat Completions 中，函数默认是非严格的，而在 Responses API 中，函数默认_是_严格的。

右侧的 Responses API 函数示例在功能上等同于左侧的 Chat Completions 示例。

Chat Completions API

```
{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Determine weather in my location",
        "strict": true,
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
            },
          },
          "additionalProperties": false,
          "required": [
            "location",
            "unit"
          ]
        }
      }
  }
```

Responses API

```
{
      "type": "function",
      "name": "get_weather",
      "description": "Determine weather in my location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
          },
        },
        "additionalProperties": false,
        "required": [
          "location",
          "unit"
        ]
      }
  }
```

#### 遵循函数调用最佳实践

在 Responses 中，工具调用及其输出是两种不同类型的 Items，通过 `call_id` 关联。有关函数调用在 Responses 中如何工作的更多详情，请参阅[工具调用文档](/guides/function-calling#function-tool-example)。

### 6\. 更新结构化输出定义

在 Responses API 中，定义结构化输出已从 `response_format` 移至 `text.format`：



Chat Completions

**结构化输出**

::: code-group
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "gpt-5",
  "messages": [
    {
      "role": "user",
      "content": "Jane, 54 years old",
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "person",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": false
      }
    }
  },
  "verbosity": "medium",
  "reasoning_effort": "medium"
}'
```

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-5",
  messages=[
    {
      "role": "user",
      "content": "Jane, 54 years old",
    }
  ],
  response_format={
    "type": "json_schema",
    "json_schema": {
      "name": "person",
      "strict": True,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": False
      }
    }
  },
  verbosity="medium",
  reasoning_effort="medium"
)
```

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-5",
  messages: [
    {
      "role": "user",
      "content": "Jane, 54 years old",
    }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "person",
      strict: true,
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1
          },
          age: {
            type: "number",
            minimum: 0,
            maximum: 130
          }
        },
        required: [
          name,
          age
        ],
        additionalProperties: false
      }
    }
  },
  verbosity: "medium",
  reasoning_effort: "medium"
});
```

:::





Responses

**结构化输出**

::: code-group
```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "gpt-5",
  "input": "Jane, 54 years old",
  "text": {
    "format": {
      "type": "json_schema",
      "name": "person",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": false
      }
    }
  }
}'
```

```python
response = client.responses.create(
  model="gpt-5",
  input="Jane, 54 years old", 
  text={
    "format": {
      "type": "json_schema",
      "name": "person",
      "strict": True,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": False
      }
    }
  }
)
```

```javascript
const response = await openai.responses.create({
  model: "gpt-5",
  input: "Jane, 54 years old",
  text: {
    format: {
      type: "json_schema",
      name: "person",
      strict: true,
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1
          },
          age: {
            type: "number",
            minimum: 0,
            maximum: 130
          }
        },
        required: [
          name,
          age
        ],
        additionalProperties: false
      }
    },
  }
});
```

:::





### 7\. 升级到原生工具

如果你的应用程序有可以从 OpenAI 原生[工具](/guides/tools)中受益的用例，你可以更新你的工具调用以开箱即用地使用 OpenAI 的工具。



Chat Completions

使用 Chat Completions，你无法原生使用 OpenAI 的工具，必须自己编写。

**Web search 工具**

::: code-group
```javascript
async function web_search(query) {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(`https://api.example.com/search?q=${query}`);
    const data = await res.json();
    return data.results;
}

const completion = await client.chat.completions.create({
  model: 'gpt-5',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Who is the current president of France?' }
  ],
  functions: [
    {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query']
      }
    }
  ]
});
```

```python
import requests

def web_search(query):
    r = requests.get(f"https://api.example.com/search?q={query}")
    return r.json().get("results", [])

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who is the current president of France?"}
    ],
    functions=[
        {
            "name": "web_search",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"]
            }
        }
    ]
)
```

```bash
curl https://api.example.com/search \
  -G \
  --data-urlencode "q=your+search+term" \
  --data-urlencode "key=$SEARCH_API_KEY"
```

:::





Responses

使用 Responses，你只需指定你感兴趣的工具即可。

**Web search 工具**

::: code-group
```javascript
const answer = await client.responses.create({
    model: 'gpt-5.5',
    input: 'Who is the current president of France?',
    tools: [{ type: 'web_search' }]
});

console.log(answer.output_text);
```

```python
answer = client.responses.create(
    model="gpt-5.5",
    input="Who is the current president of France?",
    tools=[{"type": "web_search"}]
)

print(answer.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Who is the current president of France?",
    "tools": [{"type": "web_search"}]
  }'
```

:::






## 增量迁移

Responses API 是 Chat Completions API 的超集。Chat Completions API 也将继续受到支持。因此，如果需要，你可以增量采用 Responses API。你可以将受益于改进推理模型的用户流程迁移到 Responses API，同时将其他流程保留在 Chat Completions API 上，直到你准备好进行完整迁移。

作为最佳实践，我们鼓励所有用户迁移到 Responses API，以利用 OpenAI 的最新功能和改进。

## Assistants API

基于 [Assistants API]( https://developers.openai.com/api/reference/assistants) 测试版的开发者反馈，我们将关键改进整合到了 Responses API 中，使其更灵活、更快速、更易于使用。Responses API 代表了在 OpenAI 上构建智能体的未来方向。

我们现在在 Responses API 中有类似 Assistant 和 Thread 的对象。在[迁移指南](/guides/assistants/migration)中了解更多。自 2025 年 8 月 26 日起，我们将弃用 Assistants API，日落日期为 2026 年 8 月 26 日。
