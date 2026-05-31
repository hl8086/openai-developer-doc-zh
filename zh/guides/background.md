
像 [Codex](https://openai.com/index/introducing-codex/) 和 [Deep Research](https://openai.com/index/introducing-deep-research/) 这样的智能体表明，推理模型可能需要几分钟来解决复杂问题。后台模式使你能够在 GPT-5.2 和 GPT-5.2 pro 等模型上可靠地执行长时间运行的任务，而无需担心超时或其他连接问题。

后台模式以异步方式启动这些任务，开发者可以轮询响应对象来检查状态。要在后台启动响应生成，请在 API 请求中将 `background` 设置为 `true`：

由于后台模式会存储响应数据约 10 分钟以支持轮询，因此它与零数据保留（ZDR）不兼容。来自 ZDR 项目的请求在设置 `background=true` 时仍会被接受（出于历史兼容原因），但使用它会破坏 ZDR 保证。修改后的滥用监控（MAM）项目可以安全地使用后台模式。

**在后台生成响应**

::: code-group
```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5.5",
  "input": "Write a very long novel about otters in space.",
  "background": true
}'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  input: "Write a very long novel about otters in space.",
  background: true,
});

console.log(resp.status);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
)

print(resp.status)
```

:::





## 轮询后台响应

要检查后台请求的状态，请使用 Responses 的 GET 端点。在请求处于 queued 或 in\_progress 状态时持续轮询。当它离开这些状态时，表示已达到最终（终端）状态。

**检索在后台执行的响应**

::: code-group
```curl
curl https://api.openai.com/v1/responses/resp_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

let resp = await client.responses.create({
model: "gpt-5.5",
input: "Write a very long novel about otters in space.",
background: true,
});

while (resp.status === "queued" || resp.status === "in_progress") {
console.log("Current status: " + resp.status);
await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
resp = await client.responses.retrieve(resp.id);
}

console.log("Final status: " + resp.status + "\nOutput:\n" + resp.output_text);
```

```python
from openai import OpenAI
from time import sleep

client = OpenAI()

resp = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
)

while resp.status in {"queued", "in_progress"}:
  print(f"Current status: {resp.status}")
  sleep(2)
  resp = client.responses.retrieve(resp.id)

print(f"Final status: {resp.status}\nOutput:\n{resp.output_text}")
```

:::





## 取消后台响应

你也可以像这样取消正在进行的响应：

**取消正在进行的响应**

::: code-group
```curl
curl -X POST https://api.openai.com/v1/responses/resp_123/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.cancel("resp_123");

console.log(resp.status);
```

```python
from openai import OpenAI
client = OpenAI()

resp = client.responses.cancel("resp_123")

print(resp.status)
```

:::





取消操作是幂等的——后续调用只会返回最终的 `Response` 对象。

## 流式传输后台响应

你可以创建一个后台 Response 并立即开始流式接收事件。如果你预期客户端可能会断开流连接并希望稍后恢复，这会很有帮助。为此，创建 Response 时将 `background` 和 `stream` 都设置为 `true`。你需要跟踪一个"游标"，对应你在每个流式事件中收到的 `sequence_number`。

目前，从后台响应收到的首个 token 的延迟高于同步响应。我们正在努力在未来几周内缩小这一延迟差距。

**生成并流式传输后台响应**

::: code-group
```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5.5",
  "input": "Write a very long novel about otters in space.",
  "background": true,
  "stream": true
}'

// To resume:
curl "https://api.openai.com/v1/responses/resp_123?stream=true&starting_after=42" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const stream = await client.responses.create({
  model: "gpt-5.5",
  input: "Write a very long novel about otters in space.",
  background: true,
  stream: true,
});

let cursor = null;
for await (const event of stream) {
  console.log(event);
  cursor = event.sequence_number;
}

// If the connection drops, you can resume streaming from the last cursor (SDK support coming soon):
// const resumedStream = await client.responses.stream(resp.id, { starting_after: cursor });
// for await (const event of resumedStream) { ... }
```

```python
from openai import OpenAI

client = OpenAI()

# Fire off an async response but also start streaming immediately
stream = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
  stream=True,
)

cursor = None
for event in stream:
  print(event)
  cursor = event.sequence_number

# If your connection drops, the response continues running and you can reconnect:
# SDK support for resuming the stream is coming soon.
# for event in client.responses.stream(resp.id, starting_after=cursor):
#     print(event)
```

:::





## 限制

1.  后台采样要求 `store=true`；无状态请求会被拒绝。
2.  要取消同步响应，请终止连接。
3.  只有在创建时设置了 `stream=true`，才能从后台响应启动新的流。
