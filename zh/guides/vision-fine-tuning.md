# Vision fine-tuning

> Fine-tune models for better image understanding.

视觉微调使用图像输入进行[监督微调](/guides/supervised-fine-tuning)，以提升模型对图像输入的理解能力。本指南将带您了解 SFT 的这一子集，并概述使用图像输入进行微调时的一些重要注意事项。

OpenAI 正在逐步关闭微调平台。新用户已无法访问该平台，但现有微调平台用户在未来几个月内仍可创建训练任务。

  

所有微调模型在其基础模型被[弃用](/deprecations)之前将继续可用于推理。完整时间线请参见[此处](/deprecations)。

  

| 工作原理 | 最适合 | 配合使用 |
| --- | --- | --- |
| 提供图像输入进行监督微调，以提升模型对图像输入的理解能力。 | 
*   图像分类
*   修正复杂提示中指令遵循的失败情况

 | `gpt-4o-2024-08-06` |

## 数据格式

正如您可以[发送一张或多张图像输入并基于它们创建模型响应](/guides/vision)一样，您可以在 JSONL 训练数据文件中包含相同的消息类型。图像可以通过 HTTP URL 或包含 Base64 编码图像的 data URL 提供。

以下是 JSONL 文件中一行图像消息的示例。下面的 JSON 对象为了可读性进行了展开，但通常此 JSON 会在数据文件中显示为单行：

```
{
  "messages": [
    {
      "role": "system",
      "content": "You are an assistant that identifies and describes artworks."
    },
    {
      "role": "user",
      "content": "Describe this artwork."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": "This appears to be a traditional painted artwork with a central human subject."
    }
  ]
}
```

上传视觉微调的训练数据遵循[此处描述的相同流程](/guides/supervised-fine-tuning)。

## 图像数据要求

#### 大小

*   您的训练文件最多可包含 50,000 个包含图像的示例（不包括纯文本示例）。
*   每个示例最多可包含 10 张图像。
*   每张图像最大为 10 MB。

#### 格式

*   图像必须为 JPEG、PNG 或 WEBP 格式。
*   图像必须为 RGB 或 RGBA 色彩模式。
*   您不能将图像作为 `assistant` 角色消息的输出。

#### 内容审核政策

我们会在训练前扫描您的图像，以确保它们符合我们的使用政策。这可能会在微调开始前的文件验证阶段引入延迟。

包含以下内容的图像将从您的数据集中排除，不会用于训练：

*   人物
*   面部
*   儿童
*   验证码（CAPTCHAs）

#### 图像被跳过时该怎么办

您的图像在训练期间可能因以下原因被跳过：

*   **包含验证码**、**包含人物**、**包含面部**、**包含儿童**
    *   请移除该图像。目前，我们无法使用包含这些实体的图像进行模型微调。
*   **URL 无法访问**
    *   请确保图像 URL 可公开访问。
*   **图像过大**
    *   请确保您的图像符合我们的[数据集大小限制](#size)。
*   **图像格式无效**
    *   请确保您的图像符合我们的[数据集格式要求](#format)。

## 最佳实践

#### 降低训练成本

如果您将图像的 `detail` 参数设置为 `low`，图像将被调整为 512 x 512 像素，并且无论其大小如何，仅由 85 个 token 表示。这将降低训练成本。[更多信息请参见此处。](/guides/vision#low-or-high-fidelity-image-understanding)

```
{
  "type": "image_url",
  "image_url": {
    "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
    "detail": "low"
  }
}
```

#### 控制图像质量

要控制图像理解的保真度，请为每张图像将 `image_url` 的 `detail` 参数设置为 `low`、`high` 或 `auto`。这也会影响模型在训练期间看到的每张图像的 token 数量，并影响训练成本。[更多信息请参见此处](/guides/vision#low-or-high-fidelity-image-understanding)。

## 安全检查

在生产环境上线之前，请查看并遵循以下安全信息。

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
| self-harm/instructions | 鼓励实施自我伤害行为（如自杀、自残和饮食障碍）的内容，或提供如何实施此类行为的指导或建议的内容。 |
| self-harm/intent | 说话者表达正在或打算进行自我伤害行为（如自杀、自残和饮食障碍）的内容。 |
| sensitive | 违反我们政策的敏感数据。 |
| sexual/minors | 包含 18 岁以下个人的性内容。 |
| sexual | 旨在引起性兴奋的内容，如对性行为的描述，或宣传性服务的内容（不包括性教育和健康）。 |
| violence | 描绘死亡、暴力或身体伤害的内容。 |

每个类别都有预定义的通过阈值；如果给定类别中有过多评估示例未通过，OpenAI 将阻止微调模型的部署。如果您的微调模型未通过安全检查，OpenAI 会在微调任务中发送消息，说明哪些类别未达到所需阈值。您可以在微调任务的审核检查部分查看结果。

如何通过安全检查

除了查看微调任务对象中任何未通过的安全检查外，您还可以通过查询[微调 API 事件端点](https://platform.openai.com/docs/api-reference/fine-tuning/list-events)获取有关哪些类别未通过的详细信息。查找类型为 `moderation_checks` 的事件以获取类别结果和执行详情。此信息可帮助您缩小需要重新训练和改进的目标类别范围。[模型规范](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview)包含可帮助识别需要额外训练数据的领域的规则和示例。

虽然这些评估涵盖了广泛的安全类别，但请对微调模型进行您自己的评估，以确保它适合您的用例。

## 后续步骤

现在您已了解视觉微调的基础知识，也请探索以下其他方法。

[监督微调 - 通过为样本输入提供正确输出来微调模型。](/guides/supervised-fine-tuning)

[直接偏好优化 - 使用直接偏好优化（DPO）微调模型。](/guides/direct-preference-optimization)

[强化微调 - 通过对推理模型的输出进行评分来微调模型。](/guides/reinforcement-fine-tuning)
