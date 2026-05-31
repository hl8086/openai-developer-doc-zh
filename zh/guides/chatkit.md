# Overview

> Build and customize an embeddable chat with ChatKit.

ChatKit 是构建智能体聊天体验的最佳方式。无论你是在构建内部知识库助手、HR 入职帮手、研究伴侣、购物或日程安排助手、故障排除机器人、财务规划顾问还是客服代理，ChatKit 都提供了可定制的聊天嵌入组件来处理所有用户体验细节。

使用 ChatKit 的可嵌入 UI 组件、可定制提示词、工具调用支持、文件附件和思维链可视化来构建智能体，无需重新发明聊天 UI。

## 概述

实现 ChatKit 有两种方式：

*   **推荐集成方式**。在你的前端嵌入 ChatKit，自定义其外观和风格，让 OpenAI 从 [Agent Builder](/guides/agent-builder) 托管和扩展后端。需要一个开发服务器。
*   **高级集成方式**。在你自己的基础设施上运行 ChatKit。使用 ChatKit Python SDK 并连接到任何智能体后端。使用组件构建前端。

## ChatKit 入门

[在你的前端嵌入 ChatKit嵌入聊天组件，自定义其外观和风格，让 OpenAI 托管和扩展后端](#embed-chatkit-in-your-frontend)

[高级集成使用任何后端和 ChatKit SDK 构建你自己的自定义 ChatKit 用户体验](/guides/custom-chatkit)

## 在你的前端嵌入 ChatKit

从高层来看，设置 ChatKit 是一个三步流程。创建一个托管在 OpenAI 服务器上的智能体工作流。然后设置 ChatKit 并添加功能来构建你的聊天体验。

  

![OpenAI 托管的
ChatKit](https://cdn.openai.com/API/docs/images/openai-hosted.png)

### 1\. 创建智能体工作流

使用 [Agent Builder](/guides/agent-builder) 创建智能体工作流。Agent Builder 是一个用于设计多步骤智能体工作流的可视化画布。你将获得一个工作流 ID。

嵌入在你前端的聊天将指向你创建的工作流作为后端。

### 2\. 在你的产品中设置 ChatKit

要设置 ChatKit，你需要创建一个 ChatKit 会话并创建一个后端端点，传入你的工作流 ID，交换客户端密钥，添加脚本将 ChatKit 嵌入到你的站点中。

**重要安全提示：** 创建 ChatKit 会话时，你必须传入一个 `user` 参数，该参数对每个终端用户应该是唯一的。你的后端有责任验证应用程序的用户身份，并在此参数中传递他们的唯一标识符。

1.  在你的服务器上，生成一个客户端令牌。
    
    此代码片段启动一个 FastAPI 服务，其唯一任务是通过 [OpenAI Python SDK](https://github.com/openai/chatkit-python) 创建一个新的 ChatKit 会话并返回会话的客户端密钥：
    
    **server.py**
    
    ```python
    from fastapi import FastAPI
    from pydantic import BaseModel
    from openai import OpenAI
    import os
    
    app = FastAPI()
    openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    
    @app.post("/api/chatkit/session")
    def create_chatkit_session():
        session = openai.chatkit.sessions.create({
          # ...
        })
        return { client_secret: session.client_secret }
    ```
    
2.  在你的服务器端代码中，将你的工作流 ID 和密钥传递给会话端点。
    
    客户端密钥是你的 ChatKit 前端用来打开或刷新聊天会话的凭证。你不需要存储它；你只需立即将其传递给 ChatKit 客户端库。
    
    参见 GitHub 上的 [chatkit-js 仓库](https://github.com/openai/chatkit-js)。
    
    **chatkit.ts**
    
    ```typescript
    export default async function getChatKitSessionToken(
    deviceId: string
    ): Promise&lt;string> {
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
        Authorization: "Bearer " + process.env.VITE_OPENAI_API_SECRET_KEY,
        },
        body: JSON.stringify({
        workflow: { id: "wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1" },
        user: deviceId,
        }),
    });
    
    const { client_secret } = await response.json();
    
    return client_secret;
    }
    ```
    
3.  在你的项目目录中，安装 ChatKit React 绑定：
    
    ```
    npm install @openai/chatkit-react
    ```text
    
4.  将 ChatKit JS 脚本添加到你的页面。将此代码片段放入页面的 ``&lt;head>`` 或你加载脚本的任何位置，浏览器将为你获取并运行 ChatKit。
    
    **index.html**
    
    ```html
    &lt;script
    src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
    async
    >&lt;/script>
    ```
    
5.  在你的 UI 中渲染 ChatKit。此代码从你的服务器获取客户端密钥并挂载一个实时聊天组件，连接到你的工作流作为后端。
    
    **你的前端代码**
    
    ```react
    import { ChatKit, useChatKit } from '@openai/chatkit-react';
    
       export function MyChat() {
         const { control } = useChatKit({
           api: {
             async getClientSecret(existing) {
               if (existing) {
                 // implement session refresh
               }
    
               const res = await fetch('/api/chatkit/session', {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                 },
               });
               const { client_secret } = await res.json();
               return client_secret;
             },
           },
         });
    
         return &lt;ChatKit control={control} className="h-[600px] w-[320px]" />;
       }
    ```
    ```javascript
    const chatkit = document.getElementById('my-chat');
    
      chatkit.setOptions({
        api: {
          getClientSecret(currentClientSecret) {
            if (!currentClientSecret) {
              const res = await fetch('/api/chatkit/start', { method: 'POST' })
              const {client_secret} = await res.json();
              return client_secret
            }
            const res = await fetch('/api/chatkit/refresh', {
              method: 'POST',
              body: JSON.stringify({ currentClientSecret })
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const {client_secret} = await res.json();
            return client_secret
          }
        },
      });
    ```
    

### 3\. 构建和迭代

查看[自定义主题](/guides/chatkit-themes)、[组件](/guides/chatkit-widgets)和[操作](/guides/chatkit-actions)文档，了解更多关于 ChatKit 工作原理的信息。或探索以下资源来测试你的聊天、迭代提示词，以及添加组件和工具。

#### 构建你的实现

[GitHub 上的 ChatKit 文档 - 学习处理身份验证、添加主题和自定义等。](https://openai.github.io/chatkit-python)

[ChatKit Python SDK - 添加服务器端存储、访问控制、工具和其他后端功能。](https://github.com/openai/chatkit-python)

[ChatKit JS SDK - 查看 ChatKit JS 仓库。](https://github.com/openai/chatkit-js)

#### 探索 ChatKit UI

[chatkit.world - 体验 ChatKit 的交互式演示。](https://chatkit.world)

[组件构建器 - 浏览可用组件。](https://widgets.chatkit.studio)

[ChatKit 游乐场 - 通过交互式演示边做边学。](https://chatkit.studio/playground)

#### 查看工作示例

[GitHub 上的示例 - 查看 ChatKit 的工作示例并获取灵感。](https://github.com/openai/openai-chatkit-advanced-samples)

[入门应用仓库 - 克隆一个仓库，从完整的工作模板开始。](https://github.com/openai/openai-chatkit-starter-app)

## 后续步骤

当你对 ChatKit 实现满意后，了解如何通过[评估](/guides/agent-evals)来优化它。要在你自己的基础设施上运行 ChatKit，请参阅[高级集成文档](/guides/custom-chatkit)。
