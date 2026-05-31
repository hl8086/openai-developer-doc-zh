
模型选择是帮助开发者改进 AI 应用的重要手段。在 OpenAI 平台上使用评估功能时，除了可以评估 OpenAI 的原生模型外，您还可以评估各种外部模型。

我们支持访问**第三方模型**（无需 API 密钥）和访问**自定义端点**（需要 API 密钥）。

## 第三方模型

要使用第三方模型，必须满足以下条件：

*   您的 OpenAI 组织必须处于[使用层级 1](/guides/rate-limits/usage-tiers#usage-tiers) 或更高层级。
*   您的 OpenAI 组织管理员必须通过 [Settings > Organization > General](https://platform.openai.com/settings/organization/general) 启用此功能。要启用此功能，管理员必须接受所显示的使用免责声明。

对外部模型的调用会将数据传递给第三方，并且与调用 OpenAI 模型相比，受不同的条款约束且安全保障较弱。

### 计费和使用限制

OpenAI 目前承担第三方模型的推理费用，但受以下基于您组织使用层级的月度限额约束。

| 使用层级 | 月度消费限额（美元） |
| --- | --- |
| Tier 1 | $5 |
| Tier 2 | $25 |
| Tier 3 | $50 |
| Tier 4 | $100 |
| Tier 5 | $200 |

我们通过合作伙伴 OpenRouter 提供这些模型。未来，第三方模型将作为您常规 OpenAI 计费周期的一部分收费，按 [OpenRouter 列表价格](https://openrouter.ai/models)计算。

### 可用的第三方模型

我们提供以下外部模型提供商的访问：

*   Google
*   Anthropic（托管在 AWS Bedrock 上）
*   Together
*   Fireworks

## 自定义端点

您可以配置完全自定义的模型端点，并在 OpenAI 平台上对其运行评估。这通常是我们未原生支持的提供商、您自行托管的模型，或者您用于进行推理调用的自定义代理。

要使用此功能，您的 OpenAI 组织管理员必须通过 [Settings > Organization > General](https://platform.openai.com/settings/organization/general) 启用"Enable custom providers for evaluations"设置。要启用此功能，管理员必须接受所显示的使用免责声明。请注意，对外部模型的调用会将数据传递给第三方，并且与调用 OpenAI 模型相比，受不同的条款约束且安全保障较弱。

一旦您有资格使用自定义提供商，您可以在 [Settings](https://platform.openai.com/settings/) 的 **Evaluations** 标签页下设置提供商。请注意，自定义提供商是按项目配置的。要连接您的自定义端点，您需要：

*   与 [OpenAI 的 chat completions 端点]( https://developers.openai.com/api/reference/chat/create)兼容的端点
*   一个 API 密钥

为您的端点命名，提供端点 URL，并指定您的 API 密钥。我们要求您使用 `https://` 端点，并且我们会加密您的密钥以确保安全。指定您希望评估的任何模型名称（slugs）。您可以点击 **Verify** 按钮来确保您的模型设置正确。这将向您的每个模型 slug 发送包含最少输入的测试调用，并指示任何失败情况。

## 使用外部模型运行评估

配置好外部模型后，您可以通过在[数据集](https://platform.openai.com/evaluation)或[评估](https://platform.openai.com/evaluation?tab=evals)中的模型选择器中选择它来用于评估。请注意，目前不支持工具调用。

| 模型类型 | 数据集 | 评估 |
| --- | --- | --- |
| 第三方 |  |  |
| 自定义 |  |  |

## 后续步骤

如需更多灵感，请访问 [OpenAI Cookbook](/cookbook)，其中包含示例代码和第三方资源链接，或了解更多关于我们评估工具的信息：

[评估入门 - 使用数据集快速构建评估并迭代提示词。](/guides/evaluation-getting-started)

[使用评估 - 针对外部模型进行评估、通过 API 与评估交互等。](/guides/evals)
