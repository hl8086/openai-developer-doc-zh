
除了通过[函数调用](/guides/function-calling)向模型提供的工具外，你还可以使用**连接器（connectors）**和**远程 MCP 服务器**为模型赋予新的能力。这些工具使模型能够在需要响应用户提示时连接并控制外部服务。这些工具调用可以自动允许，也可以限制为需要你作为开发者的明确批准。

*   **连接器**是 OpenAI 维护的 MCP 封装，用于连接 Google Workspace 或 Dropbox 等热门服务，类似于 [ChatGPT](https://chatgpt.com) 中可用的连接器。
*   **远程 MCP 服务器**可以是公共互联网上任何实现了远程 [Model Context Protocol](https://modelcontextprotocol.io/introduction)（MCP）协议的服务器。

本指南将展示如何使用远程 MCP 服务器和连接器为模型提供新的能力。

## Secure MCP Tunnel

如果你的 MCP 服务器是私有的、本地部署的或位于防火墙之后，请使用 [Secure MCP Tunnel](/guides/secure-mcp-tunnels) 将其连接到支持的 OpenAI 产品，而无需将服务器暴露在公共互联网上。从 [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest) 下载最新的公开版本。

## 快速开始

查看以下示例，了解远程 MCP 服务器和连接器如何通过 [Responses API]( https://developers.openai.com/api/reference/responses/create) 工作。连接器和远程 MCP 服务器都可以使用 `mcp` 内置工具类型。

Using remote MCP serversUsing connectors

Using remote MCP servers

远程 MCP 服务器需要一个 `server_url`。根据服务器的不同，你可能还需要一个包含访问令牌的 OAuth `authorization` 参数。

**在 Responses API 中使用远程 MCP 服务器**

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

开发者信任其使用的任何远程 MCP 服务器非常重要。恶意服务器可以从进入模型上下文的任何内容中窃取敏感数据。在使用此工具之前，请仔细阅读下方的**风险与安全**部分。

Using connectors

连接器需要一个 `connector_id` 参数，以及由你的应用程序在 `authorization` 参数中提供的 OAuth 访问令牌。

**在 Responses API 中使用连接器**

```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "Dropbox",
        "connector_id": "connector_dropbox",
        "authorization": "&lt;oauth access token>",
        "require_approval": "never"
      }
    ],
    "input": "Summarize the Q2 earnings report."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "Dropbox",
      connector_id: "connector_dropbox",
      authorization: "&lt;oauth access token>",
      require_approval: "never",
    },
  ],
  input: "Summarize the Q2 earnings report.",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[
        {
            "type": "mcp",
            "server_label": "Dropbox",
            "connector_id": "connector_dropbox",
            "authorization": "&lt;oauth access token>",
            "require_approval": "never",
        },
    ],
    input="Summarize the Q2 earnings report.",
)

print(resp.output_text)
```


```csharp
using OpenAI.Responses;

string dropboxToken = Environment.GetEnvironmentVariable("DROPBOX_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "Dropbox",
    connectorId: McpToolConnectorId.Dropbox,
    authorizationToken: dropboxToken,
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Summarize the Q2 earnings report.")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

API 将在模型响应的 `output` 数组中返回新的项目。如果模型决定使用连接器或 MCP 服务器，它将首先向服务器请求可用工具列表，这将创建一个 `mcp_list_tools` 输出项。从上面简单的远程 MCP 服务器示例中，它只包含一个工具定义：

```
{
  "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
  "type": "mcp_list_tools",
  "server_label": "dmcp",
  "tools": [
    {
      "annotations": null,
      "description": "Given a string of text describing a dice roll...",
      "input_schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "diceRollExpression": {
            "type": "string"
          }
        },
        "required": ["diceRollExpression"],
        "additionalProperties": false
      },
      "name": "roll"
    }
  ]
}
```

如果模型决定调用 MCP 服务器中的某个可用工具，你还会看到一个 `mcp_call` 输出，显示模型发送给 MCP 工具的内容以及 MCP 工具返回的输出。

```
{
  "id": "mcp_68a6102d8948819c9b1490d36d5ffa4a0679e572a900e618",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "error": null,
  "name": "roll",
  "output": "4",
  "server_label": "dmcp"
}
```

继续阅读下面的指南，了解更多关于 MCP 工具的工作原理、如何过滤可用工具以及如何处理工具调用审批请求的信息。

## 工作原理

MCP 工具（适用于远程 MCP 服务器和连接器）在 [Responses API]( https://developers.openai.com/api/reference/responses/create) 中可用于大多数最新模型。在[此处](/models)检查你的模型的 MCP 工具兼容性。使用 MCP 工具时，你只需为导入工具定义或进行工具调用时使用的[令牌](/pricing)付费。每次工具调用不涉及额外费用。

下面，我们将逐步介绍 API 调用 MCP 工具时的流程。

### 步骤 1：列出可用工具

当你在 `tools` 参数中指定远程 MCP 服务器时，API 将尝试从服务器获取工具列表。Responses API 支持使用 Streamable HTTP 或 HTTP/SSE 传输协议的远程 MCP 服务器。

如果成功获取工具列表，模型响应输出中将出现一个新的 `mcp_list_tools` 输出项。该对象的 `tools` 属性将显示成功导入的工具。

```
{
  "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
  "type": "mcp_list_tools",
  "server_label": "dmcp",
  "tools": [
    {
      "annotations": null,
      "description": "Given a string of text describing a dice roll...",
      "input_schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "diceRollExpression": {
            "type": "string"
          }
        },
        "required": ["diceRollExpression"],
        "additionalProperties": false
      },
      "name": "roll"
    }
  ]
}
```

只要 `mcp_list_tools` 项存在于 API 请求的上下文中，API 就不会在[对话](/guides/conversation-state)的每个轮次中再次从 MCP 服务器获取工具列表。我们建议你在每次对话或工作流执行中将此项保留在模型的上下文中，以优化延迟。

#### 过滤工具

某些 MCP 服务器可能有数十个工具，向模型暴露过多工具可能导致高成本和高延迟。如果你只对 MCP 服务器暴露的部分工具感兴趣，可以使用 `allowed_tools` 参数仅导入这些工具。

**限制允许的工具**

```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never",
        "allowed_tools": ["roll"]
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [{
    type: "mcp",
    server_label: "dmcp",
    server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
    server_url: "https://dmcp-server.deno.dev/sse",
    require_approval: "never",
    allowed_tools: ["roll"],
  }],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[{
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never",
        "allowed_tools": ["roll"],
    }],
    input="Roll 2d4+1",
)

print(resp.output_text)
```


```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    allowedTools: new McpToolFilter() { ToolNames = { "roll" } },
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

### 步骤 2：调用工具

一旦模型获得了这些工具定义，它可能会根据模型上下文中的内容选择调用它们。当模型决定调用 MCP 工具时，API 将向远程 MCP 服务器发出请求以调用该工具，并将其输出放入模型的上下文中。这将创建一个如下所示的 `mcp_call` 项：

```
{
  "id": "mcp_68a6102d8948819c9b1490d36d5ffa4a0679e572a900e618",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "error": null,
  "name": "roll",
  "output": "4",
  "server_label": "dmcp"
}
```

此项包含模型决定用于此工具调用的参数，以及远程 MCP 服务器返回的 `output`。所有模型都可以选择进行多次 MCP 工具调用，因此你可能会在单个 API 请求中看到生成多个此类项。

失败的工具调用将在此项的 error 字段中填充 MCP 协议错误、MCP 工具执行错误或一般连接错误。MCP 错误记录在 MCP 规范的[此处](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#error-handling)。

#### 审批

默认情况下，OpenAI 会在任何数据与连接器或远程 MCP 服务器共享之前请求你的批准。审批帮助你保持对发送到 MCP 服务器的数据的控制和可见性。我们强烈建议你仔细审查（并可选择记录）与远程 MCP 服务器共享的所有数据。请求批准进行 MCP 工具调用会在 Response 的输出中创建一个 `mcp_approval_request` 项，如下所示：

```
{
  "id": "mcpr_68a619e1d82c8190b50c1ccba7ad18ef0d2d23a86136d339",
  "type": "mcp_approval_request",
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "name": "roll",
  "server_label": "dmcp"
}
```

然后你可以通过创建一个新的 Response 对象并附加一个 `mcp_approval_response` 项来响应此请求。

**在 API 请求中批准工具的使用**

```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "always",
      }
    ],
    "previous_response_id": "resp_682d498bdefc81918b4a6aa477bfafd904ad1e533afccbfa",
    "input": [{
      "type": "mcp_approval_response",
      "approve": true,
      "approval_request_id": "mcpr_682d498e3bd4819196a0ce1664f8e77b04ad1e533afccbfa"
    }]
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [{
    type: "mcp",
    server_label: "dmcp",
    server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
    server_url: "https://dmcp-server.deno.dev/sse",
    require_approval: "always",
  }],
  previous_response_id: "resp_682d498bdefc81918b4a6aa477bfafd904ad1e533afccbfa",
  input: [{
    type: "mcp_approval_response",
    approve: true,
    approval_request_id: "mcpr_682d498e3bd4819196a0ce1664f8e77b04ad1e533afccbfa"
  }],
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[{
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "always",
    }],
    previous_response_id="resp_682d498bdefc81918b4a6aa477bfafd904ad1e533afccbfa",
    input=[{
        "type": "mcp_approval_response",
        "approve": True,
        "approval_request_id": "mcpr_682d498e3bd4819196a0ce1664f8e77b04ad1e533afccbfa"
    }],
)

print(resp.output_text)
```


```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.AlwaysRequireApproval)
));

// 步骤 1：创建请求工具调用审批的响应
OpenAIResponse response1 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

McpToolCallApprovalRequestItem? approvalRequestItem = response1.OutputItems.Last() as McpToolCallApprovalRequestItem;

// 步骤 2：批准工具调用请求并获取最终响应
options.PreviousResponseId = response1.Id;
OpenAIResponse response2 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateMcpApprovalResponseItem(approvalRequestItem!.Id, approved: true),
], options);

Console.WriteLine(response2.GetOutputText());
```

这里我们使用 `previous_response_id` 参数将这个新的 Response 与生成审批请求的前一个 Response 链接起来。但你也可以将[一个响应的输出作为另一个响应的输入](/guides/conversation-state#manually-manage-conversation-state)传递，以最大程度地控制进入模型上下文的内容。

如果你觉得可以信任某个远程 MCP 服务器，可以选择跳过审批以降低延迟。为此，你可以将 MCP 工具的 `require_approval` 参数设置为一个对象，列出你想跳过审批的工具，如下所示，或将其设置为 `'never'` 以跳过该远程 MCP 服务器中所有工具的审批。

**对某些工具永不要求审批**

```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": {
          "never": {
            "tool_names": ["ask_question", "read_wiki_structure"]
          }
        }
      }
    ],
    "input": "What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "deepwiki",
      server_url: "https://mcp.deepwiki.com/mcp",
      require_approval: {
        never: {
          tool_names: ["ask_question", "read_wiki_structure"]
        }
      }
    },
  ],
  input: "What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[
        {
            "type": "mcp",
            "server_label": "deepwiki",
            "server_url": "https://mcp.deepwiki.com/mcp",
            "require_approval": {
                "never": {
                    "tool_names": ["ask_question", "read_wiki_structure"]
                }
            }
        },
    ],
    input="What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?",
)

print(resp.output_text)
```


```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "deepwiki",
    serverUri: new Uri("https://mcp.deepwiki.com/mcp"),
    allowedTools: new McpToolFilter() { ToolNames = { "ask_question", "read_wiki_structure" } },
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

## 认证

与[我们上面使用的示例 MCP 服务器](https://dash.deno.com/playground/dmcp-server)不同，大多数其他 MCP 服务器需要认证。最常见的方案是 OAuth 访问令牌。使用 MCP 工具的 `authorization` 字段提供此令牌：

**使用 Stripe MCP 工具**

```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5",
    "input": "Create a payment link for $20",
    "tools": [
      {
        "type": "mcp",
        "server_label": "stripe",
        "server_url": "https://mcp.stripe.com",
        "authorization": "$STRIPE_OAUTH_ACCESS_TOKEN"
      }
    ]
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  input: "Create a payment link for $20",
  tools: [
    {
      type: "mcp",
      server_label: "stripe",
      server_url: "https://mcp.stripe.com",
      authorization: "$STRIPE_OAUTH_ACCESS_TOKEN"
    }
  ]
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    input="Create a payment link for $20",
    tools=[
        {
            "type": "mcp",
            "server_label": "stripe",
            "server_url": "https://mcp.stripe.com",
            "authorization": "$STRIPE_OAUTH_ACCESS_TOKEN"
        }
    ]
)

print(resp.output_text)
```


```csharp
using OpenAI.Responses;

string authToken = Environment.GetEnvironmentVariable("STRIPE_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "stripe",
    serverUri: new Uri("https://mcp.stripe.com"),
    authorizationToken: authToken
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Create a payment link for $20")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

为防止敏感令牌泄露，Responses API 不会存储你在 `authorization` 字段中提供的值。此值也不会在创建的 Response 对象中可见。因此，你必须在每次 Responses API 创建请求中发送 `authorization` 值。

## 连接器

Responses API 内置支持一组有限的第三方服务连接器。这些连接器允许你从 Dropbox 和 Gmail 等热门应用中引入上下文，使模型能够与这些热门服务交互。

连接器的使用方式与远程 MCP 服务器相同。两者都允许 OpenAI 模型在 API 请求中访问额外的第三方工具。但是，与调用远程 MCP 服务器时传递 `server_url` 不同，你需要传递一个 `connector_id`，它唯一标识 API 中可用的连接器。

### 可用连接器

*   Dropbox: `connector_dropbox`
*   Gmail: `connector_gmail`
*   Google Calendar: `connector_googlecalendar`
*   Google Drive: `connector_googledrive`
*   Microsoft Teams: `connector_microsoftteams`
*   Outlook Calendar: `connector_outlookcalendar`
*   Outlook Email: `connector_outlookemail`
*   SharePoint: `connector_sharepoint`

我们优先支持没有官方远程 MCP 服务器的服务。例如，GitHub 有一个官方 MCP 服务器，你可以通过将 `https://api.githubcopilot.com/mcp/` 传递给 MCP 工具中的 `server_url` 字段来连接。

### 授权连接器

在 `authorization` 字段中传入 OAuth 访问令牌。OAuth 客户端注册和授权必须由你的应用程序单独处理。

出于测试目的，你可以使用 Google 的 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) 生成临时访问令牌，用于 API 请求。

要使用 playground 测试连接器 API 功能，首先输入：

```
https://www.googleapis.com/auth/calendar.events
```

此授权范围将使 API 能够读取 Google Calendar 事件。在 UI 中的"Step 1: Select and authorize APIs"下操作。

在使用你的 Google 账户授权应用程序后，你将进入"Step 2: Exchange authorization code for tokens"。这将生成一个访问令牌，你可以在使用 Google Calendar 连接器的 API 请求中使用：

**使用 Google Calendar 连接器**

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "google_calendar",
        "connector_id": "connector_googlecalendar",
        "authorization": "ya29.A0AS3H6...",
        "require_approval": "never"
      }
    ],
    "input": "What is on my Google Calendar for today?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "google_calendar",
      connector_id: "connector_googlecalendar",
      authorization: "ya29.A0AS3H6...",
      require_approval: "never",
    },
  ],
  input: "What's on my Google Calendar for today?",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[
        {
            "type": "mcp",
            "server_label": "google_calendar",
            "connector_id": "connector_googlecalendar",
            "authorization": "ya29.A0AS3H6...",
            "require_approval": "never",
        },
    ],
    input="What's on my Google Calendar for today?",
)

print(resp.output_text)
```


```csharp
using OpenAI.Responses;

string authToken = Environment.GetEnvironmentVariable("GOOGLE_CALENDAR_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "google_calendar",
    connectorId: McpToolConnectorId.GoogleCalendar,
    authorizationToken: authToken,
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What's on my Google Calendar for today?")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

来自连接器的 MCP 工具调用与来自远程 MCP 服务器的 MCP 工具调用看起来相同，使用 `mcp_call` 输出项类型。在这种情况下，连接器的参数和响应都是 JSON 字符串：

```
{
  "id": "mcp_68a62ae1c93c81a2b98c29340aa3ed8800e9b63986850588",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"time_min\":\"2025-08-20T00:00:00\",\"time_max\":\"2025-08-21T00:00:00\",\"timezone_str\":null,\"max_results\":50,\"query\":null,\"calendar_id\":null,\"next_page_token\":null}",
  "error": null,
  "name": "search_events",
  "output": "{\"events\": [{\"id\": \"2n8ni54ani58pc3ii6soelupcs_20250820\", \"summary\": \"Home\", \"location\": null, \"start\": \"2025-08-20T00:00:00\", \"end\": \"2025-08-21T00:00:00\", \"url\": \"https://www.google.com/calendar/event?eid=Mm44bmk1NGFuaTU4cGMzaWk2c29lbHVwY3NfMjAyNTA4MjAga3doaW5uZXJ5QG9wZW5haS5jb20&ctz=America/Los_Angeles\", \"description\": \"\\n\\n\", \"transparency\": \"transparent\", \"display_url\": \"https://www.google.com/calendar/event?eid=Mm44bmk1NGFuaTU4cGMzaWk2c29lbHVwY3NfMjAyNTA4MjAga3doaW5uZXJ5QG9wZW5haS5jb20&ctz=America/Los_Angeles\", \"display_title\": \"Home\"}], \"next_page_token\": null}",
  "server_label": "Google_Calendar"
}
```

### 每个连接器中的可用工具

可用工具取决于你的 OAuth 令牌拥有哪些范围。展开下面的表格查看连接到每个应用程序时可以使用的工具。

Dropbox

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `search` | 搜索 Dropbox 中匹配查询的文件 | files.metadata.read, account\_info.read |
| `fetch` | 通过路径获取文件，可选原始下载 | files.content.read |
| `search_files` | 搜索 Dropbox 文件并返回结果 | files.metadata.read, account\_info.read |
| `fetch_file` | 获取文件的文本或原始内容 | files.content.read, account\_info.read |
| `list_recent_files` | 返回用户可访问的最近修改的文件 | files.metadata.read, account\_info.read |
| `get_profile` | 获取当前用户的 Dropbox 个人资料 | account\_info.read |

Gmail

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `get_profile` | 返回当前 Gmail 用户的个人资料 | userinfo.email, userinfo.profile |
| `search_emails` | 搜索 Gmail 中匹配查询或标签的邮件 | gmail.modify |
| `search_email_ids` | 获取匹配搜索的 Gmail 消息 ID | gmail.modify |
| `get_recent_emails` | 返回最近收到的 Gmail 消息 | gmail.modify |
| `read_email` | 获取单封 Gmail 消息（包括正文） | gmail.modify |
| `batch_read_email` | 一次调用中读取多封 Gmail 消息 | gmail.modify |

Google Calendar

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `get_profile` | 返回当前 Calendar 用户的个人资料 | userinfo.email, userinfo.profile |
| `search` | 在可选时间窗口内搜索 Calendar 事件 | calendar.events |
| `fetch` | 获取单个 Calendar 事件的详情 | calendar.events |
| `search_events` | 使用过滤器查找 Calendar 事件 | calendar.events |
| `read_event` | 通过 ID 读取 Google Calendar 事件 | calendar.events |

Google Drive

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `get_profile` | 返回当前 Drive 用户的个人资料 | userinfo.email, userinfo.profile |
| `list_drives` | 列出用户可访问的共享云端硬盘 | drive.readonly |
| `search` | 使用查询搜索 Drive 文件 | drive.readonly |
| `recent_documents` | 返回最近修改的文档 | drive.readonly |
| `fetch` | 下载 Drive 文件的内容 | drive.readonly |

Microsoft Teams

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `search` | 搜索 Microsoft Teams 聊天和频道消息 | Chat.Read, ChannelMessage.Read.All |
| `fetch` | 通过路径获取 Teams 消息 | Chat.Read, ChannelMessage.Read.All |
| `get_chat_members` | 列出 Teams 聊天的成员 | Chat.Read |
| `get_profile` | 返回已认证的 Teams 用户的个人资料 | User.Read |

Outlook Calendar

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `search_events` | 使用日期过滤器搜索 Outlook Calendar 事件 | Calendars.Read |
| `fetch_event` | 获取单个事件的详情 | Calendars.Read |
| `fetch_events_batch` | 一次调用中获取多个事件 | Calendars.Read |
| `list_events` | 列出日期范围内的日历事件 | Calendars.Read |
| `get_profile` | 获取当前用户的个人资料 | User.Read |

Outlook Email

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `get_profile` | 返回 Outlook 账户的个人资料信息 | User.Read |
| `list_messages` | 从文件夹中获取 Outlook 邮件 | Mail.Read |
| `search_messages` | 使用可选过滤器搜索 Outlook 邮件 | Mail.Read |
| `get_recent_emails` | 返回最近收到的邮件 | Mail.Read |
| `fetch_message` | 通过 ID 获取单封邮件 | Mail.Read |
| `fetch_messages_batch` | 一次请求中获取多封邮件 | Mail.Read |

Sharepoint

| 工具 | 描述 | 范围 |
| --- | --- | --- |
| `get_site` | 通过主机名和路径解析 SharePoint 站点 | Sites.Read.All |
| `search` | 通过关键字搜索 SharePoint/OneDrive 文档 | Sites.Read.All, Files.Read.All |
| `list_recent_documents` | 返回最近访问的文档 | Files.Read.All |
| `fetch` | 从 Graph 文件下载 URL 获取内容 | Files.Read.All |
| `get_profile` | 获取当前用户的个人资料 | User.Read |

## 延迟加载 MCP 服务器中的工具

如果你正在使用[工具搜索](/guides/tools-tool-search)，可以延迟加载 MCP 服务器暴露的函数，直到模型决定需要它们时再加载。为此，在 MCP 服务器工具定义上设置 `defer_loading: true`。

当你延迟加载 MCP 服务器时，模型仍然可以使用 MCP 服务器的标签和描述来决定何时搜索它，但各个函数定义仅在需要时才加载。这有助于减少整体令牌使用量，对于暴露大量函数的 MCP 服务器最为有用。

```
{
  "type": "mcp",
  "server_label": "dmcp",
  "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
  "server_url": "https://dmcp-server.deno.dev/sse",
  "defer_loading": true,
  "require_approval": "never"
}
```

## 风险与安全

MCP 工具允许你将 OpenAI 模型连接到外部服务。这是一个强大的功能，但也伴随着一些风险。

对于连接器，存在可能向 OpenAI 发送敏感数据或允许模型读取这些服务中潜在敏感数据的风险。

远程 MCP 服务器具有相同的风险，但尚未经过 OpenAI 验证。这些服务器可以允许模型访问、发送和接收数据，并在这些服务中执行操作。所有 MCP 服务器都是第三方服务，受其自身条款和条件约束。

如果你发现恶意 MCP 服务器，请向 `security@openai.com` 报告。

以下是集成连接器和远程 MCP 服务器时需要考虑的一些最佳实践。

#### 提示注入

[提示注入](https://chatgpt.com/?prompt=what%20is%20prompt%20injection?)是任何 LLM 应用中的重要安全考虑因素，当你让模型访问可以获取敏感数据或执行操作的 MCP 服务器和连接器时尤其如此。如果模型的提示包含用户提供的内容，请谨慎使用这些工具并采取适当的缓解措施。

#### 对敏感操作始终要求审批

使用 `require_approval` 和 `allowed_tools` 参数的可用配置，确保任何敏感操作都需要审批流程。

#### MCP 工具调用和输出中的 URL

请求 URL 或嵌入由连接器或远程 MCP 服务器的工具调用输出提供的图片 URL 可能是危险的。在应用程序代码中嵌入或以其他方式使用这些 URL 之前，请确保你信任提供这些 URL 的域名和服务。

#### 连接到受信任的服务器

选择由服务提供商自己托管的官方服务器（例如，我们建议连接到 Stripe 自己在 mcp.stripe.com 上托管的 Stripe 服务器，而不是第三方托管的 Stripe MCP 服务器）。由于目前官方远程 MCP 服务器不多，你可能会想使用由不运营该服务器的组织托管的 MCP 服务器，该服务器只是通过你的 API 将请求代理到该服务。如果你必须这样做，请格外小心地对这些"聚合器"进行尽职调查，并仔细审查它们如何使用你的数据。

#### 记录和审查与第三方 MCP 服务器共享的数据

由于 MCP 服务器定义了自己的工具定义，它们可能会请求你不一定愿意与该 MCP 服务器的托管方共享的数据。因此，Responses API 中的 MCP 工具默认要求对每个 MCP 工具调用进行审批。在开发应用程序时，请仔细且全面地审查与这些 MCP 服务器共享的数据类型。一旦你对该 MCP 服务器建立了信任，可以跳过这些审批以获得更高效的执行。

我们还建议记录发送到 MCP 服务器的任何数据。如果你使用 `store=true` 的 Responses API，这些数据已通过 API 记录 30 天，除非你的组织启用了零数据保留。你可能还希望在自己的系统中记录这些数据，并定期审查以确保数据按你的预期共享。

恶意 MCP 服务器可能包含隐藏指令（提示注入），旨在使 OpenAI 模型表现异常。虽然 OpenAI 已实施内置保护措施来帮助检测和阻止这些威胁，但仔细审查输入和输出并确保仅与受信任的服务器建立连接至关重要。

MCP 服务器可能会意外更新工具行为，可能导致意外或恶意行为。

#### 对零数据保留和数据驻留的影响

MCP 工具与零数据保留和数据驻留兼容，但需要注意的是，MCP 服务器是第三方服务，发送到 MCP 服务器的数据受其数据保留和数据驻留政策约束。

换句话说，如果你是一个数据驻留在欧洲的组织，OpenAI 将限制客户内容的推理和存储在欧洲进行，直到通信或数据发送到 MCP 服务器为止。你有责任确保 MCP 服务器也遵守你可能有的任何零数据保留或数据驻留要求。在[此处](/guides/your-data)了解更多关于零数据保留和数据驻留的信息。

## 使用说明

| API 可用性 | 速率限制 | 备注 |
| --- | --- | --- |
| [Responses]( https://developers.openai.com/api/reference/responses)[Chat Completions]( https://developers.openai.com/api/reference/chat)[Assistants]( https://developers.openai.com/api/reference/assistants) | **Tier 1**  
200 RPM**Tier 2 and 3**  
1000 RPM**Tier 4 and 5**  
2000 RPM | [定价](/pricing#built-in-tools)  
[ZDR 和数据驻留](/guides/your-data) |
