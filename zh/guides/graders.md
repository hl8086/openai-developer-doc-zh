<!-- Source: https://developers.openai.com/api/docs/guides/graders -->

评分器是一种根据参考答案评估模型性能的方式。我们的[评分器 API](/api/docs/api-reference/graders)可以用来测试你的评分器、实验结果，并改进你的微调或评估框架以获得你想要的结果。

## 概述

评分器让你将参考答案与对应的模型生成答案进行比较，并返回 0 到 1 范围内的分数。有时给模型部分分数比简单的 0 或 1 二元评分更有帮助。

评分器以 JSON 格式指定，有以下几种类型：

*   [字符串检查](#string-check-graders)
*   [文本相似度](#text-similarity-graders)
*   [评分模型评分器](#score-model-graders)
*   [Python 代码执行](#python-graders)

在强化微调中，你可以使用[多评分器](#multigraders)来嵌套和组合评分器。

使用本指南了解每种评分器类型并查看入门示例。要构建评分器并开始强化微调，请参阅 [RFT 指南](/api/docs/guides/reinforcement-fine-tuning)。或者要开始使用评估，请参阅[评估指南](/api/docs/guides/evals)。

## 模板语法

某些评分器的输入使用模板语法，以便用相同的配置对多个示例进行评分。任何包含 `{{ }}` 双花括号的字符串都会被替换为变量值。

`{{}}` 内的每个输入必须包含一个_命名空间_和一个_变量_，格式为 `{{ namespace.variable }}`。唯一支持的命名空间是 `item` 和 `sample`。

所有嵌套变量都可以使用类似 JSON 路径的语法访问。

### Item 命名空间

item 命名空间将由评估的输入数据源中的变量填充，微调时则由每个数据集项填充。例如，如果一行包含以下内容

```
{
  "reference_answer": "..."
}
```

这可以在评分器中使用 `{{ item.reference_answer }}` 来引用。

### Sample 命名空间

sample 命名空间将由评估期间的模型采样步骤或微调步骤中的变量填充。包含以下变量：

*   `output_text`，模型输出内容的字符串形式。
*   `output_json`，模型输出内容的 JSON 对象形式，仅在 sample 中包含 `response_format` 时可用。
*   `output_tools`，模型输出的 `tool_calls`，其结构与 [chat completions API](/api/docs/api-reference/chat/object) 中的输出工具调用相同。
*   `choices`，输出选项，其结构与 [chat completions API](/api/docs/api-reference/chat/object) 中的输出选项相同。
*   `output_audio`，模型音频输出对象，包含 Base64 编码的 `data` 和 `transcript`。

例如，要以字符串形式访问模型输出内容，可以在评分器中使用 `{{ sample.output_text }}`。

工具调用评分详情

当训练模型以改进工具调用行为时，你需要编写评分器来操作 `sample.output_tools` 变量。该变量的内容与 `response.choices[0].message.tool_calls` 的内容相同（[参见函数调用文档](/api/docs/guides/function-calling?api-mode=chat)）。

评分工具调用的常见方式是使用两个评分器，一个检查被调用工具的名称，另一个检查被调用函数的参数。下面展示了一个这样做的评分器示例：

```
{
  "type": "multi",
  "graders": {
    "function_name": {
      "name": "function_name",
      "type": "string_check",
      "input": "get_acceptors",
      "reference": "{{sample.output_tools[0].function.name}}",
      "operation": "eq"
    },
    "arguments": {
      "name": "arguments",
      "type": "string_check",
      "input": "{\"smiles\": \"{{item.smiles}}\"}",
      "reference": "{{sample.output_tools[0].function.arguments}}",
      "operation": "eq"
    }
  },
  "calculate_output": "0.5 * function_name + 0.5 * arguments"
}
```

这是一个 `multi` 评分器，组合了两个简单的 `string_check` 评分器，第一个通过 `sample.output_tools[0].function.name` 变量检查被调用工具的名称，第二个通过 `sample.output_tools[0].function.arguments` 变量检查被调用函数的参数。`calculate_output` 字段用于将两个分数合并为一个分数。

`arguments` 评分器容易在函数参数有细微错误时对模型奖励不足，例如提交了 `1` 而不是浮点数 `1.0`，或者州名使用了缩写而不是全称。为避免这种情况，你可以使用 `text_similarity` 评分器代替 `string_check` 评分器，或使用 `score_model` 评分器让 LLM 检查语义相似性。

## 字符串检查评分器

使用这些简单的字符串操作返回 0 或 1。字符串检查评分器适合对简单的通过或失败答案进行评分——例如，正确的城市名称、是或否的回答，或包含或以正确信息开头的答案。

```
{
    "type": "string_check",
    "name": string,
    "operation": "eq" | "ne" | "like" | "ilike",
    "input": string,
    "reference": string,
}
```

字符串检查评分器支持的操作有：

*   `eq`：如果输入与参考匹配（区分大小写），返回 1，否则返回 0
*   `neq`：如果输入与参考不匹配（区分大小写），返回 1，否则返回 0
*   `like`：如果输入包含参考（区分大小写），返回 1，否则返回 0
*   `ilike`：如果输入包含参考（不区分大小写），返回 1，否则返回 0

## 文本相似度评分器

当需要评估模型生成的输出与参考答案的接近程度时，使用文本相似度评分器，通过各种评估框架进行评分。

这对于开放式文本回答很有用。例如，如果你的数据集包含专家以段落形式提供的参考答案，查看模型生成的答案与该内容的数值接近程度会很有帮助。

```
{
    "type": "text_similarity",
    "name": string,
    "input": string,
    "reference": string,
    "pass_threshold": number,
    "evaluation_metric": "fuzzy_match" | "bleu" | "gleu" | "meteor" | "cosine" | "rouge_1" | "rouge_2" | "rouge_3" | "rouge_4" | "rouge_5" | "rouge_l"
}
```

`string-similarity-grader` 支持的操作有：

*   `fuzzy_match`：使用 `rapidfuzz` 进行输入和参考之间的模糊字符串匹配
*   `bleu`：计算输入和参考之间的 BLEU 分数
*   `gleu`：计算输入和参考之间的 Google BLEU 分数
*   `meteor`：计算输入和参考之间的 METEOR 分数
*   `cosine`：使用 `text-embedding-3-large` 计算嵌入后的输入和参考之间的余弦相似度。仅适用于评估。
*   `rouge-*`：计算输入和参考之间的 ROUGE 分数

## 模型评分器

一般来说，使用模型评分器意味着提示一个单独的模型来对你正在微调的模型的输出进行评分。你的两个模型协同工作来进行强化微调。_评分模型_评估_训练模型_。

### 评分模型评分器

评分模型评分器将接收输入并根据提示在给定范围内返回一个数值分数。

```
{
    "type": "score_model",
    "name": string,
    "input": Message[],
    "model": string,
    "pass_threshold": number,
    "range": number[],
    "sampling_params": {
        "seed": number,
        "top_p": number,
        "temperature": number,
        "max_completions_tokens": number,
        "reasoning_effort": "minimal" | "low" | "medium" | "high"
    }
}
```

其中每条消息的格式如下：

```
{
    "role": "system" | "developer" | "user" | "assistant",
    "content": str
}
```

要使用评分模型评分器，输入是一个聊天消息列表，每条消息包含 `role` 和 `content`。评分器的输出将被截断到给定的 `range`，对于所有非数值输出默认为 0。在每条消息中，可以使用与其他常见评分器相同的模板语法来引用真实答案或模型样本。

以下是一个完整的可运行代码示例：

```
import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}

# define a dummy grader for illustration purposes
grader = {
   "type": "score_model",
   "name": "my_score_model",
   "input": [
        {
            "role": "system",
            "content": "You are an expert grader. If the reference and model answer are exact matches, output a score of 1. If they are somewhat similar in meaning, output a score in 0.5. Otherwise, give a score of 0."
        },
        {
            "role": "user",
            "content": "Reference: {{ item.reference_answer }}. Model answer: {{ sample.output_text }}"
        }
   ],
   "pass_threshold": 0.5,
   "model": "o4-mini-2025-04-16",
   "range": [0, 1],
   "sampling_params": {
       "max_completions_tokens": 32768,
       "top_p": 1,
       "reasoning_effort": "medium"
   },
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": 1.0
  },
  "model_sample": "0.9"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run response:", response.text)
```

#### 评分模型评分器输出

在底层，`score_model` 评分器将使用提供的提示和采样参数查询请求的模型，并以特定的响应格式请求响应。使用的响应格式如下：

```
{
  "result": float,
  "steps": ReasoningStep[],
}
```

其中每个推理步骤的格式为：

```
{
    description: string,
    conclusion: string
}
```

此格式不仅查询模型的数值 `result`（查询的奖励值），还为模型提供了一些空间来思考分数背后的推理过程。当你编写评分器提示时，明确引用这两个字段的名称可能会很有用（例如，"在推理步骤的结论中包含关于分子中化学键类型的推理"，或"如果输入不满足条件 X，则在 `result` 字段中返回 -1.0 的值"）。

### 模型评分器约束

*   `model` 参数仅支持以下模型：
    *   `gpt-4o-2024-08-06`
    *   `gpt-4o-mini-2024-07-18`
    *   `gpt-4.1-2025-04-14`
    *   `gpt-4.1-mini-2025-04-14`
    *   `gpt-4.1-nano-2025-04-14`
    *   `o1-2024-12-17`
    *   `o3-mini-2025-01-31`
    *   `o3-2025-04-16`
    *   `o4-mini-2025-04-16`
*   推理模型不支持 `temperature` 更改。
*   非推理模型不支持 `reasoning_effort`。

### 如何编写评分器提示

编写评分器提示是一个迭代过程。迭代模型评分器提示的最佳方式是创建一个模型评分器评估。为此，你需要：

1.  **任务提示**：为所需任务编写极其详细的提示，包含逐步说明和许多具体的上下文示例。
2.  **由模型或人类专家生成的答案**：提供许多高质量的答案示例，包括来自模型和可信人类专家的答案。
3.  **这些答案对应的真实评分**：确定好的评分是什么样的。例如，你的人类专家评分应该是 1。

然后你可以自动评估模型评分器区分不同质量水平答案的有效性。随着时间的推移，当你发现边缘情况并通过更改提示来修补它们时，将这些边缘情况添加到你的模型评分器评估中。

例如，假设你从人类专家那里知道哪些答案最好：

```
answer_1 > answer_2 > answer_3
```

验证模型评分器的答案是否匹配：

```
model_grader(answer_1, reference_answer) > model_grader(answer_2, reference_answer) > model_grader(answer_3, reference_answer)
```

### 评分器作弊

正在训练的模型有时会学会利用模型评分器的弱点，这也被称为"评分器作弊"或"奖励作弊"。你可以通过检查模型在模型评分器评估和专家人工评估中的表现来检测这种情况。作弊了评分器的模型在模型评分器评估中得分很高，但在专家人工评估中得分很低。随着时间的推移，我们打算改进 API 中的可观测性，使其在训练期间更容易检测到这种情况。

## Python 评分器

此评分器允许你执行任意 Python 代码来对模型输出进行评分。评分器期望存在一个 grade 函数，该函数接受两个参数并输出一个浮点值。任何其他结果（异常、无效浮点值等）将被标记为无效并返回 0 分。

```
{
  "type": "python",
  "source": "def grade(sample, item):\n    return 1.0",
  "image_tag": "2025-05-08"
}
```

Python 源代码必须包含一个 grade 函数，该函数恰好接受两个参数并返回一个浮点值作为评分。

```
from typing import Any

def grade(sample: dict[str, Any], item: dict[str, Any]) -> float:
    # your logic here
    return 1.0
```

提供给评分函数的第一个参数是一个字典，其中填充了训练期间模型的输出供你评分。`output_json` 仅在输出使用 `response_format` 时才会被填充。

```
{
    "choices": [...],
    "output_text": "...",
    "output_json": {},
    "output_tools": [...],
    "output_audio": {}
}
```

提供的第二个参数是一个字典，其中填充了输入评分上下文。对于评估，这将包含来自数据源的键。对于微调，这将包含来自每个训练数据行的键。

```
{
    "reference_answer": "...",
    "my_key": {...}
}
```

以下是一个可运行的示例：

```
import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}

grading_function = """
from rapidfuzz import fuzz, utils

def grade(sample, item) -> float:
    output_text = sample["output_text"]
    reference_answer = item["reference_answer"]
    return fuzz.WRatio(output_text, reference_answer, processor=utils.default_process) / 100.0
"""

# define a dummy grader for illustration purposes
grader = {
    "type": "python",
    "source": grading_function
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate request_id:", response.headers["x-request-id"])
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": "fuzzy wuzzy had no hair"
  },
  "model_sample": "fuzzy wuzzy was a bear"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run request_id:", response.headers["x-request-id"])
print("run response:", response.text)
```

**提示：** 如果你不想手动将评分函数放入字符串中，也可以使用 `importlib` 和 `inspect` 从 Python 文件加载它。例如，如果你的评分函数在名为 `grader.py` 的文件中，你可以这样做：

```
import importlib
import inspect

grader_module = importlib.import_module("grader")
grader = {
    "type": "python",
    "source": inspect.getsource(grader_module)
}
```

这将自动使用你的 `grader.py` 文件的全部源代码作为评分器，这对于较长的评分器很有帮助。

### 技术约束

*   你上传的代码必须小于 `256kB`，且不会有网络访问权限。
*   评分执行本身限制为 2 分钟。
*   运行时你将获得 2Gb 内存和 1Gb 磁盘空间的限制。
*   CPU 核心限制为 2 个——超过此数量的使用将导致限流。

以下第三方包在镜像标签 `2025-05-08` 的执行时可用：

```
numpy==2.2.4
scipy==1.15.2
sympy==1.13.3
pandas==2.2.3
rapidfuzz==3.10.1
scikit-learn==1.6.1
rouge-score==0.1.2
deepdiff==8.4.2
jsonschema==4.23.0
pydantic==2.10.6
pyyaml==6.0.2
nltk==3.9.1
sqlparse==0.5.3
rdkit==2024.9.6
scikit-bio==0.6.3
ast-grep-py==0.36.2
```

此外，以下 nltk 语料库可用：

```
punkt
stopwords
wordnet
omw-1.4
names
```

## 多评分器

> 目前，此评分器仅用于强化微调

`multigrader` 对象将多个评分器的输出组合以产生单一分数。多评分器通过计算其他评分器对象字段上的评分，并将这些子评分转化为总体评分来工作。当正确答案取决于多个条件同时为真时，这很有用——例如，文本相似_且_答案包含特定字符串。

举个例子，假设你希望模型输出包含以下两个字段的 JSON：

```
{
  "name": "John Doe",
  "email": "john.doe@gmail.com"
}
```

你希望评分器比较这两个字段，然后取它们的平均值。

你可以通过将多个评分器组合成一个对象评分器，然后定义一个公式来根据每个字段计算输出分数来实现：

```
{
  "type": "multi",
  "graders": {
    "name": {
      "name": "name_grader",
      "type": "text_similarity",
      "input": "{{sample.output_json.name}}",
      "reference": "{{item.name}}",
      "evaluation_metric": "fuzzy_match",
      "pass_threshold": 0.9
    },
    "email": {
      "name": "email_grader",
      "type": "string_check",
      "input": "{{sample.output_json.email}}",
      "reference": "{{item.email}}",
      "operation": "eq"
    }
  },
  "calculate_output": "(name + email) / 2"
}
```

在这个例子中，模型准确获取电子邮件很重要（`string_check` 返回 0 或 1），但我们容忍名称上的一些拼写错误（`text_similarity` 返回 0 到 1 的范围）。电子邮件错误的样本得分在 0-0.5 之间，电子邮件正确的样本得分在 0.5-1.0 之间。

你不能创建内部嵌套多评分器的多评分器。

calculate output 字段将以输入 `graders` 的键作为可用变量，并支持以下功能：

**运算符**

*   `+`（加法）
*   `-`（减法）
*   `*`（乘法）
*   `/`（除法）
*   `^`（幂）

**函数**

*   `min`
*   `max`
*   `abs`
*   `floor`
*   `ceil`
*   `exp`
*   `sqrt`
*   `log`

## 限制和提示

设计和创建评分器是一个迭代过程。从小处开始，进行实验，并持续进行更改以获得更好的结果。

### 设计提示

为了从评分器中获得最大价值，请使用以下设计原则：

*   **产生平滑的分数，而不是通过/失败的标记**。随着答案改善而逐渐变化的分数有助于优化器看到哪些变化重要。
*   **防范奖励作弊**。当模型找到一种无需真正技能就能获得高分的捷径时，就会发生这种情况。让你的评分系统难以被钻空子。
*   **避免数据偏斜**。某个标签出现频率最高的数据集会诱使模型猜测该标签。平衡数据集或增加稀有情况的权重，使模型必须思考。
*   **当代码不够用时使用 LLM 作为评判者**。对于丰富的开放式答案，让另一个语言模型来评分。构建 LLM 评分器时，通过你的 LLM 评判者运行多个候选响应和真实答案，以确保评分稳定且与偏好一致。在提示中提供优秀、一般和差的答案的少样本示例。
