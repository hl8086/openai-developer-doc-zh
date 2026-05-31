
评估（通常称为 **evals**）用于测试模型输出，以确保它们满足你指定的风格和内容标准。编写评估来了解你的 LLM 应用程序相对于预期的表现如何，特别是在升级或尝试新模型时，是构建可靠应用程序的重要组成部分。

在本指南中，我们将重点介绍**使用 [Evals API]( https://developers.openai.com/api/reference/evals) 以编程方式配置评估**。如果你愿意，也可以[在 OpenAI 仪表板中](https://platform.openai.com/evaluations)配置评估。

如果你是评估新手，或者希望在构建评估时有一个更具交互性的实验环境，可以考虑尝试 [Datasets](/guides/evaluation-getting-started)。

总体而言，构建和运行 LLM 应用程序评估有三个步骤：

1.  将要完成的任务描述为一个评估
2.  使用测试输入（提示词和输入数据）运行评估
3.  分析结果，然后迭代和改进你的提示词

这个过程有点类似于行为驱动开发（BDD），即在实现和测试系统之前，先指定系统应该如何行为。让我们看看如何使用 [Evals API]( https://developers.openai.com/api/reference/evals) 完成上述每个步骤。

## 为任务创建评估

创建评估首先要描述模型需要完成的任务。假设我们想使用模型将 IT 支持工单的内容分类为三个类别之一：`Hardware`、`Software` 或 `Other`。

要实现此用例，你可以使用 [Chat Completions API]( https://developers.openai.com/api/reference/chat) 或 [Responses API]( https://developers.openai.com/api/reference/responses)。下面的两个示例都将[开发者消息](/guides/text)与包含支持工单文本的用户消息结合使用。

**分类 IT 支持工单**

::: code-group
```curl
curl https://api.openai.com/v1/responses \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-4.1",
        "input": [
            {
                "role": "developer",
                "content": "Categorize the following support ticket into one of Hardware, Software, or Other."
            },
            {
                "role": "user",
                "content": "My monitor wont turn on - help!"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
`;

const ticket = "My monitor won't turn on - help!";

const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
        { role: "developer", content: instructions },
        { role: "user", content: ticket },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

instructions = """
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
"""

ticket = "My monitor won't turn on - help!"

response = client.responses.create(
    model="gpt-4.1",
    input=[
        {"role": "developer", "content": instructions},
        {"role": "user", "content": ticket},
    ],
)

print(response.output_text)
```

:::





**分类 IT 支持工单**

::: code-group
```curl
curl https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-4.1",
        "messages": [
            {
                "role": "developer",
                "content": "Categorize the following support ticket into one of Hardware, Software, or Other."
            },
            {
                "role": "user",
                "content": "My monitor wont turn on - help!"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
`;

const ticket = "My monitor won't turn on - help!";

const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
        { role: "developer", content: instructions },
        { role: "user", content: ticket },
    ],
});

console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

instructions = """
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
"""

ticket = "My monitor won't turn on - help!"

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "developer", "content": instructions},
        {"role": "user", "content": ticket}
    ]
)

print(completion.choices[0].message.content)
```

:::





让我们设置一个评估来[通过 API]( https://developers.openai.com/api/reference/evals) 测试此行为。评估需要两个关键要素：

*   `data_source_config`：你将与评估一起使用的测试数据的模式。
*   `testing_criteria`：确定模型输出是否正确的[评分器](/guides/graders)。

**创建评估**

::: code-group
```curl
curl https://api.openai.com/v1/evals \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "IT Ticket Categorization",
        "data_source_config": {
            "type": "custom",
            "item_schema": {
                "type": "object",
                "properties": {
                    "ticket_text": { "type": "string" },
                    "correct_label": { "type": "string" }
                },
                "required": ["ticket_text", "correct_label"]
            },
            "include_sample_schema": true
        },
        "testing_criteria": [
            {
                "type": "string_check",
                "name": "Match output to human label",
                "input": "\{\{ sample.output_text \}\}",
                "operation": "eq",
                "reference": "\{\{ item.correct_label \}\}"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const evalObj = await openai.evals.create({
    name: "IT Ticket Categorization",
    data_source_config: {
        type: "custom",
        item_schema: {
            type: "object",
            properties: {
                ticket_text: { type: "string" },
                correct_label: { type: "string" }
            },
            required: ["ticket_text", "correct_label"],
        },
        include_sample_schema: true,
    },
    testing_criteria: [
        {
            type: "string_check",
            name: "Match output to human label",
            input: "\{\{ sample.output_text \}\}",
            operation: "eq",
            reference: "\{\{ item.correct_label \}\}",
        },
    ],
});

console.log(evalObj);
```

```python
from openai import OpenAI
client = OpenAI()

eval_obj = client.evals.create(
    name="IT Ticket Categorization",
    data_source_config={
        "type": "custom",
        "item_schema": {
            "type": "object",
            "properties": {
                "ticket_text": {"type": "string"},
                "correct_label": {"type": "string"},
            },
            "required": ["ticket_text", "correct_label"],
        },
        "include_sample_schema": True,
    },
    testing_criteria=[
        {
            "type": "string_check",
            "name": "Match output to human label",
            "input": "\{\{ sample.output_text \}\}",
            "operation": "eq",
            "reference": "\{\{ item.correct_label \}\}",
        }
    ],
)

print(eval_obj)
```

:::





说明：data\_source\_config 参数

运行此评估需要一个测试数据集，代表你期望提示词处理的数据类型（本指南稍后会介绍如何创建测试数据集）。在我们的 `data_source_config` 参数中，我们指定数据集中的每个 **item** 将符合一个 [JSON schema](https://json-schema.org/)，包含两个属性：

*   `ticket_text`：包含支持工单内容的文本字符串
*   `correct_label`：由人工提供的"真实标签"输出，模型应该匹配该输出

由于我们将在测试标准中引用 **sample**（给定提示词后模型生成的输出），我们还将 `include_sample_schema` 设置为 `true`。

```
{
  "type": "custom",
  "item_schema": {
    "type": "object",
    "properties": {
      "ticket": { "type": "string" },
      "category": { "type": "string" }
    },
    "required": ["ticket", "category"]
  },
  "include_sample_schema": true
}
```

说明：testing\_criteria 参数

在我们的 `testing_criteria` 中，我们定义了如何判断模型输出是否满足数据集中每个项目的要求。在这种情况下，我们只希望模型根据输入工单输出三个类别字符串之一。它输出的字符串应该与测试数据中人工标注的 `correct_label` 字段完全匹配。因此在这种情况下，我们将使用 `string_check` 评分器来评估输出。

在测试配置中，我们将引入模板语法，由下面的 `\{\{` 和 `\}\}` 括号表示。这是我们将动态内容插入此评估测试的方式。

*   `\{\{ item.correct_label \}\}` 引用测试数据中的真实标签值。
*   `\{\{ sample.output_text \}\}` 引用我们将从模型生成的内容来评估提示词——我们将在实际启动评估运行时展示如何做到这一点。

```
{
  "type": "string_check",
  "name": "Category string match",
  "input": "\{\{ sample.output_text \}\}",
  "operation": "eq",
  "reference": "\{\{ item.category \}\}"
}
```

创建评估后，它将被分配一个 UUID，稍后在启动运行时需要用它来引用该评估。

```
{
  "object": "eval",
  "id": "eval_67e321d23b54819096e6bfe140161184",
  "data_source_config": {
    "type": "custom",
    "schema": { ... omitted for brevity... }
  },
  "testing_criteria": [
    {
      "name": "Match output to human label",
      "id": "Match output to human label-c4fdf789-2fa5-407f-8a41-a6f4f9afd482",
      "type": "string_check",
      "input": "\{\{ sample.output_text \}\}",
      "reference": "\{\{ item.correct_label \}\}",
      "operation": "eq"
    }
  ],
  "name": "IT Ticket Categorization",
  "created_at": 1742938578,
  "metadata": {}
}
```

现在我们已经创建了一个描述应用程序期望行为的评估，让我们用一组测试数据来测试提示词。

## 使用评估测试提示词

现在我们已经在评估中定义了应用程序的期望行为，让我们构建一个提示词，使其能够为代表性的测试数据样本可靠地生成正确的输出。

### 上传测试数据

有多种方式可以为评估运行提供测试数据，但上传一个 [JSONL](https://jsonlines.org/) 文件可能比较方便，该文件包含符合我们创建评估时指定的模式的数据。下面是一个符合我们设置的模式的示例 JSONL 文件：

```
{ "item": { "ticket_text": "My monitor won't turn on!", "correct_label": "Hardware" } }
{ "item": { "ticket_text": "I'm in vim and I can't quit!", "correct_label": "Software" } }
{ "item": { "ticket_text": "Best restaurants in Cleveland?", "correct_label": "Other" } }
```

此数据集包含测试输入和真实标签，用于与模型输出进行比较。

接下来，让我们将测试数据文件上传到 OpenAI 平台，以便稍后引用。你可以[在仪表板中上传文件](https://platform.openai.com/storage/files)，也可以[通过 API 上传文件]( https://developers.openai.com/api/reference/files/create)。以下示例假设你在保存了上述示例 JSON 数据的目录中运行命令，文件名为 `tickets.jsonl`：

**上传测试数据文件**

::: code-group
```curl
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="evals" \
  -F file="@tickets.jsonl"
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const file = await openai.files.create({
    file: fs.createReadStream("tickets.jsonl"),
    purpose: "evals",
});

console.log(file);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("tickets.jsonl", "rb"),
    purpose="evals"
)

print(file)
```

:::





上传文件时，请记下响应负载中的唯一 `id` 属性（如果通过浏览器上传，也可以在 UI 中找到）——我们稍后需要引用该值：

```
{
  "object": "file",
  "id": "file-CwHg45Fo7YXwkWRPUkLNHW",
  "purpose": "evals",
  "filename": "tickets.jsonl",
  "bytes": 208,
  "created_at": 1742834798,
  "expires_at": null,
  "status": "processed",
  "status_details": null
}
```

### 创建评估运行

测试数据准备就绪后，让我们评估一个提示词，看看它在测试标准下的表现如何。通过 API，我们可以[创建评估运行]( https://developers.openai.com/api/reference/evals/createRun)来完成此操作。

请确保将 `YOUR_EVAL_ID` 和 `YOUR_FILE_ID` 替换为你在上述步骤中创建的评估配置和测试数据文件的唯一 ID。

**创建评估运行**

::: code-group
```curl
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Categorization text run",
        "data_source": {
            "type": "responses",
            "model": "gpt-4.1",
            "input_messages": {
                "type": "template",
                "template": [
                    {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."},
                    {"role": "user", "content": "\{\{ item.ticket_text \}\}"}
                ]
            },
            "source": { "type": "file_id", "id": "YOUR_FILE_ID" }
        }
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.create("YOUR_EVAL_ID", {
    name: "Categorization text run",
    data_source: {
        type: "responses",
        model: "gpt-4.1",
        input_messages: {
            type: "template",
            template: [
                { role: "developer", content: "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words." },
                { role: "user", content: "\{\{ item.ticket_text \}\}" },
            ],
        },
        source: { type: "file_id", id: "YOUR_FILE_ID" },
    },
});

console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.create(
    "YOUR_EVAL_ID",
    name="Categorization text run",
    data_source={
        "type": "responses",
        "model": "gpt-4.1",
        "input_messages": {
            "type": "template",
            "template": [
                {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words."},
                {"role": "user", "content": "\{\{ item.ticket_text \}\}"},
            ],
        },
        "source": {"type": "file_id", "id": "YOUR_FILE_ID"},
    },
)

print(run)
```

:::





**创建评估运行**

::: code-group
```curl
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Categorization text run",
        "data_source": {
            "type": "completions",
            "model": "gpt-4.1",
            "input_messages": {
                "type": "template",
                "template": [
                    {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."},
                    {"role": "user", "content": "\{\{ item.ticket_text \}\}"}
                ]
            },
            "source": { "type": "file_id", "id": "YOUR_FILE_ID" }
        }
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.create("YOUR_EVAL_ID", {
    name: "Categorization text run",
    data_source: {
        type: "completions",
        model: "gpt-4.1",
        input_messages: {
            type: "template",
            template: [
                { role: "developer", content: "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words." },
                { role: "user", content: "\{\{ item.ticket_text \}\}" },
            ],
        },
        source: { type: "file_id", id: "YOUR_FILE_ID" },
    },
});

console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.create(
    "YOUR_EVAL_ID",
    name="Categorization text run",
    data_source={
        "type": "completions",
        "model": "gpt-4.1",
        "input_messages": {
            "type": "template",
            "template": [
                {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words."},
                {"role": "user", "content": "\{\{ item.ticket_text \}\}"},
            ],
        },
        "source": {"type": "file_id", "id": "YOUR_FILE_ID"},
    },
)

print(run)
```

:::





当我们创建运行时，我们使用 [Chat Completions](/guides/text?api-mode=chat) 消息数组或 [Responses]( https://developers.openai.com/api/reference/responses) 输入来设置提示词。此提示词用于为数据集中的每一行测试数据生成模型响应。我们可以使用双花括号语法来模板化动态变量 `item.ticket_text`，该变量取自当前测试数据项。

如果评估运行创建成功，你将收到如下所示的 API 响应：

```
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/abc123",
    "status": "queued",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": { ... },
    "per_model_usage": null,
    "per_testing_criteria_results": null,
    "data_source": {
        "type": "responses",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in...."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "\{\{item.ticket_text\}\}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```

```
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/abc123",
    "status": "queued",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": { ... },
    "per_model_usage": null,
    "per_testing_criteria_results": null,
    "data_source": {
        "type": "completions",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in...."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "\{\{item.ticket_text\}\}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```

你的评估运行现在已排队，它将在处理数据集中的每一行时异步执行，使用我们指定的提示词和模型生成响应进行测试。

## 分析结果

要在运行成功、失败或被取消时接收更新，请创建一个 webhook 端点并订阅 `eval.run.succeeded`、`eval.run.failed` 和 `eval.run.canceled` 事件。有关更多详细信息，请参阅 [webhooks 指南](/guides/webhooks)。

根据数据集的大小，评估运行可能需要一些时间才能完成。你可以在仪表板中查看当前状态，也可以[通过 API 获取评估运行的当前状态]( https://developers.openai.com/api/reference/evals/getRun)：

**获取评估运行状态**

::: code-group
```curl
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs/YOUR_RUN_ID \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json"
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.retrieve("YOUR_RUN_ID", {
    eval_id: "YOUR_EVAL_ID",
});
console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.retrieve("YOUR_EVAL_ID", "YOUR_RUN_ID")
print(run)
```

:::





你需要评估和评估运行的 UUID 来获取其状态。获取后，你将看到如下所示的评估运行数据：

```
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/xxx",
    "status": "completed",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": {
        "total": 3,
        "errored": 0,
        "failed": 0,
        "passed": 3
    },
    "per_model_usage": [
        {
            "model_name": "gpt-4o-2024-08-06",
            "invocation_count": 3,
            "prompt_tokens": 166,
            "completion_tokens": 6,
            "total_tokens": 172,
            "cached_tokens": 0
        }
    ],
    "per_testing_criteria_results": [
        {
            "testing_criteria": "Match output to human label-40d67441-5000-4754-ab8c-181c125803ce",
            "passed": 3,
            "failed": 0
        }
    ],
    "data_source": {
        "type": "responses",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "\{\{item.ticket_text\}\}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```

```
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/xxx",
    "status": "completed",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": {
        "total": 3,
        "errored": 0,
        "failed": 0,
        "passed": 3
    },
    "per_model_usage": [
        {
            "model_name": "gpt-4o-2024-08-06",
            "invocation_count": 3,
            "prompt_tokens": 166,
            "completion_tokens": 6,
            "total_tokens": 172,
            "cached_tokens": 0
        }
    ],
    "per_testing_criteria_results": [
        {
            "testing_criteria": "Match output to human label-40d67441-5000-4754-ab8c-181c125803ce",
            "passed": 3,
            "failed": 0
        }
    ],
    "data_source": {
        "type": "completions",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "\{\{item.ticket_text\}\}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```

API 响应包含有关测试标准结果、生成模型响应的 API 使用情况的详细信息，以及一个 `report_url` 属性，可将你带到仪表板中的页面，在那里你可以直观地探索结果。

在我们的简单测试中，模型为小型测试用例样本可靠地生成了我们想要的内容。实际上，你通常需要使用更多标准、不同的提示词和不同的数据集来运行评估。但上述过程为你提供了为 LLM 应用构建强大评估所需的所有工具！

## 后续步骤

现在你知道如何通过 API 和仪表板创建和运行评估了！以下是一些在你继续改进模型结果时可能对你有用的其他资源。

[Cookbook：检测提示词回归 - 在迭代提示词时跟踪其性能。](https://cookbook.openai.com/examples/evaluation/use-cases/regression)

[Cookbook：批量模型和提示词实验 - 一次比较多个不同提示词和模型的结果。](https://cookbook.openai.com/examples/evaluation/use-cases/bulk-experimentation)

[Cookbook：监控存储的补全 - 检查存储的补全以测试提示词回归。](https://cookbook.openai.com/examples/evaluation/use-cases/completion-monitoring)

[微调 - 提高模型生成针对你的用例定制的响应的能力。](/guides/fine-tuning)

[模型蒸馏 - 了解如何将大型模型的结果蒸馏到更小、更便宜、更快的模型。](/guides/distillation)
