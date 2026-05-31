# Secure MCP Tunnel

> Connect private MCP servers to supported OpenAI products without exposing them to the public internet.

Secure MCP Tunnel 允许你将私有 MCP 服务器连接到受支持的 OpenAI 产品，无需开放入站防火墙端口或将这些服务器暴露到公共互联网。在能够访问你的 MCP 服务器的网络内运行 `tunnel-client`；它会向 OpenAI 打开一条出站 HTTPS 路径，拉取排队的 MCP 工作，将请求转发到本地，并通过同一隧道返回响应。

## 什么是 MCP 隧道？

MCP 隧道是从你网络内部的主机到 OpenAI 托管的 MCP 端点的仅出站连接。当你的 MCP 服务器是私有的、本地部署的或位于防火墙后面，但 ChatGPT、Codex、Responses API 或其他受支持的 OpenAI 产品仍需要调用它时，可以使用此功能。

Secure MCP Tunnel 保持 MCP 服务器的私密性，同时为受支持的 OpenAI 产品提供正常的 MCP 请求路径。`tunnel-client` 向 OpenAI 轮询工作，将 MCP 请求转发到本地，并通过同一隧道返回响应。

## 适用场景

*   你的 MCP 服务器运行在私有网络、本地环境、开发者机器上或现有访问控制之后。
*   你希望 ChatGPT、Codex、Responses API 或其他受支持的 OpenAI 产品使用该服务器，而无需将 MCP 服务器公开。
*   你的网络允许运行 `tunnel-client` 的主机默认向 `api.openai.com:443` 发出出站 HTTPS 请求，或在配置了控制平面 mTLS 时向 `mtls.api.openai.com:443` 发出请求，并能访问私有 MCP 服务器。
*   请先阅读 [MCP 和连接器指南](/guides/tools-connectors-mcp) 了解通用 MCP 概念。

## 工作原理

1.  在 Platform 隧道设置中创建或管理 OpenAI 托管的 MCP 隧道端点。
2.  在能够访问你的私有 MCP 服务器的网络内运行 `tunnel-client`。
3.  使用隧道身份和私有 MCP 服务器地址配置 `tunnel-client`。
4.  OpenAI 产品将 MCP 请求发送到 OpenAI 托管的隧道端点。
5.  `tunnel-client` 长轮询排队的工作，将每个 `JSON-RPC` 请求转发到私有 MCP 服务器，并通过隧道将响应发回。

私有 MCP 服务器不需要公共监听器。OpenAI 托管的端点为受支持的产品提供正常的 MCP 请求路径，而网络发起点保持在你的边界内。当连接器请求流式结果时，隧道路径可以转发中间的服务器发送事件。

![图示：OpenAI 产品通过 OpenAI 隧道服务将 MCP JSON-RPC 发送到 tunnel-client，tunnel-client 将请求转发到私有 MCP 服务器并通过同一隧道返回响应。]( https://cdn.openai.com/API/docs/images/platform/guides/secure-mcp-tunnels/request-flow-diagram.png)


OpenAI 产品调用 OpenAI 托管的隧道端点；`tunnel-client` 长轮询排队的工作并通过同一隧道返回 MCP 响应。

## 开始之前

你需要：

*   来自 [Platform 隧道设置](https://platform.openai.com/settings/organization/tunnels) 的 `tunnel_id`。
*   用于 `tunnel-client` 的运行时 API 密钥。密钥主体需要目标隧道的 Tunnels **Read** + **Use** 权限。
*   如果需要创建或编辑隧道元数据，则需要具有 Tunnels **Read** + **Manage** 权限的隧道管理员。
*   一个 `tunnel-client` 可以从你的网络内部通过 stdio 或 HTTP 访问的 MCP 服务器。

## 网络要求

`tunnel-client` 不需要入站互联网访问。它需要到 OpenAI 的出站 HTTPS 连接以及到私有 MCP 服务器的本地可达性：

| 从 | 到 | 用途 |
| --- | --- | --- |
| 运行 `tunnel-client` 的主机 | 通过 HTTPS 访问 `api.openai.com:443` 的 `/v1/tunnel/*` | 默认轮询和响应发送。 |
| 运行 `tunnel-client` 的主机 | 通过 HTTPS 访问 `mtls.api.openai.com:443` 的 `/v1/tunnel/*` | 配置控制平面 mTLS 时的轮询和响应发送。 |
| 运行 `tunnel-client` 的主机 | 配置的 stdio 命令或 MCP 服务器 URL | 从你的网络内部转发 MCP 请求。 |

## 设置 tunnel-client

打开 [Platform 隧道设置](https://platform.openai.com/settings/organization/tunnels)，然后使用那里的下载链接或来自 [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest) 的最新公开 `tunnel-client` 发布版本。将你的运维手册指向最新发布 URL，而不是硬编码特定的发布 URL。

如果你已有二进制文件，请从 `tunnel-client help quickstart` 开始。对于命名的本地 stdio 配置文件，使用：

```
export CONTROL_PLANE_API_KEY="sk-..."

tunnel-client init \
  --sample sample_mcp_stdio_local \
  --profile local-stdio \
  --tunnel-id tunnel_0123456789abcdef0123456789abcdef \
  --mcp-command "python /path/to/server.py"

tunnel-client doctor --profile local-stdio --explain
tunnel-client run --profile local-stdio
```

对于 HTTP MCP 服务器，使用 `--mcp-server-url https://mcp.internal.example.com/mcp` 代替 `--mcp-command`。

在创建或测试连接器时，保持 `tunnel-client run ...` 运行正常。连接器发现和 MCP 工具调用依赖于正在运行的客户端。

![本地 tunnel-client 管理 UI 实时显示健康状态、就绪状态、隧道元数据和通道状态。]( https://cdn.openai.com/API/docs/images/platform/guides/secure-mcp-tunnels/tunnel-client-admin-ui.png)


`/ui` 处的本地管理 UI 显示运行中的客户端是否健康、就绪并已连接，然后你可以从 ChatGPT、Codex 或 API 流程进行测试。

## 选择运行 tunnel-client 的位置

在能够访问私有 MCP 服务器的同一信任边界内运行 `tunnel-client`。常见的部署模式包括：

*   **Kubernetes sidecar：** 在一个 Pod 中将 `tunnel-client` 与 MCP 服务器一起运行，通过 `localhost` 连接。
*   **独立 Kubernetes 部署：** 当 MCP 服务器已经可以通过私有 Service 访问时，单独运行 `tunnel-client`。
*   **VM 或 systemd 服务：** 在可以通过私有网络访问 MCP 服务器的主机上运行 `tunnel-client`。

## 从 ChatGPT 连接

打开 [ChatGPT 连接器设置](https://chatgpt.com/#settings/Connectors)，创建自定义连接器，然后在 **Connection** 下选择 **Tunnel**。当 ChatGPT 列出可用隧道时选择一个，或者如果你已有 `tunnel_id` 则直接粘贴。

如果隧道未出现在 ChatGPT 中，请验证隧道是否已关联到目标工作区，以及连接器操作者是否具有 Tunnels **Read** + **Use** 权限。

## 安全性和网络

![图示：tunnel-client 在客户控制的环境内通过出站连接到 OpenAI 管理的隧道控制平面，而私有 MCP 服务器保持在客户网络内部。]( https://cdn.openai.com/API/docs/images/platform/guides/secure-mcp-tunnels/trust-boundaries-diagram.png)


私有 MCP 服务器保持在客户控制的环境内。`tunnel-client` 使用运行时 API 密钥通过出站 HTTPS 连接到 OpenAI，在需要时还可使用可选的控制平面 mTLS。

*   MCP 服务器地址保持私密，仅从 `tunnel-client` 运行的环境内部使用。
*   `tunnel-client` 向 OpenAI 隧道控制平面进行身份验证；受支持的 OpenAI 产品使用 OpenAI 托管的隧道端点。
*   隧道访问遵循现有的组织和工作区上下文，而不是引入单独的公共入口路径。
*   `tunnel-client` 支持企业网络需求，如出站代理、自定义 CA 证书包、控制平面客户端证书和 MCP 端的 `mTLS`。

## 高级功能：白名单 HTTP 外部调用

Secure MCP Tunnel 还可以支持从受支持的代理或 API 流程到客户网络的范围受限的 HTTP 外部调用。`tunnel-client` 包含一个内嵌的 MCP 服务器 Harpoon，它按标签公开配置的 HTTP 目标，并允许调用者通过隧道以有限的请求/响应大小调用它们。

当你需要访问少量私有 REST 端点而不将它们公开暴露时，可以使用此功能。Harpoon 不是通用代理：调用者不能选择任意主机，请求仅限于客户配置的目标和方法。

## 故障排除

*   **隧道在 ChatGPT 中不可见：** 检查隧道的工作区范围和连接器操作者的 Tunnels **Use** 权限。
*   **连接器发现或工具调用失败：** 确认 `tunnel-client run ...` 仍在运行，然后重新运行 `tunnel-client doctor --profile `&lt;name>` --explain`。
*   **你可以查看隧道但无法编辑：** 操作者可能具有 Tunnels **Read** 但没有 Tunnels **Manage** 权限。
*   `tunnel-client` 暴露 `/healthz`、`/readyz`、`/metrics` 和位于 `/ui` 的本地管理 UI。
*   管理 UI 默认仅限本地回环访问。仅在你确实需要操作网络访问时才将其远程暴露。
*   使用这些接口确认客户端健康、就绪且正在轮询，然后再从 ChatGPT、Codex 或 API 流程进行测试。
*   如果客户端未连接，通过隧道的请求将失败，直到 `tunnel-client` 重新连接。
*   原始 HTTP 日志默认禁用，支持导出已脱敏。

## OAuth

*   OAuth 发现可以通过隧道路径传输，因此 MCP 服务器本身可以保持私密。
*   隧道保留浏览器端 OAuth 流程所需的上游授权服务器元数据。
*   授权服务器本身不会自动通过隧道传输。如果它从公共互联网和 `tunnel-client` 主机都无法访问，即使 MCP 服务器可达，OAuth 流程仍可能失败。

## 配置位置

*   在 [Platform 隧道设置](https://platform.openai.com/settings/organization/tunnels) 中管理 OpenAI 托管的 MCP 隧道端点。
*   从 [ChatGPT 连接器设置](https://chatgpt.com/#settings/Connectors) 创建连接器时使用隧道。
*   对于 Codex 或 API 流程，使用受支持产品表面暴露的隧道支持的 MCP 目标。

## 后续步骤

*   在 [Platform 隧道设置](https://platform.openai.com/settings/organization/tunnels) 中创建或管理隧道。
*   使用 `tunnel-client doctor --profile `&lt;profile>` --explain` 验证你的 `tunnel-client` 配置文件。
*   从 [ChatGPT 连接器设置](https://chatgpt.com/#settings/Connectors) 或你正在使用的受支持 OpenAI 产品连接隧道。

[![Platform 隧道设置截图（已脱敏）。]( https://cdn.openai.com/API/docs/images/platform/guides/secure-mcp-tunnels/platform-tunnels-settings.png)](https://platform.openai.com/settings/organization/tunnels)

从 Platform 隧道设置创建和管理 OpenAI 托管的 MCP 隧道端点。

[![ChatGPT 连接器设置截图（已选择 Tunnel）（已脱敏）。]( https://cdn.openai.com/API/docs/images/platform/guides/secure-mcp-tunnels/chatgpt-connectors-tunnel.png)](https://chatgpt.com/#settings/Connectors)

在将 ChatGPT 连接器连接到私有 MCP 服务器时选择 Tunnel。
