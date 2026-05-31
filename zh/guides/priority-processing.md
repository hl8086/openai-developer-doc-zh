
优先处理（Priority processing）相比标准处理提供显著更低且更一致的延迟，同时保持按需付费的灵活性。

优先处理非常适合具有稳定流量且对延迟要求极高的高价值、面向用户的应用。优先处理不应用于数据处理、评估或其他流量波动极大的场景。

## 配置优先处理

发送到 Responses 或 Completions 端点的请求可以通过请求参数或项目设置来配置使用优先处理。

要在请求级别启用优先处理，请在 Completions 或 Responses 请求中包含 [`service_tier=priority`](https://platform.openai.com/docs/api-reference/responses/create#responses-create-service_tier) 参数。

**使用优先处理创建响应**

::: code-group
```curl
curl https://api.openai.com/v1/responses   -H "Authorization: Bearer $OPENAI_API_KEY"   -H "Content-Type: application/json"   -d '{
    "model": "gpt-5",
    "input": "What does 'fit check for my napalm era' mean?",
    "service_tier": "priority"
  }'
```

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5",
  input: "What does 'fit check for my napalm era' mean?",
  service_tier: "priority"
});

console.log(response);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="What does 'fit check for my napalm era' mean?",
    service_tier="priority"
)
print(response)
```

:::

:::

要在项目级别启用，请导航到设置页面，选择项目下的 General 选项卡，然后将项目服务层级更改为 Priority。在项目上配置后，未指定 `service_tier` 的请求将默认使用优先处理。请注意，该项目的请求将随时间逐步过渡到优先处理。

[Responses](https://platform.openai.com/docs/api-reference/responses/object#responses/object-service_tier) 或 [Completions](https://platform.openai.com/docs/api-reference/chat/object#chat/object-service_tier) 响应对象中的 `service_tier` 字段将包含用于处理该请求的服务层级。

## 速率限制和流量增长速率

**基线限制**

优先处理的消耗在速率限制计算中与标准处理相同。请使用常规的重试和退避逻辑。对于给定模型，速率限制在标准处理和优先处理之间共享。

**流量增长速率限制**

如果您的流量增长过快，部分优先处理请求可能会被降级为标准处理，并按标准费率计费。如果超出流量增长速率限制，响应将显示 service\_tier="default"。目前，如果您发送至少 100 万 TPM 且在 15 分钟内 TPM 增长超过 50%，则可能触发流量增长速率限制。

为避免触发流量增长速率限制，我们建议：

*   切换模型或快照时逐步增加流量
*   使用功能开关在数小时内逐步迁移流量，而非瞬间切换
*   避免在优先处理上运行大型 ETL 或批处理任务

## 使用注意事项

*   每 token 的费用按标准价格的溢价计费——详见[定价](/pricing)了解更多信息。
*   缓存折扣仍适用于优先处理请求。
*   优先处理同样适用于多模态/图像输入请求。
*   使用优先处理的请求可以在仪表板中通过"按服务层级分组"选项查看。
*   请参阅[定价页面](/pricing)了解当前支持优先处理的模型。
*   长上下文、微调模型和嵌入模型尚不支持。
