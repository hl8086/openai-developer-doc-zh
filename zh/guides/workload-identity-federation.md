
工作负载身份联合允许受信任的工作负载将外部签发的身份令牌交换为短期有效的 OpenAI 访问令牌。使用这些指南来配置您的外部身份提供商、创建 OpenAI 服务账户映射，并在无需存储长期有效 API 密钥的情况下对工作负载进行身份验证。

有关令牌交换请求和响应的详细信息、授权行为和当前限制，请参阅[工作负载身份令牌交换参考]( https://developers.openai.com/api/reference/workload-identity-federation)。

## 工作原理

工作负载身份联合包含四个部分：

1.  **工作负载身份提供商**描述受信任的签发者。它存储预期的 OIDC 签发者、受众和用于验证外部主体令牌的密钥来源。
2.  **服务账户映射**授权特定的外部令牌属性为项目中的特定 OpenAI 服务账户铸造令牌。
3.  **令牌交换**请求将外部主体令牌发送到 OpenAI 并返回短期有效的 OpenAI 访问令牌。
4.  工作负载使用 OpenAI 签发的访问令牌作为 Bearer 凭证来验证对 OpenAI API 的请求。

您必须是组织所有者才能配置此功能。要访问它，请前往 [Organization Settings > Security > Workload Identity Provider](https://platform.openai.com/settings/organization/security/workload-identity-provider)。从工作负载身份提供商详情页面配置服务账户映射。

## 选择设置指南

从与您的工作负载运行环境匹配的指南开始：

[Kubernetes在自管理集群中使用投射的服务账户令牌。](/guides/workload-identity-federation/kubernetes)

[AWS使用出站身份联合或 Amazon EKS 投射令牌。](/guides/workload-identity-federation/aws)

[Microsoft Azure使用托管身份令牌或 AKS 投射的服务账户令牌。](/guides/workload-identity-federation/microsoft-azure)

[Google Cloud使用元数据服务器身份令牌或 GKE 投射的服务账户令牌。](/guides/workload-identity-federation/google-cloud)

[GitHub Actions在持续集成工作流中使用 OIDC 令牌。](/guides/workload-identity-federation/github-actions)

OpenAI 在文档记录的配置中支持兼容 OIDC 的 JWT 主体令牌。如果您需要未列出的 OIDC 提供商，请联系我们。

每个提供商指南展示了如何在该平台上签发和检查主体令牌，以及如何配置 OpenAI SDK 将其交换为短期有效的 OpenAI 访问令牌。

## 配置工作负载身份提供商

为您信任的每个外部签发者创建一个工作负载身份提供商。工作负载身份联合支持 OIDC JWT 主体令牌。

工作负载身份提供商配置包含以下仪表板选项：

| 选项 | 描述 |
| --- | --- |
| Name | 组织中工作负载身份提供商的唯一名称。 |
| OIDC Issuer URL | 预期的 OIDC 签发者 URL。签发者比较会忽略尾部斜杠。 |
| Audience | 外部主体令牌上预期的 `aud` 声明。 |
| Description | 工作负载身份提供商的可选描述。 |
| Use uploaded JWKS for token verification | 启用后，OpenAI 使用上传的 JWKS 验证令牌，而不是从 OIDC 发现获取密钥。 |
| JWKS JSON | 启用上传 JWKS 验证时使用的上传公钥 JWKS 对象。JWKS 必须包含非空的 `keys` 数组且不包含私钥材料。 |
| Attribute transformations | 可选的 CEL 表达式，从令牌声明派生自定义 `openai.*` 属性用于映射决策。 |

### 使用 CEL 转换令牌声明

属性转换使用通用表达式语言（CEL）。OpenAI 支持 [langdef.md](https://github.com/google/cel-spec/blob/master/doc/langdef.md) 中指定的标准 CEL 运算符，不添加工作负载身份联合特定的自定义函数。每个表达式接收一个根对象：

*   `assertion`：已验证的 JWT 声明集。

在仪表板中，`openai.` 前缀会自动添加。输入后缀（如 `subject`）和表达式（如 `assertion.sub`）。API 将派生属性存储为 `openai.subject`。

```
[
  {
    "attribute": "openai.subject",
    "expression": "assertion.sub"
  },
  {
    "attribute": "openai.repository",
    "expression": "assertion.repository"
  }
]
```

使用 CEL 语言规范定义的 CEL 语法。例如，您可以使用 `assertion.sub` 或 `assertion.repository` 等表达式读取声明值。不支持的语法或函数会导致映射解析失败。

```
[
  {
    "attribute": "openai.repository_ref",
    "expression": "assertion.repository + \"@\" + assertion.ref"
  },
  {
    "attribute": "openai.production",
    "expression": "assertion.ref == \"refs/heads/main\""
  }
]
```

转换结果必须是标量值：字符串、布尔值、整数或有限数字。数组、对象、空值和求值错误会导致映射解析失败。OpenAI 在与映射值比较之前将标量转换结果转换为字符串。例如，`true` 变为 `"true"`，`7` 变为 `"7"`。

以 `openai.` 开头的映射键仅从属性转换中解析。已使用 `openai.` 前缀的原始主体令牌声明不会影响映射决策，除非您配置了匹配的转换。

### 管理 JWKS 和密钥轮换

OpenAI 使用工作负载身份提供商上配置的密钥来源验证 OIDC 主体令牌。

*   **OIDC 发现：** OpenAI 获取签发者的 `/.well-known/openid-configuration`，然后获取发现的 `jwks_uri`。发现文档和远程 JWKS 负载缓存 600 秒。
*   **未命中时刷新密钥：** 如果在缓存的 JWKS 中找不到令牌 `kid`，OpenAI 会刷新 JWKS 并在拒绝令牌之前重试查找。
*   **上传的 JWKS：** 当启用 **Use uploaded JWKS for token verification** 时，OpenAI 使用存储在工作负载身份提供商上的上传 JWKS，不执行 OIDC 发现或远程 JWKS 获取。保存提供商更新并可用于令牌交换后，新的交换使用保存的 JWKS。
*   **多个密钥：** JWKS 可以包含多个公钥，每个密钥必须具有唯一的非空 `kid`。

在签名密钥轮换期间，在轮换窗口内在签发者 JWKS 中同时发布旧密钥和新密钥。这样，由旧密钥签名的令牌可以继续工作，同时 OpenAI 接受由新密钥签名的令牌。对于上传 JWKS 模式，在使用新 `kid` 签发令牌之前更新工作负载身份提供商 JWKS；OpenAI 会拒绝由配置的 JWKS 中不存在的密钥签名的令牌。

## 配置服务账户映射

服务账户映射定义哪些外部身份可以为 OpenAI 服务账户铸造访问令牌。

映射配置包含以下仪表板选项：

| 选项 | 描述 |
| --- | --- |
| Name | 工作负载身份提供商内映射的唯一名称。 |
| Key | 要匹配的属性键。使用原始令牌声明（如 `sub`、`aud` 或 `iss`）或派生属性（如 `openai.subject`）。 |
| Value | 在 OpenAI 签发令牌之前必须匹配的属性值。 |
| Description | 映射的可选描述。 |
| Project | 拥有目标服务账户的项目。 |
| Service account | 工作负载可以使用的服务账户。您可以在所选项目中创建新的服务账户或选择现有的服务账户。 |
| Permissions | 可选的 API 权限，进一步缩小从此映射铸造的访问令牌的范围。这些权限不能授予超出映射服务账户的访问权限。 |

属性断言值必须是标量 JSON 值。字符串值可以使用一个尾部通配符，如 `repo:example/*`。通配符必须有非空前缀；单独的 `*` 不受支持。

有效的通配符值：

*   `repo:openai/*`
*   `repository:my-org/*`

无效的通配符值：

*   `*`
*   `repo:*:prod`
*   `repo/*/main`

仪表板将映射级别的限制显示为 **Permissions**。令牌交换响应在 `scope` 属性中将相同的限制公开为 OAuth 作用域。Admin API 作用域不能分配给工作负载身份提供商映射，并且在 OpenAI 铸造令牌后下游 API 授权仍然适用。

### 映射解析示例

映射解析在 OpenAI 验证外部主体令牌后开始。OpenAI 查找请求的 `identity_provider_id` 和 `service_account_id` 的映射，跳过已禁用的映射，仅评估每个映射所需的属性，并且仅在恰好一个启用的映射匹配所有配置的属性时才签发令牌。

例如，GitHub Actions 令牌可能包含以下声明：

```
{
  "iss": "https://token.actions.githubusercontent.com",
  "aud": "https://api.openai.com/v1",
  "sub": "repo:my-org/my-repo:ref:refs/heads/main",
  "repository": "my-org/my-repo",
  "ref": "refs/heads/main"
}
```

工作负载身份提供商可以定义派生属性：

```
[
  {
    "attribute": "openai.repository_ref",
    "expression": "assertion.repository + \"@\" + assertion.ref"
  }
]
```

然后服务账户映射可以同时要求原始属性和派生属性：

| 键 | 值 |
| --- | --- |
| `iss` | `https://token.actions.githubusercontent.com` |
| `sub` | `repo:my-org/my-repo:*` |
| `openai.repository_ref` | `my-org/my-repo@refs/heads/main` |

此映射仅在所有三个属性都匹配时才匹配。`sub` 值使用尾部通配符，因此它匹配任何具有前缀 `repo:my-org/my-repo:` 的值。`openai.repository_ref` 键从属性转换中解析；OpenAI 不使用名为 `openai.repository_ref` 的原始令牌声明。

如果多个启用的映射匹配同一令牌交换，OpenAI 会拒绝该交换。OpenAI 对每个 `(provider, service account)` 对强制执行唯一映射，不会跨多个映射组合权限。

## 安全建议

*   为每个应用程序或工作负载使用专用的 OpenAI 服务账户。
*   分离生产环境和非生产环境。
*   优先使用精确声明匹配而非宽泛的属性模式。
*   仅授予所需的最小 OpenAI 权限。
*   定期审查和删除未使用的映射。
*   监控令牌交换失败和意外的访问模式。
*   避免在不相关的工作负载之间共享身份。
