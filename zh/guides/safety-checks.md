# Safety checks

> Learn how OpenAI assesses for safety and how to pass safety checks.

我们对模型及其使用方式进行多种类型的评估。本指南介绍了我们如何进行安全测试，以及您可以采取哪些措施来避免违规。

## GPT-5 及后续模型的安全分类器

随着 [GPT-5](/models/gpt-5) 的推出，我们添加了一些检查机制来发现并阻止危险信息被访问。某些用户最终可能会尝试将您的应用程序用于 OpenAI 政策之外的用途，尤其是在具有广泛使用场景的应用程序中。

### 安全分类器流程

1.  我们将发送给 GPT-5 的请求按风险阈值进行分类。
2.  如果您的组织反复触及高风险阈值，OpenAI 将返回错误并发送警告邮件。
3.  如果在规定的时间阈值（通常为七天）之后请求仍在继续，我们将停止您的组织对 GPT-5 的访问权限。请求将不再生效。

### 如何避免错误、延迟和封禁

如果您的组织从事违反我们安全政策的可疑活动，我们可能会返回错误、限制模型访问，甚至封禁您的账户。以下安全措施帮助我们识别高风险请求的来源，并封禁单个终端用户，而不是封禁您的整个组织。

*   为个人用户与模型交互的产品[实施安全标识符](/guides/safety-best-practices#implement-safety-identifiers)。安全标识符是推荐使用的，但不是必需的。
*   如果您的使用场景需要访问限制较少的服务版本以从事生命科学领域的有益应用，请阅读我们的[特殊访问计划](https://help.openai.com/en/articles/11826767-life-science-research-special-access-program)，了解您是否符合条件。

### 为单个用户实施安全标识符

`safety_identifier` 参数在 [Responses API]( https://developers.openai.com/api/reference/responses/create) 和旧版 [Chat Completions API]( https://developers.openai.com/api/reference/chat/create) 中均可使用。Realtime API 通过 `OpenAI-Safety-Identifier` 请求头支持相同的概念。要使用安全标识符，请在每个请求中为您的终端用户提供一个稳定的 ID。对用户邮箱或内部用户 ID 进行哈希处理，以避免传递任何个人信息。

安全标识符不会在 API 或会话之间传递。如果您的应用程序已经在 Responses API 请求中发送了 `safety_identifier`，请在创建或连接每个 Realtime 会话时单独传递相同的稳定值。

Responses APIChat Completions APIRealtime API

Responses API

**通过 Responses API 提供安全标识符**

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
model="gpt-5.4-mini",
input="This is a test",
safety_identifier="user_123456",
)
```

```curl
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "gpt-5.4-mini",
"input": "This is a test",
"safety_identifier": "user_123456"
}'
```

:::




Chat Completions API

**通过 Chat Completions API 提供安全标识符**

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
model="gpt-5.4-mini",
messages=[
{"role": "user", "content": "This is a test"}
],
safety_identifier="user_123456"
)
```

```curl
curl https://api.openai.com/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "gpt-5.4-mini",
"messages": [
{"role": "user", "content": "This is a test"}
],
"safety_identifier": "user_123456"
}'
```

:::





Realtime API

**通过 Realtime API 提供安全标识符**

```curl
curl https://api.openai.com/v1/realtime/client_secrets \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "OpenAI-Safety-Identifier: user_123456" \
-d '{
"session": {
"type": "realtime",
"model": "gpt-realtime-2"
}
}'
```

### 可能的后果

如果 OpenAI 监控系统识别到潜在的滥用行为，我们可能会采取不同级别的措施：

*   **延迟流式响应**
    *   作为对可能违反政策的用户的初步、较低后果的干预措施，OpenAI 可能会在运行额外检查后延迟流式响应，然后再将完整响应返回给该用户。
    *   如果检查通过，流式传输开始。如果检查失败，请求将停止——不会显示任何 token，流式响应也不会开始。
    *   为了更好的终端用户体验，建议为流式传输延迟的情况添加加载动画。
*   **封禁单个用户的模型访问**
    *   在高置信度的政策违规情况下，关联的 `safety_identifier` 将被完全封禁，无法访问 OpenAI 模型。
    *   该安全标识符在所有后续使用相同标识符的 GPT-5 请求中将收到 `identifier blocked` 错误。OpenAI 目前无法解除对单个标识符的封禁。

为使这些封禁有效，请确保您已采取措施防止被封禁的用户简单地创建新账户。提醒一下，您的组织反复违反政策可能导致整个组织失去访问权限。

### 我们为什么这样做

具体的执行标准可能会根据不断变化的实际使用情况或新模型发布而调整。目前，OpenAI 可能会限制或封禁具有高风险或可疑生物或化学活动的安全标识符的访问。请参阅[博客文章](https://openai.com/index/preparing-for-future-ai-capabilities-in-biology/)，了解更多关于我们如何应对生物领域更高 AI 能力的信息。

## 其他类型的安全检查

为了帮助确保您使用 OpenAI API 和工具时的安全性，我们对自己的模型（包括所有微调模型）以及计算机使用工具进行安全检查。

了解更多：

*   [模型评估中心](https://openai.com/safety/evaluations-hub)
*   [网络安全](/codex/concepts/cyber-safety)
*   [微调安全](/guides/supervised-fine-tuning#safety-checks)
*   [计算机使用中的安全检查](/guides/tools-computer-use#acknowledge-safety-checks)
