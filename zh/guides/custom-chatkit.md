# Advanced integrations

当你需要完全控制——自定义认证、数据驻留、本地部署或定制化的 Agent 编排——你可以在自己的基础设施上运行 ChatKit。使用 OpenAI 的高级自托管选项来使用你自己的服务器和定制化的 ChatKit。

我们推荐的 ChatKit 集成可以帮助你快速上手：嵌入聊天组件、自定义外观和风格，让 OpenAI 托管和扩展后端。[使用更简单的集成 →](/guides/chatkit)

## 在你自己的基础设施上运行 ChatKit

从高层来看，高级 ChatKit 集成是一个构建你自己的 ChatKit 服务器并添加组件来构建聊天界面的过程。你将使用 OpenAI API 和你的 ChatKit 服务器来构建由 OpenAI 模型驱动的自定义聊天。

![OpenAI 托管的 ChatKit](https://cdn.openai.com/API/docs/images/self-hosted.png)

## 设置你的 ChatKit 服务器

按照 [GitHub 上的服务器指南](https://github.com/openai/chatkit-python/blob/main/docs/server.md) 了解如何处理传入请求、运行工具以及将结果流式传输回客户端。以下代码片段展示了主要组件。

### 1\. 安装服务器包

```
pip install openai-chatkit
```

### 2\. 实现服务器类

`ChatKitServer` 驱动对话。重写 `respond` 方法，在用户消息或客户端工具输出到达时流式传输事件。像 `stream_agent_response` 这样的辅助方法使连接到 Agents SDK 变得简单。

```python
class MyChatKitServer(ChatKitServer):
    def __init__(self, data_store: Store, file_store: FileStore | None = None):
        super().__init__(data_store, file_store)

    assistant_agent = Agent[AgentContext](
        model="gpt-4.1",
        name="Assistant",
        instructions="You are a helpful assistant",
    )

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        result = Runner.run_streamed(
            self.assistant_agent,
            await to_input_item(input, self.to_message_content),
            context=agent_context,
        )
        async for event in stream_agent_response(agent_context, result):
            yield event

    async def to_message_content(
        self, input: FilePart | ImagePart
    ) -> ResponseInputContentParam:
        raise NotImplementedError()
```

### 3\. 暴露端点

使用你选择的框架将 HTTP 请求转发到服务器实例。例如，使用 FastAPI：

```javascript
app = FastAPI()
data_store = SQLiteStore()
file_store = DiskFileStore(data_store)
server = MyChatKitServer(data_store, file_store)

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    result = await server.process(await request.body(), {})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

### 4\. 建立数据存储契约

实现 `chatkit.store.Store` 来使用你偏好的数据库持久化线程、消息和文件。默认示例使用 SQLite 进行本地开发。考虑将模型存储为 JSON blob，这样库更新可以在不需要迁移的情况下演进 schema。

### 5\. 提供文件存储契约

如果你支持上传，请提供 `FileStore` 实现。ChatKit 支持直接上传（客户端将文件 POST 到你的端点）或两阶段上传（客户端请求签名 URL，然后上传到云存储）。暴露预览以支持内联缩略图，并在线程被删除时处理文件删除。

### 6\. 从服务器触发客户端工具

客户端工具必须同时在客户端选项和你的 Agent 中注册。使用 `ctx.context.client_tool_call` 从 Agents SDK 工具中排队调用。

```
@function_tool(description_override="Add an item to the user's todo list.")
async def add_to_todo_list(ctx: RunContextWrapper[AgentContext], item: str) -> None:
    ctx.context.client_tool_call = ClientToolCall(
        name="add_to_todo_list",
        arguments={"item": item},
    )

assistant_agent = Agent[AgentContext](
    model="gpt-4.1",
    name="Assistant",
    instructions="You are a helpful assistant",
    tools=[add_to_todo_list],
    tool_use_behavior=StopAtTools(stop_at_tool_names=[add_to_todo_list.name]),
)
```

### 7\. 使用线程元数据和状态

使用 `thread.metadata` 存储服务器端状态，例如之前的 Responses API 运行 ID 或自定义标签。元数据不会暴露给客户端，但在每次 `respond` 调用中都可用。

### 8\. 获取工具状态更新

长时间运行的工具可以通过 `ProgressUpdateEvent` 将进度流式传输到 UI。ChatKit 会用下一条助手消息或组件输出替换进度事件。

### 9\. 使用服务器上下文

将自定义上下文对象传递给 `server.process(body, context)` 以强制执行权限或通过你的存储和文件存储实现传播用户身份。

## 添加内联交互式组件

组件让 Agent 在聊天界面中展示丰富的 UI。用它们来展示卡片、表单、文本块、列表和其他布局。辅助方法 `stream_widget` 可以立即渲染组件或在更新到达时流式传输更新。

```
async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    widget = Card(
        children=[Text(
            id="description",
            value="Generated summary",
        )]
    )
    async for event in stream_widget(
        thread,
        widget,
        generate_id=lambda item_type: self.store.generate_item_id(item_type, thread, context),
    ):
        yield event
```

ChatKit 附带了丰富的组件节点集合（卡片、列表、表单、文本、按钮等）。查看 [GitHub 上的组件指南](https://github.com/openai/chatkit-python/blob/main/docs/widgets.md) 了解所有组件、属性和流式传输指导。

查看 [Widget Builder](https://widgets.chatkit.studio/) 在交互式 UI 中探索和创建组件。

## 使用操作

操作让 ChatKit UI 在不发送用户消息的情况下触发工作。将 `ActionConfig` 附加到任何支持它的组件节点——按钮、选择器和其他控件可以流式传输新的线程项目或就地更新组件。当组件位于 `Form` 内部时，ChatKit 会在操作负载中包含收集的表单值。

在服务器端，在 `ChatKitServer` 上实现 `action` 方法来处理负载并可选地流式传输额外事件。你也可以通过设置 `handler="client"` 在客户端处理操作，在 JavaScript 中响应后再将后续工作转发到服务器。

查看 [GitHub 上的操作指南](https://github.com/openai/chatkit-python/blob/main/docs/actions.md) 了解链式操作、创建强类型负载以及协调客户端/服务器处理程序等模式。

## 资源

使用以下资源和参考来完成你的集成。

### 设计资源

*   下载 [OpenAI Sans Variable](https://drive.google.com/file/d/10-dMu1Oknxg3cNPHZOda9a1nEkSwSXE1/view?usp=sharing)。
*   复制文件并为你的产品自定义组件。

### 事件参考

ChatKit 从 Web Component 发出 `CustomEvent` 实例。负载结构如下：

```text
type Events = {
  "chatkit.error": CustomEvent<{ error: Error }>;
  "chatkit.response.start": CustomEvent&lt;void>;
  "chatkit.response.end": CustomEvent&lt;void>;
  "chatkit.thread.change": CustomEvent<{ threadId: string | null }>;
  "chatkit.log": CustomEvent<{ name: string; data?: Record&lt;string, unknown> }>;
};
```

### 选项参考

| 选项 | 类型 | 描述 | 默认值 |
| --- | --- | --- | --- |
| `apiURL` | `string` | 实现 ChatKit 服务器协议的端点。 | _必填_ |
| `fetch` | `typeof fetch` | 覆盖 fetch 调用（用于自定义请求头或认证）。 | `window.fetch` |
| `theme` | `"light" | "dark"` | UI 主题。 | `"light"` |
| `initialThread` | `string | null` | 挂载时打开的线程；`null` 显示新线程视图。 | `null` |
| `clientTools` | `Record<string, Function>` | 暴露给模型的客户端执行工具。 |  |
| `header` | `object | boolean` | 头部配置或 `false` 隐藏头部。 | `true` |
| `newThreadView` | `object` | 自定义问候文本和起始提示。 |  |
| `messages` | `object` | 配置消息功能（反馈、注释等）。 |  |
| `composer` | `object` | 控制附件、实体标签和占位符文本。 |  |
| `entities` | `object` | 实体查找、点击处理和预览的回调。 |  |
