<!-- Source: https://developers.openai.com/api/docs/guides/tools-web-search -->

网页搜索允许模型访问互联网上的最新信息，并提供带有来源引用的答案。要启用此功能，请在 Responses API 中使用网页搜索工具，在某些情况下也可在 Chat Completions 中使用。

OpenAI 模型提供三种主要的网页搜索类型：

1.  非推理网页搜索：非推理模型将用户的查询发送给网页搜索工具，该工具根据排名靠前的结果返回响应。没有内部规划，模型只是传递搜索工具的响应。这种方法速度快，适合快速查询。
2.  推理模型的智能体搜索是一种模型主动管理搜索过程的方法。它可以在思维链中执行网页搜索、分析结果并决定是否继续搜索。这种灵活性使智能体搜索非常适合复杂的工作流程，但也意味着搜索时间比快速查询更长。例如，你可以调整 `gpt-5.5` 等模型的推理级别来改变搜索的深度和延迟。
3.  深度研究是一种专门的、由智能体驱动的方法，用于推理模型进行深入、扩展的调查。模型在其思维链中进行网页搜索，通常会访问数百个来源。深度研究可能运行数分钟，最好与后台模式配合使用。使用 `gpt-5.5` 并将推理设置为 `high` 或 `xhigh`。

## 选择集成方式

| 使用场景 | 推荐路径 | 备注 |
| --- | --- | --- |
| 新的网页搜索集成 | Responses API 配合 `web_search` 和 `gpt-5.5` | 支持托管的网页搜索控制，如过滤器、来源、实时访问控制和更长的研究运行 |
| 现有的 Chat Completions 搜索集成 | Chat Completions 配合 `gpt-5-search-api` | 仅在需要保留 Chat Completions 集成时使用 |
| 多步骤研究或长时间运行的报告 | `gpt-5.5` 配合 `high` 或 `xhigh` 推理 | 对于可能需要数分钟的报告，使用后台模式 |

使用 [Responses API](/api/docs/api-reference/responses)，你可以通过在 API 请求的 `tools` 数组中配置网页搜索来启用它以生成内容。与任何其他工具一样，模型可以根据输入提示的内容选择是否搜索网页。

对于新的 Responses API 集成，使用 `{ "type": "web_search" }`。早期的 `web_search_preview` 工具仍可用于旧版集成，但它不支持较新的控制参数，如 `filters`、`external_web_access` 和 `return_token_budget`。

网页搜索工具示例

javascript

```
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

```
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{"type": "web_search"}],
    input="What was a positive news story from today?"
)

print(response.output_text)
```

```
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{"type": "web_search"}],
        "input": "what was a positive news story from today?"
}'
```

```
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
tools:
  - type: web_search
input: What was a positive news story from today?
YAML
```

```
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

## 输出和引用

使用网页搜索工具的模型响应将包含两部分：

*   一个 `web_search_call` 输出项，包含搜索调用的 ID，以及在 `web_search_call.action` 中执行的操作。操作为以下之一：
    *   `search`，表示网页搜索。它通常（但不总是）包含被搜索的 `queries`。搜索操作会产生工具调用费用（参见[定价](/api/docs/pricing#built-in-tools)）。
    *   `open_page`，表示打开一个页面。在推理模型中支持。
    *   `find_in_page`，表示在页面内搜索。在推理模型中支持。
*   一个 `message` 输出项，包含：
    *   `message.content[0].text` 中的文本结果
    *   `message.content[0].annotations` 中引用的 URL 注释

默认情况下，模型的响应将包含网页搜索结果中找到的 URL 的内联引用。此外，`url_citation` 注释对象将包含引用来源的 URL、标题和位置。

向最终用户显示网页结果或网页结果中包含的信息时，内联引用必须在用户界面中清晰可见且可点击。

```
[
  {
    "type": "web_search_call",
    "id": "ws_67c9fa0502748190b7dd390736892e100be649c1a5ff9609",
    "status": "completed",
    "action": {
      "type": "search",
      "query": "latest news about AI"
    }
  },
  {
    "id": "msg_67c9fa077e288190af08fdffda2e34f20be649c1a5ff9609",
    "type": "message",
    "status": "completed",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "On March 6, 2025, several news...",
        "annotations": [
          {
            "type": "url_citation",
            "start_index": 2606,
            "end_index": 2758,
            "url": "https://...",
            "title": "Title..."
          }
        ]
      }
    ]
  }
]
```

使用 [Chat Completions API](/api/docs/api-reference/chat)，你可以直接访问 [ChatGPT 中的搜索](https://openai.com/index/introducing-chatgpt-search/) 所使用的微调模型和工具。

使用 Chat Completions 时，模型在响应你的查询之前始终会从网页检索信息。要让模型自行决定是否搜索，请切换到带有 `web_search` 工具的 [Responses API](/api/docs/guides/tools-web-search?api-mode=responses)。

目前，在 Chat Completions 中使用以下模型进行网页搜索：

*   `gpt-5-search-api`

网页搜索参数示例

javascript

```
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-5-search-api",
    web_search_options: {},
    messages: [{
        "role": "user",
        "content": "What was a positive news story from today?"
    }],
});

console.log(completion.choices[0].message.content);
```

```
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5-search-api",
    web_search_options={},
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
)

print(completion.choices[0].message.content)
```

```
curl -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-5-search-api",
        "web_search_options": {},
        "messages": [{
            "role": "user",
            "content": "What was a positive news story from today?"
        }]
    }'
```

## 输出和引用

`choices` 数组中的 API 响应项将包含：

*   `message.content` 包含模型的文本结果，包括任何内联引用
*   `annotations` 包含引用的 URL 列表

默认情况下，模型的响应将包含网页搜索结果中找到的 URL 的内联引用。此外，`url_citation` 注释对象将包含引用来源的 URL 和标题，以及模型响应中使用这些来源的起始和结束索引字符位置。

向最终用户显示网页结果或网页结果中包含的信息时，内联引用必须在用户界面中清晰可见且可点击。

```
[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "the model response is here...",
      "refusal": null,
      "annotations": [
        {
          "type": "url_citation",
          "url_citation": {
            "end_index": 985,
            "start_index": 764,
            "title": "Page title...",
            "url": "https://..."
          }
        }
      ]
    },
    "finish_reason": "stop"
  }
]
```

## 从旧版网页搜索迁移

| 如果你使用 | 推荐路径 | 备注 |
| --- | --- | --- |
| Responses 中的 `web_search_preview` | 迁移到 `web_search` | `web_search` 支持较新的控制参数，如 `filters`、`external_web_access` 和 `return_token_budget` |
| `gpt-4o-search-preview` 或 `gpt-4o-mini-search-preview` | 迁移到 Responses `web_search`，或如果必须留在 Chat Completions 则使用 `gpt-5-search-api` | 预览搜索模型已弃用，将于 2026-07-23 关闭 |
| Chat Completions 搜索集成 | 使用 `gpt-5-search-api`，或迁移到 Responses `web_search` 以获得更多工具控制和可选搜索 | Chat Completions 搜索模型在响应前始终搜索；Responses 搜索是一个工具 |

## 搜索上下文大小

`search_context_size` 控制在模型生成响应之前，从网页搜索结果中提供给模型多少上下文。对于简单查询使用 `low`，`medium` 作为平衡的默认值，当答案可能需要搜索结果中更多细节时使用 `high`。此设置不会设定精确的 token 数量，也不保证特定数量的来源或引用。

**设置搜索上下文大小**

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "web_search",
        "search_context_size": "low",
    }],
    input="What movie won best picture in 2025?",
)

print(response.output_text)
```
```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool(
    searchContextSize: WebSearchToolContextSize.Low
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart(
            "What movie won best picture in 2025?"
        )
    ])
], options);

Console.WriteLine(response.GetOutputText());
```
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    tools: [{
        type: "web_search",
        search_context_size: "low",
    }],
    input: "What movie won best picture in 2025?",
});
console.log(response.output_text);
```
```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{
            "type": "web_search",
            "search_context_size": "low"
        }],
        "input": "What movie won best picture in 2025?"
    }'
```

## 运行更长的网页研究

`return_token_budget` 控制在使用 GPT-5+ 推理模型进行 Responses API 搜索运行时，网页搜索工具可以返回多少网页搜索结果内容。大多数请求保持默认值即可。仅在需要检查许多页面且可能在标准返回 token 上限处停止的高强度研究或评估运行中将其设置为 `unlimited`。

谨慎使用 `unlimited`，因为它可能增加延迟和成本。对于长时间运行的多搜索任务，使用后台模式（`background: true`），这样请求可以异步继续运行，你可以稍后检索最终响应。

| 值 | 行为 |
| --- | --- |
| `default` | 使用网页搜索结果的标准返回 token 预算。这与省略 `return_token_budget` 的行为相同。 |
| `unlimited` | 移除网页搜索运行的默认返回 token 预算。 |

此参数仅适用于托管的 Responses API `web_search` 工具配合 GPT-5+ 推理网页搜索。它不会更改搜索上下文窗口，也不适用于非推理网页搜索、旧版 Search API 路径、容器网页搜索、Chat Completions 搜索模型或 `web_search_preview`。仅支持 `default` 和 `unlimited` 值；`null`、数字和其他字符串将被拒绝。

**运行更长的网页搜索**

```curl
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "xhigh" },
    "tools": [
      {
        "type": "web_search",
        "return_token_budget": "unlimited"
      }
    ],
    "input": "Research the economic impact of semaglutide on global healthcare systems.\n\nDo:\n- Include specific figures, trends, statistics, and measurable outcomes.\n- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.\n- Include inline citations and return all source metadata.\n\nBe analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling."
  }'
```
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "xhigh" },
    tools: [
        {
            type: "web_search",
            return_token_budget: "unlimited",
        },
    ],
    input: [
        "Research the economic impact of semaglutide on global healthcare systems.",
        "",
        "Do:",
        "- Include specific figures, trends, statistics, and measurable outcomes.",
        "- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.",
        "- Include inline citations and return all source metadata.",
        "",
        "Be analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling.",
    ].join("\n"),
});

console.log(response.output_text);
```
```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "xhigh"},
    tools=[
        {
            "type": "web_search",
            "return_token_budget": "unlimited",
        }
    ],
    input="""Research the economic impact of semaglutide on global healthcare systems.

Do:
- Include specific figures, trends, statistics, and measurable outcomes.
- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.
- Include inline citations and return all source metadata.

Be analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling.""",
)

print(response.output_text)
```

## 域名过滤

网页搜索中的域名过滤允许你将结果限制在特定的域名集合中。通过 `filters` 参数，你可以配置最多 100 个 `allowed_domains` 或最多 100 个 `blocked_domains`。格式化域名时，省略 HTTP 或 HTTPS 前缀。例如，使用 `openai.com` 而不是 `https://openai.com/`。此方法也会在搜索中包含子域名。请注意，域名过滤仅在 Responses API 中配合 `web_search` 工具可用。

## 来源

要查看网页搜索期间检索到的所有 URL，请使用 `sources` 字段。与仅显示最相关引用的内联引用不同，sources 返回模型在形成响应时查阅的完整 URL 列表。来源数量通常大于引用数量。实时第三方数据源也会在此处显示，标记为 `oai-sports`、`oai-weather` 或 `oai-finance`。sources 字段在 `web_search` 和 `web_search_preview` 工具中均可用。

**列出来源**

```curl
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "low" },
    "tools": [
      {
        "type": "web_search",
        "filters": {
          "allowed_domains": [
            "pubmed.ncbi.nlm.nih.gov",
            "clinicaltrials.gov",
            "www.who.int",
            "www.cdc.gov",
            "www.fda.gov"
          ],
          "blocked_domains": [
            "reddit.com",
            "quora.com",
            "wikipedia.org"
          ]
        }
      }
    ],
    "tool_choice": "auto",
    "include": ["web_search_call.action.sources"],
    "input": "Please perform a web search on how semaglutide is used in the treatment of diabetes."
  }'
```
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    tools: [
        {
            type: "web_search",
            filters: {
                allowed_domains: [
                    "pubmed.ncbi.nlm.nih.gov",
                    "clinicaltrials.gov",
                    "www.who.int",
                    "www.cdc.gov",
                    "www.fda.gov",
                ],
                blocked_domains: [
                    "reddit.com",
                    "quora.com",
                    "wikipedia.org",
                ],
            },
        },
    ],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    input: "Please perform a web search on how semaglutide is used in the treatment of diabetes.",
});

console.log(response.output_text);
```
```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    tools=[
        {
            "type": "web_search",
            "filters": {
                "allowed_domains": [
                    "pubmed.ncbi.nlm.nih.gov",
                    "clinicaltrials.gov",
                    "www.who.int",
                    "www.cdc.gov",
                    "www.fda.gov",
                ],
                "blocked_domains": [
                    "reddit.com",
                    "quora.com",
                    "wikipedia.org",
                ],
            },
        }
    ],
    tool_choice="auto",
    include=["web_search_call.action.sources"],
    input="Please perform a web search on how semaglutide is used in the treatment of diabetes.",
)

print(response.output_text)
```

## 用户位置

要根据地理位置优化搜索结果，你可以使用国家、城市、地区和/或时区指定大致的用户位置。

*   `city` 和 `region` 字段是自由文本字符串，例如分别为 `Minneapolis` 和 `Minnesota`。
*   `country` 字段是两个字母的 [ISO 国家代码](https://en.wikipedia.org/wiki/ISO_3166-1)，如 `US`。
*   `timezone` 字段是 [IANA 时区](https://timeapi.io/documentation/iana-timezones)，如 `America/Chicago`。

请注意，使用网页搜索的深度研究模型不支持用户位置。

**自定义用户位置**

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "web_search",
        "user_location": {
            "type": "approximate",
            "country": "GB",
            "city": "London",
            "region": "London",
        }
    }],
    input="What are the best restaurants near me?",
)

print(response.output_text)
```
```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool(
    userLocation: WebSearchToolLocation.CreateApproximateLocation(
        country: "GB",
        city: "London",
        region: "Granary Square"
    )
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart(
            "What are the best restaurants near me?"
        )
    ])
], options);

Console.WriteLine(response.GetOutputText());
```
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    tools: [{
        type: "web_search",
        user_location: {
            type: "approximate",
            country: "GB",
            city: "London",
            region: "London"
        }
    }],
    input: "What are the best restaurants near me?",
});
console.log(response.output_text);
```
```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{
            "type": "web_search",
            "user_location": {
                "type": "approximate",
                "country": "GB",
                "city": "London",
                "region": "London"
            }
        }],
        "input": "What are the best restaurants near me?"
    }'
```

**自定义用户位置**

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5-search-api",
    web_search_options={
        "user_location": {
            "type": "approximate",
            "approximate": {
                "country": "GB",
                "city": "London",
                "region": "London",
            }
        },
    },
    messages=[{
        "role": "user",
        "content": "What are the best restaurants near me?",
    }],
)

print(completion.choices[0].message.content)
```
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-5-search-api",
    web_search_options: {
        user_location: {
            type: "approximate",
            approximate: {
                country: "GB",
                city: "London",
                region: "London",
            },
        },
    },
    messages: [{
        "role": "user",
        "content": "What are the best restaurants near me?",
    }],
});
console.log(completion.choices[0].message.content);
```
```curl
curl -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-5-search-api",
        "web_search_options": {
            "user_location": {
                "type": "approximate",
                "approximate": {
                    "country": "GB",
                    "city": "London",
                    "region": "London"
                }
            }
        },
        "messages": [{
            "role": "user",
            "content": "What are the best restaurants near me?"
        }]
    }'
```

## 实时互联网访问

在 Responses API 中控制网页搜索工具是获取实时内容还是仅使用缓存/索引结果。

*   在 `web_search` 工具上设置 `external_web_access: false` 以在离线/仅缓存模式下运行。
*   如果不设置，默认为 `true`（实时访问）。
*   预览变体（`web_search_preview`）忽略此参数，行为如同 `external_web_access` 为 `true`。

**控制实时互联网访问**

```curl
curl "https://api.openai.com/v1/responses" -H "Content-Type: application/json" -H "Authorization: Bearer $OPENAI_API_KEY" -d '{
  "model": "gpt-5.5",
  "tools": [
    { "type": "web_search", "external_web_access": false }
  ],
  "tool_choice": "auto",
  "input": "Find when the Eiffel Tower opened to the public and cite the source."
}'
```
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
model: "gpt-5.5",
tools: [
{ type: "web_search", external_web_access: false },
],
tool_choice: "auto",
input: "Find when the Eiffel Tower opened to the public and cite the source.",
});

console.log(response.output_text);
```
```python
from openai import OpenAI
client = OpenAI()

resp = client.responses.create(
model="gpt-5.5",
tools=[{ "type": "web_search", "external_web_access": False }],
tool_choice="auto",
input="Find when the Eiffel Tower opened to the public and cite the source.",
)
print(resp.output_text)
```

## 限制

#### Chat Completions API

Chat Completions API 仅支持专用搜索模型进行网页搜索。这些模型不支持 Responses API `web_search` 的功能，如域名过滤器、完整来源列表、实时访问控制和返回 token 预算控制。

| 模型 | 上下文窗口 | 限制 |
| --- | --- | --- |
| `gpt-5-search-api` | 200k | 使用 Chat Completions 搜索模型路径 |
| `gpt-4o-search-preview` | 128k | 使用 Chat Completions 搜索模型路径；[已弃用，2026-07-23 关闭](/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |
| `gpt-4o-mini-search-preview` | 128k | 使用 Chat Completions 搜索模型路径；[已弃用，2026-07-23 关闭](/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |

#### Responses API

使用托管的 `web_search` 工具。Responses API 仍然接受 `web_search_preview` 用于旧版集成，但新集成请使用 `web_search`。

要获得更大的模型上下文窗口，请使用 `gpt-5.5`。网页搜索上下文窗口保持 128k。

| 模型 | 模型上下文窗口 | 限制 |
| --- | --- | --- |
| `gpt-4.1` | 1M | 搜索上下文限制为 128k |
| `gpt-4.1-mini` | 1M | 搜索上下文限制为 128k |
| `o4-mini` | 200k | 搜索上下文限制为 128k；[已弃用，2026-10-23 关闭](/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |

对于 Responses API 网页搜索，搜索上下文窗口限制为 128k，即使模型上下文窗口更大。

*   网页搜索不支持 [`gpt-5`](/api/docs/models/gpt-5) 的 `minimal` 推理。
*   [`gpt-5.4`](/api/docs/models/gpt-5.4) 将推理努力设置为 `none` 可能产生较低质量的结果。
*   Responses API 网页搜索使用底层模型的分层速率限制。
*   `web_search_preview` 不支持 `filters` 或 `return_token_budget`，并忽略 `external_web_access`。
*   使用 `tool_choice: "auto"` 时，搜索是可选的。当搜索必须运行时，使用 `tool_choice: "required"` 或特定的网页搜索工具选择。

## 使用说明

| API 可用性 | 速率限制 | 备注 |
| --- | --- | --- |
| [Responses](/api/docs/api-reference/responses)[Chat Completions](/api/docs/api-reference/chat)[Assistants](/api/docs/api-reference/assistants) | 与使用该工具的底层[模型](/api/docs/models)的分层速率限制相同。 | [定价](/api/docs/pricing#built-in-tools)  
[ZDR 和数据驻留](/api/docs/guides/your-data) |
