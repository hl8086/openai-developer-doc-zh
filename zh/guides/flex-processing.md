
Flex processing 以较慢的响应时间和偶尔的资源不可用为代价，为 [Responses]( https://developers.openai.com/api/reference/responses) 或 [Chat Completions]( https://developers.openai.com/api/reference/chat) 请求提供更低的成本。它非常适合非生产环境或较低优先级的任务，例如模型评估、数据增强和异步工作负载。

Token [定价](/pricing)与 [Batch API 费率](/guides/batch)相同，并可通过[提示缓存](/guides/prompt-caching)获得额外折扣。

Flex processing 目前处于 Beta 阶段，模型可用性有限。支持的模型列在[定价页面](/pricing?latest-pricing=flex)上。

## API 用法

要使用 Flex processing，请在 API 请求中将 `service_tier` 参数设置为 `flex`：

**Flex processing 示例**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI({
    timeout: 15 * 1000 * 60, // Increase default timeout to 15 minutes
});

const response = await client.responses.create({
    model: "gpt-5.5",
    instructions: "List and describe all the metaphors used in this book.",
    input: "&lt;very long text of book here>",
    service_tier: "flex",
}, { timeout: 15 * 1000 * 60 });

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI(
    # increase default timeout to 15 minutes (from 10 minutes)
    timeout=900.0
)

# you can override the max timeout per request as well
response = client.with_options(timeout=900.0).responses.create(
    model="gpt-5.5",
    instructions="List and describe all the metaphors used in this book.",
    input="&lt;very long text of book here>",
    service_tier="flex",
)

print(response.output_text)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "List and describe all the metaphors used in this book.",
    "input": "&lt;very long text of book here>",
    "service_tier": "flex"
  }'
```

:::

**Flex processing 示例**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI({
    timeout: 15 * 1000 * 60,
});

const response = await client.chat.completions.create({
    model: "gpt-5.5",
    messages: [
        { role: "developer", content: "List and describe all the metaphors used in this book." },
        { role: "user", content: "&lt;very long text of book here>" },
    ],
    service_tier: "flex",
}, { timeout: 15 * 1000 * 60 });

console.log(response.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI(
    timeout=900.0
)

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "developer", "content": "List and describe all the metaphors used in this book."},
        {"role": "user", "content": "&lt;very long text of book here>"},
    ],
    service_tier="flex",
    timeout=900.0,
)

print(response.choices[0].message.content)
```

```curl
curl https://api.openai.com/v1/chat/completions   -H "Content-Type: application/json"   -H "Authorization: Bearer $OPENAI_API_KEY"   -d '{
    "model": "gpt-5.5",
    "messages": [
      {"role": "developer", "content": "List and describe all the metaphors used in this book."},
      {"role": "user", "content": "&lt;very long text of book here>"}
    ],
    "service_tier": "flex"
  }' --max-time 900
```

:::

#### API 请求超时

由于 Flex processing 的处理速度较慢，请求超时的可能性更大。以下是处理超时的一些注意事项：

*   **默认超时时间**：使用官方 OpenAI SDK 发起 API 请求时，默认超时时间为 **10 分钟**。对于较长的提示或复杂任务，您可能需要增加此超时时间。
*   **配置超时时间**：每个 SDK 都提供了增加超时时间的参数。在 Python 和 JavaScript SDK 中，该参数为 `timeout`，如上面的代码示例所示。
*   **自动重试**：OpenAI SDK 会自动对返回 `408 Request Timeout` 错误代码的请求重试两次，然后再抛出异常。

## 资源不可用错误

Flex processing 有时可能缺乏足够的资源来处理您的请求，导致返回 `429 Resource Unavailable` 错误代码。**发生这种情况时不会向您收费。**

请考虑实施以下策略来处理资源不可用错误：

*   **使用指数退避重试请求**：对于能够容忍延迟并希望最小化成本的工作负载，实施指数退避是合适的，因为当有更多容量可用时，您的请求最终可以完成。有关实现细节，请参阅[此 cookbook]( https://cdn.openai.com/API/docs/cookbook/examples/how_to_handle_rate_limits?utm_source=chatgpt.com#retrying-with-exponential-backoff)。
    
*   **使用标准处理重试请求**：当收到资源不可用错误时，如果偶尔的较高成本对于确保您的用例成功完成是值得的，请实施使用标准处理的重试策略。为此，请在重试请求中将 `service_tier` 设置为 `auto`，或移除 `service_tier` 参数以使用项目的默认模式。
