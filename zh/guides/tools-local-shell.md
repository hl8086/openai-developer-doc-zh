
本地 shell 工具已过时。对于新的使用场景，请改用 [`shell`](/guides/tools-shell) 工具配合 GPT-5.1。[了解更多](/guides/tools-shell)。

本地 shell 是一种工具，允许代理在您或用户提供的机器上本地运行 shell 命令。它设计用于与 [Codex CLI](https://github.com/openai/codex) 和 [`codex-mini-latest`](/models/codex-mini-latest) 配合使用。命令在您自己的运行时中执行，**您完全控制哪些命令实际运行**——API 仅返回指令，但不会在 OpenAI 基础设施上执行它们。

本地 shell 通过 [Responses API](/guides/responses-vs-chat-completions) 提供，用于 [`codex-mini-latest`](/models/codex-mini-latest)。它不适用于其他模型，也不能通过 Chat Completions API 使用。

运行任意 shell 命令可能是危险的。在将命令转发到系统 shell 之前，请始终对执行进行沙箱隔离或添加严格的允许/拒绝列表。

  

参见 [Codex CLI](https://github.com/openai/codex) 获取参考实现。

## 工作原理

本地 shell 工具使代理能够在持续循环中运行并访问终端。

它发送 shell 命令，您的代码在本地机器上执行这些命令，然后将输出返回给模型。这个循环允许模型在无需用户额外干预的情况下完成构建-测试-运行循环。

作为代码的一部分，您需要实现一个循环来监听 `local_shell_call` 输出项并执行其中包含的命令。我们强烈建议对这些命令的执行进行沙箱隔离，以防止任何意外命令被执行。

## 集成本地 shell 工具

以下是在您的应用程序中集成本地 shell 工具需要遵循的高级步骤：

1.  **向模型发送请求**：将 `local_shell` 工具作为可用工具的一部分包含在内。
    
2.  **接收模型的响应**：检查响应中是否有任何 `local_shell_call` 项。此工具调用包含一个操作，如 `exec` 以及要执行的命令。
    
3.  **执行请求的操作**：通过代码在计算机或容器环境中执行相应的操作。
    
4.  **返回操作输出**：执行操作后，将命令输出和元数据（如状态码）返回给模型。
    
5.  **重复**：发送一个新请求，将更新后的状态作为 `local_shell_call_output`，并重复此循环直到模型停止请求操作或您决定停止。
    

## 示例工作流

以下是一个展示请求/响应循环的最小化（Python）示例。为简洁起见，省略了错误处理和安全检查——**在生产环境中不要在没有额外安全措施的情况下执行不受信任的命令**。

```python
import os
import shlex
import subprocess
from openai import OpenAI

client = OpenAI()

# 1) Create the initial response request with the tool enabled
response = client.responses.create(
    model="codex-mini-latest",
    tools=[{"type": "local_shell"}],
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "List files in the current directory"},
            ],
        }
    ],
)

while True:
    # 2) Look for a local_shell_call in the model's output items
    shell_calls = []
    for item in response.output:
        item_type = getattr(item, "type", None)
        if item_type == "local_shell_call":
            shell_calls.append(item)
        elif item_type == "tool_call" and getattr(item, "tool_name", None) == "local_shell":
            shell_calls.append(item)
    if not shell_calls:
        # No more commands — the assistant is done.
        break

    call = shell_calls[0]
    args = getattr(call, "action", None) or getattr(call, "arguments", None)

    # 3) Execute the command locally (here we just trust the command!)
    #    The command is already split into argv tokens.
    def _get(obj, key, default=None):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    timeout_ms = _get(args, "timeout_ms")
    command = _get(args, "command")
    if not command:
        break
    if isinstance(command, str):
        command = shlex.split(command)
    completed = subprocess.run(
        command,
        cwd=_get(args, "working_directory") or os.getcwd(),
        env={**os.environ, **(_get(args, "env") or {})},
        capture_output=True,
        text=True,
        timeout=(timeout_ms / 1000) if timeout_ms else None,
    )

    output_item = {
        "type": "local_shell_call_output",
        "call_id": getattr(call, "call_id", None),
        "output": completed.stdout + completed.stderr,
    }

    # 4) Send the output back to the model to continue the conversation
    response = client.responses.create(
        model="codex-mini-latest",
        tools=[{"type": "local_shell"}],
        previous_response_id=response.id,
        input=[output_item],
    )

# Print the assistant's final answer
print(response.output_text)
```

## 最佳实践

*   **沙箱隔离或容器化**执行。考虑使用 Docker、firejail 或受限用户账户。
*   **施加资源限制**（时间、内存、网络）。模型提供的 `timeout_ms` 仅是一个提示——您应该强制执行自己的限制。
*   **过滤或审查**高风险命令（例如 `rm`、`curl`、网络工具）。
*   **记录每个命令及其输出**，以便审计和调试。

### 错误处理

如果命令在您这边失败（非零退出码、超时等），您仍然可以发送 `local_shell_call_output`；在 `output` 字段中包含错误消息。

模型可以选择恢复或尝试执行不同的命令。如果您发送格式错误的数据（例如缺少 `call_id`），API 将返回标准的 `400` 验证错误。
