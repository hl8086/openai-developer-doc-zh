
OpenAI [webhooks](http://chatgpt.com/?q=eli5+what+is+a+webhook?) 允许你接收 API 中事件的实时通知，例如当批处理完成、后台响应生成完毕或微调任务结束时。Webhooks 会发送到你控制的 HTTP 端点，遵循 [Standard Webhooks 规范](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md)。完整的 webhook 事件列表可在 [API 参考]( https://developers.openai.com/api/reference/webhook-events) 中找到。

[Webhook 事件 API 参考 - 查看完整的 webhook 事件列表。]( https://developers.openai.com/api/reference/webhook-events)

以下是能够接收 OpenAI webhooks 的简单服务器示例，专门针对 [`response.completed`]( https://developers.openai.com/api/reference/webhook-events/response/completed) 事件。

**Webhooks 服务器**

::: code-group
```python
import os
from openai import OpenAI, InvalidWebhookSignatureError
from flask import Flask, request, Response

app = Flask(__name__)
client = OpenAI(webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"])

@app.route("/webhook", methods=["POST"])
def webhook():
    try:
        # with webhook_secret set above, unwrap will raise an error if the signature is invalid
        event = client.webhooks.unwrap(request.data, request.headers)

        if event.type == "response.completed":
            response_id = event.data.id
            response = client.responses.retrieve(response_id)
            print("Response output:", response.output_text)

        return Response(status=200)
    except InvalidWebhookSignatureError as e:
        print("Invalid signature", e)
        return Response("Invalid signature", status=400)

if __name__ == "__main__":
    app.run(port=8000)
```

```javascript
import OpenAI from "openai";
import express from "express";

const app = express();
const client = new OpenAI({ webhookSecret: process.env.OPENAI_WEBHOOK_SECRET });

// Don't use express.json() because signature verification needs the raw text body
app.use(express.text({ type: "application/json" }));

app.post("/webhook", async (req, res) => {
  try {
    const event = await client.webhooks.unwrap(req.body, req.headers);

    if (event.type === "response.completed") {
      const response_id = event.data.id;
      const response = await client.responses.retrieve(response_id);
      const output_text = response.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content)
        .filter((contentItem) => contentItem.type === "output_text")
        .map((contentItem) => contentItem.text)
        .join("");

      console.log("Response output:", output_text);
    }
    res.status(200).send();
  } catch (error) {
    if (error instanceof OpenAI.InvalidWebhookSignatureError) {
      console.error("Invalid signature", error);
      res.status(400).send("Invalid signature");
    } else {
      throw error;
    }
  }
});

app.listen(8000, () => {
  console.log("Webhook server is running on port 8000");
});
```

:::

要查看此类 webhook 的实际运行效果，你可以在 OpenAI 仪表板中设置一个订阅了 `response.completed` 的 webhook 端点，然后发起一个 API 请求来[在后台模式下生成响应](/guides/background)。

你也可以从 [webhook 设置页面](https://platform.openai.com/settings/project/webhooks) 使用示例数据触发测试事件。

**生成后台响应**

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

::: code-group
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

:::

在本指南中，你将学习如何在仪表板中创建 webhook 端点、设置服务器端代码来处理它们，以及验证入站请求是否来自 OpenAI。

## 创建 webhook 端点

要开始在服务器上接收 webhook 请求，请登录仪表板并[打开 webhook 设置页面](https://platform.openai.com/settings/project/webhooks)。Webhooks 按项目配置。

点击"Create"按钮创建新的 webhook 端点。你需要配置三项内容：

*   端点的名称（仅供你参考）。
*   你控制的服务器的公共 URL。
*   一个或多个要订阅的事件类型。当这些事件发生时，OpenAI 将向指定的 URL 发送 HTTP POST 请求。

![webhook 端点编辑对话框](https://cdn.openai.com/API/images/webhook_config.png)

创建新的 webhook 后，你将收到一个签名密钥，用于服务器端验证传入的 webhook 请求。请保存此值，因为之后将无法再次查看。

创建 webhook 端点后，接下来你需要设置服务器端端点来处理这些传入的事件负载。

## 在服务器上处理 webhook 请求

当你订阅的事件发生时，你的 webhook URL 将收到如下 HTTP POST 请求：

```
POST https://yourserver.com/webhook
user-agent: OpenAI/1.0 (+https://platform.openai.com/docs/webhooks)
content-type: application/json
webhook-id: wh_685342e6c53c8190a1be43f081506c52
webhook-timestamp: 1750287078
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=
{
  "object": "event",
  "id": "evt_685343a1381c819085d44c354e1b330e",
  "type": "response.completed",
  "created_at": 1750287018,
  "data": { "id": "resp_abc123" }
}
```

你的端点应快速响应这些传入的 HTTP 请求，返回成功（`2xx`）状态码，表示已成功接收。为避免超时，我们建议将任何非简单处理卸载到后台工作进程，以便端点能够立即响应。如果端点未返回成功（`2xx`）状态码，或未在几秒内响应，webhook 请求将被重试。OpenAI 将以指数退避的方式持续尝试投递，最长可达 72 小时。请注意，`3xx` 重定向不会被跟随；它们被视为失败，你应该更新端点以使用最终目标 URL。

在极少数情况下，由于内部系统问题，OpenAI 可能会重复投递同一个 webhook 事件。你可以使用 `webhook-id` 头作为幂等键来去重。

### 本地测试 webhooks

测试 webhooks 需要一个在公共互联网上可访问的 URL。这可能使开发变得棘手，因为你的本地开发环境通常不对公众开放。以下是一些可能有帮助的选项：

*   [ngrok](https://ngrok.com/) 可以将你的 localhost 服务器暴露在公共 URL 上
*   云开发环境，如 [Replit](https://replit.com/)、[GitHub Codespaces](https://github.com/features/codespaces)、[Cloudflare Workers](https://workers.cloudflare.com/) 或 [Vercel 的 v0](https://v0.dev/)。

## 验证 webhook 签名

虽然你可以在不进行任何验证的情况下接收和处理 OpenAI 的 webhook 事件，但你应该验证传入请求是否来自 OpenAI，特别是当你的 webhook 会在后端执行任何操作时。随 webhook 请求发送的头信息包含可与 webhook 密钥结合使用的信息，用于验证 webhook 是否来自 OpenAI。

当你在 OpenAI 仪表板中创建 webhook 端点时，你将获得一个签名密钥，应将其作为环境变量在服务器上使用：

```
export OPENAI_WEBHOOK_SECRET="&lt;your secret here>"
```

验证 webhook 签名最简单的方法是使用官方 OpenAI SDK 辅助工具的 `unwrap()` 方法：

**使用 OpenAI SDK 进行签名验证**

::: code-group
```python
client = OpenAI()
webhook_secret = os.environ["OPENAI_WEBHOOK_SECRET"]

# will raise if the signature is invalid
event = client.webhooks.unwrap(request.data, request.headers, secret=webhook_secret)
```

```javascript
const client = new OpenAI();
const webhook_secret = process.env.OPENAI_WEBHOOK_SECRET;

// will throw if the signature is invalid
const event = client.webhooks.unwrap(req.body, req.headers, { secret: webhook_secret });
```

:::

也可以使用 [Standard Webhooks 库](https://github.com/standard-webhooks/standard-webhooks/tree/main?tab=readme-ov-file#reference-implementations) 来验证签名：

**使用 Standard Webhooks 库进行签名验证**

::: code-group
```rust
use standardwebhooks::Webhook;

let webhook_secret = std::env::var("OPENAI_WEBHOOK_SECRET").expect("OPENAI_WEBHOOK_SECRET not set");
let wh = Webhook::new(webhook_secret);
wh.verify(webhook_payload, webhook_headers).expect("Webhook verification failed");
```

```php
$webhook_secret = getenv("OPENAI_WEBHOOK_SECRET");
$wh = new \StandardWebhooks\Webhook($webhook_secret);
$wh->verify($webhook_payload, $webhook_headers);
```

:::

或者，如果需要，你可以按照 [Standard Webhooks 规范中的描述](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#verifying-webhook-authenticity) 实现自己的签名验证。

如果你丢失或意外暴露了签名密钥，可以通过[轮换签名密钥](https://platform.openai.com/settings/project/webhooks)生成新的密钥。
