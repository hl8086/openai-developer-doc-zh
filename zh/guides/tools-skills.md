
Agent Skills 允许你上传和复用版本化的文件包，适用于托管和本地 shell 环境。

我们支持两种形式的 Skills：本地执行和托管的基于容器的执行。要在你自己的机器上运行代码，请使用 [shell 工具](/guides/tools-shell) 的本地执行模式。

## 什么是 skill

Skill 是一个版本化的文件包，加上一个 `SKILL.md` 清单文件（front matter + 指令）。Skills 是模块化的指令，你可以用它来编纂流程和规范，从公司风格指南到多步骤工作流。

Skills 兼容开放的 [Agent Skills 标准](https://agentskills.io/home)。

SKILL.md 示例

```
---
name: basic-math
description: Add or multiply numbers.
---

Use this skill when you need a quick sum or product of numbers.
```

## 创建 skill

你可以将目录作为 multipart 表单数据上传，或上传一个包含单个顶层文件夹的 `.zip` 文件。

### 选项 1：目录上传（multipart）

上传多个 `files[]` 部分。每个部分包含单个顶层文件夹内的路径。

创建 skill（multipart）

```
curl -X POST 'https://api.openai.com/v1/skills' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files[]=@./basic_math/SKILL.md;filename=basic_math/SKILL.md;type=text/markdown' \
  -F 'files[]=@./basic_math/calculate.py;filename=basic_math/calculate.py;type=text/plain'
```

### 选项 2：Zip 上传

将顶层文件夹压缩为 zip 并上传该 zip 文件。

创建 skill（zip）

```
curl -X POST 'https://api.openai.com/v1/skills' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files=@./basic_math.zip;type=application/zip'
```

## 在托管 shell 中使用 skills

要在托管 shell 环境中挂载 skills，在调用 shell 工具时通过 `tools[].environment.skills` 附加它们。

**在托管 shell 中使用 skills**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_auto",
          "skills": [
            { "type": "skill_reference", "skill_id": "&lt;skill_id>" },
            { "type": "skill_reference", "skill_id": "&lt;skill_id>", "version": 2 }
          ]
        }
      }
    ],
    "input": "Use the skills to add 144 and 377, then compute triangle area with base 9 height 13."
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_auto",
        skills: [
          { type: "skill_reference", skill_id: "&lt;skill_id>" },
          { type: "skill_reference", skill_id: "&lt;skill_id>", version: 2 },
        ],
      },
    },
  ],
  input: "Use the skills to add 144 and 377, then compute triangle area with base 9 height 13.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_auto",
                "skills": [
                    {"type": "skill_reference", "skill_id": "&lt;skill_id>"},
                    {"type": "skill_reference", "skill_id": "&lt;skill_id>", "version": 2},
                ],
            },
        }
    ],
    input="Use the skills to add 144 and 377, then compute triangle area with base 9 height 13.",
)

print(response.output_text)
```text

### 提示行为

一旦 skill 被挂载，模型可以自行决定何时使用它。如果你想要更确定性的行为，请在适当时明确指示模型"使用 `&lt;skill name>` skill"。

## 在本地 shell 模式中使用 skills

Skills 也适用于本地 shell 模式，但本地 shell 和托管 shell 不接受相同的 skill 附加格式。

*   托管 shell 支持上传的 `skill_reference` 附件，包括精选 skills 和显式版本。
*   本地 shell 不支持 `skill_reference` 附件。相反，在你控制的运行时中从本地文件路径提供 skill 文件。

有关本地 shell 执行的详细信息，请参阅 [Shell 指南](/guides/tools-shell)。

**在本地 shell 模式中使用 skills**

```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "local",
          "skills": [
            {
              "name": "csv-insights",
              "description": "Summarize CSV files and produce a markdown report.",
              "path": "&lt;path-to-skill-folder>"
            }
          ]
        }
      }
    ],
    "input": "Use the csv-insights skill and run locally to summarize today'\''s CSV reports in this repo."
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "shell",
      environment: {
        type: "local",
        skills: [
          {
            name: "csv-insights",
            description: "Summarize CSV files and produce a markdown report.",
            path: "&lt;path-to-skill-folder>",
          },
        ],
      },
    },
  ],
  input: "Use the csv-insights skill and run locally to summarize today's CSV reports in this repo.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "local",
                "skills": [
                    {
                        "name": "csv-insights",
                        "description": "Summarize CSV files and produce a markdown report.",
                        "path": "&lt;path-to-skill-folder>",
                    }
                ],
            },
        }
    ],
    input="Use the csv-insights skill and run locally to summarize today's CSV reports in this repo.",
)

print(response.output_text)
```text

## 用户提示中的 Skills

当 skills 对工具可用时，平台会将每个 skill 的 `name`、`description` 和 `path` 添加到用户提示上下文中，以便模型知道该 skill 的存在。

模型根据此元数据决定是否调用 skill。如果模型调用了 skill，它会使用 `path` 从 `SKILL.md` 读取完整的 Markdown 指令。

Skill 指令是用户提示输入（不是系统提示输入），因此它们与其他用户提供的指令具有相同的优先级。如需显式控制，你仍然可以指示模型"使用 `&lt;skill name>` skill"。

## 限制和验证

*   `SKILL.md` 文件匹配不区分大小写。
*   一个 skill 包中只允许有一个 `skill.md`/`SKILL.md` 文件。
*   Skill front matter 验证遵循 [agent skills 规范](https://agentskills.io/specification#name-field)。
*   最大 zip 上传大小为 `50 MB`。
*   每个 skill 版本的最大文件数为 `500`。
*   最大未压缩文件大小为 `25 MB`。

## 网络访问安全

检查与 Responses API 一起使用的任何 Skill 非常重要。Skills 会引入安全风险，例如提示注入驱动的数据泄露。在使用此工具之前，请仔细阅读下面的[风险和安全](#risks-and-safety)部分。

## 版本管理

### 版本指针

*   当未提供版本时使用 `default_version`。
*   `latest_version` 跟踪最新上传。
*   `skill_reference.version` 接受整数或 `"latest"`。

### 创建新版本

创建新的 skill 版本

```

:::
curl -X POST 'https://api.openai.com/v1/skills/&lt;skill_id>/versions' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files=@./geometry.zip;type=application/zip'
```

### 设置默认版本

设置 skill 的默认版本

```
curl -X POST 'https://api.openai.com/v1/skills/&lt;skill_id>' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"default_version": 2}'
```

### 删除规则

*   你不能删除默认版本；需要先设置另一个默认版本。
*   删除最后一个剩余版本会删除该 skill。
*   删除 skill 会级联删除所有版本。

## 精选 skills

OpenAI 维护了一组第一方 skills，可以通过 id 引用（例如 `openai-spreadsheets`）。

引用精选 skill

```
{ "type": "skill_reference", "skill_id": "openai-spreadsheets", "version": "latest" }
```

## 内联 skills

如果你不想创建托管 skill，可以在环境的 `skills` 数组中内联一个 zip 包（base64）。

内联 skill 包

```
INLINE_ZIP=$(base64 -i ./basic_math.zip)

curl -L 'https://api.openai.com/v1/containers' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "name": "inline-skill-container",
    "skills": [
      {
        "type": "inline",
        "name": "basic_math",
        "description": "Add or multiply numbers.",
        "source": {
          "type": "base64",
          "media_type": "application/zip",
          "data": "'"$INLINE_ZIP"'"
        }
      }
    ]
  }'
```

## 风险和安全

检查与 Responses API 一起使用的任何 Skill 非常重要。Skills 会引入安全风险，例如提示注入驱动的数据泄露。

对于与网络访问结合使用的 Skills，请仔细阅读[网络的风险和安全部分](/guides/tools-shell#risks-and-safety)。

#### 将 Skills 视为特权代码和指令

Skill 内容可以影响规划、工具使用和命令执行。任何 Skill 在开发者验证之前都应被视为潜在的不可信输入。

### 不要向最终用户暴露开放的 Skills 仓库

避免让消费者最终用户可以自由浏览、选择或附加来自开放目录的任意 Skills 的产品设计。这会显著增加以下风险：

*   通过恶意 SKILL.md 指令进行提示注入和策略绕过。
*   由未经审查的自动化触发的数据泄露或破坏性操作。

#### 在开发者层面集成 Skills

Skills 应由开发者检查和集成，然后仅通过有限的产品体验暴露给最终用户。实践中：

*   将 Skills 映射到特定的产品工作流/用例。
*   防止最终用户控制任意 Skill 选择。
*   对写入或高影响操作设置显式审批和策略检查门槛。

#### 对敏感操作要求审批

对于可以执行写入或高影响操作的工作流，在执行前要求显式审批。

#### 验证数据驻留和保留要求

我们支持两种形式的 Skills：本地执行和托管的基于容器的执行。托管 skills 遵循与托管 shell 相同的容器生命周期：挂载的 skills 和容器文件在容器活跃期间保持可用，在容器过期或被删除时丢弃。如果你希望执行完全在你管理的基础设施上进行，请使用本地 shell 模式。阅读更多关于我们的[数据控制](/guides/your-data)。
