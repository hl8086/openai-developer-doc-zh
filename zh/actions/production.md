# Production

> Deploy GPT Actions in production with best practices.

## 速率限制

考虑对你暴露的 API 端点实施速率限制。ChatGPT 会遵守 429 响应码，并在短时间内收到一定数量的 429 或 500 响应后，动态退避对你的 action 发送请求。

## 超时

在 actions 体验中进行 API 调用时，如果超过以下阈值将会发生超时：

*   API 调用的往返时间为 45 秒

## 使用 TLS 和 HTTPS

所有到你的 action 的流量必须在端口 443 上使用 TLS 1.2 或更高版本，并具有有效的公共证书。

## IP 出口范围

ChatGPT 将从 [chatgpt-connectors.json](https://openai.com/chatgpt-connectors.json) 中列出的 [CIDR 块](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) 中的某个 IP 地址调用你的 action。

你可能希望显式地将这些 IP 地址加入允许列表。此列表会定期自动更新。

## 多种认证方案

在定义 action 时，你可以将单一认证类型（OAuth 或 API key）与不需要认证的端点混合使用。

你可以在我们的 [actions 认证页面](/actions/authentication) 了解更多关于 action 认证的信息。

## Open API 规范限制

请注意 OpenAPI 规范中的以下限制，这些限制可能会发生变化：

*   API 规范中每个 API 端点描述/摘要字段最多 300 个字符
*   API 规范中每个 API 参数描述字段最多 700 个字符

## 其他限制

在使用 actions 构建时，需要注意以下一些限制：

*   不支持自定义头部
*   除 Google、Microsoft 和 Adobe OAuth 域名外，OAuth 流程中使用的所有域名必须与主要端点使用的域名相同
*   请求和响应的有效负载必须各自少于 100,000 个字符
*   请求在 45 秒后超时
*   请求和响应只能包含文本（不能包含图片或视频）

## 后果性标志

在 OpenAPI 规范中，你现在可以将某些端点设置为"后果性的"，如下所示：

```
paths:
  /todo:
    get:
      operationId: getTODOs
      description: Fetches items in a TODO list from the API.
      security: []
    post:
      operationId: updateTODOs
      description: Mutates the TODO list.
      x-openai-isConsequential: true
```

后果性 action 的一个好例子是代表用户预订酒店房间并付款。

*   如果 `x-openai-isConsequential` 字段为 `true`，ChatGPT 会将该操作视为"必须始终在运行前提示用户确认"，并且不显示"始终允许"按钮（这两者都是 GPTs 的功能，旨在让构建者和用户对 actions 有更多控制权）。
*   如果 `x-openai-isConsequential` 字段为 `false`，ChatGPT 会显示"始终允许"按钮。
*   如果该字段不存在，ChatGPT 默认将所有 GET 操作设为 `false`，将所有其他操作设为 `true`。

## 提供示例的最佳实践

以下是在编写 GPT 指令和 schema 描述以及设计 API 响应时应遵循的一些最佳实践：

1.  你的描述不应鼓励 GPT 在用户没有要求你的 action 特定类别服务时使用该 action。
    
    _错误示例_：
    
    > Whenever the user mentions any type of task, ask if they would like to use the TODO action to add something to their todo list.
    
    _正确示例_：
    
    > The TODO list can add, remove and view the user's TODOs.
    
2.  你的描述不应为 GPT 使用 action 规定特定的触发条件。ChatGPT 被设计为在适当时自动使用你的 action。
    
    _错误示例_：
    
    > When the user mentions a task, respond with "Would you like me to add this to your TODO list? Say 'yes' to continue."
    
    _正确示例_：
    
    > \[no instructions needed for this\]
    
3.  来自 API 的 action 响应应返回原始数据而非自然语言响应，除非有必要。GPT 会使用返回的数据提供自己的自然语言响应。
    
    _错误示例_：
    
    > I was able to find your todo list! You have 2 todos: get groceries and walk the dog. I can add more todos if you'd like!
    
    _正确示例_：
    
    > { "todos": \[ "get groceries", "walk the dog" \] }
    

## GPT Action 数据如何被使用

GPT Actions 将 ChatGPT 连接到外部应用。如果用户与 GPT 的自定义 action 交互，ChatGPT 可能会将其对话的部分内容发送到该 action 的端点。

如果你有问题或遇到其他限制，可以加入 [OpenAI 开发者论坛](https://community.openai.com) 的讨论。
