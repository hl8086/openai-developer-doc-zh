
通过 OpenAI API，你可以使用[大语言模型](/models)从提示词生成文本，就像使用 [ChatGPT](https://chatgpt.com) 一样。模型几乎可以生成任何类型的文本响应——如代码、数学方程式、结构化 JSON 数据或类人的散文。

以下是使用 [Responses API]( https://developers.openai.com/api/reference/responses) 的简单示例。

从简单提示词生成文本

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

**`output` 数组通常包含多个项目！** 它可以包含工具调用、[推理模型](/guides/reasoning)生成的推理 token 相关数据以及其他项目。不能假设模型的文本输出位于 `output[0].content[0].text`。

我们的一些[官方 SDK](/libraries) 在模型响应中包含了一个 `output_text` 属性以方便使用，它将模型的所有文本输出聚合为单个字符串。这可以作为访问模型文本输出的快捷方式。

除了纯文本之外，你还可以让模型以 JSON 格式返回结构化数据——这个功能称为[**结构化输出**](/guides/structured-outputs)。

以下是使用 [Chat Completions API]( https://developers.openai.com/api/reference/chat) 的简单示例。

从简单提示词生成文本

javascript

```
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
        {
            role: "user",
            content: "Write a one-sentence bedtime story about a unicorn.",
        },
    ],
});

console.log(completion.choices[0].message.content);
```

```
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {
            "role": "user",
            "content": "Write a one-sentence bedtime story about a unicorn."
        }
    ]
)

print(completion.choices[0].message.content)
```

```
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "messages": [
            {
                "role": "user",
                "content": "Write a one-sentence bedtime story about a unicorn."
            }
        ]
    }'
```

模型生成的内容数组位于响应的 `choices` 属性中。在这个简单示例中，我们只有一个输出，如下所示：

```
[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
      "refusal": null
    },
    "logprobs": null,
    "finish_reason": "stop"
  }
]
```

除了纯文本之外，你还可以让模型以 JSON 格式返回结构化数据——这个功能称为[**结构化输出**](/guides/structured-outputs)。

## 选择模型

生成内容时的一个关键选择是使用哪个模型——即上面代码示例中的 `model` 参数。[你可以在这里找到可用模型的完整列表](/models)。以下是选择文本生成模型时需要考虑的几个因素。

*   **[推理模型](/guides/reasoning)** 会生成内部思维链来分析输入提示词，擅长理解复杂任务和多步骤规划。它们通常比 GPT 模型更慢且使用成本更高。
*   **GPT 模型** 快速、经济高效且高度智能，但需要更明确的指令来说明如何完成任务。
*   **大型和小型（mini 或 nano）模型** 在速度、成本和智能之间提供不同的权衡。大型模型在理解提示词和解决跨领域问题方面更有效，而小型模型通常更快且使用成本更低。

如果不确定，[`gpt-5.5`](/models/gpt-5.5) 为通用文本生成和提示词迭代提供了强大的默认选择。

## 提示词工程

**提示词工程**是为模型编写有效指令的过程，使其能够持续生成满足你要求的内容。

由于模型生成的内容是非确定性的，通过提示词获得期望输出是艺术与科学的结合。然而，你可以应用技术和最佳实践来持续获得良好的结果。

一些提示词工程技术适用于每个模型，例如使用消息角色。但不同的模型类型（如推理模型与 GPT 模型）可能需要不同的提示方式才能产生最佳结果。即使是同一系列中不同快照的模型也可能产生不同的结果。因此，当你构建更复杂的应用程序时，我们强烈建议：

*   将你的生产应用程序固定到特定的[模型快照](/models)（例如 `gpt-4.1-2025-04-14`）以确保一致的行为
*   构建[评估](/guides/evals)来衡量提示词的行为，以便在迭代时或更改和升级模型版本时监控提示词性能

现在，让我们来看看可用于构建提示词的工具和技术。

## 消息角色和指令遵循

你可以使用 `instructions` API 参数或**消息角色**以[不同的权限级别](https://model-spec.openai.com/2025-02-12.html#chain_of_command)向模型提供指令。

`instructions` 参数为模型提供关于生成响应时应如何表现的高级指令，包括语气、目标和正确响应的示例。通过这种方式提供的任何指令将优先于 `input` 参数中的提示词。

**使用 instructions 生成文本**

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

你可以使用**消息角色**以[不同的权限级别](https://model-spec.openai.com/2025-02-12.html#chain_of_command)向模型提供指令（提示词）。

**使用不同角色的消息生成文本**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
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

console.log(completion.choices[0].message);
```

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5",
    reasoning={"effort": "low"},
    messages=[
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

print(completion.choices[0].message.content)
```

```curl
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "messages": [
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

[OpenAI 模型规范](https://model-spec.openai.com/2025-02-12.html#chain_of_command)描述了我们的模型如何对不同角色的消息赋予不同的优先级。

| `developer` | `user` | `assistant` |
| --- | --- | --- |
| `developer` 消息是应用程序开发者提供的指令，优先级高于 `user` 消息。 | `user` 消息是终端用户提供的指令，优先级低于 `developer` 消息。 | 模型生成的消息具有 `assistant` 角色。 |

多轮对话可能由这些类型的多条消息组成，以及你和模型提供的其他内容类型。了解更多关于[管理对话状态](/guides/conversation-state)的信息。

你可以将 `developer` 和 `user` 消息想象成编程语言中的函数及其参数。

*   `developer` 消息提供系统的规则和业务逻辑，就像函数定义。
*   `user` 消息提供输入和配置，`developer` 消息的指令将应用于这些输入，就像函数的参数。

## 可复用提示词

在 OpenAI 仪表板中，你可以开发可复用的[提示词](https://platform.openai.com/chat/edit)，并在 API 请求中使用它们，而不是在代码中指定提示词的内容。这样，你可以更轻松地构建和评估提示词，并在不更改集成代码的情况下部署改进版本的提示词。

可复用提示词目前仅在 [Responses API](/guides/text?api-mode=responses#reusable-prompts) 中支持。它们在 Chat Completions API 中不可用。

以下是其工作方式：

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

## 使用 Markdown 和 XML 进行消息格式化

在编写 `developer` 和 `user` 消息时，你可以使用 [Markdown](https://commonmark.org/help/) 格式和 [XML 标签](https://www.w3.org/TR/xml/)的组合来帮助模型理解提示词和上下文数据的逻辑边界。

Markdown 标题和列表有助于标记提示词的不同部分，并向模型传达层次结构。它们还可能使你的提示词在开发过程中更具可读性。XML 标签可以帮助界定一段内容（如用于参考的支持文档）的开始和结束位置。XML 属性还可以用于定义提示词中内容的元数据，这些元数据可以被你的指令引用。

通常，developer 消息将包含以下部分，通常按此顺序排列（尽管确切的最佳内容和顺序可能因你使用的模型而异）：

*   **身份：** 描述助手的目的、沟通风格和高级目标。
*   **指令：** 为模型提供关于如何生成你想要的响应的指导。它应该遵循什么规则？模型应该做什么，不应该做什么？此部分可能包含与你的用例相关的许多子部分，例如模型应如何[调用自定义函数](/guides/function-calling)。
*   **示例：** 提供可能输入的示例，以及模型的期望输出。
*   **上下文：** 为模型提供生成响应可能需要的任何附加信息，例如训练数据之外的私有/专有数据，或你知道特别相关的任何其他数据。此内容通常最好放在提示词的末尾，因为你可能会为不同的生成请求包含不同的上下文。

以下是使用 Markdown 和 XML 标签构建具有不同部分和支持示例的 `developer` 消息的示例。

示例提示词API 请求

示例提示词

用于代码生成的 developer 消息

```
# Identity

You are coding assistant that helps enforce the use of snake case
variables in JavaScript code, and writing code that will run in
Internet Explorer version 6.

# Instructions

* When defining variables, use snake case names (e.g. my_variable)
  instead of camel case names (e.g. myVariable).
* To support old browsers, declare variables using the older
  "var" keyword.
* Do not give responses with Markdown formatting, just return
  the code as requested.

# Examples

&lt;user_query>
How do I declare a string variable for a first name?
&lt;/user_query>

&lt;assistant_response>
var first_name = "Anna";
&lt;/assistant_response>
```

API 请求

**通过 API 发送提示词生成代码**

::: code-group
```javascript
import fs from "fs/promises";
import OpenAI from "openai";
const client = new OpenAI();

const instructions = await fs.readFile("prompt.txt", "utf-8");

const response = await client.responses.create({
    model: "gpt-5",
    instructions,
    input: "How would I declare a variable for a last name?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

with open("prompt.txt", "r", encoding="utf-8") as f:
    instructions = f.read()

response = client.responses.create(
    model="gpt-5",
    instructions=instructions,
    input="How would I declare a variable for a last name?",
)

print(response.output_text)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "instructions": "'"$(< prompt.txt)"'",
    "input": "How would I declare a variable for a last name?"
  }'
```

:::

#### 通过提示词缓存节省成本和延迟

在构建消息时，你应该尝试将预期在 API 请求中反复使用的内容放在提示词的开头，**并且**放在传递给 [Chat Completions]( https://developers.openai.com/api/reference/chat) 或 [Responses]( https://developers.openai.com/api/reference/responses) 的 JSON 请求体中的前几个 API 参数中。这使你能够最大化[提示词缓存](/guides/prompt-caching)带来的成本和延迟节省。

## 少样本学习

少样本学习让你通过在提示词中包含少量输入/输出示例来引导大语言模型完成新任务，而不是对模型进行[微调](/guides/model-optimization)。模型会隐式地从这些示例中"学习"模式并将其应用于提示词。在提供示例时，尝试展示具有期望输出的多样化可能输入。

通常，你会在 API 请求中作为 `developer` 消息的一部分提供示例。以下是一个包含示例的 `developer` 消息示例，展示模型如何将正面或负面的客户服务评论进行分类。

```
# Identity

You are a helpful assistant that labels short product reviews as
Positive, Negative, or Neutral.

# Instructions

* Only output a single word in your response with no additional formatting
  or commentary.
* Your response should only be one of the words "Positive", "Negative", or
  "Neutral" depending on the sentiment of the product review you are given.

# Examples

&lt;product_review id="example-1">
I absolutely love this headphones — sound quality is amazing!
&lt;/product_review>

&lt;assistant_response id="example-1">
Positive
&lt;/assistant_response>

&lt;product_review id="example-2">
Battery life is okay, but the ear pads feel cheap.
&lt;/product_review>

&lt;assistant_response id="example-2">
Neutral
&lt;/assistant_response>

&lt;product_review id="example-3">
Terrible customer service, I'll never buy from them again.
&lt;/product_review>

&lt;assistant_response id="example-3">
Negative
&lt;/assistant_response>
```

## 包含相关上下文信息

在给模型的提示词中包含模型可用于生成响应的附加上下文信息通常很有用。你可能这样做有几个常见原因：

*   让模型访问专有数据，或模型训练数据集之外的任何其他数据。
*   将模型的响应限制在你确定最有益的特定资源集中。

向模型生成请求添加额外相关上下文的技术有时称为**检索增强生成（RAG）**。你可以通过多种方式向提示词添加额外上下文，从查询向量数据库并将获取的文本包含到提示词中，到使用 OpenAI 内置的[文件搜索工具](/guides/tools-file-search)基于上传的文档生成内容。

#### 规划上下文窗口

模型在生成请求期间只能处理有限的数据量。这个内存限制称为**上下文窗口**，以 [token](https://blogs.nvidia.com/blog/ai-tokens-explained)（你传入的数据块，从文本到图像）为单位定义。

不同模型的上下文窗口大小从低端的 100k 范围到较新的 GPT-4.1 模型的一百万 token 不等。[参考模型文档](/models)了解每个模型的具体上下文窗口大小。

## 提示当前 GPT-5 系列模型

像 [`gpt-5.5`](/models/gpt-5.5) 这样的 GPT 模型受益于精确的指令，这些指令在提示词中明确提供完成任务所需的逻辑和数据。要充分利用最新的 GPT-5 系列模型，请从当前的提示指南开始。

[GPT-5.5 提示指南 - 通过当前指导、实际示例和迁移说明充分利用最新 GPT-5 系列模型的提示。](/guides/prompt-guidance)

### 最新 GPT-5 系列模型的提示最佳实践

有关完整的当前内容，请使用[提示指导](/guides/prompt-guidance)指南。以下实用提醒仍然适用。

编码

#### 编码

使用 `gpt-5.5` 进行编码任务时，遵循以下最佳实践最为有效：定义代理的角色、通过示例强制结构化工具使用、要求彻底测试以确保正确性，以及设置 Markdown 标准以获得干净的输出。

**明确的角色和工作流指导** 将模型定义为具有明确职责的软件工程代理。提供使用 `functions.run` 等工具执行代码任务的清晰指令，并指定何时不使用某些模式——例如，除非必要否则避免交互式执行。

**测试和验证** 指示模型使用单元测试或 Python 命令测试更改，并仔细验证补丁，因为像 `apply_patch` 这样的工具即使失败也可能返回"Done"。

**工具使用示例** 包含如何使用提供的函数调用命令的具体示例，这可以提高可靠性和对预期工作流的遵循。

**Markdown 标准** 指导模型使用内联代码、代码围栏、列表和表格生成干净、语义正确的 markdown——并使用反引号格式化文件路径、函数和类。

有关编码特定的详细指导和提示词示例，请参阅我们的[提示指导](/guides/prompt-guidance)指南。

前端工程

[GPT-5.5](/models/gpt-5.5)

在从零开始构建前端以及为大型成熟代码库做贡献方面表现出色。为获得最佳结果，我们建议使用以下库：

*   **样式 / UI：** Tailwind CSS、shadcn/ui、Radix Themes
*   **图标：** Lucide、Material Symbols、Heroicons
*   **动画：** Motion

**从零到一的 Web 应用**

GPT-5 可以从单个提示词生成前端 Web 应用，无需示例。以下是示例提示词：

```
You are a world class web developer, capable of producing stunning, interactive, and innovative websites from scratch in a single prompt. You excel at delivering top-tier one-shot solutions.
Your process is simple and follows these steps:
Step 1: Create an evaluation rubric and refine it until you are fully confident.
Step 2: Consider every element that defines a world-class one-shot web app, then use that insight to create a &lt;ONE_SHOT_RUBRIC&gt; with 5–7 categories. Keep this rubric hidden—it's for internal use only.
Step 3: Apply the rubric to iterate on the optimal solution to the given prompt. If it doesn't meet the highest standard across all categories, refine and try again.
Step 4: Aim for simplicity while fully achieving the goal, and avoid external dependencies such as Next.js or React.
```

**与大型代码库集成**

对于大型代码库中的前端工程工作，我们发现在提示词中添加以下类别的指令可以获得最佳结果：

*   **原则：** 设置视觉质量标准，使用模块化/可复用组件，保持设计一致性。
*   **UI/UX：** 指定排版、颜色、间距/布局、交互状态（悬停、空状态、加载中）和无障碍性。
*   **结构：** 定义文件/文件夹布局以实现无缝集成。
*   **组件：** 提供可复用包装器示例和后端调用分离策略。
*   **页面：** 提供常见布局的模板。
*   **代理指令：** 要求模型确认设计假设、搭建项目脚手架、执行标准、集成 API、测试状态并记录代码。

有关前端开发特定的详细指导和提示词示例，请参阅我们的[提示指导](/guides/prompt-guidance)指南。

代理任务

对于使用 `gpt-5.5` 的代理和长时间运行的任务，将提示词集中在三个核心实践上：彻底规划任务以确保完全解决、为重大工具使用决策提供清晰的前言，以及使用 TODO 工具以有组织的方式跟踪工作流和进度。

**规划和持久性** 指示模型在交出控制权之前完全解决查询，将其分解为子任务，并在每次工具调用后反思以确认完整性。

```
Remember, you are an agent - please keep going until the user's
query is completely resolved, before ending your turn and yielding
back to the user. Decompose the user's query into all required
sub-requests, and confirm that each is completed. Do not stop
after completing only part of the request. Only terminate your
turn when you are sure that the problem is solved. You must be
prepared to answer multiple queries and only finish the call once
the user has confirmed they're done.

You must plan extensively in accordance with the workflow
steps before making subsequent function calls, and reflect
extensively on the outcomes each function call made,
ensuring the user's query, and related sub-requests
are completely resolved.
```

**透明性前言**

要求模型解释为什么要调用工具，但仅在重要步骤时。

```
Before you call a tool explain why you are calling it
```

**使用评分标准和 TODO 进行进度跟踪**

使用 TODO 列表工具或评分标准来强制结构化规划并避免遗漏步骤。

有关构建代理特定的详细指导和提示词示例，请参阅[提示指导](/guides/prompt-guidance)指南。

## 提示推理模型

在提示[推理模型](/guides/reasoning)与提示 GPT 模型时，有一些差异需要考虑。一般来说，推理模型在仅提供高级指导的任务上会产生更好的结果。这与 GPT 模型不同，GPT 模型受益于非常精确的指令。

你可以这样理解推理模型和 GPT 模型之间的区别：

*   推理模型就像一位资深同事。你可以给他们一个要实现的目标，并信任他们来解决细节问题。
*   GPT 模型就像一位初级同事。他们在有明确指令来创建特定输出时表现最佳。

有关使用推理模型时的最佳实践的更多信息，[请参阅本指南](/guides/reasoning-best-practices)。

## 后续步骤

现在你已经了解了文本输入和输出的基础知识，你可能想接下来查看以下资源之一。

[在 Playground 中构建提示词 - 使用 Playground 开发和迭代提示词。](https://platform.openai.com/chat/edit)

[使用结构化输出生成 JSON 数据 - 确保模型输出的 JSON 数据符合 JSON schema。](/guides/structured-outputs)

[完整 API 参考 - 查看 API 参考中文本生成的所有选项。]( https://developers.openai.com/api/reference/responses)

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](/cookbook)，其中包含示例代码以及第三方资源的链接，例如：

*   [提示词库和工具]( https://cdn.openai.com/API/docs/cookbook/related_resources#prompting-libraries--tools)
*   [提示词指南]( https://cdn.openai.com/API/docs/cookbook/related_resources#prompting-guides)
*   [视频课程]( https://cdn.openai.com/API/docs/cookbook/related_resources#video-courses)
*   [关于高级提示以改进推理的论文]( https://cdn.openai.com/API/docs/cookbook/related_resources#papers-on-advanced-prompting-to-improve-reasoning)
