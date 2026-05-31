
Token 计数允许你在将请求发送给模型之前，确定该请求将使用多少输入 token。用途包括：

*   **优化提示词**以适应上下文限制
*   在调用 API 之前**估算成本**
*   根据大小**路由请求**（例如，将较小的提示词发送给更快的模型）
*   **避免意外**——不再需要基于字符数的估算来处理图片和文件

[输入 token 计数端点](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count)接受与 [Responses API]( https://developers.openai.com/api/reference/responses/create) 相同的输入格式。传入文本、消息、图片、文件、工具或对话——API 将返回模型实际接收到的精确计数。

## 为什么使用 token 计数 API？

像 [tiktoken](https://github.com/openai/tiktoken) 这样的本地分词器适用于纯文本，但存在局限性：

*   **图片和文件**不受支持——像 `characters / 4` 这样的估算是不准确的
*   **工具和 schema** 会增加难以在本地计算的 token
*   **模型特定行为**可能改变分词方式（例如推理、缓存）

Token 计数 API 能处理所有这些情况。使用与发送给 `responses.create` 相同的 payload，即可获得准确计数。然后将结果用于消息验证或成本估算流程。

## 计算基本消息中的 token

**简单文本输入**

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5",
    input="Tell me a joke."
)
print(response.input_tokens)
```
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5",
  input: "Tell me a joke.",
});

console.log(response.input_tokens);
```
```curl
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": "Tell me a joke."
  }'
```
```cli
openai responses:input-tokens count \
  --model gpt-5 \
  --input "Tell me a joke." \
  --raw-output \
  --transform input_tokens
```

## 计算对话中的 token

**多轮对话**

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5",
    input=[
        {"role": "user", "content": "What is 2 + 2?"},
        {"role": "assistant", "content": "2 + 2 equals 4."},
        {"role": "user", "content": "What about 3 + 3?"},
    ],
)
print(response.input_tokens)
```
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5",
  input: [
    { role: "user", content: "What is 2 + 2?" },
    { role: "assistant", content: "2 + 2 equals 4." },
    { role: "user", content: "What about 3 + 3?" },
  ],
});

console.log(response.input_tokens);
```
```curl
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [
      {"role": "user", "content": "What is 2 + 2?"},
      {"role": "assistant", "content": "2 + 2 equals 4."},
      {"role": "user", "content": "What about 3 + 3?"}
    ]
  }'
```
```cli
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5
input:
  - role: user
    content: What is 2 + 2?
  - role: assistant
    content: 2 + 2 equals 4.
  - role: user
    content: What about 3 + 3?
YAML
```

## 计算带指令的 token

**带系统指令的输入**

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5",
    instructions="You are a helpful assistant that explains concepts simply.",
    input="Explain quantum computing in one sentence.",
)
print(response.input_tokens)
```
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5",
  instructions:
    "You are a helpful assistant that explains concepts simply.",
  input: "Explain quantum computing in one sentence.",
});

console.log(response.input_tokens);
```
```curl
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "instructions": "You are a helpful assistant that explains concepts simply.",
    "input": "Explain quantum computing in one sentence."
  }'
```
```cli
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5
instructions: You are a helpful assistant that explains concepts simply.
input: Explain quantum computing in one sentence.
YAML
```

## 计算带图片的 token

图片根据尺寸和细节级别消耗 token。Token 计数 API 返回精确计数——无需猜测。

**带图片的输入**

```python
from openai import OpenAI

client = OpenAI()

# Use file_id from uploaded file, or image_url for a URL
response = client.responses.input_tokens.count(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_image", "image_url": "https://example.com/chart.png"},
                {"type": "input_text", "text": "Summarize this chart."},
            ],
        }
    ],
)
print(response.input_tokens)
```
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_image",
          image_url: "https://example.com/chart.png",
        },
        { type: "input_text", text: "Summarize this chart." },
      ],
    },
  ],
});

console.log(response.input_tokens);
```
```curl
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [{
      "role": "user",
      "content": [
        {"type": "input_image", "image_url": "https://example.com/chart.png"},
        {"type": "input_text", "text": "Summarize this chart."}
      ]
    }]
  }'
```
```cli
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5
input:
  - role: user
    content:
      - type: input_image
        image_url: https://example.com/chart.png
      - type: input_text
        text: Summarize this chart.
YAML
```

你可以使用 `file_id`（来自 [Files API]( https://developers.openai.com/api/reference/files)）或 `image_url`（URL 或 base64 data URL）。详见[图片与视觉](/guides/images-vision)。

## 计算带工具的 token

工具定义（函数 schema、MCP 服务器等）会向上下文添加 token。将它们与输入一起计算：

**带函数工具的输入**

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5",
    tools=[
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {"location": {"type": "string"}},
                "required": ["location"],
            },
        }
    ],
    input="What is the weather in San Francisco?",
)
print(response.input_tokens)
```
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5",
  tools: [
    {
      type: "function",
      name: "get_weather",
      description: "Get the current weather in a location",
      parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
      },
    },
  ],
  input: "What is the weather in San Francisco?",
});

console.log(response.input_tokens);
```
```curl
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "tools": [{
      "type": "function",
      "name": "get_weather",
      "description": "Get the current weather in a location",
      "parameters": {
        "type": "object",
        "properties": {"location": {"type": "string"}},
        "required": ["location"]
      }
    }],
    "input": "What is the weather in San Francisco?"
  }'
```
```cli
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5
tools:
  - type: function
    name: get_weather
    description: Get the current weather in a location
    parameters:
      type: object
      properties:
        location:
          type: string
      required:
        - location
input: What is the weather in San Francisco?
YAML
```

## 计算带文件的 token

支持[文件输入](/guides/pdf-files)——目前为 PDF。像使用 `responses.create` 一样传入 `file_id`、`file_url` 或 `file_data`。Token 计数反映模型完整处理后的输入。

## API 参考

有关完整参数和响应格式，请参阅[计算输入 token API 参考](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count)。端点为：

```
POST /v1/responses/input_tokens
```

响应包含 `input_tokens`（整数）和 `object: "response.input_tokens"`。
