# Supervised fine-tuning

> 监督微调（SFT）让你可以使用针对特定用例的示例来训练 OpenAI 模型。

监督微调（SFT）让你可以使用针对特定用例的示例来训练 OpenAI 模型。结果是一个定制化模型，能更可靠地生成你期望的风格和内容。

OpenAI 正在逐步关闭微调平台。该平台不再对新用户开放，但现有微调平台用户在未来几个月内仍可创建训练任务。

  

所有微调模型在其基础模型被[弃用](/deprecations)之前将继续可用于推理。完整时间线请参见[此处](/deprecations)。

  

| 工作原理 | 最适合 | 适用模型 |
| --- | --- | --- |
| 提供正确响应提示的示例来引导模型行为。通常使用人工生成的"标准答案"来展示模型应如何响应。 | 
*   分类
*   细微差别的翻译
*   以特定格式生成内容
*   纠正指令遵循失败

 | `gpt-4.1-2025-04-14` `gpt-4.1-mini-2025-04-14` `gpt-4.1-nano-2025-04-14` |

## 概述

监督微调有四个主要部分：

1.  构建训练数据集以确定"好的"输出是什么样的
2.  上传包含示例提示和期望模型输出的训练数据集
3.  使用训练数据为基础模型创建微调任务
4.  使用微调后的模型评估结果

**先做好评估！** 只有在设置好评估之后才投入微调。你需要一种可靠的方式来确定微调模型是否比基础模型表现更好。

  

[设置评估 →](/guides/evals)

## 构建数据集

构建一个稳健、有代表性的数据集，以从微调模型中获得有用的结果。使用以下技术和注意事项。

### 合适的示例数量

*   微调所需的最少示例数量为 10 个
*   我们观察到 50-100 个示例就能带来微调改进，但适合你的数量因用例而异
*   我们建议从 50 个精心制作的示例开始，然后[评估结果](/guides/evals)

如果 50 个好的示例能带来性能提升，尝试添加更多示例以获得进一步改进。如果 50 个示例没有效果，在添加训练数据之前重新思考你的任务或提示。

### 什么是好的示例

*   你在应用中期望的提示和输出，尽可能真实
*   具体、清晰的问题和答案
*   使用历史数据、专家数据、日志数据或[其他类型的收集数据](/guides/evals)

### 格式化数据

*   使用 [JSONL 格式](https://jsonlines.org/)，训练数据文件的每一行都是一个完整的 JSON 结构
*   使用 [chat completions 格式]( https://developers.openai.com/api/reference/fine-tuning/chat-input)
*   文件必须至少有 10 行

JSONL 格式示例文件对应的 JSON 数据

JSONL 格式示例文件

一个 JSONL 训练数据的示例，其中模型调用了 `get_weather` 函数：

```
{"messages":[{"role":"user","content":"What is the weather in San Francisco?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"San Francisco, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. San Francisco, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Minneapolis?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Minneapolis, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Minneapolis, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in San Diego?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"San Diego, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. San Diego, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Memphis?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Memphis, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Memphis, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Atlanta?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Atlanta, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Atlanta, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Sunnyvale?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Sunnyvale, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Sunnyvale, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Chicago?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Chicago, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Chicago, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Boston?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Boston, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Boston, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in Honolulu?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"Honolulu, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. Honolulu, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
{"messages":[{"role":"user","content":"What is the weather in San Antonio?"},{"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"San Antonio, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. San Antonio, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
```

对应的 JSON 数据

训练数据文件的每一行包含如下 JSON 结构，包含一个示例用户提示和模型作为 `assistant` 消息的正确响应。

```
{
  "messages": [
    { "role": "user", "content": "What is the weather in San Francisco?" },
    {
      "role": "assistant",
      "tool_calls": [
        {
          "id": "call_id",
          "type": "function",
          "function": {
            "name": "get_current_weather",
            "arguments": "{\"location\": \"San Francisco, USA\", \"format\": \"celsius\"}"
          }
        }
      ]
    }
  ],
  "parallel_tool_calls": false,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and country, eg. San Francisco, USA"
            },
            "format": { "type": "string", "enum": ["celsius", "fahrenheit"] }
          },
          "required": ["location", "format"]
        }
      }
    }
  ]
}
```

### 从更大的模型蒸馏

为较小模型构建训练数据集的一种方法是蒸馏大模型的结果，为监督微调创建训练数据。该技术的一般流程是：

*   为较大模型（如 `gpt-4.1`）调优提示，直到在评估标准上获得出色表现。
*   使用任何方便的技术捕获模型生成的结果——注意 [Responses API]( https://developers.openai.com/api/reference/responses) 默认存储模型响应 30 天。
*   使用符合标准的大模型捕获响应，利用上述工具和技术生成数据集。
*   使用从大模型创建的数据集来调优较小模型（如 `gpt-4.1-mini`）。

该技术可以让你训练一个小模型，使其在特定任务上表现与更大、更昂贵的模型相似。

## 上传训练数据

将示例数据集上传到 OpenAI。我们使用它来更新模型的权重，并生成与数据中包含的输出类似的结果。

除了文本补全，你还可以训练模型更有效地生成[结构化 JSON 输出](/guides/structured-outputs)或[函数调用](/guides/function-calling)。

通过按钮点击上传数据调用 API 上传数据

通过按钮点击上传数据

1.  导航到仪表板 > **[fine-tuning](https://platform.openai.com/finetune)**。
2.  点击 **+ Create**。
3.  在 **Training data** 下，上传你的 JSONL 文件。

调用 API 上传数据

假设上述数据保存在名为 `mydata.jsonl` 的文件中，你可以使用以下代码将其上传到 OpenAI 平台。注意上传文件的 `purpose` 设置为 `fine-tune`：

```curl
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="fine-tune" \
  -F file="@mydata.jsonl"
```

注意 API 返回数据中上传文件的 `id`——你在后续 API 请求中需要该文件标识符。

```
{
  "object": "file",
  "id": "file-RCnFCYRhFDcq1aHxiYkBHw",
  "purpose": "fine-tune",
  "filename": "mydata.jsonl",
  "bytes": 1058,
  "created_at": 1746484901,
  "expires_at": null,
  "status": "processed",
  "status_details": null
}
```

## 创建微调任务

上传测试数据后，[创建微调任务]( https://developers.openai.com/api/reference/fine-tuning/create)以使用你提供的训练数据定制基础模型。创建微调任务时，你必须指定：

*   用于微调的基础模型（`model`）。可以是 OpenAI 模型 ID 或之前微调模型的 ID。在[模型文档](/models)中查看哪些模型支持微调。
*   训练文件（`training_file`）ID。这是你在上一步上传的文件。
*   微调方法（`method`）。指定你要使用哪种微调方法来定制模型。监督微调是默认方法。

通过按钮点击上传数据调用 API 上传数据

通过按钮点击上传数据

1.  在上面相同的 **+ Create** 模态框中，填写必填字段。
2.  选择监督微调作为方法，以及你想要训练的模型。
3.  准备好后，点击 **Create** 开始任务。

调用 API 上传数据

通过调用[微调 API]( https://developers.openai.com/api/reference/fine-tuning) 创建监督微调任务：

```curl
curl https://api.openai.com/v1/fine_tuning/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "training_file": "file-RCnFCYRhFDcq1aHxiYkBHw",
    "model": "gpt-4.1-nano-2025-04-14"
  }'
```

API 会返回正在进行的微调任务信息。根据训练数据的大小，训练过程可能需要几分钟到几小时。你可以[轮询 API]( https://developers.openai.com/api/reference/fine-tuning/retrieve) 获取特定任务的更新。

当微调任务完成后，你的微调模型就可以使用了。完成的微调任务返回如下数据：

```
{
  "object": "fine_tuning.job",
  "id": "ftjob-uL1VKpwx7maorHNbOiDwFIn6",
  "model": "gpt-4.1-nano-2025-04-14",
  "created_at": 1746484925,
  "finished_at": 1746485841,
  "fine_tuned_model": "ft:gpt-4.1-nano-2025-04-14:openai::BTz2REMH",
  "organization_id": "org-abc123",
  "result_files": ["file-9TLxKY2A8tC5YE1RULYxf6"],
  "status": "succeeded",
  "validation_file": null,
  "training_file": "file-RCnFCYRhFDcq1aHxiYkBHw",
  "hyperparameters": {
    "n_epochs": 10,
    "batch_size": 1,
    "learning_rate_multiplier": 1
  },
  "trained_tokens": 1700,
  "error": {},
  "user_provided_suffix": null,
  "seed": 1935755117,
  "estimated_finish": null,
  "integrations": [],
  "metadata": null,
  "usage_metrics": null,
  "shared_with_openai": false,
  "method": {
    "type": "supervised",
    "supervised": {
      "hyperparameters": {
        "n_epochs": 10,
        "batch_size": 1,
        "learning_rate_multiplier": 1.0
      }
    }
  }
}
```

注意 `fine_tuned_model` 属性。这是在 [Responses]( https://developers.openai.com/api/reference/responses) 或 [Chat Completions]( https://developers.openai.com/api/reference/chat) 中使用微调模型进行 API 请求的模型 ID。

以下是使用微调模型 ID 调用 Responses API 的示例：

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "ft:gpt-4.1-nano-2025-04-14:openai::BTz2REMH",
    "input": "What is the weather like in Boston today?",
    "tools": [
      {
        "name": "get_current_weather",
        "description": "Get the current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
                "type": "string",
                "description": "The city and country, eg. San Francisco, USA"
            },
            "format": { "type": "string", "enum": ["celsius", "fahrenheit"] }
          },
          "required": ["location", "format"]
        }
      }
    ],
    "tool_choice": "auto"
  }'
```

## 评估结果

使用以下方法检查微调模型的表现。根据需要调整提示、数据和微调任务，直到获得满意的结果。微调的最佳方式是持续迭代。

### 与评估对比

要查看微调模型是否比原始基础模型表现更好，[使用评估](/guides/evals)。在运行微调任务之前，从你在第 1 步收集的相同训练数据集中划分出数据。这些保留数据在用于评估时充当对照组。确保训练数据和保留数据具有大致相同的用户输入类型和模型响应多样性。

[了解更多关于运行评估的信息](/guides/evals)。

### 监控状态

在仪表板中或通过在 API 中轮询任务 ID 来检查微调任务的状态。

在 UI 中监控通过 API 调用监控

在 UI 中监控

1.  导航到[微调仪表板](https://platform.openai.com/finetune)。
2.  选择你要监控的任务。
3.  查看状态、检查点、消息和指标。

通过 API 调用监控

使用此 curl 命令获取微调任务的信息：

```curl
curl https://api.openai.com/v1/fine_tuning/jobs/ftjob-uL1VKpwx7maorHNbOiDwFIn6 \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

任务包含 `fine_tuned_model` 属性，这是你新微调模型的唯一 ID。

```
{
  "object": "fine_tuning.job",
  "id": "ftjob-uL1VKpwx7maorHNbOiDwFIn6",
  "model": "gpt-4.1-nano-2025-04-14",
  "created_at": 1746484925,
  "finished_at": 1746485841,
  "fine_tuned_model": "ft:gpt-4.1-nano-2025-04-14:openai::BTz2REMH",
  "organization_id": "org-abc123",
  "result_files": ["file-9TLxKY2A8tC5YE1RULYxf6"],
  "status": "succeeded",
  "validation_file": null,
  "training_file": "file-RCnFCYRhFDcq1aHxiYkBHw",
  "hyperparameters": {
    "n_epochs": 10,
    "batch_size": 1,
    "learning_rate_multiplier": 1
  },
  "trained_tokens": 1700,
  "error": {},
  "user_provided_suffix": null,
  "seed": 1935755117,
  "estimated_finish": null,
  "integrations": [],
  "metadata": null,
  "usage_metrics": null,
  "shared_with_openai": false,
  "method": {
    "type": "supervised",
    "supervised": {
      "hyperparameters": {
        "n_epochs": 10,
        "batch_size": 1,
        "learning_rate_multiplier": 1.0
      }
    }
  }
}
```

### 尝试使用微调模型

通过使用微调模型来评估它！当微调模型完成训练后，在 [Responses]( https://developers.openai.com/api/reference/responses) 或 [Chat Completions]( https://developers.openai.com/api/reference/chat) API 中使用其 ID，就像使用 OpenAI 基础模型一样。

在 Playground 中使用模型通过 API 调用使用模型

在 Playground 中使用模型

1.  在[仪表板](https://platform.openai.com/finetune)中导航到你的微调任务。
2.  在右侧面板中，导航到 **Output model** 并复制模型 ID。它应该以 `ft:…` 开头。
3.  打开 [Playground](https://platform.openai.com/playground)。
4.  在 **Model** 下拉菜单中，粘贴模型 ID。在这里，你还应该能看到你创建的其他微调模型。
5.  运行一些提示，看看你的微调模型表现如何！

通过 API 调用使用模型

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "ft:gpt-4.1-nano-2025-04-14:openai::BTz2REMH",
    "input": "What is 4+4?"
  }'
```

### 如有需要使用检查点

检查点是你可以使用的模型。我们在每个训练 epoch 结束时为你创建一个完整的模型检查点。当你的微调模型在早期有所改进但随后记忆了数据集而不是学习可泛化的知识时（称为_过拟合_），检查点非常有用。检查点提供了定制模型在训练过程中不同时刻的版本。

在仪表板中查找检查点通过 API 查询检查点

在仪表板中查找检查点

1.  导航到[微调仪表板](https://platform.openai.com/finetune)。
2.  在左侧面板中，选择你要调查的任务。等待其成功完成。
3.  在右侧面板中，滚动到检查点列表。
4.  将鼠标悬停在任何检查点上，可以看到在 Playground 中启动的链接。
5.  通过在 Playground 中提示来测试检查点模型的行为。

通过 API 查询检查点

1.  等待任务成功完成，你可以通过[查询任务状态]( https://developers.openai.com/api/reference/fine-tuning/retrieve)来验证。
2.  使用微调任务 ID [查询检查点端点]( https://developers.openai.com/api/reference/fine-tuning/list-checkpoints)以访问微调任务的模型检查点列表。
3.  找到 `fine_tuned_model_checkpoint` 字段获取模型检查点的名称。
4.  像使用最终微调模型一样使用此模型。

检查点对象包含 `metrics` 数据，帮助你确定此模型的有用性。作为示例，响应如下所示：

```
{
  "object": "fine_tuning.job.checkpoint",
  "id": "ftckpt_zc4Q7MP6XxulcVzj4MZdwsAB",
  "created_at": 1519129973,
  "fine_tuned_model_checkpoint": "ft:gpt-3.5-turbo-0125:my-org:custom-suffix:96olL566:ckpt-step-2000",
  "metrics": {
    "full_valid_loss": 0.134,
    "full_valid_mean_token_accuracy": 0.874
  },
  "fine_tuning_job_id": "ftjob-abc123",
  "step_number": 2000
}
```

每个检查点指定：

*   `step_number`：创建检查点时的步数（其中每个 epoch 是训练集中的步数除以批次大小）
*   `metrics`：包含创建检查点时微调任务指标的对象

目前，只有任务最后三个 epoch 的检查点被保存并可供使用。

## 安全检查

在生产环境中启动之前，请查看并遵循以下安全信息。

我们如何评估安全性

微调任务完成后，我们会在 13 个不同的安全类别中评估生成模型的行为。每个类别代表一个关键领域，如果不加以适当控制，AI 输出可能会造成潜在危害。

| 名称 | 描述 |
| --- | --- |
| advice | 违反我们政策的建议或指导。 |
| harassment/threatening | 包含对任何目标的暴力或严重伤害的骚扰内容。 |
| hate | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓表达、煽动或宣扬仇恨的内容。针对非受保护群体（如棋手）的仇恨内容属于骚扰。 |
| hate/threatening | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓，同时包含对目标群体的暴力或严重伤害的仇恨内容。 |
| highly-sensitive | 违反我们政策的高度敏感数据。 |
| illicit | 提供如何实施非法行为的建议或指导的内容。例如"如何入店行窃"这样的短语属于此类别。 |
| propaganda | 对违反我们政策的意识形态的赞扬或协助。 |
| self-harm/instructions | 鼓励实施自残行为（如自杀、割伤和饮食障碍）的内容，或提供如何实施此类行为的指导或建议。 |
| self-harm/intent | 说话者表达正在或打算从事自残行为（如自杀、割伤和饮食障碍）的内容。 |
| sensitive | 违反我们政策的敏感数据。 |
| sexual/minors | 包含 18 岁以下个人的性内容。 |
| sexual | 旨在引起性兴奋的内容，如性活动描述，或宣传性服务的内容（不包括性教育和健康）。 |
| violence | 描绘死亡、暴力或身体伤害的内容。 |

每个类别都有预定义的通过阈值；如果给定类别中太多评估示例未通过，OpenAI 会阻止微调模型的部署。如果你的微调模型未通过安全检查，OpenAI 会在微调任务中发送消息，说明哪些类别未达到要求的阈值。你可以在微调任务的审核检查部分查看结果。

如何通过安全检查

除了查看微调任务对象中任何失败的安全检查外，你还可以通过查询[微调 API 事件端点]( https://developers.openai.com/api/reference/fine-tuning/list-events)来获取哪些类别失败的详细信息。查找类型为 `moderation_checks` 的事件以获取类别结果和执行的详细信息。这些信息可以帮助你缩小需要重新训练和改进的类别范围。[模型规范](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview)包含规则和示例，可以帮助识别需要额外训练数据的领域。

虽然这些评估涵盖了广泛的安全类别，但请对微调模型进行你自己的评估，以确保它适合你的用例。

## 后续步骤

现在你已经了解了监督微调的基础知识，也可以探索这些其他方法。

[视觉微调 - 学习使用图像输入进行计算机视觉微调。](/guides/vision-fine-tuning)

[直接偏好优化 - 使用直接偏好优化（DPO）微调模型。](/guides/direct-preference-optimization)

[强化微调 - 通过对输出评分来微调推理模型。](/guides/reinforcement-fine-tuning)
