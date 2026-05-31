
图像生成工具允许你使用文本提示词生成图像，并可选择性地提供图像输入。它使用 GPT Image 模型，包括 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`，并自动优化文本输入以提升性能。

要了解更多关于图像生成的信息，请参阅我们专门的[图像生成指南](/guides/image-generation?api=responses)。

## 用法

当你在请求中包含 `image_generation` 工具时，模型可以决定何时以及如何在对话中生成图像，使用你的提示词和任何提供的图像输入。

`image_generation_call` 工具调用结果将包含一个 base64 编码的图像。

**生成图像**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("otter.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

# Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]
    
if image_data:
    image_base64 = image_data[0]
    with open("otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

:::




你可以使用文件 ID 或 base64 数据[提供输入图像](/guides/image-generation?image-generation-model=gpt-image#edit-images)。

要强制触发图像生成工具调用，你可以将参数 `tool_choice` 设置为 `{"type": "image_generation"}`。

### 工具选项

你可以为[图像生成工具]( https://developers.openai.com/api/reference/responses/create#responses-create-tools)配置以下输出选项作为参数：

*   Size：图像尺寸，例如 1024 × 1024 或 1024 × 1536
*   Quality：渲染质量，例如 low、medium 或 high
*   Format：文件输出格式
*   Compression：JPEG 和 WebP 格式的压缩级别（0-100%）
*   Background：透明或不透明
*   Action：请求应自动选择、生成还是编辑图像

`size`、`quality` 和 `background` 支持 `auto` 选项，模型将根据提示词自动选择最佳选项。

`gpt-image-2` 支持满足其[分辨率约束](/guides/image-generation#size-and-quality-options)的灵活 `size` 值。它目前不支持透明背景，因此带有 `background: "transparent"` 的请求会失败。

有关可用选项的更多详细信息，请参阅[图像生成指南](/guides/image-generation#customize-image-output)。

当使用 Responses API 图像生成工具时，支持的 GPT Image 模型可以选择是生成新图像还是编辑对话中已有的图像。可选的 `action` 参数控制此行为：将 `action` 保持为 `auto` 以让模型选择是生成还是编辑，或将其设置为 `generate` 或 `edit` 来强制该行为。如果未指定，默认值为 `auto`。

### 修订后的提示词

使用图像生成工具时，主线模型（例如 `gpt-5.5`）将自动修订你的提示词以提升性能。

你可以在图像生成调用的 `revised_prompt` 字段中访问修订后的提示词：

```
{
  "id": "ig_123",
  "type": "image_generation_call",
  "status": "completed",
  "revised_prompt": "A gray tabby cat hugging an otter. The otter is wearing an orange scarf. Both animals are cute and friendly, depicted in a warm, heartwarming style.",
  "result": "..."
}
```

### 提示词技巧

当你在提示词中使用 `draw` 或 `edit` 等术语时，图像生成效果最佳。

例如，如果你想合并图像，与其说 `combine` 或 `merge`，不如说类似"编辑第一张图像，将第二张图像中的这个元素添加进去"。

## 多轮编辑

你可以通过引用之前的响应或图像 ID 来迭代编辑图像。这允许你在对话轮次之间优化图像。

使用之前的响应 ID使用图像 ID

使用之前的响应 ID

**多轮图像生成**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5.5",
  previous_response_id: response.id,
  input: "Now make it look realistic",
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))


# Follow up

response_fwup = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input="Now make it look realistic",
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

:::


使用图像 ID

**多轮图像生成 (Responses API)**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageGenerationCalls = response.output.filter(
  (output) => output.type === "image_generation_call"
);

const imageData = imageGenerationCalls.map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [{ type: "input_text", text: "Now make it look realistic" }],
    },
    {
      type: "image_generation_call",
      id: imageGenerationCalls[0].id,
    },
  ],
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
import openai
import base64

response = openai.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_generation_calls = [
    output
    for output in response.output
    if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))


# Follow up

response_fwup = openai.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [{"type": "input_text", "text": "Now make it look realistic"}],
        },
        {
            "type": "image_generation_call",
            "id": image_generation_calls[0].id,
        },
    ],
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

:::


## 流式传输

图像生成工具支持在生成最终结果时流式传输部分图像。这为用户提供了更快的视觉反馈并改善了感知延迟。

你可以使用 `partial_images` 参数设置部分图像的数量（1-3）。

**流式传输图像**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const prompt =
  "Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape";
const stream = await openai.images.generate({
  prompt: prompt,
  model: "gpt-image-2",
  stream: true,
  partial_images: 2,
});

for await (const event of stream) {
  if (event.type === "image_generation.partial_image") {
    const idx = event.partial_image_index;
    const imageBase64 = event.b64_json;
    const imageBuffer = Buffer.from(imageBase64, "base64");
    fs.writeFileSync(`river${idx}.png`, imageBuffer);
  }
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

stream = client.images.generate(
    prompt="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    model="gpt-image-2",
    stream=True,
    partial_images=2,
)

for event in stream:
    if event.type == "image_generation.partial_image":
        idx = event.partial_image_index
        image_base64 = event.b64_json
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```

:::


## 支持的模型

以下模型支持图像生成工具：

*   `gpt-5.5`
*   `gpt-5.4-mini`
*   `gpt-5.4-nano`
*   `gpt-5.2`
*   `gpt-5`
*   `gpt-5-nano`
*   `o3`
*   `gpt-4.1`
*   `gpt-4.1-mini`
*   `gpt-4.1-nano`
*   `gpt-4o`
*   `gpt-4o-mini`

用于图像生成过程的模型始终是 GPT Image 模型，包括 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`，但这些模型不是 Responses API 中 `model` 字段的有效值。请使用具有文本能力的主线模型（例如 `gpt-5.5` 或 `gpt-5`）配合托管的 `image_generation` 工具。
