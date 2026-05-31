
在 Responses API 实现功能对等之后，我们已弃用 Assistants API。该 API 将于 2026 年 8 月 26 日关闭。请按照[迁移指南](/platform/assistants/migration)更新您的集成。[了解更多](https://platform.openai.com/docs/guides/migrate-to-responses)。

  

我们正在从 Assistants API 迁移到新的 [Responses API](/guides/responses-vs-chat-completions)，以提供更简单、更灵活的心智模型。

Responses 更简单——发送输入项并获取输出项。使用 Responses API，您还可以获得更好的性能和新功能，如[深度研究](/guides/deep-research)、[MCP](/guides/tools-remote-mcp) 和[计算机使用](/guides/tools-computer-use)。此更改还允许您管理对话，而不是传回 `previous_response_id`。

### 有什么变化？

| 之前 | 现在 | 原因 |
| --- | --- | --- |
| `Assistants` | `Prompts` | Prompts 保存配置（模型、工具、指令），更容易进行版本管理和更新 |
| `Threads` | `Conversations` | 项目流而不仅仅是消息 |
| `Runs` | `Responses` | Responses 发送输入项或使用对话对象并接收输出项；工具调用循环由显式管理 |
| `Run steps` | `Items` | 通用对象——可以是消息、工具调用、输出等 |

## 从 Assistants 到 Prompts

Assistants 是持久化的 API 对象，捆绑了模型选择、指令和工具声明——完全通过 API 创建和管理。它们的替代品 Prompts 只能在仪表板中创建，您可以在开发产品时对其进行版本管理。

### 为什么这很有帮助

*   **可移植性和版本管理**：您可以快照、审查、比较差异和回滚 prompt 规范。您还可以对 prompt 进行版本管理，这样您的代码只需指向最新版本。
*   **关注点分离**：您的应用程序代码现在处理编排（历史修剪、工具循环、重试），而您的 prompt 专注于高级行为和约束（系统指导、工具可用性、结构化输出模式、温度默认值）。
*   **实时兼容性**：当您通过 Realtime API 连接时，可以重用相同的 prompt 配置，为您在聊天、流式传输和低延迟交互会话中提供统一的行为定义。
*   **工具和输出一致性**：使用 prompts，您启动的每个 Responses 或 Realtime 会话都继承一致的契约，因为 prompts 封装了工具模式和结构化输出期望。

### 实际迁移步骤

1.  识别每个现有 Assistant 的_指令 + 工具_组合。
2.  在仪表板中，将该组合重新创建为命名的 prompt。
3.  将 prompt ID（或其导出的规范）存储在源代码控制中，以便应用程序代码可以引用稳定的标识符。
4.  在发布期间，通过交换 prompt ID 运行 A/B 测试——无需以编程方式创建或删除 assistant 对象。

将 prompt 视为可插入 Responses 或 Realtime API 的**版本化行为配置文件**。

* * *

## 从 Threads 到 Conversations

Thread 是存储在服务器端的消息集合。Threads _只能_存储消息。Conversations 存储项目，可以包括消息、工具调用、工具输出和其他数据。

### 请求示例

Thread 对象

```
thread = openai.beta.threads.create(
  messages=[{"role": "user", "content": "what are the 5 Ds of dodgeball?"}],
  metadata={"user_id": "peter_le_fleur"},
)
```

Conversation 对象

```
conversation = openai.conversations.create(
  items=[{"role": "user", "content": "what are the 5 Ds of dodgeball?"}],
  metadata={"user_id": "peter_le_fleur"},
)
```

### 响应示例

Thread 对象

```
{
"id": "thread_CrXtCzcyEQbkAcXuNmVSKFs1",
"object": "thread",
"created_at": 1752855924,
"metadata": {
  "user_id": "peter_le_fleur"
},
"tool_resources": {}
}
```

Conversation 对象

```
{
"id": "conv_68542dc602388199a30af27d040cefd4087a04b576bfeb24",
"object": "conversation",
"created_at": 1752855924,
"metadata": {
	"user_id": "peter_le_fleur"
}
}
```

* * *

## 从 Runs 到 Responses

Runs 是针对 threads 执行的异步进程。请参见下面的示例。Responses 更简单：提供一组输入项来执行，然后获取输出项列表。

Responses 设计为可以单独使用，但您也可以将它们与 prompt 和 conversation 对象一起使用，以存储上下文和配置。

### 请求示例

Run 对象

```
thread_id = "thread_CrXtCzcyEQbkAcXuNmVSKFs1"
assistant_id = "asst_8fVY45hU3IM6creFkVi5MBKB"

run = openai.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant.id)

while run.status in ("queued", "in_progress"):
time.sleep(1)
run = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
```

Response 对象

```
response = openai.responses.create(
model="gpt-4.1",
input=[{"role": "user", "content": "What are the 5 Ds of dodgeball?"}]
conversation: "conv_689667905b048191b4740501625afd940c7533ace33a2dab"
)
```

### 响应示例

Run 对象

```
{
"id": "run_FKIpcs5ECSwuCmehBqsqkORj",
"assistant_id": "asst_8fVY45hU3IM6creFkVi5MBKB",
"cancelled_at": null,
"completed_at": 1752857327,
"created_at": 1752857322,
"expires_at": null,
"failed_at": null,
"incomplete_details": null,
"instructions": null,
"last_error": null,
"max_completion_tokens": null,
"max_prompt_tokens": null,
"metadata": {},
"model": "gpt-4.1",
"object": "thread.run",
"parallel_tool_calls": true,
"required_action": null,
"response_format": "auto",
"started_at": 1752857324,
"status": "completed",
"thread_id": "thread_CrXtCzcyEQbkAcXuNmVSKFs1",
"tool_choice": "auto",
"tools": [],
"truncation_strategy": {
  "type": "auto",
  "last_messages": null
},
"usage": {
  "completion_tokens": 130,
  "prompt_tokens": 34,
  "total_tokens": 164,
  "prompt_token_details": {
    "cached_tokens": 0
  },
  "completion_tokens_details": {
    "reasoning_tokens": 0
  }
},
"temperature": 1.0,
"top_p": 1.0,
"tool_resources": {},
"reasoning_effort": null
}
```

Response 对象

```
{
"id": "resp_687a7b53036c819baad6012d58b39bcb074adcd9e24850fc",
"created_at": 1752857427,
"conversation": {
  "id": "conv_689667905b048191b4740501625afd940c7533ace33a2dab"
},
"error": null,
"incomplete_details": null,
"instructions": null,
"metadata": {},
"model": "gpt-4.1-2025-04-14",
"object": "response",
"output": [
  {
    "id": "msg_687a7b542948819ba79e77e14791ef83074adcd9e24850fc",
    "content": [
      {
        "annotations": [],
        "text": "The \"5 Ds of Dodgeball\" are a humorous set of rules made famous by the 2004 comedy film **\"Dodgeball: A True Underdog Story.\"** In the movie, dodgeball coach Patches O'Houlihan teaches these basics to his team. The **5 Ds** are:

1. **Dodge**
2. **Duck**
3. **Dip**
4. **Dive**
5. **Dodge** (yes, dodge is listed twice for emphasis!)

In summary:  
> **"If you can dodge a wrench, you can dodge a ball!"**

These 5 Ds are not official competitive rules, but have become a fun and memorable pop culture reference for the sport of dodgeball.",
        "type": "output_text",
        "logprobs": []
      }
    ],
    "role": "assistant",
    "status": "completed",
    "type": "message"
  }
],
"parallel_tool_calls": true,
"temperature": 1.0,
"tool_choice": "auto",
"tools": [],
"top_p": 1.0,
"background": false,
"max_output_tokens": null,
"previous_response_id": null,
"reasoning": {
  "effort": null,
  "generate_summary": null,
  "summary": null
},
"service_tier": "scale",
"status": "completed",
"text": {
  "format": {
    "type": "text"
  }
},
"truncation": "disabled",
"usage": {
  "input_tokens": 17,
  "input_tokens_details": {
    "cached_tokens": 0
  },
  "output_tokens": 150,
  "output_tokens_details": {
    "reasoning_tokens": 0
  },
  "total_tokens": 167
},
"user": null,
"max_tool_calls": null,
"store": true,
"top_logprobs": 0
}
```

* * *

## 迁移您的集成

按照以下迁移步骤从 Assistants API 迁移到 Responses API，不会丢失任何功能支持。

### 1\. 从您的 assistants 创建 prompts

1.  识别应用程序中最重要的 assistant 对象。
2.  在仪表板中找到它们并点击 `Create prompt`。

这将从每个现有的 assistant 对象创建一个 prompt 对象。

### 2\. 将新用户聊天迁移到 conversations 和 responses

我们不会提供将 Threads 迁移到 Conversations 的自动化工具。相反，我们建议将新用户线程迁移到 conversations，并根据需要回填旧线程。

以下是如何回填一个 thread 的示例：

```
thread_id = "thread_EIpHrTAVe0OzoLQg3TXfvrkG"

for page in openai.beta.threads.messages.list(thread_id=thread_id, order="asc").iter_pages():
    messages += page.data

items = []
for m in messages:
    item = {"role": m.role}
    item_content = []

    for content in m.content:
        match content.type:
            case "text":
                item_content_type = "input_text" if m.role == "user" else "output_text"
                item_content += [{"type": item_content_type, "text": content.text.value}]
            case "image_url":
                item_content + [
                    {
                        "type": "input_image",
                        "image_url": content.image_url.url,
                        "detail": content.image_url.detail,
                    }
                ]

    item |= {"content": item_content}
    items.append(item)

# 使用转换后的项目创建对话
conversation = openai.conversations.create(items=items)
```

## 完整示例对比

以下是使用 Assistants API 和 Responses API 的几个简单集成示例，以便您了解它们的对比。

### 用户聊天应用

Assistants APIResponses API

Assistants API

```
thread = openai.threads.create()

  @app.post("/messages")
  async def message(message: Message):
  	openai.beta.threads.messages.create(
  		role="user",
  		content=message.content
  	)

  	run = openai.beta.threads.runs.create(
  		assistant_id=os.getenv("ASSISTANT_ID"),
  		thread_id=thread.id
  	)
  	while run.status in ("queued", "in_progress"):
      await asyncio.sleep(1)
      run = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

  	messages = openai.beta.threads.messages.list(
  		order="desc", limit=1, thread_id=thread.id
  	)

  	return { "content": messages[-1].content }
```

Responses API

```
conversation = openai.conversations.create()

  @app.post("/messages")
  async def message(message: Message):
  	response = openai.responses.create(
  		prompt={ "id": os.getenv("PROMPT_ID") },
  		input=[{ "role": "user", "content": message.content }]
  	)

  	return { "content": response.output_text }'
```
