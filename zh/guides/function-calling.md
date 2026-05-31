
**函数调用**（也称为**工具调用**）为 OpenAI 模型提供了一种强大而灵活的方式来与外部系统交互，并访问其训练数据之外的数据。本指南展示了如何将模型连接到应用程序提供的数据和操作。我们将展示如何使用函数工具（由 JSON schema 定义）以及使用自由文本输入和输出的自定义工具。

如果你的应用程序有很多函数或大型 schema，你可以将函数调用与 [tool search](/guides/tools-tool-search) 配合使用，以延迟加载不常用的工具，仅在模型需要时才加载它们。只有 `gpt-5.4` 及更高版本的模型支持 `tool_search`。

## 工作原理

让我们先了解一些关于工具调用的关键术语。在建立了工具调用的共同词汇之后，我们将通过一些实际示例来展示它是如何工作的。

工具 - 我们赋予模型的功能

**函数**或**工具**抽象地指代我们告知模型可以访问的一项功能。当模型生成对提示的响应时，它可能会决定需要工具提供的数据或功能来遵循提示的指令。

你可以让模型访问以下工具：

*   获取某个位置的今日天气
*   根据给定的用户 ID 访问账户详情
*   为丢失的订单发起退款

或者任何你希望模型在响应提示时能够了解或执行的其他操作。

当我们向模型发出带有提示的 API 请求时，可以包含模型可能考虑使用的工具列表。例如，如果我们希望模型能够回答关于世界某地当前天气的问题，我们可能会给它一个以 `location` 为参数的 `get_weather` 工具。

工具调用 - 模型请求使用工具

**函数调用**或**工具调用**指的是我们可以从模型获得的一种特殊响应，当模型检查提示后确定为了遵循提示中的指令，它需要调用我们提供的某个工具时就会产生这种响应。

如果模型在 API 请求中收到类似"巴黎的天气怎么样？"的提示，它可能会以 `get_weather` 工具的工具调用作为响应，并将 `Paris` 作为 `location` 参数。

工具调用输出 - 我们为模型生成的输出

**函数调用输出**或**工具调用输出**指的是工具使用模型工具调用的输入所生成的响应。工具调用输出可以是结构化 JSON 或纯文本，并且应该包含对特定模型工具调用的引用（在后续示例中通过 `call_id` 引用）。完成我们的天气示例：

*   模型可以访问一个以 `location` 为参数的 `get_weather` **工具**。
*   对于类似"巴黎的天气怎么样？"的提示，模型返回一个包含值为 `Paris` 的 `location` 参数的**工具调用**
*   **工具调用输出**可能返回一个 JSON 对象（例如 `{"temperature": "25", "unit": "C"}`，表示当前温度为 25 度）、[图像内容](/guides/images)或[文件内容](/guides/file-inputs)。

然后我们将工具定义、原始提示、模型的工具调用和工具调用输出全部发送回模型，最终收到如下文本响应：

```
The weather in Paris today is 25C.
```python

函数与工具的区别

*   函数是一种特定类型的工具，由 JSON schema 定义。函数定义允许模型将数据传递给你的应用程序，你的代码可以在其中访问数据或执行模型建议的操作。
*   除了函数工具之外，还有自定义工具（在本指南中描述），它们使用自由文本输入和输出。
*   还有[内置工具](/guides/tools)，它们是 OpenAI 平台的一部分。这些工具使模型能够[搜索网络](/guides/tools-web-search)、[执行代码](/guides/tools-code-interpreter)、访问 [MCP 服务器](/guides/tools-remote-mcp)的功能等。

### 工具调用流程

工具调用是你的应用程序与模型之间通过 OpenAI API 进行的多步对话。工具调用流程有五个高级步骤：

1.  向模型发送请求，附带它可以调用的工具
2.  从模型接收工具调用
3.  在应用程序端使用工具调用的输入执行代码
4.  向模型发送第二个请求，附带工具输出
5.  从模型接收最终响应（或更多工具调用）

![Function Calling Diagram Steps](https://cdn.openai.com/API/docs/images/function-calling-diagram-steps.png)

## 函数工具示例

让我们看一个 `get_horoscope` 函数的端到端工具调用流程，该函数获取某个星座的每日运势。

**完整的工具调用示例**

```
from openai import OpenAI
import json

client = OpenAI()

# 1. Define a list of callable tools for the model
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_horoscope",
            "description": "Get today's horoscope for an astrological sign.",
            "parameters": {
                "type": "object",
                "properties": {
                    "sign": {
                        "type": "string",
                        "description": "An astrological sign like Taurus or Aquarius",
                    },
                },
                "required": ["sign"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
]

def get_horoscope(sign):
    return f"{sign}: Next Tuesday you will befriend a baby otter."

messages = [
    {"role": "user", "content": "What is my horoscope? I am an Aquarius."}
]

# 2. Prompt the model with tools defined
response = client.chat.completions.create(
    model="gpt-4.1",
    messages=messages,
    tools=tools,
)

messages.append(response.choices[0].message)

for tool_call in response.choices[0].message.tool_calls or []:
    if tool_call.function.name == "get_horoscope":
        # 3. Execute the function logic for get_horoscope
        args = json.loads(tool_call.function.arguments)
        horoscope = get_horoscope(args["sign"])

        # 4. Provide function call results to the model
        messages.append(
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps({"horoscope": horoscope}),
            }
        )

response = client.chat.completions.create(
    model="gpt-4.1",
    messages=messages,
    tools=tools,
)

# 5. The model should be able to give a response!
print(response.choices[0].message.content)
```javascript

```
import OpenAI from "openai";

const openai = new OpenAI();

// 1. Define a list of callable tools for the model
const tools = [
  {
    type: "function",
    function: {
      name: "get_horoscope",
      description: "Get today's horoscope for an astrological sign.",
      parameters: {
        type: "object",
        properties: {
          sign: {
            type: "string",
            description: "An astrological sign like Taurus or Aquarius",
          },
        },
        required: ["sign"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

function getHoroscope(sign) {
  return `${sign}: Next Tuesday you will befriend a baby otter.`;
}

const messages = [
  { role: "user", content: "What is my horoscope? I am an Aquarius." },
];

// 2. Prompt the model with tools defined
let response = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages,
  tools,
});

messages.push(response.choices[0].message);

for (const toolCall of response.choices[0].message.tool_calls ?? []) {
  if (toolCall.function.name === "get_horoscope") {
    // 3. Execute the function logic for get_horoscope
    const args = JSON.parse(toolCall.function.arguments);
    const horoscope = getHoroscope(args.sign);

    // 4. Provide function call results to the model
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify({ horoscope }),
    });
  }
}

response = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages,
  tools,
});

// 5. The model should be able to give a response!
console.log(response.choices[0].message.content);
```python


**完整的工具调用示例**

```
from openai import OpenAI
import json

client = OpenAI()

# 1. Define a list of callable tools for the model
tools = [
    {
        "type": "function",
        "name": "get_horoscope",
        "description": "Get today's horoscope for an astrological sign.",
        "parameters": {
            "type": "object",
            "properties": {
                "sign": {
                    "type": "string",
                    "description": "An astrological sign like Taurus or Aquarius",
                },
            },
            "required": ["sign"],
        },
    },
]

def get_horoscope(sign):
    return f"{sign}: Next Tuesday you will befriend a baby otter."

# Create a running input list we will add to over time
input_list = [
    {"role": "user", "content": "What is my horoscope? I am an Aquarius."}
]

# 2. Prompt the model with tools defined
response = client.responses.create(
    model="gpt-5",
    tools=tools,
    input=input_list,
)

# Save function call outputs for subsequent requests
input_list += response.output

for item in response.output:
    if item.type == "function_call":
        if item.name == "get_horoscope":
            # 3. Execute the function logic for get_horoscope
            sign = json.loads(item.arguments)["sign"]
            horoscope = get_horoscope(sign)
            
            # 4. Provide function call results to the model
            input_list.append({
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": horoscope,
            })

print("Final input:")
print(input_list)

response = client.responses.create(
    model="gpt-5",
    instructions="Respond only with a horoscope generated by a tool.",
    tools=tools,
    input=input_list,
)

# 5. The model should be able to give a response!
print("Final output:")
print(response.model_dump_json(indent=2))
print("\n" + response.output_text)
```javascript

```
import OpenAI from "openai";

const openai = new OpenAI();

// 1. Define a list of callable tools for the model
const tools = [
  {
    type: "function",
    name: "get_horoscope",
    description: "Get today's horoscope for an astrological sign.",
    parameters: {
      type: "object",
      properties: {
        sign: {
          type: "string",
          description: "An astrological sign like Taurus or Aquarius",
        },
      },
      required: ["sign"],
      additionalProperties: false,
    },
    strict: true,
  },
];

function getHoroscope(sign) {
  return `${sign}: Next Tuesday you will befriend a baby otter.`;
}

// Create a running input list we will add to over time
let input = [
  { role: "user", content: "What is my horoscope? I am an Aquarius." },
];

// 2. Prompt the model with tools defined
let response = await openai.responses.create({
  model: "gpt-5",
  tools,
  input,
});

// Preserve model output for the next turn
input.push(...response.output);

for (const item of response.output) {
  if (item.type !== "function_call") continue;

  if (item.name === "get_horoscope") {
    // 3. Execute the function logic for get_horoscope
    const { sign } = JSON.parse(item.arguments);
    const horoscope = getHoroscope(sign);

    // 4. Provide function call results to the model
    input.push({
      type: "function_call_output",
      call_id: item.call_id,
      output: horoscope,
    });
  }
}

console.log("Final input:");
console.log(JSON.stringify(input, null, 2));

response = await openai.responses.create({
  model: "gpt-5",
  instructions: "Respond only with a horoscope generated by a tool.",
  tools,
  input,
});

// 5. The model should be able to give a response!
console.log("Final output:");
console.log(response.output_text);
```


请注意，对于 GPT-5 或 o4-mini 等推理模型，模型响应中返回的任何推理项（包含工具调用的）也必须与工具调用输出一起传回。

## 定义函数

函数通常在每个 API 请求的 `tools` 参数中声明。通过 [tool search](/guides/tools-tool-search)，你的应用程序也可以在交互过程中稍后加载延迟的函数。无论哪种方式，每个可调用函数都使用相同的 schema 结构。函数定义具有以下属性：

| 字段 | 描述 |
| --- | --- |
| `type` | 应始终为 `function` |
| `name` | 函数名称（例如 `get_weather`） |
| `description` | 关于何时以及如何使用该函数的详细信息 |
| `parameters` | 定义函数输入参数的 [JSON schema](https://json-schema.org/) |
| `strict` | 是否对函数调用强制执行严格模式 |

以下是 `get_weather` 函数的示例函数定义

```
{
  "type": "function",
  "name": "get_weather",
  "description": "Retrieves current weather for the given location.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City and country e.g. Bogotá, Colombia"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Units the temperature will be returned in."
      }
    },
    "required": ["location", "units"],
    "additionalProperties": false
  },
  "strict": true
}
```

由于 `parameters` 由 [JSON schema](https://json-schema.org/) 定义，你可以利用其许多丰富的特性，如属性类型、枚举、描述、嵌套对象和递归对象。

## 定义命名空间

使用命名空间按领域对相关工具进行分组，例如 `crm`、`billing` 或 `shipping`。命名空间有助于组织类似的工具，在模型必须在服务于不同系统或目的的工具之间进行选择时特别有用，例如一个用于 CRM 的搜索工具和另一个用于支持工单系统的搜索工具。

```
{
  "type": "namespace",
  "name": "crm",
  "description": "CRM tools for customer lookup and order management.",
  "tools": [
    {
      "type": "function",
      "name": "get_customer_profile",
      "description": "Fetch a customer profile by customer ID.",
      "parameters": {
        "type": "object",
        "properties": {
          "customer_id": { "type": "string" }
        },
        "required": ["customer_id"],
        "additionalProperties": false
      }
    },
    {
      "type": "function",
      "name": "list_open_orders",
      "description": "List open orders for a customer ID.",
      "defer_loading": true,
      "parameters": {
        "type": "object",
        "properties": {
          "customer_id": { "type": "string" }
        },
        "required": ["customer_id"],
        "additionalProperties": false
      }
    }
  ]
}
```python

## 工具搜索

如果你需要让模型访问大量工具生态系统，可以使用 `tool_search` 延迟加载部分或全部工具。`tool_search` 工具让模型搜索相关工具，将它们添加到模型上下文中，然后使用它们。只有 `gpt-5.4` 及更高版本的模型支持它。阅读 [tool search 指南](/guides/tools-tool-search)了解更多信息。

（可选）使用 pydantic 和 zod 进行函数调用

虽然我们鼓励你直接定义函数 schema，但我们的 SDK 提供了将 `pydantic` 和 `zod` 对象转换为 schema 的辅助工具。并非所有 `pydantic` 和 `zod` 特性都受支持。

**定义对象来表示函数 schema**

```
from openai import OpenAI, pydantic_function_tool
from pydantic import BaseModel, Field

client = OpenAI()

class GetWeather(BaseModel):
    location: str = Field(
        ...,
        description="City and country e.g. Bogotá, Colombia"
    )

tools = [pydantic_function_tool(GetWeather)]

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "What's the weather like in Paris today?"}],
    tools=tools
)

print(completion.choices[0].message.tool_calls)
```javascript

```
import OpenAI from "openai";
import { z } from "zod";
import { zodFunction } from "openai/helpers/zod";

const openai = new OpenAI();

const GetWeatherParameters = z.object({
  location: z.string().describe("City and country e.g. Bogotá, Colombia"),
});

const tools = [
  zodFunction({ name: "getWeather", parameters: GetWeatherParameters }),
];

const messages = [
  { role: "user", content: "What's the weather like in Paris today?" },
];

const response = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages,
  tools,
  store: true,
});

console.log(response.choices[0].message.tool_calls);
```


### 定义函数的最佳实践

1.  **编写清晰详细的函数名称、参数描述和指令。**
    
    *   **明确描述函数和每个参数的用途**（及其格式），以及输出代表什么。
    *   **使用系统提示来描述何时（以及何时不）使用每个函数。** 通常，告诉模型_确切_该做什么。
    *   **包含示例和边界情况**，特别是为了纠正任何反复出现的失败。（**注意：**添加示例可能会降低[推理模型](/guides/reasoning)的性能。）
    *   **对于延迟加载的工具，将详细指导放在函数描述中，保持命名空间描述简洁。** 命名空间帮助模型选择要加载什么；函数描述帮助它正确使用已加载的工具。
2.  **应用软件工程最佳实践。**
    
    *   **使函数显而易见且直观**。（[最小惊讶原则](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)）
    *   **使用枚举**和对象结构使无效状态不可表示。（例如 `toggle_light(on: bool, off: bool)` 允许无效调用）
    *   **通过实习生测试。** 实习生/人类能否仅凭你给模型的信息正确使用该函数？（如果不能，他们会问你什么问题？将答案添加到提示中。）
3.  **尽可能减轻模型的负担，使用代码处理。**
    
    *   **不要让模型填写你已经知道的参数。** 例如，如果你已经根据之前的菜单获得了 `order_id`，不要设置 `order_id` 参数——而是使用无参数的 `submit_refund()` 并通过代码传递 `order_id`。
    *   **合并总是按顺序调用的函数。** 例如，如果你总是在 `query_location()` 之后调用 `mark_location()`，只需将标记逻辑移到查询函数调用中。
4.  **保持初始可用函数数量少以获得更高准确性。**
    
    *   **评估不同函数数量下的性能**。
    *   **目标是在一个回合开始时可用的函数少于 20 个**，尽管这只是一个软性建议。
    *   **使用工具搜索**来延迟加载大型或不常用的工具表面部分，而不是一开始就暴露所有内容。
5.  **利用 OpenAI 资源。**
    
    *   **在 [Playground](https://platform.openai.com/playground) 中生成和迭代函数 schema**。
    *   **考虑[微调](/guides/fine-tuning)以提高大量函数或困难任务的函数调用准确性**。（[cookbook]( https://cdn.openai.com/API/docs/cookbook/examples/fine_tuning_for_function_calling)）

### Token 使用

在底层，函数以模型训练过的语法注入到系统消息中。这意味着可调用的函数定义会计入模型的上下文限制，并作为输入 token 计费。如果你遇到 token 限制，我们建议限制预先加载的函数数量，尽可能缩短描述，或使用 [tool search](/guides/tools-tool-search) 以便延迟工具仅在需要时加载。

也可以使用[微调](/guides/fine-tuning#fine-tuning-examples)来减少工具规范中定义了许多函数时使用的 token 数量。

## 处理函数调用

当模型调用函数时，你必须执行它并返回结果。由于模型响应可以包含零个、一个或多个调用，最佳实践是假设有多个调用。

响应有一个 `tool_calls` 数组，每个元素都有一个 `id`（稍后用于提交函数结果）和一个包含 `name` 和 JSON 编码的 `arguments` 的 `function`。

包含多个函数调用的示例响应

```
[
    {
        "id": "call_12345xyz",
        "type": "function",
        "function": {
            "name": "get_weather",
            "arguments": "{\"location\":\"Paris, France\"}"
        }
    },
    {
        "id": "call_67890abc",
        "type": "function",
        "function": {
            "name": "get_weather",
            "arguments": "{\"location\":\"Bogotá, Colombia\"}"
        }
    },
    {
        "id": "call_99999def",
        "type": "function",
        "function": {
            "name": "send_email",
            "arguments": "{\"to\":\"bob@email.com\",\"body\":\"Hi bob\"}"
        }
    }
]
```

**执行函数调用并追加结果**

::: code-group
```python
for tool_call in completion.choices[0].message.tool_calls:
    name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)

    result = call_function(name, args)
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": str(result)
    })
```

```javascript
for (const toolCall of completion.choices[0].message.tool_calls) {
    const name = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    const result = callFunction(name, args);
    messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result.toString()
    });
}
```

:::


响应的 `output` 数组包含 `type` 值为 `function_call` 的条目。每个条目都有一个 `call_id`（稍后用于提交函数结果）、`name` 和 JSON 编码的 `arguments`。

包含多个函数调用的示例响应

```
[
    {
        "id": "fc_12345xyz",
        "call_id": "call_12345xyz",
        "type": "function_call",
        "name": "get_weather",
        "arguments": "{\"location\":\"Paris, France\"}"
    },
    {
        "id": "fc_67890abc",
        "call_id": "call_67890abc",
        "type": "function_call",
        "name": "get_weather",
        "arguments": "{\"location\":\"Bogotá, Colombia\"}"
    },
    {
        "id": "fc_99999def",
        "call_id": "call_99999def",
        "type": "function_call",
        "name": "send_email",
        "arguments": "{\"to\":\"bob@email.com\",\"body\":\"Hi bob\"}"
    }
]
```

如果你使用 [tool search](/guides/tools-tool-search)，你可能还会在 `function_call` 之前看到 `tool_search_call` 和 `tool_search_output` 项。一旦函数被加载，按照此处所示的相同方式处理函数调用。

**执行函数调用并追加结果**

::: code-group
```python
for tool_call in response.output:
    if tool_call.type != "function_call":
        continue

    name = tool_call.name
    args = json.loads(tool_call.arguments)

    result = call_function(name, args)
    input_messages.append({
        "type": "function_call_output",
        "call_id": tool_call.call_id,
        "output": str(result)
    })
```

```javascript
for (const toolCall of response.output) {
    if (toolCall.type !== "function_call") {
        continue;
    }

    const name = toolCall.name;
    const args = JSON.parse(toolCall.arguments);

    const result = callFunction(name, args);
    input.push({
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: result.toString()
    });
}
```

:::


在上面的示例中，我们有一个假设的 `call_function` 来路由每个调用。以下是一个可能的实现：

**执行函数调用并追加结果**

```python
def call_function(name, args):
    if name == "get_weather":
        return get_weather(**args)
    if name == "send_email":
        return send_email(**args)
```

```javascript
const callFunction = async (name, args) => {
    if (name === "get_weather") {
        return getWeather(args.latitude, args.longitude);
    }
    if (name === "send_email") {
        return sendEmail(args.to, args.body);
    }
};
```


### 格式化结果

你在 `function_call_output` 消息中传递的结果通常应该是字符串，格式由你决定（JSON、错误代码、纯文本等）。模型将根据需要解释该字符串。

对于返回图像或文件的函数，你可以传递[图像或文件对象数组]( https://developers.openai.com/api/reference/responses/create#responses_create-input-input_item_list-item-function_tool_call_output-output)而不是字符串。

如果你的函数没有返回值（例如 `send_email`），只需返回一个表示成功或失败的字符串。（例如 `"success"`）

### 将结果纳入响应

将结果追加到 `messages` 后，你可以将它们发送回模型以获取最终响应。

**将结果发送回模型**

```python
completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=messages,
    tools=tools,
)
```

```javascript
const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages,
    tools,
    store: true,
});
```


将结果追加到 `input` 后，你可以将它们发送回模型以获取最终响应。

**将结果发送回模型**

```python
response = client.responses.create(
    model="gpt-4.1",
    input=input_messages,
    tools=tools,
)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
});
```


最终响应

```
"It's about 15°C in Paris, 18°C in Bogotá, and I've sent that email to Bob."
```

## 附加配置

### 工具选择

默认情况下，模型将决定何时以及使用多少工具。你可以使用 `tool_choice` 参数强制特定行为。

1.  **Auto：**（_默认_）调用零个、一个或多个函数。`tool_choice: "auto"`
2.  **Required：** 调用一个或多个函数。`tool_choice: "required"`
3.  **Forced Function：** 精确调用一个特定函数。`tool_choice: {"type": "function", "name": "get_weather"}`
4.  **Allowed tools：** 将模型可以进行的工具调用限制为可用工具的子集。

**何时使用 allowed\_tools**

如果你想仅使工具的子集在模型请求中可用，但不修改传入的工具列表，以便最大化 [prompt caching](/guides/prompt-caching) 的节省，你可能需要配置 `allowed_tools` 列表。

```
"tool_choice": {
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [
        { "type": "function", "name": "get_weather" },
        { "type": "function", "name": "search_docs" }
    ]
  }
}
```

你也可以将 `tool_choice` 设置为 `"none"` 来模拟不传递函数的行为。

当你使用工具搜索时，`tool_choice` 仍然适用于当前回合中可调用的工具。这在你加载了工具子集并希望将模型限制在该子集时最有用。

### 并行函数调用

使用[内置工具](/guides/tools)时无法进行并行函数调用。

模型可能选择在单个回合中调用多个函数。你可以通过将 `parallel_tool_calls` 设置为 `false` 来防止这种情况，这确保恰好调用零个或一个工具。

**注意：** 目前，如果你使用微调模型并且模型在一个回合中调用多个函数，那么这些调用将禁用[严格模式](#strict-mode)。

**关于 `gpt-4.1-nano-2025-04-14` 的注意事项：** 此 `gpt-4.1-nano` 快照在启用并行工具调用时有时会对同一工具包含多个工具调用。建议在使用此 nano 快照时禁用此功能。

### 严格模式

将 `strict` 设置为 `true` 将确保函数调用可靠地遵循函数 schema，而不是尽力而为。我们建议始终启用严格模式。

在底层，严格模式通过利用我们的[结构化输出](/guides/structured-outputs)功能来工作，因此引入了一些要求：

1.  `parameters` 中的每个对象必须将 `additionalProperties` 设置为 `false`。
2.  `properties` 中的所有字段必须标记为 `required`。

你可以通过添加 `null` 作为 `type` 选项来表示可选字段（参见下面的示例）。

如果你发送 `strict: true` 且你的 schema 不满足上述要求，请求将被拒绝并提供有关缺失约束的详细信息。如果你省略 `strict`，默认值取决于 API：Responses 请求将把你的 schema 规范化为严格模式（例如，设置 `additionalProperties: false` 并将所有字段标记为必需），这可能使之前的可选字段变为必需，而 Chat Completions 请求默认保持非严格模式。要在 Responses 中退出严格模式并保持非严格的尽力而为函数调用，请显式设置 `strict: false`。

启用严格模式禁用严格模式

启用严格模式

```
{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Retrieves current weather for the given location.",
        "strict": true,
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Bogotá, Colombia"
                },
                "units": {
                    "type": ["string", "null"],
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Units the temperature will be returned in."
                }
            },
            "required": ["location", "units"],
            "additionalProperties": false
        }
    }
}
```

禁用严格模式

```
{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Retrieves current weather for the given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Bogotá, Colombia"
                },
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Units the temperature will be returned in."
                }
            },
            "required": ["location"],
        }
    }
}
```

启用严格模式禁用严格模式

启用严格模式

```
{
    "type": "function",
    "name": "get_weather",
    "description": "Retrieves current weather for the given location.",
    "strict": true,
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City and country e.g. Bogotá, Colombia"
            },
            "units": {
                "type": ["string", "null"],
                "enum": ["celsius", "fahrenheit"],
                "description": "Units the temperature will be returned in."
            }
        },
        "required": ["location", "units"],
        "additionalProperties": false
    }
}
```

禁用严格模式

```
{
    "type": "function",
    "name": "get_weather",
    "description": "Retrieves current weather for the given location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City and country e.g. Bogotá, Colombia"
            },
            "units": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "Units the temperature will be returned in."
            }
        },
        "required": ["location"],
    }
}
```python

在 [playground](https://platform.openai.com/playground) 中生成的所有 schema 都启用了严格模式。

虽然我们建议你启用严格模式，但它有一些限制：

1.  JSON schema 的某些功能不受支持。（参见[支持的 schema](/guides/structured-outputs?context=with_parse#supported-schemas)。）

特别是对于微调模型：

1.  Schema 在第一次请求时会进行额外处理（然后被缓存）。如果你的 schema 在请求之间变化，这可能导致更高的延迟。
2.  Schema 被缓存以提高性能，不符合[零数据保留](/models#how-we-use-your-data)条件。

## 流式传输

流式传输可用于展示进度，显示正在调用哪个函数以及模型填充参数的过程，甚至实时显示参数。

流式传输函数调用与流式传输常规响应非常相似：你将 `stream` 设置为 `true` 并获取带有 `delta` 对象的块。

**流式函数调用**

```
from openai import OpenAI

client = OpenAI()

tools = [{
    "type": "function",
    "function": {
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
            "additionalProperties": False
        },
        "strict": True
    }
}]

stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "What's the weather like in Paris today?"}],
    tools=tools,
    stream=True
)

for chunk in stream:
    delta = chunk.choices[0].delta
    print(delta.tool_calls)
```javascript

```
import { OpenAI } from "openai";

const openai = new OpenAI();

const tools = [{
    "type": "function",
    "function": {
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
}];

const stream = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: "What's the weather like in Paris today?" }],
    tools,
    stream: true,
    store: true,
});

for await (const chunk of stream) {
    const delta = chunk.choices[0].delta;
    console.log(delta.tool_calls);
}
```


输出 delta.tool\_calls

```
[{"index": 0, "id": "call_DdmO9pD3xa9XTPNJ32zg2hcA", "function": {"arguments": "", "name": "get_weather"}, "type": "function"}]
[{"index": 0, "id": null, "function": {"arguments": "{\"", "name": null}, "type": null}]
[{"index": 0, "id": null, "function": {"arguments": "location", "name": null}, "type": null}]
[{"index": 0, "id": null, "function": {"arguments": "\":\"", "name": null}, "type": null}]
[{"index": 0, "id": null, "function": {"arguments": "Paris", "name": null}, "type": null}]
[{"index": 0, "id": null, "function": {"arguments": ",", "name": null}, "type": null}]
[{"index": 0, "id": null, "function": {"arguments": " France", "name": null}, "type": null}]
[{"index": 0, "id": null, "function": {"arguments": "\"}", "name": null}, "type": null}]
null
```

然而，你不是将块聚合为单个 `content` 字符串，而是将块聚合为编码的 `arguments` JSON 对象。

当模型调用一个或多个函数时，每个 `delta` 的 `tool_calls` 字段将被填充。每个 `tool_call` 包含以下字段：

| 字段 | 描述 |
| --- | --- |
| `index` | 标识 `delta` 对应的函数调用 |
| `id` | 工具调用 id。 |
| `function` | 函数调用 delta（`name` 和 `arguments`） |
| `type` | `tool_call` 的类型（对于函数调用始终为 `function`） |

其中许多字段仅在每个工具调用的第一个 `delta` 中设置，如 `id`、`function.name` 和 `type`。

以下是演示如何将 `delta` 聚合为最终 `tool_calls` 对象的代码片段。

**累积 tool\_call delta**

```python
final_tool_calls = {}

for chunk in stream:
    for tool_call in chunk.choices[0].delta.tool_calls or []:
        index = tool_call.index

        if index not in final_tool_calls:
            final_tool_calls[index] = tool_call

        final_tool_calls[index].function.arguments += tool_call.function.arguments
```

```javascript
const finalToolCalls = {};

for await (const chunk of stream) {
    const toolCalls = chunk.choices[0].delta.tool_calls || [];
    for (const toolCall of toolCalls) {
        const { index } = toolCall;

        if (!finalToolCalls[index]) {
            finalToolCalls[index] = toolCall;
        }

        finalToolCalls[index].function.arguments += toolCall.function.arguments;
    }
}
```


累积的 final\_tool\_calls\[0\]

```
{
    "index": 0,
    "id": "call_RzfkBpJgzeR0S242qfvjadNe",
    "function": {
        "name": "get_weather",
        "arguments": "{\"location\":\"Paris, France\"}"
    }
}
```python

流式传输可用于展示进度，显示正在调用哪个函数以及模型填充参数的过程，甚至实时显示参数。

流式传输函数调用与流式传输常规响应非常相似：你将 `stream` 设置为 `true` 并获取不同的 `event` 对象。

**流式函数调用**

```
from openai import OpenAI

client = OpenAI()

tools = [{
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
        "required": [
            "location"
        ],
        "additionalProperties": False
    }
}]

stream = client.responses.create(
    model="gpt-4.1",
    input=[{"role": "user", "content": "What's the weather like in Paris today?"}],
    tools=tools,
    stream=True
)

for event in stream:
    print(event)
```javascript

```
import { OpenAI } from "openai";

const openai = new OpenAI();

const tools = [{
    type: "function",
    name: "get_weather",
    description: "Get current temperature for provided coordinates in celsius.",
    parameters: {
        type: "object",
        properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
        },
        required: ["latitude", "longitude"],
        additionalProperties: false
    },
    strict: true
}];

const stream = await openai.responses.create({
    model: "gpt-4.1",
    input: [{ role: "user", content: "What's the weather like in Paris today?" }],
    tools,
    stream: true,
    store: true,
});

for await (const event of stream) {
    console.log(event)
}
```


输出事件

```
{"type":"response.output_item.added","response_id":"resp_1234xyz","output_index":0,"item":{"type":"function_call","id":"fc_1234xyz","call_id":"call_1234xyz","name":"get_weather","arguments":""}}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":"{\""}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":"location"}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":"\":\""}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":"Paris"}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":","}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":" France"}
{"type":"response.function_call_arguments.delta","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"delta":"\"}"}
{"type":"response.function_call_arguments.done","response_id":"resp_1234xyz","item_id":"fc_1234xyz","output_index":0,"arguments":"{\"location\":\"Paris, France\"}"}
{"type":"response.output_item.done","response_id":"resp_1234xyz","output_index":0,"item":{"type":"function_call","id":"fc_1234xyz","call_id":"call_1234xyz","name":"get_weather","arguments":"{\"location\":\"Paris, France\"}"}}
```

然而，你不是将块聚合为单个 `content` 字符串，而是将块聚合为编码的 `arguments` JSON 对象。

当模型调用一个或多个函数时，将为每个函数调用发出类型为 `response.output_item.added` 的事件，包含以下字段：

| 字段 | 描述 |
| --- | --- |
| `response_id` | 函数调用所属的响应 id |
| `output_index` | 响应中输出项的索引。这代表响应中的各个函数调用。 |
| `item` | 正在进行的函数调用项，包含 `name`、`arguments` 和 `id` 字段 |

之后你将收到一系列类型为 `response.function_call_arguments.delta` 的事件，其中包含 `arguments` 字段的 `delta`。这些事件包含以下字段：

| 字段 | 描述 |
| --- | --- |
| `response_id` | 函数调用所属的响应 id |
| `item_id` | delta 所属的函数调用项的 id |
| `output_index` | 响应中输出项的索引。这代表响应中的各个函数调用。 |
| `delta` | `arguments` 字段的 delta。 |

以下是演示如何将 `delta` 聚合为最终 `tool_call` 对象的代码片段。

**累积 tool\_call delta**

```python
final_tool_calls = {}

for event in stream:
    if event.type === 'response.output_item.added':
        final_tool_calls[event.output_index] = event.item;
    elif event.type === 'response.function_call_arguments.delta':
        index = event.output_index

        if final_tool_calls[index]:
            final_tool_calls[index].arguments += event.delta
```

```javascript
const finalToolCalls = {};

for await (const event of stream) {
    if (event.type === 'response.output_item.added') {
        finalToolCalls[event.output_index] = event.item;
    } else if (event.type === 'response.function_call_arguments.delta') {
        const index = event.output_index;

        if (finalToolCalls[index]) {
            finalToolCalls[index].arguments += event.delta;
        }
    }
}
```


累积的 final\_tool\_calls\[0\]

```
{
    "type": "function_call",
    "id": "fc_1234xyz",
    "call_id": "call_2345abc",
    "name": "get_weather",
    "arguments": "{\"location\":\"Paris, France\"}"
}
```python

当模型完成函数调用时，将发出类型为 `response.function_call_arguments.done` 的事件。此事件包含完整的函数调用，包括以下字段：

| 字段 | 描述 |
| --- | --- |
| `response_id` | 函数调用所属的响应 id |
| `output_index` | 响应中输出项的索引。这代表响应中的各个函数调用。 |
| `item` | 函数调用项，包含 `name`、`arguments` 和 `id` 字段。 |

## 自定义工具

自定义工具的工作方式与 JSON schema 驱动的函数工具大致相同。但模型不是向你的工具提供关于所需输入的明确指令，而是可以将任意字符串作为输入传回你的工具。这对于避免不必要地将响应包装在 JSON 中，或对响应应用自定义语法（下面将详细介绍）非常有用。

以下代码示例展示了创建一个期望接收包含 Python 代码的文本字符串作为响应的自定义工具。

**自定义工具调用示例**

```
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="Use the code_exec tool to print hello world to the console.",
    tools=[
        {
            "type": "custom",
            "name": "code_exec",
            "description": "Executes arbitrary Python code.",
        }
    ]
)
print(response.output)
```javascript

```
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5",
  input: "Use the code_exec tool to print hello world to the console.",
  tools: [
    {
      type: "custom",
      name: "code_exec",
      description: "Executes arbitrary Python code.",
    },
  ],
});

console.log(response.output);
```


与之前一样，`output` 数组将包含模型生成的工具调用。不同的是，这次工具调用输入以纯文本形式给出。

```
[
  {
    "id": "rs_6890e972fa7c819ca8bc561526b989170694874912ae0ea6",
    "type": "reasoning",
    "content": [],
    "summary": []
  },
  {
    "id": "ctc_6890e975e86c819c9338825b3e1994810694874912ae0ea6",
    "type": "custom_tool_call",
    "status": "completed",
    "call_id": "call_aGiFQkRWSWAIsMQ19fKqxUgb",
    "input": "print(\"hello world\")",
    "name": "code_exec"
  }
]
```python

### 上下文无关文法

[上下文无关文法](https://en.wikipedia.org/wiki/Context-free_grammar)（CFG）是一组规则，定义如何在给定格式中生成有效文本。对于自定义工具，你可以提供一个 CFG 来约束模型对自定义工具的文本输入。

你可以在配置自定义工具时使用 `grammar` 参数提供自定义 CFG。目前，我们在定义文法时支持两种 CFG 语法：`lark` 和 `regex`。

#### Lark CFG

**Lark 上下文无关文法示例**

```
from openai import OpenAI

client = OpenAI()

grammar = """
start: expr
expr: term (SP ADD SP term)* -> add
| term
term: factor (SP MUL SP factor)* -> mul
| factor
factor: INT
SP: " "
ADD: "+"
MUL: "*"
%import common.INT
"""

response = client.responses.create(
    model="gpt-5",
    input="Use the math_exp tool to add four plus four.",
    tools=[
        {
            "type": "custom",
            "name": "math_exp",
            "description": "Creates valid mathematical expressions",
            "format": {
                "type": "grammar",
                "syntax": "lark",
                "definition": grammar,
            },
        }
    ]
)
print(response.output)
```javascript

```
import OpenAI from "openai";
const client = new OpenAI();

const grammar = `
start: expr
expr: term (SP ADD SP term)* -> add
| term
term: factor (SP MUL SP factor)* -> mul
| factor
factor: INT
SP: " "
ADD: "+"
MUL: "*"
%import common.INT
`;

const response = await client.responses.create({
  model: "gpt-5",
  input: "Use the math_exp tool to add four plus four.",
  tools: [
    {
      type: "custom",
      name: "math_exp",
      description: "Creates valid mathematical expressions",
      format: {
        type: "grammar",
        syntax: "lark",
        definition: grammar,
      },
    },
  ],
});

console.log(response.output);
```


工具的输出应符合你定义的 Lark CFG：

```
[
  {
    "id": "rs_6890ed2b6374819dbbff5353e6664ef103f4db9848be4829",
    "type": "reasoning",
    "content": [],
    "summary": []
  },
  {
    "id": "ctc_6890ed2f32e8819daa62bef772b8c15503f4db9848be4829",
    "type": "custom_tool_call",
    "status": "completed",
    "call_id": "call_pmlLjmvG33KJdyVdC4MVdk5N",
    "input": "4 + 4",
    "name": "math_exp"
  }
]
```

文法使用 [Lark](https://lark-parser.readthedocs.io/en/stable/index.html) 的变体来指定。模型采样使用 [LLGuidance](https://github.com/guidance-ai/llguidance/blob/main/docs/syntax.md) 进行约束。Lark 的某些功能不受支持：

*   词法分析器正则表达式中的环视断言
*   词法分析器正则表达式中的惰性修饰符（`*?`、`+?`、`??`）
*   终端符号的优先级
*   模板
*   导入（除了内置的 `%import` common）
*   `%declare`

我们建议使用 [Lark IDE](https://www.lark-parser.org/ide/) 来实验自定义文法。

### 保持文法简单

尽量使你的文法尽可能简单。如果文法太复杂，OpenAI API 可能会返回错误，因此你应该在 API 中使用之前确保你期望的文法是兼容的。

Lark 文法可能很难完善。虽然简单的文法表现最可靠，但复杂的文法通常需要对文法定义本身、提示和工具描述进行迭代，以确保模型不会偏离分布。

### 正确与错误的模式

正确（单个、有界的终端符号）：

```
start: SENTENCE
SENTENCE: /[A-Za-z, ]*(the hero|a dragon|an old man|the princess)[A-Za-z, ]*(fought|saved|found|lost)[A-Za-z, ]*(a treasure|the kingdom|a secret|his way)[A-Za-z, ]*\./
```

不要这样做（跨规则/终端符号拆分）。这试图让规则在终端符号之间划分自由文本。词法分析器会贪婪地匹配自由文本部分，你将失去控制：

```
start: sentence
sentence: /[A-Za-z, ]+/ subject /[A-Za-z, ]+/ verb /[A-Za-z, ]+/ object /[A-Za-z, ]+/
```

小写规则不会影响终端符号如何从输入中切割——只有终端符号定义才会。当你需要"锚点之间的自由文本"时，将其制作为一个巨大的正则表达式终端符号，这样词法分析器就会以你期望的结构精确匹配一次。

### 终端符号与规则

Lark 使用终端符号作为词法分析器标记（按惯例为 `UPPERCASE`），使用规则作为解析器产生式（按惯例为 `lowercase`）。保持在支持的子集内并避免意外的最实用方法是保持文法简单明确，并以清晰的关注点分离使用终端符号和规则。

终端符号使用的正则表达式语法是 [Rust regex crate 语法](https://docs.rs/regex/latest/regex/#syntax)，而不是 Python 的 `re` [模块](https://docs.python.org/3/library/re.html)。

### 关键思想和最佳实践

**词法分析器在解析器之前运行**

终端符号由词法分析器匹配（贪婪/最长匹配优先），在任何 CFG 规则逻辑应用之前。如果你试图通过将终端符号拆分到多个规则中来"塑造"它，词法分析器无法被这些规则引导——只能被终端符号正则表达式引导。

**当你从自由格式文本中提取内容时，优先使用单个终端符号**

如果你需要识别嵌入在任意文本中的模式（例如，锚点之间有"任何内容"的自然语言），将其表达为单个终端符号。不要尝试将自由文本终端符号与解析器规则交错；贪婪的词法分析器不会尊重你预期的边界，模型很可能会偏离分布。

**使用规则组合离散标记**

规则在你将明确分隔的终端符号（数字、关键字、标点符号）组合成更大结构时是理想的。它们不是约束两个终端符号之间"中间内容"的正确工具。

**保持终端符号简单、有界且自包含**

优先使用显式字符类和有界量词（`{0,10}`，而不是到处使用无界的 `*`）。如果你需要"到句号为止的任何文本"，优先使用类似 `/[^.\n]{0,10}*\./` 而不是 `/.+\./` 以避免失控增长。

**使用规则组合标记，而不是操控正则表达式内部**

良好的规则使用示例：

```
start: expr
NUMBER: /[0-9]+/
PLUS: "+"
MINUS: "-"
expr: term (("+"|"-") term)*
term: NUMBER
```python

**显式处理空白**

不要依赖开放式的 `%ignore` 指令。使用无界的忽略指令可能导致文法过于复杂和/或可能导致模型偏离分布。优先在允许空白的地方使用显式终端符号。

### 故障排除

*   如果 API 因文法太复杂而拒绝，简化规则和终端符号并移除无界的 `%ignore`。
*   如果自定义工具被调用时带有意外的标记，确认终端符号没有重叠；检查贪婪词法分析器。
*   当模型偏离"分布外"（表现为模型产生过长或重复的输出，语法上有效但语义上错误）：
    *   收紧文法。
    *   迭代提示（添加少样本示例）和工具描述（解释文法并指示模型推理并遵循它）。
    *   尝试更高的推理努力（例如，从 medium 提升到 high）。

#### Regex CFG

**Regex 上下文无关文法示例**

```
from openai import OpenAI

client = OpenAI()

grammar = r"^(?P&lt;month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?P&lt;day>\d{1,2})(?:st|nd|rd|th)?\s+(?P&lt;year>\d{4})\s+at\s+(?P&lt;hour>0?[1-9]|1[0-2])(?P&lt;ampm>AM|PM)$"

response = client.responses.create(
    model="gpt-5",
    input="Use the timestamp tool to save a timestamp for August 7th 2025 at 10AM.",
    tools=[
        {
            "type": "custom",
            "name": "timestamp",
            "description": "Saves a timestamp in date + time in 24-hr format.",
            "format": {
                "type": "grammar",
                "syntax": "regex",
                "definition": grammar,
            },
        }
    ]
)
print(response.output)
```javascript

```
import OpenAI from "openai";
const client = new OpenAI();

const grammar = "^(?P&lt;month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?P&lt;day>\d{1,2})(?:st|nd|rd|th)?\s+(?P&lt;year>\d{4})\s+at\s+(?P&lt;hour>0?[1-9]|1[0-2])(?P&lt;ampm>AM|PM)$";

const response = await client.responses.create({
  model: "gpt-5",
  input: "Use the timestamp tool to save a timestamp for August 7th 2025 at 10AM.",
  tools: [
    {
      type: "custom",
      name: "timestamp",
      description: "Saves a timestamp in date + time in 24-hr format.",
      format: {
        type: "grammar",
        syntax: "regex",
        definition: grammar,
      },
    },
  ],
});

console.log(response.output);
```


工具的输出应符合你定义的 Regex CFG：

```
[
  {
    "id": "rs_6894f7a3dd4c81a1823a723a00bfa8710d7962f622d1c260",
    "type": "reasoning",
    "content": [],
    "summary": []
  },
  {
    "id": "ctc_6894f7ad7fb881a1bffa1f377393b1a40d7962f622d1c260",
    "type": "custom_tool_call",
    "status": "completed",
    "call_id": "call_8m4XCnYvEmFlzHgDHbaOCFlK",
    "input": "August 7th 2025 at 10AM",
    "name": "timestamp"
  }
]
```

与 Lark 语法一样，正则表达式使用 [Rust regex crate 语法](https://docs.rs/regex/latest/regex/#syntax)，而不是 Python 的 `re` [模块](https://docs.python.org/3/library/re.html)。

Regex 的某些功能不受支持：

*   环视断言
*   惰性修饰符（`*?`、`+?`、`??`）

### 关键思想和最佳实践

**模式必须在一行上**

如果你需要匹配输入中的换行符，使用转义序列 `\n`。不要使用允许模式跨多行的详细/扩展模式。

**将正则表达式作为纯模式字符串提供**

不要将模式包含在 `//` 中。
