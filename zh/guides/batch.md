# Batch

> Process jobs asynchronously with Batch API.

了解如何使用 OpenAI 的 Batch API 发送异步请求组，享受 50% 的成本折扣、独立的显著更高速率限制池，以及明确的 24 小时完成时间。该服务非常适合处理不需要即时响应的任务。您也可以[在此处直接查看 API 参考]( https://developers.openai.com/api/reference/batch)。

## 概述

虽然 OpenAI 平台的某些用途需要您发送同步请求，但在许多情况下，请求不需要即时响应，或者[速率限制](/guides/rate-limits)阻止您快速执行大量查询。批处理任务通常在以下用例中很有帮助：

1.  运行评估
2.  对大型数据集进行分类
3.  嵌入内容仓库
4.  排队大型离线视频渲染任务

Batch API 提供了一组简单的端点，允许您将一组请求收集到单个文件中，启动批处理任务来执行这些请求，在底层请求执行时查询该批次的状态，并在批次完成时最终检索收集的结果。

与直接使用标准端点相比，Batch API 具有：

1.  **更好的成本效率：** 与同步 API 相比享受 50% 的成本折扣
2.  **更高的速率限制：** 与同步 API 相比有[显著更多的余量](https://platform.openai.com/settings/organization/limits)
3.  **快速完成时间：** 每个批次在 24 小时内完成（通常更快）

## 开始使用

### 1\. 准备批处理文件

批处理从一个 `.jsonl` 文件开始，其中每一行包含对 API 的单个请求的详细信息。目前，可用的端点有：

*   `/v1/responses`（[Responses API]( https://developers.openai.com/api/reference/responses)）
*   `/v1/chat/completions`（[Chat Completions API]( https://developers.openai.com/api/reference/chat)）
*   `/v1/embeddings`（[Embeddings API]( https://developers.openai.com/api/reference/embeddings)）
*   `/v1/completions`（[Completions API]( https://developers.openai.com/api/reference/completions)）
*   `/v1/moderations`（[Moderations 指南](/guides/moderation)）
*   `/v1/images/generations`（[Images API]( https://developers.openai.com/api/reference/images)）
*   `/v1/images/edits`（[Images API]( https://developers.openai.com/api/reference/images)）
*   `/v1/videos`（[视频生成指南](/guides/video-generation)）

对于给定的输入文件，每行 `body` 字段中的参数与底层端点的参数相同。每个请求必须包含一个唯一的 `custom_id` 值，您可以在完成后使用它来引用结果。以下是一个包含 2 个请求的输入文件示例。请注意，每个输入文件只能包含对单个模型的请求。

关于 Batch 中的视频生成：

*   Batch 目前仅支持 `POST /v1/videos`。
*   视频的 Batch 请求必须使用 JSON，而非 multipart。
*   提前上传资源，并在请求体中传递支持的资源引用，而不是使用 multipart 上传。
*   在 Batch 中使用 `input_reference` 进行图像引导生成。在 JSON 请求中，将 `input_reference` 作为包含 `file_id` 或 `image_url` 的对象传递。
*   Batch 不支持 multipart `input_reference` 上传，包括视频参考输入。
*   批次完成后，Batch 生成的视频可在 `24` 小时内下载。

当目标为 `/v1/moderations` 时，在每个请求体中包含一个 `input` 字段。Batch 接受纯文本输入（用于 `omni-moderation-latest` 和 `text-moderation-latest`）和多模态内容数组（用于 `omni-moderation-latest`）。Batch worker 执行与同步 Moderations API 相同的非流式要求，并拒绝设置 `stream=true` 的请求。

```
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are an unhelpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
```

#### Moderations 输入示例

纯文本请求：

```
{
  "custom_id": "moderation-text-1",
  "method": "POST",
  "url": "/v1/moderations",
  "body": {
    "model": "omni-moderation-latest",
    "input": "This is a harmless test sentence."
  }
}
```

多模态请求：

```
{
  "custom_id": "moderation-mm-1",
  "method": "POST",
  "url": "/v1/moderations",
  "body": {
    "model": "omni-moderation-latest",
    "input": [
      {
        "type": "text",
        "text": "Describe this image"
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
        }
      }
    ]
  }
}
```

建议使用 `image_url` 引用远程资源（而非 base64 blob），以使您的 `.jsonl` 文件远低于 200 MB 的 Batch 上传限制，尤其是对于多模态 Moderations 请求。

### 2\. 上传批处理输入文件

与我们的[微调 API](/guides/model-optimization) 类似，您必须先上传输入文件，以便在启动批处理时正确引用它。使用 [Files API]( https://developers.openai.com/api/reference/files) 上传您的 `.jsonl` 文件。

**为 Batch API 上传文件**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

const file = await openai.files.create({
  file: fs.createReadStream("batchinput.jsonl"),
  purpose: "batch",
});

console.log(file);
```

```python
from openai import OpenAI
client = OpenAI()

batch_input_file = client.files.create(
    file=open("batchinput.jsonl", "rb"),
    purpose="batch"
)

print(batch_input_file)
```

```curl
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="batch" \
  -F file="@batchinput.jsonl"
```

```cli
openai files create \
  --file batchinput.jsonl \
  --purpose batch
```

:::



### 3\. 创建批次

成功上传输入文件后，您可以使用输入 File 对象的 ID 来创建批次。在本例中，假设文件 ID 为 `file-abc123`。目前，完成窗口只能设置为 `24h`。您还可以通过可选的 `metadata` 参数提供自定义元数据。

**创建批次**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.create({
  input_file_id: "file-abc123",
  endpoint: "/v1/chat/completions",
  completion_window: "24h"
});

console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

batch_input_file_id = batch_input_file.id
client.batches.create(
    input_file_id=batch_input_file_id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={
        "description": "nightly eval job"
    }
)
```

```curl
curl https://api.openai.com/v1/batches \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

```cli
openai batches create \
  --input-file-id file-abc123 \
  --endpoint /v1/chat/completions \
  --completion-window 24h
```

:::




此请求将返回一个包含批次元数据的 [Batch 对象]( https://developers.openai.com/api/reference/batch/object)：

```
{
  "id": "batch_abc123",
  "object": "batch",
  "endpoint": "/v1/chat/completions",
  "errors": null,
  "input_file_id": "file-abc123",
  "completion_window": "24h",
  "status": "validating",
  "output_file_id": null,
  "error_file_id": null,
  "created_at": 1714508499,
  "in_progress_at": null,
  "expires_at": 1714536634,
  "completed_at": null,
  "failed_at": null,
  "expired_at": null,
  "request_counts": {
    "total": 0,
    "completed": 0,
    "failed": 0
  },
  "metadata": null
}
```

### 4\. 检查批次状态

您可以随时检查批次的状态，这也会返回一个 Batch 对象。

**检查批次状态**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.retrieve("batch_abc123");
console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

batch = client.batches.retrieve("batch_abc123")
print(batch)
```

```curl
curl https://api.openai.com/v1/batches/batch_abc123 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

```cli
openai batches retrieve \
  --batch-id batch_abc123
```

:::



给定 Batch 对象的状态可以是以下任何一种：

| 状态 | 描述 |
| --- | --- |
| `validating` | 输入文件正在验证中，批次尚未开始 |
| `failed` | 输入文件未通过验证过程 |
| `in_progress` | 输入文件已成功验证，批次正在运行中 |
| `finalizing` | 批次已完成，结果正在准备中 |
| `completed` | 批次已完成，结果已就绪 |
| `expired` | 批次未能在 24 小时时间窗口内完成 |
| `cancelling` | 批次正在取消中（可能需要最多 10 分钟） |
| `cancelled` | 批次已被取消 |

### 5\. 检索结果

批次完成后，您可以通过 Batch 对象的 `output_file_id` 字段向 [Files API]( https://developers.openai.com/api/reference/files) 发出请求来下载输出，并将其写入您机器上的文件，在本例中为 `batch_output.jsonl`

**检索批次结果**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const fileResponse = await openai.files.content("file-xyz123");
const fileContents = await fileResponse.text();

console.log(fileContents);
```

```python
from openai import OpenAI
client = OpenAI()

file_response = client.files.content("file-xyz123")
print(file_response.text)
```

```curl
curl https://api.openai.com/v1/files/file-xyz123/content \
  -H "Authorization: Bearer $OPENAI_API_KEY" > batch_output.jsonl
```

```cli
openai files content \
  --file-id file-xyz123 \
  --output batch_output.jsonl
```

:::




输出的 `.jsonl` 文件将为输入文件中每个成功的请求行包含一个响应行。批次中任何失败的请求都会将其错误信息写入错误文件，该文件可通过批次的 `error_file_id` 找到。

对于 `/v1/videos`，已完成的批次结果包含已达到终态（如 `completed`、`failed` 或 `expired`）的视频对象。您可以在批次完成后立即使用返回的视频 ID 下载最终资源。

请注意，输出行的顺序**可能与**输入行的顺序不匹配。不要依赖顺序来处理结果，而是使用 custom\_id 字段，该字段将出现在输出文件的每一行中，允许您将输入中的请求映射到输出中的结果。

```
{"id": "batch_req_123", "custom_id": "request-2", "response": {"status_code": 200, "request_id": "req_123", "body": {"id": "chatcmpl-123", "object": "chat.completion", "created": 1711652795, "model": "gpt-3.5-turbo-0125", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello."}, "logprobs": null, "finish_reason": "stop"}], "usage": {"prompt_tokens": 22, "completion_tokens": 2, "total_tokens": 24}, "system_fingerprint": "fp_123"}}, "error": null}
{"id": "batch_req_456", "custom_id": "request-1", "response": {"status_code": 200, "request_id": "req_789", "body": {"id": "chatcmpl-abc", "object": "chat.completion", "created": 1711652789, "model": "gpt-3.5-turbo-0125", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello! How can I assist you today?"}, "logprobs": null, "finish_reason": "stop"}], "usage": {"prompt_tokens": 20, "completion_tokens": 9, "total_tokens": 29}, "system_fingerprint": "fp_3ba"}}, "error": null}
```

输出文件将在批次完成后 30 天自动删除。

### 6\. 取消批次

如有必要，您可以取消正在进行的批次。批次的状态将变为 `cancelling`，直到进行中的请求完成（最多 10 分钟），之后状态将变为 `cancelled`。

**取消批次**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.cancel("batch_abc123");
console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

client.batches.cancel("batch_abc123")
```

```curl
curl https://api.openai.com/v1/batches/batch_abc123/cancel \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST
```

```cli
openai batches cancel \
  --batch-id batch_abc123
```

:::



### 7\. 获取所有批次列表

您可以随时查看所有批次。对于拥有大量批次的用户，可以使用 `limit` 和 `after` 参数对结果进行分页。

**获取所有批次列表**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const list = await openai.batches.list();

for await (const batch of list) {
  console.log(batch);
}
```

```python
from openai import OpenAI
client = OpenAI()

client.batches.list(limit=10)
```

```curl
curl https://api.openai.com/v1/batches?limit=10 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

```cli
openai batches list \
  --limit 10
```

:::




## 模型可用性

Batch API 广泛适用于我们的大多数模型，但并非全部。请参阅[模型参考文档](/models)以确保您使用的模型支持 Batch API。

## 速率限制

Batch API 的速率限制与现有的每模型速率限制是分开的。Batch API 有三种类型的速率限制：

1.  **每批次限制：** 单个批次最多可包含 50,000 个请求，批次输入文件最大为 200 MB。请注意，`/v1/embeddings` 批次还限制批次中所有请求的嵌入输入总数最多为 50,000 个。
2.  **每模型排队提示 token 数：** 每个模型都有允许用于批处理的最大排队提示 token 数。您可以在[平台设置页面](https://platform.openai.com/settings/organization/limits)找到这些限制。
3.  **批次创建速率限制：** 您每小时最多可以创建 2,000 个批次。如果需要提交更多请求，请增加每个批次的请求数量。

目前 Batch API 没有输出 token 的限制。由于 Batch API 的速率限制是一个新的、独立的池，**使用 Batch API 不会消耗您标准的每模型速率限制中的 token**，从而为您提供了一种便捷的方式来增加查询我们 API 时可以使用的请求数量和处理的 token 数。

## 批次过期

未能及时完成的批次最终会进入 `expired` 状态；该批次中未完成的请求将被取消，已完成请求的任何响应都可通过批次的输出文件获取。您将为已完成请求消耗的 token 付费。

过期的请求将被写入您的错误文件，消息如下所示。您可以使用 `custom_id` 检索过期请求的请求数据。

```
{"id": "batch_req_123", "custom_id": "request-3", "response": null, "error": {"code": "batch_expired", "message": "This request could not be executed before the completion window expired."}}
{"id": "batch_req_123", "custom_id": "request-7", "response": null, "error": {"code": "batch_expired", "message": "This request could not be executed before the completion window expired."}}
```
