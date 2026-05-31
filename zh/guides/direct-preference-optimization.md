# Direct preference optimization

> 使用 DPO 微调基于人类偏好优化模型输出。

[Direct Preference Optimization](https://arxiv.org/abs/2305.18290)（DPO）微调允许你基于提示和成对的响应来微调模型。这种方法使模型能够从更主观的人类偏好中学习，优化生成更可能被偏好的输出。DPO 目前仅支持文本输入和输出。

  

| 工作原理 | 最适合 | 适用模型 |
| --- | --- | --- |
| 为一个提示同时提供正确和错误的示例响应。标明正确的响应以帮助模型表现更好。 | 
*   总结文本，关注正确的要点
*   生成具有正确语气和风格的聊天消息

 | `gpt-4.1-2025-04-14` `gpt-4.1-mini-2025-04-14` `gpt-4.1-nano-2025-04-14` |

## 数据格式

数据集中的每个示例应包含：

*   一个提示，如用户消息。
*   一个偏好输出（理想的助手响应）。
*   一个非偏好输出（次优的助手响应）。

数据应以 JSONL 格式组织，每行[代表一个示例]( https://developers.openai.com/api/reference/fine-tuning/preference-input)，结构如下：

```
{
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Hello, can you tell me how cold San Francisco is today?"
      }
    ],
    "tools": [],
    "parallel_tool_calls": true
  },
  "preferred_output": [
    {
      "role": "assistant",
      "content": "Today in San Francisco, it is not quite cold as expected. Morning clouds will give away to sunshine, with a high near 68°F (20°C) and a low around 57°F (14°C)."
    }
  ],
  "non_preferred_output": [
    {
      "role": "assistant",
      "content": "It is not particularly cold in San Francisco today."
    }
  ]
}
```

目前，我们仅对每个示例中的单轮对话进行训练，其中偏好和非偏好消息需要是最后一条助手消息。

## 创建 DPO 微调任务

上传训练数据和使用 DPO 微调模型遵循[此处描述的相同流程](/guides/model-optimization)。

要创建 DPO 微调任务，请在[微调任务创建端点]( https://developers.openai.com/api/reference/fine-tuning/create)中使用 `method` 字段，你可以在其中指定 `type` 以及任何相关的 `hyperparameters`。对于 DPO：

*   将 `type` 参数设置为 `dpo`
*   可选地设置 `hyperparameters` 属性，配置你想要的选项。

`beta` 超参数是仅适用于 DPO 的新选项。它是一个介于 `0` 和 `2` 之间的浮点数，控制新模型将多严格地遵循其先前行为，还是与提供的偏好对齐。较高的值会更保守（倾向于先前行为），较低的值会更激进（更频繁地倾向于新提供的偏好）。

你也可以将此值设置为 `auto`（默认值），以使用平台配置的值。

下面的示例展示了如何使用 OpenAI SDK 配置 DPO 微调任务。

**创建 DPO 微调任务**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const job = await openai.fineTuning.jobs.create({
  training_file: "file-all-about-the-weather",
  model: "gpt-4o-2024-08-06",
  method: {
    type: "dpo",
    dpo: {
      hyperparameters: { beta: 0.1 },
    },
  },
});
```

```python
from openai import OpenAI

client = OpenAI()

job = client.fine_tuning.jobs.create(
    training_file="file-all-about-the-weather",
    model="gpt-4o-2024-08-06",
    method={
        "type": "dpo",
        "dpo": {
            "hyperparameters": {"beta": 0.1},
        },
    },
)
```

:::


## 结合使用 SFT 和 DPO

目前，OpenAI 提供[监督微调（SFT）](/guides/supervised-fine-tuning)作为微调任务的默认方法。在运行 DPO 任务之前，先对你的偏好响应（或其子集）执行 SFT，可以显著增强模型的对齐性和性能。通过首先在期望的响应上微调模型，它可以更好地识别正确的模式，为 DPO 优化行为提供坚实的基础。

推荐的工作流程如下：

1.  使用偏好响应的子集对基础模型进行 SFT 微调。重点确保数据质量和任务的代表性。
2.  以 SFT 微调后的模型作为起点，应用 DPO 根据偏好比较来调整模型。

## 安全检查

在生产环境中启动之前，请查看并遵循以下安全信息。

我们如何评估安全性

微调任务完成后，我们会在 13 个不同的安全类别中评估生成模型的行为。每个类别代表一个关键领域，如果不加以适当控制，AI 输出可能会在该领域造成潜在危害。

| 名称 | 描述 |
| --- | --- |
| advice | 违反我们政策的建议或指导。 |
| harassment/threatening | 包含对任何目标的暴力或严重伤害的骚扰内容。 |
| hate | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓表达、煽动或宣扬仇恨的内容。针对非受保护群体（如棋手）的仇恨内容属于骚扰。 |
| hate/threatening | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓，同时包含对目标群体的暴力或严重伤害的仇恨内容。 |
| highly-sensitive | 违反我们政策的高度敏感数据。 |
| illicit | 提供如何实施非法行为的建议或指导的内容。例如"如何入店行窃"这样的短语属于此类别。 |
| propaganda | 对违反我们政策的意识形态的赞扬或协助。 |
| self-harm/instructions | 鼓励实施自我伤害行为（如自杀、自残和饮食障碍）的内容，或提供如何实施此类行为的指导或建议。 |
| self-harm/intent | 说话者表达正在进行或打算进行自我伤害行为（如自杀、自残和饮食障碍）的内容。 |
| sensitive | 违反我们政策的敏感数据。 |
| sexual/minors | 包含 18 岁以下个人的性内容。 |
| sexual | 旨在引起性兴奋的内容，如对性行为的描述，或宣传性服务的内容（不包括性教育和健康）。 |
| violence | 描绘死亡、暴力或身体伤害的内容。 |

每个类别都有预定义的通过阈值；如果给定类别中有太多评估示例未通过，OpenAI 将阻止微调模型的部署。如果你的微调模型未通过安全检查，OpenAI 会在微调任务中发送消息，说明哪些类别未达到要求的阈值。你可以在微调任务的审核检查部分查看结果。

如何通过安全检查

除了查看微调任务对象中任何未通过的安全检查外，你还可以通过查询[微调 API 事件端点](https://platform.openai.com/docs/api-reference/fine-tuning/list-events)获取哪些类别未通过的详细信息。查找类型为 `moderation_checks` 的事件，以获取类别结果和执行情况的详细信息。这些信息可以帮助你缩小需要重新训练和改进的类别范围。[模型规范](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview)包含规则和示例，可以帮助识别需要额外训练数据的领域。

虽然这些评估涵盖了广泛的安全类别，但请对微调模型进行你自己的评估，以确保它适合你的用例。

## 后续步骤

现在你已经了解了 DPO 的基础知识，也可以探索以下其他方法。

[监督微调 - 通过为示例输入提供正确输出来微调模型。](/guides/supervised-fine-tuning)

[视觉微调 - 学习使用图像输入进行计算机视觉微调。](/guides/vision-fine-tuning)

[强化微调 - 通过对推理模型的输出进行评分来微调。](/guides/reinforcement-fine-tuning)
