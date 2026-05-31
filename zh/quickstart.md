# 开发者快速入门

> Make your first API request in minutes.

OpenAI API 提供了一个简洁的接口，可访问最先进的 AI [模型](/models)，用于文本生成、自然语言处理、计算机视觉等。首先创建一个 API Key 并运行你的第一个 API 调用。了解如何生成文本、分析图像、构建智能体等。

在 Codex 中使用 OpenAI API 进行构建

OpenAI Developers 插件使 Codex 能够连接到 OpenAI 平台，遵循 OpenAI API 设置指南，并在你的应用需要时创建项目 API 密钥。

[安装插件](/learn/developers-codex-plugin)

## 创建并导出 API 密钥

[

创建 API Key

](https://platform.openai.com/api-keys)

在开始之前，请在控制面板中创建一个 API 密钥，你将使用它来安全地[访问 API]( https://developers.openai.com/api/reference/authentication)。将密钥存储在安全的位置，例如 [`.zshrc` 文件](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/)或计算机上的其他文本文件中。生成 API 密钥后，在终端中将其导出为[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。

::: code-group
```bash [macOS / Linux]
export OPENAI_API_KEY="your_api_key_here"
```

```powershell [Windows]
setx OPENAI_API_KEY "your_api_key_here"
```
:::

OpenAI SDK 配置为自动从系统环境中读取你的 API 密钥。

## 安装 OpenAI SDK 并运行 API 调用


JavaScript

要在 Node.js、Deno 或 Bun 等服务器端 JavaScript 环境中使用 OpenAI API，你可以使用官方的 [OpenAI TypeScript 和 JavaScript SDK](https://github.com/openai/openai-node)。首先使用 [npm](https://www.npmjs.com/) 或你偏好的包管理器安装 SDK：

使用 npm 安装 OpenAI SDK

```
npm install openai
```

安装 OpenAI SDK 后，创建一个名为 `example.mjs` 的文件，并将示例代码复制到其中：

测试基本 API 请求

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);
```

使用 `node example.mjs`（或 Deno 或 Bun 的等效命令）执行代码。稍等片刻，你应该会看到 API 请求的输出。

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-node)

Python

要在 Python 中使用 OpenAI API，你可以使用官方的 [OpenAI Python SDK](https://github.com/openai/openai-python)。首先使用 [pip](https://pypi.org/project/pip/) 安装 SDK：

使用 pip 安装 OpenAI SDK

```
pip install openai
```

安装 OpenAI SDK 后，创建一个名为 `example.py` 的文件，并将示例代码复制到其中：

测试基本 API 请求

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
```

使用 `python example.py` 执行代码。稍等片刻，你应该会看到 API 请求的输出。

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-python)

.NET

OpenAI 与 Microsoft 合作，提供了官方支持的 C# API 客户端。你可以使用 .NET CLI 从 [NuGet](https://www.nuget.org/) 安装它。

```
dotnet add package OpenAI
```

一个简单的 [Responses API]( https://developers.openai.com/api/reference/responses) 请求示例如下：

测试基本 API 请求

```csharp
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

Java

OpenAI 为 Java 编程语言提供了 API 辅助库，目前处于 beta 阶段。你可以使用以下配置引入 Maven 依赖：

```text
&lt;dependency>
  &lt;groupId>com.openai&lt;/groupId>
  &lt;artifactId>openai-java&lt;/artifactId>
  &lt;version>4.0.0&lt;/version>
&lt;/dependency>
```

一个简单的 [Responses API]( https://developers.openai.com/api/reference/responses) 请求示例如下：

测试基本 API 请求

```java
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

要了解更多关于在 Java 中使用 OpenAI API 的信息，请查看下方链接的 GitHub 仓库！

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-java)

Go

OpenAI 为 Go 编程语言提供了 API 辅助库，目前处于 beta 阶段。你可以使用以下代码导入该库：

```
import (
  "github.com/openai/openai-go" // imported as openai
)
```

一个简单的 [Responses API]( https://developers.openai.com/api/reference/responses) 请求示例如下：

测试基本 API 请求

```go
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

要了解更多关于在 Go 中使用 OpenAI API 的信息，请查看下方链接的 GitHub 仓库！

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-go)

[Responses 入门应用 - 开始使用 Responses API 进行构建。](https://github.com/openai/openai-responses-starter-app)

[文本生成和提示 - 了解更多关于提示、消息角色和构建对话应用的信息。](/guides/text)

## 充值额度以继续构建

[

前往账单页面

](https://platform.openai.com/account/billing/overview)

恭喜你运行了一次免费的测试 API 请求！开始使用更高的限额构建真实应用，并使用[我们的模型](/models)生成文本、音频、图像、视频等。

访问旨在帮助你更快交付的控制面板功能：

[Chat Playground - 构建和测试对话提示并将其嵌入到你的应用中。](https://platform.openai.com/chat)

[Agent Builder - 构建、部署和优化智能体工作流。](https://platform.openai.com/agent-builder)

## 分析图像和文件

将图像 URL、上传的文件或 PDF 文档直接发送给模型，以提取文本、分类内容或检测视觉元素。

Image URLFile URLUpload file

Image URL

分析图像内容

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "What is in this image?",
                },
                {
                    type: "input_image",
                    image_url: "https://openai-documentation.vercel.app/images/cat_and_otter.png",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "What is in this image?"
                    },
                    {
                        "type": "input_image",
                        "image_url": "https://openai-documentation.vercel.app/images/cat_and_otter.png"
                    }
                ]
            }
        ]
}'
```

```text
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
input:
  - role: user
    content:
      - type: input_text
        text: What is in this image?
      - type: input_image
        image_url: https://openai-documentation.vercel.app/images/cat_and_otter.png
YAML
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "What teams are playing in this image?",
                },
                {
                    "type": "input_image",
                    "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
                }
            ]
        }
    ]
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(new Uri("https://openai-documentation.vercel.app/images/cat_and_otter.png")),
    ]),
]);

Console.WriteLine(response.GetOutputText());
```

:::




File URL

**使用文件 URL 作为输入**

::: code-group
```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Analyze the letter and provide a summary of the key points."
                    },
                    {
                        "type": "input_file",
                        "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf"
                    }
                ]
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "Analyze the letter and provide a summary of the key points.",
                },
                {
                    type: "input_file",
                    file_url: "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Analyze the letter and provide a summary of the key points.",
                },
                {
                    "type": "input_file",
                    "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
                },
            ],
        },
    ]
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

using HttpClient http = new();
using Stream stream = await http.GetStreamAsync("https://www.berkshirehathaway.com/letters/2024ltr.pdf");
OpenAIFileClient files = new(key);
OpenAIFile file = files.UploadFile(stream, "2024ltr.pdf", FileUploadPurpose.UserData);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Analyze the letter and provide a summary of the key points."),
        ResponseContentPart.CreateInputFilePart(file.Id),
    ]),
]);

Console.WriteLine(response.GetOutputText());
```

:::



Upload file

**上传文件并将其用作输入**

::: code-group
```curl
curl https://api.openai.com/v1/files \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F purpose="user_data" \
    -F file="@draconomicon.pdf"

curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "file_id": "file-6F2ksmvXxt4VdoqmHRw6kL"
                    },
                    {
                        "type": "input_text",
                        "text": "What is the first dragon in the book?"
                    }
                ]
            }
        ]
    }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

const file = await client.files.create({
    file: fs.createReadStream("draconomicon.pdf"),
    purpose: "user_data",
});

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_file",
                    file_id: file.id,
                },
                {
                    type: "input_text",
                    text: "What is the first dragon in the book?",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("draconomicon.pdf", "rb"),
    purpose="user_data"
)

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "file_id": file.id,
                },
                {
                    "type": "input_text",
                    "text": "What is the first dragon in the book?",
                },
            ]
        }
    ]
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

OpenAIFileClient files = new(key);
OpenAIFile file = files.UploadFile("draconomicon.pdf", FileUploadPurpose.UserData);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputFilePart(file.Id),
        ResponseContentPart.CreateInputTextPart("What is the first dragon in the book?"),
    ]),
]);

Console.WriteLine(response.GetOutputText());
```

:::



[图像输入指南 - 了解如何使用图像输入模型并从图像中提取含义。](/guides/images)

[文件输入指南 - 了解如何使用文件输入模型并从文档中提取含义。](/guides/file-inputs)

## 使用工具扩展模型

通过附加[工具](/guides/tools)，让模型访问外部数据和函数。使用内置工具如网络搜索或文件搜索，或定义你自己的工具来调用 API、运行代码或与第三方系统集成。



Web search

在响应中使用网络搜索

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    tools: [
        { type: "web_search" },
    ],
    input: "What was a positive news story from today?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{"type": "web_search"}],
    input="What was a positive news story from today?"
)

print(response.output_text)
```

```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{"type": "web_search"}],
        "input": "what was a positive news story from today?"
}'
```

```bash
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
tools:
  - type: web_search
input: What was a positive news story from today?
YAML
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool());

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What was a positive news story from today?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```

:::



File search

**在响应中搜索你的文件**

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["&lt;vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["&lt;vector_store_id>"],
        },
    ],
});
console.log(response);
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["&lt;vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```

:::



Function calling

调用你自己的函数

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const tools = [
    {
        type: "function",
        name: "get_weather",
        description: "Get current temperature for a given location.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "City and country e.g. Bogotá, Colombia",
                },
            },
            required: ["location"],
            additionalProperties: false,
        },
        strict: true,
    },
];

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        { role: "user", content: "What is the weather like in Paris today?" },
    ],
    tools,
});

console.log(response.output[0].to_json());
```

```python
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Bogotá, Colombia",
                }
            },
            "required": ["location"],
            "additionalProperties": False,
        },
        "strict": True,
    },
]

response = client.responses.create(
    model="gpt-5",
    input=[
        {"role": "user", "content": "What is the weather like in Paris today?"},
    ],
    tools=tools,
)

print(response.output[0].to_json())
```

```csharp
using System.Text.Json;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFunctionTool(
        functionName: "get_weather",
        functionDescription: "Get current temperature for a given location.",
        functionParameters: BinaryData.FromObjectAsJson(new
        {
            type = "object",
            properties = new
            {
                location = new
                {
                    type = "string",
                    description = "City and country e.g. Bogotá, Colombia"
                }
            },
            required = new[] { "location" },
            additionalProperties = false
        }),
        strictModeEnabled: true
    )
);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is the weather like in Paris today?")
    ])
], options);

Console.WriteLine(JsonSerializer.Serialize(response.OutputItems[0]));
```

```curl
curl -X POST https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [
      {"role": "user", "content": "What is the weather like in Paris today?"}
    ],
    "tools": [
      {
        "type": "function",
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City and country e.g. Bogotá, Colombia"
            }
          },
          "required": ["location"],
          "additionalProperties": false
        },
        "strict": true
      }
    ]
  }'
```

:::




Remote MCP

**调用远程 MCP 服务器**

::: code-group
```curl
curl https://api.openai.com/v1/responses \ 
-H "Content-Type: application/json" \ 
-H "Authorization: Bearer $OPENAI_API_KEY" \ 
-d '{
  "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never"
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/sse",
      require_approval: "never",
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "mcp",
            "server_label": "dmcp",
            "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
            "server_url": "https://dmcp-server.deno.dev/sse",
            "require_approval": "never",
        },
    ],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

:::



[使用内置工具 - 了解强大的内置工具，如网络搜索和文件搜索。](/guides/tools)

[函数调用指南 - 了解如何让模型调用你自己的自定义代码。](/guides/function-calling)

## 流式响应和构建实时应用

使用服务器发送的[流式事件](/guides/streaming-responses)在结果生成时即时展示，或使用 [Realtime API](/guides/realtime) 构建交互式语音和多模态应用。

**从 API 流式传输服务器发送事件**

::: code-group
```javascript
import { OpenAI } from "openai";
const client = new OpenAI();

const stream = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream: true,
});

for await (const event of stream) {
    console.log(event);
}
```

```python
from openai import OpenAI
client = OpenAI()

stream = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream=True,
)

for event in stream:
    print(event)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

var responses = client.CreateResponseStreamingAsync([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Say 'double bubble bath' ten times fast."),
    ]),
]);

await foreach (var response in responses)
{
    if (response is StreamingResponseOutputTextDeltaUpdate delta)
    {
        Console.Write(delta.Delta);
    }
}
```

:::



[使用流式事件 - 使用服务器发送事件将模型响应快速流式传输给用户。](/guides/streaming-responses)

[开始使用 Realtime API - 使用 WebRTC 或 WebSockets 构建超快的语音对语音 AI 应用。](/guides/realtime)

## 构建智能体

使用 OpenAI 平台构建能够代表用户执行操作的[智能体](/guides/agents)——例如[控制计算机](/guides/tools-computer-use)。使用 [Agents SDK](/guides/agents) 在后端创建编排逻辑。

构建语言分流智能体

::: code-group
```javascript
import { Agent, run } from '@openai/agents';

const spanishAgent = new Agent({
    name: 'Spanish agent',
    instructions: 'You only speak Spanish.',
});

const englishAgent = new Agent({
    name: 'English agent',
    instructions: 'You only speak English',
});

const triageAgent = new Agent({
    name: 'Triage agent',
    instructions:
        'Handoff to the appropriate agent based on the language of the request.',
    handoffs: [spanishAgent, englishAgent],
});

const result = await run(triageAgent, 'Hola, ¿cómo estás?');
console.log(result.finalOutput);
```

```python
from agents import Agent, Runner
import asyncio

spanish_agent = Agent(
    name="Spanish agent",
    instructions="You only speak Spanish.",
)

english_agent = Agent(
    name="English agent",
    instructions="You only speak English",
)

triage_agent = Agent(
    name="Triage agent",
    instructions="Handoff to the appropriate agent based on the language of the request.",
    handoffs=[spanish_agent, english_agent],
)


async def main():
    result = await Runner.run(triage_agent, input="Hola, ¿cómo estás?")
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

:::





[构建能够执行操作的智能体 - 了解如何使用 OpenAI 平台构建强大、高效的 AI 智能体。](/guides/agents)
