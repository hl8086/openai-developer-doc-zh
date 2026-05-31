# Permissions

基于角色的访问控制（RBAC）让你决定谁可以在组织和项目中执行哪些操作——无论是通过 API 还是在 Dashboard 中。相同的权限管理两个界面：如果某人可以调用某个端点（例如 `/v1/chat/completions`），他们就可以使用对应的 Dashboard 页面，而缺少权限则会禁用相关的 UI（例如 Playground 中的 **Upload** 按钮）。通过 RBAC，你可以：

*   对用户进行分组并大规模分配权限
*   创建具有所需精确权限的自定义角色
*   在组织或项目级别限定访问范围
*   在 Dashboard 和 API 中强制执行一致的权限

## 核心概念

*   **组织（Organization）**：你的顶级账户。组织角色可以授予跨所有项目的访问权限。
*   **项目（Project）**：用于密钥、文件和资源的工作空间。项目角色仅在该项目内授予访问权限。
*   **群组（Groups）**：可以为其分配角色的用户集合。群组可以从你的身份提供商（通过 SCIM）同步，以自动保持成员关系最新。
*   **角色（Roles）**：权限的集合（如 Models Request 或 Files Write）。角色可以在**组织设置**下为组织创建，也可以在特定项目的设置下为该项目创建。创建后，组织或项目角色可以分配给用户或群组。用户可以拥有多个角色，其访问权限是这些角色的并集。
*   **权限（Permissions）**：角色允许的具体操作（例如，向模型发送请求、读取文件、写入文件、管理密钥）。

### 权限

下表显示了可用的权限、哪些预设角色包含这些权限，以及是否可以为自定义角色配置这些权限。

| 领域 | 允许的操作 | 组织所有者权限 | 组织读者权限 | 项目所有者权限 | 项目成员权限 | 项目查看者权限 | 可用于自定义角色 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| List models | 列出此组织有权访问的模型 | `Read` | `Read` | `Read` | `Read` | `Read` | ✓ |
| Groups | 查看和管理群组 | `Read`, `Write` | `Read` | `Read`, `Write` | `Read`, `Write` | `Read` |  |
| Roles | 查看和管理角色 | `Read`, `Write` | `Read` | `Read`, `Write` | `Read`, `Write` | `Read` |  |
| Organization Admin | 管理组织用户、项目、邀请、管理员 API 密钥和速率限制 | `Read`, `Write` |  |  |  |  |  |
| Usage | 查看使用量仪表板和导出 | `Read` |  |  |  |  | ✓ |
| External Keys | 查看和管理企业密钥管理的密钥 | `Read`, `Write` |  |  |  |  |  |
| IP allowlist | 查看和管理 IP 白名单 | `Read`, `Write` |  |  |  |  |  |
| mTLS | 查看和管理双向 TLS 设置 | `Read`, `Write` |  |  |  |  |  |
| OIDC | 查看和管理 OIDC 配置 | `Read`, `Write` |  |  |  |  |  |
| Model capabilities | 向 chat completions、audio、embeddings 和 images 发送请求 | `Request` | `Request` | `Request` | `Request` |  | ✓ |
| Assistants | 创建和检索 Assistants | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Threads | 创建和检索 Threads/Messages/Runs | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Evals | 创建、检索和删除 Evals | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Fine-tuning | 创建和检索微调任务 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Files | 创建和检索文件 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Vector Stores | 创建和检索向量存储 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` |  | ✓ |
| Responses API | 创建响应 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` |  | ✓ |
| Prompts | 创建和检索用作 Responses API 和 Realtime API 上下文的提示词 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Webhooks | 在项目中创建和查看 webhooks | `Read`, `Write` | `Read` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Datasets | 创建和检索数据集 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Apps | 在 Dashboard 中创建、管理和提交应用以供审核 | `Read`, `Write` |  |  |  |  | ✓ |
| Project API Keys | 用户管理自己 API 密钥的权限 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |
| Project Administration | 通过管理 API 管理项目用户、服务账户、API 密钥和速率限制 | `Read`, `Write` |  | `Read`, `Write` |  |  |  |
| Batch | 创建和管理批处理任务 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` |  |
| Service Accounts | 查看和管理项目服务账户 | `Read`, `Write` |  | `Read`, `Write` |  |  |  |
| Videos | 创建和检索视频 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` |  |  |
| Voices | 创建和检索语音 | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read`, `Write` | `Read` |  |
| Agent Builder | 在 Agent Builder 中创建和管理代理及工作流 | `Read`, `Write` | `Read` | `Read`, `Write` | `Read`, `Write` | `Read` | ✓ |

## 设置 RBAC

角色变更和群组同步最多需要 **30 分钟**才能生效。

1.  **创建群组** 为团队添加群组（例如"数据科学"、"支持"）。如果你使用 IdP，请启用 SCIM 同步以保持群组成员关系最新。
    
2.  **创建自定义角色** 从最小权限开始。例如：
    
    *   _Model Tester_：Models Read、Model Capabilities Request、Evals
    *   _Model Engineer_：Model Capabilities Request、Files Read/Write、Fine-tuning
    *   _App Publisher_：Apps Read、Apps Write
3.  **分配角色**
    
    *   **组织级别**角色适用于所有地方（组织内的所有项目）。
    *   **项目级别**角色仅适用于该项目。你可以将角色分配给**用户**和**群组**。用户可以拥有多个角色；访问权限是这些角色的**并集**。
4.  **验证** 使用非所有者账户确认预期的访问权限（API 和 Dashboard）。如果用户能看到超出需要的内容，请调整角色。
    

使用最小权限原则。从任务所需的最低权限开始，然后仅在需要时添加更多权限。

## 访问配置示例

### 小型团队

*   为核心团队提供具有 Model Capabilities Request 和 Files Read/Write 的组织级角色。
*   为每个应用创建一个项目；仅将承包商添加到这些项目中，并使用项目级角色。

### 大型组织

*   从你的 IdP 同步群组（例如"研究"、"支持"、"财务"）。
*   按职能创建自定义角色并在组织级别分配；或者仅在项目需要更严格控制时授予项目特定角色。

### 承包商和供应商

*   创建一个没有组织级角色的"承包商"群组。
*   将他们添加到特定项目中，并使用范围较窄的项目角色（例如，只读访问）。

## 用户访问权限的评估方式

在 Dashboard 中，我们组合：

*   来自**组织**的角色（直接分配 + 通过群组分配）
*   来自**项目**的角色（直接分配 + 通过群组分配）

有效权限是所有已分配角色的**并集**。

如果使用项目中的 API 密钥发送请求，我们会获取分配给该 API 密钥的权限，并确保用户拥有某个授予这些权限的项目角色。例如，如果请求 /v1/models，API 密钥必须分配了 api.model.read，并且用户必须拥有包含 api.model.read 的项目角色。

## 最佳实践

*   **用群组建模你的组织**：在 IdP 中镜像团队，将角色分配给群组而非个人。
*   **职责分离**：读取模型 vs. 上传文件 vs. 管理密钥。
*   **项目边界**：将实验、预发布和生产环境放在不同的项目中。
*   **定期审查**：移除未使用的角色和密钥；轮换敏感密钥。
*   **以非所有者身份测试**：在大范围推广之前验证访问权限是否符合预期。
