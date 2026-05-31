
通过 OpenAI API，你可以使用[大语言模型](/models)从提示词生成文本，就像使用 [ChatGPT](https://chatgpt.com) 一样。模型几乎可以生成任何类型的文本响应——如代码、数学方程式、结构化 JSON 数据或类似人类的散文。

使用 [Responses API]( https://developers.openai.com/api/reference/responses) 进行像这样的文本生成直接模型请求。

通过简单提示词生成文本

javascript

```
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);
```

```
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
```

```
openai responses create \
  --model "gpt-5.5" \
  --input "Write a one-sentence bedtime story about a unicorn." \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text'
```

```
using System;
using System.Threading.Tasks;
using OpenAI;

class Program
{
    static async Task Main()
    {
        var client = new OpenAIClient(
            Environment.GetEnvironmentVariable("OPENAI_API_KEY")
        );

        var response = await client.Responses.CreateAsync(new ResponseCreateRequest
        {
            Model = "gpt-5.5",
            Input = "Say 'this is a test.'"
        });

        Console.WriteLine($"[ASSISTANT]: {response.OutputText()}");
    }
}
```

```
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;

public class Main {
    public static void main(String[] args) {
        OpenAIClient client = OpenAIOkHttpClient.fromEnv();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .input("Say this is a test")
                .model("gpt-5.5")
                .build();

        Response response = client.responses().create(params);
        System.out.println(response.outputText());
    }
}
```

```
package main

import (
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

func main() {
	client := openai.NewClient(
		option.WithAPIKey("My API Key"), // or set OPENAI_API_KEY in your env
	)

	resp, err := client.Responses.New(context.TODO(), openai.ResponseNewParams{
		Model: "gpt-5.5",
		Input: responses.ResponseNewParamsInputUnion{OfString: openai.String("Say this is a test")},
	})
	if err != nil {
		panic(err.Error())
	}

	fmt.Println(resp.OutputText())
}
```

```
require "openai"

openai = OpenAI::Client.new

response = openai.responses.create(
  model: "gpt-5.5",
  input: "Write a one-sentence bedtime story about a unicorn."
)

puts(response.output_text)
```

```
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "input": "Write a one-sentence bedtime story about a unicorn."
    }'
```

模型生成的内容数组位于响应的 `output` 属性中。在这个简单示例中，我们只有一个输出，如下所示：

```
[
  {
    "id": "msg_67b73f697ba4819183a15cc17d011509",
    "type": "message",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
        "annotations": []
      }
    ]
  }
]
```

**`output` 数组通常包含不止一个项目！** 它可以包含工具调用、由[推理模型](/guides/reasoning)生成的推理 token 相关数据以及其他项目。不能安全地假设模型的文本输出位于 `output[0].content[0].text`。

我们的一些[官方 SDK](/libraries) 在模型响应上提供了一个便捷的 `output_text` 属性，它将模型的所有文本输出聚合为一个字符串。这可以作为访问模型文本输出的快捷方式。

除了纯文本之外，你还可以让模型以 JSON 格式返回结构化数据——这个功能称为[**结构化输出**](/guides/structured-outputs)。

## 提示词工程

**提示词工程**是为模型编写有效指令的过程，使其能够持续生成满足你需求的内容。

由于模型生成的内容是非确定性的，通过提示词获得期望输出是艺术与科学的结合。然而，你可以应用一些技术和最佳实践来持续获得良好的结果。

一些提示词工程技术适用于每个模型，例如使用消息角色。但不同的模型可能需要不同的提示方式才能产生最佳结果。即使是同一系列中不同快照的模型也可能产生不同的结果。因此，当你构建更复杂的应用程序时，我们强烈建议：

*   将你的生产应用程序固定到特定的[模型快照](/models)（例如 `gpt-5-2025-08-07`）以确保行为一致
*   构建[评估](/guides/evals)来衡量提示词的行为，以便在迭代或更改和升级模型版本时监控提示词性能

现在，让我们来看看可用于构建提示词的一些工具和技术。

## 选择模型和 API

OpenAI 有许多不同的[模型](/models)和多个 API 可供选择。[推理模型](/guides/reasoning)（如 o3 和 GPT-5）的行为与聊天模型不同，对不同的提示词响应更好。一个重要的注意事项是，推理模型在使用 Responses API 时表现更好，展现出更高的智能。

如果你正在构建任何文本生成应用，我们建议使用 Responses API 而不是旧版 Chat Completions API。如果你正在使用推理模型，[迁移到 Responses](/guides/migrate-to-responses) 尤其有用。

## 消息角色和指令遵循

你可以使用 `instructions` API 参数配合**消息角色**，以[不同的权限级别](https://model-spec.openai.com/2025-02-12.html#chain_of_command)向模型提供指令。

`instructions` 参数为模型提供关于生成响应时应如何表现的高级指令，包括语气、目标和正确响应的示例。通过这种方式提供的任何指令都将优先于 `input` 参数中的提示词。

**使用指令生成文本**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    instructions: "Talk like a pirate.",
    input: "Are semicolons optional in JavaScript?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "low"},
    instructions="Talk like a pirate.",
    input="Are semicolons optional in JavaScript?",
)

print(response.output_text)
```

```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "reasoning": {"effort": "low"},
        "instructions": "Talk like a pirate.",
        "input": "Are semicolons optional in JavaScript?"
    }'
```

:::

上面的示例大致等同于在 `input` 数组中使用以下输入消息：

**使用不同角色的消息生成文本**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "developer",
            content: "Talk like a pirate."
        },
        {
            role: "user",
            content: "Are semicolons optional in JavaScript?",
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "developer",
            "content": "Talk like a pirate."
        },
        {
            "role": "user",
            "content": "Are semicolons optional in JavaScript?"
        }
    ]
)

print(response.output_text)
```

```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "reasoning": {"effort": "low"},
        "input": [
            {
                "role": "developer",
                "content": "Talk like a pirate."
            },
            {
                "role": "user",
                "content": "Are semicolons optional in JavaScript?"
            }
        ]
    }'
```

:::

请注意，`instructions` 参数仅适用于当前的响应生成请求。如果你使用 `previous_response_id` 参数[管理对话状态](/guides/conversation-state)，之前轮次使用的 `instructions` 将不会出现在上下文中。

[OpenAI 模型规范](https://model-spec.openai.com/2025-02-12.html#chain_of_command)描述了我们的模型如何对不同角色的消息赋予不同的优先级。

| developer | user | assistant |
| --- | --- | --- |
| `developer` 消息是应用程序开发者提供的指令，优先级高于用户消息。 | `user` 消息是终端用户提供的指令，优先级低于开发者消息。 | 模型生成的消息具有 `assistant` 角色。 |

一个多轮对话可能由多条这些类型的消息组成，以及你和模型提供的其他内容类型。了解更多关于[管理对话状态](/guides/conversation-state)的信息。

你可以将 `developer` 和 `user` 消息想象成编程语言中的函数及其参数。

*   `developer` 消息提供系统的规则和业务逻辑，就像函数定义。
*   `user` 消息提供输入和配置，`developer` 消息的指令将应用于这些输入，就像函数的参数。

## 可复用提示词

在 OpenAI 仪表板中，你可以开发可复用的[提示词](https://platform.openai.com/chat/edit)，并在 API 请求中使用它们，而不是在代码中指定提示词的内容。这样，你可以更轻松地构建和评估提示词，并在不更改集成代码的情况下部署改进版本的提示词。

工作方式如下：

1.  在[仪表板](https://platform.openai.com/chat/edit)中**创建可复用提示词**，使用 `\{\{customer_name\}\}` 等占位符。
2.  在 API 请求中使用 `prompt` 参数**使用提示词**。prompt 参数对象有三个可配置的属性：
    *   `id` — 提示词的唯一标识符，可在仪表板中找到
    *   `version` — 提示词的特定版本（默认为仪表板中指定的"当前"版本）
    *   `variables` — 用于替换提示词中变量的值映射。替换值可以是字符串，也可以是其他 Response 输入消息类型，如 `input_image` 或 `input_file`。[查看完整 API 参考]( https://developers.openai.com/api/reference/responses/create)。

字符串变量带文件输入的变量

字符串变量

**使用提示词模板生成文本**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    prompt: {
        id: "pmpt_abc123",
        version: "2",
        variables: {
            customer_name: "Jane Doe",
            product: "40oz juice box"
        }
    }
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    prompt={
        "id": "pmpt_abc123",
        "version": "2",
        "variables": {
            "customer_name": "Jane Doe",
            "product": "40oz juice box"
        }
    }
)

print(response.output_text)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "prompt": {
      "id": "pmpt_abc123",
      "version": "2",
      "variables": {
        "customer_name": "Jane Doe",
        "product": "40oz juice box"
      }
    }
  }'
```

:::

带文件输入的变量

**带文件输入变量的提示词模板**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

// Upload a PDF we will reference in the prompt variables
const file = await client.files.create({
    file: fs.createReadStream("draconomicon.pdf"),
    purpose: "user_data",
});

const response = await client.responses.create({
    model: "gpt-5",
    prompt: {
        id: "pmpt_abc123",
        variables: {
            topic: "Dragons",
            reference_pdf: {
                type: "input_file",
                file_id: file.id,
            },
        },
    },
});

console.log(response.output_text);
```

```python
import openai, pathlib

client = openai.OpenAI()

# Upload a PDF we will reference in the variables
file = client.files.create(
    file=open("draconomicon.pdf", "rb"),
    purpose="user_data",
)

response = client.responses.create(
    model="gpt-5",
    prompt={
        "id": "pmpt_abc123",
        "variables": {
            "topic": "Dragons",
            "reference_pdf": {
                "type": "input_file",
                "file_id": file.id,
            },
        },
    },
)

print(response.output_text)
```

```curl
# Assume you have already uploaded the PDF and obtained FILE_ID
curl https://api.openai.com/v1/responses   -H "Authorization: Bearer $OPENAI_API_KEY"   -H "Content-Type: application/json"   -d '{
    "model": "gpt-5",
    "prompt": {
      "id": "pmpt_abc123",
      "variables": {
        "topic": "Dragons",
        "reference_pdf": {
          "type": "input_file",
          "file_id": "file-abc123"
        }
      }
    }
  }'
```

:::

## 后续步骤

现在你已经了解了文本输入和输出的基础知识，接下来可以查看以下资源之一。

[在 Playground 中构建提示词 - 使用 Playground 开发和迭代提示词。](https://platform.openai.com/chat/edit)

[使用结构化输出生成 JSON 数据 - 确保模型输出的 JSON 数据符合 JSON schema。](/guides/structured-outputs)

[完整 API 参考 - 查看 API 参考中文本生成的所有选项。]( https://developers.openai.com/api/reference/responses)
