
要从 OpenAI API 平台中的 **Prompts** 迁移出来，请将提示内容从托管的 `prompt` 对象移到你的应用程序代码中。这让你能更好地控制审查、测试、部署和版本管理。

## 之前：使用 Prompt 对象

**使用 prompt 对象**

::: code-group
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  prompt: {
    prompt_id: "pmpt_123",
    version: "1",
    variables: {
      customer_name: "Acme",
      issue: "billing question",
    },
  },
});
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    prompt={
        "prompt_id": "pmpt_123",
        "version": "1",
        "variables": {
            "customer_name": "Acme",
            "issue": "billing question",
        },
    }
)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "prompt": {
      "prompt_id": "pmpt_123",
      "version": "1",
      "variables": {
        "customer_name": "Acme",
        "issue": "billing question"
      }
    }
  }'
```

:::





## 之后：在代码中内联提示

**在代码中内联提示**

::: code-group
```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.1",
  input: [
    {
      role: "system",
      content:
        "You are a helpful support assistant. Be concise, accurate, and friendly.",
    },
    {
      role: "user",
      content: `
Customer name: Acme
Issue: billing question

Write a response to the customer.
      `.trim(),
    },
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.1",
    input=[
        {
            "role": "system",
            "content": "You are a helpful support assistant. Be concise, accurate, and friendly.",
        },
        {
            "role": "user",
            "content": """
Customer name: Acme
Issue: billing question

Write a response to the customer.
            """.strip(),
        },
    ],
)

print(response.output_text)
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.1",
    "input": [
      {
        "role": "system",
        "content": "You are a helpful support assistant. Be concise, accurate, and friendly."
      },
      {
        "role": "user",
        "content": "Customer name: Acme\nIssue: billing question\n\nWrite a response to the customer."
      }
    ]
  }'
```

:::






## 使用 Codex 进行迁移

使用 [OpenAI Developers 插件](https://developers.openai.com/learn/developers-codex-plugin) 和 [OpenAI Docs skill](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs) 来自动化你的迁移并加速使用 OpenAI API 进行构建。

```
$openai-docs update this project to store prompts in code instead of using a prompts object
```

## 变更内容

不再从 API 请求中引用已保存的 prompt 对象，而是将提示文本存储在你的代码库中，并在 Responses API 调用中直接将生成的消息作为 `input` 传递。

*   **将提示内容移入源代码**，使提示的变更与产品逻辑经历相同的审查和发布流程。
*   **用函数参数替换提示变量**，使动态值在你的应用程序中是显式且有类型的。
*   **在 Responses API 调用中通过 `input` 传递消息**，而不是使用 `prompt` 对象。
*   **将版本管理移至你的代码仓库**，使用 git 提交、PR 审查以及测试或评估。
*   **将静态内容放在前面，动态内容放在后面**，以保留提示缓存的优势，因为缓存命中依赖于精确的前缀匹配。

## 示例

**使用辅助函数构建提示**

::: code-group
```javascript
import OpenAI from "openai";

const client = new OpenAI();

function buildSupportPrompt({ customerName, issue }) {
  return [
    {
      role: "system",
      content: `
You are a helpful support assistant.
Be concise, accurate, and friendly.
Do not invent policy details.
      `.trim(),
    },
    {
      role: "user",
      content: `
Customer name: ${customerName}
Issue: ${issue}

Write a response to the customer.
      `.trim(),
    },
  ];
}

const response = await client.responses.create({
  model: "gpt-5.1",
  input: buildSupportPrompt({
    customerName: "Acme",
    issue: "billing question",
  }),
});
```

```python
from openai import OpenAI

client = OpenAI()

def build_support_prompt(customer_name, issue):
    return [
        {
            "role": "system",
            "content": """
You are a helpful support assistant.
Be concise, accurate, and friendly.
Do not invent policy details.
            """.strip(),
        },
        {
            "role": "user",
            "content": f"""
Customer name: {customer_name}
Issue: {issue}

Write a response to the customer.
            """.strip(),
        },
    ]

response = client.responses.create(
    model="gpt-5.1",
    input=build_support_prompt(
        customer_name="Acme",
        issue="billing question",
    ),
)
```

:::


## 你将获得的好处

你将获得更紧密的工程控制：提示与产品代码共存，变更通过 PR 进行，测试和评估可以在 CI 中运行，发布或实验可以通过你自己的配置或功能标志来管理。

不要将提示分散内联在代码库各处。创建一个小型的 `prompts/` 模块，将每个提示作为命名的构建函数，并添加轻量级的评估固定数据，使提示变更像产品逻辑一样被审查。
