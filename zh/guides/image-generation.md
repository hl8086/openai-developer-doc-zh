
探索

[![](https://cdn.openai.com/API/docs/images/images-gallery-2/sci-fi-hangar.png)](/guides/image-generation?gallery=open&galleryItem=sci-fi-hangar)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/mechanical-bouquet.png)](/guides/image-generation?gallery=open&galleryItem=mechanical-bouquet)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/mechanical-watch.png)](/guides/image-generation?gallery=open&galleryItem=mechanical-watch)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/botanical-perfume-output.png)](/guides/image-generation?gallery=open&galleryItem=botanical-perfume)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/lavender-sunrise.png)](/guides/image-generation?gallery=open&galleryItem=lavender-sunrise)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/moon-control-room-1969.png)](/guides/image-generation?gallery=open&galleryItem=moon-control-room-1969)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/mountain-map.png)](/guides/image-generation?gallery=open&galleryItem=mountain-map)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/shipyard-welding-documentary.png)](/guides/image-generation?gallery=open&galleryItem=shipyard-welding-documentary)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/coral-reef.png)](/guides/image-generation?gallery=open&galleryItem=coral-reef)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/smart-home-dashboard.png)](/guides/image-generation?gallery=open&galleryItem=smart-home-dashboard)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/abstract-orbit.png)](/guides/image-generation?gallery=open&galleryItem=abstract-orbit)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/airport-departure-kiosk-ui.png)](/guides/image-generation?gallery=open&galleryItem=airport-departure-kiosk)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/icons-poster.png)](/guides/image-generation?gallery=open&galleryItem=icons)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/3d-city.png)](/guides/image-generation?gallery=open&galleryItem=3d-city)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/ink-wash-temple.png)](/guides/image-generation?gallery=open&galleryItem=ink-wash-temple)[![](https://cdn.openai.com/API/docs/images/images-gallery-2/cliffside-portrait.png)](/guides/image-generation?gallery=open&galleryItem=cliffside-portrait)[](/guides/image-generation?gallery=open&galleryItem=chameleon-macro)[](/guides/image-generation?gallery=open&galleryItem=clay-garden)[](/guides/image-generation?gallery=open&galleryItem=paper-cut-forest)[](/guides/image-generation?gallery=open&galleryItem=alien-rock)[](/guides/image-generation?gallery=open&galleryItem=clay-figurine)[](/guides/image-generation?gallery=open&galleryItem=furniture)[](/guides/image-generation?gallery=open&galleryItem=desert-sunrise-portrait)[](/guides/image-generation?gallery=open&galleryItem=ceramic-mug)[](/guides/image-generation?gallery=open&galleryItem=hiking-poster)[](/guides/image-generation?gallery=open&galleryItem=floorplan)[](/guides/image-generation?gallery=open&galleryItem=mountain-bike)[](/guides/image-generation?gallery=open&galleryItem=kitchen-service-rush)[](/guides/image-generation?gallery=open&galleryItem=interior-design)[](/guides/image-generation?gallery=open&galleryItem=ecommerce-product-page)[](/guides/image-generation?gallery=open&galleryItem=paper-sculpture-city)[](/guides/image-generation?gallery=open&galleryItem=colorize)[](/guides/image-generation?gallery=open&galleryItem=game-design)[](/guides/image-generation?gallery=open&galleryItem=sprites)[](/guides/image-generation?gallery=open&galleryItem=cosmic-ballet)[](/guides/image-generation?gallery=open&galleryItem=chocolate)[](/guides/image-generation?gallery=open&galleryItem=winter-wolf-portrait)[](/guides/image-generation?gallery=open&galleryItem=street-cafe)[](/guides/image-generation?gallery=open&galleryItem=watercolor-harbor-map)[](/guides/image-generation?gallery=open&galleryItem=buildings-sprite)[](/guides/image-generation?gallery=open&galleryItem=rooftop-garden)[](/guides/image-generation?gallery=open&galleryItem=thunderstorm)[](/guides/image-generation?gallery=open&galleryItem=roman-forum-rain)[](/guides/image-generation?gallery=open&galleryItem=spacecraft-dashboard)[](/guides/image-generation?gallery=open&galleryItem=daytime)[](/guides/image-generation?gallery=open&galleryItem=camera-manual)[](/guides/image-generation?gallery=open&galleryItem=weeknight-cookbook-layout)[](/guides/image-generation?gallery=open&galleryItem=isometric-icons)[](/guides/image-generation?gallery=open&galleryItem=patterns)[](/guides/image-generation?gallery=open&galleryItem=landscape)[](/guides/image-generation?gallery=open&galleryItem=city-heat-infographic)[](/guides/image-generation?gallery=open&galleryItem=robot-toy)[](/guides/image-generation?gallery=open&galleryItem=bottle)[](/guides/image-generation?gallery=open&galleryItem=school-science-fair-iphone)[](/guides/image-generation?gallery=open&galleryItem=whales-poster)[](/guides/image-generation?gallery=open&galleryItem=neon)[](/guides/image-generation?gallery=open&galleryItem=album-cover)[](/guides/image-generation?gallery=open&galleryItem=sneakers)[](/guides/image-generation?gallery=open&galleryItem=paris-cafe-iphone)[](/guides/image-generation?gallery=open&galleryItem=kyoto-poster)

## 概述

OpenAI API 允许你使用 GPT Image 模型（包括我们最新的 `gpt-image-2`）从文本提示生成和编辑图像。你可以通过两个 API 访问图像生成功能：

### Image API

从 `gpt-image-1` 及更新的模型开始，[Image API]( https://developers.openai.com/api/reference/images) 提供两个端点，各具不同功能：

*   **生成**：基于文本提示从零开始[生成图像](#generate-images)
*   **编辑**：使用新提示[修改现有图像](#edit-images)，可以是部分修改或完全修改

Image API 还包含一个变体端点，适用于支持该功能的模型，如 DALL·E 2。

### Responses API

[Responses API]( https://developers.openai.com/api/reference/responses/create#responses-create-tools) 允许你在对话或多步骤流程中生成图像。它支持将图像生成作为[内置工具](/guides/tools?api-mode=responses)使用，并在上下文中接受图像输入和输出。

与 Image API 相比，它增加了：

*   **多轮编辑**：通过提示迭代地对图像进行高保真编辑
*   **灵活输入**：接受图像 [File]( https://developers.openai.com/api/reference/files) ID 作为输入图像，而不仅仅是字节数据

Responses API 图像生成工具使用其自身的 GPT Image 模型选择。有关支持调用此工具的主线模型的详细信息，请参阅下方的[支持的模型](#supported-models)。

### 选择合适的 API

*   如果你只需要从一个提示生成或编辑单张图像，Image API 是最佳选择。
*   如果你想使用 GPT Image 构建对话式、可编辑的图像体验，请选择 Responses API。

两个 API 都允许你通过调整质量、尺寸、格式和压缩来[自定义输出](#customize-image-output)。透明背景取决于模型支持情况。

本指南重点介绍 GPT Image。

为确保这些模型被负责任地使用，你可能需要在使用 GPT Image 模型（包括 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）之前，从你的[开发者控制台](https://platform.openai.com/settings/organization/general)完成 [API 组织验证](https://help.openai.com/en/articles/10910291-api-organization-verification)。

![木桌上的米色咖啡杯](https://cdn.openai.com/API/docs/images/mug.png)

## 生成图像

你可以使用[图像生成端点]( https://developers.openai.com/api/reference/images/create)基于文本提示创建图像，或使用 Responses API 中的[图像生成工具](/guides/tools?api-mode=responses)在对话中生成图像。

要了解更多关于自定义输出（尺寸、质量、格式、压缩）的信息，请参阅下方的[自定义图像输出](#customize-image-output)部分。

你可以设置 `n` 参数在单个请求中一次生成多张图像（默认情况下，API 返回单张图像）。

Responses APIImage API

Responses API

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


Image API

**生成图像**

```javascript
import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();

const prompt = `
A children's book drawing of a veterinarian using a stethoscope to 
listen to the heartbeat of a baby otter.
`;

const result = await openai.images.generate({
    model: "gpt-image-2",
    prompt,
});

// Save the image to a file
const image_base64 = result.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("otter.png", image_bytes);
```

```python
from openai import OpenAI
import base64
client = OpenAI()

prompt = """
A children's book drawing of a veterinarian using a stethoscope to 
listen to the heartbeat of a baby otter.
"""

result = client.images.generate(
    model="gpt-image-2",
    prompt=prompt
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("otter.png", "wb") as f:
    f.write(image_bytes)
```

```curl
curl -X POST "https://api.openai.com/v1/images/generations" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-image-2",
        "prompt": "A childrens book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter."
    }' | jq -r '.data[0].b64_json' | base64 --decode > otter.png
```

```cli
openai images generate \
  --model gpt-image-2 \
  --prompt "A childrens book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter." \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > otter.png
```

### 多轮图像生成

使用 Responses API，你可以通过在上下文中提供图像生成调用输出（也可以只使用图像 ID），或使用 [`previous_response_id` 参数](/guides/conversation-state?api-mode=responses#openai-apis-for-conversation-state)来构建涉及图像生成的多轮对话。这让你可以跨多个轮次迭代图像——优化提示、应用新指令，并随着对话进展演变视觉输出。

使用 Responses API 图像生成工具时，支持的工具模型可以选择是生成新图像还是编辑对话中已有的图像。可选的 `action` 参数控制此行为：保持 `action: "auto"` 让模型自行决定，设置 `action: "generate"` 始终创建新图像，或设置 `action: "edit"` 在上下文中有图像时强制编辑。

**使用 action 强制创建图像**

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation", action: "generate"}],
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
    tools=[{"type": "image_generation", "action": "generate"}],
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


如果你在上下文中没有提供图像时强制使用 `edit`，调用将返回错误。将 `action` 保持为 `auto` 让模型自行决定何时生成或编辑。

使用 previous response ID使用 image ID

使用 previous response ID

**多轮图像生成**

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


使用 image ID

**多轮图像生成**

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

#### 结果

<table style="width:100%"><tbody><tr><td style="vertical-align:top;padding:0 16px 16px 0">"Generate an image of gray tabby cat hugging an otter with an orange scarf"</td><td style="text-align:right;vertical-align:top;padding-bottom:16px"><img src="https://cdn.openai.com/API/docs/images/cat_and_otter.png" alt="一只猫和一只水獭" style="width:200px;border-radius:8px"></td></tr><tr><td style="vertical-align:top;padding:0 16px 0 0">"Now make it look realistic"</td><td style="text-align:right;vertical-align:top"><img src="https://cdn.openai.com/API/docs/images/cat_and_otter_realistic.png" alt="一只猫和一只水獭" style="width:200px;border-radius:8px"></td></tr></tbody></table>

### 流式传输

Responses API 和 Image API 支持流式图像生成。你可以在 API 生成图像时接收部分图像，提供更具交互性的体验。

你可以调整 `partial_images` 参数来接收 0-3 张部分图像。

*   如果你将 `partial_images` 设置为 0，你将只收到最终图像。
*   对于大于零的值，如果完整图像生成得更快，你可能不会收到你请求的全部数量的部分图像。

Responses APIImage API

Responses API

**流式传输图像**

```javascript
import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();

const stream = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
  stream: true,
  tools: [{ type: "image_generation", partial_images: 2 }],
});

for await (const event of stream) {
  if (event.type === "response.image_generation_call.partial_image") {
    const idx = event.partial_image_index;
    const imageBase64 = event.partial_image_b64;
    const imageBuffer = Buffer.from(imageBase64, "base64");
    fs.writeFileSync(`river${idx}.png`, imageBuffer);
  }
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

stream = client.responses.create(
    model="gpt-5.5",
    input="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],
)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```



Image API

**流式传输图像**

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


#### 结果

| 部分图像 1 | 部分图像 2 | 最终图像 |
| --- | --- | --- |
| ![第 1 张部分图像](https://cdn.openai.com/API/docs/images/imgen1p5-streaming1.png) | ![第 2 张部分图像](https://cdn.openai.com/API/docs/images/imgen1p5-streaming2.png) | ![第 3 张部分图像](https://cdn.openai.com/API/docs/images/imgen1p5-streaming3.png) |

提示词：Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape

### 修订后的提示词

在 Responses API 中使用图像生成工具时，主线模型（例如 `gpt-5.5`）会自动修订你的提示词以提高性能。

你可以在图像生成调用的 `revised_prompt` 字段中访问修订后的提示词：

**修订后的提示词响应**

```json
{
  "id": "ig_123",
  "type": "image_generation_call",
  "status": "completed",
  "revised_prompt": "A gray tabby cat hugging an otter. The otter is wearing an orange scarf. Both animals are cute and friendly, depicted in a warm, heartwarming style.",
  "result": "..."
}
```

## 编辑图像

[图像编辑]( https://developers.openai.com/api/reference/images/createEdit)端点允许你：

*   编辑现有图像
*   使用其他图像作为参考生成新图像
*   通过上传图像和标识要替换区域的蒙版来编辑图像的部分区域

### 使用图像参考创建新图像

你可以使用一张或多张图像作为参考来生成新图像。

在此示例中，我们将使用 4 张输入图像来生成一张包含参考图像中物品的礼品篮新图像。

[![身体乳](https://cdn.openai.com/API/docs/images/body-lotion.png)](https://cdn.openai.com/API/docs/images/body-lotion.png)[![香皂](https://cdn.openai.com/API/docs/images/soap.png)](https://cdn.openai.com/API/docs/images/soap.png)[![香薰套装](https://cdn.openai.com/API/docs/images/incense-kit.png)](https://cdn.openai.com/API/docs/images/incense-kit.png)[![沐浴球](https://cdn.openai.com/API/docs/images/bath-bomb.png)](https://cdn.openai.com/API/docs/images/bath-bomb.png)

![沐浴礼品套装](https://cdn.openai.com/API/docs/images/bath-set-result.png)

Responses APIImage API

Responses API

使用 Responses API，你可以通过 3 种不同方式提供输入图像：

*   提供完整的 URL
*   以 Base64 编码的 data URL 提供图像
*   提供文件 ID（通过 [Files API]( https://developers.openai.com/api/reference/files) 创建）

#### 创建文件

**创建文件**

```python
from openai import OpenAI
client = OpenAI()

def create_file(file_path):
  with open(file_path, "rb") as file_content:
    result = client.files.create(
        file=file_content,
        purpose="vision",
    )
    return result.id
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function createFile(filePath) {
  const fileContent = fs.createReadStream(filePath);
  const result = await openai.files.create({
    file: fileContent,
    purpose: "vision",
  });
  return result.id;
}
```


#### 创建 base64 编码图像

**创建 base64 编码图像**

::: code-group
```python
def encode_image(file_path):
    with open(file_path, "rb") as f:
        base64_image = base64.b64encode(f.read()).decode("utf-8")
    return base64_image
```

```javascript
function encodeImage(filePath) {
  const base64Image = fs.readFileSync(filePath, "base64");
  return base64Image;
}
```


**编辑图像**

```python
from openai import OpenAI
import base64

client = OpenAI()

prompt = """Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures."""

base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": prompt},
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image1}",
                },
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image2}",
                },
                {
                    "type": "input_image",
                    "file_id": file_id1,
                },
                {
                    "type": "input_image",
                    "file_id": file_id2,
                }
            ],
        }
    ],
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
    with open("gift-basket.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
else:
    print(response.output.content)
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.`;

const base64Image1 = encodeImage("body-lotion.png");
const base64Image2 = encodeImage("soap.png");
const fileId1 = await createFile("body-lotion.png");
const fileId2 = await createFile("incense-kit.png");


const response = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: prompt },
        {
          type: "input_image",
          image_url: `data:image/jpeg;base64,${base64Image1}`,
        },
        {
          type: "input_image",
          image_url: `data:image/jpeg;base64,${base64Image2}`,
        },
        {
          type: "input_image",
          file_id: fileId1,
        },
        {
          type: "input_image",
          file_id: fileId2,
        },
      ],
    },
  ],
  tools: [{type: "image_generation"}],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("gift-basket.png", Buffer.from(imageBase64, "base64"));
} else {
  console.log(response.output.content);
}
```


Image API

**编辑图像**

```python
import base64
from openai import OpenAI
client = OpenAI()

prompt = """
Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.
"""

result = client.images.edit(
    model="gpt-image-2",
    image=[
        open("body-lotion.png", "rb"),
        open("bath-bomb.png", "rb"),
        open("incense-kit.png", "rb"),
        open("soap.png", "rb"),
    ],
    prompt=prompt
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("gift-basket.png", "wb") as f:
    f.write(image_bytes)
```

```javascript
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

const prompt = `
Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.
`;

const imageFiles = [
    "bath-bomb.png",
    "body-lotion.png",
    "incense-kit.png",
    "soap.png",
];

const images = await Promise.all(
    imageFiles.map(async (file) =>
        await toFile(fs.createReadStream(file), null, {
            type: "image/png",
        })
    ),
);

const response = await client.images.edit({
    model: "gpt-image-2",
    image: images,
    prompt,
});

// Save the image to a file
const image_base64 = response.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("basket.png", image_bytes);
```

```curl
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > gift-basket.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "image[]=@body-lotion.png" \
  -F "image[]=@bath-bomb.png" \
  -F "image[]=@incense-kit.png" \
  -F "image[]=@soap.png" \
  -F 'prompt=Generate a photorealistic image of a gift basket on a white background labeled "Relax & Unwind" with a ribbon and handwriting-like font, containing all the items in the reference pictures'
```

```cli
openai images edit \
  --model gpt-image-2 \
  --image body-lotion.png \
  --image bath-bomb.png \
  --image incense-kit.png \
  --image soap.png \
  --prompt 'Generate a photorealistic image of a gift basket on a white background labeled "Relax & Unwind" with a ribbon and handwriting-like font, containing all the items in the reference pictures' \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > gift-basket.png
```

### 使用蒙版编辑图像

你可以提供蒙版来指示图像的哪个部分应该被编辑。

在 GPT Image 中使用蒙版时，会向模型发送额外的指令以帮助相应地引导编辑过程。

GPT Image 的蒙版完全基于提示词。模型使用蒙版作为引导，但可能不会完全精确地遵循其确切形状。

如果你提供多张输入图像，蒙版将应用于第一张图像。

Responses APIImage API

Responses API

**使用蒙版编辑图像**

```python
from openai import OpenAI
client = OpenAI()

fileId = create_file("sunlit_lounge.png")
maskId = create_file("mask.png")

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "generate an image of the same sunlit indoor lounge area with a pool but the pool should contain a flamingo",
                },
                {
                    "type": "input_image",
                    "file_id": fileId,
                }
            ],
        },
    ],
    tools=[
        {
            "type": "image_generation",
            "quality": "high",
            "input_image_mask": {
                "file_id": maskId,
            }
        },
    ],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]
    with open("lounge.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const fileId = await createFile("sunlit_lounge.png");
const maskId = await createFile("mask.png");

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "generate an image of the same sunlit indoor lounge area with a pool but the pool should contain a flamingo",
        },
        {
          type: "input_image",
          file_id: fileId,
        }
      ],
    },
  ],
  tools: [
    {
      type: "image_generation",
      quality: "high",
      input_image_mask: {
        file_id: maskId,
      }
    },
  ],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("lounge.png", Buffer.from(imageBase64, "base64"));
}
```


Image API

**使用蒙版编辑图像**

```python
from openai import OpenAI
client = OpenAI()

result = client.images.edit(
    model="gpt-image-2",
    image=open("sunlit_lounge.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A sunlit indoor lounge area with a pool containing a flamingo"
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("composition.png", "wb") as f:
    f.write(image_bytes)
```

```javascript
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

const rsp = await client.images.edit({
    model: "gpt-image-2",
    image: await toFile(fs.createReadStream("sunlit_lounge.png"), null, {
        type: "image/png",
    }),
    mask: await toFile(fs.createReadStream("mask.png"), null, {
        type: "image/png",
    }),
    prompt: "A sunlit indoor lounge area with a pool containing a flamingo",
});

// Save the image to a file
const image_base64 = rsp.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("lounge.png", image_bytes);
```

```curl
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > lounge.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "mask=@mask.png" \
  -F "image[]=@sunlit_lounge.png" \
  -F 'prompt=A sunlit indoor lounge area with a pool containing a flamingo'
```

```cli
openai images edit \
  --model gpt-image-2 \
  --image sunlit_lounge.png \
  --mask mask.png \
  --prompt "A sunlit indoor lounge area with a pool containing a flamingo" \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > out.png
```

:::

| 图像 | 蒙版 | 输出 |
| --- | --- | --- |
| ![一个有泳池的粉色房间](https://cdn.openai.com/API/docs/images/sunlit_lounge.png) | ![泳池部分区域的蒙版](https://cdn.openai.com/API/docs/images/mask.png) | ![原始泳池中充气火烈鸟替换了蒙版区域](https://cdn.openai.com/API/docs/images/sunlit_lounge_result.png) |

提示词：a sunlit indoor lounge area with a pool containing a flamingo

#### 蒙版要求

要编辑的图像和蒙版必须具有相同的格式和尺寸（大小小于 50MB）。

蒙版图像还必须包含 alpha 通道。如果你使用图像编辑工具创建蒙版，请确保保存带有 alpha 通道的蒙版。

你可以通过编程方式修改黑白图像以添加 alpha 通道。

**为黑白蒙版添加 alpha 通道**

```python
from PIL import Image
from io import BytesIO

# 1. Load your black & white mask as a grayscale image
mask = Image.open(img_path_mask).convert("L")

# 2. Convert it to RGBA so it has space for an alpha channel
mask_rgba = mask.convert("RGBA")

# 3. Then use the mask itself to fill that alpha channel
mask_rgba.putalpha(mask)

# 4. Convert the mask into bytes
buf = BytesIO()
mask_rgba.save(buf, format="PNG")
mask_bytes = buf.getvalue()

# 5. Save the resulting file
img_path_mask_alpha = "mask_alpha.png"
with open(img_path_mask_alpha, "wb") as f:
    f.write(mask_bytes)
```

### 图像输入保真度

`input_fidelity` 参数控制模型在编辑和参考图像工作流中保留输入图像细节的强度。对于 `gpt-image-2`，请省略此参数；API 不允许更改它，因为该模型会自动以高保真度处理每个图像输入。

由于 `gpt-image-2` 始终以高保真度处理图像输入，包含参考图像的编辑请求的图像输入 token 可能会更高。要了解成本影响，请参阅[视觉成本](/guides/images-vision?api-mode=responses#calculating-costs)部分。

## 自定义图像输出

你可以配置以下输出选项：

*   **尺寸**：图像尺寸（例如 `1024x1024`、`1024x1536`）
*   **质量**：渲染质量（例如 `low`、`medium`、`high`）
*   **格式**：文件输出格式
*   **压缩**：JPEG 和 WebP 格式的压缩级别（0-100%）
*   **背景**：不透明或自动

`size`、`quality` 和 `background` 支持 `auto` 选项，模型将根据提示自动选择最佳选项。

`gpt-image-2` 目前不支持透明背景。该模型不支持 `background: "transparent"` 的请求。

### 尺寸和质量选项

`gpt-image-2` 在 `size` 参数中接受满足以下约束的任何分辨率。正方形图像通常生成最快。

<table><tbody><tr><td>常用尺寸</td><td><ul><li><code>1024x1024</code>（正方形）</li><li><code>1536x1024</code>（横向）</li><li><code>1024x1536</code>（纵向）</li><li><code>2048x2048</code>（2K 正方形）</li><li><code>2048x1152</code>（2K 横向）</li><li><code>3840x2160</code>（4K 横向）</li><li><code>2160x3840</code>（4K 纵向）</li><li><code>auto</code>（默认）</li></ul></td></tr><tr><td>尺寸约束</td><td><ul><li>最大边长必须小于或等于 <code>3840px</code></li><li>两边都必须是 <code>16px</code> 的倍数</li><li>长边与短边的比例不得超过 <code>3:1</code></li><li>总像素数必须至少为 <code>655,360</code> 且不超过 <code>8,294,400</code></li></ul></td></tr><tr><td>质量选项</td><td><ul><li><code>low</code></li><li><code>medium</code></li><li><code>high</code></li><li><code>auto</code>（默认）</li></ul></td></tr></tbody></table>

使用 `quality: "low"` 进行快速草稿、缩略图和快速迭代。这是最快的选项，在你转向 `medium` 或 `high` 制作最终资源之前，适用于许多常见用例。

超过 `2560x1440`（`3,686,400`）总像素的输出（通常称为 2K）被视为实验性功能。

### 输出格式

Image API 返回 base64 编码的图像数据。默认格式为 `png`，但你也可以请求 `jpeg` 或 `webp`。

如果使用 `jpeg` 或 `webp`，你还可以指定 `output_compression` 参数来控制压缩级别（0-100%）。例如，`output_compression=50` 将图像压缩 50%。

使用 `jpeg` 比 `png` 更快，因此如果延迟是一个问题，你应该优先使用此格式。

## 限制

GPT Image 模型（`gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）是功能强大且用途广泛的图像生成模型，但仍有一些需要注意的限制：

*   **延迟：** 复杂提示可能需要长达 2 分钟来处理。
*   **文本渲染：** 虽然有了显著改进，但模型在精确的文本放置和清晰度方面仍可能存在困难。
*   **一致性：** 虽然能够生成一致的图像，但模型在多次生成中可能偶尔难以保持重复角色或品牌元素的视觉一致性。
*   **构图控制：** 尽管指令遵循能力有所改进，但模型在结构化或对布局敏感的构图中可能难以精确放置元素。

### 内容审核

所有提示和生成的图像都按照我们的[内容政策](https://openai.com/policies/usage-policies/)进行过滤。

对于使用 GPT Image 模型（`gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）的图像生成，你可以使用 `moderation` 参数控制审核严格程度。此参数支持两个值：

*   `auto`（默认）：标准过滤，旨在限制创建某些类别的潜在不适合年龄的内容。
*   `low`：较少限制的过滤。

### 支持的模型

在 Responses API 中使用图像生成时，`gpt-5` 及更新的模型应支持图像生成工具。[查看你的模型的模型详情页面](/models)以确认你所需的模型是否可以使用图像生成工具。

## 成本和延迟

### `gpt-image-2` 输出 token

对于 `gpt-image-2`，使用计算器根据请求的 `quality` 和 `size` 估算输出 token：

Quality

LowMediumHigh

WidthHeight

Output tokens

196

### `gpt-image-2` 之前的模型

`gpt-image-2` 之前的 GPT Image 模型通过首先生成专门的图像 token 来生成图像。延迟和最终成本都与渲染图像所需的 token 数量成正比——更大的图像尺寸和更高的质量设置会产生更多 token。

生成的 token 数量取决于图像尺寸和质量：

| 质量 | 正方形 (1024×1024) | 纵向 (1024×1536) | 横向 (1536×1024) |
| --- | --- | --- | --- |
| Low | 272 tokens | 408 tokens | 400 tokens |
| Medium | 1056 tokens | 1584 tokens | 1568 tokens |
| High | 4160 tokens | 6240 tokens | 6208 tokens |

请注意，你还需要考虑[输入 token](/guides/images-vision?api-mode=responses#calculating-costs)：提示的文本 token 以及编辑图像时输入图像的图像 token。由于 `gpt-image-2` 始终以高保真度处理图像输入，包含参考图像的编辑请求可能会使用更多输入 token。

请参阅[定价页面](/pricing#image-generation)了解当前文本和图像 token 价格，并使用下方的[计算成本](#calculating-costs)部分来估算请求成本。

最终成本是以下各项的总和：

*   输入文本 token
*   使用编辑端点时的输入图像 token
*   图像输出 token

### 计算成本

使用下方的定价计算器来估算 GPT Image 模型的请求成本。`gpt-image-2` 支持数千种有效分辨率；下表列出了与之前 GPT Image 模型相同的尺寸以供比较。对于 GPT Image 1.5、GPT Image 1 和 GPT Image 1 Mini，下方还列出了旧版按图像计费的输出定价表。在估算请求总成本时，你仍应考虑文本和图像输入 token。

较大的非正方形分辨率有时可以在相同质量设置下产生比较小或正方形分辨率更少的输出 token。

| 模型 | 质量 | 1024 x 1024 | 1024 x 1536 | 1536 x 1024 |
| --- | --- | --- | --- | --- |
| GPT Image 2  
更多尺寸可用 | Low | $0.006 | $0.005 | $0.005 |
| Medium | $0.053 | $0.041 | $0.041 |
| High | $0.211 | $0.165 | $0.165 |
| GPT Image 1.5 | Low | $0.009 | $0.013 | $0.013 |
| Medium | $0.034 | $0.05 | $0.05 |
| High | $0.133 | $0.2 | $0.2 |
| GPT Image 1 | Low | $0.011 | $0.016 | $0.016 |
| Medium | $0.042 | $0.063 | $0.063 |
| High | $0.167 | $0.25 | $0.25 |
| GPT Image 1 Mini | Low | $0.005 | $0.006 | $0.006 |
| Medium | $0.011 | $0.015 | $0.015 |
| High | $0.036 | $0.052 | $0.052 |

### 部分图像成本

如果你想使用 `partial_images` 参数[流式传输图像生成](#streaming)，每张部分图像将额外产生 100 个图像输出 token。
