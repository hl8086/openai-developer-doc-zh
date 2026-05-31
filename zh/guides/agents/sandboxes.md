# Sandbox agents

> Run agents in isolated sandbox environments.

沙盒为 agent 提供了一个隔离的、类 Unix 的执行环境，包含文件系统、shell、已安装的包、挂载的数据、暴露的端口、快照以及对外部系统的受控访问。

当模型需要这类工作空间但只能接收提示上下文时，agent 工作流会变得脆弱。大型文档集、生成的产物、命令、预览和可恢复的工作都需要一个 agent 可以检查和修改的环境。

沙盒 agent 在 TypeScript 和 Python Agents SDK 中可用。它们目前处于 beta 阶段，因此 API 细节、默认值和支持的功能可能会发生变化。

当 agent 需要操作文件、运行命令、挂载数据室、生成产物、暴露服务或稍后继续有状态的工作时，请使用沙盒。

关键的划分在于控制层（harness）和计算层（compute）之间的边界。控制层是模型周围的控制平面：它负责 agent 循环、模型调用、工具路由、交接、审批、追踪、恢复和运行状态。计算层是沙盒执行平面，模型指导的工作在其中读写文件、运行命令、安装依赖、使用挂载的存储、暴露端口和快照状态。

保持这些边界分离可以让你的应用程序将敏感的控制平面工作保留在受信任的基础设施中，而沙盒专注于特定提供商的执行。沙盒可以使用窄权限凭证和挂载对文件运行代码；控制层可以将认证、计费、审计日志、人工审核和恢复状态保留在任何单个容器之外。

![Diagram showing an agent harness running inside sandbox compute with filesystem access and gateway-mediated access to data, APIs, and the web.]( https://cdn.openai.com/API/docs/images/api/agents/harness_with_compute.png)


在沙盒内运行控制层对于原型开发来说很方便，但它将编排和模型指导的执行放在了同一个计算边界内。

![Diagram showing an agent harness separate from sandbox compute, where the harness accesses trusted services and the sandbox executes commands against a filesystem.]( https://cdn.openai.com/API/docs/images/api/agents/harness_separate_from_compute.png)


控制层可以在你的基础设施中运行，而沙盒处理特定提供商的有状态执行。

## 何时使用沙盒

当 agent 的答案依赖于在沙盒工作空间中完成的工作，而不仅仅是对提示上下文的推理时，请使用沙盒。

常见的痛点包括：

*   任务需要一个文档目录，而不是单个提示。
*   agent 应该写入文件，以便你的应用程序稍后可以检查。
*   agent 需要命令、包或脚本来完成工作。
*   工作流产生产物，如 Markdown、CSV、JSONL、截图或生成的网站。
*   服务、笔记本或报告预览需要在暴露的端口上运行。
*   工作暂停等待人工审核，然后在同一工作空间中恢复。

如果你的工作流只需要简短的模型响应且不需要持久化工作空间，请直接调用 [Responses API]( https://developers.openai.com/api/reference/responses/overview) 或使用不带沙盒的基本 Agents SDK 运行时。

如果 shell 访问只是偶尔使用的工具，请从 [Using tools](/guides/tools#usage-in-the-agents-sdk) 中的托管 shell 工具开始。当工作空间隔离、沙盒提供商选择或可恢复的文件系统状态是产品设计的一部分时，请使用沙盒 agent。

## 沙盒增加了什么

`SandboxAgent` 仍然是一个 `Agent`。它保留了通常的 agent 接口，包括 `instructions`、`prompt`、`tools`、`handoffs`、MCP 服务器、模型设置、结构化输出、护栏和钩子。改变的是执行边界：运行器针对一个拥有文件、命令、端口和特定提供商隔离的实时沙盒会话来准备 agent。

| 组件 | 负责什么 | 设计问题 |
| --- | --- | --- |
| `SandboxAgent` | agent 定义加上沙盒默认值 | 这个 agent 应该做什么，哪些沙盒默认值随它一起传递？ |
| `Manifest` | 新会话的工作空间契约 | 工作空间中应该有哪些文件、目录、仓库、挂载、环境变量、用户或组？ |
| Capabilities | 附加到 agent 的沙盒原生行为 | 这个 agent 需要哪些沙盒工具、指令或运行时行为？ |
| Sandbox client | 提供商集成 | 实时工作空间应该在哪里运行：Unix 本地、Docker 还是托管提供商？ |
| Sandbox session | 实时执行环境 | 命令在哪里运行、文件在哪里更改、端口在哪里打开、提供商状态在哪里存在？ |
| Sandbox run config | 每次运行的沙盒会话来源、客户端选项和新输入 | 这次运行应该注入、恢复还是创建沙盒会话？ |
| Saved state | `RunState`、序列化的会话状态和快照 | 后续运行应该如何重新连接到工作或为新工作空间提供种子？ |

沙盒特定的默认值属于 `SandboxAgent`。每次运行的沙盒会话选择属于运行的沙盒配置。

沙盒 agent 也不会改变"轮次"的含义。一个轮次仍然是一个模型步骤，而不是单个 shell 命令或沙盒操作。某些工作可能停留在沙盒执行层内。agent 运行时只有在沙盒工作完成后需要另一个模型响应时才会消耗另一个轮次。

## 创建工作空间

`Manifest` 描述了新沙盒工作空间所需的起始内容和布局。用它来设置 agent 应该看到的文件、仓库、输入产物、辅助文件、挂载、输出目录和环境配置。

将清单视为新会话契约，而不是每个实时沙盒的完整真实来源。运行的有效工作空间可以来自重用的实时沙盒会话、序列化的沙盒会话状态或在运行时选择的快照。

清单条目路径是相对于工作空间的。它们不能是绝对路径或使用 `..` 逃出工作空间，这使得工作空间契约在本地、Docker 和托管客户端之间可移植。

| 清单输入 | 用途 |
| --- | --- |
| `File`, `Dir` | 小型合成输入、辅助文件或输出目录。 |
| 本地文件或目录 | 要物化到沙盒中的主机文件或目录。 |
| Git 仓库 | 要获取到工作空间中的仓库。 |
| `S3Mount`, `GCSMount`, `R2Mount`, `AzureBlobMount`, `BoxMount`, `S3FilesMount` | 在沙盒内可用的外部存储。 |
| `environment` | 沙盒启动时需要的环境变量。 |
| `users` 和 `groups` | 支持账户配置的提供商的沙盒本地 OS 账户和组。 |

良好的清单设计意味着：

*   将仓库、输入产物和输出目录放在清单中。
*   将较长的任务规范和仓库本地指令放在工作空间文件中，如 `repo/task.md` 或 `AGENTS.md`。
*   在指令中使用相对工作空间路径，例如 `repo/task.md` 或 `output/report.md`。
*   将挂载的存储范围限制在 agent 应该读取或写入的输入。
*   将挂载条目视为临时工作空间条目：快照和持久化流程会跳过挂载的远程存储，而不是将其复制到保存的工作空间内容中。

### 挂载文件和存储

有用的数据通常已经存在于其他地方。与其将大型文档粘贴到上下文中，不如将它们挂载到沙盒中，让 agent 处理文件。

示例：

*   挂载尽职调查数据室，要求 agent 生成带引用的摘要。
*   挂载支持导出数据，要求 agent 将问题聚类为报告。
*   挂载生成的产物，以便另一个系统可以审核它们。

提供商集成暴露了各自的挂载辅助工具、凭证处理和持久化行为。保持应用程序契约不变：只挂载 agent 应该使用的输入，告诉 agent 在哪里读写，并在使用生成的产物之前检查它们。

### 处理密钥和凭证

将沙盒凭证视为运行时配置，而不是提示内容。agent 可能需要访问包管理器、存储挂载或提供商 API 的凭证，但这些凭证不应出现在用户提示、agent 指令、任务文件、提交的清单或生成的产物中。

使用以下规则：

*   对于托管沙盒提供商，优先使用提供商原生的密钥系统。
*   将云存储凭证的范围限制在需要它们的挂载或提供商选项。
*   使用 `Manifest.environment` 设置沙盒进程启动时需要的值，并在你希望重建而非持久化时将敏感或生成的条目标记为临时的。
*   避免保存密钥、生成的挂载配置、本地令牌或不应在运行后存活的文件。
*   在将产物移出沙盒之前审核它们，特别是当 agent 可以读取私有文档或挂载的存储时。

SDK 支持清单环境值和特定提供商的挂载凭证。通用密钥存储集成是特定于提供商的，因此本页面专注于契约：你的运行时或沙盒提供商应该注入凭证，而不是将它们作为指令教给模型。

## 赋予 agent 能力

能力（Capabilities）将沙盒原生行为附加到 `SandboxAgent`。它们可以在运行开始前塑造工作空间、追加沙盒特定的指令、暴露绑定到实时沙盒会话的工具，以及调整该 agent 的模型行为或输入处理。

| 能力 | 何时添加 | 备注 |
| --- | --- | --- |
| `Shell` | agent 需要 shell 访问。 | 添加命令执行，以及当沙盒客户端支持时的交互式输入。 |
| `Filesystem` | agent 需要编辑文件或检查本地图像。 | 添加 `apply_patch` 和 `view_image`；补丁路径相对于工作空间根目录。 |
| `Skills` | 你希望在沙盒中进行技能发现和物化。 | 优先于手动挂载 `.agents` 或 `.agents/skills`。 |
| [`Memory`](#persist-memory-across-runs) | 后续运行应该读取或生成记忆产物。 | 需要 `Shell`；实时记忆更新还需要 `Filesystem`。 |
| `Compaction` | 长时间运行的流程需要上下文裁剪。 | 在压缩项之后调整模型行为和输入处理。 |

默认情况下，`SandboxAgent` 包含文件系统、shell 和压缩能力。如果你传递了 `capabilities` 列表，它会替换默认列表，因此请包含 agent 仍然需要的任何默认能力。

当内置能力适用时优先使用它们。只有当你需要内置能力未覆盖的沙盒特定工具或指令接口时，才编写自定义能力。

### 加载技能

某些任务在 agent 开始之前需要可重复的指令、脚本、参考资料或资产。使用 `Skills` 能力，以便 agent 可以在运行期间发现该工作上下文。

**加载技能**

::: code-group
```typescript
import {
  Capabilities,
  SandboxAgent,
  gitRepo,
  skills,
} from "@openai/agents/sandbox";

const agent = new SandboxAgent({
  name: "Tax prep assistant",
  instructions: "Use the mounted skill before preparing the return.",
  capabilities: [
    ...Capabilities.default(),
    skills({
      from: gitRepo({
        repo: "owner/tax-prep-skills",
        ref: "main",
      }),
    }),
  ],
});
```

```python
from agents.sandbox import SandboxAgent
from agents.sandbox.capabilities import Capabilities, Skills
from agents.sandbox.entries import GitRepo

agent = SandboxAgent(
    name="Tax prep assistant",
    instructions="Use the mounted skill before preparing the return.",
    capabilities=Capabilities.default() + [
        Skills(from_=GitRepo(repo="owner/tax-prep-skills", ref="main")),
    ],
)
```

:::




根据你希望技能如何物化来选择技能来源：

*   对于较大的本地技能目录，当你希望模型先发现索引然后只加载需要的内容时，使用惰性本地目录来源。
*   对于小型本地包，使用本地目录来源预先暂存。
*   当技能包有自己的发布节奏或多个沙盒使用它时，使用 Git 仓库来源。

### 暴露预览和端口

有时产物不是文件，而是一个运行中的进程。当 agent 创建本地应用、笔记本、报告服务器、浏览器预览或其他需要在沙盒外检查的服务时，使用暴露的端口。

端口设置是特定于提供商的，但产品契约是相同的：agent 在沙盒内启动服务，沙盒客户端暴露端口，你的应用程序共享或检查生成的预览 URL。

## 运行沙盒 agent

最简短的有用沙盒循环是：

1.  构建一个描述工作空间的 `Manifest`。
2.  创建一个具有模型所需能力的 `SandboxAgent`。
3.  为工作应该运行的环境选择一个沙盒客户端。
4.  使用每次运行的沙盒配置运行 agent。
5.  检查、复制、恢复或快照对你的应用程序重要的产物。

在 macOS 或 Linux 上进行本地开发时，从 Unix-local 开始。它提供了最小的本地循环，因为运行器可以从 agent 的默认清单创建临时工作空间，并在运行后清理它。

**运行 Unix-local 沙盒 agent**

::: code-group
```typescript
import { run } from "@openai/agents";
import {
  Manifest,
  SandboxAgent,
  file,
  shell,
} from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";

const manifest = new Manifest({
  entries: {
    "account_brief.md": file({
      content:
        "# Northwind Health\n\n" +
        "- Segment: Mid-market healthcare analytics provider.\n" +
        "- Renewal date: 2026-04-15.\n",
    }),
    "implementation_risks.md": file({
      content:
        "# Delivery risks\n\n" +
        "- Security questionnaire is not complete.\n" +
        "- Procurement requires final legal language by April 1.\n",
    }),
  },
});

const agent = new SandboxAgent({
  name: "Renewal Packet Analyst",
  model: "gpt-5.5",
  instructions:
    "Review the workspace before answering. Keep the response concise, " +
    "business-focused, and cite the file names that support each conclusion.",
  defaultManifest: manifest,
  capabilities: [shell()],
});

const result = await run(
  agent,
  "Summarize the renewal blockers and recommend the next two actions.",
  {
    sandbox: {
      client: new UnixLocalSandboxClient(),
    },
  },
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Runner
from agents.run import RunConfig
from agents.sandbox import Manifest, SandboxAgent, SandboxRunConfig
from agents.sandbox.capabilities import Shell
from agents.sandbox.entries import File
from agents.sandbox.sandboxes.unix_local import UnixLocalSandboxClient

manifest = Manifest(
    entries={
        "account_brief.md": File(
            content=(
                b"# Northwind Health\n\n"
                b"- Segment: Mid-market healthcare analytics provider.\n"
                b"- Renewal date: 2026-04-15.\n"
            )
        ),
        "implementation_risks.md": File(
            content=(
                b"# Delivery risks\n\n"
                b"- Security questionnaire is not complete.\n"
                b"- Procurement requires final legal language by April 1.\n"
            )
        ),
    }
)

agent = SandboxAgent(
    name="Renewal Packet Analyst",
    model="gpt-5.5",
    instructions=(
        "Review the workspace before answering. Keep the response concise, "
        "business-focused, and cite the file names that support each conclusion."
    ),
    default_manifest=manifest,
    capabilities=[Shell()],
)


async def main():
    result = await Runner.run(
        agent,
        "Summarize the renewal blockers and recommend the next two actions.",
        run_config=RunConfig(
            sandbox=SandboxRunConfig(client=UnixLocalSandboxClient()),
            workflow_name="Unix-local sandbox review",
        ),
    )
    print(result.final_output)


asyncio.run(main())
```

:::




完整的本地示例请参见 TypeScript [沙盒 agent 快速入门](https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts) 和 Python [`unix_local_runner.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/unix_local_runner.py)。

### 切换提供商

提供商是运行配置的一部分，而不是 agent 定义的一部分。保持 `SandboxAgent`、清单和能力稳定，然后为你想要的环境交换沙盒客户端和提供商选项。

此示例使用 Docker 进行本地容器隔离。托管提供商遵循相同的模式，使用各自的客户端类和选项。

**切换到 Docker**

::: code-group
```typescript
import { run } from "@openai/agents";
import { SandboxAgent } from "@openai/agents/sandbox";
import { DockerSandboxClient } from "@openai/agents/sandbox/local";

const agent = new SandboxAgent({
  name: "Workspace reviewer",
  model: "gpt-5.5",
  instructions: "Inspect the sandbox workspace before answering.",
});

const result = await run(agent, "Inspect the workspace.", {
  sandbox: {
    client: new DockerSandboxClient({
      image: "node:22-bookworm-slim",
    }),
  },
});

console.log(result.finalOutput);
```

```python
from docker import from_env as docker_from_env

from agents import Runner
from agents.run import RunConfig
from agents.sandbox import SandboxRunConfig
from agents.sandbox.config import DEFAULT_PYTHON_SANDBOX_IMAGE
from agents.sandbox.sandboxes.docker import DockerSandboxClient, DockerSandboxClientOptions

docker_run_config = RunConfig(
    sandbox=SandboxRunConfig(
        client=DockerSandboxClient(docker_from_env()),
        options=DockerSandboxClientOptions(image=DEFAULT_PYTHON_SANDBOX_IMAGE),
    ),
    workflow_name="Docker sandbox review",
)

result = await Runner.run(
    agent,
    "Summarize the renewal blockers and recommend the next two actions.",
    run_config=docker_run_config,
)
```

:::




可运行的示例请参见 TypeScript [沙盒客户端指南](https://openai.github.io/openai-agents-js/guides/sandbox-agents/clients) 和 [基本示例](https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts)，以及 Python [`basic.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/basic.py)（提供商选择）、[`docker_runner.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/docker/docker_runner.py)（Docker）和 [`main.py`](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_qa)（SDK 仓库中的数据室流程）。

### 高级模式

一旦基本循环工作正常，沙盒就可以用于 agent 需要沙盒工作空间而不是更多提示上下文的工作流。这些示例是工作流模式，而不是单独的 API：同一个控制层可以路由、暂停、恢复和追踪工作流，而每个沙盒保持执行靠近它需要的文件、工具和端口。

| 示例 | 描述 |
| --- | --- |
| [数据室问答](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_qa) | 在挂载的数据室上回答问题。 |
| [数据室表格提取](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_metric_extract) | 从挂载的数据室中提取表格。 |
| [仓库代码审查](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/repo_code_review) | 克隆仓库、检查它并生成代码审查产物。 |
| [视觉网站克隆](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/vision_website_clone) | 使用 Vision API 和截图反馈克隆网站。 |
| [沙盒恢复](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/sandbox_resume) | 在预先存在的沙盒中恢复工作。 |

## 恢复或为未来工作提供种子

有用的 agent 工作通常超出单个请求的生命周期。用户审核产物、某个步骤需要审批，或者下一步取决于稍后的事件。

保持三个状态概念分离：

| 状态表面 | 恢复什么 | 何时使用 |
| --- | --- | --- |
| `RunState` | 控制层侧的状态，如模型项、工具状态、审批和活动 agent 位置。 | 运行器应该在暂停之间推进工作流。 |
| Session state | 客户端可以重新连接的序列化沙盒会话。 | 你的应用或作业系统直接存储提供商会话状态。 |
| `snapshot` | 用于为新沙盒会话提供种子的已保存工作空间内容。 | 新运行应该从保存的文件和产物开始，而不是空工作空间。 |

在实践中，运行器按以下顺序解析沙盒会话：

1.  如果你传递了实时沙盒会话，运行器直接重用该会话。
2.  否则，如果运行是从 `RunState` 恢复的，运行器从存储的沙盒会话状态恢复。
3.  否则，如果你传递了显式的序列化沙盒状态，运行器从该状态恢复。
4.  否则，运行器创建新的沙盒会话。对于该新会话，它使用提供的每次运行清单，或者如果没有提供则使用 agent 的默认清单。

沙盒恢复示例序列化了停止的会话状态，通过同一客户端恢复它，然后将恢复的会话传回下一次运行：

**序列化和恢复沙盒状态**

::: code-group
```typescript
import { run } from "@openai/agents";
import { Manifest, SandboxAgent } from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";

const manifest = new Manifest();
const client = new UnixLocalSandboxClient({
  snapshot: { type: "local", baseDir: "/tmp/my-sandbox-snapshots" },
});
const agent = new SandboxAgent({
  name: "Workspace builder",
  model: "gpt-5.5",
  instructions: "Inspect the sandbox workspace before answering.",
});

const session = await client.create({ manifest });
let conversation: any[] = [];
let frozenSessionState;

try {
  const firstResult = await run(agent, "Build the first version of the app.", {
    maxTurns: 20,
    sandbox: { session },
  });

  conversation = firstResult.history;
  frozenSessionState = await client.serializeSessionState?.(session.state);
} finally {
  await session.close?.();
}

if (!frozenSessionState || !client.deserializeSessionState || !client.resume) {
  throw new Error("Sandbox client does not support session resume.");
}

const resumedSession = await client.resume(
  await client.deserializeSessionState(frozenSessionState),
);

try {
  conversation.push({
    role: "user",
    content: "Continue from the existing workspace and add tests.",
  });

  await run(agent, conversation, {
    maxTurns: 20,
    sandbox: { session: resumedSession },
  });
} finally {
  await resumedSession.close?.();
}
```

```python
async with session:
    first_result = await Runner.run(
        agent,
        "Build the first version of the app.",
        max_turns=20,
        run_config=RunConfig(
            sandbox=SandboxRunConfig(session=session),
            workflow_name="Sandbox resume example",
        ),
    )

conversation = first_result.to_input_list()
frozen_session_state = client.deserialize_session_state(
    client.serialize_session_state(session.state)
)

conversation.append(
    {
        "role": "user",
        "content": "Continue from the existing workspace and add tests.",
    }
)

resumed_session = await client.resume(frozen_session_state)
try:
    async with resumed_session:
        second_result = await Runner.run(
            agent,
            conversation,
            max_turns=20,
            run_config=RunConfig(
                sandbox=SandboxRunConfig(session=resumed_session),
                workflow_name="Sandbox resume example",
            ),
        )
finally:
    await client.delete(resumed_session)
```

:::




新会话输入如 `manifest` 和 `snapshot` 仅在运行器创建新沙盒会话时适用。如果你注入了实时 `session`，能力处理可以添加兼容的非挂载条目，但不能更改 root、环境变量、用户或组；不能删除现有条目；不能替换条目类型；也不能在已运行的沙盒上添加或更改挂载条目。

这种分离让控制层恢复 agent 循环，而沙盒提供商恢复或重新创建工作空间。这些路径的当前示例代码位于 TypeScript [恢复会话状态示例](https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/resume-session-state.ts) 和 Python [`main.py`](https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/sandbox_resume) 以及 [`sandbox_agent_with_remote_snapshot.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/sandbox_agent_with_remote_snapshot.py)。

## 跨运行持久化记忆

沙盒记忆让未来的沙盒 agent 运行可以从先前的运行中学习。它与 SDK 管理的对话式 `Session` 记忆不同：会话保留消息历史，而沙盒记忆将先前工作空间运行中的有用经验提炼为 agent 稍后可以读取的文件。

当 agent 应该携带用户偏好、纠正、项目特定的经验教训或任务摘要而无需重放每个先前轮次时，使用记忆。恢复和快照保留工作空间状态；记忆保留关于工作空间中发生的工作的可重用指导。

**启用沙盒记忆**

::: code-group
```typescript
import {
  Manifest,
  SandboxAgent,
  filesystem,
  memory,
  shell,
} from "@openai/agents/sandbox";

const manifest = new Manifest();

const agent = new SandboxAgent({
  name: "Memory-enabled reviewer",
  instructions:
    "Inspect the workspace and retain useful lessons for follow-up runs.",
  defaultManifest: manifest,
  capabilities: [memory(), filesystem(), shell()],
});
```

```python
from agents.sandbox.capabilities import Filesystem, Memory, Shell

agent = SandboxAgent(
    name="Memory-enabled reviewer",
    instructions="Inspect the workspace and retain useful lessons for follow-up runs.",
    default_manifest=manifest,
    capabilities=[Memory(), Filesystem(), Shell()],
)
```

:::





记忆默认启用读取和生成。记忆读取需要 shell 访问，以便 agent 可以搜索和打开记忆文件。默认情况下，实时记忆更新还需要文件系统访问，以便 agent 可以修复过时的记忆或在用户要求时更新记忆。

记忆读取使用渐进式披露。SDK 在运行开始时注入 `memory_summary.md`，当先前的工作看起来相关时 agent 搜索 `MEMORY.md`，只有在需要更多细节时才打开 rollout 摘要。

| 记忆模式 | 何时使用 |
| --- | --- |
| 默认读/写 | agent 应该读取现有记忆并生成新记忆。 |
| 只读记忆 | agent 应该读取记忆但在运行后不生成新记忆。 |
| 仅生成记忆 | 运行应该生成记忆而不使用现有记忆。 |
| 读取配置 | 你需要禁用实时更新。 |
| 生成配置 | 你需要调整生成，例如额外的提示。 |
| 布局配置 | agent 需要在同一沙盒工作空间中使用隔离的记忆布局。 |

默认情况下，记忆产物存放在沙盒工作空间中：

```
workspace/
  sessions/
    &lt;rollout-id>.jsonl
  memories/
    memory_summary.md
    MEMORY.md
    raw_memories.md
    phase_two_selection.json
    raw_memories/
      &lt;rollout-id>.md
    rollout_summaries/
      &lt;rollout-id>_&lt;slug>.md
    skills/
```

运行时在沙盒会话期间追加运行片段。当会话关闭时，记忆生成首先提取对话摘要和原始记忆，然后将这些原始记忆整合到 `MEMORY.md` 和 `memory_summary.md` 中。要在后续运行中重用记忆，请通过保持相同的实时沙盒会话、从会话状态恢复、从快照开始或挂载持久存储（如 S3）来保留配置的记忆目录。

对于多轮沙盒聊天，将稳定的 SDK 会话与相同的实时沙盒会话一起使用。记忆按显式对话 ID、然后 SDK 会话 ID、然后运行组 ID、最后生成的每次运行 ID 对运行进行分组。沙盒会话 ID 标识实时工作空间；它不是记忆对话 ID。

可运行的示例请参见 TypeScript [记忆指南](https://openai.github.io/openai-agents-js/guides/sandbox-agents/memory)，以及 Python [`memory.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory.py)（本地快照流程）、[`memory_s3.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory_s3.py)（S3 支持的记忆存储）和 [`memory_multi_agent_multiturn.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory_multi_agent_multiturn.py)（跨 agent 的独立记忆布局）。

## 组合沙盒 agent

沙盒 agent 与 SDK 的其余部分组合使用。

当非沙盒的接收 agent 应该只将工作流中工作空间密集的部分委托给沙盒 agent 时，使用交接（handoff）。顶层运行继续，但沙盒 agent 成为下一轮的活动 agent。

当外部编排器应该将一个或多个沙盒 agent 作为嵌套工具调用时，将 agent 用作工具。每个沙盒工具 agent 可以有自己的沙盒运行配置、沙盒客户端、清单和提供商选项。

示例请参见 [`handoffs.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/handoffs.py) 和 [`sandbox_agents_as_tools.py`](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/sandbox_agents_as_tools.py)。

## 沙盒提供商

从 Unix-local 开始进行快速本地迭代，或者当你需要本地容器隔离时使用 Docker。当任务需要托管执行、特定提供商的隔离、扩展、预览、存储挂载、快照或应该存在于应用服务器之外的凭证时，迁移到托管提供商。

使用提供商文档了解特定提供商的设置、凭证、隔离、存储、预览和持久化行为。

| 提供商 | SDK 客户端 | 文档和示例 |
| --- | --- | --- |
| Blaxel | `BlaxelSandboxClient` | [Sandbox overview](https://docs.blaxel.ai/Sandboxes/Overview) |
| Cloudflare | `CloudflareSandboxClient` | [Sandbox documentation](https://developers.cloudflare.com/sandbox/)  
[OpenAI Agents tutorial](https://docs.cloudflare.com/sandbox/tutorials/openai-agents/)  
[Sandbox Bridge examples](https://github.com/cloudflare/sandbox-sdk/tree/main/bridge/examples) |
| Daytona | `DaytonaSandboxClient` | [Sandbox documentation](https://www.daytona.io/docs/en/sandboxes/)  
[OpenAI Agents SDK guide](https://www.daytona.io/docs/en/guides/openai-agents/openai-agents-sdk-with-sandboxes) |
| Docker | `DockerSandboxClient` | [Docker documentation](https://docs.docker.com/)  
[TypeScript Docker SDK example](https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/docker-client.ts)  
[Python Docker SDK example](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/docker/docker_runner.py) |
| E2B | `E2BSandboxClient` | [Sandbox documentation](https://e2b.dev/docs)  
[OpenAI Agents SDK guide](https://e2b.dev/docs/agents/openai-agents-sdk)  
[Launch blog](https://e2b.dev/blog/e2b-is-now-in-agents-sdk) |
| Modal | `ModalSandboxClient` | [Sandbox guide](https://modal.com/docs/guide/sandboxes)  
[Integration blog](https://modal.com/blog/building-with-modal-and-the-openai-agent-sdk)  
[Example repo](https://github.com/modal-labs/openai-agents-python-example)  
[Modal extension reference](https://github.com/modal-labs/openai-agents-python-example?tab=readme-ov-file#modal-extension-reference) |
| Runloop | `RunloopSandboxClient` | [Devbox overview](https://docs.runloop.ai/docs/devboxes/overview)  
[Tunnels](https://docs.runloop.ai/docs/devboxes/tunnels) |
| Unix-local | `UnixLocalSandboxClient` | [TypeScript local SDK example](https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts)  
[Python local SDK example](https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/unix_local_runner.py) |
| Vercel | `VercelSandboxClient` | [Sandbox documentation](https://vercel.com/docs/vercel-sandbox)  
[OpenAI Agents SDK guide](https://vercel.com/kb/guide/building-an-agent-with-openai-agents-sdk-and-vercel-sandbox)  
[FastAPI template](https://vercel.com/templates/template/openai-agents-sdk-with-fastapi)  
[Sample app](https://github.com/vercel-labs/openai-agents-fastapi-starter) |
