
在 Responses API 实现功能对等后，我们已弃用 Assistants API。该 API 将于 2026 年 8 月 26 日关闭。请按照[迁移指南](/platform/assistants/migration)更新您的集成。[了解更多](https://platform.openai.com/docs/guides/migrate-to-responses)。

## 概述

请勿在 Assistants API 上开始新的集成。我们已宣布计划即将弃用该 API，因为 Responses API 现在提供相同的功能和更优雅的集成方式。

使用 Assistants API 构建应用涉及多个概念，下面将逐一介绍，以帮助您完成[迁移到 Responses](/guides/assistants/migration)。

## 创建 Assistants

我们建议在 Assistants API 中使用 OpenAI 的[最新模型](/models)，以获得最佳效果和最大的工具兼容性。

要开始使用，创建 Assistant 只需指定要使用的 `model`。但您可以进一步自定义 Assistant 的行为：

1.  使用 `instructions` 参数来引导 Assistant 的个性并定义其目标。Instructions 类似于 Chat Completions API 中的系统消息。
2.  使用 `tools` 参数为 Assistant 提供最多 128 个工具的访问权限。您可以让它访问 OpenAI 内置工具，如 `code_interpreter` 和 `file_search`，或通过 `function` 调用来使用第三方工具。
3.  使用 `tool_resources` 参数为 `code_interpreter` 和 `file_search` 等工具提供文件访问权限。文件通过 `File` [上传端点]( https://developers.openai.com/api/reference/files/create)上传，且必须将 `purpose` 设置为 `assistants` 才能在此 API 中使用。

例如，要创建一个可以基于 `.csv` 文件创建数据可视化的 Assistant，首先上传一个文件。

::: code-group
```python
file = client.files.create(
  file=open("revenue-forecast.csv", "rb"),
  purpose='assistants'
)
```

```node
const file = await openai.files.create({
  file: fs.createReadStream("revenue-forecast.csv"),
  purpose: "assistants",
});
```

```curl
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="assistants" \
  -F file="@revenue-forecast.csv"
```

:::

然后，创建启用了 `code_interpreter` 工具的 Assistant，并将文件作为资源提供给该工具。

::: code-group
```python
assistant = client.beta.assistants.create(
  name="Data visualizer",
  description="You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
  model="gpt-4o",
  tools=[{"type": "code_interpreter"}],
  tool_resources={
    "code_interpreter": {
      "file_ids": [file.id]
    }
  }
)
```

```node
const assistant = await openai.beta.assistants.create({
  name: "Data visualizer",
  description: "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
  model: "gpt-4o",
  tools: [{"type": "code_interpreter"}],
  tool_resources: {
    "code_interpreter": {
      "file_ids": [file.id]
    }
  }
});
```

```curl
curl https://api.openai.com/v1/assistants \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "name": "Data visualizer",
    "description": "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
    "model": "gpt-4o",
    "tools": [{"type": "code_interpreter"}],
    "tool_resources": {
      "code_interpreter": {
        "file_ids": ["file-BK7bzQj3FfZFXr7DbL6xJwfo"]
      }
    }
  }'
```

:::

您最多可以将 20 个文件附加到 `code_interpreter`，将 10,000 个文件附加到 `file_search`（使用 `vector_store` [对象]( https://developers.openai.com/api/reference/vector-stores/object)）。对于 2025 年 11 月之后创建的向量存储，`file_search` 的限制为 100,000,000 个文件。

每个文件最大为 512 MB，最多包含 5,000,000 个 token。默认情况下，每个项目最多可存储 2.5 TB 的文件。没有组织级别的存储限制。您可以联系我们的支持团队来提高此限制。

## 管理 Threads 和 Messages

Threads 和 Messages 代表 Assistant 与用户之间的对话会话。每个 Thread 限制为 100,000 条 Messages。一旦 Messages 的大小超过模型的上下文窗口，Thread 将尝试智能截断消息，然后完全丢弃它认为最不重要的消息。

您可以使用初始 Messages 列表创建 Thread，如下所示：

::: code-group
```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": "Create 3 data visualizations based on the trends in this file.",
      "attachments": [
        {
          "file_id": file.id,
          "tools": [{"type": "code_interpreter"}]
        }
      ]
    }
  ]
)
```

```node
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": "Create 3 data visualizations based on the trends in this file.",
      "attachments": [
        {
          file_id: file.id,
          tools: [{type: "code_interpreter"}]
        }
      ]
    }
  ]
});
```

```curl
curl https://api.openai.com/v1/threads \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Create 3 data visualizations based on the trends in this file.",
        "attachments": [
          {
            "file_id": "file-ACq8OjcLQm2eIG0BvRM4z5qX",
            "tools": [{"type": "code_interpreter"}]
          }
        ]
      }
    ]
  }'
```

:::

Messages 可以包含文本、图像或文件附件。Message 的 `attachments` 是将文件添加到线程 `tool_resources` 的辅助方法。您也可以选择直接将文件添加到 `thread.tool_resources`。

### 创建图像输入内容

Message 内容可以包含外部图像 URL 或通过 [File API]( https://developers.openai.com/api/reference/files/create) 上传的 File ID。只有支持 Vision 的[模型](/models)才能接受图像输入。支持的图像内容类型包括 png、jpg、gif 和 webp。创建图像文件时，传入 `purpose="vision"` 以允许您稍后下载和显示输入内容。项目总文件存储限制为 2.5 TB，没有组织级别的存储限制。如需增加限制，请联系我们。

除非另有指定，工具无法访问图像内容。要将图像文件传递给 Code Interpreter，请在消息的 `attachments` 列表中添加文件 ID，以允许该工具读取和分析输入。目前 Code Interpreter 无法下载图像 URL。

::: code-group
```python
file = client.files.create(
  file=open("myimage.png", "rb"),
  purpose="vision"
)
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the difference between these images?"
        },
        {
          "type": "image_url",
          "image_url": {"url": "https://example.com/image.png"}
        },
        {
          "type": "image_file",
          "image_file": {"file_id": file.id}
        },
      ],
    }
  ]
)
```

```node
import fs from "fs";
const file = await openai.files.create({
  file: fs.createReadStream("myimage.png"),
  purpose: "vision",
});
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the difference between these images?"
        },
        {
          "type": "image_url",
          "image_url": {"url": "https://example.com/image.png"}
        },
        {
          "type": "image_file",
          "image_file": {"file_id": file.id}
        },
      ]
    }
  ]
});
```

```curl
# Upload a file with an "vision" purpose
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="vision" \
  -F file="@/path/to/myimage.png"

## Pass the file ID in the content

curl https://api.openai.com/v1/threads \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-H "OpenAI-Beta: assistants=v2" \
-d '{
"messages": [
{
"role": "user",
"content": [
{
"type": "text",
"text": "What is the difference between these images?"
},
{
"type": "image_url",
"image_url": {"url": "https://example.com/image.png"}
},
{
"type": "image_file",
"image_file": {"file_id": file.id}
}
]
}
]
}'
```

:::

#### 低保真度或高保真度图像理解

通过控制 `detail` 参数（有三个选项：`low`、`high` 或 `auto`），您可以控制模型如何处理图像并生成其文本理解。

*   `low` 将启用"低分辨率"模式。模型将接收 512px x 512px 的低分辨率版本图像，并以 85 个 token 的预算表示该图像。这允许 API 返回更快的响应并消耗更少的输入 token，适用于不需要高细节的用例。
*   `high` 将启用"高分辨率"模式，首先让模型查看低分辨率图像，然后根据输入图像大小创建输入图像的详细裁剪。使用[定价计算器](https://openai.com/api/pricing/)查看各种图像大小的 token 数量。

::: code-group
```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is this an image of?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/image.png",
            "detail": "high"
          }
        },
      ],
    }
  ]
)
```

```node
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": [
          {
            "type": "text",
            "text": "What is this an image of?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.png",
              "detail": "high"
            }
          },
      ]
    }
  ]
});
```

```curl
curl https://api.openai.com/v1/threads \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is this an image of?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.png",
              "detail": "high"
            }
          },
        ]
      }
    ]
  }'
```

:::

### 上下文窗口管理

Assistants API 会自动管理截断以确保不超过模型的最大上下文长度。您可以通过指定希望 Run 使用的最大 token 数和/或希望在 Run 中包含的最近消息的最大数量来自定义此行为。

#### 最大补全和最大提示 Token 数

要控制单次 Run 中的 token 使用量，请在创建 Run 时设置 `max_prompt_tokens` 和 `max_completion_tokens`。这些限制适用于 Run 整个生命周期中所有补全使用的 token 总数。

例如，将 `max_prompt_tokens` 设置为 500、`max_completion_tokens` 设置为 1000 来启动 Run，意味着第一次补全将把线程截断为 500 个 token，并将输出上限设为 1000 个 token。如果第一次补全仅使用了 200 个提示 token 和 300 个补全 token，则第二次补全将有 300 个提示 token 和 700 个补全 token 的可用限制。

如果补全达到 `max_completion_tokens` 限制，Run 将以 `incomplete` 状态终止，详细信息将在 Run 对象的 `incomplete_details` 字段中提供。

使用 File Search 工具时，我们建议将 max\_prompt\_tokens 设置为不低于 20,000。对于较长的对话或与 File Search 的多次交互，请考虑将此限制增加到 50,000，或者理想情况下，完全移除 max\_prompt\_tokens 限制以获得最高质量的结果。

#### 截断策略

您还可以指定截断策略来控制线程应如何渲染到模型的上下文窗口中。使用 `auto` 类型的截断策略将使用 OpenAI 的默认截断策略。使用 `last_messages` 类型的截断策略将允许您指定要包含在上下文窗口中的最近消息数量。

### 消息注释

由 Assistants 创建的 Messages 可能在对象的 `content` 数组中包含 [`annotations`]( https://developers.openai.com/api/reference/messages/object#messages/object-content)。注释提供了关于如何标注 Message 中文本的信息。

有两种类型的注释：

1.  `file_citation`：文件引用由 [`file_search`](/assistants/tools/file-search) 工具创建，定义了对 Assistant 用于生成响应的特定上传文件的引用。
2.  `file_path`：文件路径注释由 [`code_interpreter`](/assistants/tools/code-interpreter) 工具创建，包含对该工具生成的文件的引用。

当 Message 对象中存在注释时，您会在文本中看到模型生成的不可读子字符串，您应该用注释替换这些字符串。这些字符串可能看起来像 `【13†source】` 或 `sandbox:/mnt/data/file.csv`。以下是一个用注释替换这些字符串的 Python 代码示例。

```python
# Retrieve the message object
message = client.beta.threads.messages.retrieve(
  thread_id="...",
  message_id="..."
)

# Extract the message content

message_content = message.content[0].text
annotations = message_content.annotations
citations = []

# Iterate over the annotations and add footnotes

for index, annotation in enumerate(annotations): # Replace the text with a footnote
message_content.value = message_content.value.replace(annotation.text, f' [{index}]')

    # Gather citations based on annotation attributes
    if (file_citation := getattr(annotation, 'file_citation', None)):
        cited_file = client.files.retrieve(file_citation.file_id)
        citations.append(f'[{index}] {file_citation.quote} from {cited_file.filename}')
    elif (file_path := getattr(annotation, 'file_path', None)):
        cited_file = client.files.retrieve(file_path.file_id)
        citations.append(f'[{index}] Click &lt;here> to download {cited_file.filename}')
        # Note: File download functionality not implemented above for brevity

# Add footnotes to the end of the message before displaying to user

message_content.value += '\n' + '\n'.join(citations)
```

## Runs 和 Run Steps

当您在 Thread 中从用户那里获得了所有需要的上下文后，您可以使用您选择的 Assistant 来运行该 Thread。

::: code-group
```python
run = client.beta.threads.runs.create(
  thread_id=thread.id,
  assistant_id=assistant.id
)
```

```node
const run = await openai.beta.threads.runs.create(
  thread.id,
  { assistant_id: assistant.id }
);
```

```curl
curl https://api.openai.com/v1/threads/THREAD_ID/runs \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "assistant_id": "asst_ToSF7Gb04YMj8AMMm50ZLLtY"
  }'
```

:::

默认情况下，Run 将使用 Assistant 对象中指定的 `model` 和 `tools` 配置，但您可以在创建 Run 时覆盖其中大部分配置以增加灵活性：

::: code-group
```python
run = client.beta.threads.runs.create(
  thread_id=thread.id,
  assistant_id=assistant.id,
  model="gpt-4o",
  instructions="New instructions that override the Assistant instructions",
  tools=[{"type": "code_interpreter"}, {"type": "file_search"}]
)
```

```node
const run = await openai.beta.threads.runs.create(
  thread.id,
  {
    assistant_id: assistant.id,
    model: "gpt-4o",
    instructions: "New instructions that override the Assistant instructions",
    tools: [{"type": "code_interpreter"}, {"type": "file_search"}]
  }
);
```

```curl
curl https://api.openai.com/v1/threads/THREAD_ID/runs \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "assistant_id": "ASSISTANT_ID",
    "model": "gpt-4o",
    "instructions": "New instructions that override the Assistant instructions",
    "tools": [{"type": "code_interpreter"}, {"type": "file_search"}]
  }'
```

:::

注意：与 Assistant 关联的 `tool_resources` 不能在 Run 创建期间被覆盖。您必须使用[修改 Assistant]( https://developers.openai.com/api/reference/assistants/modifyAssistant) 端点来执行此操作。

#### Run 生命周期

Run 对象可以有多种状态。

![Run 生命周期 - 显示可能状态转换的图表](https://cdn.openai.com/API/docs/images/diagram-run-statuses-v2.png)

| 状态 | 定义 |
| --- | --- |
| `queued` | 当 Runs 首次创建或当您完成 `required_action` 时，它们会被移至排队状态。它们应该几乎立即移至 `in_progress`。 |
| `in_progress` | 在进行中时，Assistant 使用模型和工具执行步骤。您可以通过检查 [Run Steps]( https://developers.openai.com/api/reference/runs/step-object) 来查看 Run 的进度。 |
| `completed` | Run 成功完成！您现在可以查看 Assistant 添加到 Thread 的所有 Messages，以及 Run 执行的所有步骤。您还可以通过向 Thread 添加更多用户 Messages 并创建另一个 Run 来继续对话。 |
| `requires_action` | 使用 [Function calling](/assistants/tools/function-calling) 工具时，一旦模型确定要调用的函数名称和参数，Run 将移至 `required_action` 状态。您必须运行这些函数并[提交输出]( https://developers.openai.com/api/reference/runs/submitToolOutputs)，然后 Run 才能继续。如果在 `expires_at` 时间戳之前（大约创建后 10 分钟）未提供输出，Run 将移至过期状态。 |
| `expired` | 当函数调用输出未在 `expires_at` 之前提交且 Run 过期时会发生这种情况。此外，如果 Run 执行时间过长并超过 `expires_at` 中规定的时间，我们的系统将使 Run 过期。 |
| `cancelling` | 您可以尝试使用[取消 Run]( https://developers.openai.com/api/reference/runs/cancelRun) 端点取消 `in_progress` 的 Run。一旦取消尝试成功，Run 的状态将移至 `cancelled`。取消会被尝试但不保证成功。 |
| `cancelled` | Run 已成功取消。 |
| `failed` | 您可以通过查看 Run 中的 `last_error` 对象来查看失败原因。失败的时间戳将记录在 `failed_at` 下。 |
| `incomplete` | Run 因达到 `max_prompt_tokens` 或 `max_completion_tokens` 而结束。您可以通过查看 Run 中的 `incomplete_details` 对象来查看具体原因。 |

#### 轮询更新

如果您没有使用[流式传输](/assistants/overview#step-4-create-a-run?context=with-streaming)，为了保持 Run 状态的最新，您需要定期[检索 Run]( https://developers.openai.com/api/reference/runs/getRun) 对象。每次检索对象时，您可以检查 Run 的状态以确定应用程序接下来应该做什么。

您可以选择使用我们 [Node](https://github.com/openai/openai-node?tab=readme-ov-file#polling-helpers) 和 [Python](https://github.com/openai/openai-python?tab=readme-ov-file#polling-helpers) SDK 中的轮询辅助工具来帮助您完成此操作。这些辅助工具将自动为您轮询 Run 对象，并在其处于终止状态时返回 Run 对象。

#### Thread 锁定

当 Run 处于 `in_progress` 且不在终止状态时，Thread 会被锁定。这意味着：

*   无法向 Thread 添加新的 Messages。
*   无法在 Thread 上创建新的 Runs。

#### Run steps

![Run steps 生命周期 - 显示可能状态转换的图表](https://cdn.openai.com/API/docs/images/diagram-2.png)

Run step 状态与 Run 状态具有相同的含义。

Run Step 对象中大部分有趣的细节都在 `step_details` 字段中。可以有两种类型的步骤详情：

1.  `message_creation`：当 Assistant 在 Thread 上创建 Message 时会创建此 Run Step。
2.  `tool_calls`：当 Assistant 调用工具时会创建此 Run Step。相关详细信息在 [Tools](/assistants/tools) 指南的相关章节中介绍。

## 数据访问指南

目前，通过 API 创建的 Assistants、Threads、Messages 和 Vector Stores 的作用域限定在创建它们的 Project 中。因此，任何拥有该 Project API 密钥访问权限的人都能够读取或写入该 Project 中的 Assistants、Threads、Messages 和 Runs。

我们强烈建议以下数据访问控制措施：

*   _实施授权。_ 在对 Assistants、Threads、Messages 和 Vector Stores 执行读取或写入操作之前，确保最终用户有权执行此操作。例如，在数据库中存储最终用户有权访问的对象 ID，并在使用 API 获取对象 ID 之前进行检查。
*   _限制 API 密钥访问。_ 仔细考虑组织中谁应该拥有 API 密钥并成为 Project 的成员。定期审计此列表。API 密钥支持广泛的操作，包括读取和修改敏感信息，如 Messages 和 Files。
*   _创建独立账户。_ 考虑为不同的应用程序创建独立的 Projects，以便在多个应用程序之间隔离数据。
