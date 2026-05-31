
Shell 工具赋予模型在完整终端环境中工作的能力。我们支持本地执行和通过 Responses API 进行托管执行的 shell。

Shell 工具允许模型通过以下方式运行命令：

*   由 OpenAI 管理的托管 shell 容器。
*   你自行托管和执行的[本地 shell 运行时](#local-shell-mode)。

Shell 通过 [Responses API](/guides/responses-vs-chat-completions) 提供。它不支持通过 Chat Completions API 使用。

运行任意 shell 命令可能存在危险。请始终对执行进行沙箱隔离，尽可能应用允许列表或拒绝列表，并记录工具活动以供审计。

## 托管 shell 快速入门

托管 shell 是一种原生且精简的选项，适用于需要更丰富、确定性处理的任务，从运行计算到处理多媒体。

当你希望 OpenAI 为请求配置和管理容器时，使用 `container_auto`。

**使用 container\_auto 的 Shell 工具**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      { "type": "shell", "environment": { "type": "container_auto" } }
    ],
    "input": [
      {
        "type": "message",
        "role": "user",
        "content": [
          { "type": "input_text", "text": "Execute: ls -lah /mnt/data && python --version && node --version" }
        ]
      }
    ],
    "tool_choice": "auto"
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [{ type: "shell", environment: { type: "container_auto" } }],
  input: [
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Execute: ls -lah /mnt/data && python --version && node --version",
        },
      ],
    },
  ],
  tool_choice: "auto",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{"type": "shell", "environment": {"type": "container_auto"}}],
    input=[
        {
            "type": "message",
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Execute: ls -lah /mnt/data && python --version && node --version",
                }
            ],
        }
    ],
    tool_choice="auto",
)

print(response.output_text)
```

:::




## 托管运行时详情

*   运行时当前基于 `Debian 12`，可能会随时间变化。
*   默认工作目录为 `/mnt/data`。
*   `/mnt/data` 始终存在，是用户可下载产物的支持路径。
*   托管 shell 不支持交互式 TTY 会话。
*   托管 shell 命令不以 `sudo` 运行。
*   当你的工作流需要时，可以在容器内运行服务。

当前预装的语言包括：

*   Python `3.11`
*   Node.js `22.16`
*   Java `17.0`
*   PHP `8.2`
*   Ruby `3.1`
*   Go `1.23`

## 跨请求复用容器

如果你需要一个长期运行的环境用于迭代工作流，可以创建一个容器，然后在后续的 Responses API 调用中引用它。

### 1\. 创建容器

**创建可复用容器**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/containers' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "name": "analysis-container",
    "memory_limit": "1g",
    "expires_after": { "anchor": "last_active_at", "minutes": 20 }
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const container = await client.containers.create({
  name: "analysis-container",
  memory_limit: "1g",
  expires_after: { anchor: "last_active_at", minutes: 20 },
});

console.log(container.id);
```

```python
from openai import OpenAI

client = OpenAI()

container = client.containers.create(
    name="analysis-container",
    memory_limit="1g",
    expires_after={"anchor": "last_active_at", "minutes": 20},
)

print(container.id)
```

:::




### 2\. 在 Responses 中引用容器

**使用 container\_reference 的 shell**

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
          "type": "container_reference",
          "container_id": "cntr_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe"
        }
      }
    ],
    "input": "List files in the container and show disk usage."
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
        type: "container_reference",
        container_id: "cntr_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
      },
    },
  ],
  input: "List files in the container and show disk usage.",
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
                "type": "container_reference",
                "container_id": "cntr_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
            },
        }
    ],
    input="List files in the container and show disk usage.",
)

print(response.output_text)
```

:::




## 附加技能

技能是可复用的、版本化的包，你可以将其挂载到托管 shell 环境中。这定义了可用的技能，在 shell 执行时模型决定是否调用它们。

使用[技能指南](/guides/tools-skills)了解上传和版本管理的详细信息。

**创建附加技能的容器**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/containers' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "name": "skill-container",
    "skills": [
      { "type": "skill_reference", "skill_id": "skill_4db6f1a2c9e73508b41f9da06e2c7b5f" },
      { "type": "skill_reference", "skill_id": "openai-spreadsheets", "version": "latest" }
    ]
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const container = await client.containers.create({
  name: "skill-container",
  skills: [
    { type: "skill_reference", skill_id: "skill_4db6f1a2c9e73508b41f9da06e2c7b5f" },
    { type: "skill_reference", skill_id: "openai-spreadsheets", version: "latest" },
  ],
});

console.log(container.id);
```

```python
from openai import OpenAI

client = OpenAI()

container = client.containers.create(
    name="skill-container",
    skills=[
        {"type": "skill_reference", "skill_id": "skill_4db6f1a2c9e73508b41f9da06e2c7b5f"},
        {"type": "skill_reference", "skill_id": "openai-spreadsheets", "version": "latest"},
    ],
)

print(container.id)
```

:::




## 网络访问

托管容器默认没有出站网络访问权限。

要启用它：

1.  管理员必须在仪表板中配置你的组织允许列表。
2.  你必须在请求中的容器环境上显式设置 `network_policy`。

**使用网络允许列表的 Shell 工具**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "tool_choice": "required",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_auto",
          "network_policy": {
            "type": "allowlist",
            "allowed_domains": ["pypi.org", "files.pythonhosted.org", "github.com"]
          }
        }
      }
    ],
    "input": [
      {
        "role": "user",
        "content": "In the container, pip install httpx beautifulsoup4, fetch release pages, and write /mnt/data/release_digest.md."
      }
    ]
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tool_choice: "required",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_auto",
        network_policy: {
          type: "allowlist",
          allowed_domains: ["pypi.org", "files.pythonhosted.org", "github.com"],
        },
      },
    },
  ],
  input: [
    {
      role: "user",
      content:
        "In the container, pip install httpx beautifulsoup4, fetch release pages, and write /mnt/data/release_digest.md.",
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
    tool_choice="required",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_auto",
                "network_policy": {
                    "type": "allowlist",
                    "allowed_domains": ["pypi.org", "files.pythonhosted.org", "github.com"],
                },
            },
        }
    ],
    input=[
        {
            "role": "user",
            "content": "In the container, pip install httpx beautifulsoup4, fetch release pages, and write /mnt/data/release_digest.md.",
        }
    ],
)

print(response.output_text)
```

:::




允许列表域名会引入安全风险，例如提示注入驱动的数据泄露。仅允许你信任的域名，且攻击者无法用来接收泄露数据的域名。在使用此工具之前，请仔细阅读下方的[风险与安全](#risks-and-safety)部分。

## 网络策略优先级

当存在多个控制时：

*   你的组织允许列表定义了 `allowed_domains` 的完整集合。
*   请求级别的 `network_policy` 进一步限制访问。
*   如果 `allowed_domains` 包含组织允许列表之外的域名，请求将失败。

## 数据保留和容器生命周期

托管 Shell 和 Code Interpreter 使用的托管容器可能会在容器活跃期间将临时应用状态写入容器文件系统（由临时块存储支持）。容器数据在容器过期或被显式删除时删除。

有关数据控制的更多详情，请参阅 [ZDR 和数据驻留](/guides/your-data)。

### 下载产物

托管 shell 可以生成可下载的文件。使用与 code interpreter 相同的容器/文件 API 来检索写入 `/mnt/data` 下的产物。

### 额外的数据控制

如果你希望在托管生命周期内保持内容和文件的临时性，可以在请求中内联文件并在容器中挂载内联技能。

**使用内联文件和内联技能**

::: code-group
```curl
INLINE_ZIP=$(base64 -i ./csv_insights.zip)
REPORT_CSV=$(base64 -i ./report.csv)

CONTAINER_ID=$(
  curl -sL 'https://api.openai.com/v1/containers' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "name": "inline-skill-container",
      "skills": [
        {
          "type": "inline",
          "name": "csv-insights",
          "description": "Summarize CSV files and produce a markdown report.",
          "source": {
            "type": "base64",
            "media_type": "application/zip",
            "data": "'"$INLINE_ZIP"'"
          }
        }
      ]
    }' | jq -r '.id'
)

curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_reference",
          "container_id": "'"$CONTAINER_ID"'"
        }
      }
    ],
    "input": [
      {
        "role": "user",
        "content": [
          {
            "type": "input_file",
            "filename": "report.csv",
            "file_data": "data:text/csv;base64,'"${REPORT_CSV}"'"
          },
          {
            "type": "input_text",
            "text": "Use the csv-insights skill to summarize report.csv."
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

const inlineZip = fs.readFileSync("csv_insights.zip").toString("base64");
const reportCsv = fs.readFileSync("report.csv").toString("base64");

const container = await client.containers.create({
  name: "inline-skill-container",
  skills: [
    {
      type: "inline",
      name: "csv-insights",
      description: "Summarize CSV files and produce a markdown report.",
      source: {
        type: "base64",
        media_type: "application/zip",
        data: inlineZip,
      },
    },
  ],
});

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_reference",
        container_id: container.id,
      },
    },
  ],
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_file",
          filename: "report.csv",
          file_data: `data:text/csv;base64,${reportCsv}`,
        },
        {
          type: "input_text",
          text: "Use the csv-insights skill to summarize report.csv.",
        },
      ],
    },
  ],
});

console.log(response.output_text);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

with open("csv_insights.zip", "rb") as f:
    inline_zip = base64.b64encode(f.read()).decode("utf-8")

with open("report.csv", "rb") as f:
    base64_string = base64.b64encode(f.read()).decode("utf-8")

container = client.containers.create(
    name="inline-skill-container",
    skills=[
        {
            "type": "inline",
            "name": "csv-insights",
            "description": "Summarize CSV files and produce a markdown report.",
            "source": {
                "type": "base64",
                "media_type": "application/zip",
                "data": inline_zip,
            },
        }
    ],
)

response = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_reference",
                "container_id": container.id,
            },
        }
    ],
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "filename": "report.csv",
                    "file_data": f"data:text/csv;base64,{base64_string}",
                },
                {
                    "type": "input_text",
                    "text": "Use the csv-insights skill to summarize report.csv.",
                },
            ],
        }
    ],
)

print(response.output_text)
```

:::




对于后续请求，使用 `container_reference` 传递相同的 `container_id`。挂载的技能和现有容器文件在容器活跃期间保持可用。

### 主动删除容器

你可以在工作完成后显式删除容器，而不是等待不活跃过期。

**删除容器**

::: code-group
```curl
curl -L -X DELETE 'https://api.openai.com/v1/containers/container_id' \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const deleted = await client.containers.delete("container_id");

console.log(deleted);
```

```python
from openai import OpenAI

client = OpenAI()

deleted = client.containers.delete("container_id")

print(deleted)
```

:::


## 域名密钥

当你的 `allowed_domains` 列表中的域名需要私有授权头（例如 `Authorization: Bearer `&lt;token>``）时，使用 `domain_secrets`。

每个密钥条目包括：

*   目标域名
*   友好的密钥名称
*   密钥值

运行时：

*   模型和运行时看到的是占位符名称（例如 `$API_KEY`），而不是原始凭据。
*   认证转换 sidecar 仅对已批准的目标应用原始密钥值。
*   原始密钥值不会持久化在 API 服务器上，也不会出现在模型可见的上下文中。

这使得助手可以调用受保护的服务，同时降低泄露风险。

**使用 domain\_secrets 的 Shell 工具**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {
        "role": "user",
        "content": "Use curl to call https://httpbin.org/headers with header Authorization: Bearer $API_KEY. Tell me what you see in the final text response."
      }
    ],
    "tool_choice": "required",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_auto",
          "network_policy": {
            "type": "allowlist",
            "allowed_domains": ["httpbin.org"],
            "domain_secrets": [
              {
                "domain": "httpbin.org",
                "name": "API_KEY",
                "value": "debug-secret-123"
              }
            ]
          }
        }
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
      content:
        "Use curl to call https://httpbin.org/headers with header Authorization: Bearer $API_KEY. Tell me what you see in the final text response.",
    },
  ],
  tool_choice: "required",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_auto",
        network_policy: {
          type: "allowlist",
          allowed_domains: ["httpbin.org"],
          domain_secrets: [
            {
              domain: "httpbin.org",
              name: "API_KEY",
              value: "debug-secret-123",
            },
          ],
        },
      },
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
            "content": "Use curl to call https://httpbin.org/headers with header Authorization: Bearer $API_KEY. Tell me what you see in the final text response.",
        }
    ],
    tool_choice="required",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_auto",
                "network_policy": {
                    "type": "allowlist",
                    "allowed_domains": ["httpbin.org"],
                    "domain_secrets": [
                        {
                            "domain": "httpbin.org",
                            "name": "API_KEY",
                            "value": "debug-secret-123",
                        }
                    ],
                },
            },
        }
    ],
)

print(response.output_text)
```

:::




## 多轮工作流

要在同一托管环境中继续工作，复用容器并传递 `previous_response_id`。

**继续 shell 工作流**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "previous_response_id": "resp_2a8e5c9174d63b0f18a4c572de9f64a1b3c76d508e12f9ab47",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_reference",
          "container_id": "cntr_f19c2b51e4a06793d82d54a7be0fc9154d3361ab28ce7f6041"
        }
      }
    ],
    "input": "Read /mnt/data/top5.csv and report the top candidate."
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  previous_response_id: "resp_2a8e5c9174d63b0f18a4c572de9f64a1b3c76d508e12f9ab47",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_reference",
        container_id: "cntr_f19c2b51e4a06793d82d54a7be0fc9154d3361ab28ce7f6041",
      },
    },
  ],
  input: "Read /mnt/data/top5.csv and report the top candidate.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    previous_response_id="resp_2a8e5c9174d63b0f18a4c572de9f64a1b3c76d508e12f9ab47",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_reference",
                "container_id": "cntr_f19c2b51e4a06793d82d54a7be0fc9154d3361ab28ce7f6041",
            },
        }
    ],
    input="Read /mnt/data/top5.csv and report the top candidate.",
)

print(response.output_text)
```

:::




## Responses 中的 Shell 输出

托管 shell 和本地 shell 使用相同的输出项类型。Shell 运行由成对的输出项表示：

*   `shell_call`：模型请求的命令。
*   `shell_call_output`：命令输出和退出结果。

shell\_call 项示例

```
{
  "type": "shell_call",
  "call_id": "call_9d14ac6f2b73485e91c0f4da6e1b27c8",
  "action": {
    "commands": ["ls -l"],
    "timeout_ms": 120000,
    "max_output_length": 4096
  },
  "status": "in_progress"
}
```

## 本地 shell 模式

你也可以通过执行 `shell_call` 动作并将 `shell_call_output` 发送回模型，在你自己的本地运行时中运行 shell 命令。

当你需要完全控制执行环境、文件系统访问或现有内部工具时，使用此模式。

**本地 shell 请求**

::: code-group
```curl
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "The local bash shell environment is on Mac.",
    "input": "find me the largest pdf file in ~/Documents",
    "tools": [{ "type": "shell", "environment": { "type": "local" } }]
  }'
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    instructions="The local bash shell environment is on Mac.",
    input="find me the largest pdf file in ~/Documents",
    tools=[{"type": "shell", "environment": {"type": "local"}}],
)

print(response)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    instructions: "The local bash shell environment is on Mac.",
    input: "find me the largest pdf file in ~/Documents",
    tools: [{ type: "shell", environment: { type: "local" } }],
});

console.log(response);
```

:::




当你收到 `shell_call` 输出项时：

*   在你的运行时中执行请求的命令。
*   捕获 `stdout`、`stderr` 和结果。
*   在下一个请求中将结果作为 `shell_call_output` 返回。

**本地 shell 执行器示例**

::: code-group
```python
@dataclass
class CmdResult:
    stdout: str
    stderr: str
    exit_code: int | None
    timed_out: bool

class ShellExecutor:
    def __init__(self, default_timeout: float = 60):
        self.default_timeout = default_timeout

    def run(self, cmd: str, timeout: float | None = None) -> CmdResult:
        t = timeout or self.default_timeout
        p = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            out, err = p.communicate(timeout=t)
            return CmdResult(out, err, p.returncode, False)
        except subprocess.TimeoutExpired:
            p.kill()
            out, err = p.communicate()
            return CmdResult(out, err, p.returncode, True)
```

```javascript
import { exec } from "node:child_process/promises";

class ShellExecutor {
    constructor(defaultTimeoutMs = 60_000) {
        this.defaultTimeoutMs = defaultTimeoutMs;
    }

    async run(cmd, timeoutMs) {
        const timeout = timeoutMs ?? this.defaultTimeoutMs;

        try {
            const { stdout, stderr } = await exec(cmd, { timeout });
            return { stdout, stderr, exitCode: 0, timedOut: false };
        } catch (error) {
            const timedOut = Boolean(error?.killed) && error?.signal === "SIGTERM";
            const exitCode = timedOut ? null : error?.code ?? null;
            return {
                stdout: error?.stdout ?? "",
                stderr: error?.stderr ?? String(error),
                exitCode,
                timedOut,
            };
        }
    }
}
```

:::




shell\_call\_output 载荷示例

```
{
  "type": "shell_call_output",
  "call_id": "call_3ef1b8c79a4d6520f9e3ab7d41c68f25",
  "max_output_length": 4096,
  "output": [
    {
      "stdout": "...",
      "stderr": "...",
      "outcome": {
        "type": "exit",
        "exit_code": 0
      }
    },
    {
      "stdout": "...",
      "stderr": "...",
      "outcome": {
        "type": "timeout"
      }
    }
  ]
}
```

有关旧版迁移详情，请参阅旧版[本地 shell 指南](/guides/tools-local-shell)。

## 在 Agents SDK 中使用本地 shell

如果你正在使用 [Agents SDK](/guides/tools#usage-in-the-agents-sdk)，可以将你自己的 shell 执行器实现传递给 shell 工具辅助函数。

**在 Agents SDK 中使用本地 shell**

```
import {
  Agent,
  run,
  withTrace,
  Shell,
  ShellAction,
  ShellResult,
  shellTool,
} from "@openai/agents";

class LocalShell implements Shell {
  async run(action: ShellAction): Promise&lt;ShellResult> {
    return {
      output: [
        {
          stdout: "Shell is not available. Needs to be implemented first.",
          stderr: "",
          outcome: {
            type: "exit",
            exitCode: 1,
          },
        },
      ],
      maxOutputLength: action.maxOutputLength,
    };
  }
}

const shell = new LocalShell();

const agent = new Agent({
  name: "Shell Assistant",
  model: "gpt-5.5",
  instructions:
    "You can execute shell commands to inspect the repository. Keep responses concise and include command output when helpful.",
  tools: [
    shellTool({
      shell,
      needsApproval: true,
      onApproval: async (_ctx, _approvalItem) => {
        return { approve: true };
      },
    }),
  ],
});

await withTrace("shell-tool-example", async () => {
  const result = await run(agent, "Show the Node.js version.");
  console.log(`\nFinal response:\n${result.finalOutput}`);
});
```

```python
from agents import (
    Agent,
    Runner,
    ShellCallOutcome,
    ShellCommandOutput,
    ShellCommandRequest,
    ShellResult,
    ShellTool,
)


class LocalShell:
    async def __call__(self, request: ShellCommandRequest) -> ShellResult:
        action = request.data.action
        return ShellResult(
            output=[
                ShellCommandOutput(
                    command="(not executed)",
                    stdout="Shell is not available. Needs to be implemented first.",
                    stderr="",
                    outcome=ShellCallOutcome(type="exit", exit_code=1),
                )
            ],
            max_output_length=action.max_output_length,
        )


shell_tool = ShellTool(
    executor=LocalShell(),
    needs_approval=True,
    on_approval=lambda _ctx, _approval_item: {"approve": True},
)

agent = Agent(
    name="Shell Assistant",
    model="gpt-5.5",
    instructions="You can execute shell commands to inspect the repository. Keep responses concise and include command output when helpful.",
    tools=[shell_tool],
)


async def main():
    result = await Runner.run(agent, input="Show the Node.js version.")
    print(f"\nFinal response:\n{result.final_output}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```



你可以在 SDK 仓库中找到可运行的示例。

[Shell tool example - TypeScript - Agents SDK 中 shell 工具的 TypeScript 示例。](https://github.com/openai/openai-agents-js/blob/main/examples/tools/shell.ts)

[Shell tool example - Python - Agents SDK 中 shell 工具的 Python 示例。](https://github.com/openai/openai-agents-python/blob/main/examples/tools/shell.py)

## 处理常见错误

*   如果命令超过你的执行超时时间，返回超时结果并包含部分捕获的输出。
*   如果 `shell_call` 上存在 `max_output_length`，将其包含在 `shell_call_output` 中。
*   不要依赖交互式命令；shell 工具执行应该是非交互式的。
*   保留非零退出输出，以便模型可以推理恢复步骤。

## 风险与安全

在 Containers API 中启用网络访问是一项强大的功能，它引入了有意义的安全和数据治理风险。默认情况下，网络访问未启用。启用后，出站访问应严格限定在任务所需的受信任域名范围内。

启用网络的容器可以与第三方服务和包注册表交互。这会产生包括数据泄露、提示注入驱动的工具滥用以及超出预期边界的意外访问等风险。当策略宽泛、静态或执行不一致时，这些风险会增加。

#### 了解网络检索内容的提示注入风险

通过网络获取的任何外部内容都可能包含旨在操纵模型行为的隐藏指令。将不受信任的网络内容视为潜在的对抗性内容，对于可以修改数据或系统的操作需要额外谨慎。

#### 仅连接受信任的目标

仅允许你信任并积极维护的域名。对代理到其他服务的中介和聚合器保持谨慎，在将它们添加到允许域名列表之前，请审查其数据处理和保留实践。

#### 在请求执行前后进行审查

审查 shell 工具命令和执行输出，这些在 Responses API 响应中提供。捕获每个会话请求的主机和实际出站目标。定期审查日志以验证访问模式是否符合预期、检测偏差并识别可疑行为。

#### 验证数据驻留和保留要求

[OpenAI 数据控制](/guides/your-data)适用于 OpenAI 边界内。但是，通过网络连接传输到第三方服务的数据受其数据保留策略约束。确保外部端点满足你的驻留、保留和合规要求。
