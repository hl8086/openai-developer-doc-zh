# Node reference

> Explore all available nodes for composing workflows in Agent Builder.

[Agent Builder](https://platform.openai.com/agent-builder) 是一个用于组合智能体工作流的可视化画布。工作流由节点和连接组成，用于控制顺序和流程。插入节点，然后配置和连接它们，以定义你希望智能体遵循的流程。

浏览下方所有可用节点。要了解更多信息，请阅读 [Agent Builder 指南](/guides/agent-builder)。

### 核心节点

使用基本构建块开始。所有工作流都有起始节点和智能体节点。

![core nodes](https://cdn.openai.com/API/docs/images/core-nodes2.png)

#### Start

定义工作流的输入。对于聊天工作流中的用户输入，起始节点做两件事：

*   将用户输入追加到对话历史中
*   暴露 `input_as_text` 来表示此输入的文本内容

所有聊天起始节点都有 `input_as_text` 作为输入变量。你也可以添加状态变量。

#### Agent

定义指令、工具和模型配置，或附加评估。

保持每个智能体的范围明确。在我们的作业助手示例中，我们使用一个智能体来重写用户的查询，使其对知识库更具针对性和相关性。我们使用另一个智能体将查询分类为问答型或事实查找型，再使用另一个智能体来处理每种类型的问题。

像使用任何其他模型提示一样添加模型行为指令和用户消息。要传递上一步的输出，你可以将其作为上下文添加。

你可以拥有任意数量的智能体节点。

#### Note

为你的工作流留下注释和说明。与其他节点不同，笔记在流程中不会_执行_任何操作。它们只是为你和你的团队提供的有用注释。

### 工具节点

工具节点让你为智能体配备工具和外部服务。你可以检索数据、监控滥用行为，以及连接外部服务。

![tool nodes](https://cdn.openai.com/API/docs/images/tool-nodes2.png)

#### File search

从你在 OpenAI 平台上创建的向量存储中检索数据。通过向量存储 ID 进行搜索，并添加模型应搜索的查询内容。你可以使用变量来包含工作流中前序节点的输出。

参阅 [file search 文档](/guides/tools-file-search) 以设置向量存储并查看支持的文件类型。

要在 OpenAI 托管存储之外进行搜索，请改用 [MCP](#mcp)。

#### Guardrails

设置输入监控，以检测不需要的输入，例如个人身份信息（PII）、越狱攻击、幻觉和其他滥用行为。

Guardrails 默认为通过/失败模式，即它们测试前一个节点的输出，然后由你定义接下来发生什么。当 guardrails 检测失败时，我们建议结束工作流或返回上一步并提醒安全使用。

#### MCP

调用第三方工具和服务。通过 OpenAI connectors 或第三方服务器连接，或添加你自己的服务器。MCP 连接适用于需要在其他应用程序（如 Gmail 或 Zapier）中读取或搜索数据的工作流。

在 Agent Builder 中浏览选项。要了解更多关于 MCP 的信息，请参阅 [connectors 和 MCP 文档](/guides/tools-connectors-mcp)。

### 逻辑节点

![logic nodes](https://cdn.openai.com/API/docs/images/logic-nodes.png)

逻辑节点让你编写自定义逻辑并定义控制流——例如，在自定义条件上循环，或在继续操作之前请求用户批准。

#### If/else

添加条件逻辑。使用 [Common Expression Language](https://cel.dev/)（CEL）创建自定义表达式。适用于定义如何处理已分类的输入。

例如，如果智能体将输入分类为问答型，则将该查询路由到问答智能体以获得直接答案。如果是开放式查询，则路由到查找相关事实的智能体。否则，结束工作流。

#### While

在自定义条件上循环。使用 [Common Expression Language](https://cel.dev/)（CEL）创建自定义表达式。适用于检查某个条件是否仍然为真。

#### Human approval

交由最终用户进行审批。适用于智能体起草的工作在发出之前需要人工审核的工作流。

例如，想象一个代你发送电子邮件的智能体工作流。你需要包含一个输出电子邮件组件的智能体节点，然后紧接着一个人工审批节点。你可以配置人工审批节点询问"你希望我发送这封邮件吗？"，如果获得批准，则继续到连接 Gmail 的 MCP 节点。

### 数据节点

数据节点让你在工作流中定义和操作数据。重塑输出或定义全局变量以在整个工作流中使用。

![data nodes](https://cdn.openai.com/API/docs/images/data-nodes.png)

#### Transform

重塑输出（例如，对象 → 数组）。适用于强制类型以符合你的 schema，或重塑输出以便智能体作为输入读取和理解。

#### Set state

定义在整个工作流中使用的全局变量。适用于智能体接收输入并输出新内容，而你希望在整个工作流中使用该输出的场景。你可以将该输出定义为新的全局变量。
