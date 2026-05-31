# Developer mode

> 启用开发者模式以获取更详细的 API 响应信息。

[

高风险

](https://help.openai.com/en/articles/20001062)

## 什么是 ChatGPT 开发者模式

ChatGPT 开发者模式为所有工具（包括读取和写入）提供完整的 Model Context Protocol (MCP) 客户端支持。它功能强大但存在风险，适用于了解如何安全配置和测试应用的开发者。使用开发者模式时，请注意[提示注入和其他风险](/mcp)、写入操作中可能导致数据损坏的模型错误，以及试图窃取信息的恶意 MCP。

## 使用方法

*   **资格要求：** 适用于 Pro、Plus、Business、Enterprise 和 Education 账户（Web 端）。
    
*   **启用开发者模式：** 前往 [**设置 → 应用**](https://chatgpt.com/#settings/Connectors) → [**高级设置 → 开发者模式**](https://chatgpt.com/#settings/Connectors/Advanced)。
    
*   **从 MCP 创建应用：**
    
    *   打开 [ChatGPT 应用设置](https://chatgpt.com/#settings/Connectors)。
    *   点击**高级设置**旁边的"创建应用"，为你的远程 MCP 服务器创建一个应用。它稍后会在对话中的编辑器"开发者模式"工具中显示。"创建应用"按钮仅在开发者模式下可见。
        *   支持的 MCP 协议：SSE 和 streaming HTTP。
        *   支持的认证方式：OAuth、无认证和混合认证
            *   对于 OAuth，如果提供了静态凭据，则会使用静态凭据。否则，当授权服务器声明支持且连接器创建者选择 CIMD 时，ChatGPT 可以使用 Client ID Metadata Documents。CIMD 支持公共客户端令牌交换（`none`）和签名客户端断言令牌交换（`private_key_jwt`）。ChatGPT 还可以在配置后使用 DCR。
            *   混合认证支持 OAuth 和无认证。这意味着 initialize 和 list tools API 不使用认证，而工具根据其工具元数据中设置的安全方案使用 OAuth 或无认证。
    *   创建的应用将显示在应用设置中的"草稿"下。
*   **管理工具：** 在应用设置中，每个应用都有一个详情页面。使用该页面可以开启或关闭工具，以及刷新应用以从 MCP 服务器拉取新的工具、描述和服务器指令。
    
*   **在对话中使用应用：** 从 Plus 菜单中选择**开发者模式**，然后为对话选择应用。你可能需要尝试不同的提示技巧来调用正确的工具。例如：
    
    *   明确指定："使用 "Acme CRM" 应用的 "update\_record" 工具来……"。必要时，包含服务器标签和工具名称。
    *   禁止替代方案以避免歧义："不要使用内置浏览或其他工具；只使用 Acme CRM 连接器。"
    *   区分相似工具："优先使用 `Calendar.create_event` 安排会议；不要使用 `Reminders.create_task` 进行日程安排。"
    *   指定输入格式和顺序："首先使用 `{ path: "…" }` 调用 `Repo.read_file`。然后使用修改后的内容调用 `Repo.write_file`。不要调用其他工具。"
    *   如果多个应用功能重叠，请提前声明偏好（例如，"使用 `CompanyDB` 获取权威数据；仅在 `CompanyDB` 没有返回结果时使用其他来源"）。
    *   开发者模式不需要 `search`/`fetch` 工具。你的连接器暴露的任何工具（包括写入操作）都可用，但受确认设置约束。
    *   更多指导请参阅[使用工具](/guides/tools)和[提示](/guides/prompting)。
    *   通过更好的工具描述改善工具选择：在你的 MCP 服务器中，编写面向操作的工具名称和描述，包含"在以下情况使用……"的指导，注明不允许的/边缘情况，并添加参数描述（和枚举），以帮助模型在相似工具中选择正确的工具，并在不适当时避免使用内置工具。
    *   添加服务器指令以提供跨工具指导：使用 MCP [`instructions` 字段](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization)提供服务器级别的指导，如必需的工具调用顺序、共享速率限制或工具之间的关系。保持前 512 个字符内容自包含。
    
    示例：
    
    ```
    Schedule a 30‑minute meeting tomorrow at 3pm PT with
    alice@example.com and bob@example.com using "Calendar.create_event".
    Do not use any other scheduling tools.
    ```
    
    ```
    Create a pull request using "GitHub.open_pull_request" from branch
    "feat-retry" into "main" with title "Add retry logic" and body "…".
    Do not push directly to main.
    ```
    
*   **审查和确认工具调用：**
    
    *   检查 JSON 工具负载以验证正确性和调试问题。对于每个工具调用，你可以使用展开箭头来展开和折叠工具调用详情。工具输入和输出的完整 JSON 内容均可查看。
    *   写入操作默认需要确认。请仔细审查将发送给写入操作的工具输入，以确保行为符合预期。错误的写入操作可能会意外销毁、修改或共享数据！
    *   只读检测：我们遵循 `readOnlyHint` 工具注解（参见 [MCP 工具注解](https://modelcontextprotocol.io/legacy/concepts/tools#available-tool-annotations)）。没有此提示的工具将被视为写入操作。
    *   你可以选择为对话中的某个工具记住批准或拒绝的选择，这意味着该选择将在该对话的剩余部分生效。因此，只有在你了解并信任底层应用程序可以在无需你批准的情况下执行进一步写入操作时，才应允许工具记住批准选择。新对话将再次提示确认。刷新同一对话也会在后续轮次中再次提示确认。
