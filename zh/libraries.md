
本页介绍了使用 [OpenAI API]( https://developers.openai.com/api/reference) 进行开发的主要方式：用于应用代码的官方 SDK、用于 Shell 原生工作流的 OpenAI CLI、用于编排的 Agents SDK，或者您自己偏好的 HTTP 客户端。

## 创建并导出 API 密钥

在开始之前，[在控制台中创建一个 API 密钥](https://platform.openai.com/api-keys)，您将使用它来安全地[访问 API]( https://developers.openai.com/api/reference/authentication)。将密钥存储在安全的位置，例如 [`.zshrc` 文件](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/)或计算机上的其他文本文件中。生成 API 密钥后，在终端中将其导出为[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。

macOS / LinuxWindows

macOS / Linux

在 macOS 或 Linux 系统上导出环境变量

```
export OPENAI_API_KEY="your_api_key_here"
```

Windows

在 PowerShell 中导出环境变量

```
setx OPENAI_API_KEY "your_api_key_here"
```

OpenAI SDK 已配置为自动从系统环境中读取您的 API 密钥。

## 安装官方 SDK

JavaScriptPython.NETJavaGoRubyCLI

JavaScript

要在 Node.js、Deno 或 Bun 等服务器端 JavaScript 环境中使用 OpenAI API，您可以使用官方的 [OpenAI TypeScript 和 JavaScript SDK](https://github.com/openai/openai-node)。使用 [npm](https://www.npmjs.com/) 或您偏好的包管理器安装 SDK 即可开始：

使用 npm 安装 OpenAI SDK

```
npm install openai
```

安装 OpenAI SDK 后，创建一个名为 `example.mjs` 的文件，并将示例代码复制到其中：

测试基本 API 请求

```
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);
```

使用 `node example.mjs`（或 Deno、Bun 的等效命令）执行代码。稍等片刻，您应该会看到 API 请求的输出结果。

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-node)

Python

要在 Python 中使用 OpenAI API，您可以使用官方的 [OpenAI Python SDK](https://github.com/openai/openai-python)。使用 [pip](https://pypi.org/project/pip/) 安装 SDK 即可开始：

使用 pip 安装 OpenAI SDK

```
pip install openai
```

安装 OpenAI SDK 后，创建一个名为 `example.py` 的文件，并将示例代码复制到其中：

测试基本 API 请求

```
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
```

使用 `python example.py` 执行代码。稍等片刻，您应该会看到 API 请求的输出结果。

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-python)

.NET

OpenAI 与 Microsoft 合作，提供了官方支持的 C# API 客户端。您可以使用 .NET CLI 从 [NuGet](https://www.nuget.org/) 安装它。

```
dotnet add package OpenAI
```

向 [Responses API]( https://developers.openai.com/api/reference/responses) 发送简单 API 请求的示例如下：

测试基本 API 请求

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

Java

OpenAI 为 Java 编程语言提供了 API 辅助库，目前处于 Beta 阶段。您可以使用以下配置引入 Maven 依赖：

```text
&lt;dependency>
  &lt;groupId>com.openai&lt;/groupId>
  &lt;artifactId>openai-java&lt;/artifactId>
  &lt;version>4.0.0&lt;/version>
&lt;/dependency>
```

向 [Responses API]( https://developers.openai.com/api/reference/responses) 发送简单 API 请求的示例如下：

测试基本 API 请求

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

要了解更多关于在 Java 中使用 OpenAI API 的信息，请查看下方链接的 GitHub 仓库！

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-java)

Go

OpenAI 为 Go 编程语言提供了 API 辅助库，目前处于 Beta 阶段。您可以使用以下代码导入该库：

```
import (
  "github.com/openai/openai-go" // imported as openai
)
```

向 [Responses API]( https://developers.openai.com/api/reference/responses) 发送简单 API 请求的示例如下：

测试基本 API 请求

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

要了解更多关于在 Go 中使用 OpenAI API 的信息，请查看下方链接的 GitHub 仓库！

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-go)

Ruby

要在 Ruby 中使用 OpenAI API，您可以使用官方的 [OpenAI Ruby SDK](https://github.com/openai/openai-ruby)。将 gem 添加到您的应用程序即可开始：

使用 Bundler 安装 OpenAI SDK

```
gem "openai"
```

安装 OpenAI SDK 后，创建一个名为 `example.rb` 的文件，并将示例代码复制到其中：

测试基本 API 请求

```
require "openai"

openai = OpenAI::Client.new

response = openai.responses.create(
  model: "gpt-5.5",
  input: "Write a one-sentence bedtime story about a unicorn."
)

puts(response.output_text)
```

使用 `ruby example.rb` 执行代码。稍等片刻，您应该会看到 API 请求的输出结果。

[在 GitHub 上了解更多 - 在库的 GitHub README 上发现更多 SDK 功能和选项。](https://github.com/openai/openai-ruby)

CLI

要直接从终端调用 OpenAI API，请安装生成的 `openai` 命令行工具：

使用 Homebrew 安装 OpenAI CLI

```
brew install openai/tools/openai
```

然后从 Shell 运行基本 API 请求：

测试基本 API 请求

```
openai responses create \
  --model "gpt-5.5" \
  --input "Write a one-sentence bedtime story about a unicorn." \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text'
```

使用 CLI 执行可重复的终端工作流，例如从文件中提取结构化数据、生成图像、创建语音，以及使用 `jq` 等 Shell 工具组合 API 调用。

[OpenAI CLI 指南 - 了解更多关于 CLI 工作流和命令模式的信息。](/libraries/openai-cli)

## 使用 Agents SDK

使用上述官方 OpenAI SDK 进行直接 API 请求。当您的应用程序需要代码优先的编排来处理代理、工具、交接、护栏、追踪或沙箱执行时，请使用 Agents SDK。

[Agents SDK 快速入门 - 使用 Agents SDK 构建您的第一个代理。](/guides/agents/quickstart)

*   [OpenAI Agents SDK for TypeScript](https://github.com/openai/openai-agents-js)
*   [OpenAI Agents SDK for Python](https://github.com/openai/openai-agents-python)

## Azure OpenAI 库

Microsoft 的 Azure 团队维护了与 OpenAI API 和 Azure OpenAI 服务兼容的库。阅读下方的库文档，了解如何将它们与 OpenAI API 配合使用。

*   [Azure OpenAI client library for .NET](https://github.com/Azure/azure-sdk-for-net/tree/main/sdk/openai/Azure.AI.OpenAI)
*   [Azure OpenAI client library for JavaScript](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/openai/openai)
*   [Azure OpenAI client library for Java](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai)
*   [Azure OpenAI client library for Go](https://github.com/Azure/azure-sdk-for-go/tree/main/sdk/ai/azopenai)

* * *

## 社区库

以下库由广大开发者社区构建和维护。您也可以在 GitHub 上 [关注我们的 OpenAPI 规范](https://github.com/openai/openai-openapi)仓库，以便在我们对 API 进行更改时及时获取更新。

请注意，OpenAI 不对这些项目的正确性或安全性进行验证。**使用风险自负！**

### Clojure

*   [openai-clojure](https://github.com/wkok/openai-clojure) by [wkok](https://github.com/wkok)

### Dart/Flutter

*   [openai](https://github.com/anasfik/openai) by [anasfik](https://github.com/anasfik)

### Delphi

*   [DelphiOpenAI](https://github.com/HemulGM/DelphiOpenAI) by [HemulGM](https://github.com/HemulGM)

### Elixir

*   [openai.ex](https://github.com/mgallo/openai.ex) by [mgallo](https://github.com/mgallo)

### Kotlin

*   [openai-kotlin](https://github.com/Aallam/openai-kotlin) by [Mouaad Aallam](https://github.com/Aallam)

### PHP

*   [orhanerday/open-ai](https://packagist.org/packages/orhanerday/open-ai) by [orhanerday](https://github.com/orhanerday)
*   [openai-php client](https://github.com/openai-php/client) by [openai-php](https://github.com/openai-php)

### Rust

*   [async-openai](https://github.com/64bit/async-openai) by [64bit](https://github.com/64bit)

### Scala

*   [openai-scala-client](https://github.com/cequence-io/openai-scala-client) by [cequence-io](https://github.com/cequence-io)

### Swift

*   [AIProxySwift](https://github.com/lzell/AIProxySwift) by [Lou Zell](https://github.com/lzell)
*   [OpenAIKit](https://github.com/dylanshine/openai-kit) by [dylanshine](https://github.com/dylanshine)
*   [OpenAI](https://github.com/MacPaw/OpenAI/) by [MacPaw](https://github.com/MacPaw)

### Unity

*   [com.openai.unity](https://github.com/RageAgainstThePixel/com.openai.unity) by [RageAgainstThePixel](https://github.com/RageAgainstThePixel)

### Unreal Engine

*   [OpenAI-Api-Unreal](https://github.com/KellanM/OpenAI-Api-Unreal) by [KellanM](https://github.com/KellanM)

## 其他 OpenAI 仓库

*   [tiktoken](https://github.com/openai/tiktoken) - token 计数
*   [simple-evals](https://github.com/openai/simple-evals) - 简单评估库
*   [mle-bench](https://github.com/openai/mle-bench) - 用于评估机器学习工程师代理的库
*   [gym](https://github.com/openai/gym) - 强化学习库
*   [swarm](https://github.com/openai/swarm) - 教育性编排仓库
