# Authentication

> Learn authentication options for GPT Actions.

Actions 提供不同的认证方案以适应各种使用场景。要为你的 action 指定认证方案，请使用 GPT 编辑器并选择 "None"、"API Key" 或 "OAuth"。

默认情况下，所有 actions 的认证方式设置为 "None"，但你可以更改此设置，并允许不同的 actions 使用不同的认证方式。

## 无认证

我们支持无需认证的流程，适用于用户可以直接向你的 API 发送请求而无需 API 密钥或通过 OAuth 登录的应用程序。

考虑在初始用户交互中使用无认证方式，因为如果强制用户登录应用程序，可能会导致用户流失。你可以创建一个"未登录"体验，然后通过启用单独的 action 将用户转移到"已登录"体验。

## API 密钥认证

就像用户可能已经在使用你的 API 一样，我们允许通过 GPT 编辑器 UI 进行 API 密钥认证。我们在将密钥存储到数据库时会对其进行加密，以确保你的 API 密钥安全。

这种方法适用于你的 API 执行的操作比无认证流程稍微重要一些，但不需要单个用户登录的情况。添加 API 密钥认证可以保护你的 API，并为你提供更细粒度的访问控制以及对请求来源的可见性。

## OAuth

Actions 允许每个用户进行 OAuth 登录。这是提供个性化体验并为用户提供最强大 actions 的最佳方式。使用 actions 的 OAuth 流程的简单示例如下：

*   首先，在 GPT 编辑器 UI 中选择 "Authentication"，然后选择 "OAuth"。
*   系统会提示你输入 OAuth client ID、client secret、authorization URL、token URL 和 scope。
    *   client ID 和 secret 可以是简单的文本字符串，但应[遵循 OAuth 最佳实践](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/)。
    *   我们存储 client secret 的加密版本，而 client ID 对最终用户可见。
*   OAuth 请求将包含以下信息：`request={'grant_type': 'authorization_code', 'client_id': 'YOUR_CLIENT_ID', 'client_secret': 'YOUR_CLIENT_SECRET', 'code': 'abc123', 'redirect_uri': 'https://chat.openai.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback'}` 注意：`https://chatgpt.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback` 也是有效的。
*   为了让用户使用带有 OAuth 的 action，他们需要发送一条触发该 action 的消息，然后用户将在 ChatGPT UI 中看到一个 "Sign in to \[domain\]" 按钮。
*   `authorization_url` 端点应返回如下响应：`{ "access_token": "example_token", "token_type": "bearer", "refresh_token": "example_token", "expires_in": 59 }`
*   在用户登录过程中，ChatGPT 使用指定的 `authorization_content_type` 向你的 `authorization_url` 发出请求，我们期望获得一个 access token 和可选的 [refresh token](https://auth0.com/learn/refresh-tokens)，我们使用它来定期获取新的 access token。
*   每次用户向 action 发出请求时，用户的 token 将通过 Authorization 头传递：("Authorization": "\[Bearer/Basic\] \[user's token\]")。
*   出于安全原因，我们要求 OAuth 应用程序使用 [state 参数](https://auth0.com/docs/secure/attack-protection/state-parameters#set-and-compare-state-parameter-values)。

自定义 GPTs 上的登录失败问题（重定向 URL）？

*   请确保在你的 OAuth 应用程序中启用以下重定向 URL：
*   #1 重定向 URL：`https://chat.openai.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback`（某些客户端可能使用不同的域名）
*   #2 重定向 URL：`https://chatgpt.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback`（保存后在 ChatGPT UI 的 URL 栏中获取你的 GPT ID）如果你有多个 GPTs，则需要为每个启用或根据风险承受能力使用通配符。
*   调试提示：你的认证提供商通常会记录失败信息（例如 'redirect\_uri is not registered for client'），这有助于调试登录问题。
