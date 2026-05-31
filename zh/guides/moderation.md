
使用 [moderations]( https://developers.openai.com/api/reference/moderations) 端点来检查文本或图像是否可能包含有害内容。如果识别到有害内容，您可以采取纠正措施，例如过滤内容或对创建违规内容的用户账户进行干预。审核端点免费使用。图像文件大小限制为 20 MB。

您可以为此端点使用两个模型：

*   `omni-moderation-latest`：此模型及其所有快照支持更多分类选项和多模态输入。
*   `text-moderation-latest` **（旧版）**：较旧的模型，仅支持文本输入和较少的输入分类。较新的 omni-moderation 模型将是新应用的最佳选择。

## 快速开始

使用下方的标签页查看如何审核文本输入或图像输入，使用我们的[官方 SDK](/libraries) 和 [omni-moderation-latest 模型](/models#moderation)：

审核文本输入审核图像和文本

审核文本输入

**获取文本输入的分类信息**

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.moderations.create(
model="omni-moderation-latest",
input="...text to classify goes here...",
)

print(response)
```

```node
import OpenAI from "openai";
const openai = new OpenAI();

const moderation = await openai.moderations.create({
model: "omni-moderation-latest",
input: "...text to classify goes here...",
});

console.log(moderation);
```

```curl
curl https://api.openai.com/v1/moderations \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "omni-moderation-latest",
"input": "...text to classify goes here..."
}'
```

:::


审核图像和文本

**获取图像和文本输入的分类信息**

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.moderations.create(
model="omni-moderation-latest",
input=[
{"type": "text", "text": "...text to classify goes here..."},
{
"type": "image_url",
"image_url": {
"url": "https://example.com/image.png",

# can also use base64 encoded image URLs

# "url": "data:image/jpeg;base64,abcdefg..."

}
},
],
)

print(response)
```

```node
import OpenAI from "openai";
const openai = new OpenAI();

const moderation = await openai.moderations.create({
model: "omni-moderation-latest",
input: [
{ type: "text", text: "...text to classify goes here..." },
{
type: "image_url",
image_url: {
url: "https://example.com/image.png"
// can also use base64 encoded image URLs
// url: "data:image/jpeg;base64,abcdefg..."
}
}
],
});

console.log(moderation);
```

```curl
curl https://api.openai.com/v1/moderations \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "omni-moderation-latest",
"input": [
{ "type": "text", "text": "...text to classify goes here..." },
{
"type": "image_url",
"image_url": {
"url": "https://example.com/image.png"
}
}
]
}'
```

:::



以下是一个完整的输出示例，其中输入是一部战争电影的单帧图像。模型正确预测了图像中的暴力指标，`violence` 类别分数大于 0.8。

```
{
  "id": "modr-970d409ef3bef3b70c73d8232df86e7d",
  "model": "omni-moderation-latest",
  "results": [
    {
      "flagged": true,
      "categories": {
        "sexual": false,
        "sexual/minors": false,
        "harassment": false,
        "harassment/threatening": false,
        "hate": false,
        "hate/threatening": false,
        "illicit": false,
        "illicit/violent": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "violence": true,
        "violence/graphic": false
      },
      "category_scores": {
        "sexual": 2.34135824776394e-7,
        "sexual/minors": 1.6346470245419304e-7,
        "harassment": 0.0011643905680426018,
        "harassment/threatening": 0.0022121340080906377,
        "hate": 3.1999824407395835e-7,
        "hate/threatening": 2.4923252458203563e-7,
        "illicit": 0.0005227032493135171,
        "illicit/violent": 3.682979260160596e-7,
        "self-harm": 0.0011175734280627694,
        "self-harm/intent": 0.0006264858507989037,
        "self-harm/instructions": 7.368592981140821e-8,
        "violence": 0.8599265510337075,
        "violence/graphic": 0.37701736389561064
      },
      "category_applied_input_types": {
        "sexual": ["image"],
        "sexual/minors": [],
        "harassment": [],
        "harassment/threatening": [],
        "hate": [],
        "hate/threatening": [],
        "illicit": [],
        "illicit/violent": [],
        "self-harm": ["image"],
        "self-harm/intent": ["image"],
        "self-harm/instructions": ["image"],
        "violence": ["image"],
        "violence/graphic": ["image"]
      }
    }
  ]
}
```

输出在 JSON 响应中包含多个类别，告诉您输入中存在哪些（如果有的话）内容类别，以及模型认为它们存在的程度。

| 输出类别 | 描述 |
| --- | --- |
| `flagged` | 如果模型将内容分类为潜在有害，则设置为 `true`，否则为 `false`。 |
| `categories` | 包含每个类别违规标志的字典。对于每个类别，如果模型将相应类别标记为违规，则值为 `true`，否则为 `false`。 |
| `category_scores` | 包含模型输出的每个类别分数的字典，表示模型对输入违反 OpenAI 该类别政策的置信度。值在 0 到 1 之间，值越高表示置信度越高。 |
| `category_applied_input_types` | 此属性包含响应中每个类别被标记的输入类型信息。例如，如果图像和文本输入都被标记为"violence/graphic"，则 `violence/graphic` 属性将设置为 `["image", "text"]`。此功能仅在 omni 模型上可用。 |

我们计划持续升级审核端点的底层模型。因此，依赖 `category_scores` 的自定义策略可能需要随时间重新校准。

## 内容分类

下表描述了审核 API 中可以检测的内容类型，以及每个类别支持的模型和输入类型。

标记为"仅文本"的类别不支持图像输入。如果您仅向 `omni-moderation-latest` 模型发送图像（不附带文本），对于这些不支持的类别，它将返回 0 分。图像文件大小限制为 20 MB。

| **类别** | **描述** | **模型** | **输入** |
| --- | --- | --- | --- |
| `harassment` | 表达、煽动或促进对任何目标进行骚扰性语言的内容。 | 全部 | 仅文本 |
| `harassment/threatening` | 同时包含对任何目标的暴力或严重伤害的骚扰内容。 | 全部 | 仅文本 |
| `hate` | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓表达、煽动或促进仇恨的内容。针对非受保护群体（例如棋手）的仇恨内容属于骚扰。 | 全部 | 仅文本 |
| `hate/threatening` | 同时包含基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓对目标群体的暴力或严重伤害的仇恨内容。 | 全部 | 仅文本 |
| `illicit` | 提供如何实施非法行为的建议或指导的内容。例如"如何入店行窃"这样的短语属于此类别。 | 仅 Omni | 仅文本 |
| `illicit/violent` | 与 `illicit` 类别标记的相同类型内容，但还包括对暴力或获取武器的引用。 | 仅 Omni | 仅文本 |
| `self-harm` | 促进、鼓励或描述自我伤害行为的内容，例如自杀、自残和饮食障碍。 | 全部 | 文本和图像 |
| `self-harm/intent` | 说话者表达正在进行或打算进行自我伤害行为的内容，例如自杀、自残和饮食障碍。 | 全部 | 文本和图像 |
| `self-harm/instructions` | 鼓励进行自我伤害行为（例如自杀、自残和饮食障碍）或提供如何实施此类行为的指导或建议的内容。 | 全部 | 文本和图像 |
| `sexual` | 旨在引起性兴奋的内容，例如对性活动的描述，或推广性服务的内容（不包括性教育和健康）。 | 全部 | 文本和图像 |
| `sexual/minors` | 包含 18 岁以下个人的性内容。 | 全部 | 仅文本 |
| `violence` | 描述死亡、暴力或身体伤害的内容。 | 全部 | 文本和图像 |
| `violence/graphic` | 以图形细节描述死亡、暴力或身体伤害的内容。 | 全部 | 文本和图像 |
