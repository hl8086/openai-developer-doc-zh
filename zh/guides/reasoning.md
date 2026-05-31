
**推理模型**（如 [GPT-5.5](/models/gpt-5.5)）在生成响应之前会使用内部推理 token。这有助于模型进行规划、有效使用工具、检查替代方案、从歧义中恢复，以及解决更困难的多步骤任务。推理模型在复杂问题求解、编程、科学推理和多步骤智能体工作流方面表现尤为出色。它们也是 [Codex CLI](https://github.com/openai/codex)（我们的轻量级编程智能体）的最佳模型。

对于大多数推理工作负载，建议从 `gpt-5.5` 开始。如果您需要最高智能的 API 选项来处理更具挑战性的问题且可以容忍更多延迟，请使用 [`gpt-5.5-pro`](/models/gpt-5.5-pro)。如需更低成本，可考虑 `gpt-5.4`；如需更低成本和延迟，可考虑 `gpt-5.4-mini`。

**推理模型与 [Responses API](/guides/migrate-to-responses) 配合使用效果更好**。虽然 Chat Completions API 仍然受支持，但使用 Responses 可以获得更好的模型智能和性能。

## 开始使用推理模型

调用 [Responses API]( https://developers.openai.com/api/reference/responses/create) 并指定您的推理模型和推理力度：

**在 Responses API 中使用推理模型**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

::: code-group
```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ]
)

print(response.output_text)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": {"effort": "low"},
    "input": [
      {
        "role": "user",
        "content": "Write a bash script that takes a matrix represented as a string with format \"[1,2],[3,4],[5,6]\" and prints the transpose in the same format."
      }
    ]
  }'
```

:::

:::

## 推理力度

`reasoning.effort` 参数指导模型在执行任务时应该思考多少。

支持的值取决于模型，可能包括 `none`、`minimal`、`low`、`medium`、`high` 和 `xhigh`。较低的力度偏向速度和较少的 token 使用，而较高的力度下模型会更充分地思考以提供更高质量的响应。模型还会在不同推理力度下进行自适应推理，对简单任务使用更少的 token，对复杂任务进行更深入的思考。

默认值也取决于模型而非通用设置。`gpt-5.5` 默认使用 `medium` 推理力度。这是 `gpt-5.5` 在质量、可靠性和性能之间取得完整平衡的最佳起点。

| 力度 | 最适合… |
| --- | --- |
| `none` | 对延迟要求极高且不需要任何推理或多链工具调用的任务。对于使用 `gpt-5.5` 的延迟敏感用例，我们建议先尝试 `low`，如果需要再切换到 `none`。常见用例包括语音、快速信息检索和分类。 |
| `low` | 以适度延迟增加换取高效推理。适合需要工具使用、规划、搜索或多步决策的用例，同时优化速度和成本。常见用例包括数据分析、起草文档、面向执行的编程以及客户支持/聊天助手工作流。 |
| `medium` | 当质量和可靠性很重要，且任务涉及规划、复杂推理和判断时使用。这是大多数工作负载的默认配置，在延迟、性能和成本的帕累托曲线上是一个很好的平衡点。常见用例包括智能体编程、研究、处理电子表格和幻灯片，以及委派长期任务。 |
| `high` | 困难的推理、复杂的调试、深度规划以及质量和智能比延迟更重要的高价值任务。推荐用于复杂工作流和智能体任务。常见用例包括智能体编程、长期研究和知识工作。根据任务的复杂程度，可以同时评估 `medium` 和 `high`。 |
| `xhigh` | 深度研究、异步工作流和需要非常长执行过程的智能体任务。仅在您的评估显示明确收益且足以证明额外延迟和成本合理时使用。常见用例包括安全和代码审查、企业生产力、更深入的研究任务和具有挑战性的编程工作流。 |

对于延迟敏感的应用程序，为了更快地获得第一个可见 token，可以要求模型在继续深入推理之前先生成一个简短的前言。

某些模型仅支持这些值的子集，因此在选择设置之前请查看相关的[模型页面](/models)。

## 推理的工作原理

推理模型在输入和输出 token 之外引入了**推理 token**。模型使用这些推理 token 来"思考"，分解提示并考虑多种生成响应的方法。我们的推理模型（如 gpt-5.5 和 gpt-5.4）支持交错思考，即模型能够在思考之前和之间生成可见的输出 token，并且能够在工具调用之间进行思考。

以下是用户和助手之间多步对话的示例。每一步的输入和输出 token 会被保留，而推理 token 会被丢弃。

![推理 token 不会保留在上下文中](https://cdn.openai.com/API/docs/images/context-window.png)

虽然推理 token 通过 API 不可见，但它们仍然占用模型上下文窗口中的空间，并按[输出 token](https://openai.com/api/pricing) 计费。

### 管理上下文窗口

在创建响应时，确保上下文窗口中有足够的空间容纳推理 token 非常重要。根据问题的复杂程度，模型可能会生成从几百到数万个推理 token。使用的确切推理 token 数量可在[响应对象的 usage 对象]( https://developers.openai.com/api/reference/responses/object)中的 `output_tokens_details` 下查看：

```
{
  "usage": {
    "input_tokens": 75,
    "input_tokens_details": {
      "cached_tokens": 0
    },
    "output_tokens": 1186,
    "output_tokens_details": {
      "reasoning_tokens": 1024
    },
    "total_tokens": 1261
  }
}
```

上下文窗口长度可在[模型参考页面](/models)找到，不同模型快照之间会有所不同。

### 控制成本

要管理推理模型的成本，您可以使用 [`max_output_tokens`]( https://developers.openai.com/api/reference/responses/create#responses-create-max_output_tokens) 参数限制模型生成的总 token 数（包括推理和最终输出 token）。

### 为推理分配空间

如果生成的 token 达到上下文窗口限制或您设置的 `max_output_tokens` 值，您将收到一个 `status` 为 `incomplete` 的响应，其中 `incomplete_details` 的 `reason` 设置为 `max_output_tokens`。这可能在产生任何可见输出 token 之前发生，意味着您可能会为输入和推理 token 付费而没有收到可见响应。

为防止这种情况，请确保上下文窗口中有足够的空间，或将 `max_output_tokens` 值调整为更高的数字。OpenAI 建议在开始试验这些模型时，至少为推理和输出预留 25,000 个 token。当您熟悉提示所需的推理 token 数量后，可以相应调整此缓冲区。

**处理不完整的响应**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "medium" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
    max_output_tokens: 300,
});

if (
    response.status === "incomplete" &&
    response.incomplete_details.reason === "max_output_tokens"
) {
    console.log("Ran out of tokens");
    if (response.output_text?.length > 0) {
        console.log("Partial output:", response.output_text);
    } else {
        console.log("Ran out of tokens during reasoning");
    }
}
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "medium"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ],
    max_output_tokens=300,
)

if response.status == "incomplete" and response.incomplete_details.reason == "max_output_tokens":
    print("Ran out of tokens")
    if response.output_text:
        print("Partial output:", response.output_text)
    else: 
        print("Ran out of tokens during reasoning")
```

:::

### 在上下文中保留推理项

在 [Responses API]( https://developers.openai.com/api/reference/responses) 中使用推理模型进行[函数调用](/guides/function-calling)时，我们强烈建议您将上次函数调用返回的所有推理项（以及函数的输出）一起传回。如果模型连续调用多个函数，您应该传回自上一条 `user` 消息以来的所有推理项、函数调用项和函数调用输出项。这允许模型继续其推理过程，以最节省 token 的方式产生更好的结果。

最简单的方法是将前一个响应中的所有推理项传入下一个响应。我们的系统会智能地忽略与您的函数无关的推理项，只保留相关的推理项在上下文中。您可以通过 `previous_response_id` 参数传递前一个响应的推理项，或者手动将过去响应的所有[输出]( https://developers.openai.com/api/reference/responses/object#responses/object-output)项传入新响应的[输入]( https://developers.openai.com/api/reference/responses/create#responses-create-input)中。

对于可能需要截断和优化上下文窗口部分内容再传递给下一个响应的高级用例，只需确保最后一条用户消息和您的函数调用输出之间的所有项都原封不动地传入下一个响应。这将确保模型拥有所需的所有上下文。

查看[本指南](/guides/conversation-state)了解更多关于手动上下文管理的信息。

### 加密推理项

在无状态模式下使用 Responses API 时（`store` 设置为 `false`，或组织已注册零数据保留），您仍然必须使用上述技术在对话轮次之间保留推理项。但为了获得可以随后续 API 请求发送的推理项，您的每个 API 请求必须在 `include` 参数中包含 `reasoning.encrypted_content`，如下所示：

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": {"effort": "medium"},
    "input": "What is the weather like today?",
    "tools": [ ... function config here ... ],
    "include": [ "reasoning.encrypted_content" ]
  }'
```

`output` 数组中的任何推理项现在都将具有 `encrypted_content` 属性，其中包含加密的推理 token，可以随未来的对话轮次一起传递。

## 推理摘要

虽然我们不公开模型发出的原始推理 token，但您可以使用 `summary` 参数查看模型推理的摘要。请查看我们的[模型文档](/models)以了解哪些推理模型支持摘要。

不同模型支持不同的推理摘要设置。例如，我们的计算机使用模型支持 `concise` 摘要器，而 o4-mini 支持 `detailed`。要访问模型可用的最详细摘要器，请将此参数的值设置为 `auto`。对于当前大多数推理模型，`auto` 等同于 `detailed`，但未来可能会有更细粒度的设置。

推理摘要输出是 `reasoning` [输出项]( https://developers.openai.com/api/reference/responses/object#responses/object-output)中 `summary` 数组的一部分。除非您明确选择包含推理摘要，否则不会包含此输出。

以下示例展示了如何发出包含推理摘要的 API 请求。

**在 API 响应中包含推理摘要**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: "What is the capital of France?",
  reasoning: {
    effort: "low",
    summary: "auto",
  },
});

console.log(response.output);
```

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is the capital of France?",
    reasoning={
        "effort": "low",
        "summary": "auto"
    }
)

print(response.output)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "What is the capital of France?",
    "reasoning": {
        "effort": "low",
        "summary": "auto"
    }
  }'
```

:::

:::

此 API 请求将返回一个输出数组，其中包含助手消息和模型在生成该响应时的推理摘要。

```
[
  {
    "id": "rs_6876cf02e0bc8192b74af0fb64b715ff06fa2fcced15a5ac",
    "type": "reasoning",
    "summary": [
      {
        "type": "summary_text",
        "text": "**Answering a simple question**\n\nI'm looking at a straightforward question: the capital of France is Paris. It's a well-known fact, and I want to keep it brief and to the point. Paris is known for its history, art, and culture, so it might be nice to add just a hint of that charm. But mostly, I'll aim to focus on delivering a clear and direct answer, ensuring the user gets what they're looking for without any extra fluff."
      }
    ]
  },
  {
    "id": "msg_6876cf054f58819284ecc1058131305506fa2fcced15a5ac",
    "type": "message",
    "status": "completed",
    "content": [
      {
        "type": "output_text",
        "annotations": [],
        "logprobs": [],
        "text": "The capital of France is Paris."
      }
    ],
    "role": "assistant"
  }
]
```

在使用我们最新推理模型的摘要器之前，您可能需要完成[组织验证](https://help.openai.com/en/articles/10910291-api-organization-verification)以确保安全部署。在[平台设置页面](https://platform.openai.com/settings/organization/general)开始验证。

## `phase` 参数

对于在 Responses API 中使用 GPT-5.5 和 GPT-5.4 的长时间运行或工具密集型流程，使用助手消息的 `phase` 字段可以避免提前停止和其他异常行为。`phase` 在 API 层面是可选的，但 OpenAI 建议使用它。对于中间助手更新（如工具调用前的前言），使用 `phase: "commentary"`；对于完成的答案，使用 `phase: "final_answer"`。不要在用户消息中添加 `phase`。使用 `previous_response_id` 通常是最简单的方式，因为之前的助手状态会被保留。如果您手动重放助手历史记录，请保留每个原始的 `phase` 值。缺失或丢弃的 `phase` 可能导致前言在这些工作流中被视为最终答案。有关模型特定的提示指南，请参阅[提示 GPT-5.5](/guides/prompt-guidance?model=gpt-5.5#phase-parameter)。

### 往返传递助手 phase 值

**往返传递助手 phase 值**

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "assistant",
      phase: "commentary",
      content:
        "I'll inspect the logs and then summarize root cause and remediation.",
    },
    {
      role: "assistant",
      phase: "final_answer",
      content: "Root cause: cache invalidation race.",
    },
    {
      role: "user",
      content: "Great—now give me a rollout-safe fix plan.",
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
            "role": "assistant",
            "phase": "commentary",
            "content": "I'll inspect the logs and then summarize root cause and remediation.",
        },
        {
            "role": "assistant",
            "phase": "final_answer",
            "content": "Root cause: cache invalidation race.",
        },
        {
            "role": "user",
            "content": "Great—now give me a rollout-safe fix plan.",
        },
    ],
)

print(response.output_text)
```

:::

## 提示建议

在提示推理模型时需要考虑一些差异。具有推理能力的 GPT-5 模型通常在您给出明确目标、强约束和明确的输出契约而不规定每个中间步骤时效果最好。

*   给模型提供任务、约束和期望的输出格式。
*   将 `reasoning.effort` 视为调节旋钮，而不是恢复质量的主要方式。
*   对于智能体或研究密集型工作流，定义什么算作完成以及模型应如何验证其工作。

有关使用推理模型的最佳实践的更多信息，[请参阅本指南](/guides/reasoning-best-practices)。

### 提示示例

Coding (refactoring)Coding (planning)STEM Research

Coding (refactoring)

Coding (planning)

STEM Research

## 用例示例

一些使用推理模型处理实际用例的示例可以在 [cookbook](/cookbook) 中找到。

[使用推理进行数据验证 - 评估合成医疗数据集中的差异。](https://cookbook.openai.com/examples/o1/using_reasoning_for_data_validation)

[使用推理进行流程生成 - 使用帮助中心文章生成智能体可以执行的操作。](https://cookbook.openai.com/examples/o1/using_reasoning_for_routine_generation)
