
`apply_patch` 工具让 GPT-5.1 能够使用结构化差异（diff）在你的代码库中创建、更新和删除文件。模型不再只是建议编辑，而是发出补丁操作，由你的应用程序应用并反馈结果，从而实现迭代式、多步骤的代码编辑工作流。

## 何时使用

以下是一些使用 apply\_patch 的常见场景：

*   **多文件重构** – 一次性跨多个文件重命名符号、提取辅助函数或重组模块。
*   **Bug 修复** – 让模型既能诊断问题，又能发出精确的补丁。
*   **测试和文档生成** – 在代码变更的同时创建新的测试文件、测试数据和文档。
*   **迁移和机械性编辑** – 应用重复性的结构化更新（API 迁移、类型注解、格式修复等）。

如果你能用文本描述你的仓库和期望的变更，apply\_patch 通常就能生成相应的差异。

## 在 Responses API 中使用 apply patch 工具

从高层来看，在 Responses API 中使用 `apply_patch` 的流程如下：

1.  **使用 `apply_patch` 工具调用 Responses API**
    *   在 `input` 中为模型提供可用文件的上下文（或摘要），或者为模型提供探索文件系统的工具。
    *   通过 `tools=[{"type": "apply_patch"}]` 启用该工具。
2.  **让模型返回一个或多个补丁操作**
    *   Response 输出包含一个或多个 `apply_patch_call` 对象。
    *   每个调用描述一个单独的文件操作：创建、更新或删除。
3.  **在你的环境中应用补丁**
    *   运行补丁处理程序或脚本：
        *   解析每个 `apply_patch_call` 的 `operation` 差异。
        *   将补丁应用到你的工作目录或仓库。
        *   记录每个补丁是否成功以及任何日志或错误信息。
4.  **将补丁结果反馈给模型**
    *   再次调用 Responses API，使用 `previous_response_id` 或将对话项传回 `input`。
    *   为每个 `call_id` 包含一个 `apply_patch_call_output` 事件，带有 `status` 和可选的 `output` 字符串。
    *   保持 `tools=[{"type": "apply_patch"}]` 以便模型在需要时继续编辑。
5.  **让模型继续操作或解释变更**
    *   模型可能会发出更多 `apply_patch_call` 操作，或者
    *   提供面向用户的解释，说明它做了什么以及为什么。

## 示例：使用 Apply Patch 工具重命名函数

**步骤 1：要求模型规划并发出补丁**

要求模型规划并发出补丁

```text
from openai import OpenAI

client = OpenAI()

# For brevity, we are including file context in the example input.
# Most agentic use cases should instead equip the model with tools
# for exploring file system state.
RESPONSE_INPUT = """
The user has the following files:
&lt;BEGIN_FILES>
===== lib/fib.py
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

===== run.py
from lib.fib import fib

def main():
  print(fib(42))
&lt;END_FILES>

You are a helpful coding assistant that should assist the user with whatever they
ask.

User query:
Help me rename the fib() function to fibonacci()
"""

response = client.responses.create(
    model="gpt-5.1",
    input=RESPONSE_INPUT,
    tools=[{"type": "apply_patch"}],
)

# response.output may contain multiple apply_patch_call entries, e.g.:
# - update lib/fib.py
# - update run.py
patch_calls = [
    item for item in response.output
    if item["type"] == "apply_patch_call"
]
```

**`apply_patch_call` 对象示例**

apply\_patch\_call 对象示例

```text
{
    "id": "apc_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
    "type": "apply_patch_call",
    "status": "completed",
    "call_id": "call_Rjsqzz96C5xzPb0jUWJFRTNW",
    "operation": {
        "type": "update_file",
        "diff": "
@@
-def fib(n):
+def fibonacci(n):
    if n <= 1:
        return n
-    return fib(n-1) + fib(n-2)                                                  +    return fibonacci(n-1) + fibonacci(n-2),
",
        "path": "lib/fib.py"
    }
}
```

**步骤 2：应用补丁并将结果发送回去**

应用补丁并返回结果

```
from apply_patch_harness import apply_operation  # your implementation

results = []
for call in patch_calls:
    op = call["operation"]
    success, maybe_log_output = apply_operation(op)

    results.append({
        "type": "apply_patch_call_output",
        "call_id": call["call_id"],
        "status": "completed" if success else "failed",
        "output": maybe_log_output,
    })

followup = client.responses.create(
    model="gpt-5.1",
    previous_response_id=response.id,
    input=results,
    tools=[{"type": "apply_patch"}],
)
```

如果补丁失败（例如，文件未找到），设置 `status: "failed"` 并包含有用的 `output` 字符串，以便模型可以恢复：

报告失败的 apply\_patch 调用

```
{
  "type": "apply_patch_call_output",
  "call_id": "call_cNWm41dB3RyQcLNOVTIPBWZU",
  "status": "failed",
  "output": "Could not apply patch to lib/foo.py — file not found on disk"
}
```

## Apply patch 操作

| 操作类型 | 用途 | 载荷 |
| --- | --- | --- |
| `create_file` | 在 `path` 创建新文件。 | `diff` 是表示完整文件内容的 V4A 差异。 |
| `update_file` | 修改 `path` 处的现有文件。 | `diff` 是包含添加、删除或替换的 V4A 差异。 |
| `delete_file` | 删除 `path` 处的文件。 | 无 `diff`；完全删除文件。 |

你的补丁处理程序负责解析 V4A 差异格式并应用变更。参考实现请参见 [Python Agents SDK](https://github.com/openai/openai-agents-python/blob/main/src/agents/apply_diff.py) 或 [TypeScript Agents SDK](https://github.com/openai/openai-agents-js/blob/main/packages/agents-core/src/utils/applyDiff.ts) 代码。

## 实现补丁处理程序

使用 `apply_patch` 工具时，你不需要提供输入模式（schema）；模型知道如何构造 `operation` 对象。你需要做的是：

1.  **从 Response 中解析操作**
    *   扫描 Response 中 `type: "apply_patch_call"` 的项。
    *   对于每个调用，检查 `operation.type`、`operation.path` 和可能的 `diff`。
2.  **应用文件操作**
    *   对于 `create_file` 和 `update_file`，将 V4A 差异应用到文件系统或内存工作区。
    *   对于 `delete_file`，删除 `path` 处的文件。
    *   记录每个操作是否成功以及任何日志或错误信息。
3.  **返回 `apply_patch_call_output` 事件**
    *   对于每个 `call_id`，发出恰好一个 `apply_patch_call_output` 事件，包含：
        *   `status: "completed"` 如果操作成功应用。
        *   `status: "failed"` 如果遇到错误（包含简短的人类可读 `output` 字符串）。

### 安全性和健壮性

*   **路径验证**：防止目录遍历攻击，将编辑限制在允许的目录内。
*   **备份**：考虑在应用补丁之前备份文件（或在临时副本中工作）。
*   **错误处理**：当补丁无法应用时，始终返回 `failed` 状态并附带信息丰富的 `output` 字符串。
*   **原子性**：决定你是否需要"全有或全无"语义（任何补丁失败时回滚）还是按文件的成功/失败。

## 在 Agents SDK 中使用 apply patch 工具

或者，你可以使用 [Agents SDK](/guides/tools#usage-in-the-agents-sdk) 来使用 apply patch 工具。你仍然需要实现处理实际文件操作的处理程序，但可以使用 `applyDiff` 函数来处理差异处理。

**在 Agents SDK 中使用 apply patch 工具**

```
import { applyDiff, Agent, run, applyPatchTool, Editor } from "@openai/agents";

class WorkspaceEditor implements Editor {
  async createFile(operation) {
    // convert the diff to the file content
    const content = applyDiff("", operation.diff, "create");
    // write the file content to the file system
    return { status: "completed", output: `Created ${operation.path}` };
  }

  async updateFile(operation) {
    // read the file content from the file system
    const current = "";
    // convert the diff to the new file content
    const newContent = applyDiff(current, operation.diff);
    // write the updated file content to the file system
    return { status: "completed", output: `Updated ${operation.path}` };
  }

  async deleteFile(operation) {
    // delete the file from the file system
    return { status: "completed", output: `Deleted ${operation.path}` };
  }
}

const editor = new WorkspaceEditor();

const agent = new Agent({
  name: "Patch Assistant",
  model: "gpt-5.1",
  instructions: "You can edit files inside the /tmp directory using the apply_patch tool.",
  tools: [
    applyPatchTool({
      editor,
      // could also be a function for you to determine if approval is needed
      needsApproval: true,
      onApproval: async (_ctx, _approvalItem) => {
        // create your own approval logic
        return { approve: true };
      },
    }),
  ],
});

const result = await run(
  agent,
  "Create tasks.md with a shopping checklist of 5 entries."
);

console.log(`\nFinal response:\n${result.finalOutput}`);
```

```python
from agents import Agent, ApplyPatchTool, Runner, apply_diff


class WorkspaceEditor:
    async def create_file(self, operation):
        # convert the diff to the file content
        content = apply_diff("", operation.diff, create=True)
        # write the file content to the file system
        return {"status": "completed", "output": f"Created {operation.path}"}

    async def update_file(self, operation):
        # read the file content from the file system
        current = ""
        # convert the diff to the new file content
        new_content = apply_diff(current, operation.diff)
        # write the updated file content to the file system
        return {"status": "completed", "output": f"Updated {operation.path}"}

    async def delete_file(self, operation):
        # delete the file from the file system
        return {"status": "completed", "output": f"Deleted {operation.path}"}


editor = WorkspaceEditor()

agent = Agent(
    name="Patch Assistant",
    model="gpt-5.1",
    instructions="You can edit files inside the /tmp directory using the apply_patch tool.",
    tools=[
        ApplyPatchTool(
            editor=editor,
            # could also be a function for you to determine if approval is needed
            needs_approval=True,
            # Implement your own approval logic
            on_approval=lambda _ctx, _approval_item: {"approve": True},
        ),
    ],
)


async def main():
    result = await Runner.run(
        agent,
        input="Create tasks.md with a shopping checklist of 5 entries.",
    )

    print(f"\nFinal response:\n{result.final_output}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```



你可以在 GitHub 上找到完整的可运行示例。

[Apply patch 工具示例 - TypeScript - 在 TypeScript 中使用 Agents SDK 的 apply patch 工具示例](https://github.com/openai/openai-agents-js/blob/main/examples/tools/applyPatch.ts)

[Apply patch 工具示例 - Python - 在 Python 中使用 Agents SDK 的 apply patch 工具示例](https://github.com/openai/openai-agents-python/blob/main/examples/tools/apply_patch.py)

## 处理常见错误

使用 `status: "failed"` 加上清晰的 `output` 消息来帮助模型恢复。

文件未找到补丁冲突

文件未找到

文件未找到错误

```
{
  "type": "apply_patch_call_output",
  "call_id": "call_abc",
  "status": "failed",
  "output": "Error: File not found at path 'lib/baz.py'"
}
```

补丁冲突

补丁冲突错误

```
{
  "type": "apply_patch_call_output",
  "call_id": "call_abc",
  "status": "failed",
  "output": "Error: Invalid Context:\n@@ def fib(n):"
}
```

模型可以根据这些错误信息调整后续的差异（例如，通过在提示中重新读取文件或简化变更）。

## 最佳实践

*   **提供清晰的文件上下文**
    *   调用 Responses API 时，包含文件的内联快照（如示例所示），或为模型提供探索文件系统的工具（如 `shell` 工具）。
*   **考虑与 `shell` 工具配合使用**
    *   与 `shell` 工具结合使用时，模型可以探索文件系统目录、读取文件和搜索关键词，实现智能体式的文件发现和编辑。
*   **鼓励小而专注的差异**
    *   在系统指令中，引导模型进行最小化、有针对性的编辑，而不是大规模重写。
*   **确保变更能干净地应用**
    *   在一系列补丁之后，运行测试或代码检查工具，并在下一次 `input` 中分享失败信息，以便模型修复它们。

## 使用说明

| API 可用性 | 支持的模型 |
| --- | --- |
| [Responses]( https://developers.openai.com/api/reference/responses)[Chat Completions]( https://developers.openai.com/api/reference/chat)[Assistants]( https://developers.openai.com/api/reference/assistants) | [GPT-5.5](/models/gpt-5.5)  
[GPT-5.4](/models/gpt-5.4)  
[GPT-5.2](/models/gpt-5.2)  
[GPT-5.1](/models/gpt-5.1) |
