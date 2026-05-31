
**Predicted Outputs** 使你能够在许多输出 token 可以提前预知的情况下加速 [Chat Completions]( https://developers.openai.com/api/reference/chat/create) 的 API 响应。这在你对文本或代码文件进行少量修改并重新生成时最为常见。你可以通过 [Chat Completions 中的 `prediction` 请求参数]( https://developers.openai.com/api/reference/chat/create#chat-create-prediction) 来提供你的预测。

Predicted Outputs 目前可在最新的 `gpt-4o`、`gpt-4o-mini`、`gpt-4.1`、`gpt-4.1-mini` 和 `gpt-4.1-nano` 模型上使用。继续阅读以了解如何使用 Predicted Outputs 来降低应用程序中的延迟。

## 代码重构示例

Predicted Outputs 在对文本文档和代码文件进行少量修改并重新生成时特别有用。假设你想让 [GPT-4o 模型](/models#gpt-4o) 重构一段 TypeScript 代码，将 `User` 类的 `username` 属性转换为 `email`：

```
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
```

除了上面的第 4 行之外，文件的大部分内容将保持不变。如果你使用代码文件的当前文本作为预测，就可以以更低的延迟重新生成整个文件。对于较大的文件，这些时间节省会迅速累积。

下面是在我们的 SDK 中使用 `prediction` 参数的示例，预测模型的最终输出将与我们的原始代码文件非常相似，我们将其用作预测文本。

**使用 Predicted Output 重构 TypeScript 类**

```javascript
import OpenAI from "openai";

const code = `
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
`.trim();

const openai = new OpenAI();

const refactorPrompt = `
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: refactorPrompt
    },
    {
      role: "user",
      content: code
    }
  ],
  store: true,
  prediction: {
    type: "content",
    content: code
  }
});

// Inspect returned data
console.log(completion);
console.log(completion.choices[0].message.content);
```
```python
from openai import OpenAI

code = """
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
"""

refactor_prompt = """
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
"""

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": refactor_prompt
        },
        {
            "role": "user",
            "content": code
        }
    ],
    prediction={
        "type": "content",
        "content": code
    }
)

print(completion)
print(completion.choices[0].message.content)
```
```curl
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {
        "role": "user",
        "content": "Replace the username property with an email property. Respond only with code, and with no markdown formatting."
      },
      {
        "role": "user",
        "content": "$CODE_CONTENT_HERE"
      }
    ],
    "prediction": {
        "type": "content",
        "content": "$CODE_CONTENT_HERE"
    }
  }'
```

除了重构后的代码之外，模型响应还将包含类似如下的数据：

```
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1730918466,
  model: 'gpt-4o-2024-08-06',
  choices: [ /* ...actual text response here... */],
  usage: {
    prompt_tokens: 81,
    completion_tokens: 39,
    total_tokens: 120,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 18,
      rejected_prediction_tokens: 10
    }
  },
  system_fingerprint: 'fp_159d8341cc'
}
```

请注意 `usage` 对象中的 `accepted_prediction_tokens` 和 `rejected_prediction_tokens`。在此示例中，预测中有 18 个 token 被用于加速响应，而 10 个被拒绝。

请注意，任何被拒绝的 token 仍然会按照 API 生成的其他补全 token 的费率计费，因此 Predicted Outputs 可能会增加你请求的成本。

## 流式传输示例

当你使用流式传输获取 API 响应时，Predicted Outputs 的延迟优势更加显著。以下是相同代码重构用例的示例，但使用了 OpenAI SDK 中的流式传输。

**Predicted Outputs 与流式传输**

```javascript
import OpenAI from "openai";

const code = `
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
`.trim();

const openai = new OpenAI();

const refactorPrompt = `
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: refactorPrompt
    },
    {
      role: "user",
      content: code
    }
  ],
  store: true,
  prediction: {
    type: "content",
    content: code
  },
  stream: true
});

// Inspect returned data
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```
```python
from openai import OpenAI

code = """
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
"""

refactor_prompt = """
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
"""

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": refactor_prompt
        },
        {
            "role": "user",
            "content": code
        }
    ],
    prediction={
        "type": "content",
        "content": code
    },
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

## 预测文本在响应中的位置

在提供预测文本时，你的预测可以出现在生成响应中的任何位置，仍然能为响应提供延迟降低效果。假设你的预测文本是下面所示的简单 [Hono](https://hono.dev/) 服务器：

```
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello Hono!");
});

// You will need to build the client code first `pnpm run ui:build`
app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

你可以使用如下提示词让模型重新生成文件：

```
Add a get route to this application that responds with
the text "hello world". Generate the entire application
file again with this route added, and with no other
markdown formatting.
```

对该提示词的响应可能如下所示：

```
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello Hono!");
});

app.get("/hello", (c) => {
  return c.text("hello world");
});

// You will need to build the client code first `pnpm run ui:build`
app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

你仍然会在响应中看到已接受的预测 token，即使预测文本出现在响应中新增内容的前后两侧：

```
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1731014771,
  model: 'gpt-4o-2024-08-06',
  choices: [ /* completion here... */],
  usage: {
    prompt_tokens: 203,
    completion_tokens: 159,
    total_tokens: 362,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 60,
      rejected_prediction_tokens: 0
    }
  },
  system_fingerprint: 'fp_9ee9e968ea'
}
```

这次没有被拒绝的预测 token，因为我们预测的文件全部内容都被用在了最终响应中。太棒了！🔥

## 限制

使用 Predicted Outputs 时，你应该考虑以下因素和限制。

*   Predicted Outputs 仅支持 GPT-4o、GPT-4o-mini、GPT-4.1、GPT-4.1-mini 和 GPT-4.1-nano 系列模型。
*   提供预测时，任何不属于最终补全的 token 仍然按补全 token 费率计费。请查看 [`usage` 对象的 `rejected_prediction_tokens` 属性]( https://developers.openai.com/api/reference/chat/object#chat/object-usage) 以了解有多少 token 未被用于最终响应。
*   使用 Predicted Outputs 时，以下 [API 参数]( https://developers.openai.com/api/reference/chat/create) 不受支持：
    *   `n`：不支持大于 1 的值
    *   `logprobs`：不支持
    *   `presence_penalty`：不支持大于 0 的值
    *   `frequency_penalty`：不支持大于 0 的值
    *   `audio`：Predicted Outputs 与[音频输入和输出](/guides/audio)不兼容
    *   `modalities`：仅支持 `text` 模态
    *   `max_completion_tokens`：不支持
    *   `tools`：Predicted Outputs 目前不支持函数调用
