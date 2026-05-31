# Structured Outputs

> Ensure model responses adhere to a JSON Schema.

JSON 是世界上应用程序之间交换数据最广泛使用的格式之一。

Structured Outputs 是一项功能，确保模型始终生成符合您提供的 [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) 的响应，因此您无需担心模型遗漏必需的键，或产生无效的枚举值。

Structured Outputs 的一些优势包括：

1.  **可靠的类型安全：** 无需验证或重试格式不正确的响应
2.  **明确的拒绝：** 基于安全的模型拒绝现在可以通过编程方式检测
3.  **更简单的提示：** 无需使用强措辞的提示来实现一致的格式化

除了在 REST API 中支持 JSON Schema 外，OpenAI 的 [Python](https://github.com/openai/openai-python/blob/main/helpers.md#structured-outputs-parsing-helpers) 和 [JavaScript](https://github.com/openai/openai-node/blob/master/helpers.md#structured-outputs-parsing-helpers) SDK 还可以轻松地使用 [Pydantic](https://docs.pydantic.dev/latest/) 和 [Zod](https://zod.dev/) 分别定义对象模式。下面，您可以看到如何从非结构化文本中提取符合代码中定义的模式的信息。

**获取结构化响应**

::: code-group
```javascript
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const CalendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const completion = await openai.chat.completions.parse({
  model: "gpt-4o-2024-08-06",
  messages: [
    { role: "system", content: "Extract the event information." },
    { role: "user", content: "Alice and Bob are going to a science fair on Friday." },
  ],
  response_format: zodResponseFormat(CalendarEvent, "event"),
});

const event = completion.choices[0].message.parsed;
```

```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ],
    response_format=CalendarEvent,
)

event = completion.choices[0].message.parsed
```

:::




**获取结构化响应 (Responses API)**

::: code-group
```javascript
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const CalendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const response = await openai.responses.parse({
  model: "gpt-4o-2024-08-06",
  input: [
    { role: "system", content: "Extract the event information." },
    {
      role: "user",
      content: "Alice and Bob are going to a science fair on Friday.",
    },
  ],
  text: {
    format: zodTextFormat(CalendarEvent, "event"),
  },
});

const event = response.output_parsed;
```

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {"role": "system", "content": "Extract the event information."},
        {
            "role": "user",
            "content": "Alice and Bob are going to a science fair on Friday.",
        },
    ],
    text_format=CalendarEvent,
)

event = response.output_parsed
```

:::




### 支持的模型

Structured Outputs 在我们[最新的大语言模型](/models)中可用，从 GPT-4o 开始。较旧的模型如 `gpt-4-turbo` 及更早版本可以使用 [JSON mode](#json-mode) 代替。

## 何时通过函数调用使用 Structured Outputs vs 通过 response\_format 使用

## 何时通过函数调用使用 Structured Outputs vs 通过 text.format 使用

Structured Outputs 在 OpenAI API 中有两种形式：

1.  使用[函数调用](/guides/function-calling)时
2.  使用 `json_schema` 响应格式时

函数调用在您构建连接模型和应用程序功能的应用时非常有用。

例如，您可以让模型访问查询数据库的函数，以构建一个可以帮助用户处理订单的 AI 助手，或者可以与 UI 交互的函数。

相反，通过 `response_format` 使用 Structured Outputs 更适合当您想要指定一个结构化模式，用于模型响应用户时，而不是模型调用工具时。

例如，如果您正在构建一个数学辅导应用程序，您可能希望助手使用特定的 JSON Schema 响应用户，以便您可以生成一个 UI，以不同的方式显示模型输出的不同部分。

简而言之：

*   如果您要将模型连接到系统中的工具、函数、数据等，那么您应该使用函数调用 - 如果您想在模型响应用户时构建模型的输出结构，那么您应该使用结构化的 `response_format`

*   如果您要将模型连接到系统中的工具、函数、数据等，那么您应该使用函数调用 - 如果您想在模型响应用户时构建模型的输出结构，那么您应该使用结构化的 `text.format`

本指南的其余部分将重点介绍 Chat Completions API 中的非函数调用用例。要了解更多关于如何将 Structured Outputs 与函数调用一起使用的信息，请查看

[

Function Calling

](/guides/function-calling#function-calling-with-structured-outputs)

指南。

本指南的其余部分将重点介绍 Responses API 中的非函数调用用例。要了解更多关于如何将 Structured Outputs 与函数调用一起使用的信息，请查看

[

Function Calling

](/guides/function-calling#function-calling-with-structured-outputs)

指南。

### Structured Outputs vs JSON mode

Structured Outputs 是 [JSON mode](#json-mode) 的演进。虽然两者都确保生成有效的 JSON，但只有 Structured Outputs 确保符合模式。Structured Outputs 和 JSON mode 都在 Responses API、Chat Completions API、Assistants API、Fine-tuning API 和 Batch API 中受支持。

我们建议在可能的情况下始终使用 Structured Outputs 而不是 JSON mode。

但是，使用 `response_format: {type: "json_schema", ...}` 的 Structured Outputs 仅支持 `gpt-4o-mini`、`gpt-4o-mini-2024-07-18` 和 `gpt-4o-2024-08-06` 模型快照及更高版本。

|  | Structured Outputs | JSON Mode |
| --- | --- | --- |
| **输出有效 JSON** | 是 | 是 |
| **符合模式** | 是（参见[支持的模式](#supported-schemas)） | 否 |
| **兼容模型** | `gpt-4o-mini`、`gpt-4o-2024-08-06` 及更高版本 | `gpt-3.5-turbo`、`gpt-4-*` 和 `gpt-4o-*` 模型 |
| **启用方式** | `response_format: { type: "json_schema", json_schema: {"strict": true, "schema": ...} }` | `response_format: { type: "json_object" }` |

|  | Structured Outputs | JSON Mode |
| --- | --- | --- |
| **输出有效 JSON** | 是 | 是 |
| **符合模式** | 是（参见[支持的模式](#supported-schemas)） | 否 |
| **兼容模型** | `gpt-4o-mini`、`gpt-4o-2024-08-06` 及更高版本 | `gpt-3.5-turbo`、`gpt-4-*` 和 `gpt-4o-*` 模型 |
| **启用方式** | `text: { format: { type: "json_schema", "strict": true, "schema": ... } }` | `text: { format: { type: "json_object" } }` |

## 示例

思维链结构化数据提取UI 生成内容审核

思维链

### 思维链

您可以要求模型以结构化、逐步的方式输出答案，以引导用户完成解决方案。

**用于思维链数学辅导的 Structured Outputs**

::: code-group
```javascript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const Step = z.object({
  explanation: z.string(),
  output: z.string(),
});

const MathReasoning = z.object({
  steps: z.array(Step),
  final_answer: z.string(),
});

const completion = await openai.chat.completions.parse({
  model: "gpt-4o-2024-08-06",
  messages: [
    { role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
    { role: "user", content: "how can I solve 8x + 7 = -23" },
  ],
  response_format: zodResponseFormat(MathReasoning, "math_reasoning"),
});

const math_reasoning = completion.choices[0].message.parsed;
```

```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format=MathReasoning,
)

math_reasoning = completion.choices[0].message.parsed
```

```curl
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "math_reasoning",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "explanation": { "type": "string" },
                  "output": { "type": "string" }
                },
                "required": ["explanation", "output"],
                "additionalProperties": false
              }
            },
            "final_answer": { "type": "string" }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::





**用于思维链数学辅导的 Structured Outputs (Responses API)**

::: code-group
```javascript
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const Step = z.object({
  explanation: z.string(),
  output: z.string(),
});

const MathReasoning = z.object({
  steps: z.array(Step),
  final_answer: z.string(),
});

const response = await openai.responses.parse({
  model: "gpt-4o-2024-08-06",
  input: [
    {
      role: "system",
      content:
        "You are a helpful math tutor. Guide the user through the solution step by step.",
    },
    { role: "user", content: "how can I solve 8x + 7 = -23" },
  ],
  text: {
    format: zodTextFormat(MathReasoning, "math_reasoning"),
  },
});

const math_reasoning = response.output_parsed;
```

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {
            "role": "system",
            "content": "You are a helpful math tutor. Guide the user through the solution step by step.",
        },
        {"role": "user", "content": "how can I solve 8x + 7 = -23"},
    ],
    text_format=MathReasoning,
)

math_reasoning = response.output_parsed
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "input": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ],
    "text": {
      "format": {
        "type": "json_schema",
        "name": "math_reasoning",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "explanation": { "type": "string" },
                  "output": { "type": "string" }
                },
                "required": ["explanation", "output"],
                "additionalProperties": false
              }
            },
            "final_answer": { "type": "string" }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::






#### 示例响应

```
{
  "steps": [
    {
      "explanation": "Start with the equation 8x + 7 = -23.",
      "output": "8x + 7 = -23"
    },
    {
      "explanation": "Subtract 7 from both sides to isolate the term with the variable.",
      "output": "8x = -23 - 7"
    },
    {
      "explanation": "Simplify the right side of the equation.",
      "output": "8x = -30"
    },
    {
      "explanation": "Divide both sides by 8 to solve for x.",
      "output": "x = -30 / 8"
    },
    {
      "explanation": "Simplify the fraction.",
      "output": "x = -15 / 4"
    }
  ],
  "final_answer": "x = -15 / 4"
}
```

结构化数据提取

### 结构化数据提取

您可以定义结构化字段来从非结构化输入数据（如研究论文）中提取信息。

**使用 Structured Outputs 从研究论文中提取数据**

::: code-group
```javascript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const ResearchPaperExtraction = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string(),
  keywords: z.array(z.string()),
});

const completion = await openai.chat.completions.parse({
  model: "gpt-4o-2024-08-06",
  messages: [
    { role: "system", content: "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure." },
    { role: "user", content: "..." },
  ],
  response_format: zodResponseFormat(ResearchPaperExtraction, "research_paper_extraction"),
});

const research_paper = completion.choices[0].message.parsed;
```

```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class ResearchPaperExtraction(BaseModel):
    title: str
    authors: list[str]
    abstract: str
    keywords: list[str]

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure."},
        {"role": "user", "content": "..."}
    ],
    response_format=ResearchPaperExtraction,
)

research_paper = completion.choices[0].message.parsed
```

```curl
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure."
      },
      {
        "role": "user",
        "content": "..."
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "research_paper_extraction",
        "schema": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "authors": {
              "type": "array",
              "items": { "type": "string" }
            },
            "abstract": { "type": "string" },
            "keywords": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["title", "authors", "abstract", "keywords"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::



**使用 Structured Outputs 从研究论文中提取数据 (Responses API)**

::: code-group
```javascript
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const ResearchPaperExtraction = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string(),
  keywords: z.array(z.string()),
});

const response = await openai.responses.parse({
  model: "gpt-4o-2024-08-06",
  input: [
    {
      role: "system",
      content:
        "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure.",
    },
    { role: "user", content: "..." },
  ],
  text: {
    format: zodTextFormat(ResearchPaperExtraction, "research_paper_extraction"),
  },
});

const research_paper = response.output_parsed;
```

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class ResearchPaperExtraction(BaseModel):
    title: str
    authors: list[str]
    abstract: str
    keywords: list[str]

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {
            "role": "system",
            "content": "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure.",
        },
        {"role": "user", "content": "..."},
    ],
    text_format=ResearchPaperExtraction,
)

research_paper = response.output_parsed
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "input": [
      {
        "role": "system",
        "content": "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure."
      },
      {
        "role": "user",
        "content": "..."
      }
    ],
    "text": {
      "format": {
        "type": "json_schema",
        "name": "research_paper_extraction",
        "schema": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "authors": {
              "type": "array",
              "items": { "type": "string" }
            },
            "abstract": { "type": "string" },
            "keywords": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["title", "authors", "abstract", "keywords"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::






#### 示例响应

```
{
  "title": "Application of Quantum Algorithms in Interstellar Navigation: A New Frontier",
  "authors": ["Dr. Stella Voyager", "Dr. Nova Star", "Dr. Lyra Hunter"],
  "abstract": "This paper investigates the utilization of quantum algorithms to improve interstellar navigation systems. By leveraging quantum superposition and entanglement, our proposed navigation system can calculate optimal travel paths through space-time anomalies more efficiently than classical methods. Experimental simulations suggest a significant reduction in travel time and fuel consumption for interstellar missions.",
  "keywords": [
    "Quantum algorithms",
    "interstellar navigation",
    "space-time anomalies",
    "quantum superposition",
    "quantum entanglement",
    "space travel"
  ]
}
```

UI 生成

### UI 生成

您可以通过将 HTML 表示为带有约束（如枚举）的递归数据结构来生成有效的 HTML。

**使用 Structured Outputs 生成 HTML**

::: code-group
```javascript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const UI = z.lazy(() =>
  z.object({
    type: z.enum(["div", "button", "header", "section", "field", "form"]),
    label: z.string(),
    children: z.array(UI),
    attributes: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    ),
  })
);

const completion = await openai.chat.completions.parse({
  model: "gpt-4o-2024-08-06",
  messages: [
    {
      role: "system",
      content: "You are a UI generator AI. Convert the user input into a UI.",
    },
    { role: "user", content: "Make a User Profile Form" },
  ],
  response_format: zodResponseFormat(UI, "ui"),
});

const ui = completion.choices[0].message.parsed;
```

```python
from enum import Enum
from typing import List
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class UIType(str, Enum):
    div = "div"
    button = "button"
    header = "header"
    section = "section"
    field = "field"
    form = "form"

class Attribute(BaseModel):
    name: str
    value: str

class UI(BaseModel):
    type: UIType
    label: str
    children: List["UI"] 
    attributes: List[Attribute]

UI.model_rebuild() # This is required to enable recursive types

class Response(BaseModel):
    ui: UI

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a UI generator AI. Convert the user input into a UI."},
        {"role": "user", "content": "Make a User Profile Form"}
    ],
    response_format=Response,
)

ui = completion.choices[0].message.parsed
print(ui)
```

```curl
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "messages": [
      {
        "role": "system",
        "content": "You are a UI generator AI. Convert the user input into a UI."
      },
      {
        "role": "user",
        "content": "Make a User Profile Form"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "ui",
        "description": "Dynamically generated UI",
        "schema": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "description": "The type of the UI component",
              "enum": ["div", "button", "header", "section", "field", "form"]
            },
            "label": {
              "type": "string",
              "description": "The label of the UI component, used for buttons or form fields"
            },
            "children": {
              "type": "array",
              "description": "Nested UI components",
              "items": {"$ref": "#"}
            },
            "attributes": {
              "type": "array",
              "description": "Arbitrary attributes for the UI component, suitable for any element",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The name of the attribute, for example onClick or className"
                  },
                  "value": {
                    "type": "string",
                    "description": "The value of the attribute"
                  }
                },
                "required": ["name", "value"],
                "additionalProperties": false
              }
            }
          },
          "required": ["type", "label", "children", "attributes"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::



**使用 Structured Outputs 生成 HTML (Responses API)**

::: code-group
```javascript
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const UI = z.lazy(() =>
  z.object({
    type: z.enum(["div", "button", "header", "section", "field", "form"]),
    label: z.string(),
    children: z.array(UI),
    attributes: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    ),
  })
);

const response = await openai.responses.parse({
  model: "gpt-4o-2024-08-06",
  input: [
    {
      role: "system",
      content: "You are a UI generator AI. Convert the user input into a UI.",
    },
    {
      role: "user",
      content: "Make a User Profile Form",
    },
  ],
  text: {
    format: zodTextFormat(UI, "ui"),
  },
});

const ui = response.output_parsed;
```

```python
from enum import Enum
from typing import List

from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class UIType(str, Enum):
    div = "div"
    button = "button"
    header = "header"
    section = "section"
    field = "field"
    form = "form"

class Attribute(BaseModel):
    name: str
    value: str

class UI(BaseModel):
    type: UIType
    label: str
    children: List["UI"]
    attributes: List[Attribute]

UI.model_rebuild()  # This is required to enable recursive types

class Response(BaseModel):
    ui: UI

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {
            "role": "system",
            "content": "You are a UI generator AI. Convert the user input into a UI.",
        },
        {"role": "user", "content": "Make a User Profile Form"},
    ],
    text_format=Response,
)

ui = response.output_parsed
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "input": [
      {
        "role": "system",
        "content": "You are a UI generator AI. Convert the user input into a UI."
      },
      {
        "role": "user",
        "content": "Make a User Profile Form"
      }
    ],
    "text": {
      "format": {
        "type": "json_schema",
        "name": "ui",
        "description": "Dynamically generated UI",
        "schema": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "description": "The type of the UI component",
              "enum": ["div", "button", "header", "section", "field", "form"]
            },
            "label": {
              "type": "string",
              "description": "The label of the UI component, used for buttons or form fields"
            },
            "children": {
              "type": "array",
              "description": "Nested UI components",
              "items": {"$ref": "#"}
            },
            "attributes": {
              "type": "array",
              "description": "Arbitrary attributes for the UI component, suitable for any element",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The name of the attribute, for example onClick or className"
                  },
                  "value": {
                    "type": "string",
                    "description": "The value of the attribute"
                  }
                },
                "required": ["name", "value"],
                "additionalProperties": false
              }
            }
          },
          "required": ["type", "label", "children", "attributes"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::






#### 示例响应

```
{
  "type": "form",
  "label": "User Profile Form",
  "children": [
    {
      "type": "div",
      "label": "",
      "children": [
        {
          "type": "field",
          "label": "First Name",
          "children": [],
          "attributes": [
            {
              "name": "type",
              "value": "text"
            },
            {
              "name": "name",
              "value": "firstName"
            },
            {
              "name": "placeholder",
              "value": "Enter your first name"
            }
          ]
        },
        {
          "type": "field",
          "label": "Last Name",
          "children": [],
          "attributes": [
            {
              "name": "type",
              "value": "text"
            },
            {
              "name": "name",
              "value": "lastName"
            },
            {
              "name": "placeholder",
              "value": "Enter your last name"
            }
          ]
        }
      ],
      "attributes": []
    },
    {
      "type": "button",
      "label": "Submit",
      "children": [],
      "attributes": [
        {
          "name": "type",
          "value": "submit"
        }
      ]
    }
  ],
  "attributes": [
    {
      "name": "method",
      "value": "post"
    },
    {
      "name": "action",
      "value": "/submit-profile"
    }
  ]
}
```

内容审核

### 内容审核

您可以对输入进行多类别分类，这是进行内容审核的常见方式。

**使用 Structured Outputs 进行内容审核**

::: code-group
```javascript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const ContentCompliance = z.object({
  is_violating: z.boolean(),
  category: z.enum(["violence", "sexual", "self_harm"]).nullable(),
  explanation_if_violating: z.string().nullable(),
});

const completion = await openai.chat.completions.parse({
  model: "gpt-4o-2024-08-06",
  messages: [
    { role: "system", content: "Determine if the user input violates specific guidelines and explain if they do." },
    { role: "user", content: "How do I prepare for a job interview?" },
  ],
  response_format: zodResponseFormat(ContentCompliance, "content_compliance"),
});

const compliance = completion.choices[0].message.parsed;
```

```python
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class Category(str, Enum):
    violence = "violence"
    sexual = "sexual"
    self_harm = "self_harm"

class ContentCompliance(BaseModel):
    is_violating: bool
    category: Optional[Category]
    explanation_if_violating: Optional[str]

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Determine if the user input violates specific guidelines and explain if they do."},
        {"role": "user", "content": "How do I prepare for a job interview?"}
    ],
    response_format=ContentCompliance,
)

compliance = completion.choices[0].message.parsed
```

```curl
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "messages": [
      {
        "role": "system",
        "content": "Determine if the user input violates specific guidelines and explain if they do."
      },
      {
        "role": "user",
        "content": "How do I prepare for a job interview?"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "content_compliance",
        "description": "Determines if content is violating specific moderation rules",
        "schema": {
          "type": "object",
          "properties": {
            "is_violating": {
              "type": "boolean",
              "description": "Indicates if the content is violating guidelines"
            },
            "category": {
              "type": ["string", "null"],
              "description": "Type of violation, if the content is violating guidelines. Null otherwise.",
              "enum": ["violence", "sexual", "self_harm"]
            },
            "explanation_if_violating": {
              "type": ["string", "null"],
              "description": "Explanation of why the content is violating"
            }
          },
          "required": ["is_violating", "category", "explanation_if_violating"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::



**使用 Structured Outputs 进行内容审核 (Responses API)**

::: code-group
```javascript
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const ContentCompliance = z.object({
  is_violating: z.boolean(),
  category: z.enum(["violence", "sexual", "self_harm"]).nullable(),
  explanation_if_violating: z.string().nullable(),
});

const response = await openai.responses.parse({
    model: "gpt-4o-2024-08-06",
    input: [
      {
        "role": "system",
        "content": "Determine if the user input violates specific guidelines and explain if they do."
      },
      {
        "role": "user",
        "content": "How do I prepare for a job interview?"
      }
    ],
    text: {
        format: zodTextFormat(ContentCompliance, "content_compliance"),
    },
});

const compliance = response.output_parsed;
```

```python
from enum import Enum
from typing import Optional

from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class Category(str, Enum):
    violence = "violence"
    sexual = "sexual"
    self_harm = "self_harm"

class ContentCompliance(BaseModel):
    is_violating: bool
    category: Optional[Category]
    explanation_if_violating: Optional[str]

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {
            "role": "system",
            "content": "Determine if the user input violates specific guidelines and explain if they do.",
        },
        {"role": "user", "content": "How do I prepare for a job interview?"},
    ],
    text_format=ContentCompliance,
)

compliance = response.output_parsed
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "input": [
      {
        "role": "system",
        "content": "Determine if the user input violates specific guidelines and explain if they do."
      },
      {
        "role": "user",
        "content": "How do I prepare for a job interview?"
      }
    ],
    "text": {
      "format": {
        "type": "json_schema",
        "name": "content_compliance",
        "description": "Determines if content is violating specific moderation rules",
        "schema": {
          "type": "object",
          "properties": {
            "is_violating": {
              "type": "boolean",
              "description": "Indicates if the content is violating guidelines"
            },
            "category": {
              "type": ["string", "null"],
              "description": "Type of violation, if the content is violating guidelines. Null otherwise.",
              "enum": ["violence", "sexual", "self_harm"]
            },
            "explanation_if_violating": {
              "type": ["string", "null"],
              "description": "Explanation of why the content is violating"
            }
          },
          "required": ["is_violating", "category", "explanation_if_violating"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

:::






#### 示例响应

```
{
  "is_violating": false,
  "category": null,
  "explanation_if_violating": null
}
```

## 如何使用 response\_format 的 Structured Outputs

您可以使用新的 SDK 辅助工具将模型的输出解析为您所需的格式，或者您可以直接指定 JSON schema。

**注意：** 对于微调模型，您使用任何 schema 发出的第一个请求将有额外的延迟，因为我们的 API 会处理该 schema，但使用相同 schema 的后续请求不会有额外延迟。其他模型没有此限制。

SDK 对象手动 schema

SDK 对象

步骤 1：定义您的对象

首先，您必须定义一个对象或数据结构来表示模型应该遵循的 JSON Schema。请参阅本指南顶部的[示例](/guides/structured-outputs#examples)作为参考。

虽然 Structured Outputs 支持大部分 JSON Schema，但由于性能或技术原因，某些功能不可用。有关更多详细信息，请参阅[此处](/guides/structured-outputs#supported-schemas)。

例如，您可以这样定义一个对象：

::: code-group
```python
from pydantic import BaseModel

class Step(BaseModel):
explanation: str
output: str

class MathResponse(BaseModel):
steps: list[Step]
final_answer: str
```

```javascript
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const Step = z.object({
explanation: z.string(),
output: z.string(),
});

const MathResponse = z.object({
steps: z.array(Step),
final_answer: z.string(),
});
```

:::




#### 数据结构的建议

为了最大化模型生成的质量，我们建议以下做法：

*   清晰直观地命名键
*   为结构中的重要键创建清晰的标题和描述
*   创建和使用评估来确定最适合您用例的结构

步骤 2：在 API 调用中提供您的对象

您可以使用 `parse` 方法自动将 JSON 响应解析为您定义的对象。

在底层，SDK 负责提供与您的数据结构对应的 JSON schema，然后将响应解析为对象。

::: code-group
```python
completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format=MathResponse
  )
```

```javascript
const completion = await openai.chat.completions.parse({
model: "gpt-4o-2024-08-06",
messages: [
{ role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
{ role: "user", content: "how can I solve 8x + 7 = -23" },
],
response_format: zodResponseFormat(MathResponse, "math_response"),
});
```

:::




步骤 3：处理边缘情况

在某些情况下，模型可能不会生成与提供的 JSON schema 匹配的有效响应。

这可能发生在拒绝的情况下（如果模型出于安全原因拒绝回答），或者例如您达到了最大 token 限制且响应不完整。

::: code-group
```javascript
try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [{
        role: "system",
        content: "You are a helpful math tutor. Guide the user through the solution step by step.",
      },
      {
        role: "user",
        content: "how can I solve 8x + 7 = -23"
      },
    ],
    store: true,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "math_response",
        schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  explanation: {
                    type: "string"
                  },
                  output: {
                    type: "string"
                  },
                },
                required: ["explanation", "output"],
                additionalProperties: false,
              },
            },
            final_answer: {
              type: "string"
            },
          },
          required: ["steps", "final_answer"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    max_tokens: 50,
  });

  if (completion.choices[0].finish_reason === "length") {
    // Handle the case where the model did not return a complete response
    throw new Error("Incomplete response");
  }

  const math_response = completion.choices[0].message;

  if (math_response.refusal) {
    // handle refusal
    console.log(math_response.refusal);
  } else if (math_response.content) {
    console.log(math_response.content);
  } else {
    throw new Error("No response content");
  }
} catch (e) {
  // Handle edge cases
  console.error(e);
}
```

```python
try:
    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful math tutor. Guide the user through the solution step by step.",
            },
            {"role": "user", "content": "how can I solve 8x + 7 = -23"},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "math_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "explanation": {"type": "string"},
                                    "output": {"type": "string"},
                                },
                                "required": ["explanation", "output"],
                                "additionalProperties": False,
                            },
                        },
                        "final_answer": {"type": "string"},
                    },
                    "required": ["steps", "final_answer"],
                    "additionalProperties": False,
                },
            },
        },
        strict=True,
    )
except Exception as e:
    # handle errors like finish_reason, refusal, content_filter, etc.
    pass
```

:::





手动 schema

步骤 1：定义您的 schema

首先，您必须设计模型应该遵循的 JSON Schema。请参阅本指南顶部的[示例](/guides/structured-outputs#examples)作为参考。

虽然 Structured Outputs 支持大部分 JSON Schema，但由于性能或技术原因，某些功能不可用。有关更多详细信息，请参阅[此处](/guides/structured-outputs#supported-schemas)。

#### JSON Schema 的建议

为了最大化模型生成的质量，我们建议以下做法：

*   清晰直观地命名键
*   为结构中的重要键创建清晰的标题和描述
*   创建和使用评估来确定最适合您用例的结构

步骤 2：在 API 调用中提供您的 schema

要使用 Structured Outputs，只需指定

```
response_format: { "type": "json_schema", "json_schema": … , "strict": true }
```

```
text: { format: { type: "json_schema", "strict": true, "schema": … } }
```

例如：

::: code-group
```python
response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "math_response",
            "schema": {
                "type": "object",
                "properties": {
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "explanation": {"type": "string"},
                                "output": {"type": "string"}
                            },
                            "required": ["explanation", "output"],
                            "additionalProperties": False
                        }
                    },
                    "final_answer": {"type": "string"}
                },
                "required": ["steps", "final_answer"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
)

print(response.choices[0].message.content)
```

```javascript
const response = await openai.chat.completions.create({
model: "gpt-4o-2024-08-06",
messages: [
{ role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
{ role: "user", content: "how can I solve 8x + 7 = -23" }
],
store: true,
response_format: {
type: "json_schema",
json_schema: {
name: "math_response",
schema: {
type: "object",
properties: {
steps: {
type: "array",
items: {
type: "object",
properties: {
explanation: { type: "string" },
output: { type: "string" }
},
required: ["explanation", "output"],
additionalProperties: false
}
},
final_answer: { type: "string" }
},
required: ["steps", "final_answer"],
additionalProperties: false
},
strict: true
}
}
});

console.log(response.choices[0].message.content);
```

```curl
curl https://api.openai.com/v1/chat/completions \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-d '{
"model": "gpt-4o-2024-08-06",
"messages": [
{
"role": "system",
"content": "You are a helpful math tutor. Guide the user through the solution step by step."
},
{
"role": "user",
"content": "how can I solve 8x + 7 = -23"
}
],
"response_format": {
"type": "json_schema",
"json_schema": {
"name": "math_response",
"schema": {
"type": "object",
"properties": {
"steps": {
"type": "array",
"items": {
"type": "object",
"properties": {
"explanation": { "type": "string" },
"output": { "type": "string" }
},
"required": ["explanation", "output"],
"additionalProperties": false
}
},
"final_answer": { "type": "string" }
},
"required": ["steps", "final_answer"],
"additionalProperties": false
},
"strict": true
}
}
}'
```

```python
response = client.responses.create(
model="gpt-4o-2024-08-06",
input=[
{"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
{"role": "user", "content": "how can I solve 8x + 7 = -23"}
],
text={
"format": {
"type": "json_schema",
"name": "math_response",
"schema": {
"type": "object",
"properties": {
"steps": {
"type": "array",
"items": {
"type": "object",
"properties": {
"explanation": {"type": "string"},
"output": {"type": "string"}
},
"required": ["explanation", "output"],
"additionalProperties": False
}
},
"final_answer": {"type": "string"}
},
"required": ["steps", "final_answer"],
"additionalProperties": False
},
"strict": True
}
}
)

print(response.output_text)
```

```javascript
const response = await openai.responses.create({
model: "gpt-4o-2024-08-06",
input: [
{ role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
{ role: "user", content: "how can I solve 8x + 7 = -23" }
],
text: {
format: {
type: "json_schema",
name: "math_response",
schema: {
type: "object",
properties: {
steps: {
type: "array",
items: {
type: "object",
properties: {
explanation: { type: "string" },
output: { type: "string" }
},
required: ["explanation", "output"],
additionalProperties: false
}
},
final_answer: { type: "string" }
},
required: ["steps", "final_answer"],
additionalProperties: false
},
strict: true
}
}
});

console.log(response.output_text);
```

```curl
curl https://api.openai.com/v1/responses \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-d '{
"model": "gpt-4o-2024-08-06",
"input": [
{
"role": "system",
"content": "You are a helpful math tutor. Guide the user through the solution step by step."
},
{
"role": "user",
"content": "how can I solve 8x + 7 = -23"
}
],
"text": {
"format": {
"type": "json_schema",
"name": "math_response",
"schema": {
"type": "object",
"properties": {
"steps": {
"type": "array",
"items": {
"type": "object",
"properties": {
"explanation": { "type": "string" },
"output": { "type": "string" }
},
"required": ["explanation", "output"],
"additionalProperties": false
}
},
"final_answer": { "type": "string" }
},
"required": ["steps", "final_answer"],
"additionalProperties": false
},
"strict": true
}
}
}'
```

:::






**注意：** 您使用任何 schema 发出的第一个请求将有额外的延迟，因为我们的 API 会处理该 schema，但使用相同 schema 的后续请求不会有额外延迟。

步骤 3：处理边缘情况

在某些情况下，模型可能不会生成与提供的 JSON schema 匹配的有效响应。

这可能发生在拒绝的情况下（如果模型出于安全原因拒绝回答），或者例如您达到了最大 token 限制且响应不完整。

::: code-group
```javascript
try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [{
        role: "system",
        content: "You are a helpful math tutor. Guide the user through the solution step by step.",
      },
      {
        role: "user",
        content: "how can I solve 8x + 7 = -23"
      },
    ],
    store: true,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "math_response",
        schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  explanation: {
                    type: "string"
                  },
                  output: {
                    type: "string"
                  },
                },
                required: ["explanation", "output"],
                additionalProperties: false,
              },
            },
            final_answer: {
              type: "string"
            },
          },
          required: ["steps", "final_answer"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    max_tokens: 50,
  });

  if (completion.choices[0].finish_reason === "length") {
    // Handle the case where the model did not return a complete response
    throw new Error("Incomplete response");
  }

  const math_response = completion.choices[0].message;

  if (math_response.refusal) {
    // handle refusal
    console.log(math_response.refusal);
  } else if (math_response.content) {
    console.log(math_response.content);
  } else {
    throw new Error("No response content");
  }
} catch (e) {
  // Handle edge cases
  console.error(e);
}
```

```python
try:
    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful math tutor. Guide the user through the solution step by step.",
            },
            {"role": "user", "content": "how can I solve 8x + 7 = -23"},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "math_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "explanation": {"type": "string"},
                                    "output": {"type": "string"},
                                },
                                "required": ["explanation", "output"],
                                "additionalProperties": False,
                            },
                        },
                        "final_answer": {"type": "string"},
                    },
                    "required": ["steps", "final_answer"],
                    "additionalProperties": False,
                },
            },
        },
        strict=True,
    )
except Exception as e:
    # handle errors like finish_reason, refusal, content_filter, etc.
    pass
```

```javascript
try {
  const response = await openai.responses.create({
    model: "gpt-4o-2024-08-06",
    input: [{
        role: "system",
        content: "You are a helpful math tutor. Guide the user through the solution step by step.",
      },
      {
        role: "user",
        content: "how can I solve 8x + 7 = -23"
      },
    ],
    max_output_tokens: 50,
    text: {
      format: {
        type: "json_schema",
        name: "math_response",
        schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  explanation: {
                    type: "string"
                  },
                  output: {
                    type: "string"
                  },
                },
                required: ["explanation", "output"],
                additionalProperties: false,
              },
            },
            final_answer: {
              type: "string"
            },
          },
          required: ["steps", "final_answer"],
          additionalProperties: false,
        },
        strict: true,
      },
    }
  });

  if (response.status === "incomplete" && response.incomplete_details.reason === "max_output_tokens") {
    // Handle the case where the model did not return a complete response
    throw new Error("Incomplete response");
  }

  const math_response = response.output[0].content[0];

  if (math_response.type === "refusal") {
    // handle refusal
    console.log(math_response.refusal);
  } else if (math_response.type === "output_text") {
    console.log(math_response.text);
  } else {
    throw new Error("No response content");
  }
} catch (e) {
  // Handle edge cases
  console.error(e);
}
```

```python
try:
    response = client.responses.create(
        model="gpt-4o-2024-08-06",
        input=[
            {
                "role": "system",
                "content": "You are a helpful math tutor. Guide the user through the solution step by step.",
            },
            {"role": "user", "content": "how can I solve 8x + 7 = -23"},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "math_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "explanation": {"type": "string"},
                                    "output": {"type": "string"},
                                },
                                "required": ["explanation", "output"],
                                "additionalProperties": False,
                            },
                        },
                        "final_answer": {"type": "string"},
                    },
                    "required": ["steps", "final_answer"],
                    "additionalProperties": False,
                },
                "strict": True,
            },
        },
    )
except Exception as e:
    # handle errors like finish_reason, refusal, content_filter, etc.
    pass
```

:::






步骤 4：以类型安全的方式使用生成的结构化数据

通常，在使用 Structured Outputs 时，您会在编程语言的类型系统中有一个类型或类来表示 JSON Schema 对象。

一旦您确认收到了保证匹配您请求的 schema 的 JSON，您现在可以安全地将其解析为相应的类型。

例如：

::: code-group
```python
from pydantic import BaseModel, ValidationError
from typing import List

# Define types that match the JSON Schema using pydantic models

class Step(BaseModel):
explanation: str
output: str

class Solution(BaseModel):
steps: List[Step]
final_answer: str

...

try: # Parse and validate the response content
solution = Solution.parse_raw(response.choices[0].message.content)
print(solution)
except ValidationError as e: # Handle validation errors
print(e.json())
```

```javascript
// Here we specify types in TypeScript that exactly match the JSON Schema we provided when calling the OpenAI API. Note that these _must_ be kept in sync.

type Step = {
explanation: string;
output: string;
};

type Solution = {
steps: Step[];
final_answer: string;
};

...

// Now so long as the JSON Schema we created was exactly equivalent to our TypeScript types, this is type-safe
const solution = JSON.parse(response.choices[0].message.content)) as Solution
```

:::




## 如何使用 text.format 的 Structured Outputs

步骤 1：定义您的 schema

首先，您必须设计模型应该遵循的 JSON Schema。请参阅本指南顶部的[示例](/guides/structured-outputs#examples)作为参考。

虽然 Structured Outputs 支持大部分 JSON Schema，但由于性能或技术原因，某些功能不可用。有关更多详细信息，请参阅[此处](/guides/structured-outputs#supported-schemas)。

#### JSON Schema 的建议

为了最大化模型生成的质量，我们建议以下做法：

*   清晰直观地命名键
*   为结构中的重要键创建清晰的标题和描述
*   创建和使用评估来确定最适合您用例的结构

步骤 2：在 API 调用中提供您的 schema

要使用 Structured Outputs，只需指定

```
response_format: { "type": "json_schema", "json_schema": … , "strict": true }
```

```
text: { format: { type: "json_schema", "strict": true, "schema": … } }
```

例如：

::: code-group
```python
response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "math_response",
            "schema": {
                "type": "object",
                "properties": {
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "explanation": {"type": "string"},
                                "output": {"type": "string"}
                            },
                            "required": ["explanation", "output"],
                            "additionalProperties": False
                        }
                    },
                    "final_answer": {"type": "string"}
                },
                "required": ["steps", "final_answer"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
)

print(response.choices[0].message.content)
```

```javascript
const response = await openai.chat.completions.create({
model: "gpt-4o-2024-08-06",
messages: [
{ role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
{ role: "user", content: "how can I solve 8x + 7 = -23" }
],
store: true,
response_format: {
type: "json_schema",
json_schema: {
name: "math_response",
schema: {
type: "object",
properties: {
steps: {
type: "array",
items: {
type: "object",
properties: {
explanation: { type: "string" },
output: { type: "string" }
},
required: ["explanation", "output"],
additionalProperties: false
}
},
final_answer: { type: "string" }
},
required: ["steps", "final_answer"],
additionalProperties: false
},
strict: true
}
}
});

console.log(response.choices[0].message.content);
```

```curl
curl https://api.openai.com/v1/chat/completions \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-d '{
"model": "gpt-4o-2024-08-06",
"messages": [
{
"role": "system",
"content": "You are a helpful math tutor. Guide the user through the solution step by step."
},
{
"role": "user",
"content": "how can I solve 8x + 7 = -23"
}
],
"response_format": {
"type": "json_schema",
"json_schema": {
"name": "math_response",
"schema": {
"type": "object",
"properties": {
"steps": {
"type": "array",
"items": {
"type": "object",
"properties": {
"explanation": { "type": "string" },
"output": { "type": "string" }
},
"required": ["explanation", "output"],
"additionalProperties": false
}
},
"final_answer": { "type": "string" }
},
"required": ["steps", "final_answer"],
"additionalProperties": false
},
"strict": true
}
}
}'
```

```python
response = client.responses.create(
model="gpt-4o-2024-08-06",
input=[
{"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
{"role": "user", "content": "how can I solve 8x + 7 = -23"}
],
text={
"format": {
"type": "json_schema",
"name": "math_response",
"schema": {
"type": "object",
"properties": {
"steps": {
"type": "array",
"items": {
"type": "object",
"properties": {
"explanation": {"type": "string"},
"output": {"type": "string"}
},
"required": ["explanation", "output"],
"additionalProperties": False
}
},
"final_answer": {"type": "string"}
},
"required": ["steps", "final_answer"],
"additionalProperties": False
},
"strict": True
}
}
)

print(response.output_text)
```

```javascript
const response = await openai.responses.create({
model: "gpt-4o-2024-08-06",
input: [
{ role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
{ role: "user", content: "how can I solve 8x + 7 = -23" }
],
text: {
format: {
type: "json_schema",
name: "math_response",
schema: {
type: "object",
properties: {
steps: {
type: "array",
items: {
type: "object",
properties: {
explanation: { type: "string" },
output: { type: "string" }
},
required: ["explanation", "output"],
additionalProperties: false
}
},
final_answer: { type: "string" }
},
required: ["steps", "final_answer"],
additionalProperties: false
},
strict: true
}
}
});

console.log(response.output_text);
```

```curl
curl https://api.openai.com/v1/responses \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-d '{
"model": "gpt-4o-2024-08-06",
"input": [
{
"role": "system",
"content": "You are a helpful math tutor. Guide the user through the solution step by step."
},
{
"role": "user",
"content": "how can I solve 8x + 7 = -23"
}
],
"text": {
"format": {
"type": "json_schema",
"name": "math_response",
"schema": {
"type": "object",
"properties": {
"steps": {
"type": "array",
"items": {
"type": "object",
"properties": {
"explanation": { "type": "string" },
"output": { "type": "string" }
},
"required": ["explanation", "output"],
"additionalProperties": false
}
},
"final_answer": { "type": "string" }
},
"required": ["steps", "final_answer"],
"additionalProperties": false
},
"strict": true
}
}
}'
```

:::






**注意：** 您使用任何 schema 发出的第一个请求将有额外的延迟，因为我们的 API 会处理该 schema，但使用相同 schema 的后续请求不会有额外延迟。

步骤 3：处理边缘情况

在某些情况下，模型可能不会生成与提供的 JSON schema 匹配的有效响应。

这可能发生在拒绝的情况下（如果模型出于安全原因拒绝回答），或者例如您达到了最大 token 限制且响应不完整。

::: code-group
```javascript
try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [{
        role: "system",
        content: "You are a helpful math tutor. Guide the user through the solution step by step.",
      },
      {
        role: "user",
        content: "how can I solve 8x + 7 = -23"
      },
    ],
    store: true,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "math_response",
        schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  explanation: {
                    type: "string"
                  },
                  output: {
                    type: "string"
                  },
                },
                required: ["explanation", "output"],
                additionalProperties: false,
              },
            },
            final_answer: {
              type: "string"
            },
          },
          required: ["steps", "final_answer"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    max_tokens: 50,
  });

  if (completion.choices[0].finish_reason === "length") {
    // Handle the case where the model did not return a complete response
    throw new Error("Incomplete response");
  }

  const math_response = completion.choices[0].message;

  if (math_response.refusal) {
    // handle refusal
    console.log(math_response.refusal);
  } else if (math_response.content) {
    console.log(math_response.content);
  } else {
    throw new Error("No response content");
  }
} catch (e) {
  // Handle edge cases
  console.error(e);
}
```

```python
try:
    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful math tutor. Guide the user through the solution step by step.",
            },
            {"role": "user", "content": "how can I solve 8x + 7 = -23"},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "math_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "explanation": {"type": "string"},
                                    "output": {"type": "string"},
                                },
                                "required": ["explanation", "output"],
                                "additionalProperties": False,
                            },
                        },
                        "final_answer": {"type": "string"},
                    },
                    "required": ["steps", "final_answer"],
                    "additionalProperties": False,
                },
            },
        },
        strict=True,
    )
except Exception as e:
    # handle errors like finish_reason, refusal, content_filter, etc.
    pass
```

```javascript
try {
  const response = await openai.responses.create({
    model: "gpt-4o-2024-08-06",
    input: [{
        role: "system",
        content: "You are a helpful math tutor. Guide the user through the solution step by step.",
      },
      {
        role: "user",
        content: "how can I solve 8x + 7 = -23"
      },
    ],
    max_output_tokens: 50,
    text: {
      format: {
        type: "json_schema",
        name: "math_response",
        schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  explanation: {
                    type: "string"
                  },
                  output: {
                    type: "string"
                  },
                },
                required: ["explanation", "output"],
                additionalProperties: false,
              },
            },
            final_answer: {
              type: "string"
            },
          },
          required: ["steps", "final_answer"],
          additionalProperties: false,
        },
        strict: true,
      },
    }
  });

  if (response.status === "incomplete" && response.incomplete_details.reason === "max_output_tokens") {
    // Handle the case where the model did not return a complete response
    throw new Error("Incomplete response");
  }

  const math_response = response.output[0].content[0];

  if (math_response.type === "refusal") {
    // handle refusal
    console.log(math_response.refusal);
  } else if (math_response.type === "output_text") {
    console.log(math_response.text);
  } else {
    throw new Error("No response content");
  }
} catch (e) {
  // Handle edge cases
  console.error(e);
}
```

```python
try:
    response = client.responses.create(
        model="gpt-4o-2024-08-06",
        input=[
            {
                "role": "system",
                "content": "You are a helpful math tutor. Guide the user through the solution step by step.",
            },
            {"role": "user", "content": "how can I solve 8x + 7 = -23"},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "math_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "explanation": {"type": "string"},
                                    "output": {"type": "string"},
                                },
                                "required": ["explanation", "output"],
                                "additionalProperties": False,
                            },
                        },
                        "final_answer": {"type": "string"},
                    },
                    "required": ["steps", "final_answer"],
                    "additionalProperties": False,
                },
                "strict": True,
            },
        },
    )
except Exception as e:
    # handle errors like finish_reason, refusal, content_filter, etc.
    pass
```

:::






步骤 4：以类型安全的方式使用生成的结构化数据

通常，在使用 Structured Outputs 时，您会在编程语言的类型系统中有一个类型或类来表示 JSON Schema 对象。

一旦您确认收到了保证匹配您请求的 schema 的 JSON，您现在可以安全地将其解析为相应的类型。

例如：

::: code-group
```python
from pydantic import BaseModel, ValidationError
from typing import List

# Define types that match the JSON Schema using pydantic models

class Step(BaseModel):
explanation: str
output: str

class Solution(BaseModel):
steps: List[Step]
final_answer: str

...

try: # Parse and validate the response content
solution = Solution.parse_raw(response.choices[0].message.content)
print(solution)
except ValidationError as e: # Handle validation errors
print(e.json())
```

```javascript
// Here we specify types in TypeScript that exactly match the JSON Schema we provided when calling the OpenAI API. Note that these _must_ be kept in sync.

type Step = {
explanation: string;
output: string;
};

type Solution = {
steps: Step[];
final_answer: string;
};

...

// Now so long as the JSON Schema we created was exactly equivalent to our TypeScript types, this is type-safe
const solution = JSON.parse(response.choices[0].message.content)) as Solution
```

:::




### Structured Outputs 的拒绝

当使用 Structured Outputs 处理用户生成的输入时，OpenAI 模型可能偶尔会出于安全原因拒绝满足请求。由于拒绝不一定遵循您在 `response_format` 中提供的 schema，API 响应将包含一个名为 `refusal` 的新字段，以指示模型拒绝了该请求。

当 `refusal` 属性出现在您的输出对象中时，您可能会在 UI 中展示拒绝信息，或在消费响应的代码中包含条件逻辑来处理请求被拒绝的情况。

::: code-group
```python
class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
steps: list[Step]
final_answer: str

completion = client.chat.completions.parse(
model="gpt-4o-2024-08-06",
messages=[
{"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
{"role": "user", "content": "how can I solve 8x + 7 = -23"},
],
response_format=MathReasoning,
)

math_reasoning = completion.choices[0].message

# If the model refuses to respond, you will get a refusal message

if math_reasoning.refusal:
print(math_reasoning.refusal)
else:
print(math_reasoning.parsed)
```

```javascript
const Step = z.object({
explanation: z.string(),
output: z.string(),
});

const MathReasoning = z.object({
steps: z.array(Step),
final_answer: z.string(),
});

const completion = await openai.chat.completions.parse({
model: "gpt-4o-2024-08-06",
messages: [
{ role: "system", content: "You are a helpful math tutor. Guide the user through the solution step by step." },
{ role: "user", content: "how can I solve 8x + 7 = -23" },
],
response_format: zodResponseFormat(MathReasoning, "math_reasoning"),
});

const math_reasoning = completion.choices[0].message

// If the model refuses to respond, you will get a refusal message
if (math_reasoning.refusal) {
console.log(math_reasoning.refusal);
} else {
console.log(math_reasoning.parsed);
}
```

:::




拒绝的 API 响应将类似于这样：

::: code-group
```json
{
  "id": "chatcmpl-9nYAG9LPNonX8DAyrkwYfemr3C8HC",
  "object": "chat.completion",
  "created": 1721596428,
  "model": "gpt-4o-2024-08-06",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        // highlight-start
        "refusal": "I'm sorry, I cannot assist with that request."
        // highlight-end
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 81,
    "completion_tokens": 11,
    "total_tokens": 92,
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "system_fingerprint": "fp_3407719c7f"
}
```

```json
{
  "id": "resp_1234567890",
  "object": "response",
  "created_at": 1721596428,
  "status": "completed",
  "completed_at": 1721596429,
  "error": null,
  "incomplete_details": null,
  "input": [],
  "instructions": null,
  "max_output_tokens": null,
  "model": "gpt-4o-2024-08-06",
  "output": [{
    "id": "msg_1234567890",
    "type": "message",
    "role": "assistant",
    "content": [
      // highlight-start
      {
        "type": "refusal",
        "refusal": "I'm sorry, I cannot assist with that request."
      }
      // highlight-end
    ]
  }],
  "usage": {
    "input_tokens": 81,
    "output_tokens": 11,
    "total_tokens": 92,
    "output_tokens_details": {
      "reasoning_tokens": 0,
    }
  },
}
```

:::




### 提示和最佳实践

#### 处理用户生成的输入

如果您的应用程序使用用户生成的输入，请确保您的提示包含关于如何处理输入无法产生有效响应的情况的说明。

模型将始终尝试遵循提供的 schema，如果输入与 schema 完全无关，这可能导致幻觉。

您可以在提示中包含语言来指定，如果模型检测到输入与任务不兼容，您希望返回空参数或特定句子。

#### 处理错误

Structured Outputs 仍然可能包含错误。如果您发现错误，请尝试调整您的指令、在系统指令中提供示例，或将任务拆分为更简单的子任务。有关如何调整输入的更多指导，请参阅[提示工程指南](/guides/prompt-engineering)。

#### 避免 JSON schema 分歧

为了防止您的 JSON Schema 和编程语言中的相应类型出现分歧，我们强烈建议使用原生的 Pydantic/zod SDK 支持。

如果您更喜欢直接指定 JSON schema，您可以添加 CI 规则，在 JSON schema 或底层数据对象被编辑时进行标记，或添加一个 CI 步骤，从类型定义自动生成 JSON Schema（或反之亦然）。

## 流式传输

您可以使用流式传输在模型响应或函数调用参数生成时进行处理，并将它们解析为结构化数据。

这样，您不必等待整个响应完成后再处理它。如果您想逐个显示 JSON 字段，或在函数调用参数可用时立即处理它们，这特别有用。

我们建议依赖 SDK 来处理 Structured Outputs 的流式传输。

您可以在[函数调用指南](/guides/function-calling#advanced-usage)中找到一个不使用 SDK `stream` 辅助工具流式传输函数调用参数的示例。

以下是如何使用 `stream` 辅助工具流式传输模型响应：

::: code-group
```python
from typing import List
from pydantic import BaseModel
from openai import OpenAI

class EntitiesModel(BaseModel):
attributes: List[str]
colors: List[str]
animals: List[str]

client = OpenAI()

with client.beta.chat.completions.stream(
model="gpt-4.1",
messages=[
{"role": "system", "content": "Extract entities from the input text"},
{
"role": "user",
"content": "The quick brown fox jumps over the lazy dog with piercing blue eyes",
},
],
response_format=EntitiesModel,
) as stream:
for event in stream:
if event.type == "content.delta":
if event.parsed is not None: # Print the parsed data as JSON
print("content.delta parsed:", event.parsed)
elif event.type == "content.done":
print("content.done")
elif event.type == "error":
print("Error in stream:", event.error)

final_completion = stream.get_final_completion()
print("Final completion:", final_completion)
```

```javascript
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
export const openai = new OpenAI();

const EntitiesSchema = z.object({
attributes: z.array(z.string()),
colors: z.array(z.string()),
animals: z.array(z.string()),
});

const stream = openai.beta.chat.completions
.stream({
model: "gpt-4.1",
messages: [
{ role: "system", content: "Extract entities from the input text" },
{
role: "user",
content:
"The quick brown fox jumps over the lazy dog with piercing blue eyes",
},
],
response_format: zodResponseFormat(EntitiesSchema, "entities"),
})
.on("refusal.done", () => console.log("request refused"))
.on("content.delta", ({ snapshot, parsed }) => {
console.log("content:", snapshot);
console.log("parsed:", parsed);
console.log();
})
.on("content.done", (props) => {
console.log(props);
});

await stream.done();

const finalCompletion = await stream.finalChatCompletion();

console.log(finalCompletion);
```

:::




您还可以使用 `stream` 辅助工具来解析函数调用参数：

::: code-group
```python
from pydantic import BaseModel
import openai
from openai import OpenAI

class GetWeather(BaseModel):
city: str
country: str

client = OpenAI()

with client.beta.chat.completions.stream(
model="gpt-4.1",
messages=[
{
"role": "user",
"content": "What's the weather like in SF and London?",
},
],
tools=[
openai.pydantic_function_tool(GetWeather, name="get_weather"),
],
parallel_tool_calls=True,
) as stream:
for event in stream:
if event.type == "tool_calls.function.arguments.delta" or event.type == "tool_calls.function.arguments.done":
print(event)

print(stream.get_final_completion())
```

```javascript
import { zodFunction } from "openai/helpers/zod";
import OpenAI from "openai/index";
import { z } from "zod";

const GetWeatherArgs = z.object({
city: z.string(),
country: z.string(),
});

const client = new OpenAI();

const stream = client.beta.chat.completions
.stream({
model: "gpt-4.1",
messages: [
{
role: "user",
content: "What's the weather like in SF and London?",
},
],
tools: [zodFunction({ name: "get_weather", parameters: GetWeatherArgs })],
})
.on("tool_calls.function.arguments.delta", (props) =>
console.log("tool_calls.function.arguments.delta", props)
)
.on("tool_calls.function.arguments.done", (props) =>
console.log("tool_calls.function.arguments.done", props)
)
.on("refusal.delta", ({ delta }) => {
process.stdout.write(delta);
})
.on("refusal.done", () => console.log("request refused"));

const completion = await stream.finalChatCompletion();

console.log("final completion:", completion);
```

```python
from typing import List

from openai import OpenAI
from pydantic import BaseModel

class EntitiesModel(BaseModel):
attributes: List[str]
colors: List[str]
animals: List[str]

client = OpenAI()

with client.responses.stream(
model="gpt-4.1",
input=[
{"role": "system", "content": "Extract entities from the input text"},
{
"role": "user",
"content": "The quick brown fox jumps over the lazy dog with piercing blue eyes",
},
],
text_format=EntitiesModel,
) as stream:
for event in stream:
if event.type == "response.refusal.delta":
print(event.delta, end="")
elif event.type == "response.output_text.delta":
print(event.delta, end="")
elif event.type == "response.error":
print(event.error, end="")
elif event.type == "response.completed":
print("Completed") # print(event.response.output)

    final_response = stream.get_final_response()
    print(final_response)
```

```javascript
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const EntitiesSchema = z.object({
attributes: z.array(z.string()),
colors: z.array(z.string()),
animals: z.array(z.string()),
});

const openai = new OpenAI();
const stream = openai.responses
.stream({
model: "gpt-4.1",
input: [
{ role: "user", content: "What's the weather like in Paris today?" },
],
text: {
format: zodTextFormat(EntitiesSchema, "entities"),
},
})
.on("response.refusal.delta", (event) => {
process.stdout.write(event.delta);
})
.on("response.output_text.delta", (event) => {
process.stdout.write(event.delta);
})
.on("response.output_text.done", () => {
process.stdout.write("\n");
})
.on("response.error", (event) => {
console.error(event.error);
});

const result = await stream.finalResponse();

console.log(result);
```

:::






## 支持的模式

Structured Outputs 支持 [JSON Schema](https://json-schema.org/docs) 语言的一个子集。

#### 支持的类型

以下类型支持 Structured Outputs：

*   String
*   Number
*   Boolean
*   Integer
*   Object
*   Array
*   Enum
*   anyOf

#### 支持的属性

除了指定属性的类型外，您还可以指定一些额外的约束：

**支持的 `string` 属性：**

*   `pattern` — 字符串必须匹配的正则表达式。
*   `format` — 字符串的预定义格式。目前支持：
    *   `date-time`
    *   `time`
    *   `date`
    *   `duration`
    *   `email`
    *   `hostname`
    *   `ipv4`
    *   `ipv6`
    *   `uuid`

**支持的 `number` 属性：**

*   `multipleOf` — 数字必须是此值的倍数。
*   `maximum` — 数字必须小于或等于此值。
*   `exclusiveMaximum` — 数字必须小于此值。
*   `minimum` — 数字必须大于或等于此值。
*   `exclusiveMinimum` — 数字必须大于此值。

**支持的 `array` 属性：**

*   `minItems` — 数组必须至少有这么多项。
*   `maxItems` — 数组最多有这么多项。

以下是一些如何使用这些类型限制的示例：

字符串限制数字限制

字符串限制

```json
{
    "name": "user_data",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "The name of the user"
            },
            "username": {
                "type": "string",
                "description": "The username of the user. Must start with @",
                // highlight-start
                "pattern": "^@[a-zA-Z0-9_]+$"
                // highlight-end
            },
            "email": {
                "type": "string",
                "description": "The email of the user",
                // highlight-start
                "format": "email"
                // highlight-end
            }
        },
        "additionalProperties": false,
        "required": [
            "name", "username", "email"
        ]
    }
}
```

数字限制

```json
{
    "name": "weather_data",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The location to get the weather for"
            },
            "unit": {
                "type": ["string", "null"],
                "description": "The unit to return the temperature in",
                "enum": ["F", "C"]
            },
            "value": {
                "type": "number",
                "description": "The actual temperature value in the location",
                // highlight-start
                "minimum": -130,
                "maximum": 130
                // highlight-end
            }
        },
        "additionalProperties": false,
        "required": [
            "location", "unit", "value"
        ]
    }
}
```

请注意，这些约束[尚不支持微调模型](#some-type-specific-keywords-are-not-yet-supported)。

#### 根对象不能是 `anyOf` 且必须是对象

请注意，schema 的根级别对象必须是对象，且不能使用 `anyOf`。在 Zod 中（作为一个例子）出现的一种模式是使用可区分联合，这会在顶层产生 `anyOf`。因此，如下代码将不起作用：

```javascript
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const BaseResponseSchema = z.object({/* ... */});
const UnsuccessfulResponseSchema = z.object({/* ... */});

const finalSchema = z.discriminatedUnion('status', [
BaseResponseSchema,
UnsuccessfulResponseSchema,
]);

// Invalid JSON Schema for Structured Outputs
const json = zodResponseFormat(finalSchema, 'final_schema');
```

#### 所有字段必须为 `required`

要使用 Structured Outputs，所有字段或函数参数必须指定为 `required`。

```json
{
    "name": "get_weather",
    "description": "Fetches the weather in the given location",
    "strict": true,
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The location to get the weather for"
            },
            "unit": {
                "type": "string",
                "description": "The unit to return the temperature in",
                "enum": ["F", "C"]
            }
        },
        "additionalProperties": false,
        // highlight-start
        "required": ["location", "unit"]
        // highlight-end
    }
}
```

虽然所有字段必须为 required（模型将为每个参数返回一个值），但可以通过使用与 `null` 的联合类型来模拟可选参数。

```json
{
    "name": "get_weather",
    "description": "Fetches the weather in the given location",
    "strict": true,
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The location to get the weather for"
            },
            "unit": {
                // highlight-start
                "type": ["string", "null"],
                // highlight-end
                "description": "The unit to return the temperature in",
                "enum": ["F", "C"]
            }
        },
        "additionalProperties": false,
        "required": [
            "location", "unit"
        ]
    }
}
```

#### 对象的嵌套深度和大小有限制

一个 schema 总共最多可以有 5000 个对象属性，最多 10 层嵌套。

#### 总字符串大小的限制

在一个 schema 中，所有属性名、定义名、枚举值和 const 值的总字符串长度不能超过 120,000 个字符。

#### 枚举大小的限制

一个 schema 在所有枚举属性中最多可以有 1000 个枚举值。

对于具有字符串值的单个枚举属性，当枚举值超过 250 个时，所有枚举值的总字符串长度不能超过 15,000 个字符。

#### 对象中必须始终设置 `additionalProperties: false`

`additionalProperties` 控制对象是否允许包含未在 JSON Schema 中定义的额外键/值。

Structured Outputs 仅支持生成指定的键/值，因此我们要求开发者设置 `additionalProperties: false` 以选择使用 Structured Outputs。

```json
{
    "name": "get_weather",
    "description": "Fetches the weather in the given location",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The location to get the weather for"
            },
            "unit": {
                "type": "string",
                "description": "The unit to return the temperature in",
                "enum": ["F", "C"]
            }
        },
        // highlight-start
        "additionalProperties": false,
        // highlight-end
        "required": [
            "location", "unit"
        ]
    }
}
```

#### 键的顺序

使用 Structured Outputs 时，输出将按照 schema 中键的顺序生成。

#### 某些类型特定的关键字尚不支持

*   **组合：** `allOf`、`not`、`dependentRequired`、`dependentSchemas`、`if`、`then`、`else`

对于微调模型，我们还不支持以下内容：

*   **字符串：** `minLength`、`maxLength`、`pattern`、`format`
*   **数字：** `minimum`、`maximum`、`multipleOf`
*   **对象：** `patternProperties`
*   **数组：** `minItems`、`maxItems`

如果您通过提供 `strict: true` 开启 Structured Outputs 并使用不支持的 JSON Schema 调用 API，您将收到错误。

#### 对于 `anyOf`，嵌套的 schema 必须各自是此子集中的有效 JSON Schema

以下是一个支持的 anyOf schema 示例：

```json
{
    "type": "object",
    "properties": {
        "item": {
            "anyOf": [
                {
                    "type": "object",
                    "description": "The user object to insert into the database",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "The name of the user"
                        },
                        "age": {
                            "type": "number",
                            "description": "The age of the user"
                        }
                    },
                    "additionalProperties": false,
                    "required": [
                        "name",
                        "age"
                    ]
                },
                {
                    "type": "object",
                    "description": "The address object to insert into the database",
                    "properties": {
                        "number": {
                            "type": "string",
                            "description": "The number of the address. Eg. for 123 main st, this would be 123"
                        },
                        "street": {
                            "type": "string",
                            "description": "The street name. Eg. for 123 main st, this would be main st"
                        },
                        "city": {
                            "type": "string",
                            "description": "The city of the address"
                        }
                    },
                    "additionalProperties": false,
                    "required": [
                        "number",
                        "street",
                        "city"
                    ]
                }
            ]
        }
    },
    "additionalProperties": false,
    "required": [
        "item"
    ]
}
```

#### 支持定义

您可以使用定义来定义在整个 schema 中引用的子 schema。以下是一个简单的示例。

```json
{
    "type": "object",
    "properties": {
        "steps": {
            "type": "array",
            "items": {
                "$ref": "#/$defs/step"
            }
        },
        "final_answer": {
            "type": "string"
        }
    },
    "$defs": {
        "step": {
            "type": "object",
            "properties": {
                "explanation": {
                    "type": "string"
                },
                "output": {
                    "type": "string"
                }
            },
            "required": [
                "explanation",
                "output"
            ],
            "additionalProperties": false
        }
    },
    "required": [
        "steps",
        "final_answer"
    ],
    "additionalProperties": false
}
```

#### 支持递归 schema

使用 `#` 表示根递归的递归 schema 示例。

```json
{
    "name": "ui",
    "description": "Dynamically generated UI",
    "strict": true,
    "schema": {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "description": "The type of the UI component",
                "enum": ["div", "button", "header", "section", "field", "form"]
            },
            "label": {
                "type": "string",
                "description": "The label of the UI component, used for buttons or form fields"
            },
            "children": {
                "type": "array",
                "description": "Nested UI components",
                "items": {
                    "$ref": "#"
                }
            },
            "attributes": {
                "type": "array",
                "description": "Arbitrary attributes for the UI component, suitable for any element",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "The name of the attribute, for example onClick or className"
                        },
                        "value": {
                            "type": "string",
                            "description": "The value of the attribute"
                        }
                    },
                    "additionalProperties": false,
                    "required": ["name", "value"]
                }
            }
        },
        "required": ["type", "label", "children", "attributes"],
        "additionalProperties": false
    }
}
```

使用显式递归的递归 schema 示例：

```json
{
    "type": "object",
    "properties": {
        "linked_list": {
            "$ref": "#/$defs/linked_list_node"
        }
    },
    "$defs": {
        "linked_list_node": {
            "type": "object",
            "properties": {
                "value": {
                    "type": "number"
                },
                "next": {
                    "anyOf": [
                        {
                            "$ref": "#/$defs/linked_list_node"
                        },
                        {
                            "type": "null"
                        }
                    ]
                }
            },
            "additionalProperties": false,
            "required": [
                "next",
                "value"
            ]
        }
    },
    "additionalProperties": false,
    "required": [
        "linked_list"
    ]
}
```

## JSON mode

JSON mode 是 Structured Outputs 功能的更基础版本。虽然 JSON mode 确保模型输出是有效的 JSON，但 Structured Outputs 可靠地将模型的输出与您指定的 schema 匹配。如果您的用例支持，我们建议您使用 Structured Outputs。

当 JSON mode 开启时，模型的输出确保是有效的 JSON，除了一些您应该检测和适当处理的边缘情况。

要在 Chat Completions 中开启 JSON mode，请将 `response_format` 设置为 `{ "type": "json_object" }`。如果您使用函数调用，JSON mode 始终是开启的。

要在 Responses API 中开启 JSON mode，您可以将 `text.format` 设置为 `{ "type": "json_object" }`。如果您使用函数调用，JSON mode 始终是开启的。

重要说明：

*   使用 JSON mode 时，您必须始终通过对话中的某条消息（例如通过系统消息）指示模型生成 JSON。如果您不包含生成 JSON 的明确指令，模型可能会生成无尽的空白流，请求可能会持续运行直到达到 token 限制。为了帮助确保您不会忘记，如果字符串 "JSON" 没有出现在上下文中的某处，API 将抛出错误。
*   JSON mode 不会保证输出匹配任何特定的 schema，只保证它是有效的且解析时不会出错。您应该使用 Structured Outputs 来确保它匹配您的 schema，或者如果不可能，您应该使用验证库和可能的重试来确保输出匹配您所需的 schema。
*   您的应用程序必须检测和处理可能导致模型输出不是完整 JSON 对象的边缘情况（见下文）

处理边缘情况

::: code-group
```javascript
const we_did_not_specify_stop_tokens = true;

try {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: "Who won the world series in 2020? Please respond in the format {winner: ...}" },
    ],
    store: true,
    response_format: { type: "json_object" },
  });

  // Check if the conversation was too long for the context window, resulting in incomplete JSON 
  if (response.choices[0].message.finish_reason === "length") {
    // your code should handle this error case
  }

  // Check if the OpenAI safety system refused the request and generated a refusal instead
  if (response.choices[0].message[0].refusal) {
    // your code should handle this error case
    // In this case, the .content field will contain the explanation (if any) that the model generated for why it is refusing
    console.log(response.choices[0].message[0].refusal)
  }

  // Check if the model's output included restricted content, so the generation of JSON was halted and may be partial
  if (response.choices[0].message.finish_reason === "content_filter") {
    // your code should handle this error case
  }

  if (response.choices[0].message.finish_reason === "stop") {
    // In this case the model has either successfully finished generating the JSON object according to your schema, or the model generated one of the tokens you provided as a "stop token"

    if (we_did_not_specify_stop_tokens) {
      // If you didn't specify any stop tokens, then the generation is complete and the content key will contain the serialized JSON object
      // This will parse successfully and should now contain  {"winner": "Los Angeles Dodgers"}
      console.log(JSON.parse(response.choices[0].message.content))
    } else {
      // Check if the response.choices[0].message.content ends with one of your stop tokens and handle appropriately
    }
  }
} catch (e) {
  // Your code should handle errors here, for example a network error calling the API
  console.error(e)
}
```

```python
we_did_not_specify_stop_tokens = True

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=[
            {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
            {"role": "user", "content": "Who won the world series in 2020? Please respond in the format {winner: ...}"}
        ],
        response_format={"type": "json_object"}
    )

    # Check if the conversation was too long for the context window, resulting in incomplete JSON 
    if response.choices[0].message.finish_reason == "length":
        # your code should handle this error case
        pass

    # Check if the OpenAI safety system refused the request and generated a refusal instead
    if response.choices[0].message[0].get("refusal"):
        # your code should handle this error case
        # In this case, the .content field will contain the explanation (if any) that the model generated for why it is refusing
        print(response.choices[0].message[0]["refusal"])

    # Check if the model's output included restricted content, so the generation of JSON was halted and may be partial
    if response.choices[0].message.finish_reason == "content_filter":
        # your code should handle this error case
        pass

    if response.choices[0].message.finish_reason == "stop":
        # In this case the model has either successfully finished generating the JSON object according to your schema, or the model generated one of the tokens you provided as a "stop token"

        if we_did_not_specify_stop_tokens:
            # If you didn't specify any stop tokens, then the generation is complete and the content key will contain the serialized JSON object
            # This will parse successfully and should now contain  "{"winner": "Los Angeles Dodgers"}"
            print(response.choices[0].message.content)
        else:
            # Check if the response.choices[0].message.content ends with one of your stop tokens and handle appropriately
            pass
except Exception as e:
    # Your code should handle errors here, for example a network error calling the API
    print(e)
```

```javascript
const we_did_not_specify_stop_tokens = true;

try {
  const response = await openai.responses.create({
    model: "gpt-3.5-turbo-0125",
    input: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: "Who won the world series in 2020? Please respond in the format {winner: ...}" },
    ],
    text: { format: { type: "json_object" } },
  });

  // Check if the conversation was too long for the context window, resulting in incomplete JSON 
  if (response.status === "incomplete" && response.incomplete_details.reason === "max_output_tokens") {
    // your code should handle this error case
  }

  // Check if the OpenAI safety system refused the request and generated a refusal instead
  if (response.output[0].content[0].type === "refusal") {
    // your code should handle this error case
    // In this case, the .content field will contain the explanation (if any) that the model generated for why it is refusing
    console.log(response.output[0].content[0].refusal)
  }

  // Check if the model's output included restricted content, so the generation of JSON was halted and may be partial
  if (response.status === "incomplete" && response.incomplete_details.reason === "content_filter") {
    // your code should handle this error case
  }

  if (response.status === "completed") {
    // In this case the model has either successfully finished generating the JSON object according to your schema, or the model generated one of the tokens you provided as a "stop token"

    if (we_did_not_specify_stop_tokens) {
      // If you didn't specify any stop tokens, then the generation is complete and the content key will contain the serialized JSON object
      // This will parse successfully and should now contain  {"winner": "Los Angeles Dodgers"}
      console.log(JSON.parse(response.output_text))
    } else {
      // Check if the response.output_text ends with one of your stop tokens and handle appropriately
    }
  }
} catch (e) {
  // Your code should handle errors here, for example a network error calling the API
  console.error(e)
}
```

```python
we_did_not_specify_stop_tokens = True

try:
    response = client.responses.create(
        model="gpt-3.5-turbo-0125",
        input=[
            {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
            {"role": "user", "content": "Who won the world series in 2020? Please respond in the format {winner: ...}"}
        ],
        text={"format": {"type": "json_object"}}
    )

    # Check if the conversation was too long for the context window, resulting in incomplete JSON 
    if response.status == "incomplete" and response.incomplete_details.reason == "max_output_tokens":
        # your code should handle this error case
        pass

    # Check if the OpenAI safety system refused the request and generated a refusal instead
    if response.output[0].content[0].type == "refusal":
        # your code should handle this error case
        # In this case, the .content field will contain the explanation (if any) that the model generated for why it is refusing
        print(response.output[0].content[0]["refusal"])

    # Check if the model's output included restricted content, so the generation of JSON was halted and may be partial
    if response.status == "incomplete" and response.incomplete_details.reason == "content_filter":
        # your code should handle this error case
        pass

    if response.status == "completed":
        # In this case the model has either successfully finished generating the JSON object according to your schema, or the model generated one of the tokens you provided as a "stop token"

        if we_did_not_specify_stop_tokens:
            # If you didn't specify any stop tokens, then the generation is complete and the content key will contain the serialized JSON object
            # This will parse successfully and should now contain  "{"winner": "Los Angeles Dodgers"}"
            print(response.output_text)
        else:
            # Check if the response.output_text ends with one of your stop tokens and handle appropriately
            pass
except Exception as e:
    # Your code should handle errors here, for example a network error calling the API
    print(e)
```

:::






## 资源

要了解更多关于 Structured Outputs 的信息，我们建议浏览以下资源：

*   查看我们关于 Structured Outputs 的[入门 cookbook]( https://cdn.openai.com/API/docs/cookbook/examples/structured_outputs_intro)
*   了解[如何使用 Structured Outputs 构建多代理系统]( https://cdn.openai.com/API/docs/cookbook/examples/structured_outputs_multi_agent)